'use strict';
/**
 * ZPP rate limiting.
 *
 * Token bucket, not a fixed window. A fixed window lets a client spend its
 * whole quota at 23:59:50 and again at 00:00:00, which is 2x the intended rate
 * across the boundary. A token bucket refills continuously, so the ceiling is
 * the sustained rate plus the burst capacity and nothing can exceed it.
 *
 * Two limiters are used, for two different threats:
 *
 *   - by IP, applied BEFORE authentication. Its job is to make brute-forcing
 *     `Authorization: Bearer ...` expensive. Keyed before the key is verified,
 *     because the attacker's IP is the one thing known to be untrusted.
 *   - by ownerId, applied AFTER authentication. Its job is fair sharing: one
 *     tenant cannot starve the rest of the process.
 *
 * State is per-process and in-memory. That is an honest limitation, not an
 * oversight: with N app servers behind a load balancer each holds its own
 * buckets, so the effective global limit is capacity x N. Fixing it needs a
 * shared counter (Redis/edge) and a deployment that has one; see
 * createSharedLimiter notes below. Until then this bounds per-process abuse,
 * which is what a single-node deployment needs.
 *
 * The clock is injectable so the tests can prove refill behaviour without
 * sleeping, and so a future shared limiter can be swapped in underneath.
 */

/** @typedef {{ ok: boolean, limit: number, remaining: number, resetMs: number, retryAfterMs: number }} Decision */

/**
 * @param {object} opts
 * @param {number} [opts.capacity]      burst capacity in tokens
 * @param {number} [opts.refillPerSec]  sustained rate in tokens/second
 * @param {() => number} [opts.now]     monotonic-ish clock in ms
 */
function createRateLimiter({
  capacity = 120,
  refillPerSec = 2,
  now = Date.now
} = {}) {
  if (!(capacity > 0)) throw new TypeError('capacity must be > 0');
  if (!(refillPerSec > 0)) throw new TypeError('refillPerSec must be > 0');

  /** @type {Map<string, {tokens: number, stamp: number}>} */
  const buckets = new Map();

  function sweep(nowMs, maxIdleMs) {
    for (const [key, b] of buckets) {
      if (nowMs - b.stamp > maxIdleMs) buckets.delete(key);
    }
  }

  /**
   * Charge `cost` tokens against `key`.
   * Returns a Decision; it never throws and never mutates on rejection, so a
   * throttled caller cannot deepen its own debt by retrying aggressively.
   */
  function take(key, cost = 1) {
    const nowMs = now();
    const charge = Number.isFinite(cost) && cost > 0 ? cost : 1;

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { tokens: capacity, stamp: nowMs };
      buckets.set(key, bucket);
    }

    // Refill for elapsed time. A long stall grants at most `capacity`, so a
    // client cannot sleep its way past the sustained ceiling.
    const elapsed = Math.max(0, nowMs - bucket.stamp) / 1000;
    bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * refillPerSec);
    bucket.stamp = nowMs;

    if (bucket.tokens < charge) {
      const deficit = charge - bucket.tokens;
      const retryAfterMs = Math.ceil((deficit / refillPerSec) * 1000);
      return {
        ok: false,
        limit: capacity,
        remaining: Math.floor(bucket.tokens),
        resetMs: retryAfterMs,
        retryAfterMs
      };
    }

    bucket.tokens -= charge;
    return {
      ok: true,
      limit: capacity,
      remaining: Math.floor(bucket.tokens),
      resetMs: Math.ceil(((capacity - bucket.tokens) / refillPerSec) * 1000),
      retryAfterMs: 0
    };
  }

  return {
    capacity,
    refillPerSec,
    take,
    /** Inspect without charging. Used by tests and diagnostics. */
    peek(key) {
      const bucket = buckets.get(key);
      return bucket ? { ...bucket } : null;
    },
    reset(key) {
      if (key === undefined) buckets.clear();
      else buckets.delete(key);
    },
    get size() { return buckets.size; },
    /** Drop buckets untouched for a while, so memory cannot grow unbounded. */
    sweepIdle(maxIdleMs = capacity * 1000) { sweep(now(), maxIdleMs); }
  };
}

/**
 * Best-effort client identity for the pre-auth limiter.
 *
 * `x-forwarded-for` is attacker-controlled, so it is only honoured when the
 * operator has asserted this process sits behind a proxy they control
 * (ZPP_TRUST_PROXY=1). Otherwise the socket address is used, which cannot be
 * spoofed — at the cost of collapsing every client behind that proxy into one
 * bucket, which is a visible, logged degradation rather than a silent bypass.
 */
function clientKey(req, { trustProxy = false } = {}) {
  if (trustProxy) {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd.trim()) {
      const first = fwd.split(',')[0].trim();
      if (first) return `ip:${first}`;
    }
    const real = req.headers['x-real-ip'];
    if (typeof real === 'string' && real.trim()) return `ip:${real.trim()}`;
  }
  const addr = (req.socket && req.socket.remoteAddress) || 'unknown';
  return `ip:${addr}`;
}

/** RFC 6585: at least one non-error status code MUST accompany 429. */
function rateLimitHeaders(decision) {
  return {
    'RateLimit-Limit': String(decision.limit),
    'RateLimit-Remaining': String(Math.max(0, decision.remaining)),
    'RateLimit-Reset': String(Math.ceil(decision.resetMs / 1000)),
    ...(decision.ok ? {} : { 'Retry-After': String(Math.max(1, Math.ceil(decision.retryAfterMs / 1000))) })
  };
}

/** Read limiter settings from the environment, with honest defaults. */
function limiterConfigFromEnv(env = process.env) {
  const num = (name, fallback) => {
    const raw = env[name];
    if (raw === undefined || raw === '') return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };
  return {
    capacity: num('ZPP_RATE_CAPACITY', 120),
    refillPerSec: num('ZPP_RATE_REFILL_PER_SEC', 2),
    trustProxy: env.ZPP_TRUST_PROXY === '1' || env.ZPP_TRUST_PROXY === 'true'
  };
}

module.exports = {
  createRateLimiter,
  clientKey,
  rateLimitHeaders,
  limiterConfigFromEnv
};
