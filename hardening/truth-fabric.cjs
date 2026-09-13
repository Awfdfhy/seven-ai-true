"use strict";

const EPISTEMIC_KIND = Object.freeze({
  FACT: "FACT",
  CLAIM: "CLAIM",
  INFERENCE: "INFERENCE",
  ASSUMPTION: "ASSUMPTION",
  UNKNOWN: "UNKNOWN",
  CONFLICT: "CONFLICT"
});

const AUTHORITY = Object.freeze({ A0: 6, A1: 5, A2: 4, A3: 3, A4: 2, A5: 1, NONE: 0 });

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function asArray(v) { return Array.isArray(v) ? v : []; }
function authorityRank(v) { return Object.prototype.hasOwnProperty.call(AUTHORITY, String(v || "NONE").toUpperCase()) ? AUTHORITY[String(v || "NONE").toUpperCase()] : 0; }
function authorityName(rank) { return Object.entries(AUTHORITY).find(([, n]) => n === rank)?.[0] || "NONE"; }
function weakestAuthority(values) {
  const ranks = asArray(values).map(authorityRank);
  return authorityName(ranks.length ? Math.min(...ranks) : 0);
}
function unique(values) { return Array.from(new Set(asArray(values).filter(v => v != null))); }

function normalizeSource(source = {}) {
  if (!source.id) throw new Error("source requires id");
  return {
    id: String(source.id),
    authority: authorityName(authorityRank(source.authority || "A5")),
    uri: source.uri || null,
    capturedAt: source.capturedAt || null,
    observedAt: source.observedAt || null,
    contentHash: source.contentHash || null,
    independentGroup: source.independentGroup || source.id,
    trust: source.trust || "untrusted",
    metadata: clone(source.metadata || {})
  };
}

function createClaim(input = {}) {
  const text = String(input.text || "").trim();
  if (!text) throw new Error("claim requires text");
  const kind = String(input.kind || EPISTEMIC_KIND.CLAIM).toUpperCase();
  if (!Object.values(EPISTEMIC_KIND).includes(kind)) throw new Error(`unknown epistemic kind: ${kind}`);
  const sources = asArray(input.sources).map(normalizeSource);
  const sourceAuthority = weakestAuthority(sources.map(s => s.authority));
  const declaredAuthority = authorityName(authorityRank(input.authority || sourceAuthority));
  const effectiveAuthority = authorityName(Math.min(authorityRank(declaredAuthority), authorityRank(sourceAuthority || declaredAuthority)));
  return {
    schemaVersion: 1,
    id: String(input.id || `claim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`),
    text,
    kind,
    status: input.status || "OPEN",
    authority: effectiveAuthority,
    sources,
    evidence: asArray(input.evidence).map(clone),
    contradicts: unique(input.contradicts),
    supports: unique(input.supports),
    createdAt: input.createdAt || new Date().toISOString(),
    validFrom: input.validFrom || null,
    validUntil: input.validUntil || null,
    lineage: {
      parents: unique(input.lineage && input.lineage.parents),
      transformation: input.lineage && input.lineage.transformation || "direct",
      transformer: input.lineage && input.lineage.transformer || null
    },
    metadata: clone(input.metadata || {})
  };
}

function isFresh(claim, now = Date.now(), maxAgeMs = 0) {
  if (!maxAgeMs) return true;
  const stamps = claim.sources.map(s => s.observedAt || s.capturedAt).filter(Boolean).map(Date.parse).filter(Number.isFinite);
  if (!stamps.length) return false;
  return now - Math.max(...stamps) <= maxAgeMs;
}

function independentSourceCount(claim) {
  return new Set(claim.sources.map(s => s.independentGroup || s.id)).size;
}

function resolveClaim(claim, options = {}) {
  if (!claim) return { state: EPISTEMIC_KIND.UNKNOWN, reason: "missing-claim", authority: "NONE" };
  if (claim.contradicts && claim.contradicts.length) return { state: EPISTEMIC_KIND.CONFLICT, reason: "explicit-conflict", authority: claim.authority };
  const minSources = Math.max(0, Number(options.minIndependentSources || 0));
  if (minSources && independentSourceCount(claim) < minSources) return { state: EPISTEMIC_KIND.UNKNOWN, reason: "insufficient-independent-sources", authority: claim.authority };
  if (!isFresh(claim, options.now || Date.now(), Number(options.maxAgeMs || 0))) return { state: EPISTEMIC_KIND.UNKNOWN, reason: "stale-evidence", authority: claim.authority };
  if (claim.kind === EPISTEMIC_KIND.ASSUMPTION) return { state: EPISTEMIC_KIND.ASSUMPTION, reason: "declared-assumption", authority: claim.authority };
  if (claim.kind === EPISTEMIC_KIND.INFERENCE && options.allowInference === false) return { state: EPISTEMIC_KIND.UNKNOWN, reason: "inference-not-allowed", authority: claim.authority };
  if (!claim.sources.length && claim.kind !== EPISTEMIC_KIND.ASSUMPTION) return { state: EPISTEMIC_KIND.UNKNOWN, reason: "no-sources", authority: "NONE" };
  return { state: claim.kind, reason: "supported", authority: claim.authority };
}

function deriveClaim({ text, parents, transformation, transformer, kind = EPISTEMIC_KIND.INFERENCE, id } = {}) {
  const ps = asArray(parents);
  if (!ps.length) throw new Error("derived claim requires parents");
  const inheritedSources = [];
  for (const p of ps) for (const s of asArray(p.sources)) inheritedSources.push(s);
  const authority = weakestAuthority(ps.map(p => p.authority));
  const claim = createClaim({
    id,
    text,
    kind,
    authority,
    sources: inheritedSources,
    lineage: {
      parents: ps.map(p => p.id),
      transformation: transformation || "derived",
      transformer: transformer || null
    }
  });
  if (authorityRank(claim.authority) > Math.min(...ps.map(p => authorityRank(p.authority)))) {
    throw new Error("authority amplification detected");
  }
  return claim;
}

function mergeClaims(claims = []) {
  const list = asArray(claims);
  if (!list.length) return { state: EPISTEMIC_KIND.UNKNOWN, authority: "NONE", claims: [] };
  const normalizedTexts = new Set(list.map(c => String(c.text || "").trim().toLowerCase()));
  const hasConflict = normalizedTexts.size > 1 || list.some(c => asArray(c.contradicts).length > 0);
  return {
    state: hasConflict ? EPISTEMIC_KIND.CONFLICT : list.some(c => c.kind === EPISTEMIC_KIND.FACT) ? EPISTEMIC_KIND.FACT : EPISTEMIC_KIND.CLAIM,
    authority: weakestAuthority(list.map(c => c.authority)),
    claims: list.map(c => c.id),
    sourceCount: new Set(list.flatMap(c => c.sources.map(s => s.id))).size,
    independentSourceCount: new Set(list.flatMap(c => c.sources.map(s => s.independentGroup || s.id))).size
  };
}

function grantsAuthority() {
  return false;
}

module.exports = {
  EPISTEMIC_KIND,
  AUTHORITY,
  normalizeSource,
  createClaim,
  deriveClaim,
  resolveClaim,
  mergeClaims,
  independentSourceCount,
  isFresh,
  weakestAuthority,
  grantsAuthority
};
