(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgCanonContinuity = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }
  function mapsToPlain(v) {
    if (v instanceof Map) return { __map: Object.fromEntries([...v].map(([k, x]) => [k, mapsToPlain(x)])) };
    if (Array.isArray(v)) return v.map(mapsToPlain);
    if (v && typeof v === 'object') {
      const out = {};
      for (const [k, x] of Object.entries(v)) out[k] = mapsToPlain(x);
      return out;
    }
    return v;
  }
  function plainToMaps(v) {
    if (Array.isArray(v)) return v.map(plainToMaps);
    if (v && typeof v === 'object') {
      if (Object.prototype.hasOwnProperty.call(v, '__map')) {
        return new Map(Object.entries(v.__map).map(([k, x]) => [k, plainToMaps(x)]));
      }
      const out = {};
      for (const [k, x] of Object.entries(v)) out[k] = plainToMaps(x);
      return out;
    }
    return v;
  }
  function uniq(xs) { return Array.from(new Set(arr(xs).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))); }
  let idCounter = 0;
  function nextId() { return ++idCounter; }
  function stableId(prefix) { return prefix + '-' + String(nextId()).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }

  const CANON_LEVELS = Object.freeze(['RUMOR', 'SOFT', 'ACTIVE', 'HARD']);
  const CONFLICT_SEVERITY = Object.freeze(['info', 'warning', 'critical']);
  const PROVENANCE_TYPES = Object.freeze(['user', 'npc', 'world_event', 'canon_rule', 'import', 'system']);

  function createCanonContinuity(stateApi, rulesApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const entries = new Map();
    const conflicts = new Map();
    const history = new Map();
    const provenance = new Map();

    function createEntry(input) {
      const i = obj(input);
      const id = i.id || stableId('canon');
      const level = CANON_LEVELS.includes(i.level) ? i.level : 'SOFT';
      const value = clone(i.value);
      const entityIds = uniq(i.entityIds);
      const tags = uniq(i.tags);
      const publicFlag = i.public === true;
      const availableAtTick = Number.isFinite(i.availableAtTick) ? i.availableAtTick : 0;
      const confidence = Math.max(0, Math.min(1, Number(i.confidence) || 1));
      const sourceEventId = text(i.sourceEventId);
      const supersedes = uniq(i.supersedes);

      const entry = {
        id, level, value, entityIds, tags, public: publicFlag,
        availableAtTick, confidence, sourceEventId, supersedes,
        status: 'active', createdAt: now(), updatedAt: now(), version: 1,
        provenance: { source: 'user', author: text(i.author), timestamp: now() }
      };
      entries.set(id, entry);
      history.set(id, [{ action: 'create', timestamp: now(), author: text(i.author), diff: entry }]);
      return entry;
    }

    function getEntry(id) {
      return entries.get(id);
    }

    function getAllEntries(filter) {
      const f = obj(filter);
      let result = Array.from(entries.values());
      if (f.level) result = result.filter(e => e.level === f.level);
      if (f.status) result = result.filter(e => e.status === f.status);
      if (f.entityId) result = result.filter(e => e.entityIds.includes(f.entityId));
      if (f.tag) result = result.filter(e => e.tags.includes(f.tag));
      if (f.public !== undefined) result = result.filter(e => e.public === f.public);
      if (f.availableBefore !== undefined) result = result.filter(e => e.availableAtTick <= f.availableBefore);
      if (f.availableAfter !== undefined) result = result.filter(e => e.availableAtTick >= f.availableAfter);
      return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    function updateEntry(id, updates, author) {
      const entry = entries.get(id);
      if (!entry) return { ok: false, reason: 'not-found' };
      if (entry.level === 'HARD' && updates.level && updates.level !== 'HARD') {
        return { ok: false, reason: 'cannot-downgrade-hard-canon' };
      }
      if (entry.level === 'HARD' && updates.value && JSON.stringify(entry.value) !== JSON.stringify(updates.value)) {
        return { ok: false, reason: 'hard-canon-immutable' };
      }
      const next = clone(entry);
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'createdAt' && key !== 'version' && key !== 'provenance') {
          next[key] = value;
        }
      }
      next.updatedAt = now();
      next.version = (entry.version || 1) + 1;
      next.provenance = { source: 'user', author, timestamp: now(), previous: entry.provenance };
      entries.set(id, next);
      const historyArr = history.get(id) || [];
      historyArr.push({ action: 'update', timestamp: now(), author, diff: updates });
      history.set(id, historyArr);
      return { ok: true, entry: next };
    }

    function deleteEntry(id, author) {
      const entry = entries.get(id);
      if (!entry) return { ok: false, reason: 'not-found' };
      if (entry.level === 'HARD') {
        return { ok: false, reason: 'cannot-delete-hard-canon' };
      }
      const next = clone(entry);
      next.status = 'deleted';
      next.updatedAt = now();
      next.version = (entry.version || 1) + 1;
      entries.set(id, next);
      const historyArr = history.get(id) || [];
      historyArr.push({ action: 'delete', timestamp: now(), author });
      history.set(id, historyArr);
      return { ok: true };
    }

    function getHistory(id) {
      return history.get(id) || [];
    }

    function checkConflict(newEntry, existingEntries) {
      const detected = [];
      for (const existing of existingEntries) {
        if (existing.id === newEntry.id) continue;
        if (existing.status !== 'active') continue;
        if (JSON.stringify(existing.value) === JSON.stringify(newEntry.value)) continue;
        const sameEntities = newEntry.entityIds.some(e => existing.entityIds.includes(e));
        const sameTags = newEntry.tags.some(t => existing.tags.includes(t));
        if (sameEntities || sameTags) {
          let severity = 'info';
          if (newEntry.level === 'HARD' || existing.level === 'HARD') severity = 'critical';
          else if (newEntry.level === 'ACTIVE' || existing.level === 'ACTIVE') severity = 'warning';
          const conflict = {
            id: stableId('conflict'),
            entryId: newEntry.id,
            conflictWithId: existing.id,
            severity,
            reason: 'conflicting-values',
            detectedAt: now(),
            status: 'open',
            resolution: null
          };
          conflicts.set(conflict.id, conflict);
          detected.push(conflict);
        }
      }
      return detected;
    }

    function getConflicts(filter) {
      const f = obj(filter);
      let result = Array.from(conflicts.values());
      if (f.status) result = result.filter(c => c.status === f.status);
      if (f.severity) result = result.filter(c => c.severity === f.severity);
      if (f.entryId) result = result.filter(c => c.entryId === f.entryId);
      return result.sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
    }

    function resolveConflict(conflictId, resolution, author) {
      const conflict = conflicts.get(conflictId);
      if (!conflict) return { ok: false, reason: 'not-found' };
      const next = clone(conflict);
      next.status = 'resolved';
      next.resolution = { strategy: resolution.strategy, decidedBy: author, timestamp: now(), details: resolution.details };
      conflicts.set(conflictId, next);
      return { ok: true, conflict: next };
    }

    function suggestResolution(conflictId) {
      const conflict = conflicts.get(conflictId);
      if (!conflict) return null;
      const newEntry = entries.get(conflict.entryId);
      const existingEntry = entries.get(conflict.conflictWithId);
      if (!newEntry || !existingEntry) return null;
      const suggestions = [];
      if (existingEntry.level === 'HARD' && newEntry.level !== 'HARD') {
        suggestions.push({ strategy: 'keep-existing', reason: 'Existing entry is HARD canon' });
      } else if (newEntry.level === 'HARD' && existingEntry.level !== 'HARD') {
        suggestions.push({ strategy: 'replace-with-new', reason: 'New entry is HARD canon' });
      } else if (newEntry.level === existingEntry.level) {
        suggestions.push({ strategy: 'keep-newer', reason: 'Same canon level, keep more recent' });
        suggestions.push({ strategy: 'merge', reason: 'Merge compatible aspects' });
      }
      if (newEntry.availableAtTick > existingEntry.availableAtTick) {
        suggestions.push({ strategy: 'keep-newer', reason: 'New entry available later' });
      }
      return suggestions;
    }

    function getProvenance(entryId) {
      return provenance.get(entryId) || [];
    }

    function addProvenance(entryId, prov) {
      const p = obj(prov);
      const entry = entries.get(entryId);
      if (!entry) return { ok: false, reason: 'entry-not-found' };
      const record = {
        id: stableId('prov'),
        type: PROVENANCE_TYPES.includes(p.type) ? p.type : 'user',
        author: text(p.author),
        timestamp: now(),
        description: text(p.description),
        sourceEventId: text(p.sourceEventId),
        metadata: obj(p.metadata)
      };
      const provArr = provenance.get(entryId) || [];
      provArr.push(record);
      provenance.set(entryId, provArr);
      return { ok: true, provenance: record };
    }

    function auditCanon(state) {
      const st = stateApi.createState(state);
      const issues = [];
      const entriesArr = Array.from(entries.values()).filter(e => e.status === 'active');
      for (const e of entriesArr) {
        for (const other of entriesArr) {
          if (e.id >= other.id) continue;
          if (e.entityIds.some(id => other.entityIds.includes(id)) || e.tags.some(t => other.tags.includes(t))) {
            if (JSON.stringify(e.value) !== JSON.stringify(other.value)) {
              issues.push({ type: 'conflict', entryA: e.id, entryB: other.id, severity: 'warning' });
            }
          }
          if (e.level === 'HARD' && e.status !== 'active') {
            issues.push({ type: 'hard-canon-inactive', entryId: e.id, severity: 'critical' });
          }
        }
      }
      return { valid: issues.length === 0, issues };
    }

    function stableId(prefix) { return prefix + '-' + String(++idCounter).padStart(6, '0'); }

    // RPG-15-05: Canon policy editor — lets a GM configure the rules that govern
    // how canon entries are created, promoted, resolved and exposed (spoilers).
    const DEFAULT_CANON_POLICY = Object.freeze({
      // Minimum authority tier required to write HARD canon
      hardCanonMinAuthority: 'gm',
      // Auto-promote SOFT -> ACTIVE after N corroborating entries
      autoPromoteAfterCorrobations: 3,
      // Whether conflicting HARD canon blocks the write (immutable hard canon)
      hardCanonImmutable: true,
      // Default conflict-resolution strategy: 'newest' | 'highest-authority' | 'manual'
      conflictResolution: 'manual',
      // Spoiler boundary: entries tagged beyond this tier are hidden from players
      spoilerBoundary: 'chapter-3',
      // Whether players may propose canon changes (creates a canon request)
      allowPlayerProposals: true,
      // Provenance required before an entry is considered trusted
      requireProvenance: false
    });

    let canonPolicy = Object.assign({}, DEFAULT_CANON_POLICY);

    const POLICY_FIELDS = Object.freeze(Object.keys(DEFAULT_CANON_POLICY));

    function getCanonPolicy() {
      return Object.assign({}, canonPolicy);
    }

    function getPolicySchema() {
      return {
        type: 'object',
        fields: {
          hardCanonMinAuthority: { type: 'string', enum: ['player', 'gm', 'system'], default: DEFAULT_CANON_POLICY.hardCanonMinAuthority },
          autoPromoteAfterCorrobations: { type: 'integer', minimum: 1, maximum: 10, default: DEFAULT_CANON_POLICY.autoPromoteAfterCorrobations },
          hardCanonImmutable: { type: 'boolean', default: DEFAULT_CANON_POLICY.hardCanonImmutable },
          conflictResolution: { type: 'string', enum: ['newest', 'highest-authority', 'manual'], default: DEFAULT_CANON_POLICY.conflictResolution },
          spoilerBoundary: { type: 'string', default: DEFAULT_CANON_POLICY.spoilerBoundary },
          allowPlayerProposals: { type: 'boolean', default: DEFAULT_CANON_POLICY.allowPlayerProposals },
          requireProvenance: { type: 'boolean', default: DEFAULT_CANON_POLICY.requireProvenance }
        }
      };
    }

    // Validate + apply a partial policy update. Rejects unknown fields and
    // out-of-range/incorrect-typed values so a policy can never be corrupted.
    function setCanonPolicy(update) {
      const u = update && typeof update === 'object' && !Array.isArray(update) ? update : {};
      const errors = [];
      const changes = {};
      for (const key of Object.keys(u)) {
        if (!POLICY_FIELDS.includes(key)) { errors.push({ field: key, message: 'unknown-policy-field' }); continue; }
        const value = u[key];
        const current = canonPolicy[key];
        if (typeof current === 'boolean') {
          if (typeof value !== 'boolean') { errors.push({ field: key, message: 'expected-boolean' }); continue; }
        } else if (typeof current === 'number') {
          const n = Number(value);
          if (!Number.isFinite(n) || n < 1 || n > 10) { errors.push({ field: key, message: 'expected-integer-1-10' }); continue; }
        } else if (key === 'hardCanonMinAuthority') {
          if (!['player', 'gm', 'system'].includes(value)) { errors.push({ field: key, message: 'expected-authority-tier' }); continue; }
        } else if (key === 'conflictResolution') {
          if (!['newest', 'highest-authority', 'manual'].includes(value)) { errors.push({ field: key, message: 'expected-resolution-strategy' }); continue; }
        } else {
          if (typeof value !== 'string') { errors.push({ field: key, message: 'expected-string' }); continue; }
        }
        if (value !== current) { changes[key] = { from: current, to: value }; canonPolicy[key] = typeof current === 'number' ? Number(value) : value; }
      }
      if (errors.length) return { ok: false, reason: 'invalid-policy', errors };
      return { ok: true, policy: Object.assign({}, canonPolicy), changes };
    }

    function resetCanonPolicy() {
      canonPolicy = Object.assign({}, DEFAULT_CANON_POLICY);
      return { ok: true, policy: Object.assign({}, canonPolicy) };
    }

    // Apply the policy to a proposed canon write: returns whether it's allowed
    // and, if not, the policy rule that blocked it.
    function evaluateCanonPolicy(proposal) {
      const p = proposal && typeof proposal === 'object' ? proposal : {};
      const level = CANON_LEVELS.includes(p.level) ? p.level : 'SOFT';
      const authority = p.authority || 'player';
      if (level === 'HARD') {
        const tiers = { player: 0, gm: 1, system: 2 };
        const required = tiers[canonPolicy.hardCanonMinAuthority];
        if ((tiers[authority] || 0) < required) {
          return { allowed: false, blockedBy: 'hardCanonMinAuthority', required: canonPolicy.hardCanonMinAuthority, level, authority };
        }
      }
      if (canonPolicy.requireProvenance && !p.provenance) {
        return { allowed: false, blockedBy: 'requireProvenance', level, authority };
      }
      if (level !== 'HARD' && authority === 'player' && !canonPolicy.allowPlayerProposals) {
        return { allowed: false, blockedBy: 'allowPlayerProposals', level, authority };
      }
      return { allowed: true, policy: Object.assign({}, canonPolicy), level, authority };
    }

    // RPG-03-06: canon diff viewer — per-version change log reconstructed from history.
    function getDiff(id) {
      const entry = entries.get(id);
      if (!entry) return { ok: false, reason: 'not-found' };
      const hist = history.get(id) || [];
      const log = hist.map((h, idx) => ({
        version: idx + 1,
        action: h.action,
        author: h.author || 'system',
        timestamp: h.timestamp,
        changes: h.diff === undefined ? null : clone(h.diff)
      }));
      return { ok: true, id, currentVersion: entry.version || 1, log };
    }

    // Field-level diff between two canon entry shapes (used by merge preview + import mapping).
    function diffEntries(a, b) {
      const A = obj(a), B = obj(b);
      const keys = Array.from(new Set([...Object.keys(A), ...Object.keys(B)]));
      const changes = {};
      for (const k of keys) {
        const av = JSON.stringify(A[k]);
        const bv = JSON.stringify(B[k]);
        if (av !== bv) {
          changes[k] = { from: A[k] === undefined ? null : clone(A[k]), to: B[k] === undefined ? null : clone(B[k]) };
        }
      }
      return changes;
    }

    // RPG-03-13: canon merge preview — shows what merging two entries would produce,
    // flagging conflicting fields, without mutating either entry. Auto-generated
    // identity/metadata (id, version, createdAt, updatedAt, provenance timestamps)
    // are excluded so only substantive differences count as conflicts.
    function mergePreview(entryAId, entryBId) {
      const a = entries.get(entryAId), b = entries.get(entryBId);
      if (!a || !b) return { ok: false, reason: 'not-found' };
      const changes = diffEntries(a, b);
      const conflicts = Object.keys(changes).filter(k => k !== 'id' && k !== 'version' && k !== 'updatedAt' && k !== 'createdAt' && k !== 'provenance');
      return {
        ok: true,
        a: { id: a.id, level: a.level }, b: { id: b.id, level: b.level },
        changes, conflictCount: conflicts.length, conflicts,
        canMerge: conflicts.length === 0
      };
    }

    // RPG-03-15: canon recovery — restore a soft-deleted entry to active.
    function restoreEntry(id, author) {
      const entry = entries.get(id);
      if (!entry) return { ok: false, reason: 'not-found' };
      if (entry.status !== 'deleted') return { ok: false, reason: 'not-deleted' };
      const next = clone(entry);
      next.status = 'active';
      next.updatedAt = now();
      next.version = (entry.version || 1) + 1;
      entries.set(id, next);
      const historyArr = history.get(id) || [];
      historyArr.push({ action: 'restore', timestamp: now(), author: text(author) });
      history.set(id, historyArr);
      return { ok: true, entry: next };
    }

    // RPG-03-12: canon export — serialize all active entries to a portable pack.
    function exportCanon() {
      const all = Array.from(entries.values()).filter(e => e.status === 'active');
      return { format: 'seven-rpg-canon', version: 1, exportedAt: now(), count: all.length, entries: all.map(clone) };
    }

    // RPG-03-12: canon import — load entries from a pack with validation + id/provenance mapping.
    function importCanon(data, author) {
      const d = obj(data);
      const list = Array.isArray(d.entries) ? d.entries : [];
      if (d.format && d.format !== 'seven-rpg-canon') return { ok: false, reason: 'invalid-format' };
      let imported = 0, skipped = 0; const errors = [];
      for (const raw of list) {
        const i = obj(raw);
        if (!i.value || typeof i.value !== 'string') { skipped++; errors.push({ id: i.id || '?', reason: 'missing-value' }); continue; }
        const id = i.id || stableId('canon');
        const level = CANON_LEVELS.includes(i.level) ? i.level : 'SOFT';
        const entry = {
          id, level, value: i.value, entityIds: uniq(i.entityIds), tags: uniq(i.tags),
          public: i.public === true,
          availableAtTick: Number.isFinite(i.availableAtTick) ? i.availableAtTick : 0,
          confidence: Math.max(0, Math.min(1, Number(i.confidence) || 1)),
          sourceEventId: text(i.sourceEventId), supersedes: uniq(i.supersedes),
          status: 'active', createdAt: now(), updatedAt: now(), version: 1,
          provenance: { source: 'import', author: text(author), timestamp: now(), originalId: i.id }
        };
        entries.set(id, entry);
        history.set(id, [{ action: 'import', timestamp: now(), author: text(author), diff: entry }]);
        imported++;
      }
      return { ok: true, imported, skipped, errors };
    }

    return {
      CANON_LEVELS, CONFLICT_SEVERITY, PROVENANCE_TYPES,
      createEntry, getEntry, getAllEntries, updateEntry, deleteEntry, getHistory,
      checkConflict, getConflicts, resolveConflict, suggestResolution,
      getProvenance, addProvenance, auditCanon,
      getCanonPolicy, getPolicySchema, setCanonPolicy, resetCanonPolicy, evaluateCanonPolicy,
      getDiff, diffEntries, mergePreview, restoreEntry, exportCanon, importCanon,
      exportState, importState
    };

    function exportState() {
      return {
        version: 1,
        counters: { id: idCounter },
        entries: clone(mapsToPlain(Object.fromEntries(entries))),
        conflicts: clone(mapsToPlain(Object.fromEntries(conflicts))),
        history: clone(mapsToPlain(Object.fromEntries(history))),
        provenance: clone(mapsToPlain(Object.fromEntries(provenance))),
        state: { canonPolicy: clone(canonPolicy) }
      };
    }

    function importState(data) {
      const d = obj(data);
      entries.clear();
      for (const [k, v] of Object.entries(obj(d.entries))) entries.set(k, plainToMaps(v));
      conflicts.clear();
      for (const [k, v] of Object.entries(obj(d.conflicts))) conflicts.set(k, plainToMaps(v));
      history.clear();
      for (const [k, v] of Object.entries(obj(d.history))) history.set(k, plainToMaps(v));
      provenance.clear();
      for (const [k, v] of Object.entries(obj(d.provenance))) provenance.set(k, plainToMaps(v));
      const restoredPolicy = obj(obj(d.state).canonPolicy);
      if (Object.keys(restoredPolicy).length && setCanonPolicy(restoredPolicy).ok) { /* restored */ }
      else resetCanonPolicy();
      idCounter = Math.max(idCounter, Number(obj(d.counters).id || 0));
      return { ok: true, restored: entries.size + conflicts.size + history.size + provenance.size };
    }
  }

  return { createCanonContinuity };
});