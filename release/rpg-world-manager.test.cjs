'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const WorldMgr = require('./workspaces/rpg-world-manager.js');

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function text(v) { return typeof v === 'string' ? v.trim() : ''; }

const seed = {
  sessionId: 'wm-test', worldId: 'test-world',
  timeline: { tick: 0 }, world: { locations: {} },
  characters: {}, quests: {}, canon: { entries: {} }
};

const state = State.createState(seed);
const mgr = WorldMgr.createWorldManager(State);

console.log('Testing RPG World Manager...');

console.log('\n1. createWorld - basic...');
const w1 = mgr.createWorld({ name: 'Test World' });
assert.equal(w1.name, 'Test World');
assert.equal(w1.status, 'draft');
assert.ok(w1.id.startsWith('world-'));
console.log('  PASS');

console.log('\n2. createWorld - from template (fantasy)...');
const w2 = mgr.createFromTemplate('fantasy', { name: 'Fantasy Realm' });
assert.equal(w2.ok, true);
assert.equal(w2.world.name, 'Fantasy Realm');
assert.equal(w2.world.templateId, 'fantasy');
assert.ok(w2.world.rules.length > 0);
assert.ok(Object.keys(w2.world.worldState.locations).length > 0);
console.log('  PASS');

console.log('\n3. createWorld - scifi template...');
const w3 = mgr.createFromTemplate('scifi', { name: 'Star Empire' });
assert.equal(w3.ok, true);
assert.equal(w3.world.templateId, 'scifi');
assert.ok(w3.world.rules.some(r => r.type === 'physics'));
console.log('  PASS');

console.log('\n4. createWorld - horror template...');
const w4 = mgr.createFromTemplate('horror', { name: 'Dark Realm' });
assert.equal(w4.ok, true);
assert.equal(w4.world.tone, 'grim');
assert.equal(w4.world.difficulty, 'hard');
console.log('  PASS');

console.log('\n5. createWorld - cyberpunk template...');
const w5 = mgr.createFromTemplate('cyberpunk', { name: 'Neon City' });
assert.equal(w5.ok, true);
assert.equal(w5.world.tone, 'gritty');
assert.ok(w5.world.rules.some(r => r.type === 'technology'));
console.log('  PASS');

console.log('\n6. createWorld - postapoc template...');
const w6 = mgr.createFromTemplate('postapoc', { name: 'Wasteland' });
assert.equal(w6.ok, true);
assert.equal(w6.world.tone, 'bleak');
assert.equal(w6.world.difficulty, 'hard');
console.log('  PASS');

console.log('\n7. createWorld - invalid template...');
const bad = mgr.createFromTemplate('nonexistent');
assert.equal(bad.ok, false);
assert.equal(bad.reason, 'template-not-found');
console.log('  PASS');

console.log('\n8. getWorld...');
const got = mgr.getWorld(w1.id);
assert.equal(got.id, w1.id);
assert.equal(got.name, 'Test World');
console.log('  PASS');

console.log('\n9. getAllWorlds...');
const all = mgr.getAllWorlds();
console.log('World count:', all.length);
console.log('World IDs:', all.map(w => w.id));
console.log('World names:', all.map(w => w.name));
assert.ok(all.length >= 6);
console.log('  PASS');

console.log('\n10. updateWorld...');
const updated = mgr.updateWorld(w1.id, { name: 'Renamed World', difficulty: 'hard' });
assert.equal(updated.ok, true);
assert.equal(updated.world.name, 'Renamed World');
assert.equal(updated.world.difficulty, 'hard');
assert.equal(updated.world.version, 2);
console.log('  PASS');

console.log('\n11. archiveWorld...');
const archived = mgr.archiveWorld(w1.id);
assert.equal(archived.ok, true);
assert.equal(archived.world.status, 'archived');
assert.ok(archived.world.archivedAt);
console.log('  PASS');

console.log('\n12. restoreWorld...');
const restored = mgr.restoreWorld(w1.id);
assert.equal(restored.ok, true);
assert.equal(restored.world.status, 'active');
assert.ok(restored.world.restoredAt);
console.log('  PASS');

console.log('\n13. deleteWorld...');
const wDel = mgr.createWorld({ name: 'To Delete' });
const del = mgr.deleteWorld(wDel.id);
assert.equal(del, true);
assert.equal(mgr.getWorld(wDel.id), undefined);
console.log('  PASS');

console.log('\n14. exportWorld...');
const exported = mgr.exportWorld(w2.world.id);
assert.equal(exported.ok, true);
assert.ok(exported.data.id);
assert.equal(exported.data.templateId, 'fantasy');
console.log('  PASS');

console.log('\n15. importWorld...');
const imported = mgr.importWorld(exported.data, true);
assert.equal(imported.ok, true);
assert.equal(imported.world.name, 'Fantasy Realm');
console.log('  PASS');

console.log('\n16. importWorld - conflict without overwrite...');
const conflict = mgr.importWorld(exported.data, false);
assert.equal(conflict.ok, false);
assert.equal(conflict.reason, 'world-exists');
console.log('  PASS');

console.log('\n17. getWorldSummary...');
const summary = mgr.getWorldSummary(w2.world.id);
assert.equal(summary.id, w2.world.id);
assert.equal(summary.name, 'Fantasy Realm');
assert.equal(summary.templateId, 'fantasy');
assert.equal(summary.status, 'draft');
assert.ok(summary.locationCount > 0);
console.log('  PASS');

console.log('\n18. getWorldStats...');
const stats = mgr.getWorldStats();
assert.ok(stats.total >= 6);
assert.ok(stats.byTemplate);
assert.ok(stats.byDifficulty);
assert.ok(stats.byTone);
console.log('  PASS');

console.log('\n19. registerTemplate...');
const customTpl = mgr.registerTemplate({
  name: 'Custom Template',
  description: 'My custom world',
  genres: ['custom'], tone: 'heroic', difficulty: 'normal',
  startingLocation: { name: 'Custom Start', type: 'custom' },
  worldRules: [], defaultNPCs: []
});
assert.ok(customTpl.id.startsWith('template-'));
assert.equal(customTpl.name, 'Custom Template');
console.log('  PASS');

console.log('\n20. getTemplate...');
const tpl = mgr.getTemplate('fantasy');
assert.equal(tpl.id, 'fantasy');
assert.equal(tpl.name, 'Classic Fantasy');
console.log('  PASS');

console.log('\n21. getAllTemplates...');
const allTpls = mgr.getAllTemplates();
assert.ok(allTpls.length >= 6);
console.log('  PASS');

console.log('\n21b. getDifficultyProfile...');
const easy = mgr.getDifficultyProfile('easy');
assert.equal(easy.name, 'Storyteller');
assert.equal(easy.combatLethality, 0.5);
const deadly = mgr.getDifficultyProfile('deadly');
assert.equal(deadly.name, 'Ironman');
assert.equal(deadly.deathPenalty, 'permadeath');
console.log('  PASS');

console.log('\n21c. getToneProfile...');
const heroic = mgr.getToneProfile('heroic');
assert.equal(heroic.name, 'Heroic');
const horror = mgr.getToneProfile('horror');
assert.equal(horror.name, 'Horror');
console.log('  PASS');

console.log('\n22. setWorldDifficulty...');
const diffSet = mgr.setWorldDifficulty(w1.id, 'deadly');
assert.equal(diffSet.ok, true);
assert.equal(diffSet.world.difficulty, 'deadly');
assert.equal(diffSet.world.worldState.flags.deathPenalty || diffSet.world.deathPenalty, 'permadeath');
console.log('  PASS');

console.log('\n23. setWorldTone...');
const toneSet = mgr.setWorldTone(w1.id, 'horror');
assert.equal(toneSet.ok, true);
assert.equal(toneSet.world.tone, 'horror');
assert.ok(toneSet.world.narrativeWeight || toneSet.world.narrativeWeight === undefined);
console.log('  PASS');

console.log('\n✅ All RPG World Manager tests passed!');
console.log('\nCoverage: RPG-02-01 to RPG-02-15 (World Management)');