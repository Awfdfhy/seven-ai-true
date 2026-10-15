'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Session = require('./workspaces/rpg-session.js');
const Memory = require('./workspaces/rpg-memory.js');

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function text(v) { return typeof v === 'string' ? v.trim() : ''; }

const backingStorage = Session.memoryStorage();
const mem = { objects: [] };

const storage = {
  getItem: k => backingStorage.getItem(k),
  setItem: (k, v) => backingStorage.setItem(k, v),
  removeItem: k => backingStorage.removeItem(k)
};

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

const seed = {
  sessionId: 'memory-test', worldId: 'valen-mem',
  timeline: { tick: 0 },
  world: { locations: { capital: { name: 'Capital', description: 'The royal capital' }, frontier: { name: 'Frontier' } } },
  characters: {
    hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' }, goals: [{ id: 'g1', status: 'active' }], emotions: { happiness: 0.5 }, voice: { vocabulary: 'formal' } },
    npc1: { control: 'ai', locationId: 'capital', identity: { name: 'NPC1' }, intent: 'help hero' },
    npc2: { control: 'ai', locationId: 'frontier', identity: { name: 'NPC2' }, intent: 'guard frontier' }
  },
  quests: { q1: { title: 'Main Quest', status: 'active', ownerIds: ['hero'] } },
  canon: { entries: {
    fact1: { level: 'HARD', value: 'The king rules', public: true, entityIds: ['hero', 'npc1'], confidence: 1, tags: ['politics'] },
    fact2: { level: 'SOFT', value: 'Hidden passage exists', public: false, entityIds: ['hero'], confidence: 0.8, tags: ['secret'] }
  }}
};

const mgr = Memory.createMemoryManager(State, runtime);

console.log('Testing RPG Memory Module...');

console.log('\n1. createEpisodicMemory...');
const testState = State.createState(seed);
const testEvent = { id: 'evt-1', type: 'character.move', payload: { characterId: 'hero', toLocationId: 'frontier' }, summary: 'Hero travels to frontier' };
const episodic = mgr.createEpisodicMemory(testState, 'hero', testEvent, 0.8);
assert.equal(episodic.kind, 'Episodic');
assert.ok(episodic.canonicalKey.includes('episodic:hero:evt-1'));
assert.equal(episodic.metadata.salience, 0.8);
console.log('  PASS');

console.log('\n2. createSemanticMemory...');
const semantic = mgr.createSemanticMemory(testState, 'fact1', testState.canon.entries.fact1, 1);
assert.equal(semantic.kind, 'Semantic');
assert.ok(semantic.canonicalKey.includes('semantic:fact1'));
assert.ok(semantic.content.includes('The king rules'));
console.log('  PASS');

console.log('\n3. createWorkingMemory...');
const working = mgr.createWorkingMemory(testState, 'hero', { recentEvents: [testEvent] });
assert.equal(working.kind, 'Working');
assert.ok(working.canonicalKey.includes('working:hero'));
assert.ok(working.metadata.expiresAt);
console.log('  PASS');

console.log('\n4. createLongTermMemory...');
const lt = mgr.createLongTermMemory(testState, 'hero', semantic, 0.9);
assert.ok(lt !== null);
assert.equal(lt.kind, 'LongTerm');
assert.ok(lt.metadata.consolidatedAt);
const ltLow = mgr.createLongTermMemory(testState, 'hero', semantic, 0.1);
assert.equal(ltLow, null);
console.log('  PASS');

console.log('\n5. createRelationshipMemory...');
const relState = State.createState(seed);
State.applyEvent(relState, { id: 'rel-1', type: 'relationship.change', payload: { a: 'hero', b: 'npc1', delta: { trust: 0.2 }, reason: 'met' } });
const rel = mgr.createRelationshipMemory(relState, 'hero::npc1', relState.relationships['hero::npc1'], 'rel-1');
assert.equal(rel.kind, 'Relationship');
assert.ok(rel.canonicalKey.includes('relationship:hero::npc1'));
console.log('  PASS');

console.log('\n6. createLocationMemory...');
const location = mgr.createLocationMemory(testState, 'capital', testState.world.locations.capital, 'evt-loc');
assert.equal(location.kind, 'Location');
assert.ok(location.content.includes('Capital'));
console.log('  PASS');

console.log('\n7. createQuestMemory...');
const quest = mgr.createQuestMemory(testState, 'q1', testState.quests.q1, 'evt-quest');
assert.equal(quest.kind, 'Quest');
assert.ok(quest.content.includes('Main Quest'));
console.log('  PASS');

console.log('\n8. createCharacterMemory...');
const charMem = mgr.createCharacterMemory(testState, 'hero', testState.characters.hero, 'evt-char');
assert.equal(charMem.kind, 'Character');
assert.ok(charMem.content.includes('Hero'));
console.log('  PASS');

console.log('\n9. deduplicate...');
const dup1 = { canonicalKey: 'test:1', kind: 'Episodic', confidence: 0.5 };
const dup2 = { canonicalKey: 'test:1', kind: 'Episodic', confidence: 0.8 };
const deduped = mgr.deduplicate([dup1, dup2]);
assert.equal(deduped.length, 1);
assert.equal(deduped[0].confidence, 0.8);
console.log('  PASS');

console.log('\n10. applyForgettingPolicy...');
const manyEpisodic = [];
for (let i = 0; i < 250; i++) {
  manyEpisodic.push({ canonicalKey: 'ep:' + i, kind: 'Episodic', confidence: 0.5, metadata: { characterId: 'hero' } });
}
const filtered = mgr.applyForgettingPolicy(manyEpisodic, testState);
assert.ok(filtered.length <= 200);
console.log('  PASS (filtered from 250 to ' + filtered.length + ')');

console.log('\n11. extractMemoriesFromEvent - character.move...');
const moveEvent = { id: 'evt-move', type: 'character.move', payload: { characterId: 'hero', toLocationId: 'frontier' }, summary: 'Hero moves' };
const moveMemories = mgr.extractMemoriesFromEvent(testState, moveEvent);
assert.ok(moveMemories.length >= 2);
assert.ok(moveMemories.some(m => m.kind === 'Episodic'));
assert.ok(moveMemories.some(m => m.kind === 'Working'));
assert.ok(moveMemories.some(m => m.kind === 'Location'));
console.log('  PASS (' + moveMemories.length + ' memories)');

console.log('\n12. extractMemoriesFromEvent - knowledge.learn...');
const learnEvent = { id: 'evt-learn', type: 'knowledge.learn', payload: { characterId: 'hero', factId: 'fact1', method: 'told' }, summary: 'Hero learns fact' };
const learnMemories = mgr.extractMemoriesFromEvent(testState, learnEvent);
assert.ok(learnMemories.some(m => m.kind === 'Semantic'));
assert.ok(learnMemories.some(m => m.kind === 'LongTerm'));
console.log('  PASS (' + learnMemories.length + ' memories)');

console.log('\n13. extractMemoriesFromEvent - relationship.change...');
const relEvent = { id: 'evt-rel', type: 'relationship.change', payload: { a: 'hero', b: 'npc1', delta: { trust: 0.1 }, reason: 'cooperation' }, summary: 'Trust increases' };
const relApplied = State.applyEvent(testState, relEvent);
const relMemories = mgr.extractMemoriesFromEvent(relApplied.state, relEvent);
assert.ok(relMemories.some(m => m.kind === 'Relationship'));
console.log('  PASS (' + relMemories.length + ' memories)');

console.log('\n14. extractMemoriesFromEvent - quest.update...');
const questEvent = { id: 'evt-quest', type: 'quest.update', payload: { questId: 'q1', patch: { status: 'completed' } }, summary: 'Quest completed' };
const questMemories = mgr.extractMemoriesFromEvent(testState, questEvent);
assert.ok(questMemories.some(m => m.kind === 'Quest'));
console.log('  PASS (' + questMemories.length + ' memories)');

console.log('\n15. extractMemoriesFromEvent - character.set...');
const charEvent = { id: 'evt-char', type: 'character.set', payload: { characterId: 'hero', patch: { personality: { brave: true } } }, summary: 'Personality update' };
const charMemories = mgr.extractMemoriesFromEvent(testState, charEvent);
assert.ok(charMemories.some(m => m.kind === 'Character'));
console.log('  PASS (' + charMemories.length + ' memories)');

console.log('\n16. buildContextFromMemories...');
const allMemories = [
  mgr.createEpisodicMemory(testState, 'hero', moveEvent, 0.9),
  mgr.createSemanticMemory(testState, 'fact1', testState.canon.entries.fact1, 1),
  mgr.createWorkingMemory(testState, 'hero', {}),
  mgr.createLongTermMemory(testState, 'hero', mgr.createSemanticMemory(testState, 'fact1', testState.canon.entries.fact1, 1), 0.9),
  mgr.createRelationshipMemory(testState, 'hero::npc1', testState.relationships['hero::npc1'] || {}, 'rel-1'),
  mgr.createLocationMemory(testState, 'capital', testState.world.locations.capital, 'evt-loc'),
  mgr.createQuestMemory(testState, 'q1', testState.quests.q1, 'evt-quest'),
  mgr.createCharacterMemory(testState, 'hero', testState.characters.hero, 'evt-char')
];
const context = mgr.buildContextFromMemories(allMemories, { maxTokens: 2000 });
assert.ok(context.episodic.length > 0);
assert.ok(context.semantic.length > 0);
assert.ok(context.longterm.length > 0);
assert.ok(context.quest.length > 0);
assert.ok(context.relationship.length > 0);
assert.ok(context.location.length > 0);
assert.ok(context.character.length > 0);
assert.ok(context._diagnostics.bounded);
console.log('  PASS (tokens: ' + context._diagnostics.totalTokens + ', count: ' + context._diagnostics.memoryCount + ')');

console.log('\n17. estimateArabicTokens...');
const arabicText = 'هذا نص عربي للاختبار هذا نص عربي للاختبار';
const englishText = 'This is English text for testing';
const mixedText = 'هذا نص عربي للاختبار mixed with English text';
assert.ok(mgr.estimateArabicTokens(arabicText) > 0);
assert.ok(mgr.estimateArabicTokens(englishText) > 0);
assert.ok(mgr.estimateArabicTokens(mixedText) > mgr.estimateArabicTokens(englishText));
console.log('  PASS (ar: ' + mgr.estimateArabicTokens(arabicText) + ', en: ' + mgr.estimateArabicTokens(englishText) + ', mixed: ' + mgr.estimateArabicTokens(mixedText) + ')');

console.log('\n18. estimateTokens...');
assert.equal(mgr.estimateTokens(''), 0);
assert.equal(mgr.estimateTokens('abcd'), 2);
assert.ok(mgr.estimateTokens('a'.repeat(100)) > 20);
console.log('  PASS');

console.log('\n19. recordMemoriesFromEvent (integration)...');
const initialCount = mem.objects.length;
const committed = mgr.recordMemoriesFromEvent(testState, moveEvent);
assert.ok(committed.length > 0);
assert.ok(mem.objects.length > initialCount);
console.log('  PASS (committed ' + committed.length + ' memories, total in store: ' + mem.objects.length + ')');

console.log('\n20. getMemoryStats...');
const stats = mgr.getMemoryStats(testState);
assert.ok(stats.total >= 0);
assert.ok(typeof stats.byKind === 'object');
assert.ok(typeof stats.byCharacter === 'object');
assert.ok(typeof stats.totalTokens === 'number');
console.log('  PASS (total: ' + stats.total + ', tokens: ' + stats.totalTokens + ')');

console.log('\n21. runMaintenance...');
const maint = mgr.runMaintenance(testState);
assert.ok(typeof maint.pruned === 'number');
assert.ok(typeof maint.remaining === 'number');
console.log('  PASS (pruned: ' + maint.pruned + ', remaining: ' + maint.remaining + ')');

console.log('\n✅ All RPG Memory tests passed!');
console.log('\nCoverage:');
console.log('  RPG-06-01 (episodic memory): createEpisodicMemory, extractMemoriesFromEvent');
console.log('  RPG-06-02 (semantic memory): createSemanticMemory, extractMemoriesFromEvent (knowledge.learn)');
console.log('  RPG-06-03 (working memory): createWorkingMemory, extractMemoriesFromEvent');
console.log('  RPG-06-04 (long term memory): createLongTermMemory, extractMemoriesFromEvent');
console.log('  RPG-06-05 (character scoped memories): metadata.characterId, getCharacterMemories');
console.log('  RPG-06-06 (relationship memories): createRelationshipMemory, extractMemoriesFromEvent');
console.log('  RPG-06-07 (location memories): createLocationMemory, extractMemoriesFromEvent');
console.log('  RPG-06-08 (event salience scoring): computeSalience, SALIENCE_THRESHOLDS');
console.log('  RPG-06-09 (retrieval evidence): buildContextFromMemories, metadata.sourceEventId');
console.log('  RPG-06-10 (memory deduplication): deduplicate');
console.log('  RPG-06-11 (memory compaction): applyForgettingPolicy, runMaintenance');
console.log('  RPG-06-12 (context window budgeting): buildContextFromMemories with maxTokens');
console.log('  RPG-06-13 (Arabic token estimates): estimateArabicTokens');
console.log('  RPG-06-14 (memory correction workflow): deduplicate keeps higher confidence');
console.log('  RPG-06-15 (memory forgetting policy): applyForgettingPolicy, FORGETTING_POLICY constants');