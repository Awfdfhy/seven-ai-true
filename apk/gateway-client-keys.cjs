'use strict';
// GATEWAY_CLIENT_KEYS loader for the Seven RPG standalone APK acceptance.
//
// The GitHub Actions secret GATEWAY_CLIENT_KEYS bundles the four RPG live-inference
// provider credentials (Groq, OpenRouter, NVIDIA, Mistral) into a single secret.
// This module parses that secret into the per-provider keys that
// apk/rpg-live-llm-acceptance.cjs already consumes via the SEVEN_RPG_*_KEY env vars.
//
// SECURITY: this module NEVER logs, persists, or echoes credential values. It only
// returns them to the caller for in-memory use. Fixture-based unit tests use
// non-secret placeholder values; the real secret is injected only in CI.

const PROVIDER_KEYS = Object.freeze(['groq', 'openrouter', 'nvidia', 'mistral']);

// Normalizes any provider-name variant (groq / GROQ / groq_api_key / groqApiKey)
// to one of the four canonical provider ids, or null.
function normalizeProvider(name) {
  const n = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (n === 'groq' || n === 'groqapikey' || n === 'groqapi') return 'groq';
  if (n === 'openrouter' || n === 'openrouterapikey' || n === 'openrouterapi') return 'openrouter';
  if (n === 'nvidia' || n === 'nvidiaapikey' || n === 'nvidiaapi' || n === 'nvidianim') return 'nvidia';
  if (n === 'mistral' || n === 'mistralapikey' || n === 'mistralapi') return 'mistral';
  return null;
}

function lookupProviderKey(obj, provider) {
  for (const key of Object.keys(obj)) {
    if (normalizeProvider(key) === provider) {
      const v = obj[key];
      if (typeof v === 'string') return v;
    }
  }
  return undefined;
}

// Parses the raw GATEWAY_CLIENT_KEYS secret value into
// { groq?, openrouter?, nvidia?, mistral? }. Accepts:
//   - a JSON object keyed by provider name (case-insensitive),
//   - the same but base64-encoded, or
//   - newline-separated "PROVIDER=key" / "provider:key" pairs (raw or base64).
// Returns {} for empty/invalid input. Never logs values.
function parseGatewayClientKeys(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') return {};
  const seen = new Set();
  // Recursively unwrap until provider keys are found: direct JSON/lines, then
  // JWT-style dot-separated base64url segments, then whole-string base64.
  function attempt(s) {
    if (typeof s !== 'string') return null;
    s = s.trim();
    if (!s || seen.has(s)) return null;
    seen.add(s);
    const direct = extractFromString(s);
    if (direct) return direct;
    if (s.indexOf('.') !== -1) {
      for (const seg of s.split('.')) {
        if (!/^[A-Za-z0-9_-]+$/.test(seg)) continue;
        const r = attempt(maybeBase64Decode(seg));
        if (r) return r;
      }
    }
    return attempt(maybeBase64Decode(s));
  }
  return attempt(raw) || {};
}

// Base64/base64url-decode only when the string is unambiguously base64-shaped;
// otherwise null. Pads to a multiple of 4 so unpadded base64url (JWT segments)
// decode too. Rejects binary noise.
function maybeBase64Decode(s) {
  if (typeof s !== 'string' || s.length === 0) return null;
  if (!/^[A-Za-z0-9+/=_-]+$/.test(s)) return null;
  try {
    const std = s.replace(/_/g, '/').replace(/-/g, '+').replace(/=+$/, '');
    const padded = std + '='.repeat((4 - std.length % 4) % 4);
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    if (decoded.length === 0) return null;
    if (/[\u0000-\u0008\u000e-\u001f]/.test(decoded)) return null;
    return decoded;
  } catch (_) { return null; }
}

function extractFromString(input) {
  if (typeof input !== 'string' || input.trim() === '') return null;

  let parsed = null;
  try {
    const candidate = JSON.parse(input);
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) parsed = candidate;
  } catch (_) { /* not JSON — try the line format below */ }

  const out = {};
  if (parsed) {
    for (const provider of PROVIDER_KEYS) {
      const value = lookupProviderKey(parsed, provider);
      if (typeof value === 'string' && value.trim()) out[provider] = value.trim();
    }
  } else {
    for (const line of input.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_-]+)\s*[:=]\s*(.+?)\s*$/);
      if (!m) continue;
      const provider = normalizeProvider(m[1]);
      if (provider && m[2]) out[provider] = m[2].trim();
    }
  }
  // Return null when no providers found so the '||' fallback chain in
  // parseGatewayClientKeys can try the base64-decoded form.
  return Object.keys(out).length ? out : null;
}

// Maps parsed provider keys onto the SEVEN_RPG_*_KEY env var names the
// acceptance runner already understands. Does NOT log values.
function toRuntimeEnv(parsed) {
  const env = {};
  if (parsed.groq) env.SEVEN_RPG_GROQ_KEY = parsed.groq;
  if (parsed.openrouter) env.SEVEN_RPG_OPENROUTER_KEY = parsed.openrouter;
  if (parsed.nvidia) env.SEVEN_RPG_NVIDIA_KEY = parsed.nvidia;
  if (parsed.mistral) env.SEVEN_RPG_MISTRAL_KEY = parsed.mistral;
  return env;
}

if (typeof module === 'object' && module.exports) {
  module.exports = { parseGatewayClientKeys, toRuntimeEnv, PROVIDER_KEYS };
}
