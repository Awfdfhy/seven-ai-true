"use strict";

const crypto = require("crypto");

const ROLES = Object.freeze(["EPISODE", "STATE", "PREFERENCE", "GOAL", "PROCEDURE", "LESSON", "PROFILE"]);
const LIFECYCLE = Object.freeze({ CURRENT: "CURRENT", SUPERSEDED: "SUPERSEDED", PURGED: "PURGED" });

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function asArray(v) { return Array.isArray(v) ? v : []; }
function stable(value) {
  if (value == null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stable(value[k])}`).join(",")}}`;
}
function hash(value) { return crypto.createHash("sha256").update(stable(value)).digest("hex"); }
function normalizeText(v) { return String(v || "").trim().replace(/\s+/g, " "); }
function words(v) { return new Set(normalizeText(v).toLocaleLowerCase().match(/[\p{L}\p{N}_-]+/gu) || []); }
function intersects(a, b) { let n = 0; for (const x of a) if (b.has(x)) n += 1; return n; }
function boundedInt(value, fallback, min, max) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
}

function normalizeOrigin(origin = {}) {
  const principal = normalizeText(origin.principal);
  const sourceEventId = normalizeText(origin.sourceEventId || origin.eventId);
  const scope = normalizeText(origin.scope || "user");
  if (!principal) throw new Error("memory origin requires principal");
  if (!sourceEventId) throw new Error("memory origin requires sourceEventId");
  return Object.freeze({
    principal,
    sourceEventId,
    scope,
    authority: normalizeText(origin.authority || "memory-origin"),
    clusterId: normalizeText(origin.clusterId || sourceEventId),
    capturedAt: origin.capturedAt || null
  });
}

function admissionDecision(candidate = {}, policy = {}) {
  const content = normalizeText(candidate.content);
  if (!content) return { allowed: false, reason: "empty" };
  if (candidate.privateChainOfThought === true || candidate.kind === "private-chain-of-thought") return { allowed: false, reason: "private-chain-of-thought" };
  if ((candidate.transcript === true || candidate.kind === "transcript") && policy.allowTranscript !== true) return { allowed: false, reason: "transcript-not-memory" };
  if (candidate.ephemeral === true && candidate.explicitlyPromoted !== true) return { allowed: false, reason: "ephemeral" };
  const role = String(candidate.role || "STATE").toUpperCase();
  if (!ROLES.includes(role)) return { allowed: false, reason: "invalid-role" };
  if (role === "PROCEDURE" && candidate.verified !== true && candidate.authoritativeInstruction !== true) return { allowed: false, reason: "procedure-requires-verification" };
  return { allowed: true, reason: "admitted", role };
}

function createFabric(seed = {}) {
  const current = new Map();
  const history = new Map();
  const events = [];
  const purgeReceipts = [];
  let sequence = 0;

  function appendEvent(type, data = {}, at) {
    sequence += 1;
    const clean = clone(data);
    delete clean.content;
    delete clean.originalContent;
    const event = Object.freeze({
      id: `memory-event-${sequence}-${hash({ type, clean, sequence }).slice(0, 12)}`,
      sequence,
      type: String(type),
      at: at || new Date().toISOString(),
      data: clean
    });
    events.push(event);
    return event;
  }

  function normalizeAtom(input = {}, revision = 1, previous = null) {
    const admission = admissionDecision(input, input.policy || {});
    if (!admission.allowed) throw new Error(`memory admission rejected: ${admission.reason}`);
    const origin = previous ? previous.origin : normalizeOrigin(input.origin);
    if (previous && input.origin) {
      const requested = normalizeOrigin(input.origin);
      if (stable(requested) !== stable(previous.origin)) throw new Error("memory origin is immutable across revisions");
    }
    const atomId = String(previous ? previous.atomId : input.atomId || `memory-${hash({ content: normalizeText(input.content), origin, role: admission.role }).slice(0, 20)}`);
    const now = input.at || new Date().toISOString();
    return Object.freeze({
      schemaVersion: 1,
      atomId,
      revision,
      revisionId: `${atomId}@${revision}`,
      role: admission.role,
      content: normalizeText(input.content),
      principal: origin.principal,
      namespace: normalizeText(input.namespace || previous?.namespace || "default"),
      scope: normalizeText(input.scope || previous?.scope || origin.scope),
      origin,
      sourceRefs: Object.freeze(Array.from(new Set(asArray(input.sourceRefs || previous?.sourceRefs).map(String).filter(Boolean)))),
      validFrom: input.validFrom || previous?.validFrom || now,
      validUntil: input.validUntil || null,
      lifecycle: LIFECYCLE.CURRENT,
      createdAt: previous?.createdAt || now,
      updatedAt: now,
      sensitivity: input.sensitivity || previous?.sensitivity || "normal",
      retention: clone(input.retention || previous?.retention || {}),
      metadata: clone(input.metadata || previous?.metadata || {}),
      lineage: Object.freeze({
        parentRevisionId: previous?.revisionId || null,
        transformation: normalizeText(input.transformation || (previous ? "correction" : "direct")),
        sourceEventId: origin.sourceEventId
      })
    });
  }

  function sameCanonicalContent(a, b) {
    return a.role === b.role && a.principal === b.principal && a.namespace === b.namespace && a.scope === b.scope && a.origin.clusterId === b.origin.clusterId && normalizeText(a.content).toLocaleLowerCase() === normalizeText(b.content).toLocaleLowerCase();
  }

  function commit(input = {}) {
    const atom = normalizeAtom(input, 1, null);
    for (const existing of current.values()) if (sameCanonicalContent(existing, atom)) return { committed: false, reason: "duplicate-origin-content", atom: clone(existing) };
    if (current.has(atom.atomId) || history.has(atom.atomId)) throw new Error("memory atom already exists");
    current.set(atom.atomId, atom);
    history.set(atom.atomId, []);
    const event = appendEvent("COMMIT", { atomId: atom.atomId, revisionId: atom.revisionId, principal: atom.principal, namespace: atom.namespace, scope: atom.scope, role: atom.role, origin: atom.origin });
    return { committed: true, atom: clone(atom), event: clone(event) };
  }

  function correct(atomId, input = {}) {
    const previous = current.get(String(atomId));
    if (!previous) throw new Error("memory atom not found");
    const old = Object.freeze({ ...previous, lifecycle: LIFECYCLE.SUPERSEDED, validUntil: input.at || new Date().toISOString() });
    const next = normalizeAtom({ ...input, role: input.role || previous.role }, previous.revision + 1, previous);
    history.get(previous.atomId).push(old);
    current.set(previous.atomId, next);
    const event = appendEvent("SUPERSEDE", { atomId: next.atomId, fromRevisionId: old.revisionId, toRevisionId: next.revisionId, principal: next.principal, namespace: next.namespace, scope: next.scope, origin: next.origin });
    return { atom: clone(next), superseded: clone(old), event: clone(event) };
  }

  function purge(atomId, opts = {}) {
    atomId = String(atomId);
    const atom = current.get(atomId);
    const revisions = history.get(atomId) || [];
    if (!atom && !revisions.length) return { purged: false, reason: "not-found" };
    const principal = atom?.principal || revisions[0]?.principal || null;
    const namespace = atom?.namespace || revisions[0]?.namespace || null;
    const scope = atom?.scope || revisions[0]?.scope || null;
    current.delete(atomId);
    history.delete(atomId);
    const event = appendEvent("PURGE", { atomId, principal, namespace, scope, reason: normalizeText(opts.reason || "user-request") }, opts.at);
    const receipt = Object.freeze({ receiptId: `purge-${hash({ atomId, eventId: event.id }).slice(0, 20)}`, atomId, eventId: event.id, at: event.at, principal, namespace, scope });
    purgeReceipts.push(receipt);
    return { purged: true, receipt: clone(receipt) };
  }

  function versions(atomId) {
    const old = history.get(String(atomId)) || [];
    const now = current.get(String(atomId));
    return [...old, ...(now ? [now] : [])].map(clone);
  }

  function versionAt(atomId, pointInTime) {
    const at = Date.parse(pointInTime);
    if (!Number.isFinite(at)) throw new Error("valid pointInTime required");
    return versions(atomId).find(v => {
      const from = Date.parse(v.validFrom || v.createdAt || 0);
      const until = v.validUntil ? Date.parse(v.validUntil) : Infinity;
      return from <= at && at < until;
    }) || null;
  }

  function scopeFilter(atom, opts = {}) {
    if (opts.principal && atom.principal !== String(opts.principal)) return false;
    if (opts.namespace && atom.namespace !== String(opts.namespace)) return false;
    if (opts.scope && atom.scope !== String(opts.scope)) return false;
    if (opts.roles && !asArray(opts.roles).map(x => String(x).toUpperCase()).includes(atom.role)) return false;
    return true;
  }

  function scoreAtom(atom, query, opts = {}) {
    const q = words(query);
    const text = words(atom.content);
    const overlap = intersects(q, text);
    const exact = normalizeText(query).toLocaleLowerCase() === normalizeText(atom.content).toLocaleLowerCase() ? 1000 : 0;
    const idHit = String(query) === atom.atomId || String(query) === atom.revisionId ? 2000 : 0;
    const roleBoost = opts.preferRole && atom.role === String(opts.preferRole).toUpperCase() ? 25 : 0;
    const recency = Number.isFinite(Date.parse(atom.updatedAt)) ? Date.parse(atom.updatedAt) / 1e13 : 0;
    return idHit + exact + overlap * 10 + roleBoost + recency;
  }

  function retrieve(query, opts = {}) {
    const limit = boundedInt(opts.limit, 8, 1, 50);
    const point = opts.pointInTime || null;
    const candidates = [];
    const ids = new Set([...current.keys(), ...history.keys()]);
    for (const atomId of ids) {
      const atom = point ? versionAt(atomId, point) : current.get(atomId);
      if (!atom || !scopeFilter(atom, opts)) continue;
      const score = scoreAtom(atom, query, opts);
      if (normalizeText(query) && score < 1) continue;
      candidates.push({ atom, score });
    }
    candidates.sort((a, b) => b.score - a.score || b.atom.revision - a.atom.revision || a.atom.atomId.localeCompare(b.atom.atomId));
    const rows = candidates.slice(0, limit).map(({ atom, score }) => ({ atom: clone(atom), score }));
    return Object.freeze({ abstained: rows.length === 0, query: normalizeText(query), rows: Object.freeze(rows), totalMatches: candidates.length });
  }

  function memoryCapsule(query, opts = {}) {
    const result = retrieve(query, opts);
    return Object.freeze({
      kind: "MemoryCapsule",
      schemaVersion: 1,
      status: result.abstained ? "ABSTAIN" : "PASS",
      query: result.query,
      principal: opts.principal || null,
      namespace: opts.namespace || null,
      scope: opts.scope || null,
      items: Object.freeze(result.rows.map(({ atom, score }) => Object.freeze({
        id: atom.revisionId,
        atomId: atom.atomId,
        role: atom.role,
        content: atom.content,
        score,
        contextRole: "MEMORY_RECALL",
        epistemicUse: "RECALL_ONLY",
        grantsAuthority: false,
        sourceRefs: atom.sourceRefs,
        lineage: Object.freeze({ sourceRevisionId: atom.revisionId, sourceEventId: atom.origin.sourceEventId, originClusterId: atom.origin.clusterId, transformation: "memory-retrieval" }),
        reconstruct: Object.freeze({ atomId: atom.atomId, revision: atom.revision })
      })))
    });
  }

  function pageEvents({ cursor = 0, limit = 50 } = {}) {
    const start = boundedInt(cursor, 0, 0, Number.MAX_SAFE_INTEGER);
    const size = boundedInt(limit, 50, 1, 200);
    const rows = events.slice(start, start + size).map(clone);
    return { rows, nextCursor: start + rows.length < events.length ? start + rows.length : null, total: events.length };
  }

  function importLegacy(objects = [], originFactory) {
    const results = [];
    for (const raw of asArray(objects)) {
      const origin = typeof originFactory === "function" ? originFactory(raw) : { principal: "legacy-user", sourceEventId: `legacy:${raw.id || hash(raw).slice(0, 12)}`, scope: raw.scope || "user", clusterId: `legacy:${raw.id || hash(raw).slice(0, 12)}` };
      results.push(commit({ atomId: raw.id || undefined, content: raw.content, role: raw.role || raw.type || "STATE", scope: raw.scope || origin.scope, origin, sourceRefs: raw.sourceRefs || [], metadata: { legacy: true, originalCreatedAt: raw.createdAt || null } }));
    }
    return results;
  }

  function canAuthorizeAction() { return false; }
  function snapshot() {
    return {
      events: events.map(clone),
      current: [...current.values()].map(clone),
      history: [...history.entries()].map(([atomId, rows]) => ({ atomId, revisions: rows.map(clone) })),
      purgeReceipts: purgeReceipts.map(clone)
    };
  }

  for (const atom of asArray(seed.current)) {
    const normalized = Object.freeze(clone(atom));
    current.set(normalized.atomId, normalized);
    history.set(normalized.atomId, []);
  }
  for (const row of asArray(seed.history)) history.set(row.atomId, asArray(row.revisions).map(x => Object.freeze(clone(x))));
  for (const event of asArray(seed.events)) { events.push(Object.freeze(clone(event))); sequence = Math.max(sequence, Number(event.sequence || 0)); }
  for (const receipt of asArray(seed.purgeReceipts)) purgeReceipts.push(Object.freeze(clone(receipt)));

  return Object.freeze({ commit, correct, purge, versions, versionAt, retrieve, memoryCapsule, pageEvents, importLegacy, canAuthorizeAction, snapshot });
}

module.exports = { ROLES, LIFECYCLE, normalizeOrigin, admissionDecision, createFabric, hash };