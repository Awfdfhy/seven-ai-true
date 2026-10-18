'use strict';
/**
 * The static console, served by the API process itself.
 *
 * Why mounted here rather than a separate static server: same-origin means the
 * browser never issues a cross-origin request, so the default CLOSED CORS policy
 * is correct and the console needs no allowlist entry at all. A separate server
 * would force every operator to widen CORS for a page that only ever talks to
 * its own origin.
 *
 * The file set is a FIXED MAP, not a directory walk. The request path is never
 * joined onto a filesystem root, so `../../etc/passwd`, `%2e%2e%2f`, and an
 * absolute path are all answered with the same 404 — there is no code path that
 * can escape the four names below.
 *
 * Console assets are PUBLIC: the connect gate must load before anyone has a
 * key. They contain no tenant data — every byte is static — so publishing them
 * costs nothing and buys a working error message instead of a blank page.
 */

const fs = require('node:fs');
const path = require('node:path');

const WEB_DIR = path.join(__dirname, '..', 'web');
const PREFIX = '/console';

// Fixed, hand-written map. Adding a file here is the only way to publish one.
const ASSETS = new Map([
  ['/', { file: 'index.html', type: 'text/html; charset=utf-8' }],
  ['/index.html', { file: 'index.html', type: 'text/html; charset=utf-8' }],
  ['/app.js', { file: 'app.js', type: 'text/javascript; charset=utf-8' }],
  ['/app.css', { file: 'app.css', type: 'text/css; charset=utf-8' }]
]);

const SHA = 'sha256';

function hash(buf) {
  return require('node:crypto').createHash(SHA).update(buf).digest('hex');
}

/**
 * @param {object} [opts]
 * @param {boolean} [opts.enabled]  set false to skip mounting entirely
 * @param {string}  [opts.dir]      directory holding index.html/app.js/app.css
 */
function createConsole({ enabled = true, dir = WEB_DIR } = {}) {
  const cache = new Map(); // file -> {body, etag}

  function load(asset) {
    const hit = cache.get(asset.file);
    if (hit) return hit;
    const full = path.join(dir, asset.file);
    // Defence in depth behind the fixed map: confirm the resolved path is
    // still inside dir before reading it.
    if (!full.startsWith(dir + path.sep)) throw new Error('console asset escaped its directory');
    const body = fs.readFileSync(full);
    const entry = { body, etag: `"${hash(body).slice(0, 16)}"` };
    cache.set(asset.file, entry);
    return entry;
  }

  /**
   * @returns {null | {status:number, headers:object, body:Buffer|string}}
   * null means "not a console request" — the caller should keep routing.
   */
  function handle(req, pathname) {
    if (!enabled) return null;

    // Claim only paths under the prefix. Anything else returns null so the
    // caller keeps routing it to the API — this is what stops the mount from
    // shadowing /v1/... or /health.
    if (pathname !== PREFIX && !pathname.startsWith(`${PREFIX}/`)) return null;

    // Strip the prefix, then look up the relative name in the fixed map.
    // /console and /console/ both mean the index.
    const rel = (pathname === PREFIX || pathname === `${PREFIX}/`)
      ? '/'
      : pathname.slice(PREFIX.length);

    const asset = ASSETS.get(rel);
    if (!asset) {
      return { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: 'not found' };
    }

    let entry;
    try {
      entry = load(asset);
    } catch (err) {
      return {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: `console asset missing: ${asset.file}`
      };
    }

    // Conditional GET: the console is three small files and is safe to cache
    // hard, so a revalidation round-trip is worth avoiding entirely.
    // Optional chaining because handle() is also callable directly in tests,
    // where there is no IncomingMessage guaranteeing a headers object.
    if (req.headers && req.headers['if-none-match'] === entry.etag) {
      return { status: 304, headers: { ETag: entry.etag, 'Cache-Control': 'public, max-age=600' }, body: '' };
    }

    return {
      status: 200,
      headers: {
        'Content-Type': asset.type,
        'Content-Length': entry.body.length,
        ETag: entry.etag,
        // Short cache plus ETag: a deploy changes the bytes, so the hash changes,
        // so the next load is correct. No build-time fingerprinting needed.
        'Cache-Control': 'public, max-age=600',
        'X-Content-Type-Options': 'nosniff',
        // The console ships no inline script and loads no third party, so it can
        // afford to be strict about where that script could ever come from.
        'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",
        'Referrer-Policy': 'no-referrer'
      },
      body: entry.body
    };
  }

  return { handle, ASSETS, PREFIX, dir, invalidate: () => cache.clear() };
}

module.exports = { createConsole, ASSETS, PREFIX };
