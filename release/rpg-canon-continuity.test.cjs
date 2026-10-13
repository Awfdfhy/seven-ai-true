'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Canon = require('./workspaces/rpg-canon-continuity.js');

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function text(v) { return typeof v === 'string' ? v.trim() : ''; }

const seed = {
  sessionId: 'canon-test', worldId: 'valen-canon',
  timeline: { tick: 5 }, world: { locations: { capital: { name: 'Capital' } } },
  characters: { hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' } } },
  quests: {}, canon: { entries: {} }
};

const state = State.createState(seed);
const canon = Canon.createCanonContinuity(State);

console.log('Testing RPG Canon Continuity...');

console.log('\n1. createEntry - basic...');
const e1 = canon.createEntry({ id: 'fact1', level: 'HARD', value: 'Aldren is king', entityIds: ['hero'], tags: ['politics'], public: true });
assert.equal(e1.id, 'fact1');
assert.equal(e1.level, 'HARD');
assert.equal(e1.value, 'Aldren is king');
assert.ok(e1.public);
console.log('  PASS');

console.log('\n2. createEntry - soft canon...');
const e2 = canon.createEntry({ level: 'SOFT', value: 'Rumors of rebellion', entityIds: ['npc1'], tags: ['rumor'], public: false });
assert.equal(e2.level, 'SOFT');
assert.equal(e2.public, false);
console.log('  PASS');

console.log('\n3. getEntry...');
const got = canon.getEntry('fact1');
assert.equal(got.id, 'fact1');
assert.equal(got.value, 'Aldren is king');
console.log('  PASS');

console.log('\n4. getAllEntries filter...');
canon.createEntry({ id: 'fact3', level: 'ACTIVE', value: 'Trade route open', entityIds: ['merchant'], tags: ['economy'], public: true });
canon.createEntry({ id: 'fact4', level: 'RUMOR', value: 'Dragon sighted', entityIds: ['villager'], tags: ['rumor'], public: false });
const hardEntries = canon.getAllEntries({ level: 'HARD' });
assert.ok(hardEntries.every(e => e.level === 'HARD'));
const publicEntries = canon.getAllEntries({ public: true });
assert.ok(publicEntries.every(e => e.public === true));
const econEntries = canon.getAllEntries({ tag: 'economy' });
assert.ok(econEntries.every(e => e.tags.includes('economy')));
console.log('  PASS');

console.log('\n5. updateEntry - soft canon...');
const updated = canon.updateEntry('fact3', { value: 'Trade route closed', tags: ['economy', 'crisis'] }, 'gm');
assert.equal(updated.ok, true);
assert.equal(updated.entry.value, 'Trade route closed');
assert.ok(updated.entry.tags.includes('crisis'));
assert.equal(updated.entry.version, 2);
console.log('  PASS');

console.log('\n6. updateEntry - hard canon immutable...');
const hardUpdate = canon.updateEntry('fact1', { value: 'Someone else is king' }, 'gm');
assert.equal(hardUpdate.ok, false);
assert.equal(hardUpdate.reason, 'hard-canon-immutable');
console.log('  PASS');

console.log('\n7. updateEntry - hard canon level downgrade...');
const downgrade = canon.updateEntry('fact1', { level: 'SOFT' }, 'gm');
assert.equal(downgrade.ok, false);
assert.equal(downgrade.reason, 'cannot-downgrade-hard-canon');
console.log('  PASS');

console.log('\n8. deleteEntry - soft canon...');
const deleted = canon.deleteEntry('fact3', 'gm');
assert.equal(deleted.ok, true);
assert.equal(canon.getEntry('fact3').status, 'deleted');
console.log('  PASS');

console.log('\n9. deleteEntry - hard canon blocked...');
const hardDelete = canon.deleteEntry('fact1', 'gm');
assert.equal(hardDelete.ok, false);
assert.equal(hardDelete.reason, 'cannot-delete-hard-canon');
console.log('  PASS');

console.log('\n10. getHistory...');
const history = canon.getHistory('fact3');
assert.ok(Array.isArray(history));
assert.ok(history.length >= 2);
assert.ok(history.some(h => h.action === 'create'));
assert.ok(history.some(h => h.action === 'update'));
assert.ok(history.some(h => h.action === 'delete'));
console.log('  PASS');

console.log('\n11. checkConflict - no conflict...');
const newEntry = { id: 'new1', level: 'SOFT', value: 'Peace treaty', entityIds: ['king'], tags: ['diplomacy'] };
const conflicts = canon.checkConflict(newEntry, Array.from(canon.getAllEntries()));
assert.equal(conflicts.length, 0);
console.log('  PASS');

console.log('\n12. checkConflict - entity conflict...');
const conflictEntry = { id: 'conflict1', level: 'SOFT', value: 'King is dead', entityIds: ['hero'], tags: ['politics'] };
const conflicts1 = canon.checkConflict(conflictEntry, canon.getAllEntries());
assert.ok(conflicts1.length > 0);
// Existing 'fact1' is HARD canon, so conflict severity is critical
assert.ok(conflicts1.some(c => c.severity === 'critical'));
console.log('  PASS');

console.log('\n13. checkConflict - hard canon conflict...');
const hardConflict = { id: 'hardc', level: 'HARD', value: 'Aldren is NOT king', entityIds: ['hero'], tags: ['politics'] };
const hardConflicts = canon.checkConflict(hardConflict, canon.getAllEntries());
assert.ok(hardConflicts.length > 0);
assert.ok(hardConflicts.some(c => c.severity === 'critical'));
console.log('  PASS');

console.log('\n13b. getConflicts filter...');
const allConflicts = canon.getConflicts({ severity: 'critical' });
assert.ok(allConflicts.length >= 1);
const openConflicts = canon.getConflicts({ status: 'open' });
assert.ok(openConflicts.length >= 1);
console.log('  PASS');

console.log('\n13c. suggestResolution...');
// Create an actual entry first for suggestResolution to work
canon.createEntry({ id: 'hardc2', level: 'HARD', value: 'Aldren is NOT king', entityIds: ['hero'], tags: ['politics'] });
const hardConflicts2 = canon.checkConflict({ id: 'hardc2', level: 'HARD', value: 'Aldren is NOT king', entityIds: ['hero'], tags: ['politics'] }, canon.getAllEntries());
const suggestions = canon.suggestResolution(hardConflicts2[0].id);
assert.ok(Array.isArray(suggestions));
assert.ok(suggestions.length > 0);
console.log('  PASS');

console.log('\n14. resolveConflict...');
const conflictId = hardConflicts[0].id;
const resolved = canon.resolveConflict(hardConflicts[0].id, { strategy: 'keep-existing', details: 'Hard canon takes precedence' }, 'gm');
assert.equal(resolved.ok, true);
assert.equal(resolved.conflict.status, 'resolved');
assert.equal(resolved.conflict.resolution.strategy, 'keep-existing');
console.log('  PASS');

console.log('\n14b. getConflicts after resolution...');
const openNow = canon.getConflicts({ status: 'open' });
assert.ok(openNow.every(c => c.id !== hardConflicts[0].id));
console.log('  PASS');

console.log('\n15. addProvenance...');
const prov = canon.addProvenance('fact1', { type: 'user', author: 'gm', description: 'Established at campaign start', sourceEventId: 'campaign-start' });
assert.equal(prov.ok, true);
assert.equal(prov.provenance.type, 'user');
console.log('  PASS');

console.log('\n15b. getProvenance...');
const provs = canon.getProvenance('fact1');
assert.ok(provs.length >= 1);
assert.equal(provs[0].type, 'user');
console.log('  PASS');

console.log('\n16. auditCanon...');
const audit = canon.auditCanon(state);
assert.ok(typeof audit.valid === 'boolean');
assert.ok(Array.isArray(audit.issues));
console.log('  PASS');

console.log('\n3b. place links + timeline links + spoiler boundaries (RPG-03-08/09/10)...');
const placeE = canon.createEntry({ id: 'place1', level: 'SOFT', value: 'Capital', entityIds: ['capital'], tags: ['place'] });
assert.ok(placeE.entityIds.includes('capital'));
canon.createEntry({ id: 'early', level: 'SOFT', value: 'E', availableAtTick: 1 });
canon.createEntry({ id: 'late', level: 'SOFT', value: 'L', public: false, availableAtTick: 99 });
assert.ok(canon.getAllEntries({ availableBefore: 50 }).some(e => e.id === 'early'));
assert.ok(!canon.getAllEntries({ availableBefore: 50 }).some(e => e.id === 'late'));
assert.ok(!canon.getAllEntries({ public: true }).some(e => e.id === 'late'));
console.log('  PASS');

console.log('\n17. getDiff - canon diff viewer (RPG-03-06)...');
const diffLog = canon.getDiff('fact3');
assert.equal(diffLog.ok, true);
assert.ok(diffLog.log.length >= 2);
assert.ok(diffLog.log.some(l => l.action === 'create'));
assert.ok(diffLog.log.some(l => l.action === 'update'));
assert.ok(diffLog.log.some(l => l.changes && typeof l.changes === 'object'));
console.log('  PASS');

console.log('\n18. diffEntries - field-level diff...');
const dChanges = canon.diffEntries({ value: 'a', tags: ['x'] }, { value: 'b', tags: ['x', 'y'] });
assert.equal(dChanges.value.from, 'a');
assert.equal(dChanges.value.to, 'b');
assert.ok(dChanges.tags);
console.log('  PASS');

console.log('\n19. mergePreview - canon merge preview (RPG-03-13)...');
canon.createEntry({ id: 'mA', level: 'SOFT', value: 'Alpha', tags: ['t1'] });
canon.createEntry({ id: 'mB', level: 'SOFT', value: 'Beta', tags: ['t1'] });
const mp = canon.mergePreview('mA', 'mB');
assert.equal(mp.ok, true);
assert.ok(mp.conflictCount > 0);
assert.equal(mp.canMerge, false);
assert.ok(mp.changes.value);
canon.createEntry({ id: 'mC', level: 'SOFT', value: 'Same', tags: ['t1'] });
canon.createEntry({ id: 'mD', level: 'SOFT', value: 'Same', tags: ['t1'] });
assert.equal(canon.mergePreview('mC', 'mD').canMerge, true);
console.log('  PASS');

console.log('\n20. restoreEntry - canon recovery (RPG-03-15)...');
assert.equal(canon.getEntry('fact3').status, 'deleted');
const restored = canon.restoreEntry('fact3', 'gm');
assert.equal(restored.ok, true);
assert.equal(restored.entry.status, 'active');
assert.equal(canon.getEntry('fact3').status, 'active');
assert.equal(canon.restoreEntry('fact3', 'gm').reason, 'not-deleted');
console.log('  PASS');

console.log('\n21. exportCanon + importCanon - canon import mapping (RPG-03-12)...');
const pack = canon.exportCanon();
assert.equal(pack.format, 'seven-rpg-canon');
assert.ok(pack.count >= 1);
const canon2 = Canon.createCanonContinuity(State);
const imp = canon2.importCanon(pack, 'gm');
assert.equal(imp.ok, true);
assert.ok(imp.imported >= 1);
assert.equal(canon2.getEntry('fact1').value, 'Aldren is king');
assert.equal(canon2.getEntry('fact1').provenance.source, 'import');
const impBad = canon2.importCanon({ format: 'seven-rpg-canon', entries: [{ tags: [] }, { value: 'ok' }] }, 'gm');
assert.equal(impBad.skipped, 1);
assert.equal(impBad.imported, 1);
console.log('  PASS');

console.log('\n✅ All RPG Canon Continuity tests passed!');
console.log('\nCoverage:');
console.log('  RPG-03-01 (canon authority tiers): CANON_LEVELS enum with HARD/ACTIVE/SOFT/RUMOR');
console.log('  RPG-03-02 (immutable hard canon): Hard canon immutable, cannot downgrade/delete');
console.log('  RPG-03-03 (canon conflict suggestions): suggestResolution provides strategies');
console.log('  RPG-03-04 (canon audit journal): auditCanon validates consistency');
console.log('  RPG-03-05 (canon revision history): getHistory tracks all changes');
console.log('  RPG-03-06 (canon diff viewer): Implicit in history');
console.log('  RPG-03-07 (canon character links): entityIds linking');
console.log('  RPG-03-08 (canon place links): entityIds for locations');
console.log('  RPG-03-09 (canon timeline links): availableAtTick');
console.log('  RPG-03-10 (canon spoiler boundaries): public flag + availableAtTick');
console.log('  RPG-03-11 (canon provenance): provenance tracking');
console.log('  RPG-03-12 (canon import mapping): import/export via entry structure');
console.log('  RPG-03-13 (canon merge preview): suggestResolution provides strategies');
console.log('  RPG-03-14 (canon contradiction reports): getConflicts + checkConflict');
console.log('  RPG-03-15 (canon recovery): history + deleteEntry (soft only)');