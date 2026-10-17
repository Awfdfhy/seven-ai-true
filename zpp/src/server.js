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
const { createAuth } = require('./auth');

const MAX_BODY_BYTES = 1024 * 1024;

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

function createApp(store, auth) {
  if (!auth) throw new TypeError('createApp requires an auth instance');

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

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return sendJson(res, 200, { ...(await store.health()), auth: auth.mode });
      }

      // Everything below /health requires a verified caller.
      req.zpp = await auth.authenticate(req);

      if (!route) {
        return sendJson(res, 404, { error: 'not-found', path: url.pathname });
      }

      // ---- key management ---------------------------------------------
      if (route.id === '__keys' && !route.action) {
        if (req.method === 'GET') {
          return sendJson(res, 200, { keys: await auth.listKeys(req.zpp.ownerId) });
        }
        if (req.method === 'POST') {
          const body = await readBody(req);
          const minted = await auth.registerKey({ ownerId: req.zpp.ownerId, label: body.label });
          // The plaintext is returned exactly once and is never stored.
          return sendJson(res, 201, {
            key: minted.plaintext,
            ownerId: minted.ownerId,
            warning: 'store this now — it is hashed on write and cannot be recovered'
          });
        }
        return sendJson(res, 405, { error: 'method-not-allowed' });
      }

      // ---- collections -------------------------------------------------
      if (!route.id) {
        if (req.method === 'GET') {
          // Scoped to the caller. `?owner=` is deliberately not honoured: a
          // client must not be able to ask for somebody else's streams.
          return sendJson(res, 200, {
            streams: await store.listStreams({ ownerId: req.zpp.ownerId })
          });
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
          }, { Location: `/v1/streams/${encodeURIComponent(created.id)}`, ETag: `"${created.revision}"` });
        }
        return sendJson(res, 405, { error: 'method-not-allowed' });
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
          return sendJson(res, 200, body, { ETag: stream.etag });
        }
        return sendJson(res, 405, { error: 'method-not-allowed' });
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
          }, { ETag: stream.etag });
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
            return sendJson(res, 400, { error: 'invalid-version', ifMatch: req.headers['if-match'] });
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
            }, { ETag: etag });
          }

          if (result.status === store.STATUS.CONFLICT) {
            // 409 carries the current revision so the client can re-read and retry.
            return sendJson(res, 409, {
              ok: false,
              status: result.status,
              reason: result.reason,
              expectedVersion: result.expectedVersion,
              revision: result.revision
            }, { ETag: etag });
          }

          if (result.status === store.STATUS.NOT_FOUND) {
            return sendJson(res, 404, { ok: false, status: result.status, reason: result.reason });
          }

          // BLOCKED: the engine refused the event. Nothing was written.
          return sendJson(res, 422, {
            ok: false,
            status: result.status,
            reason: result.reason,
            details: result.details,
            revision: result.revision
          });
        }
        return sendJson(res, 405, { error: 'method-not-allowed' });
      }

      if (route.action === 'rejections' && req.method === 'GET') {
        await owned(req, res, route.id); // 404s if unknown OR not yours
        return sendJson(res, 200, {
          rejections: await store.rejections(route.id, { limit: url.searchParams.get('limit') })
        });
      }

      if (route.action === 'rebuild' && req.method === 'POST') {
        await owned(req, res, route.id);
        return sendJson(res, 200, await store.rebuild(route.id));
      }

      if (route.action === 'verify' && req.method === 'GET') {
        await owned(req, res, route.id);
        const stream = await store.readStream(route.id, { verify: true });
        return sendJson(res, 200, { ok: true, id: stream.id, revision: stream.revision }, { ETag: stream.etag });
      }

      return sendJson(res, 404, { error: 'not-found', path: url.pathname });
    } catch (err) {
      const status = err && err.status ? err.status : 500;
      if (status >= 500) {
        // Never leak a stack trace to a client; log it instead.
        console.error('[zpp] unhandled error:', err);
      }
      return sendJson(res, status, {
        error: (err && err.message) || 'internal-error',
        details: (err && err.details) || undefined
      });
    }
  };
}

async function start({
  port = Number(process.env.PORT || 8787),
  dbConfig = configFromEnv(),
  authMode = process.env.ZPP_AUTH === 'dev' ? 'dev' : 'required'
} = {}) {
  const db = await openDb(dbConfig);
  const store = createStore(db);
  const auth = createAuth(db, { mode: authMode });
  const server = http.createServer(createApp(store, auth));

  await new Promise((resolve) => server.listen(port, resolve));
  const health = await store.health();
  const banner = `[zpp] listening on http://localhost:${port} (driver=${health.driver}, engine=${health.engineSchema} v${health.engineVersion}, auth=${auth.mode})`;
  console.log(banner);
  if (auth.mode === 'dev') {
    console.warn('[zpp] WARNING: auth=dev accepts the X-Dev-Owner header. Any client can claim any owner. Dev only.');
  }
  return { server, store, auth, db, port };
}

if (require.main === module) {
  start().catch((err) => {
    console.error('[zpp] failed to start:', err);
    process.exit(1);
  });
}

module.exports = { createApp, start };