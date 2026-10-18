'use strict';
/**
 * ZPP CORS.
 *
 * Default posture is CLOSED: with no ZPP_CORS_ORIGINS configured, no
 * Access-Control-* header is emitted at all, so a browser on any other origin
 * cannot read a response. This is the correct default for an API that only
 * serves a native WebView and same-origin clients — "no CORS" and "CORS
 * configured for our own origin" are both safe, and the second is only
 * reachable by an explicit decision.
 *
 * Why an allowlist rather than reflecting the request Origin:
 *   - Reflecting `Origin: <anything>` is functionally equivalent to `*` and
 *     would hand every website a credentialed-capable read path onto the API.
 *   - `*` is supported, but it is opt-in and logged at startup, because it is
 *     a real widening of the attack surface for a browser-reachable API.
 *
 * There are no cookies: auth is a bearer token the caller presents explicitly,
 * which is why `Access-Control-Allow-Credentials` is deliberately NOT emitted.
 * Emitting it alongside `*` is invalid per the Fetch spec anyway.
 *
 * Preflight is answered from an allowlist rather than by calling the real
 * handler, because OPTIONS carries no credentials — a preflight is exactly the
 * request a browser makes before it will attach one.
 */

const ALLOWED_METHODS = ['GET', 'POST', 'OPTIONS'];
/** Request headers a client is allowed to send cross-origin. */
const ALLOWED_HEADERS = ['authorization', 'content-type', 'if-match'];
/** Response headers a browser is allowed to expose to script. */
const EXPOSED_HEADERS = ['ETag', 'Location', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'Retry-After'];
const MAX_AGE_SECONDS = 600;

function parseOrigins(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return { any: false, set: new Set() };
  const parts = String(raw).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const set = new Set(parts);
  return { any: set.has('*'), set };
}

/**
 * @param {object} [opts]
 * @param {string} [opts.origins]  comma-separated allowlist, or '*'
 */
function createCors(opts = {}) {
  const raw = opts.origins !== undefined
    ? opts.origins
    : (opts.env || process.env).ZPP_CORS_ORIGINS;
  const { any, set } = parseOrigins(raw);

  function isAllowed(origin) {
    if (any) return true;
    if (!origin) return false;
    // Normalise the trailing slash so "https://app.example/" and
    // "https://app.example" behave the same way in config and in practice.
    return set.has(String(origin).trim().replace(/\/$/, '').toLowerCase());
  }

  /**
   * Build the response headers for a request.
   * Returns {} when the origin is not allowed, which is what "closed" means.
   */
  function headersFor(origin) {
    if (!isAllowed(origin)) return {};
    const out = {
      'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
      'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
      'Access-Control-Expose-Headers': EXPOSED_HEADERS.join(', '),
      'Access-Control-Max-Age': String(MAX_AGE_SECONDS),
      // Responses already differ by Origin, so shared caches must key on it or
      // one tenant's allowlisted origin can be served another origin's headers.
      Vary: 'Origin'
    };
    out['Access-Control-Allow-Origin'] = any ? '*' : String(origin).trim().replace(/\/$/, '');
    return out;
  }

  /**
   * Answer a preflight, or return null when this is not one.
   * @returns {null | {status: number, headers: object, body: object}}
   */
  function preflight(req, origin) {
    if (req.method !== 'OPTIONS') return null;
    const headers = headersFor(origin);
    // Not allowed: 403 rather than 204, so the browser logs a real failure
    // instead of failing opaquely later.
    if (!Object.keys(headers).length) {
      return { status: 403, headers: {}, body: { error: 'cors-origin-not-allowed' } };
    }
    return { status: 204, headers, body: null };
  }

  return {
    anyOriginAllowed: any,
    allowedOrigins: [...set],
    isAllowed,
    headersFor,
    preflight,
    ALLOWED_METHODS,
    ALLOWED_HEADERS,
    EXPOSED_HEADERS
  };
}

module.exports = { createCors, parseOrigins, ALLOWED_METHODS, ALLOWED_HEADERS, EXPOSED_HEADERS };
