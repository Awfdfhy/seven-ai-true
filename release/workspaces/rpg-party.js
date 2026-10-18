(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgParty = api;
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
  function stableId(prefix, n) { return prefix + '-' + String(n).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }

  const PARTY_ROLES = Object.freeze(['leader', 'tank', 'healer', 'damage', 'support', 'scout', 'face']);
  const PARTY_FORMATION = Object.freeze(['standard', 'defensive', 'aggressive', 'stealth', 'travel']);
  const MAX_PARTY_SIZE = 6;

  function createPartyManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const lastIdNums = new Map();

    // Collision-safe monotonic id: Date.now() repeats within the same
    // millisecond, which could hand two created records the same id.
    function nextId(prefix, isTaken) {
      let n = Date.now();
      const last = lastIdNums.get(prefix) || 0;
      if (n <= last) n = last + 1;
      let id = stableId(prefix, n);
      if (typeof isTaken === 'function') { while (isTaken(id)) { n += 1; id = stableId(prefix, n); } }
      lastIdNums.set(prefix, n);
      return id;
    }

    function createParty(input) {
      const i = obj(input);
      const id = i.id || nextId('party');
      const name = text(i.name) || 'Unnamed Party';
      const memberIds = uniq(i.memberIds);
      const formation = PARTY_FORMATION.includes(i.formation) ? i.formation : 'standard';
      const roles = obj(i.roles);
      const sharedResources = obj(i.sharedResources);
      const tactics = arr(i.tactics);
      const flags = obj(i.flags);

      return {
        id, name, memberIds, formation, roles,
        sharedResources, tactics, flags,
        createdAt: now(), updatedAt: now(),
        version: 1
      };
    }

    function validateParty(state, party) {
      const issues = [];
      if (!party.memberIds.length) issues.push({ code: 'empty-party', severity: 'error' });
      if (party.memberIds.length > MAX_PARTY_SIZE) issues.push({ code: 'oversized-party', severity: 'error' });
      for (const charId of party.memberIds) {
        const char = state.characters?.[charId];
        if (!char) issues.push({ code: 'missing-character', severity: 'error', characterId: charId });
        else if (char.control === 'player' && party.memberIds.filter(id => state.characters?.[id]?.control === 'player').length > 1) {
          issues.push({ code: 'multiple-player-characters', severity: 'warn', characterId: charId });
        }
      }
      if (!PARTY_ROLES.includes(party.formation)) issues.push({ code: 'invalid-formation', severity: 'warn' });
      for (const [charId, role] of Object.entries(party.roles)) {
        if (!PARTY_ROLES.includes(role)) issues.push({ code: 'invalid-role', severity: 'error', characterId: charId, role });
        if (!party.memberIds.includes(charId)) issues.push({ code: 'role-for-non-member', severity: 'warn', characterId: charId });
      }
      return { valid: !issues.some(x => x.severity === 'error'), issues };
    }

    function addMember(state, party, characterId) {
      if (party.memberIds.includes(characterId)) return { ok: false, reason: 'already-member' };
      if (party.memberIds.length >= MAX_PARTY_SIZE) return { ok: false, reason: 'party-full' };
      const char = state.characters?.[characterId];
      if (!char) return { ok: false, reason: 'character-not-found' };
      const next = clone(party);
      next.memberIds.push(characterId);
      next.updatedAt = now();
      next.version = (next.version || 1) + 1;
      return { ok: true, party: next };
    }

    function removeMember(party, characterId) {
      if (!party.memberIds.includes(characterId)) return { ok: false, reason: 'not-member' };
      const next = clone(party);
      next.memberIds = next.memberIds.filter(id => id !== characterId);
      delete next.roles[characterId];
      next.updatedAt = now();
      next.version = (next.version || 1) + 1;
      return { ok: true, party: next };
    }

    function setFormation(party, formation) {
      if (!PARTY_FORMATION.includes(formation)) return { ok: false, reason: 'invalid-formation' };
      const next = clone(party);
      next.formation = formation;
      next.updatedAt = now();
      next.version = (next.version || 1) + 1;
      return { ok: true, party: next };
    }

    function assignRole(party, characterId, role) {
      if (!party.memberIds.includes(characterId)) return { ok: false, reason: 'not-member' };
      if (!PARTY_ROLES.includes(role)) return { ok: false, reason: 'invalid-role' };
      const next = clone(party);
      next.roles[characterId] = role;
      next.updatedAt = now();
      next.version = (next.version || 1) + 1;
      return { ok: true, party: next };
    }

    function shareResource(party, resourceId, quantity) {
      const next = clone(party);
      next.sharedResources[resourceId] = (next.sharedResources[resourceId] || 0) + (quantity || 1);
      next.updatedAt = now();
      next.version = (next.version || 1) + 1;
      return { ok: true, party: next };
    }

    function consumeResource(party, resourceId, quantity) {
      const current = party.sharedResources[resourceId] || 0;
      if (current < (quantity || 1)) return { ok: false, reason: 'insufficient-resources' };
      const next = clone(party);
      next.sharedResources[resourceId] = current - (quantity || 1);
      if (next.sharedResources[resourceId] === 0) delete next.sharedResources[resourceId];
      next.updatedAt = now();
      next.version = (next.version || 1) + 1;
      return { ok: true, party: next };
    }

    function addTactic(party, tactic) {
      const t = obj(tactic);
      if (!t.id || !t.name) return { ok: false, reason: 'invalid-tactic' };
      const next = clone(party);
      if (!next.tactics.some(x => x.id === t.id)) {
        next.tactics.push({ id: t.id, name: t.name, description: text(t.description), trigger: text(t.trigger), actions: arr(t.actions), priority: Number(t.priority) || 0 });
        next.tactics.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      }
      next.updatedAt = now();
      next.version = (next.version || 1) + 1;
      return { ok: true, party: next };
    }

    function evaluateTactics(state, party) {
      return party.tactics.filter(t => {
        if (t.trigger === 'combat-start') return true;
        if (t.trigger === 'low-health') return party.memberIds.some(id => {
          const c = state.characters?.[id];
          return c && c.injuries && c.injuries.length > 0;
        });
        if (t.trigger === 'enemy-spotted') return true;
        return false;
      }).map(t => ({ tacticId: t.id, actions: t.actions }));
    }

    function getPartyStats(state, party) {
      const members = party.memberIds.map(id => state.characters?.[id]).filter(Boolean);
      const roles = {};
      for (const [charId, role] of Object.entries(party.roles)) roles[role] = (roles[role] || 0) + 1;
      const stats = {
        size: party.memberIds.length,
        maxSize: MAX_PARTY_SIZE,
        formation: party.formation,
        roles,
        avgLevel: members.length ? members.reduce((sum, c) => sum + (c.level || 1), 0) / members.length : 1,
        totalHP: members.reduce((sum, c) => sum + (c.stats?.hp || 100), 0),
        totalMP: members.reduce((sum, c) => sum + (c.stats?.mp || 50), 0),
        hasHealer: party.memberIds.some(id => party.roles[id] === 'healer'),
        hasTank: party.memberIds.some(id => party.roles[id] === 'tank'),
        sharedResources: clone(party.sharedResources),
        tacticCount: party.tactics.length
      };
      return stats;
    }

    function canPartyAct(state, party, actionType) {
      const members = party.memberIds.map(id => state.characters?.[id]).filter(Boolean);
      if (!members.length) return { allowed: false, reason: 'no-members' };
      if (actionType === 'travel') return { allowed: true };
      if (actionType === 'combat') return { allowed: members.some(c => c.status === 'active'), reason: members.some(c => c.status === 'active') ? null : 'all-incapacitated' };
      if (actionType === 'rest') return { allowed: true };
      return { allowed: true };
    }

    return {
      PARTY_ROLES, PARTY_FORMATION, MAX_PARTY_SIZE,
      createParty, validateParty, addMember, removeMember,
      setFormation, assignRole, shareResource, consumeResource,
      addTactic, evaluateTactics, getPartyStats, canPartyAct,
      exportState, importState
    };

    // `createParty` is a pure factory: parties are plain objects handed back to
    // the caller and never retained by the manager, so `lastIdNums` (the id
    // allocator's monotonic watermark, keyed by prefix) is the manager's only
    // closure state. There is no `idCounter` to restore here.
    function exportState() {
      return {
        version: 1,
        lastIdNums: clone(mapsToPlain(Object.fromEntries(lastIdNums)))
      };
    }

    function importState(data) {
      const d = obj(data);
      lastIdNums.clear();
      for (const [k, v] of Object.entries(obj(d.lastIdNums))) lastIdNums.set(k, Number(v) || 0);
      return { ok: true, restored: lastIdNums.size };
    }
  }

  return { createPartyManager };
});