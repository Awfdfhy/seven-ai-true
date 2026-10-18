(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgGmTools = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }
  function uniq(xs) { return Array.from(new Set(arr(xs).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))); }
  function stableId(prefix, n) { return prefix + '-' + String(n).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }
  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // Persistence helpers. Maps (including Maps nested inside records) cannot
  // survive JSON, so they are tagged with a __map wrapper on the way out and
  // rebuilt on the way in.
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
  // Replaces every entry of a closure Map from an exported payload, accepting
  // either the {__map:...} shape or a bare object. Returns the entry count.
  function restoreMap(target, payload) {
    target.clear();
    const restored = plainToMaps(payload);
    if (restored instanceof Map) {
      for (const [k, v] of restored) target.set(k, v);
    } else {
      for (const [k, v] of Object.entries(restored)) target.set(k, v);
    }
    return target.size;
  }

  const NOTE_TYPES = Object.freeze(['general', 'plot', 'npc', 'location', 'secret', 'timeline', 'rule', 'idea']);
  const VISIBILITY = Object.freeze(['gm-only', 'players', 'party', 'public']);

  function createGmTools(stateApi, storyGenApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const notes = new Map();
    const timelines = new Map();
    const npcs = new Map();
    let gmState = { sessionId: null, worldId: null, lastUpdated: now() };
    const lastIdNums = new Map();

    // Collision-safe monotonic id: Date.now() alone repeats within the same
    // millisecond (or when the clock moves back), which silently overwrote the
    // earlier record stored under that id. Tracks the last numeric id per
    // prefix so auto-generated ids never repeat inside this manager.
    function nextId(prefix, isTaken) {
      let n = Date.now();
      const last = lastIdNums.get(prefix) || 0;
      if (n <= last) n = last + 1;
      let id = stableId(prefix, n);
      if (typeof isTaken === 'function') { while (isTaken(id)) { n += 1; id = stableId(prefix, n); } }
      lastIdNums.set(prefix, n);
      return id;
    }

    function setSession(sessionId, worldId) {
      gmState.sessionId = sessionId;
      gmState.worldId = worldId;
      gmState.lastUpdated = now();
    }

    function createNote(input) {
      const i = obj(input);
      const id = i.id || nextId('note', key => notes.has(key));
      const type = NOTE_TYPES.includes(i.type) ? i.type : 'general';
      const visibility = VISIBILITY.includes(i.visibility) ? i.visibility : 'gm-only';
      const tags = uniq(i.tags);
      const linkedEntities = uniq(i.linkedEntities);

      const note = {
        id, title: text(i.title), content: text(i.content),
        type, visibility, tags, linkedEntities,
        createdAt: now(), updatedAt: now(), version: 1
      };
      notes.set(id, note);
      return note;
    }

    function updateNote(id, updates) {
      const note = notes.get(id);
      if (!note) return { ok: false, reason: 'not-found' };
      const next = clone(note);
      if (updates.title !== undefined) next.title = text(updates.title);
      if (updates.content !== undefined) next.content = text(updates.content);
      if (updates.type !== undefined && NOTE_TYPES.includes(updates.type)) next.type = updates.type;
      if (updates.visibility !== undefined && VISIBILITY.includes(updates.visibility)) next.visibility = updates.visibility;
      if (updates.tags !== undefined) next.tags = uniq(updates.tags);
      if (updates.linkedEntities !== undefined) next.linkedEntities = uniq(updates.linkedEntities);
      next.updatedAt = now();
      next.version = (note.version || 1) + 1;
      notes.set(id, next);
      return { ok: true, note: next };
    }

    function deleteNote(id) {
      return notes.delete(id);
    }

    function getNote(id) {
      return notes.get(id);
    }

    function getNotes(filter) {
      const f = obj(filter);
      let result = Array.from(notes.values());
      if (f.type) result = result.filter(n => n.type === f.type);
      if (f.visibility) result = result.filter(n => n.visibility === f.visibility);
      if (f.tag) result = result.filter(n => n.tags.includes(f.tag));
      if (f.linkedEntity) result = result.filter(n => n.linkedEntities.includes(f.linkedEntity));
      if (f.search) {
        const q = f.search.toLowerCase();
        result = result.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
      }
      return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    function createTimelineEvent(input) {
      const i = obj(input);
      const id = i.id || nextId('event');
      const timelineId = i.timelineId || 'main';
      const timestamp = i.timestamp || now();
      const type = text(i.type) || 'event';
      const description = text(i.description);
      const participants = uniq(i.participants);
      const location = text(i.location);
      const visibility = VISIBILITY.includes(i.visibility) ? i.visibility : 'gm-only';
      const tags = uniq(i.tags);
      const metadata = obj(i.metadata);

      const event = {
        id, timelineId, timestamp, type, description,
        participants, location, visibility, tags, metadata,
        createdAt: now()
      };

      if (!timelines.has(timelineId)) timelines.set(timelineId, []);
      timelines.get(timelineId).push(event);
      timelines.get(timelineId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      return event;
    }

    function getTimeline(timelineId) {
      return timelines.get(timelineId) || [];
    }

    function getTimelineRange(timelineId, from, to) {
      const events = timelines.get(timelineId) || [];
      return events.filter(e => e.timestamp >= from && e.timestamp <= to);
    }

    function registerNpc(input) {
      const i = obj(input);
      const id = i.id || nextId('npc', key => npcs.has(key));
      const name = text(i.name);
      const role = text(i.role);
      const location = text(i.location);
      const disposition = text(i.disposition) || 'neutral';
      const secrets = arr(i.secrets);
      const knowledge = arr(i.knowledge);
      const schedule = arr(i.schedule);
      const stats = obj(i.stats);
      const inventory = arr(i.inventory);
      const relationships = obj(i.relationships);
      const plotHooks = arr(i.plotHooks);
      const metadata = obj(i.metadata);

      const npc = {
        id, name, role, location, disposition,
        secrets, knowledge, schedule, stats, inventory,
        relationships, plotHooks, metadata,
        createdAt: now(), updatedAt: now(), version: 1
      };
      npcs.set(id, npc);
      return npc;
    }

    function updateNpc(id, updates) {
      const npc = npcs.get(id);
      if (!npc) return { ok: false, reason: 'not-found' };
      const next = clone(npc);
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'createdAt' && key !== 'version') {
          next[key] = value;
        }
      }
      next.updatedAt = now();
      next.version = (npc.version || 1) + 1;
      npcs.set(id, next);
      return { ok: true, npc: next };
    }

    function getNpc(id) {
      return npcs.get(id);
    }

    function getNpcsAtLocation(location) {
      return Array.from(npcs.values()).filter(n => n.location === location);
    }

    function getNpcsByDisposition(disposition) {
      return Array.from(npcs.values()).filter(n => n.disposition === disposition);
    }

    function generateSessionPlan(state, options) {
      const opts = obj(options);
      const duration = Math.max(1, Number(opts.durationHours) || 4);
      const focus = opts.focus || 'balanced';

      const hooks = [];
      const encounters = [];
      const plotPoints = [];

      // Generate story hooks
      for (let i = 0; i < 3; i++) {
        hooks.push({
          type: 'hook',
          description: generateStoryHook(state, { archetype: pickRandom(['hero_journey', 'mystery', 'exploration']) }),
          priority: i === 0 ? 'primary' : 'secondary'
        });
      }

      // Generate encounters based on duration
      const encounterCount = Math.max(1, Math.floor(duration / 1.5));
      for (let i = 0; i < encounterCount; i++) {
        const encType = pickRandom(['combat', 'social', 'exploration', 'puzzle']);
        encounters.push({
          type: 'encounter',
          subtype: encType,
          description: generateEncounterDescription(state, encType),
          estimatedDuration: Math.floor(Math.random() * 45) + 15,
          difficulty: pickRandom(['easy', 'moderate', 'hard'])
        });
      }

      // Generate plot points
      for (let i = 0; i < 2; i++) {
        plotPoints.push({
          type: 'plot',
          description: pickRandom([
            'Reveal a secret about the main villain',
            'Introduce a new ally with hidden motives',
            'Reveal a clue about the main quest',
            'Create a moral dilemma for the party',
            'Introduce a rival faction'
          ]),
          trigger: pickRandom(['time', 'location', 'dialogue', 'item', 'roll'])
        });
      }

      return {
        sessionId: nextId('session'),
        plannedDuration: duration,
        focus,
        hooks,
        encounters,
        plotPoints,
        createdAt: now()
      };
    }

    function generateEncounterDescription(state, type) {
      const templates = {
        combat: ['A {{enemy}} blocks the path', 'Ambushed by {{enemy}}', 'A {{enemy}} challenges the party'],
        social: ['A {{npc}} demands answers', 'A merchant offers a deal', 'A guard questions the party'],
        exploration: ['The party finds {{discovery}}', 'A hidden path reveals {{location}}', 'Ancient ruins hold {{secret}}'],
        puzzle: ['A riddle blocks the way', 'A mechanism requires {{solution}}', 'Runes must be deciphered']
      };
      const tpl = pickRandom((templates[type] || templates.combat));
      return tpl
        .replace('{{enemy}}', pickRandom(['goblin', 'bandit', 'wolf', 'spirit']))
        .replace('{{npc}}', pickRandom(['merchant', 'guard', 'noble', 'beggar']))
        .replace('{{discovery}}', pickRandom(['hidden chamber', 'ancient artifact', 'secret passage']))
        .replace('{{location}}', pickRandom(['ruined temple', 'dark cave', 'abandoned tower']))
        .replace('{{secret}}', pickRandom(['forgotten lore', 'hidden treasure', 'ancient curse']))
        .replace('{{solution}}', pickRandom(['correct sequence', 'specific item', 'magical word']));
    }

    function trackInitiative(participants) {
      const mapped = arr(participants).map((p, i) => ({
        id: p.id || stableId('init', i),
        name: p.name || `Combatant ${i + 1}`,
        initiative: p.initiative || Math.floor(Math.random() * 20) + 1,
        hp: p.hp || 100,
        maxHp: p.maxHp || 100,
        conditions: arr(p.conditions),
        turn: 0
      }));
      const init = mapped.sort((a, b) => b.initiative - a.initiative);
      return { round: 1, current: 0, participants: init };
    }

    function nextTurn(initiative) {
      const next = clone(initiative);
      next.current = (next.current + 1) % next.participants.length;
      if (next.current === 0) next.round += 1;
      next.participants[next.current].turn += 1;
      return next;
    }

    function applyDamage(initiative, targetId, damage) {
      const next = clone(initiative);
      const idx = next.participants.findIndex(p => p.id === targetId);
      if (idx >= 0) {
        next.participants[idx].hp = Math.max(0, next.participants[idx].hp - damage);
      }
      return next;
    }

    function addCondition(initiative, targetId, condition) {
      const next = clone(initiative);
      const idx = next.participants.findIndex(p => p.id === targetId);
      if (idx >= 0 && !next.participants[idx].conditions.includes(condition)) {
        next.participants[idx].conditions.push(condition);
      }
      return next;
    }

    function generateLoot(encounterLevel, type) {
      const lootTables = {
        common: ['gold (1d10)', 'rations', 'rope', 'torch'],
        uncommon: ['potion of healing', 'scroll of identify', 'silvered weapon', 'gem (50gp)'],
        rare: ['potion of greater healing', 'scroll of fireball', '+1 weapon', 'gem (500gp)'],
        legendary: ['artifact', 'spellbook', '+2 armor', 'wish scroll']
      };
      const table = lootTables[type] || lootTables.common;
      const count = Math.floor(Math.random() * 3) + 1;
      const loot = [];
      for (let i = 0; i < count; i++) {
        loot.push(pickRandom(table));
      }
      return loot;
    }

    function generateStoryHook(state, options) {
      const hooks = [
        'A mysterious stranger arrives with a desperate plea for help.',
        'An ancient prophecy names the party as the world\'s only hope.',
        'The party\'s homeland is threatened by a rising darkness.',
        'A noble is found dead under impossible circumstances.',
        'A valuable artifact vanishes from a sealed vault.',
        'Strange symbols appear on buildings throughout the city.',
        'The villain who destroyed the party\'s home resurfaces.',
        'A betrayed ally seeks vengeance against the party.',
        'An old enemy returns with terrifying new power.',
        'A fallen hero seeks a chance to atone for past sins.',
        'A villain offers a surprising path to redemption.',
        'A magical mishap causes hilarious misunderstandings.',
        'An ancient map reveals a lost civilization.',
        'A new continent is discovered across the sea.',
        'A portal opens to a realm of wonder and danger.',
        'A royal succession crisis threatens civil war.',
        'The party is framed for a crime they didn\'t commit.',
        'Secret societies vie for control of the kingdom.',
        'The party is stranded in a hostile wilderness.',
        'A magical catastrophe cuts off all supply lines.'
      ];
      return pickRandom(hooks);
    }

    // Persistence seam: everything this manager keeps in closure scope. There is
    // no sequential idCounter here - ids are Date.now()-based and the monotonic
    // guard lives in the lastIdNums map - so counters.id carries the highest
    // numeric id minted so far and is re-applied as a floor after restore.
    function exportState() {
      return {
        version: 1,
        counters: { id: Math.max(0, ...lastIdNums.values()) },
        notes: clone(mapsToPlain(notes)),
        timelines: clone(mapsToPlain(timelines)),
        npcs: clone(mapsToPlain(npcs)),
        lastIdNums: clone(mapsToPlain(lastIdNums)),
        state: clone(mapsToPlain({ gmState }))
      };
    }

    function importState(data) {
      const d = obj(data);
      // lastIdNums is the monotonic id guard, not user data: a stale snapshot
      // must never lower it, so the live high-water mark per prefix is kept.
      const liveIdNums = new Map(lastIdNums);
      const restoredByKey = {
        notes: restoreMap(notes, obj(d.notes)),
        timelines: restoreMap(timelines, obj(d.timelines)),
        npcs: restoreMap(npcs, obj(d.npcs)),
        lastIdNums: restoreMap(lastIdNums, obj(d.lastIdNums))
      };
      const floor = Number(obj(d.counters).id || 0) || 0;
      for (const prefix of new Set([...liveIdNums.keys(), ...lastIdNums.keys()])) {
        lastIdNums.set(prefix, Math.max(Number(liveIdNums.get(prefix)) || 0, Number(lastIdNums.get(prefix)) || 0, floor));
      }
      const g = obj(obj(d.state).gmState);
      gmState.sessionId = g.sessionId == null ? null : g.sessionId;
      gmState.worldId = g.worldId == null ? null : g.worldId;
      gmState.lastUpdated = text(g.lastUpdated) || now();
      // lastIdNums is id bookkeeping, so it is not counted as restored data.
      const restored = restoredByKey.notes + restoredByKey.timelines + restoredByKey.npcs;
      return { ok: true, restored, restoredByKey };
    }

    return {
      exportState, importState,
      NOTE_TYPES, VISIBILITY,
      setSession, createNote, updateNote, deleteNote, getNote, getNotes,
      createTimelineEvent, getTimeline, getTimelineRange,
      registerNpc, updateNpc, getNpc, getNpcsAtLocation, getNpcsByDisposition,
      generateSessionPlan, trackInitiative, nextTurn, applyDamage, addCondition,
      generateLoot, generateStoryHook
    };
  }

  return { createGmTools };
});