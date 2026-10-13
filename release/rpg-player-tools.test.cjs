'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const PlayerTools = require('./workspaces/rpg-player-tools.js');

const seed = {
  sessionId: 'playertools-test', worldId: 'valen-pt',
  timeline: { tick: 5 }, world: { locations: {} },
  characters: {}, quests: {}, canon: { entries: {} }
};

const state = State.createState(seed);
const pt = PlayerTools.createPlayerToolsManager(State);

console.log('Testing RPG Player Tools System...');

console.log('\n1. createSaveSlot...');
const slot1 = pt.createSaveSlot({
  id: 'save1', name: 'Before Dragon Fight',
  type: 'manual', sessionId: 'session1', worldId: 'valen',
  description: 'Saved before entering the dragon lair',
  playtimeMinutes: 120, stateSnapshot: { tick: 50, location: 'lair-entrance' }
});
assert.equal(slot1.name, 'Before Dragon Fight');
assert.equal(slot1.type, 'manual');
assert.equal(slot1.playtimeMinutes, 120);
console.log('  PASS');

console.log('\n2. listSaveSlots...');
const slots = pt.listSaveSlots({ type: 'manual' });
assert.equal(slots.length, 1);
assert.equal(slots[0].name, 'Before Dragon Fight');
console.log('  PASS');

console.log('\n3. updateSaveSlot...');
const updSlot = pt.updateSaveSlot('save1', { name: 'Dragon Fight - Updated', description: 'Updated save' });
assert.equal(updSlot.ok, true);
assert.equal(updSlot.slot.name, 'Dragon Fight - Updated');
console.log('  PASS');

console.log('\n4. createQuickSave + createCheckpoint...');
const quickSave = pt.createQuickSave({ sessionId: 'session1', worldId: 'valen', stateSnapshot: { tick: 55 } });
assert.equal(quickSave.type, 'quick');
const checkpoint = pt.createCheckpoint({ sessionId: 'session1', worldId: 'valen', stateSnapshot: { tick: 60 } });
assert.equal(checkpoint.type, 'checkpoint');
console.log('  PASS');

console.log('\n5. getLatestSave...');
const latest = pt.getLatestSave('session1', 'quick');
assert.ok(latest);
assert.equal(latest.type, 'quick');
console.log('  PASS');

console.log('\n6. searchStory...');
const storyEntries = [
  { id: 'e1', content: 'The hero enters the dark cave', speakerName: 'Narrator', timestamp: '2026-01-01' },
  { id: 'e2', content: 'I am not afraid!', speakerName: 'Aldric', timestamp: '2026-01-01' },
  { id: 'e3', content: 'The dragon awakens with a roar', speakerName: 'Narrator', timestamp: '2026-01-02' },
  { id: 'e4', content: 'Run! Save yourselves!', speakerName: 'Merchant', timestamp: '2026-01-02' }
];
const searchResult = pt.searchStory(storyEntries, 'dragon');
assert.equal(searchResult.results.length, 1);
assert.equal(searchResult.results[0].entryId, 'e3');
assert.ok(searchResult.results[0].context.includes('dragon'));
console.log('  PASS');

console.log('\n7. searchStory - speaker search...');
const speakerSearch = pt.searchStory(storyEntries, 'Aldric');
assert.equal(speakerSearch.results.length, 1);
assert.equal(speakerSearch.results[0].field, 'speaker');
console.log('  PASS');

console.log('\n8. createBookmark + getBookmarks...');
const bookmark1 = pt.createBookmark({
  id: 'bmk1', type: 'scene', title: 'Dragon Lair Entrance',
  description: 'The moment we entered the dragon lair',
  sessionId: 'session1', sceneId: 'scene-lair', tick: 50,
  tags: ['dragon', 'important'], color: 'red', pinned: true
});
assert.equal(bookmark1.type, 'scene');
assert.equal(bookmark1.pinned, true);
const bookmarks = pt.getBookmarks({ type: 'scene' });
assert.equal(bookmarks.length, 1);
const pinnedBookmarks = pt.getBookmarks({ pinned: true });
assert.equal(pinnedBookmarks.length, 1);
console.log('  PASS');

console.log('\n9. highlightQuote + getHighlights...');
const quote1 = pt.highlightQuote({
  quote: 'I am not afraid!', speakerName: 'Aldric',
  messageId: 'e2', sessionId: 'session1', sceneId: 'scene-lair',
  tags: ['courage']
});
assert.equal(quote1.type, 'quote');
assert.ok(quote1.tags.includes('quote'));
assert.ok(quote1.tags.includes('courage'));
const highlights = pt.getHighlights('session1');
assert.ok(highlights.length >= 1);
console.log('  PASS');

console.log('\n10. exportTranscript - text...');
const exportText = pt.exportTranscript({ entries: storyEntries, format: 'text' });
assert.equal(exportText.ok, true);
assert.equal(exportText.format, 'text');
assert.ok(exportText.content.includes('hero enters'));
assert.ok(exportText.entryCount, 4);
console.log('  PASS');

console.log('\n11. exportTranscript - json...');
const exportJson = pt.exportTranscript({ entries: storyEntries, format: 'json' });
assert.equal(exportJson.format, 'json');
const parsed = JSON.parse(exportJson.content);
assert.equal(parsed.length, 4);
assert.equal(parsed[0].speaker, 'Narrator');
console.log('  PASS');

console.log('\n12. exportTranscript - markdown...');
const exportMd = pt.exportTranscript({ entries: storyEntries, format: 'markdown' });
assert.equal(exportMd.format, 'markdown');
assert.ok(exportMd.content.includes('**Narrator:**'));
console.log('  PASS');

console.log('\n13. generateSpoilerFreeRecap...');
const recapEntries = [
  { id: 'r1', content: 'The hero enters the cave', tick: 10 },
  { id: 'r2', content: 'They find a treasure chest', tick: 20 },
  { id: 'r3', content: 'The merchant dies in the explosion', tick: 30 },
  { id: 'r4', content: 'The hero discovers a secret passage', tick: 40 }
];
const recap = pt.generateSpoilerFreeRecap({ entries: recapEntries, uptoTick: 100 });
assert.equal(recap.ok, true);
assert.equal(recap.entryCount, 2); // r3 "dies" and r4 "secret" are both filtered
assert.equal(recap.redactedCount, 2);
assert.ok(!recap.recap.includes('dies'));
assert.ok(!recap.recap.includes('secret'));
console.log('  PASS');

console.log('\n14. createNote + getNotes...');
const note1 = pt.createNote({
  id: 'note1', title: 'Dragon Weakness',
  content: 'Dragons are weak to ice magic',
  category: 'strategy', tags: ['dragon', 'combat'],
  sessionId: 'session1', pinned: true
});
assert.equal(note1.category, 'strategy');
assert.equal(note1.pinned, true);
const notes = pt.getNotes({ category: 'strategy' });
assert.equal(notes.length, 1);
const pinnedNotes = pt.getNotes({ pinned: true });
assert.equal(pinnedNotes.length, 1);
console.log('  PASS');

console.log('\n15. updateNote...');
const updNote = pt.updateNote('note1', { content: 'Dragons are weak to ice and piercing', tags: ['dragon', 'combat', 'weakness'] });
assert.equal(updNote.ok, true);
assert.ok(updNote.note.content.includes('piercing'));
console.log('  PASS');

console.log('\n16. createCanonRequest + respondToCanonRequest...');
const canonReq1 = pt.createCanonRequest({
  id: 'creq1', title: 'Add Ice Cavern',
  description: 'I want an ice cavern in the northern mountains',
  proposedCanon: 'The Northern Mountains contain the Frozen Cavern, home to ancient ice crystals.',
  category: 'location', sessionId: 'session1',
  justification: 'Would add variety to the northern region',
  priority: 7
});
assert.equal(canonReq1.status, 'pending');
assert.equal(canonReq1.priority, 7);
const respond = pt.respondToCanonRequest('creq1', 'approved', 'Great idea! The Frozen Cavern is now canon.');
assert.equal(respond.ok, true);
assert.equal(respond.request.status, 'approved');
assert.ok(respond.request.gmResponse.includes('Frozen Cavern'));
console.log('  PASS');

console.log('\n17. getCanonRequests...');
const pendingReqs = pt.getCanonRequests({ status: 'pending' });
assert.equal(pendingReqs.length, 0);
const approvedReqs = pt.getCanonRequests({ status: 'approved' });
assert.equal(approvedReqs.length, 1);
console.log('  PASS');

console.log('\n18. addGlossaryEntry + searchGlossary...');
const gloss1 = pt.addGlossaryEntry({
  id: 'gloss1', term: 'Valenport', definition: 'The capital city of the Kingdom of Valen',
  category: 'location', aliases: ['Port Valen', 'The Capital'],
  spoilerLevel: 0, verified: true
});
assert.equal(gloss1.term, 'Valenport');
assert.equal(gloss1.category, 'location');
const search1 = pt.searchGlossary('valenport');
assert.equal(search1.length, 1);
assert.equal(search1[0].term, 'Valenport');
const aliasSearch = pt.searchGlossary('port valen');
assert.equal(aliasSearch.length, 1);
console.log('  PASS');

console.log('\n19. searchGlossary - spoiler filter...');
const secretEntry = pt.addGlossaryEntry({
  id: 'gloss2', term: 'Dragon King', definition: 'The final boss of the campaign',
  category: 'character', spoilerLevel: 3
});
const spoilerFiltered = pt.searchGlossary('dragon', { maxSpoilerLevel: 0 });
assert.equal(spoilerFiltered.length, 0); // spoilerLevel 3 filtered out
const spoilerAll = pt.searchGlossary('dragon', { maxSpoilerLevel: 3 });
assert.equal(spoilerAll.length, 1);
console.log('  PASS');

console.log('\n20. getNpcDirectory...');
const npcEntry = pt.addGlossaryEntry({
  id: 'gloss3', term: 'Aldric', definition: 'A brave knight and the player character',
  category: 'character', aliases: ['Sir Aldric', 'The Knight'], spoilerLevel: 0
});
const npcDir = pt.getNpcDirectory({ maxSpoilerLevel: 0 });
assert.ok(npcDir.length >= 1);
assert.ok(npcDir.some(n => n.name === 'Aldric'));
console.log('  PASS');

console.log('\n21. getRelationshipOverview...');
const rels = {
  'npc-merchant': { trust: 0.7, affection: 0.3, respect: 0.5, fear: 0.1, loyalty: 0.6 },
  'npc-guard': { trust: -0.2, affection: 0.0, respect: 0.3, fear: 0.8, loyalty: -0.1 }
};
const overview = pt.getRelationshipOverview(rels);
assert.ok(overview['npc-merchant']);
assert.equal(overview['npc-merchant'].trust.label, 'very-high');
assert.equal(overview['npc-guard'].fear.label, 'very-high');
console.log('  PASS');

console.log('\n22. getStrongestRelationships...');
const strongest = pt.getStrongestRelationships(rels, 'trust', 2);
assert.equal(strongest.length, 2);
assert.equal(strongest[0].characterId, 'npc-merchant');
assert.equal(strongest[0].value, 0.7);
console.log('  PASS');

console.log('\n23. getTimeline + getTimelineSummary...');
const timelineEvents = [
  { id: 'ev1', tick: 10, type: 'exploration', tags: ['cave'], locationId: 'cave' },
  { id: 'ev2', tick: 20, type: 'combat', tags: ['dragon'], locationId: 'lair' },
  { id: 'ev3', tick: 30, type: 'dialogue', tags: ['merchant'], locationId: 'town' },
  { id: 'ev4', tick: 40, type: 'combat', tags: ['goblin'], locationId: 'forest' }
];
const timeline = pt.getTimeline(timelineEvents, { fromTick: 15, toTick: 35 });
assert.equal(timeline.events.length, 2);
assert.equal(timeline.totalCount, 2);
const combatTimeline = pt.getTimeline(timelineEvents, { type: 'combat' });
assert.equal(combatTimeline.events.length, 2);
const summary = pt.getTimelineSummary(timelineEvents);
assert.equal(summary.totalEvents, 4);
assert.equal(summary.typeDistribution.combat, 2);
assert.equal(summary.minTick, 10);
assert.equal(summary.maxTick, 40);
console.log('  PASS');

console.log('\n24. compareSessions...');
const sessionA = { id: 's1', name: 'Session 1', events: timelineEvents.slice(0, 2).map(e => ({ ...e, characterId: 'hero' })) };
const sessionB = { id: 's2', name: 'Session 2', events: timelineEvents.slice(2, 4).map(e => ({ ...e, characterId: 'hero' })) };
const comparison = pt.compareSessions(sessionA, sessionB);
assert.equal(comparison.sessionA.eventCount, 2);
assert.equal(comparison.sessionB.eventCount, 2);
assert.ok(comparison.comparison.sharedCharacters.includes('hero'));
assert.equal(comparison.comparison.characterOverlap, 100);
console.log('  PASS');

console.log('\n25. recordUndoableAction + undoAction...');
const action1 = pt.recordUndoableAction({
  id: 'undo1', type: 'trade', description: 'Bought iron sword for 50 gold',
  sessionId: 'session1', preState: { gold: 100, inventory: [] },
  postState: { gold: 50, inventory: ['iron-sword'] }
});
assert.equal(action1.committed, false);
assert.equal(action1.undone, false);
const undo1 = pt.undoAction('undo1');
assert.equal(undo1.ok, true);
assert.equal(undo1.restoredState.gold, 100);
assert.equal(undo1.action.undone, true);
// Try to undo again
const undoAgain = pt.undoAction('undo1');
assert.equal(undoAgain.ok, false);
assert.equal(undoAgain.reason, 'already-undone');
console.log('  PASS');

console.log('\n26. commitAction...');
const action2 = pt.recordUndoableAction({
  id: 'undo2', type: 'action', description: 'Moved to forest',
  sessionId: 'session1', preState: { location: 'town' }, postState: { location: 'forest' }
});
const commit = pt.commitAction('undo2');
assert.equal(commit.ok, true);
assert.equal(commit.action.committed, true);
// Try to undo committed action
const undoCommitted = pt.undoAction('undo2');
assert.equal(undoCommitted.ok, false);
assert.equal(undoCommitted.reason, 'action-already-committed');
console.log('  PASS');

console.log('\n27. getUndoableActions...');
const undoable = pt.getUndoableActions('session1');
assert.equal(undoable.length, 0); // undo1 was undone, undo2 was committed
console.log('  PASS');

console.log('\n28. deleteSaveSlot / deleteBookmark / deleteNote...');
pt.deleteSaveSlot('save1');
assert.equal(pt.getSaveSlot('save1'), null);
pt.deleteBookmark('bmk1');
assert.equal(pt.getBookmarks({ type: 'scene' }).length, 0);
pt.deleteNote('note1');
assert.equal(pt.getNote('note1'), null);
console.log('  PASS');

console.log('\n29. Edge cases...');
assert.equal(pt.getSaveSlot('nonexistent'), null);
assert.equal(pt.getNote('nonexistent'), null);
assert.equal(pt.getGlossaryEntry('nonexistent'), null);
assert.equal(pt.getCanonRequest('nonexistent'), null);
assert.equal(pt.searchStory([], 'anything').results.length, 0);
assert.equal(pt.searchGlossary('nonexistent-term').length, 0);
const badUndo = pt.undoAction('nonexistent');
assert.equal(badUndo.ok, false);
const badCommit = pt.commitAction('nonexistent');
assert.equal(badCommit.ok, false);
const badRespond = pt.respondToCanonRequest('nonexistent', 'approved', 'test');
assert.equal(badRespond.ok, false);
const badStatus = pt.respondToCanonRequest('creq1', 'invalid-status', 'test');
assert.equal(badStatus.ok, false);
console.log('  PASS');

console.log('\n✅ All RPG Player Tools System tests passed!');
console.log('\nCoverage:');
console.log('  RPG-13-01 (save slots): createSaveSlot, listSaveSlots, updateSaveSlot, deleteSaveSlot');
console.log('  RPG-13-02 (quick save checkpoint): createQuickSave, createCheckpoint, getLatestSave');
console.log('  RPG-13-03 (story search): searchStory with content/speaker search and context');
console.log('  RPG-13-04 (bookmark scenes): createBookmark with types, tags, pinning');
console.log('  RPG-13-05 (highlight quotes): highlightQuote, getHighlights');
console.log('  RPG-13-06 (export transcript): exportTranscript in text/json/markdown');
console.log('  RPG-13-07 (share spoiler free recap): generateSpoilerFreeRecap with keyword filtering');
console.log('  RPG-13-08 (notes journal): createNote, updateNote, getNotes with filters');
console.log('  RPG-13-09 (player authored canon requests): createCanonRequest, respondToCanonRequest');
console.log('  RPG-13-10 (world glossary): addGlossaryEntry, searchGlossary with spoiler levels');
console.log('  RPG-13-11 (NPC directory): getNpcDirectory from character glossary entries');
console.log('  RPG-13-12 (relationship viewer): getRelationshipOverview, getStrongestRelationships');
console.log('  RPG-13-13 (timeline explorer): getTimeline with filters, getTimelineSummary');
console.log('  RPG-13-14 (session comparison): compareSessions with overlap calculation');
console.log('  RPG-13-15 (undo uncommitted action): recordUndoableAction, undoAction, commitAction');
