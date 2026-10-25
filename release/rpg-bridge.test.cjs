const assert = require('assert/strict');
const path = require('path');

const State = require('./workspaces/rpg-state.js');
const Progression = require('./workspaces/rpg-progression.js');
const Combat = require('./workspaces/rpg-combat.js');
const Bridge = require('./workspaces/rpg-bridge.js');

// Mock localStorage for node test
const storage = new Map();
global.localStorage = {
  getItem: k => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: k => storage.delete(k)
};
global.document = {
  dispatchEvent: () => true
};
global.SevenRpgState = State;
global.SevenRpgProgression = Progression;
global.SevenRpgCombat = Combat;

console.log('Testing SevenRpgBridge...');

// 1. Player summary and starter pack
const player = Bridge.getPlayerSummary();
assert.ok(player, 'Player summary must be returned');
assert.equal(player.id, 'hero');
assert.equal(player.level, 1);
assert.equal(player.health.current, 100);
assert.equal(player.health.max, 100);
assert.equal(player.mana.current, 50);
assert.ok(player.inventory.length >= 4, 'Should have starter items');
assert.ok(player.inventory.some(i => i.id === 'item_health_potion'), 'Should have health potions');
assert.equal(player.equipment['main-hand'], 'item_iron_sword');
assert.equal(player.equipment['chest'], 'item_leather_armor');
console.log('PASS: Player initialization and starter pack');

// 2. Item usage
const initialPotions = player.inventory.find(i => i.id === 'item_health_potion').quantity;
// Damage player first
const charProg = Progression.createProgressionManager(State);
player.health.current = 60; // manually lower
const useRes = Bridge.useItem('item_health_potion');
assert.equal(useRes.ok, true);
assert.equal(useRes.healed, 40);
assert.equal(useRes.health.current, 100);
const updatedPlayer = Bridge.getPlayerSummary();
const remainingPotions = updatedPlayer.inventory.find(i => i.id === 'item_health_potion').quantity;
assert.equal(remainingPotions, initialPotions - 1);
console.log('PASS: Item usage & inventory decrement');

// 3. Equipment unequip & equip
const unequipRes = Bridge.unequipItem('main-hand');
assert.equal(unequipRes.ok, true);
const pNoSword = Bridge.getPlayerSummary();
assert.equal(pNoSword.equipment['main-hand'], undefined);

const equipRes = Bridge.equipItem('item_iron_sword', 'main-hand');
assert.equal(equipRes.ok, true);
const pWithSword = Bridge.getPlayerSummary();
assert.equal(pWithSword.equipment['main-hand'], 'item_iron_sword');
console.log('PASS: Equipment equip and unequip');

// 4. Quest advancement
const questRes = Bridge.advanceQuestObjective('quest_prologue', 1);
assert.equal(questRes.ok, true);
assert.equal(questRes.quest.objectives[1].completed, true);
console.log('PASS: Quest objective advancement');

// 5. XP and Leveling
const initialLevel = Bridge.getPlayerSummary().level;
const xpRes = Bridge.addXp(120);
assert.equal(xpRes.ok, true);
const pLeveled = Bridge.getPlayerSummary();
assert.ok(pLeveled.level > initialLevel, 'Player should level up after 120 XP');
console.log('PASS: XP gain and level-up');

// 6. Combat Encounter & Turn Execution
const combatStart = Bridge.startCombat({ enemyName: 'Goblin', enemyHp: 30, enemyAtk: 5 });
assert.equal(combatStart.ok, true);
assert.ok(combatStart.encounterId);
assert.equal(combatStart.enemy.hp, 30);

const combatState = Bridge.getCombatState();
assert.ok(combatState);
assert.equal(combatState.enemies[0].name, 'Goblin');

// Attack until victory
let victory = false;
for (let turn = 0; turn < 10; turn++) {
  const act = Bridge.performCombatAction('attack');
  assert.equal(act.ok, true);
  if (act.status === 'victory') {
    victory = true;
    break;
  }
}
assert.equal(victory, true, 'Player should win combat against low-HP Goblin');
assert.equal(Bridge.getPlayerSummary().inCombat, false);
console.log('PASS: Turn-based combat execution and victory');

console.log('SevenRpgBridge: ALL TESTS PASS');
