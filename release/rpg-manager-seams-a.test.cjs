'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Assets = require('./workspaces/rpg-assets.js');
const Progression = require('./workspaces/rpg-progression.js');
const LlmRuntime = require('./workspaces/rpg-llm-runtime.js');
const Narration = require('./workspaces/rpg-narration.js');
const PlayerTools = require('./workspaces/rpg-player-tools.js');

// Simulates a server DB round-trip: whatever exportState() returns must
// survive a JSON serialize/deserialize cycle unchanged.
function dbRoundTrip(data) {
  return JSON.parse(JSON.stringify(data));
}

// Each descriptor pins the closure-scoped maps the seam must export, plus
// helpers to seed one identifiable entity, read it back through a public
// getter, and mint auto-id entities.
const MANAGERS = [
  {
    name: 'assets',
    create: () => Assets.createAssetsManager(State),
    primaryMap: 'assets',
    maps: ['assets', 'soundscapeTracks', 'musicMappings', 'portraits', 'palettes',
      'fontRegistry', 'cacheEntries', 'attachments', 'accessibilityMedia'],
    seedIdentity(m) {
      const a = m.registerAsset({
        id: 'seam-asset-1', name: 'Seam Asset', type: 'image',
        mimeType: 'image/png', url: '/assets/seam.png',
        width: 256, height: 256, sizeBytes: 4096,
        tags: ['seam'], category: 'characters'
      });
      return {
        key: 'seam-asset-1',
        fields: { id: a.id, name: a.name, type: a.type, mimeType: a.mimeType, url: a.url, width: a.width, height: a.height, sizeBytes: a.sizeBytes, tags: a.tags, category: a.category }
      };
    },
    read(m, key) {
      const a = m.getAsset(key);
      return a && { id: a.id, name: a.name, type: a.type, mimeType: a.mimeType, url: a.url, width: a.width, height: a.height, sizeBytes: a.sizeBytes, tags: a.tags, category: a.category };
    },
    mintId(m) { return m.registerAsset({ name: 'Auto Asset', type: 'image', sizeBytes: 1 }).id; }
  },
  {
    name: 'progression',
    create: () => Progression.createProgressionManager(State),
    primaryMap: 'characters',
    maps: ['characters', 'skillTrees', 'abilities', 'statusEffects', 'quests',
      'achievements', 'inventory', 'craftingRecipes', 'rulesets', 'titles'],
    seedIdentity(m) {
      const c = m.createCharacterProgression({
        id: 'seam-char-1', name: 'Seam Hero', level: 7, xp: 640,
        class: 'rogue', race: 'halfling'
      });
      return {
        key: 'seam-char-1',
        fields: { id: c.id, name: c.name, level: c.level, xp: c.xp, class: c.class, race: c.race, health: c.health, attributes: c.attributes }
      };
    },
    read(m, key) {
      const c = m.getCharacterProgression(key);
      return c && { id: c.id, name: c.name, level: c.level, xp: c.xp, class: c.class, race: c.race, health: c.health, attributes: c.attributes };
    },
    mintId(m) { return m.createCharacterProgression({ name: 'Auto Hero' }).id; }
  },
  {
    name: 'llm-runtime',
    create: () => LlmRuntime.createLlmRuntimeManager(State),
    primaryMap: 'providers',
    maps: ['providers', 'modelConfigs', 'requestLog', 'contextEntries', 'activeStreams',
      'retryConfigs', 'timeouts', 'rateLimitState', 'localModels'],
    seedIdentity(m) {
      const p = m.registerProvider({
        id: 'seam-prov-1', name: 'Seam Provider',
        baseUrl: 'https://example.test/v1', models: ['m1', 'm2'],
        rateLimit: { requestsPerMinute: 30 }
      });
      return {
        key: 'seam-prov-1',
        fields: { id: p.id, name: p.name, baseUrl: p.baseUrl, status: p.status, models: p.models, defaultModel: p.defaultModel, requestsPerMinute: p.rateLimit.requestsPerMinute }
      };
    },
    read(m, key) {
      const p = m.getProvider(key);
      return p && { id: p.id, name: p.name, baseUrl: p.baseUrl, status: p.status, models: p.models, defaultModel: p.defaultModel, requestsPerMinute: p.rateLimit.requestsPerMinute };
    },
    mintId(m) { return m.registerProvider({ name: 'Auto Provider' }).id; }
  },
  {
    name: 'narration',
    create: () => Narration.createNarrationManager(State),
    primaryMap: 'scenes',
    maps: ['scenes', 'chapters', 'arcs', 'consequences', 'foreshadowing',
      'dialogueVariants', 'npcInitiatives'],
    seedIdentity(m) {
      const s = m.createScene({
        id: 'seam-scene-1', title: 'Seam Scene',
        locationId: 'loc-1', characters: ['npc-1', 'npc-2']
      });
      return {
        key: 'seam-scene-1',
        fields: { id: s.id, title: s.title, locationId: s.locationId, characters: s.characters, status: s.status, pacing: s.pacing, tone: s.tone }
      };
    },
    read(m, key) {
      const s = m.getScene(key);
      return s && { id: s.id, title: s.title, locationId: s.locationId, characters: s.characters, status: s.status, pacing: s.pacing, tone: s.tone };
    },
    mintId(m) { return m.createScene({ title: 'Auto Scene' }).id; }
  },
  {
    name: 'player-tools',
    create: () => PlayerTools.createPlayerToolsManager(State),
    primaryMap: 'saveSlots',
    maps: ['saveSlots', 'notes'],
    seedIdentity(m) {
      const n = m.createNote({
        id: 'seam-note-1', title: 'Seam Note', content: 'seam body',
        category: 'general', tags: ['seam', 'test']
      });
      return {
        key: 'seam-note-1',
        fields: { id: n.id, title: n.title, content: n.content, category: n.category, tags: n.tags, pinned: n.pinned }
      };
    },
    read(m, key) {
      const n = m.getNote(key);
      return n && { id: n.id, title: n.title, content: n.content, category: n.category, tags: n.tags, pinned: n.pinned };
    },
    mintId(m) { return m.createNote({ title: 'Auto Note' }).id; }
  }
];

console.log('Testing RPG manager persistence seams (set A)...');

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
  }
  console.log('  PASS ' + spec.name + ' (' + spec.maps.length + ' maps)');
}

console.log('\n2. export -> JSON round-trip -> importState into a FRESH manager...');
for (const spec of MANAGERS) {
  const source = spec.create();
  const seeded = spec.seedIdentity(source);
  const snapshot = dbRoundTrip(source.exportState());

  const target = spec.create();
  const res = target.importState(snapshot);
  assert.equal(res.ok, true, spec.name + ' import ok');
  // restored reports the total data records across all non-bookkeeping maps.
  const expectedRestored = spec.maps
    .filter((m) => !['lastIdNums', 'timers'].includes(m))
    .reduce((sum, m) => sum + Object.keys(snapshot[m]?.__map ?? {}).length, 0);
  assert.equal(res.restored, expectedRestored, spec.name + ' restored count');
  assert.deepStrictEqual(spec.read(target, seeded.key), seeded.fields, spec.name + ' round-tripped entity');
  console.log('  PASS ' + spec.name + ' (' + seeded.key + ')');
}

console.log('\n3. importState({}) clears the maps and reports restored 0...');
for (const spec of MANAGERS) {
  const source = spec.create();
  const seeded = spec.seedIdentity(source);
  const snapshot = dbRoundTrip(source.exportState());

  const target = spec.create();
  target.importState(snapshot);
  assert.notEqual(spec.read(target, seeded.key), null, spec.name + ' pre-clear read');

  const cleared = target.importState({});
  assert.equal(cleared.ok, true, spec.name + ' clear ok');
  assert.equal(cleared.restored, 0, spec.name + ' clear restored');
  assert.equal(spec.read(target, seeded.key), null, spec.name + ' entity survived clear');

  // null / undefined must be tolerated, not throw.
  assert.deepStrictEqual(target.importState(null), { ok: true, restored: 0 }, spec.name + ' importState(null)');
  assert.deepStrictEqual(target.importState(undefined), { ok: true, restored: 0 }, spec.name + ' importState(undefined)');
  assert.equal(spec.read(target, seeded.key), null, spec.name + ' entity survived null import');
  console.log('  PASS ' + spec.name);
}

console.log('\n4. ids minted after a restore do not collide with pre-restore ids...');
for (const spec of MANAGERS) {
  const source = spec.create();
  const before = [spec.mintId(source), spec.mintId(source)];
  const snapshot = dbRoundTrip(source.exportState());
  const counterAtSnapshot = snapshot.counters.id;
  assert.ok(counterAtSnapshot >= 2, spec.name + ' counter should have advanced');

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
  const source = spec.create();
  spec.mintId(source);
  spec.mintId(source);
  const older = dbRoundTrip(source.exportState()); // counter === 2
  const newer = spec.mintId(source); // counter === 3
  const counterAfterMint = source.exportState().counters.id;
  assert.ok(counterAfterMint > older.counters.id, spec.name + ' counter should advance');

  source.importState(older); // replaying a stale snapshot must not rewind
  assert.equal(source.exportState().counters.id, counterAfterMint, spec.name + ' counter rewound');
  const minted = spec.mintId(source);
  assert.notEqual(minted, newer, spec.name + ' rewound counter reused an id');
  console.log('  PASS ' + spec.name + ' (stale counter ' + older.counters.id + ' < ' + counterAfterMint + ')');
}

console.log('\n6. nested Maps (Maps held inside a plain object) round-trip...');
{
  const source = Assets.createAssetsManager(State);
  source.setAltText('img-1', 'A scaly dragon');
  source.setAudioDescription('img-1', 'Wings unfurling');
  source.setCaption('clip-1', { content: 'The dragon roars', startMs: 120, endMs: 900 });
  const snapshot = dbRoundTrip(source.exportState());

  assert.ok(snapshot.accessibilityMedia.altTexts.__map, 'nested altTexts not serialized as a Map');
  assert.ok(snapshot.accessibilityMedia.audioDescriptions.__map, 'nested audioDescriptions not serialized as a Map');
  assert.ok(snapshot.accessibilityMedia.captions.__map, 'nested captions not serialized as a Map');

  const target = Assets.createAssetsManager(State);
  target.importState(snapshot);
  assert.equal(target.getAltText('img-1'), 'A scaly dragon', 'nested altTexts lost');
  const desc = target.getAudioDescription('img-1');
  assert.ok(desc && desc.description === 'Wings unfurling', 'nested audioDescriptions lost');
  assert.equal(desc.assetId, 'img-1', 'nested audioDescriptions record fields lost');
  const caption = target.getCaption('clip-1');
  assert.ok(caption && caption.content === 'The dragon roars', 'nested captions lost');
  assert.equal(caption.startMs, 120, 'nested caption timing lost');

  target.importState({});
  assert.equal(target.getAltText('img-1'), null, 'nested maps not cleared');
  console.log('  PASS assets accessibilityMedia');
}

console.log('\n7. other closure maps carry data through the seam...');
{
  // attachments stores arrays of records keyed by owner.
  const source = Assets.createAssetsManager(State);
  const asset = source.registerAsset({ id: 'hero-img', name: 'Hero', type: 'portrait', sizeBytes: 10 });
  assert.equal(asset.id, 'hero-img');
  source.attachImage({ ownerType: 'character', ownerId: 'aldric', assetId: 'hero-img' });
  const snapshot = dbRoundTrip(source.exportState());
  const target = Assets.createAssetsManager(State);
  target.importState(snapshot);
  const attached = target.getAttachedImages('character', 'aldric');
  assert.equal(attached.length, 1, 'attachment lost');
  assert.equal(attached[0].assetId, 'hero-img', 'attachment assetId lost');
  assert.equal(attached[0].asset.name, 'Hero', 'attached asset not resolvable after restore');

  // A map whose values are themselves keyed records.
  const notes = PlayerTools.createPlayerToolsManager(State);
  notes.createNote({ id: 'n1', title: 'One' });
  notes.createNote({ id: 'n2', title: 'Two' });
  const notes2 = PlayerTools.createPlayerToolsManager(State);
  const res = notes2.importState(dbRoundTrip(notes.exportState()));
  // player-tools follows the codebase-wide seam contract (see step 2 above): importState().restored
  // is the total records restored across all data maps, so two notes and no save slots is 2.
  // The contract is "total across maps", NOT "saveSlots only" -- campaign, character, canon-continuity,
  // story-generator and player-tools all sum their maps, and id bookkeeping is the only exclusion.
  assert.equal(res.restored, 2, 'player-tools restored count is the total across its data maps');
  assert.equal(notes2.getNotes().length, 2, 'notes lost');
  assert.equal(notes2.getNote('n1').title, 'One', 'note n1 lost');
  console.log('  PASS attachments + notes');
}

console.log('\nAll RPG manager persistence seam (set A) tests passed!');
console.log('\nCoverage:');
console.log('  Fresh export: every closure map present, version + counters');
console.log('  Round-trip: export -> JSON -> importState on a fresh manager -> public getter');
console.log('  Clearing: importState({} | null | undefined) -> {ok:true, restored:0}');
console.log('  Ids: no collision after restore, counter never rewinds');
console.log('  Nested: Maps inside plain objects round-trip and clear');
