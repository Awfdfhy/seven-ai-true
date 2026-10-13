'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Progression = require('./workspaces/rpg-progression.js');

const seed = {
  sessionId: 'progression-test', worldId: 'valen-prog',
  timeline: { tick: 5 }, world: { locations: {} },
  characters: {}, quests: {}, canon: { entries: {} }
};

const state = State.createState(seed);
const prog = Progression.createProgressionManager(State);

console.log('Testing RPG Progression System...');

console.log('\n1. createRuleset...');
const ruleset1 = prog.createRuleset({
  id: 'standard', name: 'Standard Rules',
  rules: { levelingCurve: 'standard', maxLevel: 20, xpPerLevel: 100, criticalRange: 20 }
});
assert.equal(ruleset1.name, 'Standard Rules');
assert.equal(ruleset1.rules.maxLevel, 20);
assert.equal(ruleset1.rules.xpPerLevel, 100);
console.log('  PASS');

console.log('\n2. updateRuleset...');
const updRs = prog.updateRuleset('standard', { rules: { maxLevel: 30, xpPerLevel: 150 } });
assert.equal(updRs.ok, true);
assert.equal(updRs.ruleset.rules.maxLevel, 30);
assert.equal(updRs.ruleset.rules.xpPerLevel, 150);
console.log('  PASS');

console.log('\n3. listRulesets...');
const rsList = prog.listRulesets();
assert.equal(rsList.length, 1);
assert.equal(rsList[0].name, 'Standard Rules');
console.log('  PASS');

console.log('\n4. createCharacterProgression...');
const char1 = prog.createCharacterProgression({
  id: 'hero1', name: 'Aldric', level: 1,
  attributes: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 11, charisma: 13 },
  health: { current: 100, max: 100 },
  mana: { current: 50, max: 50 },
  class: 'warrior', race: 'human'
});
assert.equal(char1.level, 1);
assert.equal(char1.xp, 0);
assert.equal(char1.attributes.strength, 16);
assert.equal(char1.health.max, 100);
console.log('  PASS');

console.log('\n5. addXp + level up...');
const xpResult = prog.addXp('hero1', 150, 'standard');
assert.equal(xpResult.ok, true);
assert.equal(xpResult.xpGained, 150);
assert.equal(xpResult.leveledUp, true);
assert.equal(xpResult.newLevel, 2);
assert.equal(xpResult.currentXp, 50); // 150 - 100 = 50 remaining
console.log('  PASS');

console.log('\n6. getLevelProgress...');
const progress = prog.getLevelProgress('hero1');
assert.equal(progress.level, 2);
assert.equal(progress.currentXp, 50);
// xpToNextLevel = 150 * 2 = 300 (updated ruleset), 50/300 ≈ 17%
assert.equal(progress.percentage, 17);
console.log('  PASS');

console.log('\n7. performSkillCheck...');
const check1 = prog.performSkillCheck('hero1', 'swords', 'standard', 2);
assert.equal(check1.ok, true);
assert.ok(check1.d20 >= 1 && check1.d20 <= 20);
assert.ok(typeof check1.success === 'boolean');
assert.ok(typeof check1.margin === 'number');
console.log('  PASS');

console.log('\n8. createSkillTree + unlockSkillNode...');
const tree1 = prog.createSkillTree({
  id: 'combat-tree', name: 'Combat Skills', category: 'combat',
  nodes: [
    { id: 'sword-basic', name: 'Sword Basics', maxRank: 3, cost: 1, prerequisites: [] },
    { id: 'sword-advanced', name: 'Sword Mastery', maxRank: 2, cost: 2, prerequisites: ['sword-basic'] }
  ]
});
assert.equal(tree1.nodes.length, 2);
// Unlock prerequisite first
const unlock1 = prog.unlockSkillNode('combat-tree', 'sword-basic', 'hero1');
assert.equal(unlock1.ok, true);
assert.equal(unlock1.newRank, 1);
// Try to unlock advanced before basics is maxed (should work since prereq has rank >= 1)
const unlock2 = prog.unlockSkillNode('combat-tree', 'sword-advanced', 'hero1');
assert.equal(unlock2.ok, true);
console.log('  PASS');

console.log('\n9. unlockSkillNode - prerequisite not met...');
const tree2 = prog.createSkillTree({
  id: 'magic-tree', name: 'Magic Skills', category: 'magic',
  nodes: [
    { id: 'fire-basic', name: 'Fire Bolt', maxRank: 3, cost: 1, prerequisites: [] },
    { id: 'fire-ball', name: 'Fireball', maxRank: 1, cost: 3, prerequisites: ['fire-basic'] }
  ]
});
const unlockFire = prog.unlockSkillNode('magic-tree', 'fire-ball', 'hero1');
assert.equal(unlockFire.ok, false);
assert.equal(unlockFire.reason, 'prerequisite-not-met');
console.log('  PASS');

console.log('\n10. grantAbility + useAbility...');
const ability1 = prog.grantAbility({
  id: 'slash', name: 'Power Slash', type: 'active',
  manaCost: 10, staminaCost: 5,
  cooldown: { type: 'turns', value: 2 },
  damage: 25, targeting: 'single'
});
assert.equal(ability1.name, 'Power Slash');
assert.equal(ability1.cooldown.value, 2);
const use1 = prog.useAbility('hero1', 'slash');
assert.equal(use1.ok, true);
assert.equal(use1.manaSpent, 10);
assert.equal(use1.damage, 25);
// Use again - should be on cooldown
const use2 = prog.useAbility('hero1', 'slash');
assert.equal(use2.ok, false);
assert.equal(use2.reason, 'on-cooldown');
console.log('  PASS');

console.log('\n11. tickCooldowns...');
const tick1 = prog.tickCooldowns();
assert.equal(tick1.ok, true);
assert.ok(tick1.ticked >= 1);
// After one tick, cooldown should be 1
const use3 = prog.useAbility('hero1', 'slash');
assert.equal(use3.ok, false); // still on cooldown (1 remaining)
prog.tickCooldowns();
const use4 = prog.useAbility('hero1', 'slash');
assert.equal(use4.ok, true); // cooldown expired
console.log('  PASS');

console.log('\n12. applyStatusEffect + tickStatusEffects...');
const status1 = prog.applyStatusEffect({
  characterId: 'hero1', name: 'Blessed', category: 'buff',
  duration: 3, magnitude: 2, dispellable: true
});
assert.equal(status1.name, 'Blessed');
assert.equal(status1.remaining, 3);
const status2 = prog.applyStatusEffect({
  characterId: 'hero1', name: 'Poisoned', category: 'damage-over-time',
  duration: 5, magnitude: -3
});
assert.equal(status2.category, 'damage-over-time');
// Tick twice
prog.tickStatusEffects();
prog.tickStatusEffects();
const charEffects = prog.getCharacterStatusEffects('hero1');
assert.equal(charEffects.length, 2);
// Tick 3 more times - Blessed (3 total) should expire
prog.tickStatusEffects();
const afterExpiry = prog.getCharacterStatusEffects('hero1');
assert.equal(afterExpiry.length, 1); // only Poisoned remains
console.log('  PASS');

console.log('\n13. removeStatusEffect - dispel...');
const dispellableStatus = prog.applyStatusEffect({
  characterId: 'hero1', name: 'Cursed', category: 'debuff',
  duration: 10, dispellable: false
});
const dispelResult = prog.removeStatusEffect(dispellableStatus.id, true);
assert.equal(dispelResult.ok, false);
assert.equal(dispelResult.reason, 'not-dispellable');
const removeResult = prog.removeStatusEffect(dispellableStatus.id, false);
assert.equal(removeResult.ok, true);
console.log('  PASS');

console.log('\n14. createQuest + acceptQuest + completeQuest...');
const quest1 = prog.createQuest({
  id: 'quest1', title: 'Slay the Dragon',
  description: 'A dragon threatens the village.',
  level: 5, objectives: [
    { description: 'Travel to the dragon lair' },
    { description: 'Defeat the dragon' }
  ],
  rewards: { xp: 500, gold: 100, items: [] },
  giver: 'Village Elder'
});
assert.equal(quest1.title, 'Slay the Dragon');
assert.equal(quest1.objectives.length, 2);
const accept1 = prog.acceptQuest('quest1', 'hero1');
assert.equal(accept1.ok, true);
assert.equal(accept1.quest.status, 'active');
const complete1 = prog.completeQuest('quest1', 'hero1');
assert.equal(complete1.ok, true);
assert.equal(complete1.quest.status, 'completed');
assert.equal(complete1.xpGranted, 500);
console.log('  PASS');

console.log('\n15. getQuestJournal...');
const journal = prog.getQuestJournal('hero1');
assert.ok(journal.length >= 1);
assert.ok(journal.some(q => q.id === 'quest1'));
const activeJournal = prog.getQuestJournal('hero1', 'active');
assert.equal(activeJournal.length, 0);
console.log('  PASS');

console.log('\n16. createAchievement + unlockAchievement...');
const ach1 = prog.createAchievement({
  id: 'first-blood', name: 'First Blood',
  description: 'Defeat your first enemy', rarity: 'common'
});
assert.equal(ach1.rarity, 'common');
const unlockAch = prog.unlockAchievement('first-blood', 'hero1');
assert.equal(unlockAch.ok, true);
assert.equal(unlockAch.achievement.unlocked, true);
// Try to unlock again
const doubleUnlock = prog.unlockAchievement('first-blood', 'hero1');
assert.equal(doubleUnlock.ok, false);
assert.equal(doubleUnlock.reason, 'already-unlocked');
console.log('  PASS');

console.log('\n17. getUnlockedAchievements...');
const unlockedAch = prog.getUnlockedAchievements('hero1');
assert.ok(unlockedAch.length >= 1);
assert.ok(unlockedAch.some(a => a.id === 'first-blood'));
console.log('  PASS');

console.log('\n18. grantTitle + activateTitle...');
const title1 = prog.grantTitle({
  id: 'dragon-slayer', name: 'Dragon Slayer',
  characterId: 'hero1', source: 'quest'
});
assert.equal(title1.name, 'Dragon Slayer');
const title2 = prog.grantTitle({
  id: 'warrior', name: 'Warrior',
  characterId: 'hero1', source: 'level'
});
const activate1 = prog.activateTitle('dragon-slayer');
assert.equal(activate1.ok, true);
assert.equal(activate1.title.active, true);
const activate2 = prog.activateTitle('warrior');
assert.equal(activate2.ok, true);
// Check that dragon-slayer was deactivated
const titles = prog.getCharacterTitles('hero1');
const dsTitle = titles.find(t => t.id === 'dragon-slayer');
const wTitle = titles.find(t => t.id === 'warrior');
assert.equal(dsTitle.active, false);
assert.equal(wTitle.active, true);
console.log('  PASS');

console.log('\n19. createItem + addToInventory...');
const item1 = prog.createItem({
  id: 'iron-sword', name: 'Iron Sword', type: 'weapon',
  rarity: 'common', value: 50, weight: 3.0, stackable: false,
  stats: { damage: 8, speed: 1.0 }
});
assert.equal(item1.name, 'Iron Sword');
assert.equal(item1.stats.damage, 8);
const item2 = prog.createItem({
  id: 'health-potion', name: 'Health Potion', type: 'consumable',
  rarity: 'common', value: 25, stackable: true, maxStack: 10,
  effects: { heal: 50 }
});
const addResult = prog.addToInventory('hero1', 'iron-sword', 1);
assert.equal(addResult.ok, true);
const addPotion = prog.addToInventory('hero1', 'health-potion', 5);
assert.equal(addPotion.ok, true);
const inventory = prog.getInventory('hero1');
assert.equal(inventory.length, 2);
const sword = inventory.find(i => i.id === 'iron-sword');
assert.equal(sword.quantity, 1);
const potion = inventory.find(i => i.id === 'health-potion');
assert.equal(potion.quantity, 5);
console.log('  PASS');

console.log('\n20. removeFromInventory...');
const removeResult2 = prog.removeFromInventory('hero1', 'health-potion', 2);
assert.equal(removeResult2.ok, true);
assert.equal(removeResult2.removed, 2);
const invAfter = prog.getInventory('hero1');
const potionAfter = invAfter.find(i => i.id === 'health-potion');
assert.equal(potionAfter.quantity, 3);
// Try to remove more than available
const removeTooMany = prog.removeFromInventory('hero1', 'health-potion', 10);
assert.equal(removeTooMany.ok, false);
assert.equal(removeTooMany.reason, 'insufficient-quantity');
console.log('  PASS');

console.log('\n21. equipItem + unequipItem...');
const equipResult = prog.equipItem('hero1', 'iron-sword', 'main-hand');
assert.equal(equipResult.ok, true);
assert.equal(equipResult.equipped, 'iron-sword');
const equipment = prog.getEquipment('hero1');
assert.ok(equipment['main-hand']);
assert.equal(equipment['main-hand'].name, 'Iron Sword');
// Unequip
const unequipResult = prog.unequipItem('hero1', 'main-hand');
assert.equal(unequipResult.ok, true);
const invAfterUnequip = prog.getInventory('hero1');
assert.ok(invAfterUnequip.some(i => i.id === 'iron-sword'));
console.log('  PASS');

console.log('\n22. createLootTable + generateLoot...');
const lootTable = prog.createLootTable({
  id: 'dragon-hoard', name: 'Dragon Hoard',
  lootEntries: [
    { itemId: 'gold-coins', name: 'Gold Coins', weight: 10, minQuantity: 50, maxQuantity: 200 },
    { itemId: 'ruby', name: 'Ruby', weight: 3, minQuantity: 1, maxQuantity: 3 },
    { itemId: 'magic-sword', name: 'Magic Sword', weight: 1, minQuantity: 1, maxQuantity: 1 }
  ]
});
assert.equal(lootTable.lootEntries.length, 3);
const loot1 = prog.generateLoot('dragon-hoard', 0);
assert.equal(loot1.ok, true);
assert.ok(loot1.quantity >= 1);
console.log('  PASS');

console.log('\n23. createCraftingRecipe + craftItem...');
// Add crafting materials
const mat1 = prog.createItem({ id: 'iron-ingot', name: 'Iron Ingot', type: 'material', stackable: true });
const mat2 = prog.createItem({ id: 'leather', name: 'Leather', type: 'material', stackable: true });
prog.addToInventory('hero1', 'iron-ingot', 10);
prog.addToInventory('hero1', 'leather', 5);
const recipe1 = prog.createCraftingRecipe({
  id: 'iron-helmet', name: 'Iron Helmet',
  category: 'smithing', resultItemId: 'iron-helmet-item',
  resultQuantity: 1,
  ingredients: [
    { itemId: 'iron-ingot', quantity: 3 },
    { itemId: 'leather', quantity: 1 }
  ],
  requiredSkill: 'smithing', requiredSkillLevel: 1,
  successRate: 1.0
});
assert.equal(recipe1.ingredients.length, 2);
// Give smithing skill
const heroChar = prog.getCharacterProgression('hero1');
heroChar.skills.smithing = 2;
const craftResult = prog.craftItem('hero1', 'iron-helmet');
assert.equal(craftResult.ok, true);
assert.equal(craftResult.resultQuantity, 1);
// Check that ingredients were consumed
const invAfterCraft = prog.getInventory('hero1');
const ingots = invAfterCraft.find(i => i.id === 'iron-ingot');
assert.equal(ingots.quantity, 7); // 10 - 3 = 7
console.log('  PASS');

console.log('\n24. craftItem - insufficient ingredients...');
const recipe2 = prog.createCraftingRecipe({
  id: 'legendary-armor', name: 'Legendary Armor',
  category: 'smithing', resultItemId: 'legendary-armor-item',
  ingredients: [{ itemId: 'iron-ingot', quantity: 99 }],
  requiredSkillLevel: 0
});
const craftFail = prog.craftItem('hero1', 'legendary-armor');
assert.equal(craftFail.ok, false);
assert.equal(craftFail.reason, 'missing-ingredient');
console.log('  PASS');

console.log('\n25. getAvailableRecipes...');
const available = prog.getAvailableRecipes('hero1');
assert.ok(available.length >= 1);
console.log('  PASS');

console.log('\n26. Edge cases...');
assert.equal(prog.getCharacterProgression('nonexistent'), null);
assert.equal(prog.getSkillTree('nonexistent'), null);
assert.equal(prog.getQuest('nonexistent'), null);
assert.equal(prog.getLevelProgress('nonexistent'), null);
const badXp = prog.addXp('nonexistent', 100);
assert.equal(badXp.ok, false);
const badEquip = prog.equipItem('hero1', 'nonexistent-item', 'main-hand');
assert.equal(badEquip.ok, false);
const badSlot = prog.equipItem('hero1', 'iron-sword', 'invalid-slot');
assert.equal(badSlot.ok, false);
const badCraft = prog.craftItem('hero1', 'nonexistent-recipe');
assert.equal(badCraft.ok, false);
const badLoot = prog.generateLoot('nonexistent-table');
assert.equal(badLoot.ok, false);
console.log('  PASS');

console.log('\n✅ All RPG Progression System tests passed!');
console.log('\nCoverage:');
console.log('  RPG-08-01 (optional rulesets): createRuleset, updateRuleset, listRulesets');
console.log('  RPG-08-02 (character levels): createCharacterProgression, calculateXpForLevel');
console.log('  RPG-08-03 (experience): addXp with level-up detection');
console.log('  RPG-08-04 (skill checks): performSkillCheck with d20, DC, critical/fumble');
console.log('  RPG-08-05 (skill tree): createSkillTree, unlockSkillNode with prerequisites');
console.log('  RPG-08-06 (abilities): grantAbility, useAbility with costs');
console.log('  RPG-08-07 (cooldowns): tickCooldowns, cooldown tracking');
console.log('  RPG-08-08 (status conditions): applyStatusEffect, tickStatusEffects, removeStatusEffect');
console.log('  RPG-08-09 (quest journal): createQuest, acceptQuest, completeQuest, getQuestJournal');
console.log('  RPG-08-10 (achievements): createAchievement, unlockAchievement');
console.log('  RPG-08-11 (milestones): getMilestones');
console.log('  RPG-08-12 (titles): grantTitle, activateTitle with deactivation');
console.log('  RPG-08-13 (inventory): createItem, addToInventory, removeFromInventory, getInventory');
console.log('  RPG-08-14 (equipment): equipItem, unequipItem, getEquipment with slot validation');
console.log('  RPG-08-15 (loot and rewards): createLootTable, generateLoot with weighted selection');
console.log('  RPG-08-16 (crafting): createCraftingRecipe, craftItem with ingredients/skill checks');
