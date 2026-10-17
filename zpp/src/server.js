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

function createApp(store) {
  return async function handler(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const route = parsePath(url.pathname);

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return sendJson(res, 200, await store.health());
      }

      if (!route) {
        return sendJson(res, 404, { error: 'not-found', path: url.pathname });
      }

      // ---- collections -------------------------------------------------
      if (!route.id) {
        if (req.method === 'GET') {
          return sendJson(res, 200, {
            streams: await store.listStreams({ ownerId: url.searchParams.get('owner') })
          });
        }
        if (req.method === 'POST') {
          const body = await readBody(req);
          const created = await store.createStream({
            id: body.id,
            ownerId: body.ownerId,
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
          const stream = await store.readStream(route.id, {
            verify: url.searchParams.get('verify') === '1'
          });
          return sendJson(res, 200, stream, { ETag: stream.etag });
        }
        return sendJson(res, 405, { error: 'method-not-allowed' });
      }

      if (route.action === 'events') {
        if (req.method === 'GET') {
          const stream = await store.readStream(route.id);
          return sendJson(res, 200, {
            revision: stream.revision,
            events: await store.history(route.id, {
              from: url.searchParams.get('from'),
              limit: url.searchParams.get('limit')
            })
          }, { ETag: stream.etag });
        }

        if (req.method === 'POST') {
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
        await store.readStream(route.id); // 404s if the stream is unknown
        return sendJson(res, 200, {
          rejections: await store.rejections(route.id, { limit: url.searchParams.get('limit') })
        });
      }

      if (route.action === 'rebuild' && req.method === 'POST') {
        return sendJson(res, 200, await store.rebuild(route.id));
      }

      if (route.action === 'verify' && req.method === 'GET') {
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

async function start({ port = Number(process.env.PORT || 8787), dbConfig = configFromEnv() } = {}) {
  const db = await openDb(dbConfig);
  const store = createStore(db);
  const server = http.createServer(createApp(store));

  await new Promise((resolve) => server.listen(port, resolve));
  const health = await store.health();
  console.log(`[zpp] listening on http://localhost:${port} (driver=${health.driver}, engine=${health.engineSchema} v${health.engineVersion})`);
  return { server, store, db, port };
}

if (require.main === module) {
  start().catch((err) => {
    console.error('[zpp] failed to start:', err);
    process.exit(1);
  });
}

module.exports = { createApp, start };