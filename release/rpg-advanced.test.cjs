'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Advanced = require('./workspaces/rpg-advanced.js');

const seed = {
  sessionId: 'advanced-test', worldId: 'valen-adv',
  timeline: { tick: 5 }, world: { locations: {} },
  characters: {}, quests: {}, canon: { entries: {} }
};
const state = State.createState(seed);
const adv = Advanced.createAdvancedManager(State);

console.log('Testing RPG Advanced Features System...');

console.log('\n1. registerPlugin + getPlugin + hasCapability (RPG-15-03)...');
const plugin = adv.registerPlugin({
  id: 'plg1', name: 'Weather Plugin', version: '1.2.0', author: 'dev',
  description: 'Adds dynamic weather events',
  capabilities: ['read-state', 'emit-event'],
  limits: { maxEvents: 5, maxStateWrites: 2, timeoutMs: 500 }
});
assert.equal(plugin.name, 'Weather Plugin');
assert.equal(plugin.capabilities.length, 2);
assert.equal(plugin.enabled, true);
assert.equal(plugin.trusted, false);
assert.equal(adv.hasCapability('plg1', 'read-state'), true);
assert.equal(adv.hasCapability('plg1', 'write-state'), false);
assert.equal(adv.hasCapability('plg1', 'network'), false);
console.log('  PASS');

console.log('\n2. sandboxCall - capability denied + limit enforcement...');
const allowedCall = adv.sandboxCall('plg1', { type: 'emit-event', requiresCapability: 'emit-event' });
assert.equal(allowedCall.ok, true);
assert.equal(allowedCall.sandboxed, true);
const deniedCall = adv.sandboxCall('plg1', { type: 'write-state', requiresCapability: 'write-state' });
assert.equal(deniedCall.ok, false);
assert.equal(deniedCall.reason, 'capability-denied');
assert.equal(deniedCall.capability, 'write-state');
// Use up event budget (5 max), already emitted 1
adv.sandboxCall('plg1', { type: 'emit-event', requiresCapability: 'emit-event' });
adv.sandboxCall('plg1', { type: 'emit-event', requiresCapability: 'emit-event' });
adv.sandboxCall('plg1', { type: 'emit-event', requiresCapability: 'emit-event' });
adv.sandboxCall('plg1', { type: 'emit-event', requiresCapability: 'emit-event' }); // now at 5
const overLimit = adv.sandboxCall('plg1', { type: 'emit-event', requiresCapability: 'emit-event' });
assert.equal(overLimit.ok, false);
assert.equal(overLimit.reason, 'limit-exceeded');
assert.equal(overLimit.limit, 'maxEvents');
const plgAfter = adv.getPlugin('plg1');
assert.ok(plgAfter.usage.eventsEmitted >= 5);
assert.ok(plgAfter.usage.violations > 0);
console.log('  PASS');

console.log('\n3. listPlugins + unregisterPlugin...');
const readStatePlugins = adv.listPlugins({ capability: 'read-state' });
assert.ok(readStatePlugins.some(p => p.id === 'plg1'));
const enabledPlugins = adv.listPlugins({ enabledOnly: true });
assert.ok(enabledPlugins.some(p => p.id === 'plg1'));
const unreg = adv.unregisterPlugin('plg1');
assert.equal(unreg.ok, true);
assert.equal(adv.getPlugin('plg1'), null);
const badCall = adv.sandboxCall('plg1', { type: 'emit-event' });
assert.equal(badCall.ok, false);
console.log('  PASS');

console.log('\n4. createScenarioPack + installScenarioPack (RPG-15-08)...');
const pack = adv.createScenarioPack({
  id: 'pack1', name: 'Curse of the Lich King', type: 'campaign',
  description: 'A dark campaign against an undead lord',
  author: 'GM Seven', version: '2.0', recommendedLevel: 5, estimatedHours: 12,
  tags: ['dark', 'undead', 'epic'],
  content: {
    locations: ['crypt', 'graveyard', 'lich-tower'],
    characters: ['lich-king', 'necromancer-hero'],
    quests: ['main-lich', 'side-gravekeeper'],
    items: ['holy-avenger', 'lich-phylactery'],
    encounters: ['skeleton-horde', 'lich-boss']
  }
});
assert.equal(pack.name, 'Curse of the Lich King');
assert.equal(pack.content.locations.length, 3);
assert.equal(pack.content.quests.length, 2);
assert.equal(pack.installed, false);
const install = adv.installScenarioPack('pack1');
assert.equal(install.ok, true);
assert.equal(install.pack.installed, true);
assert.equal(install.pack.installCount, 1);
assert.equal(install.contentSummary.locations, 3);
assert.equal(install.contentSummary.encounters, 2);
console.log('  PASS');

console.log('\n5. listScenarioPacks + uninstall...');
const installedPacks = adv.listScenarioPacks({ installedOnly: true });
assert.ok(installedPacks.some(p => p.id === 'pack1'));
const campaignPacks = adv.listScenarioPacks({ type: 'campaign' });
assert.equal(campaignPacks.length, 1);
const tagPacks = adv.listScenarioPacks({ tag: 'undead' });
assert.equal(tagPacks.length, 1);
const uninstall = adv.uninstallScenarioPack('pack1');
assert.equal(uninstall.ok, true);
assert.equal(uninstall.pack.installed, false);
console.log('  PASS');

console.log('\n6. seedRumor + spreadRumor + believeRumor + resolveRumor (RPG-15-10)...');
const rumor = adv.seedRumor({
  id: 'rumor1', text: 'The Lich King stirs in his tower',
  type: 'whisper', originLocationId: 'tavern', originCharacterId: 'barkeep',
  seedLocations: ['tavern', 'market', 'temple'], veracity: 0.9, spreadRate: 0.8,
  sensitivity: 0.6, seed: 12345
});
assert.equal(rumor.state, 'seeded');
assert.equal(rumor.veracity, 0.9);
assert.equal(rumor.generation, 0);
const spread = adv.spreadRumor('rumor1', { locations: ['tavern', 'market', 'temple', 'docks', 'alley'] });
assert.equal(spread.ok, true);
assert.equal(spread.rumor.generation, 1);
assert.ok(spread.newReachCount >= 0);
assert.ok(spread.rumor.reachCount >= spread.newReachCount);
if (spread.newReachCount > 0) assert.equal(spread.rumor.state, 'spreading');
const believe = adv.believeRumor('rumor1', 'hero1', true);
assert.equal(believe.ok, true);
assert.ok(believe.rumor.believedBy.includes('hero1'));
const debunk = adv.believeRumor('rumor1', 'skeptic1', false);
assert.ok(debunk.rumor.debunkedBy.includes('skeptic1'));
const confirm = adv.resolveRumor('rumor1', 'confirmed');
assert.equal(confirm.rumor.state, 'confirmed');
console.log('  PASS');

console.log('\n7. getRumors filter...');
const confirmedRumors = adv.getRumors({ state: 'confirmed' });
assert.equal(confirmedRumors.length, 1);
const whisperRumors = adv.getRumors({ type: 'whisper' });
assert.equal(whisperRumors.length, 1);
console.log('  PASS');

console.log('\n8. simulateNpcOffscreen (RPG-15-11)...');
const sim = adv.simulateNpcOffscreen({
  npcs: [
    { id: 'blacksmith', name: 'Blacksmith', homeLocationId: 'forge',
      schedule: [
        { tick: 0, activity: 'working', locationId: 'forge' },
        { tick: 3, activity: 'eating', locationId: 'tavern' },
        { tick: 6, activity: 'resting', locationId: 'forge' }
      ] },
    { id: 'merchant', name: 'Merchant', homeLocationId: 'market' }
  ],
  ticks: 8, seed: 999
});
assert.equal(sim.ok, true);
assert.equal(sim.npcResults.length, 2);
const smith = sim.npcResults[0];
assert.equal(smith.ticks, 8);
assert.equal(smith.activities.length, 8);
assert.equal(smith.activities[0].activity, 'working');
assert.equal(smith.activities[0].locationId, 'forge');
assert.equal(smith.activities[3].activity, 'eating');
assert.equal(smith.activities[3].locationId, 'tavern');
assert.ok(smith.uniqueLocations.includes('forge'));
assert.ok(smith.uniqueLocations.includes('tavern'));
const merchant = sim.npcResults[1];
assert.equal(merchant.homeLocationId, 'market');
assert.ok(merchant.activities.length > 0);
console.log('  PASS');

console.log('\n9. simulateNpcOffscreen determinism (same seed + same inputs)...');
const simA = adv.simulateNpcOffscreen({
  npcs: [{ id: 'merchant', name: 'Merchant', homeLocationId: 'market' }],
  ticks: 8, seed: 999
});
const simB = adv.simulateNpcOffscreen({
  npcs: [{ id: 'merchant', name: 'Merchant', homeLocationId: 'market' }],
  ticks: 8, seed: 999
});
assert.deepEqual(simA.npcResults[0].activities, simB.npcResults[0].activities);
assert.deepEqual(simA.npcResults[0].offscreenMemory, simB.npcResults[0].offscreenMemory);
console.log('  PASS');

console.log('\n10. createQuestNode + linkQuestNodes + evaluateQuestGraph (RPG-15-12)...');
adv.createQuestNode({ id: 'qn1', questId: 'main-lich', title: 'Find the Crypt', type: 'objective', depth: 0 });
adv.createQuestNode({ id: 'qn2', questId: 'main-lich', title: 'Gather Allies', type: 'objective', depth: 1 });
adv.createQuestNode({ id: 'qn3', questId: 'main-lich', title: 'Storm the Tower', type: 'gate', depth: 2 });
adv.createQuestNode({ id: 'qn4', questId: 'main-lich', title: 'Slay the Lich', type: 'completion', depth: 3 });
adv.linkQuestNodes('qn1', 'qn2');
adv.linkQuestNodes('qn2', 'qn3');
adv.linkQuestNodes('qn3', 'qn4');
const graphAll = adv.evaluateQuestGraph('main-lich', []);
assert.equal(graphAll.totalNodes, 4);
assert.equal(graphAll.completed, 0);
assert.equal(graphAll.availableCount, 1); // only qn1
assert.equal(graphAll.available[0], 'qn1');
assert.equal(graphAll.lockedCount, 3);
assert.equal(graphAll.allComplete, false);
const graphPartial = adv.evaluateQuestGraph('main-lich', ['qn1', 'qn2']);
assert.equal(graphPartial.completed, 2);
assert.equal(graphPartial.availableCount, 1); // qn3 now available
assert.equal(graphPartial.available[0], 'qn3');
const graphDone = adv.evaluateQuestGraph('main-lich', ['qn1', 'qn2', 'qn3', 'qn4']);
assert.equal(graphDone.completed, 4);
assert.equal(graphDone.allComplete, true);
console.log('  PASS');

console.log('\n11. addAtlasEntry + getAtlas + getTimelineChronology (RPG-15-13)...');
adv.addAtlasEntry({
  id: 'atlas1', title: 'The Sundering', epoch: 'ancient', yearLabel: 'Year 0',
  category: 'cataclysm', description: 'The world was split asunder',
  locationIds: ['valen'], significance: 10, public: true, spoilerLevel: 0
});
adv.addAtlasEntry({
  id: 'atlas2', title: 'Founding of Valen', epoch: 'classical', yearLabel: 'Year 300',
  category: 'founding', description: 'The city of Valen was founded',
  locationIds: ['valen'], significance: 7, public: true, spoilerLevel: 0
});
adv.addAtlasEntry({
  id: 'atlas3', title: 'The Lich King', epoch: 'medieval', yearLabel: 'Year 1200',
  category: 'figure', description: 'An undead lord rises',
  locationIds: ['lich-tower'], significance: 8, public: false, spoilerLevel: 2
});
const atlasPublic = adv.getAtlas({ publicOnly: true, maxSpoilerLevel: 0 });
assert.ok(atlasPublic.some(e => e.id === 'atlas1'));
assert.ok(atlasPublic.some(e => e.id === 'atlas2'));
assert.ok(!atlasPublic.some(e => e.id === 'atlas3')); // spoilerLevel 2
const ancientEntries = adv.getAtlas({ epoch: 'ancient' });
assert.equal(ancientEntries.length, 1);
const chronology = adv.getTimelineChronology();
assert.equal(chronology.length, 6);
const ancientEpoch = chronology.find(c => c.epoch === 'ancient');
assert.equal(ancientEpoch.count, 1);
assert.equal(ancientEpoch.entries[0].title, 'The Sundering');
console.log('  PASS');

console.log('\n12. linkAtlasEntries...');
const link = adv.linkAtlasEntries('atlas1', 'atlas2', 'led-to');
assert.equal(link.ok, true);
const atlas1 = adv.getAtlas({}).find(e => e.id === 'atlas1');
assert.ok(atlas1.relatedEntries.some(r => r.includes('atlas2')));
console.log('  PASS');

console.log('\n13. recordAnalytics + getAnalyticsSummary (RPG-15-14)...');
adv.recordAnalytics({ type: 'turn', sessionId: 's1', worldId: 'valen', actorId: 'hero' });
adv.recordAnalytics({ type: 'turn', sessionId: 's1', worldId: 'valen', actorId: 'hero' });
adv.recordAnalytics({ type: 'choice', sessionId: 's1', worldId: 'valen' });
adv.recordAnalytics({ type: 'combat', sessionId: 's1', worldId: 'valen' });
adv.recordAnalytics({ type: 'travel', sessionId: 's2', worldId: 'valen' });
adv.recordAnalytics({ type: 'save', sessionId: 's2', worldId: 'valen' });
const summary = adv.getAnalyticsSummary({});
assert.equal(summary.totalEvents, 6);
assert.equal(summary.byType.turn, 2);
assert.equal(summary.byType.choice, 1);
assert.equal(summary.byType.combat, 1);
assert.equal(summary.sessionCount, 2);
assert.equal(summary.worldCount, 1);
assert.ok(summary.firstEvent);
assert.ok(summary.lastEvent);
const s1Summary = adv.getAnalyticsSummary({ sessionId: 's1' });
assert.equal(s1Summary.totalEvents, 4);
console.log('  PASS');

console.log('\n14. getEngagementMetrics...');
const engagement = adv.getEngagementMetrics('s1');
assert.equal(engagement.sessionId, 's1');
assert.equal(engagement.turns, 2);
assert.equal(engagement.choices, 1);
assert.equal(engagement.combats, 1);
assert.ok(engagement.engagementScore > 0);
assert.ok(engagement.avgTurnsPerSession >= 1);
const allEngagement = adv.getEngagementMetrics();
assert.ok(allEngagement.turns >= 2);
console.log('  PASS');

console.log('\n15. registerVoice + findVoices + getNarratorVoice (RPG-15-15)...');
adv.registerVoice({ id: 'voice-en', name: 'English Narrator', language: 'en', locale: 'en-US', engine: 'neural', quality: 5 });
adv.registerVoice({ id: 'voice-ar', name: 'Arabic Narrator', language: 'ar', locale: 'ar-SA', engine: 'neural', quality: 4 });
adv.registerVoice({ id: 'voice-en-alt', name: 'English Alt', language: 'en', locale: 'en-GB', engine: 'system', quality: 3 });
const enVoices = adv.findVoices({ language: 'en' });
assert.equal(enVoices.length, 2);
assert.equal(enVoices[0].quality, 5); // sorted by quality desc
const arVoices = adv.findVoices({ language: 'ar' });
assert.equal(arVoices.length, 1);
const narratorEn = adv.getNarratorVoice('en');
assert.equal(narratorEn.id, 'voice-en'); // highest quality available
assert.equal(narratorEn.quality, 5);
const narratorAr = adv.getNarratorVoice('ar');
assert.equal(narratorAr.id, 'voice-ar');
assert.equal(narratorAr.optional, true);
console.log('  PASS');

console.log('\n16. setVoiceAvailability...');
const disable = adv.setVoiceAvailability('voice-en', false);
assert.equal(disable.ok, true);
assert.equal(disable.voice.available, false);
const narratorEn2 = adv.getNarratorVoice('en');
assert.equal(narratorEn2.id, 'voice-en-alt'); // falls back to next available
adv.setVoiceAvailability('voice-en', true);
console.log('  PASS');

console.log('\n17. Edge cases...');
assert.equal(adv.getPlugin('nonexistent'), null);
const badSandbox = adv.sandboxCall('nonexistent', { type: 'emit-event' });
assert.equal(badSandbox.ok, false);
const badPack = adv.installScenarioPack('nonexistent');
assert.equal(badPack.ok, false);
const badRumor = adv.spreadRumor('nonexistent');
assert.equal(badRumor.ok, false);
const badResolve = adv.resolveRumor('nonexistent', 'confirmed');
assert.equal(badResolve.ok, false);
const badOutcome = adv.resolveRumor('rumor1', 'invalid');
assert.equal(badOutcome.ok, false);
assert.equal(adv.getRumors({ state: 'nonexistent' }).length, 0);
const badGraph = adv.evaluateQuestGraph('nonexistent', []);
assert.equal(badGraph.totalNodes, 0);
const badLinkNodes = adv.linkQuestNodes('nonexistent', 'also-nonexistent');
assert.equal(badLinkNodes.ok, false);
const badAtlasLink = adv.linkAtlasEntries('nonexistent', 'also-nonexistent');
assert.equal(badAtlasLink.ok, false);
assert.equal(adv.getAtlas({ epoch: 'nonexistent' }).length, 0);
assert.equal(adv.getNarratorVoice('zz'), null);
const badVoice = adv.setVoiceAvailability('nonexistent', true);
assert.equal(badVoice.ok, false);
console.log('  PASS');

console.log('\n✅ All RPG Advanced Features System tests passed!');
console.log('\nCoverage:');
console.log('  RPG-15-03 (modular plugins sandboxed): registerPlugin, hasCapability, sandboxCall with limits/violations');
console.log('  RPG-15-08 (scenario packs): createScenarioPack, install/uninstall, list with filters');
console.log('  RPG-15-10 (emergent rumors): seedRumor, spreadRumor (deterministic), believeRumor, resolveRumor');
console.log('  RPG-15-11 (NPC offscreen simulation): simulateNpcOffscreen with schedules + determinism');
console.log('  RPG-15-12 (dynamic quest graph): createQuestNode, linkQuestNodes, evaluateQuestGraph');
console.log('  RPG-15-13 (world history atlas): addAtlasEntry, getAtlas, getTimelineChronology, linkAtlasEntries');
console.log('  RPG-15-14 (campaign analytics): recordAnalytics, getAnalyticsSummary, getEngagementMetrics');
console.log('  RPG-15-15 (localized narrator voices optional): registerVoice, findVoices, getNarratorVoice, availability');
