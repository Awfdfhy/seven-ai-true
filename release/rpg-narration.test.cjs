'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Narration = require('./workspaces/rpg-narration.js');

const seed = {
  sessionId: 'narration-test', worldId: 'valen-narration',
  timeline: { tick: 5 }, world: { locations: { capital: { name: 'Capital' } } },
  characters: { hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' } } },
  quests: {}, canon: { entries: {} }
};

const state = State.createState(seed);
const nara = Narration.createNarrationManager(State);

console.log('Testing RPG Narration System...');

console.log('\n1. createNarrationEntry - narrator styling...');
const narrEntry = nara.createNarrationEntry({
  speakerType: 'narrator',
  content: 'The wind howled through the ancient pines.',
  style: 'descriptive'
});
assert.equal(narrEntry.speakerType, 'narrator');
assert.equal(narrEntry.style, 'descriptive');
assert.ok(narrEntry.content.includes('wind'));
console.log('  PASS');

console.log('\n2. createNarrationEntry - character dialogue...');
const dialogueEntry = nara.createNarrationEntry({
  speakerType: 'npc',
  speakerId: 'merchant',
  speakerName: 'Old Merchant',
  content: 'Welcome, traveler! Fine wares today!'
});
assert.equal(dialogueEntry.speakerType, 'npc');
assert.equal(dialogueEntry.speakerId, 'merchant');
assert.equal(dialogueEntry.style, null);
console.log('  PASS');

console.log('\n3. attributeSpeaker...');
const charMap = { merchant: { name: 'Old Merchant', voice: { vocabulary: 'archaic', formality: 'medium' } } };
const attributed = nara.attributeSpeaker(
  { speakerId: 'merchant', content: 'Welcome!' }, charMap
);
assert.equal(attributed.speakerName, 'Old Merchant');
assert.equal(attributed.speakerType, 'npc');
assert.equal(attributed.characterId, 'merchant');
assert.ok(attributed.dialogueStyle);
console.log('  PASS');

console.log('\n4. Player agency - lock/unlock...');
assert.equal(nara.isPlayerAgencyLocked(), false);
assert.equal(nara.canPlayerAct(), true);
nara.lockPlayerAgency('cutscene-active', 'gm');
assert.equal(nara.isPlayerAgencyLocked(), true);
assert.equal(nara.canPlayerAct(), false);
const lockedCheck = nara.assertPlayerAgency('attack dragon');
assert.equal(lockedCheck.allowed, false);
assert.equal(lockedCheck.reason, 'cutscene-active');
nara.unlockPlayerAgency();
assert.equal(nara.isPlayerAgencyLocked(), false);
const unlockedCheck = nara.assertPlayerAgency('attack dragon');
assert.equal(unlockedCheck.allowed, true);
console.log('  PASS');

console.log('\n5. createScene - scene card...');
const scene1 = nara.createScene({
  id: 'scene1', title: 'The Market Encounter',
  chapterId: 'ch1', locationId: 'capital', timeOfDay: 'morning',
  characters: ['hero', 'merchant'],
  objectives: [{ description: 'Find the informant' }],
  tone: 'neutral'
});
assert.equal(scene1.id, 'scene1');
assert.equal(scene1.title, 'The Market Encounter');
assert.equal(scene1.status, 'planned');
assert.equal(scene1.pacing, 'normal');
assert.equal(scene1.objectives.length, 1);
console.log('  PASS');

console.log('\n6. updateScene - start scene...');
const started = nara.updateScene('scene1', { status: 'active' });
assert.equal(started.ok, true);
assert.equal(started.scene.status, 'active');
assert.ok(started.scene.startedAt);
console.log('  PASS');

console.log('\n7. addSceneEntry...');
const entry1 = nara.addSceneEntry('scene1', {
  speakerType: 'narrator', content: 'You enter the bustling market square.'
});
assert.equal(entry1.ok, true);
assert.equal(entry1.entry.sceneId, 'scene1');
const entry2 = nara.addSceneEntry('scene1', {
  speakerType: 'npc', speakerId: 'merchant', content: 'Looking for someone?'
});
assert.equal(entry2.ok, true);
const scene = nara.getScene('scene1');
assert.equal(scene.entries.length, 2);
console.log('  PASS');

console.log('\n8. createChapter + getChapters...');
const ch1 = nara.createChapter({ id: 'ch1', title: 'Chapter 1: Arrival', order: 1, arcId: 'arc1' });
const ch2 = nara.createChapter({ id: 'ch2', title: 'Chapter 2: Discovery', order: 2, arcId: 'arc1' });
assert.equal(ch1.title, 'Chapter 1: Arrival');
const chapters = nara.getChapters({ arcId: 'arc1' });
assert.equal(chapters.length, 2);
assert.equal(chapters[0].title, 'Chapter 1: Arrival');
console.log('  PASS');

console.log('\n9. createArc + getArcProgress...');
const arc1 = nara.createArc({
  id: 'arc1', title: 'The Dragon Threat', description: 'A dragon awakens',
  plannedChapters: 5, themes: ['heroism', 'sacrifice'], tone: 'epic'
});
assert.equal(arc1.title, 'The Dragon Threat');
assert.equal(arc1.plannedChapters, 5);
const progress = nara.getArcProgress('arc1');
assert.equal(progress.plannedChapters, 5);
assert.equal(progress.completedChapters, 0);
assert.equal(progress.percentage, 0);
console.log('  PASS');

console.log('\n10. addSceneObjective / completeSceneObjective...');
const obj1 = nara.addSceneObjective('scene1', { description: 'Talk to the guard', optional: true });
assert.equal(obj1.ok, true);
assert.equal(obj1.objective.optional, true);
const complete1 = nara.completeSceneObjective('scene1', obj1.objective.id, true);
assert.equal(complete1.ok, true);
assert.equal(complete1.objective.completed, true);
const objectives = nara.getSceneObjectives('scene1');
assert.equal(objectives.length, 2);
assert.equal(objectives.filter(o => o.completed).length, 1);
console.log('  PASS');

console.log('\n11. setScenePacing + getPacingRecommendation...');
const pacingResult = nara.setScenePacing('scene1', 'fast');
assert.equal(pacingResult.ok, true);
assert.equal(pacingResult.newPacing, 'fast');
const invalidPacing = nara.setScenePacing('scene1', 'invalid-mode');
assert.equal(invalidPacing.ok, false);
const recommendation = nara.getPacingRecommendation('scene1');
assert.ok(recommendation.recommended);
console.log('  PASS');

console.log('\n12. generateRecap...');
const completedScene = nara.createScene({ title: 'Earlier Scene', locationId: 'forest' });
nara.updateScene(completedScene.id, { status: 'completed' });
const recap = nara.generateRecap('session-1', { maxEntries: 5 });
assert.equal(recap.sessionId, 'session-1');
assert.ok(Array.isArray(recap.recentScenes));
assert.ok(recap.recentScenes.length >= 1);
assert.ok(recap.summary.includes('Recap'));
console.log('  PASS');

console.log('\n13. createChoice / resolveChoice...');
const choice1 = nara.createChoice({
  sceneId: 'scene1',
  prompt: 'What do you do?',
  type: 'moral',
  options: [
    { text: 'Help the villager', consequences: ['cons-good'] },
    { text: 'Ignore and move on', consequences: ['cons-neutral'] }
  ],
  required: true
});
assert.equal(choice1.options.length, 2);
assert.equal(choice1.required, true);
const resolved = nara.resolveChoice(choice1.id, choice1.options[0].id);
assert.equal(resolved.ok, true);
assert.equal(resolved.choice.selectedOptionId, choice1.options[0].id);
assert.ok(resolved.choice.resolvedAt);
console.log('  PASS');

console.log('\n14. createDialogueVariant / selectDialogueVariant...');
const dv1 = nara.createDialogueVariant({
  characterId: 'merchant',
  baseText: 'Welcome.',
  variants: [
    { text: 'Ah, a customer! Come in!', tone: 'cheerful', tags: ['greeting', 'shop'] },
    { text: 'What do you want?', tone: 'neutral', tags: ['greeting'] },
    { text: 'Back again? Fine...', tone: 'comedic', tags: ['greeting', 'repeat'] }
  ],
  weight: 2
});
assert.equal(dv1.variants.length, 3);
const selected = nara.selectDialogueVariant('merchant', ['greeting', 'shop']);
assert.ok(selected);
assert.equal(selected.variant.tags.includes('shop'), true);
const selectedRepeat = nara.selectDialogueVariant('merchant', ['greeting', 'repeat']);
assert.equal(selectedRepeat.variant.tags.includes('repeat'), true);
console.log('  PASS');

console.log('\n15. setNpcInitiative / getNpcInitiativeOrder / shouldNpcAct...');
nara.setNpcInitiative('guard1', 80);
nara.setNpcInitiative('merchant', 30);
nara.setNpcInitiative('thief', 95);
const order = nara.getNpcInitiativeOrder();
assert.equal(order[0].npcId, 'thief');
assert.equal(order[0].initiative, 95);
assert.equal(order[2].npcId, 'merchant');
assert.equal(nara.shouldNpcAct('thief', 50), true);
assert.equal(nara.shouldNpcAct('merchant', 50), false);
console.log('  PASS');

console.log('\n16. createConsequence / applyConsequence...');
const cons1 = nara.createConsequence({
  sourceType: 'choice', sourceId: choice1.id,
  description: 'Villager becomes an ally',
  type: 'persistent', effect: { relationship: { trust: 0.3 } }
});
assert.equal(cons1.applied, false);
const applied1 = nara.applyConsequence(cons1.id);
assert.equal(applied1.ok, true);
assert.equal(applied1.consequence.applied, true);
const doubleApply = nara.applyConsequence(cons1.id);
assert.equal(doubleApply.ok, false);
assert.equal(doubleApply.reason, 'already-applied');
console.log('  PASS');

console.log('\n17. addForeshadowing / resolveForeshadowing...');
const fs1 = nara.addForeshadowing({
  description: 'The merchant glances nervously at a locked door',
  plantedInSceneId: 'scene1', plantedAtTick: 5,
  importance: 0.8, tags: ['mystery', 'merchant']
});
assert.equal(fs1.resolved, false);
assert.equal(fs1.importance, 0.8);
const unresolved = nara.getUnresolvedForeshadowing(0.5);
assert.ok(unresolved.length >= 1);
assert.ok(unresolved.some(f => f.id === fs1.id));
const resolved1 = nara.resolveForeshadowing(fs1.id, 'scene-later', 'The door hides a treasure vault');
assert.equal(resolved1.ok, true);
assert.equal(resolved1.entry.resolved, true);
assert.equal(resolved1.entry.payoffSceneId, 'scene-later');
console.log('  PASS');

console.log('\n18. recordTone / getToneConsistency...');
nara.recordTone('scene1', 'neutral', 'market scene');
nara.recordTone('ch1', 'neutral', 'calm chapter');
nara.recordTone('scene2', 'neutral', 'more calm');
const consistency = nara.getToneConsistency();
assert.equal(consistency.consistent, true);
assert.equal(consistency.dominantTone, 'neutral');
console.log('  PASS');

console.log('\n19. getToneHistory...');
nara.recordTone('scene3', 'dark', 'sudden dark turn');
const history = nara.getToneHistory(5);
assert.ok(history.length >= 4);
assert.equal(history[history.length - 1].tone, 'dark');
console.log('  PASS');

console.log('\n20. Edge cases...');
assert.equal(nara.getScene('nonexistent'), null);
assert.equal(nara.getChapter('nonexistent'), null);
assert.equal(nara.getArc('nonexistent'), null);
assert.equal(nara.getArcProgress('nonexistent'), null);
assert.equal(nara.getNpcInitiative('unknown-npc').initiative, 0);
const badScene = nara.addSceneEntry('nonexistent', {});
assert.equal(badScene.ok, false);
assert.equal(badScene.reason, 'scene-not-found');
const badChoice = nara.resolveChoice('nonexistent', 'opt1');
assert.equal(badChoice.ok, false);
const badCons = nara.applyConsequence('nonexistent');
assert.equal(badCons.ok, false);
const badFs = nara.resolveForeshadowing('nonexistent');
assert.equal(badFs.ok, false);
console.log('  PASS');

console.log('\n✅ All RPG Narration System tests passed!');
console.log('\nCoverage:');
console.log('  RPG-05-01 (narrator vs dialogue styling): createNarrationEntry with narrator style');
console.log('  RPG-05-02 (character speaker attribution): attributeSpeaker with characterMap');
console.log('  RPG-05-03 (player agency hard lock): lockPlayerAgency, unlockPlayerAgency, assertPlayerAgency');
console.log('  RPG-05-04 (scene cards): createScene with location, characters, objectives');
console.log('  RPG-05-05 (chapter titles): createChapter with title, subtitle, order');
console.log('  RPG-05-06 (episode arcs): createArc with plannedChapters, themes; getArcProgress');
console.log('  RPG-05-07 (scene objectives): addSceneObjective, completeSceneObjective');
console.log('  RPG-05-08 (pacing controls): setScenePacing, getPacingRecommendation');
console.log('  RPG-05-09 (recap on return): generateRecap with scenes, chapters, arcs');
console.log('  RPG-05-10 (story choices optional): createChoice, resolveChoice with options');
console.log('  RPG-05-11 (dialogue variants): createDialogueVariant, selectDialogueVariant by tags');
console.log('  RPG-05-12 (NPC initiative): setNpcInitiative, getNpcInitiativeOrder, shouldNpcAct');
console.log('  RPG-05-13 (narrative consequences): createConsequence, applyConsequence');
console.log('  RPG-05-14 (foreshadowing tracker): addForeshadowing, resolveForeshadowing');
console.log('  RPG-05-15 (tone consistency): recordTone, getToneConsistency, getToneHistory');
