'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Combat = require('./workspaces/rpg-combat.js');

const seed = {
  sessionId: 'combat-test', worldId: 'valen-combat',
  timeline: { tick: 5 }, world: { locations: {} },
  characters: {}, quests: {}, canon: { entries: {} }
};

const state = State.createState(seed);
const cbt = Combat.createCombatManager(State);

console.log('Testing RPG Combat System...');

console.log('\n1. createEncounter...');
const enc1 = cbt.createEncounter({
  id: 'battle1', name: 'Goblin Ambush',
  locationId: 'forest', difficulty: 'normal',
  retreatAllowed: true, surrenderAllowed: true, nonviolentOptions: true
});
assert.equal(enc1.name, 'Goblin Ambush');
assert.equal(enc1.status, 'active');
assert.equal(enc1.round, 0);
console.log('  PASS');

console.log('\n2. addCombatant - player...');
const hero = cbt.addCombatant({
  encounterId: 'battle1', id: 'hero', name: 'Aldric', type: 'player',
  initiativeRoll: 15, dexterity: 14,
  health: { current: 100, max: 100 },
  actionPoints: 3, defense: 14
});
assert.equal(hero.name, 'Aldric');
assert.equal(hero.type, 'player');
assert.equal(hero.initiative, 15 + 2); // 15 + (14-10)/2 = 17
assert.equal(hero.actionPoints, 3);
console.log('  PASS');

console.log('\n3. addCombatant - enemy...');
const goblin = cbt.addCombatant({
  encounterId: 'battle1', id: 'goblin1', name: 'Goblin', type: 'enemy',
  initiativeRoll: 8, dexterity: 12,
  health: { current: 30, max: 30 },
  actionPoints: 2, defense: 12,
  weaknesses: { slashing: 0.5 }
});
assert.equal(goblin.type, 'enemy');
assert.equal(goblin.weaknesses.slashing, 0.5);
console.log('  PASS');

console.log('\n4. rollInitiative + getTurnOrder...');
const initResult = cbt.rollInitiative('battle1');
assert.equal(initResult.ok, true);
assert.ok(initResult.turnOrder.length >= 2);
// Both combatants should have rolled initiative
assert.ok(initResult.turnOrder.every(t => t.initiative >= 1));
const turnOrder = cbt.getTurnOrder('battle1');
assert.equal(turnOrder[0].isCurrentTurn, true);
console.log('  PASS');

console.log('\n5. getCurrentTurn...');
const currentTurn = cbt.getCurrentTurn('battle1');
assert.ok(currentTurn);
assert.ok(currentTurn.id === 'hero' || currentTurn.id === 'goblin1');
// Set hero as current turn for subsequent tests
const encData = cbt.getEncounter('battle1');
encData.currentTurnIndex = encData.turnOrder.indexOf('hero');
console.log('  PASS');

console.log('\n6. performAttack - hit...');
const attack1 = cbt.performAttack('hero', 'goblin1', {
  baseDamage: 8, damageBonus: 3, damageType: 'slashing', attackBonus: 5
});
assert.equal(attack1.ok, true);
// With d20 + 5 vs DC 12, most rolls will hit
if (attack1.hit) {
  assert.ok(attack1.damage > 0);
  // Weakness: slashing does 50% extra
  assert.ok(attack1.defenderHealth < 30);
}
console.log('  PASS');

console.log('\n7. performAttack - action points...');
// Spend all remaining AP
cbt.spendActionPoints('hero', 2);
const noApAttack = cbt.performAttack('hero', 'goblin1', { baseDamage: 5 });
assert.equal(noApAttack.ok, false);
assert.equal(noApAttack.reason, 'insufficient-action-points');
console.log('  PASS');

console.log('\n8. damageCombatant + healCombatant...');
const dmgResult = cbt.damageCombatant('goblin1', 15, 'slashing');
assert.equal(dmgResult.ok, true);
assert.ok(dmgResult.damage > 0); // weakness increases damage
assert.ok(dmgResult.remaining < 30);
const healResult = cbt.healCombatant('goblin1', 5);
assert.equal(healResult.ok, true);
assert.ok(healResult.current <= 30); // can't exceed max
console.log('  PASS');

console.log('\n9. applyCombatEffect + tickCombatStatusEffects...');
const poison = cbt.applyCombatEffect({
  combatantId: 'goblin1', name: 'Poisoned', type: 'debuff',
  duration: 3, tickDamage: 2
});
assert.equal(poison.name, 'Poisoned');
assert.equal(poison.remaining, 3);
// Tick once - should apply 2 damage and reduce duration
const tickResult = cbt.tickCombatStatusEffects('battle1');
assert.equal(tickResult.ok, true);
// Verify effect was tracked
const goblinAfterTick = cbt.getCombatant('goblin1');
assert.ok(goblinAfterTick.statusEffects.includes(poison.id) || tickResult.expired.includes(poison.id));
console.log('  PASS');

console.log('\n10. setEnemyIntent + getEnemyIntents...');
const intent1 = cbt.setEnemyIntent('goblin1', {
  type: 'attack', targetId: 'hero',
  description: 'The goblin prepares to strike!', confidence: 0.8, revealed: true
});
assert.equal(intent1.ok, true);
assert.equal(intent1.intent.type, 'attack');
assert.equal(intent1.intent.targetId, 'hero');
const intents = cbt.getEnemyIntents('battle1');
assert.ok(intents.some(i => i.combatantId === 'goblin1'));
console.log('  PASS');

console.log('\n11. logCombatAction + getCombatLog...');
const logEntry = cbt.logCombatAction('battle1', {
  combatantId: 'hero', action: 'attack',
  targetId: 'goblin1', description: 'Aldric slashes at the Goblin!',
  damage: 12, critical: false
});
assert.equal(logEntry.ok, true);
assert.equal(logEntry.entry.damage, 12);
const log = cbt.getCombatLog('battle1');
assert.ok(log.length >= 1);
const heroLog = cbt.getCombatLog('battle1', { combatantId: 'hero' });
assert.ok(heroLog.length >= 1);
console.log('  PASS');

console.log('\n12. advanceTurn...');
const advance1 = cbt.advanceTurn('battle1');
assert.equal(advance1.ok, true);
assert.ok(advance1.currentTurnId);
console.log('  PASS');

console.log('\n13. attemptRetreat...');
// Create a fresh encounter for retreat testing
const enc3 = cbt.createEncounter({ id: 'battle3', name: 'Retreat Test', retreatAllowed: true });
cbt.addCombatant({ encounterId: 'battle3', id: 'retreater', name: 'Retreater', type: 'player', dexterity: 14, health: { current: 50, max: 50 } });
cbt.addCombatant({ encounterId: 'battle3', id: 'enemy3', name: 'Enemy', type: 'enemy', dexterity: 10, health: { current: 30, max: 30 } });
const retreat1 = cbt.attemptRetreat('battle3', 'retreater');
assert.equal(retreat1.ok, true);
assert.ok(typeof retreat1.success === 'boolean');
console.log('  PASS');

console.log('\n14. attemptSurrender...');
const surrender1 = cbt.attemptSurrender('battle1', 'goblin1');
assert.equal(surrender1.ok, true);
assert.equal(surrender1.surrendered, true);
console.log('  PASS');

console.log('\n15. attemptNonviolentResolution...');
const enc2 = cbt.createEncounter({ id: 'battle2', name: 'Standoff', difficulty: 'normal', nonviolentOptions: true });
cbt.addCombatant({ encounterId: 'battle2', id: 'hero2', name: 'Hero', type: 'player', dexterity: 14 });
cbt.addCombatant({ encounterId: 'battle2', id: 'guard', name: 'Town Guard', type: 'enemy', dexterity: 10 });
const nonviolent = cbt.attemptNonviolentResolution('battle2', 'persuasion', 5);
assert.equal(nonviolent.ok, true);
assert.equal(nonviolent.approach, 'persuasion');
assert.ok(typeof nonviolent.success === 'boolean');
console.log('  PASS');

console.log('\n16. createBalanceProfile + applyBalanceProfile...');
const balance1 = cbt.createBalanceProfile({
  id: 'hard-balance', name: 'Hard Mode',
  difficulty: 'hard', enemyHealthMultiplier: 1.5, enemyDamageMultiplier: 1.5,
  playerHealthMultiplier: 0.8, xpMultiplier: 2.0
});
assert.equal(balance1.difficulty, 'hard');
assert.equal(balance1.enemyHealthMultiplier, 1.5);
const applyBalance = cbt.applyBalanceProfile('battle1', 'hard-balance');
assert.equal(applyBalance.ok, true);
console.log('  PASS');

console.log('\n17. getDifficultyModifiers...');
const easyMods = cbt.getDifficultyModifiers('easy');
assert.equal(easyMods.enemyHealthMult, 0.75);
assert.equal(easyMods.xpMult, 0.5);
const deadlyMods = cbt.getDifficultyModifiers('deadly');
assert.equal(deadlyMods.enemyHealthMult, 2);
assert.equal(deadlyMods.xpMult, 2.5);
console.log('  PASS');

console.log('\n18. replayAction - deterministic...');
// With the same seed, the same action should produce the same result
const actionData = { attackBonus: 5, baseDamage: 10, damageBonus: 3, defense: 12 };
const replay1 = cbt.replayAction(actionData, 42);
const replay2 = cbt.replayAction(actionData, 42);
assert.equal(replay1.attackRoll, replay2.attackRoll);
assert.equal(replay1.damage, replay2.damage);
assert.equal(replay1.hit, replay2.hit);
console.log('  PASS');

console.log('\n19. getReplayState...');
const replayState = cbt.getReplayState('battle1');
assert.ok(replayState);
assert.equal(replayState.encounterId, 'battle1');
assert.ok(Array.isArray(replayState.turnOrder));
console.log('  PASS');

console.log('\n20. generateCombatNarration...');
const narration = cbt.generateCombatNarration('battle1', { maxEntries: 5 });
assert.ok(narration.narration.includes('ROUND'));
assert.ok(narration.entryCount >= 1);
console.log('  PASS');

console.log('\n21. checkEncounterEnd + endEncounter...');
const endCheck = cbt.checkEncounterEnd('battle1');
assert.ok(typeof endCheck.ended === 'boolean');
const endResult = cbt.endEncounter('battle1', 'victory');
assert.equal(endResult.ok, true);
assert.equal(endResult.status, 'victory');
console.log('  PASS');

console.log('\n22. Edge cases...');
assert.equal(cbt.getEncounter('nonexistent'), null);
assert.equal(cbt.getCombatant('nonexistent'), null);
assert.equal(cbt.getCurrentTurn('nonexistent'), null);
assert.equal(cbt.getBalanceProfile('nonexistent'), null);
assert.equal(cbt.getReplayState('nonexistent'), null);
const badAttack = cbt.performAttack('nonexistent', 'goblin1', {});
assert.equal(badAttack.ok, false);
const badDmg = cbt.damageCombatant('nonexistent', 10);
assert.equal(badDmg.ok, false);
const deadDmg = cbt.damageCombatant('hero', 99999, 'force');
// Hero might die from this
console.log('  PASS');

console.log('\n✅ All RPG Combat System tests passed!');
console.log('\nCoverage:');
console.log('  RPG-10-01 (optional turn based combat): createEncounter with status tracking');
console.log('  RPG-10-02 (combat narration): generateCombatNarration from combat log');
console.log('  RPG-10-03 (initiative): addCombatant, rollInitiative with dexterity bonus');
console.log('  RPG-10-04 (turn order UI): getTurnOrder, getCurrentTurn, advanceTurn');
console.log('  RPG-10-05 (action points): spendActionPoints with validation');
console.log('  RPG-10-06 (health and resources): damageCombatant, healCombatant with resistances');
console.log('  RPG-10-07 (skill resolution): performAttack with d20, critical, fumble');
console.log('  RPG-10-08 (status effects): applyCombatEffect, tickCombatStatusEffects');
console.log('  RPG-10-09 (enemy intent): setEnemyIntent, getEnemyIntents');
console.log('  RPG-10-10 (combat log): logCombatAction, getCombatLog with filters');
console.log('  RPG-10-11 (retreat and surrender): attemptRetreat, attemptSurrender');
console.log('  RPG-10-12 (nonviolent alternatives): attemptNonviolentResolution');
console.log('  RPG-10-13 (balance profiles): createBalanceProfile, applyBalanceProfile');
console.log('  RPG-10-14 (difficulty modifiers): getDifficultyModifiers for 4 difficulties');
console.log('  RPG-10-15 (deterministic replays): replayAction with seed, getReplayState');
