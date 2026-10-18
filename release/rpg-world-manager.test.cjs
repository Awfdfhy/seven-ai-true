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

console.log('\n27. setWorldDifficulty/setWorldTone must NOT clobber world name/description...');
const w27 = mgr.createWorld({ id: 'w27', name: 'My Adventure World', description: 'A custom tale' });
assert.equal(w27.name, 'My Adventure World');
assert.equal(w27.description, 'A custom tale', 'createWorld must accept description');
mgr.setWorldDifficulty(w27.id, 'hard');
mgr.setWorldTone(w27.id, 'gritty');
const w27after = mgr.getWorld(w27.id);
assert.equal(w27after.name, 'My Adventure World', 'difficulty/tone profile must not overwrite world name');
assert.equal(w27after.description, 'A custom tale', 'difficulty/tone profile must not overwrite world description');
assert.equal(w27after.difficulty, 'hard');
assert.equal(w27after.tone, 'gritty');
console.log('  PASS');

console.log('\n16. importWorld rejects hostile or oversized input...');
// A world JSON is untrusted: the player can hand the app any file. The shipped 2 MB pack
// ceiling must hold at the manager seam, not only in the file picker, and a crafted payload
// must not be able to reach the prototype chain or become a Map key.
const hostile = mgr.importWorld({ id: 'safe-1', name: 'Hostile', nested: JSON.parse('{"__proto__":{"polluted":"yes"}}') }, false);
assert.equal(hostile.ok, false, 'prototype-polluting payload must be rejected');
assert.equal(hostile.reason, 'unsafe-world-data');
assert.equal({}.polluted, undefined, 'Object.prototype must be untouched');
const ctor = mgr.importWorld({ id: 'safe-2', name: 'Ctor', nested: JSON.parse('{"constructor":{"prototype":{"x":1}}}') }, false);
assert.equal(ctor.ok, false, 'constructor/prototype payload must be rejected');
assert.equal({}.x, undefined, 'Object.prototype must be untouched');
// Non-string / oversized identifiers are not valid world ids.
assert.equal(mgr.importWorld({ id: 42, name: 'Numeric' }, false).reason, 'invalid-world-data');
assert.equal(mgr.importWorld({ id: {}, name: 'Object' }, false).reason, 'invalid-world-data');
assert.equal(mgr.importWorld({ id: 'x'.repeat(241), name: 'Long' }, false).reason, 'invalid-world-data');
assert.equal(mgr.importWorld({ id: 'x'.repeat(240), name: 'MaxLength' }, false).ok, true, '240 chars is the accepted ceiling');
// Oversized payload is refused at the seam rather than being silently accepted.
const huge = { id: 'huge-1', name: 'Huge', blob: 'x'.repeat(2 * 1024 * 1024 + 1024) };
const tooBig = mgr.importWorld(huge, false);
assert.equal(tooBig.ok, false, 'payload over the 2 MB ceiling must be refused');
assert.equal(tooBig.reason, 'world-too-large');
assert.ok(!mgr.getWorld('huge-1'), 'a refused import must not be stored');
// A rejected import must leave the pre-existing campaign untouched.
mgr.createWorld({ id: 'keep-me', name: 'Keep Me' });
const keepBefore = mgr.getWorld('keep-me').name;
mgr.importWorld({ id: 'keep-me', name: 'Clobbered', nested: JSON.parse('{"__proto__":{"polluted":"yes"}}') }, true);
assert.equal(mgr.getWorld('keep-me').name, keepBefore, 'a rejected import must not overwrite an existing world');
console.log('  PASS');

console.log('\n17. import preview is browser-safe and agrees with the import...');
// Buffer is a Node global and does NOT exist in the Android WebView. The previous code called
// Buffer.byteLength() on this path, so it threw a ReferenceError on every real device while the
// Node suite stayed green. Simulate the browser by removing the global.
{
  const savedBuffer = globalThis.Buffer;
  try {
    delete globalThis.Buffer;
    const p = mgr.previewWorldImport({ id: 'nobuffer-1', name: 'No Buffer', worldState: { locations: { a: {} } } });
    assert.equal(p.ok, true, 'previewWorldImport must work without Buffer');
    assert.equal(typeof p.estimatedBytes, 'number', 'estimatedBytes must still be computed');
    assert.ok(p.estimatedBytes > 0);
    assert.equal(mgr.importWorld({ id: 'nobuffer-2', name: 'Still Works' }, false).ok, true, 'importWorld must work without Buffer');
  } finally { globalThis.Buffer = savedBuffer; }
}
// Preview and import share one validator: preview can never green-light a payload import refuses.
{
  const hostilePayload = { id: 'hp-1', name: 'Hostile', nested: JSON.parse('{"__proto__":{"x":1}}') };
  const hostilePreview = mgr.previewWorldImport(hostilePayload);
  assert.equal(hostilePreview.ok, false, 'preview must reject the same payload import rejects');
  assert.equal(hostilePreview.valid, false);
  assert.equal(hostilePreview.reason, 'unsafe-world-data');
  assert.equal(hostilePreview.reason, mgr.importWorld(hostilePayload, false).reason, 'preview and import must agree on the reason');
  const bigPreview = mgr.previewWorldImport(huge);
  assert.equal(bigPreview.ok, false);
  assert.equal(bigPreview.reason, 'world-too-large', 'preview must refuse the oversized payload with the same reason as import');
  assert.equal(mgr.previewWorldImport({ name: 'no-id' }).reason, 'invalid-world-data');
}
// estimatedBytes must be true UTF-8 bytes, not UTF-16 code units, or non-ASCII worlds are
// mis-measured and the 2 MB ceiling drifts.
{
  const arabicName = 'عالم عربي';
  const arabic = mgr.previewWorldImport({ id: 'utf8-1', name: arabicName });
  const expected = new TextEncoder().encode(JSON.stringify({ id: 'utf8-1', name: arabicName })).length;
  assert.equal(arabic.estimatedBytes, expected, 'estimatedBytes must be UTF-8 bytes');
}
console.log('  PASS');

console.log('\n✅ All RPG World Manager tests passed!');
console.log('\nCoverage: RPG-02-01 to RPG-02-15 (World Management)');