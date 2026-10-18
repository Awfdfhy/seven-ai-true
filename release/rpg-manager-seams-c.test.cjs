'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Campaign = require('./workspaces/rpg-campaign.js');
const Character = require('./workspaces/rpg-character.js');
const Canon = require('./workspaces/rpg-canon-continuity.js');
const Party = require('./workspaces/rpg-party.js');
const Session = require('./workspaces/rpg-session.js');
const StoryGen = require('./workspaces/rpg-story-generator.js');

const seed = {
  sessionId: 'seams-test', worldId: 'valen-seams',
  timeline: { tick: 0, dateLabel: 'Festival' },
  world: { locations: { capital: { name: 'Capital' }, road: { name: 'Road' } } },
  characters: {
    hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' }, level: 5, stats: { hp: 100, mp: 50 } },
    npc: { control: 'ai', locationId: 'capital', identity: { name: 'Npc' }, level: 3, stats: { hp: 60, mp: 20 } }
  },
  quests: { main: { title: 'Save the Kingdom', status: 'active' } },
  canon: { entries: {} }
};

// Simulate a server handing the export to a storage backend and a cold process
// receiving it back.
function dbRoundTrip(state) { return JSON.parse(JSON.stringify(state)); }

function numericIdSuffix(id) { return Number(String(id).split('-').pop()); }

console.log('Testing RPG manager persistence seams (exportState/importState)...');

// ---------------------------------------------------------------- campaign --
console.log('\n1. campaign - exportState exposes every closure map...');
{
  const mgr = Campaign.createCampaignManager(State);
  const fresh = mgr.exportState();
  assert.equal(fresh.version, 1);
  for (const key of ['campaigns', 'sessions', 'checkpoints']) {
    assert.ok(Object.prototype.hasOwnProperty.call(fresh, key), 'missing export key: ' + key);
    assert.deepEqual(fresh[key], {});
  }
  assert.equal(typeof fresh.counters.id, 'number');
  console.log('  PASS');
}

console.log('\n2. campaign - round-trip through a DB preserves campaigns/sessions/checkpoints...');
{
  const a = Campaign.createCampaignManager(State);
  const camp = a.createCampaign({ name: 'Seam Campaign', worldId: 'valen', description: 'persisted' });
  const made = a.createSession({ campaignId: camp.id, name: 'Seam Session' });
  const sessionId = made.session.id;
  const cp = a.createCheckpoint({ sessionId, type: 'manual', label: 'Seam CP', stateSnapshot: { hp: 42 } });
  const cpId = cp.checkpoint.id;

  const persisted = dbRoundTrip(a.exportState());
  const b = Campaign.createCampaignManager(State);
  const result = b.importState(persisted);
  assert.equal(result.ok, true);
  assert.equal(result.restored, 3);

  const gotCamp = b.getCampaign(camp.id);
  assert.ok(gotCamp, 'campaign not restored');
  assert.equal(gotCamp.id, camp.id);
  assert.equal(gotCamp.name, camp.name);
  assert.equal(gotCamp.worldId, camp.worldId);
  assert.equal(gotCamp.status, camp.status);

  const gotSession = b.getSession(sessionId);
  assert.ok(gotSession, 'session not restored');
  assert.equal(gotSession.id, sessionId);
  assert.equal(gotSession.name, made.session.name);
  assert.equal(gotSession.campaignId, camp.id);

  const gotCp = b.getCheckpoint(cpId);
  assert.ok(gotCp, 'checkpoint not restored');
  assert.equal(gotCp.id, cpId);
  assert.equal(gotCp.sessionId, sessionId);
  assert.deepEqual(gotCp.stateSnapshot, { hp: 42 });
  console.log('  PASS');
}

console.log('\n3. campaign - importState({}) clears and reports restored 0...');
{
  const mgr = Campaign.createCampaignManager(State);
  const camp = mgr.createCampaign({ name: 'Doomed', worldId: 'valen' });
  mgr.createSession({ campaignId: camp.id });
  assert.equal(mgr.getAllCampaigns().length, 1);
  const result = mgr.importState({});
  assert.equal(result.ok, true);
  assert.equal(result.restored, 0);
  assert.equal(mgr.getAllCampaigns().length, 0);
  assert.equal(mgr.getCampaign(camp.id), undefined);
  assert.equal(mgr.getSessionByCampaign(camp.id).length, 0);
  console.log('  PASS');
}

console.log('\n4. campaign - ids minted after a restore never collide...');
{
  const a = Campaign.createCampaignManager(State);
  const first = a.createCampaign({ name: 'First', worldId: 'valen' });
  const persisted = dbRoundTrip(a.exportState());
  const b = Campaign.createCampaignManager(State);
  b.importState(persisted);
  const second = b.createCampaign({ name: 'Second', worldId: 'valen' });
  assert.notEqual(second.id, first.id);
  assert.ok(numericIdSuffix(second.id) > numericIdSuffix(first.id), 'id counter rewound after restore');
  console.log('  PASS');
}

// --------------------------------------------------------------- character --
console.log('\n5. character - exportState exposes every closure map...');
{
  const mgr = Character.createCharacterManager(State);
  const fresh = mgr.exportState();
  assert.equal(fresh.version, 1);
  for (const key of ['portraits', 'dialogueStyles']) {
    assert.ok(Object.prototype.hasOwnProperty.call(fresh, key), 'missing export key: ' + key);
    assert.deepEqual(fresh[key], {});
  }
  assert.equal(typeof fresh.counters.id, 'number');
  console.log('  PASS');
}

console.log('\n6. character - round-trip through a DB preserves portraits and dialogue styles...');
{
  const a = Character.createCharacterManager(State);
  const c = a.createCharacter({ name: 'Seam Hero', type: 'player' });
  const p = a.setPortrait(c, { imageUrl: 'https://example.invalid/hero.png', artist: 'gm', style: 'painted', metadata: new Map([['mood', 'grim']]) });
  const s = a.setDialogueStyle(c, { style: 'terse', humor: 'dry', recurringExpressions: ['Hm.'] });
  const characterId = c.id;

  const persisted = dbRoundTrip(a.exportState());
  const b = Character.createCharacterManager(State);
  const result = b.importState(persisted);
  assert.equal(result.ok, true);
  assert.equal(result.restored, 2);

  const gotP = b.getPortrait({ portraitId: p.portrait.id });
  assert.ok(gotP, 'portrait not restored');
  assert.equal(gotP.id, p.portrait.id);
  assert.equal(gotP.characterId, characterId);
  assert.equal(gotP.imageUrl, 'https://example.invalid/hero.png');
  assert.equal(gotP.artist, 'gm');
  // A caller-supplied Map nested inside a stored record must survive as a Map.
  assert.ok(gotP.metadata instanceof Map, 'nested Map was not rehydrated');
  assert.equal(gotP.metadata.get('mood'), 'grim');

  const gotS = b.getDialogueStyle({ dialogueStyleId: s.style.id });
  assert.ok(gotS, 'dialogue style not restored');
  assert.equal(gotS.id, s.style.id);
  assert.equal(gotS.characterId, characterId);
  assert.equal(gotS.style, 'terse');
  assert.deepEqual(gotS.recurringExpressions, ['Hm.']);
  console.log('  PASS');
}

console.log('\n7. character - importState({}) clears and reports restored 0...');
{
  const mgr = Character.createCharacterManager(State);
  const c = mgr.createCharacter({ name: 'Doomed' });
  mgr.setPortrait(c, { imageUrl: 'x' });
  mgr.setDialogueStyle(c, { style: 'formal' });
  const result = mgr.importState({});
  assert.equal(result.ok, true);
  assert.equal(result.restored, 0);
  assert.equal(mgr.getPortrait(c), undefined);
  assert.equal(mgr.getDialogueStyle(c), undefined);
  console.log('  PASS');
}

console.log('\n8. character - the per-manager id counter is restored, never rewound...');
{
  const a = Character.createCharacterManager(State);
  const first = a.createCharacter({ name: 'First' });
  a.setPortrait(first, { imageUrl: 'x' });
  const persisted = dbRoundTrip(a.exportState());
  const b = Character.createCharacterManager(State);
  b.importState(persisted);
  const second = b.createCharacter({ name: 'Second' });
  assert.notEqual(second.id, first.id);
  assert.ok(numericIdSuffix(second.id) > numericIdSuffix(first.id), 'id counter rewound after restore');
  const s2 = second.id;
  const third = b.createCharacter({ name: 'Third' });
  assert.notEqual(third.id, s2);
  console.log('  PASS');
}

// -------------------------------------------------------- canon-continuity --
console.log('\n9. canon-continuity - exportState exposes every closure map and the policy object...');
{
  const mgr = Canon.createCanonContinuity(State);
  const fresh = mgr.exportState();
  assert.equal(fresh.version, 1);
  for (const key of ['entries', 'conflicts', 'history', 'provenance']) {
    assert.ok(Object.prototype.hasOwnProperty.call(fresh, key), 'missing export key: ' + key);
    assert.deepEqual(fresh[key], {});
  }
  assert.equal(typeof fresh.counters.id, 'number');
  assert.equal(typeof fresh.state.canonPolicy, 'object');
  assert.equal(fresh.state.canonPolicy.spoilerBoundary, 'chapter-3');
  console.log('  PASS');
}

console.log('\n10. canon-continuity - round-trip through a DB preserves entries, conflicts, history and provenance...');
{
  const a = Canon.createCanonContinuity(State);
  const e1 = a.createEntry({ level: 'HARD', value: 'the sun rises', tags: ['sky'], entityIds: ['hero'] });
  const e2 = a.createEntry({ level: 'ACTIVE', value: 'the sun sets', tags: ['sky'], entityIds: ['hero'] });
  const detected = a.checkConflict(e2, [e1]);
  assert.ok(detected.length > 0, 'expected a conflict');
  a.addProvenance(e1.id, { type: 'canon_rule', author: 'keeper', description: 'revealed' });

  const persisted = dbRoundTrip(a.exportState());
  const b = Canon.createCanonContinuity(State);
  const result = b.importState(persisted);
  assert.equal(result.ok, true);
  assert.equal(result.restored, 2 + detected.length + 2 + 1);

  const got1 = b.getEntry(e1.id);
  assert.ok(got1, 'entry not restored');
  assert.equal(got1.id, e1.id);
  assert.equal(got1.level, 'HARD');
  assert.equal(got1.value, 'the sun rises');
  assert.deepEqual(got1.tags, ['sky']);

  const got2 = b.getEntry(e2.id);
  assert.ok(got2, 'second entry not restored');
  assert.equal(got2.value, 'the sun sets');

  assert.equal(b.getConflicts().length, detected.length);
  assert.equal(b.getConflicts(detected[0].id)[0].status, 'open');
  assert.equal(b.getHistory(e1.id).length, a.getHistory(e1.id).length);
  const prov = b.getProvenance(e1.id);
  assert.equal(prov.length, 1);
  assert.equal(prov[0].type, 'canon_rule');
  assert.equal(prov[0].author, 'keeper');
  console.log('  PASS');
}

console.log('\n11. canon-continuity - the non-Map policy state round-trips and resets on {}...');
{
  const a = Canon.createCanonContinuity(State);
  a.setCanonPolicy({ spoilerBoundary: 'chapter-9', autoPromoteAfterCorrobations: 5 });
  assert.equal(a.getCanonPolicy().spoilerBoundary, 'chapter-9');
  const persisted = dbRoundTrip(a.exportState());

  const b = Canon.createCanonContinuity(State);
  b.importState(persisted);
  assert.equal(b.getCanonPolicy().spoilerBoundary, 'chapter-9');
  assert.equal(b.getCanonPolicy().autoPromoteAfterCorrobations, 5);

  const cleared = b.importState({});
  assert.equal(cleared.ok, true);
  assert.equal(cleared.restored, 0);
  assert.equal(b.getCanonPolicy().spoilerBoundary, 'chapter-3');
  console.log('  PASS');
}

console.log('\n12. canon-continuity - ids minted after a restore never collide...');
{
  const a = Canon.createCanonContinuity(State);
  const first = a.createEntry({ value: 'first fact' });
  const persisted = dbRoundTrip(a.exportState());
  const b = Canon.createCanonContinuity(State);
  b.importState(persisted);
  const second = b.createEntry({ value: 'second fact' });
  assert.notEqual(second.id, first.id);
  assert.ok(numericIdSuffix(second.id) > numericIdSuffix(first.id), 'id counter rewound after restore');
  console.log('  PASS');
}

// ------------------------------------------------------------------- party --
console.log('\n13. party - exportState exposes the only closure map...');
{
  const mgr = Party.createPartyManager(State);
  const fresh = mgr.exportState();
  assert.equal(fresh.version, 1);
  assert.ok(Object.prototype.hasOwnProperty.call(fresh, 'lastIdNums'), 'missing export key: lastIdNums');
  assert.deepEqual(fresh.lastIdNums, {});
  console.log('  PASS');
}

console.log('\n14. party - round-trip through a DB keeps the id allocator monotonic...');
{
  const state = State.createState(seed);
  const a = Party.createPartyManager(State);
  const p1 = a.createParty({ name: 'Seam Party', memberIds: ['hero'], formation: 'defensive' });
  const p2 = a.createParty({ name: 'Second Party', memberIds: ['npc'], formation: 'stealth' });
  assert.notEqual(p1.id, p2.id);
  assert.equal(a.validateParty(state, p1).valid, true);

  const persisted = dbRoundTrip(a.exportState());
  assert.ok(persisted.lastIdNums.party, 'lastIdNums.party missing after population');

  const b = Party.createPartyManager(State);
  const result = b.importState(persisted);
  assert.equal(result.ok, true);
  assert.equal(result.restored, 1);

  const p3 = b.createParty({ name: 'Restored Party', memberIds: ['hero'] });
  assert.notEqual(p3.id, p1.id);
  assert.notEqual(p3.id, p2.id);
  assert.ok(numericIdSuffix(p3.id) > Math.max(numericIdSuffix(p1.id), numericIdSuffix(p2.id)), 'party id watermark rewound');
  console.log('  PASS');
}

console.log('\n15. party - importState({}) clears and reports restored 0...');
{
  const mgr = Party.createPartyManager(State);
  mgr.createParty({ name: 'Doomed', memberIds: ['hero'] });
  assert.ok(Object.keys(mgr.exportState().lastIdNums).length > 0);
  const result = mgr.importState({});
  assert.equal(result.ok, true);
  assert.equal(result.restored, 0);
  assert.deepEqual(mgr.exportState().lastIdNums, {});
  console.log('  PASS');
}

// ------------------------------------------------------------------ session --
console.log('\n16. session - exportState reports the storage namespace...');
{
  const storage = Session.memoryStorage();
  const mgr = Session.createManager({ stateApi: State, storage, clock: () => 'T0' });
  const fresh = mgr.exportState();
  assert.equal(fresh.version, 1);
  assert.equal(fresh.state.prefix, mgr.prefix);
  assert.ok(Array.isArray(fresh.state.storageKeys));
  assert.deepEqual(fresh.state.storageKeys, []);
  const started = mgr.start({ roomId: 'room-seams', worldId: 'world-1', state: seed });
  assert.equal(started.ok, true);
  assert.ok(mgr.exportState().state.storageKeys.includes(mgr.key('room-seams', 'world-1')));
  console.log('  PASS');
}

console.log('\n17. session - a cold manager reads back state a warm manager persisted...');
{
  const storage = Session.memoryStorage();
  let tick = 0;
  const warm = Session.createManager({ stateApi: State, storage, clock: () => 'T' + (++tick) });
  const started = warm.start({ roomId: 'room-seams', worldId: 'world-1', state: seed });
  assert.equal(started.ok, true);
  const committed = warm.commitEvents(started.session, [{ id: 'e1', type: 'world.set', source: 'runtime', payload: { path: ['flags', 'ready'], value: true } }]);
  assert.equal(committed.ok, true);

  const persisted = dbRoundTrip(warm.exportState());
  let coldTick = 0;
  const cold = Session.createManager({ stateApi: State, storage, clock: () => 'C' + (++coldTick) });
  const result = cold.importState(persisted);
  assert.equal(result.ok, true);
  assert.equal(result.restored, 0);
  assert.equal(result.appliedPrefix, true);

  const loaded = cold.load('room-seams', 'world-1');
  assert.equal(loaded.ok, true);
  assert.equal(loaded.session.state.world.flags.ready, true);
  assert.equal(loaded.session.state.revision, committed.session.state.revision);
  console.log('  PASS');
}

console.log('\n18. session - importState({}) is a safe no-op and never throws...');
{
  const storage = Session.memoryStorage();
  const mgr = Session.createManager({ stateApi: State, storage, clock: () => 'T0' });
  for (const payload of [null, undefined, {}]) {
    const result = mgr.importState(payload);
    assert.equal(result.ok, true);
    assert.equal(result.restored, 0);
  }
  const other = Session.createManager({ stateApi: State, storage, prefix: 'other_prefix', clock: () => 'T0' });
  const mismatch = mgr.importState({ state: { prefix: 'other_prefix' } });
  assert.equal(mismatch.ok, true);
  assert.equal(mismatch.appliedPrefix, false);
  assert.equal(other.exportState().state.prefix, 'other_prefix');
  console.log('  PASS');
}

// --------------------------------------------------------- story-generator --
console.log('\n19. story-generator - exportState exposes every closure map...');
{
  const gen = StoryGen.createStoryGenerator(State);
  const fresh = gen.exportState();
  assert.equal(fresh.version, 1);
  for (const key of ['templates', 'lastIdNums']) {
    assert.ok(Object.prototype.hasOwnProperty.call(fresh, key), 'missing export key: ' + key);
    assert.deepEqual(fresh[key], {});
  }
  console.log('  PASS');
}

console.log('\n20. story-generator - round-trip through a DB preserves templates...');
{
  const a = StoryGen.createStoryGenerator(State);
  const t1 = a.registerTemplate({ name: 'Ambush', type: 'encounter', weight: 3, tags: ['combat'], template: '{{enemyCount}} {{enemyType}}(s) appear.' });
  const t2 = a.registerTemplate({ id: 'fixed-template', name: 'Tavern', type: 'scene', weight: 1, tags: ['downtime'], template: 'The party drinks.' });

  const persisted = dbRoundTrip(a.exportState());
  const b = StoryGen.createStoryGenerator(State);
  const result = b.importState(persisted);
  assert.equal(result.ok, true);
  assert.equal(result.restored, 3);

  const got1 = b.getTemplate(t1.id);
  assert.ok(got1, 'template not restored');
  assert.equal(got1.id, t1.id);
  assert.equal(got1.name, 'Ambush');
  assert.equal(got1.type, 'encounter');
  assert.equal(got1.weight, 3);
  assert.deepEqual(got1.tags, ['combat']);
  assert.equal(got1.template, '{{enemyCount}} {{enemyType}}(s) appear.');

  const got2 = b.getTemplate('fixed-template');
  assert.ok(got2, 'fixed-id template not restored');
  assert.equal(got2.name, 'Tavern');

  assert.equal(b.getTemplatesByTag('combat').length, 1);
  assert.equal(b.getTemplatesByType('scene').length, 1);
  console.log('  PASS');
}

console.log('\n21. story-generator - importState({}) clears and reports restored 0...');
{
  const gen = StoryGen.createStoryGenerator(State);
  const t = gen.registerTemplate({ name: 'Doomed', type: 'scene', template: 'x' });
  const result = gen.importState({});
  assert.equal(result.ok, true);
  assert.equal(result.restored, 0);
  assert.equal(gen.getTemplate(t.id), undefined);
  assert.deepEqual(gen.exportState().templates, {});
  console.log('  PASS');
}

console.log('\n22. story-generator - ids minted after a restore never collide...');
{
  const a = StoryGen.createStoryGenerator(State);
  const first = a.registerTemplate({ name: 'First', type: 'scene', template: 'a' });
  const second = a.registerTemplate({ name: 'Second', type: 'scene', template: 'b' });
  const persisted = dbRoundTrip(a.exportState());
  const b = StoryGen.createStoryGenerator(State);
  b.importState(persisted);
  const third = b.registerTemplate({ name: 'Third', type: 'scene', template: 'c' });
  assert.notEqual(third.id, first.id);
  assert.notEqual(third.id, second.id);
  assert.ok(numericIdSuffix(third.id) > Math.max(numericIdSuffix(first.id), numericIdSuffix(second.id)), 'story id watermark rewound');
  console.log('  PASS');
}

console.log('\nAll RPG manager persistence seam tests passed!');
console.log('Coverage: exportState/importState round-trip for campaign, character, canon-continuity, party, session, story-generator');
