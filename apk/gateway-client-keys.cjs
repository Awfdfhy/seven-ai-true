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
//   - a JSON object keyed by provider name (case-insensitive), or
//   - newline-separated "PROVIDER=key" / "provider:key" pairs.
// Returns {} for empty/invalid input. Never logs values.
function parseGatewayClientKeys(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') return {};

  let parsed = null;
  try {
    const candidate = JSON.parse(raw);
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) parsed = candidate;
  } catch (_) { /* not JSON — try the line format below */ }

  const out = {};
  if (parsed) {
    for (const provider of PROVIDER_KEYS) {
      const value = lookupProviderKey(parsed, provider);
      if (typeof value === 'string' && value.trim()) out[provider] = value.trim();
    }
    return out;
  }

  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_-]+)\s*[:=]\s*(.+?)\s*$/);
    if (!m) continue;
    const provider = normalizeProvider(m[1]);
    if (provider && m[2]) out[provider] = m[2].trim();
  }
  return out;
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
