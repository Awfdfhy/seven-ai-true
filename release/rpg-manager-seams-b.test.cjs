'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Advanced = require('./workspaces/rpg-advanced.js');
const Combat = require('./workspaces/rpg-combat.js');
const GmTools = require('./workspaces/rpg-gm-tools.js');
const EventSched = require('./workspaces/rpg-event-scheduler.js');
const Memory = require('./workspaces/rpg-memory.js');

// Simulates a server DB round-trip: whatever exportState() returns must
// survive a JSON serialize/deserialize cycle unchanged.
function dbRoundTrip(data) {
  return JSON.parse(JSON.stringify(data));
}

// rpg-memory takes an injected runtime holding its bulk data; this stub mirrors
// the one used by rpg-memory.test.cjs.
const mem = { objects: [] };
const runtime = {
  hash: s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); },
  lineage: (source, transformation, parentRefs = []) => ({ source, transformation, parentRefs }),
  readMemory: () => ({ version: 1, objects: mem.objects.map(x => JSON.parse(JSON.stringify(x))), events: [] }),
  createMemory: (content, type, opts) => ({ id: opts.id, content, type, version: 1, createdAt: Date.now(), scope: opts.scope, source: opts.source, provenance: { source: 'rpg' }, authority: { originAuthority: 'rpg', authorityClass: 'derived' }, evidenceRefs: [], relationRefs: [], policy: {} }),
  commitMemory: (obj, op) => {
    const i = mem.objects.findIndex(x => x.id === obj.id);
    if (op === 'CREATE') { if (i >= 0) return false; mem.objects.push(JSON.parse(JSON.stringify(obj))); return true; }
    if (op === 'UPDATE') { if (i < 0) return false; mem.objects[i] = JSON.parse(JSON.stringify(obj)); return true; }
    if (op === 'DELETE') { if (i < 0) return false; mem.objects.splice(i, 1); return true; }
    return false;
  }
};

const memSeed = {
  sessionId: 'seam-mem', worldId: 'valen-seam',
  turn: 3, timeline: { tick: 2 },
  world: { locations: { capital: { name: 'Capital', description: 'The royal capital' } } },
  characters: { hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' } } },
  quests: {}, canon: { entries: {} }
};

// Each descriptor pins the closure-scoped maps the seam must export, plus
// helpers to seed one identifiable entity, read it back through a public
// getter, and mint auto-id entities.
const MANAGERS = [
  {
    name: 'advanced',
    create: () => Advanced.createAdvancedManager(State),
    maps: ['plugins', 'rumors', 'scenarioPacks', 'questNodes', 'atlasEntries', 'voiceCatalog'],
    stateKeys: ['analyticsEvents', 'rngState'],
    seedIdentity(m) {
      const p = m.registerPlugin({
        id: 'seam-plugin-1', name: 'Seam Plugin', version: '2.1.0',
        capabilities: ['read-state', 'emit-event'], trusted: true
      });
      return {
        key: 'seam-plugin-1',
        fields: { id: p.id, name: p.name, version: p.version, capabilities: p.capabilities, trusted: p.trusted, enabled: p.enabled }
      };
    },
    read(m, key) {
      const p = m.getPlugin(key);
      return p && { id: p.id, name: p.name, version: p.version, capabilities: p.capabilities, trusted: p.trusted, enabled: p.enabled };
    },
    mintId(m) { return m.registerPlugin({ name: 'Auto Plugin' }).id; }
  },
  {
    name: 'combat',
    create: () => Combat.createCombatManager(State),
    maps: ['encounters', 'combatants', 'combatLog', 'balanceProfiles', 'combatEffects'],
    stateKeys: ['rngState'],
    seedIdentity(m) {
      const e = m.createEncounter({
        id: 'seam-enc-1', name: 'Seam Encounter', difficulty: 'hard', locationId: 'ruins'
      });
      return {
        key: 'seam-enc-1',
        fields: { id: e.id, name: e.name, status: e.status, round: e.round, difficulty: e.difficulty, locationId: e.locationId, retreatAllowed: e.retreatAllowed }
      };
    },
    read(m, key) {
      const e = m.getEncounter(key);
      return e && { id: e.id, name: e.name, status: e.status, round: e.round, difficulty: e.difficulty, locationId: e.locationId, retreatAllowed: e.retreatAllowed };
    },
    mintId(m) { return m.createEncounter({ name: 'Auto Encounter' }).id; }
  },
  {
    name: 'gm-tools',
    create: () => GmTools.createGmTools(State),
    maps: ['notes', 'timelines', 'npcs', 'lastIdNums'],
    stateKeys: ['gmState'],
    seedIdentity(m) {
      const n = m.createNote({
        id: 'seam-note-1', title: 'Seam Note', content: 'seam body',
        type: 'plot', visibility: 'party', tags: ['seam', 'test']
      });
      return {
        key: 'seam-note-1',
        fields: { id: n.id, title: n.title, content: n.content, type: n.type, visibility: n.visibility, tags: n.tags, linkedEntities: n.linkedEntities, version: n.version }
      };
    },
    read(m, key) {
      const n = m.getNote(key);
      return n && { id: n.id, title: n.title, content: n.content, type: n.type, visibility: n.visibility, tags: n.tags, linkedEntities: n.linkedEntities, version: n.version };
    },
    mintId(m) { return m.createNote({ title: 'Auto Note' }).id; }
  },
  {
    name: 'event-scheduler',
    create: () => EventSched.createEventScheduler(State),
    maps: ['events', 'timers', 'lastIdNums'],
    stateKeys: [],
    seedIdentity(m) {
      const e = m.createEvent({
        id: 'seam-evt-1', title: 'Seam Event', type: 'quest_event',
        priority: 'high', location: 'capital', tags: ['seam']
      });
      return {
        key: 'seam-evt-1',
        fields: { id: e.id, title: e.title, type: e.type, priority: e.priority, location: e.location, tags: e.tags, recurrence: e.recurrence, enabled: e.enabled, triggerCount: e.triggerCount }
      };
    },
    read(m, key) {
      const e = m.getEvent(key);
      return e && { id: e.id, title: e.title, type: e.type, priority: e.priority, location: e.location, tags: e.tags, recurrence: e.recurrence, enabled: e.enabled, triggerCount: e.triggerCount };
    },
    mintId(m) { return m.createEvent({ title: 'Auto Event' }).id; }
  },
  {
    name: 'memory',
    create: () => Memory.createMemoryManager(State, runtime),
    maps: ['memoryStore'],
    stateKeys: [],
    // rpg-memory never writes its closure Map from a public method (its bulk
    // data lives in the injected runtime), so it has no id-minting API and its
    // round-trip is covered by its own block below instead.
    counterOnly: true
  }
];

console.log('Testing RPG manager persistence seams (set B)...');

let n = 0;

console.log('\n1. exportState() on a fresh manager exposes every closure map...');
for (const spec of MANAGERS) {
  const m = spec.create();
  const state = m.exportState();
  assert.equal(state.version, 1, spec.name + ' version');
  assert.equal(typeof state.counters.id, 'number', spec.name + ' counters.id');
  for (const key of spec.maps) {
    assert.ok(key in state, spec.name + ' missing export key: ' + key);
    assert.equal(typeof state[key], 'object', spec.name + ' export key not an object: ' + key);
    assert.notEqual(state[key], null, spec.name + ' export key is null: ' + key);
    assert.ok(state[key].__map, spec.name + ' export key not tagged as a Map: ' + key);
  }
  if (spec.stateKeys.length > 0) {
    assert.ok('state' in state, spec.name + ' missing state key');
    for (const key of spec.stateKeys) {
      assert.ok(key in state.state, spec.name + ' missing state field: ' + key);
    }
  }
  console.log('  PASS ' + spec.name + ' (' + spec.maps.length + ' maps' +
    (spec.stateKeys.length ? ', state: ' + spec.stateKeys.join(',') : '') + ')');
}

console.log('\n2. export -> JSON round-trip -> importState into a FRESH manager...');
for (const spec of MANAGERS) {
  if (spec.counterOnly) continue;
  const source = spec.create();
  const seeded = spec.seedIdentity(source);
  const snapshot = dbRoundTrip(source.exportState());

  const target = spec.create();
  const res = target.importState(snapshot);
  assert.equal(res.ok, true, spec.name + ' import ok');
  const totalInSnapshot = Object.keys(snapshot[spec.maps[0]].__map).length;
  assert.ok(res.restored >= totalInSnapshot, spec.name + ' restored below primary map size');
  assert.equal(res.restored, Object.values(res.restoredByKey)
    .filter((_, k) => k !== 'lastIdNums') // id bookkeeping, not restored data
    .reduce((a, b) => a + b, 0), spec.name + ' restored is the sum of restoredByKey');
  assert.deepStrictEqual(spec.read(target, seeded.key), seeded.fields, spec.name + ' round-tripped entity');
  console.log('  PASS ' + spec.name + ' (' + seeded.key + ', restored=' + res.restored + ')');
}

console.log('\n2b. rpg-memory: runtime-backed data survives the seam...');
{
  const source = Memory.createMemoryManager(State, runtime);
  const state = State.createState(memSeed);
  const event = { id: 'seam-evt-mem-1', type: 'character.move', summary: 'Hero walks to the capital', actorId: 'hero', payload: { characterId: 'hero', toLocationId: 'capital' } };
  const committed = source.recordMemoriesFromEvent(state, event);
  assert.ok(committed.length > 0, 'memory committed nothing to the runtime');

  const snapshot = dbRoundTrip(source.exportState());
  const target = Memory.createMemoryManager(State, runtime);
  const res = target.importState(snapshot);
  assert.equal(res.ok, true, 'memory import ok');
  assert.equal(res.restored, 0, 'memoryStore is never written by a public method');

  const before = source.getMemoryStats(state);
  const after = target.getMemoryStats(state);
  assert.deepStrictEqual(after, before, 'memory stats changed across the seam');
  assert.deepStrictEqual(before.byKind, after.byKind, 'memory kinds changed across the seam');

  // The same entity is readable after the round-trip, matched on the canonical
  // key the manager itself minted. (getMemoryStats/getCharacterMemories count
  // 0 here in every wiring: recordMemoriesFromEvent never hands scopeRef or
  // metadata to runtime.createMemory. Pre-existing coupling, not seam behaviour -
  // hence the assertions compare the two managers rather than a non-zero total.)
  const firstKey = committed[0].canonicalKey;
  const stored = runtime.readMemory().objects.filter(o => o.id === firstKey);
  assert.equal(stored.length, 1, 'committed memory not readable under its canonical key');
  assert.equal(stored[0].content, committed[0].content, 'memory content lost');
  assert.equal(stored[0].type, committed[0].kind, 'memory kind lost');

  const cleared = target.importState({});
  assert.equal(cleared.restored, 0, 'memory clear restored');
  assert.deepStrictEqual(target.getMemoryStats(state), before, 'memory seam must not destroy runtime data');
  assert.equal(runtime.readMemory().objects.filter(o => o.id === firstKey).length, 1, 'runtime memory destroyed by importState({})');

  // A non-empty memoryStore payload must survive JSON and a second export.
  const injected = { version: 1, counters: { id: 3 }, memoryStore: { __map: { 'legacy-key': { id: 'legacy-key', kind: 'Semantic', content: '{}' } } } };
  const t2 = Memory.createMemoryManager(State, runtime);
  t2.importState(dbRoundTrip(injected));
  t2.importState(dbRoundTrip(t2.exportState()));
  assert.equal(t2.exportState().counters.id, 3, 'memory counter not restored');
  assert.deepStrictEqual(t2.exportState().memoryStore.__map, injected.memoryStore.__map, 'memoryStore did not round-trip');
  assert.equal(t2.importState({}).restored, 0, 'memoryStore clear restored');
  assert.deepStrictEqual(t2.exportState().memoryStore, { __map: {} }, 'memoryStore not cleared');
  console.log('  PASS memory (' + committed.length + ' committed memories, runtime untouched, memoryStore round-trips)');
}

console.log('\n3. importState({}) clears the maps and reports restored 0...');
for (const spec of MANAGERS) {
  const source = spec.create();
  const snapshot = dbRoundTrip(source.exportState());
  if (!spec.counterOnly) spec.seedIdentity(source);

  const target = spec.create();
  target.importState(snapshot);

  const cleared = target.importState({});
  assert.equal(cleared.ok, true, spec.name + ' clear ok');
  assert.equal(cleared.restored, 0, spec.name + ' clear restored');
  for (const key of spec.maps) {
    assert.deepStrictEqual(target.exportState()[key], { __map: {} }, spec.name + ' map not cleared: ' + key);
  }
  if (!spec.counterOnly) {
    assert.ok(!spec.read(target, spec.seedIdentity(spec.create()).key), spec.name + ' entity survived clear');
  }
  if (spec.stateKeys.includes('analyticsEvents')) {
    assert.deepStrictEqual(target.exportState().state.analyticsEvents, [], 'analyticsEvents not reset');
  }

  // null / undefined must be tolerated, not throw.
  const nullRes = target.importState(null);
  assert.equal(nullRes.ok, true, spec.name + ' importState(null) ok');
  assert.equal(nullRes.restored, 0, spec.name + ' importState(null) restored');
  const undefRes = target.importState(undefined);
  assert.equal(undefRes.ok, true, spec.name + ' importState(undefined) ok');
  assert.equal(undefRes.restored, 0, spec.name + ' importState(undefined) restored');
  console.log('  PASS ' + spec.name);
}

console.log('\n4. ids minted after a restore do not collide with pre-restore ids...');
for (const spec of MANAGERS) {
  if (spec.counterOnly) {
    const m = spec.create();
    assert.equal(m.exportState().counters.id, 0, 'memory counter should start at 0');
    const bumped = m.importState({ counters: { id: 7 } });
    assert.equal(bumped.ok, true, 'memory import of a counter-only payload');
    assert.equal(m.exportState().counters.id, 7, 'memory counter not restored');
    console.log('  PASS ' + spec.name + ' (counter-only manager)');
    continue;
  }
  const source = spec.create();
  const before = [spec.mintId(source), spec.mintId(source)];
  const snapshot = dbRoundTrip(source.exportState());

  const target = spec.create();
  target.importState(snapshot);
  const after = spec.mintId(target);
  assert.ok(!before.includes(after), spec.name + ' id collision: ' + after + ' already minted');
  const readBack = spec.read(target, after);
  assert.ok(readBack && readBack.id === after, spec.name + ' fresh id not readable');
  console.log('  PASS ' + spec.name + ' (' + before.join(',') + ' -> ' + after + ')');
}

console.log('\n5. importState never moves the id counter backwards...');
for (const spec of MANAGERS) {
  if (spec.counterOnly) {
    const m = spec.create();
    m.importState({ counters: { id: 9 } });
    const snapshot = dbRoundTrip(m.exportState());
    m.importState(snapshot);
    assert.equal(m.exportState().counters.id, 9, spec.name + ' counter rewound');
    console.log('  PASS ' + spec.name + ' (counter 9 held)');
    continue;
  }
  const source = spec.create();
  spec.mintId(source);
  spec.mintId(source);
  const older = dbRoundTrip(source.exportState()); // counter === 2
  const minted = spec.mintId(source); // counter === 3
  const counterAfterMint = source.exportState().counters.id;
  assert.ok(counterAfterMint > older.counters.id, spec.name + ' counter should advance');

  source.importState(older); // replaying a stale snapshot must not rewind
  assert.equal(source.exportState().counters.id, counterAfterMint, spec.name + ' counter rewound');
  assert.notEqual(spec.mintId(source), minted, spec.name + ' rewound counter reused an id');
  console.log('  PASS ' + spec.name + ' (stale counter ' + older.counters.id + ' < ' + counterAfterMint + ')');
}

console.log('\n6. non-primary maps and array-valued maps carry data through the seam...');
{
  // advanced: every remaining map plus the non-Map analyticsEvents array.
  const source = Advanced.createAdvancedManager(State);
  source.seedRumor({ id: 'seam-rumor-1', text: 'Dragons stir', type: 'legend', spreadRate: 0.8 });
  source.createScenarioPack({ id: 'seam-pack-1', name: 'Seam Pack', type: 'campaign' });
  source.createQuestNode({ id: 'seam-node-1', questId: 'q1', title: 'Find the vault' });
  source.addAtlasEntry({ id: 'seam-atlas-1', title: 'The Sundering', epoch: 'ancient', significance: 9 });
  source.registerVoice({ id: 'seam-voice-1', name: 'Seam Voice', language: 'ar', quality: 5 });
  source.recordAnalytics({ type: 'turn', sessionId: 'sess-1', worldId: 'valen' });
  const snapshot = dbRoundTrip(source.exportState());
  const target = Advanced.createAdvancedManager(State);
  const res = target.importState(snapshot);
  assert.equal(res.restored, 6, 'advanced restored count (6 entities)');
  assert.equal(res.restoredByKey.analyticsEvents, 1, 'analyticsEvents restored count');
  assert.equal(target.getRumors().length, 1, 'rumor lost');
  assert.equal(target.listScenarioPacks().length, 1, 'scenario pack lost');
  assert.equal(target.getQuestGraph('q1').length, 1, 'quest node lost');
  assert.equal(target.getAtlas().length, 1, 'atlas entry lost');
  assert.equal(target.getNarratorVoice('ar').name, 'Seam Voice', 'voice lost');
  assert.equal(target.getAnalyticsSummary().totalEvents, 1, 'analytics event lost');
  assert.equal(target.getEngagementMetrics('sess-1').turns, 1, 'analytics engagement lost');

  // combat: combatLog holds arrays per encounter, combatEffects holds effects.
  const c = Combat.createCombatManager(State);
  c.createEncounter({ id: 'seam-log-enc', name: 'Logged Fight' });
  c.logCombatAction('seam-log-enc', { combatantId: 'cbt-1', action: 'attack', description: 'Strikes the ogre', damage: 12 });
  c.applyCombatEffect({ id: 'seam-eff-1', combatantId: 'cbt-1', name: 'Poison', duration: 3 });
  c.createBalanceProfile({ id: 'seam-bal-1', name: 'Seam Balance', difficulty: 'deadly' });
  const cSnap = dbRoundTrip(c.exportState());
  const c2 = Combat.createCombatManager(State);
  const cRes = c2.importState(cSnap);
  assert.equal(cRes.restoredByKey.combatLog, 1, 'combatLog restored count');
  assert.equal(cRes.restoredByKey.combatEffects, 1, 'combatEffects restored count');
  assert.equal(c2.getCombatLog('seam-log-enc').length, 1, 'array-valued map lost');
  assert.equal(c2.getCombatLog('seam-log-enc')[0].description, 'Strikes the ogre', 'log record fields lost');
  assert.equal(c2.getBalanceProfile('seam-bal-1').difficulty, 'deadly', 'balance profile lost');
  assert.equal(c2.exportState().counters.id, c.exportState().counters.id, 'combat counter mismatch');

  // gm-tools: timelines holds arrays of events, plus gmState and npcs.
  const g = GmTools.createGmTools(State);
  g.setSession('seam-session', 'valen-gm');
  g.createTimelineEvent({ id: 'seam-tl-1', timelineId: 'main', description: 'The Founding', type: 'event' });
  g.registerNpc({ id: 'seam-npc-1', name: 'Vex', role: 'broker', location: 'capital', disposition: 'wary' });
  const gSnap = dbRoundTrip(g.exportState());
  const g2 = GmTools.createGmTools(State);
  const gRes = g2.importState(gSnap);
  assert.equal(gRes.restoredByKey.timelines, 1, 'timelines restored count');
  assert.equal(g2.getTimeline('main').length, 1, 'array-valued timelines map lost');
  assert.equal(g2.getTimeline('main')[0].description, 'The Founding', 'timeline event fields lost');
  assert.equal(g2.getNpc('seam-npc-1').disposition, 'wary', 'npc lost');
  assert.equal(g2.exportState().state.gmState.sessionId, 'seam-session', 'gmState lost');
  assert.equal(g2.exportState().state.gmState.worldId, 'valen-gm', 'gmState lost');
  g2.importState({});
  assert.equal(g2.exportState().state.gmState.sessionId, null, 'gmState not reset on empty import');
  assert.equal(g2.exportState().state.gmState.worldId, null, 'gmState not reset on empty import');
  assert.deepStrictEqual(g2.exportState().timelines, { __map: {} }, 'timelines not cleared');

  // event-scheduler: the always-exported timers map round-trips even though no
  // public method writes it today.
  const s = EventSched.createEventScheduler(State);
  const s2 = EventSched.createEventScheduler(State);
  s2.importState(dbRoundTrip(s.exportState()));
  assert.deepStrictEqual(s2.exportState().timers, { __map: {} }, 'timers not exported/restored');
  console.log('  PASS advanced + combat + gm-tools + event-scheduler');
}

console.log('\n7. exportState() output is a copy: callers cannot reach internal state...');
for (const spec of MANAGERS) {
  if (spec.counterOnly) continue;
  const m = spec.create();
  const seeded = spec.seedIdentity(m);
  const state = m.exportState();
  const first = spec.maps[0];
  const entry = state[first].__map[seeded.key];
  assert.ok(entry, spec.name + ': seeded entity missing from ' + first);
  for (const k of Object.keys(entry)) entry[k] = 'HACKED';
  assert.deepStrictEqual(spec.read(m, seeded.key), seeded.fields, spec.name + ': export leaked internal references');
  console.log('  PASS ' + spec.name);
}

console.log('\nAll RPG manager persistence seam (set B) tests passed!');
console.log('\nCoverage:');
console.log('  Fresh export: every closure map present, version + counters, state fields');
console.log('  Round-trip: export -> JSON -> importState on a fresh manager -> public getter');
console.log('  Clearing: importState({} | null | undefined) -> {ok:true, restored:0}');
console.log('  Ids: no collision after restore, counter never rewinds');
console.log('  Non-primary maps: rumors/packs/atlas/voices/analytics, combatLog, timelines, timers');
console.log('  Isolation: exportState() returns a copy, not internal references');