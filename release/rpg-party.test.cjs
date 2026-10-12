'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Party = require('./workspaces/rpg-party.js');

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function text(v) { return typeof v === 'string' ? v.trim() : ''; }

const seed = {
  sessionId: 'party-test', worldId: 'valen-party',
  timeline: { tick: 0 },
  world: { locations: { capital: { name: 'Capital' }, dungeon: { name: 'Dungeon' } } },
  characters: {
    hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' }, level: 5, stats: { hp: 100, mp: 50 } },
    tank: { control: 'ai', locationId: 'capital', identity: { name: 'Tank' }, level: 4, stats: { hp: 150, mp: 30 } },
    healer: { control: 'ai', locationId: 'capital', identity: { name: 'Healer' }, level: 3, stats: { hp: 80, mp: 100 } },
    dps: { control: 'ai', locationId: 'capital', identity: { name: 'DPS' }, level: 4, stats: { hp: 90, mp: 40 } },
    scout: { control: 'ai', locationId: 'capital', identity: { name: 'Scout' }, level: 3, stats: { hp: 70, mp: 30 } },
    extra: { control: 'ai', locationId: 'capital', identity: { name: 'Extra' }, level: 2, stats: { hp: 60, mp: 20 } },
    extra2: { control: 'ai', locationId: 'capital', identity: { name: 'Extra2' }, level: 2, stats: { hp: 60, mp: 20 } }
  },
  quests: {},
  canon: { entries: {} }
};

const state = State.createState(seed);
const mgr = Party.createPartyManager(State);

console.log('Testing RPG Party System...');

console.log('\n1. createParty - basic...');
const party1 = mgr.createParty({ name: 'Heroes of Valen', memberIds: ['hero', 'tank', 'healer'], formation: 'standard' });
assert.equal(party1.name, 'Heroes of Valen');
assert.deepEqual(party1.memberIds, ['hero', 'tank', 'healer']);
assert.equal(party1.formation, 'standard');
assert.ok(party1.id.startsWith('party-'));
console.log('  PASS');

console.log('\n2. createParty - with roles and resources...');
const party2 = mgr.createParty({
  name: 'Delvers',
  memberIds: ['hero', 'tank', 'healer', 'dps'],
  formation: 'defensive',
  roles: { hero: 'leader', tank: 'tank', healer: 'healer', dps: 'damage' },
  sharedResources: { 'healing-potion': 5, 'mana-potion': 3 },
  tactics: [{ id: 't1', name: 'Focus Fire', trigger: 'combat-start', actions: [{ type: 'attack', target: 'boss' }], priority: 10 }]
});
assert.equal(party2.formation, 'defensive');
assert.equal(party2.roles.hero, 'leader');
assert.equal(party2.sharedResources['healing-potion'], 5);
assert.equal(party2.tactics.length, 1);
assert.equal(party2.tactics[0].id, 't1');
console.log('  PASS');

console.log('\n3. validateParty - valid party...');
const valid = mgr.validateParty(state, party2);
assert.equal(valid.valid, true);
console.log('  PASS');

console.log('\n4. validateParty - empty party...');
const empty = mgr.createParty({ name: 'Empty', memberIds: [] });
const emptyVal = mgr.validateParty(state, empty);
assert.equal(emptyVal.valid, false);
assert.ok(emptyVal.issues.some(i => i.code === 'empty-party'));
console.log('  PASS');

console.log('\n5. validateParty - oversized party...');
const bigParty = mgr.createParty({ name: 'Big', memberIds: ['hero', 'tank', 'healer', 'dps', 'scout', 'extra', 'extra2'] });
const bigVal = mgr.validateParty(state, bigParty);
assert.equal(bigVal.valid, false);
assert.ok(bigVal.issues.some(i => i.code === 'oversized-party'));
console.log('  PASS');

console.log('\n6. validateParty - missing character...');
const badParty = mgr.createParty({ name: 'Bad', memberIds: ['hero', 'nonexistent'] });
const badVal = mgr.validateParty(state, badParty);
assert.equal(badVal.valid, false);
assert.ok(badVal.issues.some(i => i.code === 'missing-character'));
console.log('  PASS');

console.log('\n7. validateParty - invalid role...');
const badRoleParty = mgr.createParty({ name: 'BadRole', memberIds: ['hero'], roles: { hero: 'invalid-role' } });
const badRoleVal = mgr.validateParty(state, badRoleParty);
console.log('Validation result:', JSON.stringify(badRoleVal, null, 2));
assert.equal(badRoleVal.valid, false);
assert.ok(badRoleVal.issues.some(i => i.code === 'invalid-role'));
console.log('  PASS');

console.log('\n8. addMember - success...');
const party3 = mgr.createParty({ name: 'Small', memberIds: ['hero'] });
const addResult = mgr.addMember(state, party3, 'tank');
assert.equal(addResult.ok, true);
assert.ok(addResult.party.memberIds.includes('tank'));
assert.equal(addResult.party.memberIds.length, 2);
console.log('  PASS');

console.log('\n9. addMember - party full...');
const fullParty = mgr.createParty({ name: 'Full', memberIds: ['hero', 'tank', 'healer', 'dps', 'scout', 'extra'] });
const fullAdd = mgr.addMember(state, fullParty, 'extra2');
assert.equal(fullAdd.ok, false);
assert.equal(fullAdd.reason, 'party-full');
console.log('  PASS');

console.log('\n10. addMember - already member...');
const dupAdd = mgr.addMember(state, party3, 'hero');
assert.equal(dupAdd.ok, false);
assert.equal(dupAdd.reason, 'already-member');
console.log('  PASS');

console.log('\n11. removeMember...');
const remResult = mgr.removeMember(party2, 'dps');
assert.equal(remResult.ok, true);
assert.ok(!remResult.party.memberIds.includes('dps'));
assert.ok(!remResult.party.roles.dps);
console.log('  PASS');

console.log('\n12. setFormation...');
const formResult = mgr.setFormation(party2, 'aggressive');
assert.equal(formResult.ok, true);
assert.equal(formResult.party.formation, 'aggressive');
const badForm = mgr.setFormation(party2, 'invalid');
assert.equal(badForm.ok, false);
console.log('  PASS');

console.log('\n13. assignRole...');
// Add scout to party first
const partyWithScout = mgr.addMember(state, party2, 'scout');
assert.equal(partyWithScout.ok, true);
const roleResult = mgr.assignRole(partyWithScout.party, 'scout', 'scout');
assert.equal(roleResult.ok, true);
assert.equal(roleResult.party.roles.scout, 'scout');
const badRole = mgr.assignRole(partyWithScout.party, 'hero', 'invalid');
assert.equal(badRole.ok, false);
const nonMember = mgr.assignRole(partyWithScout.party, 'extra2', 'damage');
assert.equal(nonMember.ok, false);
console.log('  PASS');

console.log('\n14. shareResource / consumeResource...');
const resParty = mgr.createParty({ name: 'Res', memberIds: ['hero'] });
const share = mgr.shareResource(resParty, 'gold', 100);
assert.equal(share.ok, true);
assert.equal(share.party.sharedResources.gold, 100);
const share2 = mgr.shareResource(share.party, 'gold', 50);
assert.equal(share2.party.sharedResources.gold, 150);
const consume = mgr.consumeResource(share2.party, 'gold', 30);
assert.equal(consume.ok, true);
assert.equal(consume.party.sharedResources.gold, 120);
const overConsume = mgr.consumeResource(consume.party, 'gold', 200);
assert.equal(overConsume.ok, false);
assert.equal(overConsume.reason, 'insufficient-resources');
console.log('  PASS');

console.log('\n15. addTactic...');
const tacParty = mgr.createParty({ name: 'Tact', memberIds: ['hero'] });
const tac1 = mgr.addTactic(tacParty, { id: 't1', name: 'Heal Low', trigger: 'low-health', actions: [{ type: 'heal', target: 'lowest-hp' }], priority: 5 });
assert.equal(tac1.ok, true);
assert.equal(tac1.party.tactics.length, 1);
const tac2 = mgr.addTactic(tac1.party, { id: 't2', name: 'Buff', trigger: 'combat-start', actions: [{ type: 'buff', target: 'all' }], priority: 10 });
assert.equal(tac2.ok, true);
assert.equal(tac2.party.tactics[0].id, 't2'); // Higher priority first
console.log('  PASS');

console.log('\n16. evaluateTactics...');
const tactics = mgr.evaluateTactics(state, tac2.party);
assert.ok(tactics.length > 0);
assert.ok(tactics.some(t => t.tacticId === 't2')); // combat-start
console.log('  PASS');

console.log('\n17. getPartyStats...');
const stats = mgr.getPartyStats(state, party2);
assert.equal(stats.size, 4);
assert.equal(stats.maxSize, 6);
assert.equal(stats.formation, 'defensive');
assert.equal(stats.roles.leader, 1);
assert.equal(stats.roles.tank, 1);
assert.equal(stats.roles.healer, 1);
assert.ok(stats.avgLevel > 0);
assert.ok(stats.totalHP > 0);
assert.equal(stats.hasHealer, true);
assert.equal(stats.hasTank, true);
console.log('  PASS');

console.log('\n18. canPartyAct...');
const combat = mgr.canPartyAct(state, party2, 'combat');
assert.equal(combat.allowed, true);
const emptyParty = mgr.createParty({ name: 'Empty', memberIds: [] });
const noCombat = mgr.canPartyAct(state, emptyParty, 'combat');
assert.equal(noCombat.allowed, false);
assert.equal(noCombat.reason, 'no-members');
const travel = mgr.canPartyAct(state, party2, 'travel');
assert.equal(travel.allowed, true);
console.log('  PASS');

console.log('\n✅ All RPG Party tests passed!');
console.log('\nCoverage: RPG-15-01 (multi-character parties)');