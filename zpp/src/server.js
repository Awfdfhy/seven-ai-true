'use strict';
/**
 * ZPP HTTP API.
 *
 * Deliberately built on node:http with zero framework dependencies: this repo
 * ships to an Android WebView and its release job is already dependency-heavy,
 * and the whole surface is seven routes.
 *
 * Concurrency is expressed in HTTP terms on purpose:
 *   GET  /v1/streams/:id          -> 200 + ETag: "<revision>"
 *   POST /v1/streams/:id/events   -> If-Match: "<revision>"  (or body.expectedVersion)
 *   stale write                   -> 409 + current revision, so the client can retry
 */

const http = require('node:http');

const { openDb, configFromEnv } = require('./db');
const { createStore, parseVersion } = require('./store');
const { createAuth, keyTtlFromEnv, bootstrapTokenFromEnv } = require('./auth');
const { createCors } = require('./cors');
const { createRateLimiter, clientKey, rateLimitHeaders, limiterConfigFromEnv } = require('./ratelimit');
const { createConsole } = require('./console');

const MAX_BODY_BYTES = 1024 * 1024;
/**
 * Ceiling on a client-requested key lifetime: 1 year.
 *
 * A client asking for a longer TTL than the server policy allows is either
 * confused or hostile; either way the answer is "clamped", not "granted".
 * There is no legitimate reason for a bearer key to outlive a year without an
 * explicit rotation.
 */
const MAX_KEY_TTL_MS = 365 * 24 * 60 * 60 * 1000;

function sendJson(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(body);
}

/**
 * Preflight answers carry no body. 204 + Content-Length: 0 keeps curl and
 * `fetch` from waiting on a socket that never gets one.
 */
function sendEmpty(res, status, headers = {}) {
  res.writeHead(status, { 'Content-Length': 0, 'Cache-Control': 'no-store', ...headers });
  res.end();
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const err = new Error('request body too large');
      err.status = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const err = new Error('body must be valid JSON');
    err.status = 400;
    throw err;
  }
}

/** /v1/streams/:id/... -> {id, action} */
function parsePath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'v1' || parts[1] !== 'streams') return null;
  const id = parts[2] ? decodeURIComponent(parts[2]) : null;
  const action = parts[3] || null;
  if (parts.length > 4) return null;
  return { id, action };
}

/**
 * @param {object} [limits]
 * @param {object|null} [limits.ip]      pre-auth limiter, or null to disable
 * @param {object|null} [limits.owner]   post-auth limiter, or null to disable
 * @param {boolean} [limits.trustProxy]  honour x-forwarded-for for the ip key
 * @param {object} [cors]                cors policy; omitted means closed
 * @param {object} [console]             static console; pass null to disable
 */
function createApp(store, auth, { limits, cors, console: consoleOpts } = {}) {
  if (!auth) throw new TypeError('createApp requires an auth instance');

  const ipLimiter = limits ? limits.ip : undefined;
  const ownerLimiter = limits ? limits.owner : undefined;
  const trustProxy = Boolean(limits && limits.trustProxy);
  const corsPolicy = cors || createCors();
  // `console: null` disables the mount entirely; omitted means enabled.
  const consolePolicy = consoleOpts === null ? null : createConsole(consoleOpts || {});

  // Per-response CORS headers. `{}` when the origin is not allowed, which is
  // what "closed by default" means: the browser simply cannot read the reply.
  function corsHeaders(req) {
    return corsPolicy.headersFor(req.headers.origin);
  }

  /**
   * Load a stream and assert the caller owns it.
   *
   * Cross-tenant access answers 404, never 403. A 403 would confirm that the
   * stream id exists to someone who does not own it, which turns the id space
   * into an enumeration oracle.
   */
  async function owned(req, res, id) {
    const caller = req.zpp;
    const stream = await store.readStream(id);
    if (stream.ownerId !== caller.ownerId) {
      const err = new Error('not found');
      err.status = 404;
      throw err;
    }
    return stream;
  }

  return async function handler(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const route = parsePath(url.pathname);
    const cors = corsHeaders(req);

    // Answer preflight before anything else, including rate limiting: a
    // preflight carries no credentials, so charging it against a tenant's
    // bucket would let any site exhaust somebody else's quota.
    const pre = corsPolicy.preflight(req, req.headers.origin);
    if (pre) {
      if (!pre.body) return sendEmpty(res, pre.status, { ...pre.headers, ...cors });
      return sendJson(res, pre.status, pre.body, cors);
    }

    // Static console, served before authentication and before throttling.
    // It has to be public (the connect gate needs it) and unthrottled (a page
    // load is not tenant traffic, and rate-limiting it would break the connect
    // flow the limiter exists to protect). It is three small static files.
    if (consolePolicy && (req.method === 'GET' || req.method === 'HEAD')) {
      const asset = consolePolicy.handle(req, url.pathname);
      if (asset) {
        if (req.method === 'HEAD') {
          return sendEmpty(res, asset.status, asset.headers);
        }
        res.writeHead(asset.status, asset.headers);
        return res.end(asset.body);
      }
    }

    // Pre-auth throttle: bounds key-guessing before a caller is identified.
    if (ipLimiter) {
      const decision = ipLimiter.take(clientKey(req, { trustProxy }));
      if (!decision.ok) {
        return sendJson(res, 429, { error: 'rate-limited', scope: 'ip' }, {
          ...cors,
          ...rateLimitHeaders(decision)
        });
      }
      req.zppIpLimit = decision;
    }

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return sendJson(res, 200, {
          ...(await store.health()),
          auth: auth.mode,
          keyTtlMs: auth.keyTtlMs,
          cors: corsPolicy.anyOriginAllowed ? '*' : corsPolicy.allowedOrigins,
          rateLimit: {
            ip: ipLimiter ? { capacity: ipLimiter.capacity, refillPerSec: ipLimiter.refillPerSec } : null,
            owner: ownerLimiter ? { capacity: ownerLimiter.capacity, refillPerSec: ownerLimiter.refillPerSec } : null,
            scope: 'in-process per node; N nodes means N x the limit'
          }
        }, cors);
      }

      // Everything below /health requires a verified caller, OR the operator's
      // bootstrap token (which is the only way to create the very first key).
      req.zpp = await auth.authenticateOrBootstrap(req);

      // Post-auth throttle: fair sharing between tenants. Charged after
      // verification so the bucket is keyed by the real owner.
      if (ownerLimiter) {
        const decision = ownerLimiter.take(`owner:${req.zpp.ownerId}`);
        if (!decision.ok) {
          return sendJson(res, 429, { error: 'rate-limited', scope: 'owner' }, {
            ...cors,
            ...rateLimitHeaders(decision)
          });
        }
      }

      if (!route) {
        return sendJson(res, 404, { error: 'not-found', path: url.pathname }, cors);
      }

      // ---- key management ---------------------------------------------
      if (route.id === '__keys' && !route.action) {
        if (req.method === 'GET') {
          const keys = await auth.listKeys(req.zpp.ownerId);
          // POST /__keys answers with `keyHash`; these rows come straight out of
          // SQL and are snake_case. Without the alias a client has to know both
          // spellings to feed a key hash back into the rotate body. `key_hash`
          // stays authoritative so the existing CLI and tests keep working.
          return sendJson(res, 200, {
            keys: keys.map((k) => ({ ...k, keyHash: k.key_hash }))
          }, cors);
        }
        if (req.method === 'POST') {
          const body = await readBody(req);

          // Two different authorisations for one route:
          //   - mode 'key'    -> mint for MYSELF. owner comes from the token.
          //   - mode 'boot'   -> mint for the owner NAMED IN THE BODY, and only
          //                      when the operator configured a bootstrap token
          //                      or is running in dev mode. This is the ONLY
          //                      place owner_id comes from a request, and it is
          //                      why the bootstrap token exists: without it an
          //                      open mint endpoint would let anyone claim any
          //                      tenant and read its streams.
          let ownerId;
          if (req.zpp.mode === 'key') {
            ownerId = req.zpp.ownerId;
          } else if (req.zpp.mode === 'boot') {
            ownerId = String(body.ownerId || '').trim();
            if (!ownerId) {
              return sendJson(res, 400, { error: 'ownerId is required when bootstrapping' }, cors);
            }
          } else {
            // dev mode with no identity: still require an explicit owner so a
            // dev console never silently creates keys for the 'dev' tenant.
            ownerId = String(body.ownerId || '').trim();
            if (!ownerId) {
              return sendJson(res, 400, { error: 'ownerId is required in dev mode' }, cors);
            }
          }

          // ttlMs comes from the body only when it is a positive finite number;
          // anything else falls back to the server policy, so a client cannot
          // ask for a 10-year key by sending `ttlMs: 1e15`.
          const requestedTtl = Number(body.ttlMs);
          const ttlMs = Number.isFinite(requestedTtl) && requestedTtl > 0
            ? Math.min(requestedTtl, MAX_KEY_TTL_MS)
            : auth.keyTtlMs;
          const minted = await auth.registerKey({ ownerId, label: body.label, ttlMs });
          // The plaintext is returned exactly once and is never stored.
          return sendJson(res, 201, {
            key: minted.plaintext,
            ownerId: minted.ownerId,
            keyHash: minted.keyHash,
            createdAt: minted.createdAt,
            expiresAt: minted.expiresAt,
            warning: 'store this now — it is hashed on write and cannot be recovered'
          }, cors);
        }
        return sendJson(res, 405, { error: 'method-not-allowed' }, { ...cors, Allow: 'GET, POST' });
      }

      if (route.id === '__keys' && route.action === 'rotate' && req.method === 'POST') {
        const body = await readBody(req);
        // Only the caller's own keys can be rotated: the hash is resolved
        // against this owner, never accepted as proof of tenancy.
        const rotated = await auth.rotateKeyScoped({
          ownerId: req.zpp.ownerId,
          keyHash: body.keyHash,
          label: body.label,
          ttlMs: body.ttlMs
        });
        return sendJson(res, 201, {
          key: rotated.plaintext,
          ownerId: rotated.ownerId,
          keyHash: rotated.keyHash,
          createdAt: rotated.createdAt,
          expiresAt: rotated.expiresAt,
          rotatedFrom: rotated.rotatedFrom,
          warning: 'store this now — the previous key is already revoked'
        }, cors);
      }

      // ---- collections -------------------------------------------------
      if (!route.id) {
        if (req.method === 'GET') {
          // Scoped to the caller. `?owner=` is deliberately not honoured: a
          // client must not be able to ask for somebody else's streams.
          return sendJson(res, 200, {
            streams: await store.listStreams({ ownerId: req.zpp.ownerId })
          }, cors);
        }
        if (req.method === 'POST') {
          const body = await readBody(req);
          const created = await store.createStream({
            id: body.id,
            ownerId: req.zpp.ownerId, // from the token, never from the body
            seed: body.seed || {}
          });
          return sendJson(res, 201, {
            id: created.id,
            revision: created.revision,
            etag: `"${created.revision}"`
          }, { ...cors, Location: `/v1/streams/${encodeURIComponent(created.id)}`, ETag: `"${created.revision}"` });
        }
        return sendJson(res, 405, { error: 'method-not-allowed' }, { ...cors, Allow: 'GET, POST' });
      }

      // ---- single stream -----------------------------------------------
      if (!route.action) {
        if (req.method === 'GET') {
          const stream = await owned(req, res, route.id);
          const body = { ...stream };
          if (url.searchParams.get('verify') === '1') {
            const verified = await store.readStream(route.id, { verify: true });
            body.verified = true;
            body.revision = verified.revision;
          }
          return sendJson(res, 200, body, { ...cors, ETag: stream.etag });
        }
        return sendJson(res, 405, { error: 'method-not-allowed' }, { ...cors, Allow: 'GET' });
      }

      if (route.action === 'events') {
        if (req.method === 'GET') {
          const stream = await owned(req, res, route.id);
          return sendJson(res, 200, {
            revision: stream.revision,
            events: await store.history(route.id, {
              from: url.searchParams.get('from'),
              limit: url.searchParams.get('limit')
            })
          }, { ...cors, ETag: stream.etag });
        }

        if (req.method === 'POST') {
          await owned(req, res, route.id);
          const body = await readBody(req);
          const event = body.event || body;
          // If-Match wins over the body field so curl/HTTP clients behave
          // exactly like browser clients.
          const expectedVersion =
            req.headers['if-match'] !== undefined
              ? parseVersion(req.headers['if-match'])
              : (body.expectedVersion === undefined ? null : Number(body.expectedVersion));

          if (expectedVersion !== null && !Number.isInteger(expectedVersion)) {
            return sendJson(res, 400, { error: 'invalid-version', ifMatch: req.headers['if-match'] }, cors);
          }

          const result = await store.append(route.id, event, { expectedVersion });
          const etag = result.revision === null || result.revision === undefined
            ? undefined
            : `"${result.revision}"`;

          if (result.status === store.STATUS.OK) {
            return sendJson(res, 200, {
              ok: true,
              status: result.status,
              revision: result.revision,
              state: result.state
            }, { ...cors, ETag: etag });
          }

          if (result.status === store.STATUS.CONFLICT) {
            // 409 carries the current revision so the client can re-read and retry.
            return sendJson(res, 409, {
              ok: false,
              status: result.status,
              reason: result.reason,
              expectedVersion: result.expectedVersion,
              revision: result.revision
            }, { ...cors, ETag: etag });
          }

          if (result.status === store.STATUS.NOT_FOUND) {
            return sendJson(res, 404, { ok: false, status: result.status, reason: result.reason }, cors);
          }

          // BLOCKED: the engine refused the event. Nothing was written.
          return sendJson(res, 422, {
            ok: false,
            status: result.status,
            reason: result.reason,
            details: result.details,
            revision: result.revision
          }, cors);
        }
        return sendJson(res, 405, { error: 'method-not-allowed' }, { ...cors, Allow: 'GET, POST' });
      }

      if (route.action === 'rejections' && req.method === 'GET') {
        await owned(req, res, route.id); // 404s if unknown OR not yours
        return sendJson(res, 200, {
          rejections: await store.rejections(route.id, { limit: url.searchParams.get('limit') })
        }, cors);
      }

      if (route.action === 'rebuild' && req.method === 'POST') {
        await owned(req, res, route.id);
        return sendJson(res, 200, await store.rebuild(route.id), cors);
      }

      if (route.action === 'verify' && req.method === 'GET') {
        await owned(req, res, route.id);
        const stream = await store.readStream(route.id, { verify: true });
        return sendJson(res, 200, { ok: true, id: stream.id, revision: stream.revision }, { ...cors, ETag: stream.etag });
      }

      return sendJson(res, 404, { error: 'not-found', path: url.pathname }, cors);
    } catch (err) {
      const status = err && err.status ? err.status : 500;
      if (status >= 500) {
        // Never leak a stack trace to a client; log it instead.
        console.error('[zpp] unhandled error:', err);
      }
      return sendJson(res, status, {
        error: (err && err.message) || 'internal-error',
        details: (err && err.details) || undefined
      }, cors);
    }
  };
}

async function start({
  port = Number(process.env.PORT || 8787),
  dbConfig = configFromEnv(),
  authMode = process.env.ZPP_AUTH === 'dev' ? 'dev' : 'required',
  keyTtlMs = keyTtlFromEnv(),
  rateLimit = limiterConfigFromEnv(),
  corsOrigins = process.env.ZPP_CORS_ORIGINS,
  webConsole = process.env.ZPP_CONSOLE !== '0',
  bootstrapToken = bootstrapTokenFromEnv()
} = {}) {
  const db = await openDb(dbConfig);
  const store = createStore(db);
  const auth = createAuth(db, { mode: authMode, keyTtlMs, bootstrapToken });

  // An explicit `rateLimit: null` disables throttling (used by tests that make
  // hundreds of sequential requests). Anything numeric-shaped builds limiters.
  const limits = rateLimit === null
    ? { ip: null, owner: null, trustProxy: false }
    : {
      // The ip limiter is deliberately roomier than the owner limiter: one
      // NAT'd office is many tenants, so a tight per-IP ceiling would punish
      // sharing. The owner limiter is what actually bounds a single tenant.
      ip: createRateLimiter({ capacity: rateLimit.capacity * 10, refillPerSec: rateLimit.refillPerSec * 5 }),
      owner: createRateLimiter({ capacity: rateLimit.capacity, refillPerSec: rateLimit.refillPerSec }),
      trustProxy: rateLimit.trustProxy
    };

  const cors = createCors({ origins: corsOrigins });
  const server = http.createServer(createApp(store, auth, {
    limits,
    cors,
    console: webConsole ? {} : null
  }));

  // Buckets for departed clients would otherwise live forever. Ten minutes of
  // idle is far longer than any legitimate gap between requests, and the sweep
  // is O(buckets) so it runs cheaply.
  const sweeper = setInterval(() => {
    if (limits.ip) limits.ip.sweepIdle();
    if (limits.owner) limits.owner.sweepIdle();
  }, 10 * 60 * 1000);
  sweeper.unref(); // never hold the process open on its own

  await new Promise((resolve) => server.listen(port, resolve));
  const health = await store.health();
  const banner = `[zpp] listening on http://localhost:${port} (driver=${health.driver}, engine=${health.engineSchema} v${health.engineVersion}, auth=${auth.mode}, keyTtl=${auth.keyTtlMs ? `${Math.round(auth.keyTtlMs / 86400000)}d` : 'never'})`;
  console.log(banner);
  if (auth.mode === 'dev') {
    console.warn('[zpp] WARNING: auth=dev accepts the X-Dev-Owner header. Any client can claim any owner. Dev only.');
  }
  if (cors.anyOriginAllowed) {
    console.warn('[zpp] WARNING: ZPP_CORS_ORIGINS=* — any website may read this API from a browser. Narrow it to the origins you actually serve.');
  }
  if (rateLimit !== null) {
    console.log(`[zpp] rate limit: ${rateLimit.capacity}/tenant sustained ${rateLimit.refillPerSec}/s (in-process, per node)${rateLimit.trustProxy ? ' trusting x-forwarded-for' : ''}`);
  }
  if (webConsole) {
    console.log(`[zpp] console: http://localhost:${port}/console/`);
  }

  return { server, store, auth, db, port, limits, cors };
}

if (require.main === module) {
  start().catch((err) => {
    console.error('[zpp] failed to start:', err);
    process.exit(1);
  });
}

module.exports = { createApp, start };