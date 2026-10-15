'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const WorldRules = require('./workspaces/rpg-world-rules.js');

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function text(v) { return typeof v === 'string' ? v.trim() : ''; }

const seed = {
  sessionId: 'rules-test', worldId: 'valen-rules',
  timeline: { tick: 0 },
  world: { locations: { capital: { name: 'Capital' }, dungeon: { name: 'Dungeon' } }, kingdoms: { valen: { name: 'Valen' } } },
  characters: {
    hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' } },
    npc1: { control: 'ai', locationId: 'capital', identity: { name: 'NPC1' } }
  },
  factions: { guild: { name: 'Adventurers Guild' } },
  quests: {},
  canon: { entries: {} }
};

const state = State.createState(seed);
const mgr = WorldRules.createWorldRulesManager(State);

console.log('Testing RPG World Rules System...');

console.log('\n1. createRule - basic...');
const rule1 = mgr.createRule({ name: 'Gravity', type: 'physics', scope: 'global', priority: 50, condition: 'always', effect: { type: 'modify', target: 'world', path: 'gravity', value: 9.8, operator: '=' }, description: 'Standard gravity' });
assert.equal(rule1.name, 'Gravity');
assert.equal(rule1.type, 'physics');
assert.equal(rule1.scope, 'global');
assert.equal(rule1.priority, 50);
assert.ok(rule1.id.startsWith('rule-'));
console.log('  PASS');

console.log('\n2. createRule - scoped rule...');
const rule2 = mgr.createRule({ name: 'Dungeon Difficulty', type: 'combat', scope: 'location', scopeRef: 'dungeon', priority: 75, condition: 'true', effect: { type: 'modify', target: 'world', path: 'difficulty', value: 2, operator: '*=' }, description: 'Double difficulty in dungeon' });
assert.equal(rule2.scope, 'location');
assert.equal(rule2.scopeRef, 'dungeon');
assert.equal(rule2.priority, 75);
console.log('  PASS');

console.log('\n3. validateRule - valid rule...');
const valid = mgr.validateRule(state, rule1);
assert.equal(valid.valid, true);
console.log('  PASS');

console.log('\n4. validateRule - missing scopeRef...');
const badScope = mgr.createRule({ name: 'Bad', type: 'combat', scope: 'location', priority: 50, condition: 'always', effect: { type: 'set', target: 'world', path: 'x', value: 1 } });
const badVal = mgr.validateRule(state, badScope);
assert.equal(badVal.valid, false);
assert.ok(badVal.issues.some(i => i.code === 'missing-scope-ref'));
console.log('  PASS');

console.log('\n5. validateRule - invalid scopeRef...');
const badRef = mgr.createRule({ name: 'BadRef', type: 'combat', scope: 'location', scopeRef: 'nonexistent', priority: 50, condition: 'always', effect: { type: 'set', target: 'world', path: 'x', value: 1 } });
const badRefVal = mgr.validateRule(state, badRef);
assert.equal(badRefVal.valid, false);
assert.ok(badRefVal.issues.some(i => i.code === 'invalid-scope-ref'));
console.log('  PASS');

console.log('\n6. validateRule - valid scopeRef...');
const goodScope = mgr.createRule({ name: 'Dungeon Rule', type: 'combat', scope: 'location', scopeRef: 'dungeon', priority: 50, condition: 'always', effect: { type: 'set', target: 'world', path: 'x', value: 1 } });
const goodVal = mgr.validateRule(state, goodScope);
assert.equal(goodVal.valid, true);
console.log('  PASS');

console.log('\n6b. validateRule - character scopeRef...');
const charScope = mgr.createRule({ name: 'Hero Rule', type: 'combat', scope: 'character', scopeRef: 'hero', priority: 50, condition: 'always', effect: { type: 'set', target: 'character:hero', path: 'bonus', value: 1 } });
const charVal = mgr.validateRule(state, charScope);
assert.equal(charVal.valid, true);
console.log('  PASS');

console.log('\n7. evaluateCondition...');
assert.equal(mgr.evaluateCondition(state, { condition: 'always' }, {}), true);
assert.equal(mgr.evaluateCondition(state, { condition: 'never' }, {}), false);
assert.equal(mgr.evaluateCondition(state, { condition: '1 > 0' }, {}), true);
const result1 = mgr.evaluateCondition(state, { condition: 'tick > 10' }, { tick: 15 });
console.log('tick > 10 with tick=15:', result1);
assert.equal(result1, true);
const result2 = mgr.evaluateCondition(state, { condition: 'tick > 10' }, { tick: 5 });
console.log('tick > 10 with tick=5:', result2);
assert.equal(result2, false);
const result3 = mgr.evaluateCondition(state, { condition: 'character.hp > 50' }, { character: { hp: 60 } });
console.log('character.hp > 50 with hp=60:', result3);
assert.equal(result3, true);
console.log('  PASS');

console.log('\n8. applyEffect - modify...');
const testState = State.createState(seed);
const changes = mgr.applyEffect(testState, { effect: { type: 'modify', target: 'world', path: 'testValue', value: 5, operator: '+=' } }, {});
assert.ok(changes.length > 0);
assert.equal(changes[0].success, true);
assert.equal(changes[0].newValue, 5);
console.log('  PASS');

console.log('\n8b. applyEffect - set...');
const testState2 = State.createState(seed);
const changes2 = mgr.applyEffect(testState2, { effect: { type: 'set', target: 'world', path: 'flags.test', value: true } }, {});
assert.equal(changes2[0].success, true);
assert.equal(changes2[0].newValue, true);
console.log('  PASS');

console.log('\n8c. applyEffect - add to array...');
const testState3 = State.createState(seed);
const changes3 = mgr.applyEffect(testState3, { effect: { type: 'add', target: 'world', path: 'tags', value: 'magic' } }, {});
assert.equal(changes3[0].success, true);
assert.ok(changes3[0].added === 'magic');
console.log('  PASS');

console.log('\n9. getApplicableRules...');
const rules = {
  r1: { id: 'r1', name: 'Global', scope: 'global', priority: 10, enabled: true, condition: 'always' },
  r2: { id: 'r2', name: 'Dungeon', scope: 'location', scopeRef: 'dungeon', priority: 50, enabled: true, condition: 'always' },
  r3: { id: 'r3', name: 'Hero', scope: 'character', scopeRef: 'hero', priority: 30, enabled: true, condition: 'always' },
  r4: { id: 'r4', name: 'Disabled', scope: 'global', priority: 100, enabled: false, condition: 'always' },
  r5: { id: 'r5', name: 'Wrong Scene', scope: 'scene', scopeRef: 'other', priority: 20, enabled: true, condition: 'always' }
};
const applicable = mgr.getApplicableRules(state, rules, { sceneId: 'current', characterId: 'hero', locationId: 'dungeon' });
assert.equal(applicable.length, 3); // r1, r2, r3 (r4 disabled, r5 wrong scene)
assert.equal(applicable[0].id, 'r2'); // Highest priority first
assert.equal(applicable[1].id, 'r3');
assert.equal(applicable[2].id, 'r1');
console.log('  PASS');

console.log('\n10. resolveConflicts - highest-priority...');
const conflictRules = [
  { id: 'r1', priority: 10, effect: { target: 'world', path: 'x' }, conflictResolution: 'highest-priority' },
  { id: 'r2', priority: 50, effect: { target: 'world', path: 'x' }, conflictResolution: 'highest-priority' },
  { id: 'r3', priority: 30, effect: { target: 'world', path: 'y' }, conflictResolution: 'highest-priority' }
];
const resolved = mgr.resolveConflicts(conflictRules);
assert.equal(resolved.length, 2);
assert.equal(resolved.find(r => r.effect.target === 'world' && r.effect.path === 'x').id, 'r2'); // Higher priority wins
assert.ok(resolved.find(r => r.effect.path === 'y'));
console.log('  PASS');

console.log('\n11. resolveConflicts - most-specific...');
const specRules = [
  { id: 'r1', scope: 'global', priority: 10, effect: { target: 'world', path: 'x' }, conflictResolution: 'most-specific' },
  { id: 'r2', scope: 'location', scopeRef: 'dungeon', priority: 5, effect: { target: 'world', path: 'x' }, conflictResolution: 'most-specific' }
];
const specResolved = mgr.resolveConflicts(specRules);
assert.equal(specResolved.length, 1);
assert.equal(specResolved[0].id, 'r2'); // More specific scope wins
console.log('  PASS');

console.log('\n12. resolveConflicts - merge...');
const mergeRules = [
  { id: 'r1', effect: { target: 'world', path: 'x' }, conflictResolution: 'merge' },
  { id: 'r2', effect: { target: 'world', path: 'x' }, conflictResolution: 'merge' }
];
const mergeResolved = mgr.resolveConflicts(mergeRules);
assert.equal(mergeResolved.length, 2); // Both kept
console.log('  PASS');

console.log('\n13. createRuleset...');
const ruleset = mgr.createRuleset({
  name: 'Valen Physics',
  description: 'Physics rules for Valen',
  rules: [
    { name: 'Gravity', type: 'physics', scope: 'global', priority: 50, condition: 'always', effect: { type: 'modify', target: 'world', path: 'gravity', value: 9.8 } },
    { name: 'Time Dilation', type: 'time', scope: 'location', scopeRef: 'dungeon', priority: 80, condition: 'always', effect: { type: 'modify', target: 'world', path: 'timeScale', value: 0.5, operator: '*=' } }
  ],
  tags: ['physics', 'valen']
});
assert.equal(ruleset.name, 'Valen Physics');
assert.equal(ruleset.rules.length, 2);
assert.ok(ruleset.id.startsWith('ruleset-'));
console.log('  PASS');

console.log('\n14. compileRuleset...');
const compileState = State.createState(seed);
compileState.ruleRegistry = {
  'base-1': mgr.createRule({ id: 'base-1', name: 'Base Physics', type: 'physics', scope: 'global', priority: 10, enabled: true, condition: 'always', effect: { type: 'set', target: 'world', path: 'baseGravity', value: 9.8 } })
};
const compiled = mgr.compileRuleset({
  id: 'rs1', name: 'Test', rules: [
    mgr.createRule({ name: 'Gravity', type: 'physics', scope: 'global', priority: 50, enabled: true, condition: 'always', effect: { type: 'modify', target: 'world', path: 'gravity', value: 1.2, operator: '*=' } })
  ], baseRules: ['base-1']
}, compileState);
assert.equal(compiled.rules.length, 2);
assert.ok(compiled.rules.some(r => r.name === 'Gravity'));
assert.ok(compiled.rules.some(r => r.name === 'Base Physics'));
console.log('  PASS');

console.log('\n15. conditionIsValid...');
assert.equal(mgr.conditionIsValid('always'), true);
assert.equal(mgr.conditionIsValid('never'), true);
assert.equal(mgr.conditionIsValid('hp > 50'), true);
assert.equal(mgr.conditionIsValid('hp > 50 && mp < 20'), true);
assert.equal(mgr.conditionIsValid('invalid[condition'), false);
console.log('  PASS');

console.log('\n16. effectIsValid...');
assert.ok(mgr.effectIsValid({ type: 'modify', target: 'world', path: 'x' }));
assert.ok(mgr.effectIsValid({ type: 'set', target: 'character:hero', path: 'hp', value: 100 }));
assert.ok(mgr.effectIsValid({ type: 'add', target: 'world', path: 'tags', value: 'magic' }));
assert.ok(mgr.effectIsValid({ type: 'remove', target: 'world', path: 'tags' }));
assert.ok(mgr.effectIsValid({ type: 'trigger', target: 'world', event: 'event-name' }));
assert.ok(mgr.effectIsValid({ type: 'narrate', text: 'Something happens' }));
assert.equal(mgr.effectIsValid({ type: 'invalid', target: 'world' }), false);
assert.equal(mgr.effectIsValid(null), false);
console.log('  PASS');

console.log('\n17. checkScopeRefExists...');
assert.equal(mgr.checkScopeRefExists(state, 'location', 'capital'), true);
assert.equal(mgr.checkScopeRefExists(state, 'location', 'nonexistent'), false);
assert.equal(mgr.checkScopeRefExists(state, 'character', 'hero'), true);
assert.equal(mgr.checkScopeRefExists(state, 'character', 'nonexistent'), false);
assert.equal(mgr.checkScopeRefExists(state, 'faction', 'guild'), true);
assert.equal(mgr.checkScopeRefExists(state, 'region', 'valen'), true);
console.log('  PASS');

console.log('\n✅ All RPG World Rules tests passed!');
console.log('\nCoverage: RPG-15-04 (custom world rule editor)');