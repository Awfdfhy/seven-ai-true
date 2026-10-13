'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Character = require('./workspaces/rpg-character.js');

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function text(v) { return typeof v === 'string' ? v.trim() : ''; }

const seed = {
  sessionId: 'character-test', worldId: 'valen-character',
  timeline: { tick: 5 }, world: { locations: { capital: { name: 'Capital' } } },
  characters: { hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' } } },
  quests: {}, canon: { entries: {} }
};

const state = State.createState(seed);
const charMgr = Character.createCharacterManager(State);

console.log('Testing RPG Character System...');

console.log('\n1. createCharacter - basic...');
const char1 = charMgr.createCharacter({
  id: 'hero1', type: 'player', name: 'Aldric', identity: { title: 'Knight' },
  age: 28, appearance: { hair: 'blond', eyes: 'blue' },
  personality: { brave: true, honorable: true },
  motivations: ['protect kingdom', 'find father'],
  goals: [{ description: 'Defeat the dragon', priority: 10 }],
  fears: ['failure', 'dragons'],
  preferences: { weapon: 'sword' },
  abilities: ['swordplay', 'leadership'],
  inventory: ['longsword', 'shield'],
  locationId: 'capital',
  emotions: { happiness: 0.5, anger: 0.1 },
  secrets: ['royal lineage'],
  beliefs: { 'king is just': 0.8 },
  knowledge: { 'dragon weakness': { learnedAtTick: 3 } },
  history: [{ type: 'event', description: 'Knighted by king' }],
  promises: [{ to: 'king', promise: 'protect realm' }],
  injuries: [],
  status: 'active',
  loyalties: { kingdom: 1.0 },
  opinions: { 'dark lord': -1.0 },
  voice: { vocabulary: 'formal', formality: 'high' },
  control: 'player'
});
assert.equal(char1.id, 'hero1');
assert.equal(char1.name, 'Aldric');
assert.equal(char1.type, 'player');
assert.equal(char1.age, 28);
assert.ok(char1.goals.length === 1);
assert.equal(char1.goals[0].description, 'Defeat the dragon');
assert.ok(char1.secrets.includes('royal lineage'));
console.log('  PASS');

console.log('\n2. createCharacter - NPC...');
const npc1 = charMgr.createCharacter({
  name: 'Merchant', type: 'npc', identity: { role: 'shopkeeper' },
  motivations: ['profit', 'safety'],
  goals: [{ description: 'Expand trade routes', priority: 5 }],
  fears: ['bandits', 'taxes'],
  secrets: ['smuggles goods'],
  control: 'ai'
});
assert.equal(npc1.type, 'npc');
assert.equal(npc1.control, 'ai');
assert.ok(npc1.goals.length === 1);
console.log('  PASS');

console.log('\n3. addTraits...');
charMgr.addTraits(char1, [
  { name: 'Strong', category: 'physical', value: 3, description: 'Above average strength' },
  { name: 'Intelligent', category: 'mental', value: 2, description: 'Quick learner' }
]);
assert.equal(char1.traits.length, 2);
assert.equal(char1.traits[0].name, 'Strong');
assert.equal(char1.traits[0].category, 'physical');
assert.equal(char1.traits[0].value, 3);
console.log('  PASS');

console.log('\n4. setDrives...');
charMgr.setDrives(char1, [
  { type: 'duty', intensity: 0.9, description: 'Sworn to protect the realm' },
  { type: 'knowledge', intensity: 0.6, description: 'Seeks truth about lineage' }
]);
assert.equal(char1.drives.length, 2);
assert.equal(char1.drives[0].type, 'duty');
assert.equal(char1.drives[0].intensity, 0.9);
console.log('  PASS');

console.log('\n5. evolveMotivation...');
const goalId = char1.goals[0].id;
const evolved = charMgr.evolveMotivation(char1, goalId, 'Defeat the dragon and claim its hoard', 'Learned of treasure');
assert.equal(evolved.ok, true);
assert.equal(evolved.goal.description, 'Defeat the dragon and claim its hoard');
assert.equal(char1.motivationHistory.length, 1);
assert.equal(char1.motivationHistory[0].oldDescription, 'Defeat the dragon');
assert.equal(char1.motivationHistory[0].newDescription, 'Defeat the dragon and claim its hoard');
console.log('  PASS');

console.log('\n6. updateGoalProgress...');
const updated = charMgr.updateGoalProgress(char1, goalId, 50);
assert.equal(updated.ok, true);
assert.equal(updated.goal.progress, 50);
assert.equal(updated.goal.status, 'active');
const completed = charMgr.updateGoalProgress(char1, goalId, 100);
assert.equal(completed.goal.status, 'completed');
assert.ok(completed.goal.completedAt);
console.log('  PASS');

console.log('\n7. addMemory / getMemories...');
charMgr.addMemory(char1, { type: 'event', description: 'Met mysterious stranger', location: 'tavern', importance: 0.8, tags: ['mystery'] });
charMgr.addMemory(char1, { type: 'combat', description: 'Fought goblins', location: 'forest', importance: 0.6, tags: ['combat'] });
const memories = charMgr.getMemories(char1, { tag: 'mystery' });
assert.equal(memories.length, 1);
assert.equal(memories[0].description, 'Met mysterious stranger');
const allMemories = charMgr.getMemories(char1, {});
assert.equal(allMemories.length, 3); // 1 from creation + 2 added
console.log('  PASS');

console.log('\n8. setRelationship / getRelationship...');
charMgr.setRelationship(char1, 'npc1', { trust: 0.5, affection: 0.3, loyalty: 0.4 }, { reason: 'helped in battle' });
const rel = charMgr.getRelationship(char1, 'npc1');
assert.ok(rel);
assert.equal(rel.trust, 0.5);
assert.equal(rel.affection, 0.3);
assert.equal(rel.loyalty, 0.4);
assert.equal(rel.events.length, 1);
console.log('  PASS');

console.log('\n9. getAllRelationships...');
charMgr.setRelationship(char1, 'npc2', { trust: -0.2, fear: 0.7 }, { reason: 'threatened' });
const allRels = charMgr.getAllRelationships(char1);
assert.ok(allRels.npc1);
assert.ok(allRels.npc2);
assert.equal(allRels.npc2.fear, 0.7);
console.log('  PASS');

console.log('\n10. getTrustMetric...');
const trust = charMgr.getTrustMetric(char1, 'npc1');
assert.equal(trust, 0.5);
const noTrust = charMgr.getTrustMetric(char1, 'unknown');
assert.equal(noTrust, 0);
console.log('  PASS');

console.log('\n11. updateReputation...');
charMgr.updateReputation(char1, 50, 'kingdom', 'Saved village');
assert.equal(char1.reputation.score, 50);
assert.equal(char1.reputation.level, 'recognized');
assert.equal(char1.reputation.factions.kingdom, 50);
charMgr.updateReputation(char1, 500, 'kingdom', 'Defeated dragon');
assert.equal(char1.reputation.level, 'respected'); // 550 total score
charMgr.updateReputation(char1, 500, 'kingdom', 'Legendary deeds');
assert.equal(char1.reputation.level, 'legendary'); // 1050 total score
console.log('  PASS');

console.log('\n12. setFactionAffinity / getFactionAffinity...');
charMgr.setFactionAffinity(char1, 'merchants_guild', 0.7, 'Trade agreement');
assert.equal(char1.factionAffinities.merchants_guild, 0.7);
const affinity = charMgr.getFactionAffinity(char1, 'merchants_guild');
assert.equal(affinity, 0.7);
console.log('  PASS');

console.log('\n13. setKnowledgeBoundary / checkKnowledgeAccess...');
charMgr.setKnowledgeBoundary(char1, 'dragon_lair_location', 'secret', { requiresTrust: 0.8 });
const access1 = charMgr.checkKnowledgeAccess(char1, 'dragon_lair_location', 'npc1');
assert.equal(access1.allowed, false);
assert.equal(access1.reason, 'insufficient-trust');
charMgr.setRelationship(char1, 'npc1', { trust: 0.5 }, { reason: 'deep bond' });
const access2 = charMgr.checkKnowledgeAccess(char1, 'dragon_lair_location', 'npc1');
assert.equal(access2.allowed, true); // trust is now 1.0 (0.5 + 0.5 = 1.0 clamped)
assert.equal(access2.reason, 'high-trust');
console.log('  PASS');

console.log('\n14. setSecretRevealRule / checkSecretReveal...');
// Add secrets first
char1.secrets.push('hidden treasure', 'ancient prophecy');
charMgr.setSecretRevealRule(char1, 'royal lineage', 'on_trust_max', {});
const reveal1 = charMgr.checkSecretReveal(char1, 'royal lineage', { trust: 0.9 });
assert.equal(reveal1.allowed, false);
const reveal2 = charMgr.checkSecretReveal(char1, 'royal lineage', { trust: 1.0 });
assert.equal(reveal2.allowed, true);
assert.equal(reveal2.reason, 'max-trust');

charMgr.setSecretRevealRule(char1, 'hidden treasure', 'on_death', {});
const reveal3 = charMgr.checkSecretReveal(char1, 'hidden treasure', { characterDead: true });
assert.equal(reveal3.allowed, true);
assert.equal(reveal3.reason, 'death-reveal');

charMgr.setSecretRevealRule(char1, 'ancient prophecy', 'on_condition', { key: 'prophecy_trigger' });
const reveal4 = charMgr.checkSecretReveal(char1, 'ancient prophecy', {});
assert.equal(reveal4.allowed, false);
const reveal5 = charMgr.checkSecretReveal(char1, 'ancient prophecy', { prophecy_trigger: true });
assert.equal(reveal5.allowed, true);
console.log('  PASS');

console.log('\n15. setPortrait / getPortrait...');
charMgr.setPortrait(char1, { imageUrl: '/art/aldric.png', thumbnailUrl: '/art/aldric_thumb.png', artist: 'Artist', style: 'realistic' });
const portrait = charMgr.getPortrait(char1);
assert.ok(portrait);
assert.equal(portrait.imageUrl, '/art/aldric.png');
assert.equal(portrait.characterId, 'hero1');
assert.equal(char1.portraitId, portrait.id);
console.log('  PASS');

console.log('\n16. setDialogueStyle / getDialogueStyle / formatDialogue...');
charMgr.setDialogueStyle(char1, {
  style: 'formal',
  vocabulary: 'archaic',
  formality: 'high',
  recurringExpressions: ['By the gods!', 'I swear'],
  culturalBackground: 'knightly order'
});
const style = charMgr.getDialogueStyle(char1);
assert.ok(style);
assert.equal(style.style, 'formal');
assert.ok(style.recurringExpressions.includes('By the gods!'));
const formatted = charMgr.formatDialogue(char1, 'I shall defend the realm.');
assert.ok(typeof formatted === 'string');
console.log('  PASS');

console.log('\n17. exportCharacter / importCharacter...');
const exported = charMgr.exportCharacter(char1);
assert.equal(exported.id, 'hero1');
assert.equal(exported.name, 'Aldric');
const imported = charMgr.importCharacter(exported, {});
assert.equal(imported.id, exported.id);
assert.equal(imported.name, exported.name);
console.log('  PASS');

console.log('\n18. getCharacterSummary...');
const summary = charMgr.getCharacterSummary(char1);
assert.equal(summary.id, 'hero1');
assert.equal(summary.name, 'Aldric');
assert.equal(summary.type, 'player');
assert.equal(summary.goals, 0); // goal completed, no active goals
assert.equal(summary.traits, 2);
assert.equal(summary.drives, 2);
assert.equal(summary.relationships, 2);
assert.equal(summary.reputation, 'legendary'); // 1050 total score
assert.ok(summary.hasPortrait);
assert.ok(summary.hasDialogueStyle);
console.log('  PASS');

console.log('\n19. normalizeVoice...');
const voice = charMgr.normalizeVoice({ vocabulary: 'test', sentenceLength: 'long', humor: 'dry', formality: 'high' });
assert.equal(voice.vocabulary, 'test');
assert.equal(voice.formality, 'high');
console.log('  PASS');

console.log('\n20. Edge cases - clamped values...');
charMgr.addTraits(char1, [{ name: 'Overpowered', category: 'physical', value: 100 }]);
assert.equal(char1.traits[2].value, 5);
charMgr.setRelationship(char1, 'npc3', { trust: 10 }, {});
const rel2 = charMgr.getRelationship(char1, 'npc3');
assert.equal(rel2.trust, 1);
charMgr.updateReputation(char1, 10000);
assert.equal(char1.reputation.score, 1000);
console.log('  PASS');

console.log('\n✅ All RPG Character System tests passed!');
console.log('\nCoverage:');
console.log('  RPG-04-01 (character sheets): createCharacter with full data');
console.log('  RPG-04-02 (NPC profiles): createCharacter with type npc');
console.log('  RPG-04-03 (traits and drives): addTraits, setDrives');
console.log('  RPG-04-04 (goals and fears): goals array, fears array, updateGoalProgress');
console.log('  RPG-04-05 (motivation evolution): evolveMotivation, motivationHistory');
console.log('  RPG-04-06 (character memory): addMemory, getMemories, history');
console.log('  RPG-04-07 (relationship graph): setRelationship, getAllRelationships');
console.log('  RPG-04-08 (relationship history): relationship events in setRelationship');
console.log('  RPG-04-09 (trust metrics): getTrustMetric, trust dimension');
console.log('  RPG-04-10 (reputation): updateReputation, reputation levels');
console.log('  RPG-04-11 (faction affinity): setFactionAffinity, getFactionAffinity');
console.log('  RPG-04-12 (knowledge boundaries): setKnowledgeBoundary, checkKnowledgeAccess');
console.log('  RPG-04-13 (secret reveal rules): setSecretRevealRule, checkSecretReveal');
console.log('  RPG-04-14 (character portrait support): setPortrait, getPortrait');
console.log('  RPG-04-15 (character dialogue styles): setDialogueStyle, formatDialogue');