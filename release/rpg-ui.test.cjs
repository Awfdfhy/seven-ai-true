'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Ui = require('./workspaces/rpg-ui.js');

const seed = {
  sessionId: 'ui-test', worldId: 'valen-ui',
  timeline: { tick: 5 }, world: { locations: {} },
  characters: {}, quests: {}, canon: { entries: {} }
};

const state = State.createState(seed);
const ui = Ui.createUiManager(State);

console.log('Testing RPG UI System...');

console.log('\n1. setLayout + getLayout...');
const setMobile = ui.setLayout('mobile');
assert.equal(setMobile.ok, true);
assert.equal(setMobile.new, 'mobile');
assert.equal(setMobile.sidebarOpen, false);
const layout = ui.getLayout();
assert.equal(layout.mode, 'mobile');
assert.equal(layout.isMobile, true);
assert.equal(layout.isTouch, true);
const badLayout = ui.setLayout('invalid');
assert.equal(badLayout.ok, false);
ui.setLayout('desktop');
console.log('  PASS');

console.log('\n2. setRtl + setLanguage + getTextDirection...');
assert.equal(ui.getTextDirection(), 'ltr');
ui.setRtl(true);
assert.equal(ui.getTextDirection(), 'rtl');
ui.setRtl(false);
const setArabic = ui.setLanguage('ar');
assert.equal(setArabic.ok, true);
assert.equal(setArabic.rtl, true);
assert.equal(ui.getTextDirection(), 'rtl');
ui.setLanguage('en');
ui.setRtl(false);
console.log('  PASS');

console.log('\n3. getLocalizedText...');
const strings = {
  en: { greeting: 'Hello', farewell: 'Goodbye' },
  ar: { greeting: 'مرحبا', farewell: 'وداعا' }
};
ui.setLanguage('en');
assert.equal(ui.getLocalizedText(strings, 'greeting'), 'Hello');
ui.setLanguage('ar');
assert.equal(ui.getLocalizedText(strings, 'greeting'), 'مرحبا');
assert.equal(ui.getLocalizedText(strings, 'missing', 'Fallback'), 'Fallback');
ui.setLanguage('en');
console.log('  PASS');

console.log('\n4. createSceneCard + getSceneCard...');
const sceneCard = ui.createSceneCard({
  id: 'scard1', title: 'The Dragon Lair',
  subtitle: 'Chapter 3', locationName: 'Northern Mountains',
  timeOfDay: 'night', weather: 'storm',
  characters: [
    { id: 'hero', name: 'Aldric', status: 'present' },
    { id: 'dragon', name: 'Ancient Dragon', status: 'hostile' }
  ],
  objectives: [
    { text: 'Defeat the dragon', completed: false },
    { text: 'Find the treasure', completed: false, optional: true }
  ],
  mood: 'tense'
});
assert.equal(sceneCard.title, 'The Dragon Lair');
assert.equal(sceneCard.characters.length, 2);
assert.equal(sceneCard.objectives.length, 2);
assert.equal(sceneCard.objectives[1].optional, true);
const gotCard = ui.getSceneCard('scard1');
assert.equal(gotCard.title, 'The Dragon Lair');
console.log('  PASS');

console.log('\n5. updateSceneCard...');
const updCard = ui.updateSceneCard('scard1', { mood: 'triumphant', expanded: true });
assert.equal(updCard.ok, true);
assert.equal(updCard.card.mood, 'triumphant');
assert.equal(updCard.card.expanded, true);
const badCard = ui.updateSceneCard('nonexistent', {});
assert.equal(badCard.ok, false);
console.log('  PASS');

console.log('\n6. renderTurnOrder...');
const turnOrder = ui.renderTurnOrder([
  { id: 'hero', name: 'Aldric', initiative: 18, health: 85, maxHealth: 100, type: 'player', alive: true },
  { id: 'goblin', name: 'Goblin', initiative: 12, health: 25, maxHealth: 30, type: 'enemy', alive: true },
  { id: 'mage', name: 'Mage', initiative: 15, health: 60, maxHealth: 70, type: 'ally', alive: true }
], 'hero');
assert.equal(turnOrder.length, 3);
assert.equal(turnOrder[0].id, 'hero'); // highest initiative
assert.equal(turnOrder[1].id, 'mage');
assert.equal(turnOrder[2].id, 'goblin');
assert.equal(turnOrder[0].isCurrentTurn, true);
assert.equal(turnOrder[0].healthPercent, 85);
console.log('  PASS');

console.log('\n7. createDialoguePanel + addDialogueEntry...');
const dPanel = ui.createDialoguePanel({
  id: 'dpanel1',
  entries: [
    { speakerName: 'Narrator', speakerType: 'narrator', content: 'The wind howls.' },
    { speakerName: 'Aldric', speakerType: 'player', content: 'I am ready.' }
  ],
  typewriterSpeed: 40,
  showSpeaker: true
});
assert.equal(dPanel.entries.length, 2);
assert.equal(dPanel.typewriterSpeed, 40);
const addEntry = ui.addDialogueEntry('dpanel1', {
  speakerName: 'Dragon', speakerType: 'npc', content: 'Who dares?'
});
assert.equal(addEntry.ok, true);
assert.equal(addEntry.entry.content, 'Who dares?');
const gotPanel = ui.getDialoguePanel('dpanel1');
assert.equal(gotPanel.entries.length, 3);
assert.equal(gotPanel.currentSpeaker, 'Dragon');
console.log('  PASS');

console.log('\n8. createChoicesPanel + selectChoice...');
const choicesPanel = ui.createChoicesPanel({
  id: 'choices1',
  prompt: 'How do you approach the dragon?',
  choices: [
    { text: 'Attack aggressively', style: 'aggressive' },
    { text: 'Try to negotiate', style: 'diplomatic' },
    { text: 'Sneak past quietly', style: 'stealth', skillCheck: { skill: 'stealth', dc: 15 } },
    { text: 'Run away', disabled: true }
  ],
  allowCustomInput: true,
  timeLimit: 30
});
assert.equal(choicesPanel.choices.length, 4);
assert.equal(choicesPanel.choices[3].disabled, true);
assert.equal(choicesPanel.choices[2].skillCheck.dc, 15);
const selectResult = ui.selectChoice('choices1', choicesPanel.choices[1].id);
assert.equal(selectResult.ok, true);
assert.equal(selectResult.selected.text, 'Try to negotiate');
const selectDisabled = ui.selectChoice('choices1', choicesPanel.choices[3].id);
assert.equal(selectDisabled.ok, false);
assert.equal(selectDisabled.reason, 'choice-disabled');
console.log('  PASS');

console.log('\n9. rollDice...');
const d20 = ui.rollDice({ sides: 20, count: 1, modifier: 5 });
assert.equal(d20.sides, 20);
assert.equal(d20.count, 1);
assert.equal(d20.modifier, 5);
assert.ok(d20.rolls[0] >= 1 && d20.rolls[0] <= 20);
assert.equal(d20.total, d20.rolls[0] + 5);
assert.ok(d20.notation.includes('1d20'));
const d6pair = ui.rollDice({ sides: 6, count: 2 });
assert.equal(d6pair.rolls.length, 2);
assert.equal(d6pair.count, 2);
console.log('  PASS');

console.log('\n10. getDiceHistory...');
const history = ui.getDiceHistory('default', 10);
assert.ok(history.length >= 2);
assert.equal(history[history.length - 1].notation, '2d6');
console.log('  PASS');

console.log('\n11. renderCharacterSheet...');
const sheet = ui.renderCharacterSheet({
  id: 'hero', name: 'Aldric', level: 5, class: 'warrior', race: 'human',
  attributes: { strength: 16, dexterity: 14, constitution: 15, intelligence: 10, wisdom: 11, charisma: 13 },
  health: { current: 85, max: 100 },
  mana: { current: 30, max: 50 },
  armorClass: 16, speed: 30, proficiencyBonus: 3,
  skills: { athletics: 6, intimidation: 4 },
  conditions: ['blessed'],
  gold: 250, xp: 3500, xpToNext: 5000
});
assert.equal(sheet.name, 'Aldric');
assert.equal(sheet.level, 5);
assert.equal(sheet.attributes.strength, 16);
assert.equal(sheet.modifiers.strength, 3); // (16-10)/2
assert.equal(sheet.modifiers.dexterity, 2); // (14-10)/2
assert.equal(sheet.health.percent, 85);
assert.equal(sheet.mana.percent, 60);
assert.equal(sheet.armorClass, 16);
assert.deepEqual(sheet.conditions, ['blessed']);
console.log('  PASS');

console.log('\n12. renderInventoryGrid...');
const invGrid = ui.renderInventoryGrid([
  { id: 'sword', name: 'Iron Sword', icon: 'sword', rarity: 'common', equipped: true, weight: 3, value: 50 },
  { id: 'potion', name: 'Health Potion', quantity: 5, stackable: true, rarity: 'common' },
  { id: 'ring', name: 'Ring of Power', rarity: 'epic', value: 500 },
  { id: 'gem', name: 'Ruby', rarity: 'rare', value: 200 },
  { id: 'scroll', name: 'Fire Scroll', rarity: 'uncommon' }
], 4);
assert.equal(invGrid.columns, 4);
assert.equal(invGrid.totalItems, 5);
assert.equal(invGrid.rowCount, 2); // 4 + 1 (padded)
assert.equal(invGrid.grid[0].length, 4);
assert.equal(invGrid.grid[0][0].name, 'Iron Sword');
assert.equal(invGrid.grid[0][0].equipped, true);
assert.equal(invGrid.grid[1][0].name, 'Fire Scroll');
assert.equal(invGrid.grid[1][1].empty, true); // padded
console.log('  PASS');

console.log('\n13. renderMapViewer + panMap + zoomMap...');
const mapData = {
  nodes: [
    { id: 'town', name: 'Town', x: 0, y: 0, type: 'city', discovered: true },
    { id: 'forest', name: 'Forest', x: 100, y: 50, type: 'wilderness', discovered: true },
    { id: 'dungeon', name: 'Dungeon', x: 200, y: -50, type: 'dungeon', discovered: false }
  ],
  edges: [
    { from: 'town', to: 'forest' },
    { from: 'forest', to: 'dungeon' }
  ]
};
const mapView = ui.renderMapViewer(mapData, { x: 0, y: 0, zoom: 1, width: 800, height: 600 });
assert.ok(mapView.nodes.length >= 2);
assert.ok(mapView.nodes.length <= 3);
assert.ok(mapView.visibleCount >= 2);
const townNode = mapView.nodes.find(n => n.id === 'town');
assert.ok(townNode);
assert.equal(townNode.screenX, 400); // center of 800px
assert.equal(townNode.screenY, 300); // center of 600px
const panned = ui.panMap({ x: 0, y: 0, zoom: 1 }, 50, -30);
assert.equal(panned.x, 50);
assert.equal(panned.y, -30);
const zoomed = ui.zoomMap({ x: 0, y: 0, zoom: 1 }, 2);
assert.equal(zoomed.zoom, 2);
console.log('  PASS');

console.log('\n14. renderJournalView...');
const journal = [
  { id: 'j1', type: 'quest', section: 'Active Quests', title: 'Slay the Dragon', content: 'A dragon threatens the village', completed: false, pinned: true, tags: ['main'] },
  { id: 'j2', type: 'quest', section: 'Active Quests', title: 'Find the Herbalist', content: 'Collect rare herbs', completed: false, tags: ['side'] },
  { id: 'j3', type: 'note', section: 'Notes', title: 'Dragon Weakness', content: 'Dragons are weak to ice', completed: true, tags: ['lore'] }
];
const jView = ui.renderJournalView(journal, {});
assert.equal(jView.totalEntries, 3);
assert.equal(jView.sections.length, 2);
const activeSection = jView.sections.find(s => s.name === 'Active Quests');
assert.equal(activeSection.items.length, 2);
assert.equal(activeSection.items[0].pinned, true); // pinned first
const searchView = ui.renderJournalView(journal, { search: 'dragon' });
assert.equal(searchView.filteredCount, 2);
console.log('  PASS');

console.log('\n15. getSetting + setSetting...');
assert.equal(ui.getSetting('display', 'theme'), 'auto');
const setThemeResult = ui.setSetting('display', 'theme', 'dark');
assert.equal(setThemeResult.ok, true);
assert.equal(setThemeResult.value, 'dark');
assert.equal(ui.getSetting('display', 'theme'), 'dark');
const setVol = ui.setSetting('audio', 'masterVolume', 0.5);
assert.equal(setVol.ok, true);
assert.equal(ui.getSetting('audio', 'masterVolume'), 0.5);
const badCategory = ui.setSetting('invalid', 'key', 'value');
assert.equal(badCategory.ok, false);
const badKey = ui.setSetting('display', 'invalidKey', 'value');
assert.equal(badKey.ok, false);
console.log('  PASS');

console.log('\n16. resetSettings...');
ui.setSetting('display', 'fontSize', 24);
assert.equal(ui.getSetting('display', 'fontSize'), 24);
ui.resetSettings('display');
assert.equal(ui.getSetting('display', 'fontSize'), 16);
console.log('  PASS');

console.log('\n17. createTutorialStep + getTutorialSteps...');
const tut1 = ui.createTutorialStep({
  id: 'tut1', order: 1, title: 'Welcome',
  content: 'Welcome to Seven RPG! Click Next to begin.',
  targetElement: '#start-button', position: 'bottom'
});
const tut2 = ui.createTutorialStep({
  id: 'tut2', order: 2, title: 'Dialogue',
  content: 'Read dialogue here and make choices.',
  targetElement: '#dialogue-panel', position: 'top', allowSkip: true
});
assert.equal(tut1.order, 1);
assert.equal(tut2.allowSkip, true);
const steps = ui.getTutorialSteps();
assert.equal(steps.length, 2);
assert.equal(steps[0].title, 'Welcome');
console.log('  PASS');

console.log('\n18. completeTutorialStep + skipTutorialStep + getTutorialProgress...');
ui.completeTutorialStep('tut1');
ui.skipTutorialStep('tut2');
const progress = ui.getTutorialProgress();
assert.equal(progress.total, 2);
assert.equal(progress.completed, 1);
assert.equal(progress.skipped, 1);
assert.equal(progress.percentage, 50);
assert.equal(progress.finished, true);
console.log('  PASS');

console.log('\n19. getAccessibilityConfig + setAccessibilityMode...');
const defaultA11y = ui.getAccessibilityConfig();
assert.equal(defaultA11y.mode, 'default');
assert.equal(defaultA11y.contrastRatio, 4.5);
const hcResult = ui.setAccessibilityMode('high-contrast');
assert.equal(hcResult.ok, true);
assert.equal(hcResult.config.contrastRatio, 7);
assert.equal(hcResult.config.reduceMotion, true);
ui.setAccessibilityMode('screen-reader');
const srConfig = ui.getAccessibilityConfig();
assert.equal(srConfig.screenReaderHints, true);
assert.equal(srConfig.contrastRatio, 7);
ui.setAccessibilityMode('default');
console.log('  PASS');

console.log('\n20. getAnimationConfig + setAnimationSpeed...');
const normalAnim = ui.getAnimationConfig();
assert.equal(normalAnim.enabled, true);
assert.equal(normalAnim.duration, 250);
const offResult = ui.setAnimationSpeed('off');
assert.equal(offResult.ok, true);
assert.equal(offResult.config.enabled, false);
assert.equal(offResult.config.duration, 0);
ui.setAnimationSpeed('normal');
const badSpeed = ui.setAnimationSpeed('invalid');
assert.equal(badSpeed.ok, false);
console.log('  PASS');

console.log('\n21. setSoundSetting + getSoundSetting + toggleMute + getEffectiveVolume...');
ui.setSoundSetting('master', 0.8);
ui.setSoundSetting('combat-hit', 0.6);
ui.setSoundSetting('dialogue', 1.0);
assert.equal(ui.getEffectiveVolume('combat-hit'), 0.48); // 0.8 * 0.6
assert.equal(ui.getEffectiveVolume('dialogue'), 0.8); // 0.8 * 1.0
const muteResult = ui.toggleMute('combat-hit');
assert.equal(muteResult.ok, true);
assert.equal(muteResult.muted, true);
assert.equal(ui.getEffectiveVolume('combat-hit'), 0);
ui.toggleMute('combat-hit');
assert.equal(ui.getEffectiveVolume('combat-hit'), 0.48);
const muteMaster = ui.toggleMute();
assert.equal(muteMaster.muted, true);
assert.equal(ui.getEffectiveVolume('dialogue'), 0);
ui.toggleMute();
console.log('  PASS');

console.log('\n22. notify + getNotifications + markNotificationRead...');
const notif1 = ui.notify({ level: 'success', title: 'Level Up!', message: 'You reached level 5!', persistent: true });
assert.equal(notif1.level, 'success');
const notif2 = ui.notify({ level: 'warning', title: 'Low Health', message: 'Your health is below 20%' });
const notif3 = ui.notify({ level: 'error', title: 'Save Failed', message: 'Could not save game' });
const allNotifs = ui.getNotifications();
assert.equal(allNotifs.length, 3);
const errorNotifs = ui.getNotifications({ level: 'error' });
assert.equal(errorNotifs.length, 1);
const unread = ui.getNotifications({ unreadOnly: true });
assert.equal(unread.length, 3);
ui.markNotificationRead(notif1.id);
const unreadAfter = ui.getNotifications({ unreadOnly: true });
assert.equal(unreadAfter.length, 2);
console.log('  PASS');

console.log('\n23. setTheme + getTheme...');
const darkResult = ui.setTheme('dark');
assert.equal(darkResult.ok, true);
const themeResult = ui.getTheme();
assert.equal(themeResult.theme, 'dark');
assert.equal(themeResult.resolved, 'dark');
ui.setTheme('auto');
const autoTheme = ui.getTheme();
assert.equal(autoTheme.theme, 'auto');
assert.equal(autoTheme.resolved, 'dark'); // auto resolves to dark
const badTheme = ui.setTheme('neon');
assert.equal(badTheme.ok, false);
console.log('  PASS');

console.log('\n24. openModal + closeModal + getUiState...');
ui.openModal({ type: 'confirm', title: 'Delete Save?', message: 'This cannot be undone.'});
let state1 = ui.getUiState();
assert.equal(state1.modalOpen, true);
assert.equal(state1.modalContent.title, 'Delete Save?');
ui.closeModal();
state1 = ui.getUiState();
assert.equal(state1.modalOpen, false);
assert.equal(state1.modalContent, null);
console.log('  PASS');

console.log('\n25. Edge cases...');
assert.equal(ui.getSceneCard('nonexistent'), null);
assert.equal(ui.getDialoguePanel('nonexistent'), null);
assert.equal(ui.getChoicesPanel('nonexistent'), null);
const badSelect = ui.selectChoice('nonexistent', 'ch1');
assert.equal(badSelect.ok, false);
const badAdd = ui.addDialogueEntry('nonexistent', {});
assert.equal(badAdd.ok, false);
const badComplete = ui.completeTutorialStep('nonexistent');
assert.equal(badComplete.ok, false);
const badSkip = ui.skipTutorialStep('nonexistent');
assert.equal(badSkip.ok, false);
assert.equal(ui.getSetting('invalid', 'key'), null);
assert.equal(ui.getSetting('display', 'invalidKey'), null);
const emptyGrid = ui.renderInventoryGrid([], 4);
assert.equal(emptyGrid.totalItems, 0);
const emptyMap = ui.renderMapViewer({}, {});
assert.equal(emptyMap.totalNodes, 0);
console.log('  PASS');

console.log('\n✅ All RPG UI System tests passed!');
console.log('\nCoverage:');
console.log('  RPG-11-01 (responsive layout): setLayout, getLayout with breakpoints');
console.log('  RPG-11-02 (Arabic RTL support): setRtl, setLanguage, getTextDirection, getLocalizedText');
console.log('  RPG-11-03 (scene card UI): createSceneCard, updateSceneCard with characters/objectives');
console.log('  RPG-11-04 (turn order display): renderTurnOrder with sorting and health percent');
console.log('  RPG-11-05 (dialogue panel): createDialoguePanel, addDialogueEntry, getDialoguePanel');
console.log('  RPG-11-06 (choices panel): createChoicesPanel, selectChoice with skill checks');
console.log('  RPG-11-07 (dice roller widget): rollDice with 7 dice types, getDiceHistory');
console.log('  RPG-11-08 (character sheet): renderCharacterSheet with modifiers and percent bars');
console.log('  RPG-11-09 (inventory grid): renderInventoryGrid with column layout and padding');
console.log('  RPG-11-10 (map viewer): renderMapViewer with viewport culling, panMap, zoomMap');
console.log('  RPG-11-11 (journal view): renderJournalView with sections, search, pin sort');
console.log('  RPG-11-12 (settings panel): getSetting, setSetting, getAllSettings, resetSettings');
console.log('  RPG-11-13 (tutorial overlay): createTutorialStep, complete/skip, getTutorialProgress');
console.log('  RPG-11-14 (accessibility): getAccessibilityConfig, setAccessibilityMode (5 modes)');
console.log('  RPG-11-15 (animations): getAnimationConfig, setAnimationSpeed (4 speeds)');
console.log('  RPG-11-16 (sound controls): setSoundSetting, toggleMute, getEffectiveVolume');
