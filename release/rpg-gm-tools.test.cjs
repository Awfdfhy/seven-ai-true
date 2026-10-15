'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const GmTools = require('./workspaces/rpg-gm-tools.js');

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function text(v) { return typeof v === 'string' ? v.trim() : ''; }

const seed = {
  sessionId: 'gm-test', worldId: 'valen-gm',
  timeline: { tick: 5, dateLabel: 'Spring Festival' },
  world: { 
    locations: { capital: { name: 'Capital' }, dungeon: { name: 'Dungeon' } },
    weather: { current: 'rainy' },
    timeOfDay: 'evening'
  },
  characters: {
    hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' } },
    companion: { control: 'ai', locationId: 'capital', identity: { name: 'Companion' } },
    villain: { control: 'ai', locationId: 'dungeon', identity: { name: 'Villain' } }
  },
  quests: { main: { title: 'Save the Kingdom' } },
  canon: { entries: {} }
};

const state = State.createState(seed);
const gm = GmTools.createGmTools(State);

console.log('Testing RPG GM Tools...');

console.log('\n1. createNote...');
const note1 = gm.createNote({
  title: 'Session 1 Notes',
  content: 'Party met the king.',
  type: 'plot',
  visibility: 'gm-only',
  tags: ['session-1', 'king'],
  linkedEntities: ['hero', 'king']
});
assert.equal(note1.title, 'Session 1 Notes');
assert.equal(note1.type, 'plot');
assert.equal(note1.visibility, 'gm-only');
assert.ok(note1.tags.includes('session-1'));
assert.ok(note1.linkedEntities.includes('hero'));
console.log('  PASS');

console.log('\n2. updateNote...');
const updated = gm.updateNote(note1.id, { content: 'Party met the king and queen.', tags: ['session-1', 'king', 'queen'] });
assert.equal(updated.ok, true);
assert.equal(updated.note.content, 'Party met the king and queen.');
assert.ok(updated.note.tags.includes('queen'));
assert.equal(updated.note.version, 2);
console.log('  PASS');

console.log('\n3. getNote...');
const got = gm.getNote(note1.id);
assert.equal(got.id, note1.id);
assert.equal(got.content, 'Party met the king and queen.');
console.log('  PASS');

console.log('\n4. getNotes filter...');
gm.createNote({ title: 'NPC Note', content: 'Villain plans.', type: 'npc', visibility: 'gm-only', tags: ['villain'] });
gm.createNote({ title: 'Public Note', content: 'Rumor.', type: 'general', visibility: 'public', tags: ['rumor'] });
const gmNotes = gm.getNotes({ visibility: 'gm-only' });
assert.ok(gmNotes.every(n => n.visibility === 'gm-only'));
const plotNotes = gm.getNotes({ type: 'plot' });
assert.ok(plotNotes.every(n => n.type === 'plot'));
const tagNotes = gm.getNotes({ tag: 'villain' });
assert.ok(tagNotes.every(n => n.tags.includes('villain')));
const searchNotes = gm.getNotes({ search: 'king' });
assert.ok(searchNotes.some(n => n.content.includes('king')));
console.log('  PASS');

console.log('\n5. deleteNote...');
const del = gm.deleteNote(note1.id);
assert.equal(del, true);
assert.equal(gm.getNote(note1.id), undefined);
console.log('  PASS');

console.log('\n6. createTimelineEvent...');
const evt1 = gm.createTimelineEvent({
  timelineId: 'main',
  timestamp: '2024-01-15T10:00:00Z',
  type: 'combat',
  description: 'Party defeated the goblin king.',
  participants: ['hero', 'companion'],
  location: 'dungeon',
  visibility: 'gm-only',
  tags: ['combat', 'boss']
});
assert.equal(evt1.type, 'combat');
assert.ok(evt1.id.startsWith('event-'));
const evt2 = gm.createTimelineEvent({
  timelineId: 'main',
  timestamp: '2024-01-16T10:00:00Z',
  type: 'discovery',
  description: 'Found the ancient artifact.',
  participants: ['hero'],
  location: 'ruins',
  visibility: 'party'
});
console.log('  PASS');

console.log('\n6b. getTimeline...');
const mainTimeline = gm.getTimeline('main');
assert.equal(mainTimeline.length, 2);
assert.equal(mainTimeline[0].timestamp, '2024-01-15T10:00:00Z');
assert.equal(mainTimeline[1].timestamp, '2024-01-16T10:00:00Z');
console.log('  PASS');

console.log('\n6c. getTimelineRange...');
const range = gm.getTimelineRange('main', '2024-01-15T00:00:00Z', '2024-01-15T23:59:59Z');
assert.equal(range.length, 1);
assert.equal(range[0].type, 'combat');
console.log('  PASS');

console.log('\n7. registerNpc...');
const npc1 = gm.registerNpc({
  name: 'King Aldren',
  role: 'monarch',
  location: 'capital',
  disposition: 'friendly',
  secrets: ['knows the prophecy'],
  knowledge: ['royal lineage', 'secret passages'],
  schedule: ['court at 10am', 'feast at 7pm'],
  stats: { cha: 18, int: 14 },
  inventory: ['crown', 'scepter'],
  relationships: { hero: 'ally', villain: 'enemy' },
  plotHooks: ['reveal prophecy', 'grant boon']
});
assert.equal(npc1.name, 'King Aldren');
assert.equal(npc1.disposition, 'friendly');
assert.ok(npc1.secrets.includes('knows the prophecy'));
assert.ok(npc1.plotHooks.includes('reveal prophecy'));
console.log('  PASS');

console.log('\n7b. updateNpc...');
const upd = gm.updateNpc(npc1.id, { disposition: 'neutral', secrets: ['knows the prophecy', 'hiding artifact'] });
assert.equal(upd.ok, true);
assert.equal(upd.npc.disposition, 'neutral');
assert.ok(upd.npc.secrets.includes('hiding artifact'));
assert.equal(upd.npc.version, 2);
console.log('  PASS');

console.log('\n7b. getNpc...');
const gotNpc = gm.getNpc(npc1.id);
assert.equal(gotNpc.id, npc1.id);
assert.equal(gotNpc.disposition, 'neutral');
console.log('  PASS');

console.log('\n7c. getNpcsAtLocation...');
gm.registerNpc({ name: 'Guard', role: 'guard', location: 'capital', disposition: 'neutral' });
gm.registerNpc({ name: 'Merchant', role: 'merchant', location: 'capital', disposition: 'neutral' });
const capitalNpcs = gm.getNpcsAtLocation('capital');
assert.ok(capitalNpcs.length >= 2);
assert.ok(capitalNpcs.every(n => n.location === 'capital'));
console.log('  PASS');

console.log('\n7d. getNpcsByDisposition...');
const friendly = gm.getNpcsByDisposition('friendly');
assert.ok(friendly.every(n => n.disposition === 'friendly'));
console.log('  PASS');

console.log('\n8. generateSessionPlan...');
const sessionState = State.createState(seed);
const plan = gm.generateSessionPlan(sessionState, { durationHours: 4, focus: 'combat' });
assert.ok(plan.sessionId.startsWith('session-'));
assert.equal(plan.plannedDuration, 4);
assert.equal(plan.focus, 'combat');
assert.equal(plan.hooks.length, 3);
assert.ok(plan.encounters.length > 0);
assert.ok(plan.plotPoints.length > 0);
assert.ok(plan.hooks.every(h => h.type === 'hook'));
assert.ok(plan.encounters.every(e => e.type === 'encounter'));
assert.ok(plan.plotPoints.every(p => p.type === 'plot'));
console.log('  PASS');

console.log('\n9. trackInitiative...');
const init = gm.trackInitiative([
  { id: 'p1', name: 'Hero', hp: 100, maxHp: 100, initiative: 10 },
  { id: 'p2', name: 'Goblin', hp: 30, maxHp: 30, initiative: 5 },
  { id: 'p3', name: 'Villain', hp: 150, maxHp: 150, initiative: 15 }
]);
assert.equal(init.participants.length, 3);
assert.ok(init.participants[0].initiative >= init.participants[1].initiative);
assert.equal(init.round, 1);
assert.equal(init.current, 0);
console.log('  PASS');

console.log('\n10. nextTurn...');
const next = gm.nextTurn(init);
assert.equal(next.round, 1);
assert.equal(next.current, 1);
assert.equal(next.participants[1].turn, 1);
const next2 = gm.nextTurn(next);
assert.equal(next2.current, 2);
const next3 = gm.nextTurn(next2);
assert.equal(next3.round, 2);
assert.equal(next3.current, 0);
console.log('  PASS');

console.log('\n11. applyDamage...');
const goblinId = init.participants.find(p => p.name === 'Goblin').id;
const dmg = gm.applyDamage(init, goblinId, 20);
const goblinAfterDmg = dmg.participants.find(p => p.name === 'Goblin');
assert.equal(goblinAfterDmg.hp, 10);
const overDmg = gm.applyDamage(dmg, goblinId, 50);
const goblinAfterOverDmg = overDmg.participants.find(p => p.name === 'Goblin');
assert.equal(goblinAfterOverDmg.hp, 0);
console.log('  PASS');

console.log('\n12. addCondition...');
const villainId = init.participants.find(p => p.name === 'Villain').id;
const cond = gm.addCondition(init, villainId, 'poisoned');
assert.ok(cond.participants[0].conditions.includes('poisoned'));
const dupCond = gm.addCondition(cond, init.participants[0].id, 'poisoned');
assert.equal(dupCond.participants[0].conditions.filter(c => c === 'poisoned').length, 1);
console.log('  PASS');

console.log('\n13. generateLoot...');
const common = gm.generateLoot(1, 'common');
assert.ok(common.length >= 1 && common.length <= 3);
const legendary = gm.generateLoot(10, 'legendary');
assert.ok(legendary.length >= 1);
console.log('  PASS');

console.log('\n14. generateStoryHook...');
const hook = gm.generateStoryHook(State.createState(seed));
assert.ok(typeof hook === 'string');
assert.ok(hook.length > 0);
console.log('  PASS: ' + hook);

console.log('\n✅ All RPG GM Tools tests passed!');
console.log('\nCoverage: RPG-15-07 (GM tools)');