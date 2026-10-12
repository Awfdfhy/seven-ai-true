'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Campaign = require('./workspaces/rpg-campaign.js');

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function text(v) { return typeof v === 'string' ? v.trim() : ''; }

const seed = {
  sessionId: 'campaign-test', worldId: 'valen-campaign',
  timeline: { tick: 5, dateLabel: 'Spring Festival' },
  world: { locations: { capital: { name: 'Capital' } } },
  characters: {
    hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' } },
    companion: { control: 'ai', locationId: 'capital', identity: { name: 'Companion' } }
  },
  quests: { main: { title: 'Save the Kingdom', status: 'active' } },
  canon: { entries: {} }
};

const state = State.createState(seed);
const mgr = Campaign.createCampaignManager(State);

console.log('Testing RPG Campaign/Session Manager...');

console.log('\n1. createCampaign...');
const c1 = mgr.createCampaign({ name: 'Valen Chronicles', worldId: 'valen', description: 'Epic adventure in Valen' });
assert.equal(c1.name, 'Valen Chronicles');
assert.equal(c1.worldId, 'valen');
assert.equal(c1.status, 'planning');
assert.ok(c1.id.startsWith('campaign-'));
assert.ok(c1.settings.autoSave !== false);
console.log('  PASS');

console.log('\n2. createCampaign with settings...');
const c2 = mgr.createCampaign({
  name: 'Dark Campaign',
  worldId: 'dark-realm',
  difficulty: 'hard',
  tone: 'grim',
  settings: { deathPenalty: 'permadeath', maxPartySize: 4, autoSaveInterval: 60000 }
});
assert.equal(c2.difficulty, 'hard');
assert.equal(c2.tone, 'grim');
assert.equal(c2.settings.deathPenalty, 'permadeath');
assert.equal(c2.settings.maxPartySize, 4);
assert.equal(c2.settings.autoSaveInterval, 60000);
console.log('  PASS');

console.log('\n3. getCampaign...');
const got = mgr.getCampaign(c1.id);
assert.equal(got.id, c1.id);
assert.equal(got.name, 'Valen Chronicles');
console.log('  PASS');

console.log('\n4. getAllCampaigns filter...');
mgr.createCampaign({ name: 'Campaign 2', worldId: 'world-2', status: 'active' });
mgr.createCampaign({ name: 'Campaign 3', worldId: 'valen', status: 'completed' });
const active = mgr.getAllCampaigns({ status: 'active' });
assert.ok(active.every(c => c.status === 'active'));
const valenCampaigns = mgr.getAllCampaigns({ worldId: 'valen' });
assert.ok(valenCampaigns.every(c => c.worldId === 'valen'));
const search = mgr.getAllCampaigns({ search: 'chronicles' });
assert.ok(search.some(c => c.name.includes('Chronicles')));
console.log('  PASS');

console.log('\n5. updateCampaign...');
const updated = mgr.updateCampaign(c1.id, { status: 'active', description: 'Updated description' });
assert.equal(updated.ok, true);
assert.equal(updated.campaign.status, 'active');
assert.equal(updated.campaign.description, 'Updated description');
assert.equal(updated.campaign.version, 2);
console.log('  PASS');

console.log('\n6. deleteCampaign...');
const cDel = mgr.createCampaign({ name: 'To Delete', worldId: 'test' });
const del = mgr.deleteCampaign(cDel.id);
assert.equal(del.ok, true);
assert.equal(mgr.getCampaign(cDel.id), undefined);
console.log('  PASS');

console.log('\n7. createSession...');
const sessionState = State.createState(seed);
const s1 = mgr.createSession({ campaignId: c1.id, name: 'Session 1: The Beginning' });
assert.equal(s1.ok, true);
assert.equal(s1.session.campaignId, c1.id);
assert.equal(s1.session.name, 'Session 1: The Beginning');
assert.equal(s1.session.status, 'planned');
console.log('  PASS');

console.log('\n7b. createSession - multiple sessions...');
const s2 = mgr.createSession({ campaignId: c1.id, name: 'Session 2: The Journey', allowMultiple: true });
assert.equal(s2.ok, true);
const s3 = mgr.createSession({ campaignId: c1.id, name: 'Session 3: The Climax', allowMultiple: true });
assert.equal(s3.ok, true);
console.log('  PASS');

console.log('\n8. getSession...');
const gotSession = mgr.getSession(s1.session.id);
assert.equal(gotSession.id, s1.session.id);
assert.equal(gotSession.name, 'Session 1: The Beginning');
console.log('  PASS');

console.log('\n8b. getSessionByCampaign...');
const campaignSessions = mgr.getSessionByCampaign(c1.id);
assert.ok(campaignSessions.length >= 3);
assert.ok(campaignSessions.every(s => s.campaignId === c1.id));
console.log('  PASS');

console.log('\n9. updateSession...');
const upd = mgr.updateSession(s1.session.id, { description: 'Updated description', status: 'in_progress' });
assert.equal(upd.ok, true);
assert.equal(upd.session.description, 'Updated description');
assert.equal(upd.session.status, 'in_progress');
assert.ok(upd.session.startedAt);
assert.equal(upd.session.version, 2);
console.log('  PASS');

console.log('\n10. startSession...');
const start = mgr.startSession(s2.session.id);
assert.equal(start.ok, true);
assert.equal(start.session.status, 'in_progress');
assert.ok(start.session.startedAt);
console.log('  PASS');

console.log('\n11. endSession...');
const end = mgr.endSession(s3.session.id);
assert.equal(end.ok, true);
assert.equal(end.session.status, 'completed');
assert.ok(end.session.endedAt);
const c1After = mgr.getCampaign(c1.id);
assert.equal(c1After.statistics.totalSessions, 1);
console.log('  PASS');

console.log('\n12. createCheckpoint...');
const cp1 = mgr.createCheckpoint({ sessionId: s1.session.id, type: 'manual', label: 'Before the boss', description: 'Saved before fighting the dragon' });
assert.equal(cp1.ok, true);
assert.equal(cp1.checkpoint.type, 'manual');
assert.equal(cp1.checkpoint.label, 'Before the boss');
assert.ok(cp1.checkpoint.isCurrent);
console.log('  PASS');

console.log('\n12b. createCheckpoint - auto...');
const cp2 = mgr.createCheckpoint({ sessionId: s1.session.id, type: 'auto', label: 'Auto-save' });
assert.equal(cp2.ok, true);
assert.equal(cp2.checkpoint.type, 'auto');
assert.equal(cp2.checkpoint.isCurrent, true);
const oldCp = mgr.getCheckpoint(cp1.checkpoint.id);
assert.equal(oldCp.isCurrent, false);
console.log('  PASS');

console.log('\n13. getCheckpoint...');
const gotCp = mgr.getCheckpoint(cp1.checkpoint.id);
assert.equal(gotCp.id, cp1.checkpoint.id);
assert.equal(gotCp.label, 'Before the boss');
console.log('  PASS');

console.log('\n14. getCheckpointsBySession...');
const cps = mgr.getCheckpointsBySession(s1.session.id);
assert.ok(cps.length >= 2);
assert.ok(cps.every(cp => cp.sessionId === s1.session.id));
console.log('  PASS');

console.log('\n15. loadCheckpoint...');
const load = mgr.loadCheckpoint(cp1.checkpoint.id, State);
assert.equal(load.ok, true);
assert.ok(load.checkpoint.isCurrent);
assert.equal(load.checkpoint.label, 'Before the boss');
console.log('  PASS');

console.log('\n16. deleteCheckpoint...');
const delCp = mgr.deleteCheckpoint(cp2.checkpoint.id);
assert.equal(delCp.ok, true);
assert.equal(mgr.getCheckpoint(cp2.checkpoint.id), undefined);
const afterDel = mgr.getCheckpointsBySession(s1.session.id);
assert.ok(afterDel.length === 1);
console.log('  PASS');

console.log('\n17. addTimelineEvent...');
const tl1 = mgr.addTimelineEvent(s1.session.id, { type: 'combat', description: 'Fought the dragon', author: 'gm', tags: ['combat', 'boss'], timestamp: '2024-01-15T10:00:00Z' });
assert.equal(tl1.ok, true);
assert.equal(tl1.event.type, 'combat');
assert.equal(tl1.event.description, 'Fought the dragon');
const tl2 = mgr.addTimelineEvent(s1.session.id, { type: 'dialogue', description: 'Met the king', author: 'gm', tags: ['social'], timestamp: '2024-01-16T10:00:00Z' });
assert.equal(tl2.ok, true);
const tl3 = mgr.addTimelineEvent(s1.session.id, { type: 'loot', description: 'Found the sword', author: 'player', tags: ['loot', 'item'], timestamp: '2024-01-17T10:00:00Z' });
assert.equal(tl3.ok, true);
console.log('  PASS');

console.log('\n18. getTimeline...');
const timeline = mgr.getTimeline(s1.session.id);
assert.equal(timeline.ok, true);
assert.equal(timeline.events.length, 3);
assert.equal(timeline.events[0].type, 'combat');
assert.equal(timeline.events[2].type, 'loot');
console.log('  PASS');

console.log('\n18b. getTimeline with range...');
const range = mgr.getTimeline(s1.session.id, { from: '2024-01-15T10:00:00Z', to: '2024-01-16T10:00:00Z' });
assert.equal(range.ok, true);
assert.equal(range.events.length, 2);
console.log('  PASS');

console.log('\n19. replaySession...');
const replay = mgr.replaySession(s1.session.id, State, 2);
assert.equal(replay.ok, true);
assert.equal(replay.sessionId, s1.session.id);
assert.equal(replay.totalEvents, 3);
assert.ok(replay.events.length === 3);
assert.ok(replay.events[0].replayAt < replay.events[1].replayAt); // chronological order
console.log('  PASS');

console.log('\n20. exportSession...');
const exported = mgr.exportSession(s1.session.id);
assert.equal(exported.ok, true);
assert.ok(exported.data.session);
assert.ok(exported.data.checkpoints);
assert.ok(Array.isArray(exported.data.checkpoints));
console.log('  PASS');

console.log('\n21. importSession...');
const imported = mgr.importSession(exported.data, 'valen');
assert.equal(imported.ok, true);
assert.ok(imported.session.id.startsWith('session-'));
assert.equal(imported.session.campaignId, 'valen');
console.log('  PASS');

console.log('\n22. getCampaignStats...');
const cStats = mgr.getCampaignStats(c1.id);
assert.equal(cStats.campaignId, c1.id);
assert.equal(cStats.name, 'Valen Chronicles');
assert.equal(cStats.sessionCount, 3);
console.log('  PASS');

console.log('\n22b. getSessionStats...');
const sStats = mgr.getSessionStats(s1.session.id);
assert.equal(sStats.sessionId, s1.session.id);
assert.equal(sStats.name, 'Session 1: The Beginning');
assert.equal(sStats.status, 'in_progress');
assert.equal(sStats.checkpointCount, 1);
assert.equal(sStats.eventCount, 3);
console.log('  PASS');

console.log('\n23. setOfflineMode...');
const offline = mgr.setOfflineMode(c1.id, true);
assert.equal(offline.ok, true);
assert.equal(offline.campaign.settings.offlineMode, true);
assert.equal(offline.campaign.settings.autoSave, false);
const online = mgr.setOfflineMode(c1.id, false);
assert.equal(online.campaign.settings.offlineMode, false);
console.log('  PASS');

console.log('\n✅ All RPG Campaign/Session Manager tests passed!');
console.log('\nCoverage: RPG-02-08 to RPG-02-15 (Campaign/Session Management)');