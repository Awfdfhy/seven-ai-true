'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const EventSched = require('./workspaces/rpg-event-scheduler.js');

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function text(v) { return typeof v === 'string' ? v.trim() : ''; }

const seed = {
  sessionId: 'sched-test', worldId: 'valen-sched',
  timeline: { tick: 5, dateLabel: 'Spring Festival' },
  world: { 
    locations: { capital: { name: 'Capital' }, dungeon: { name: 'Dungeon' } },
    weather: { current: 'rainy' },
    timeOfDay: 'evening'
  },
  characters: {
    hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' } },
    companion: { control: 'ai', locationId: 'capital', identity: { name: 'Companion' } }
  },
  quests: { main: { title: 'Save the Kingdom', status: 'active' } },
  canon: { entries: {} }
};

const state = State.createState(seed);
const sched = EventSched.createEventScheduler(State);

console.log('Testing RPG Event Scheduler...');

console.log('\n1. createEvent - basic...');
const evt1 = sched.createEvent({
  title: 'Daily Market',
  type: 'world_event',
  description: 'Market opens in the capital',
  startTime: new Date(Date.now() + 3600000).toISOString(),
  recurrence: 'daily',
  location: 'capital',
  participants: ['merchant1', 'merchant2'],
  priority: 'normal',
  tags: ['economy', 'recurring']
});
assert.equal(evt1.title, 'Daily Market');
assert.equal(evt1.type, 'world_event');
assert.equal(evt1.recurrence, 'daily');
assert.ok(evt1.id.startsWith('evt-'));
console.log('  PASS');

console.log('\n2. createEvent - one-time...');
const evt2 = sched.createEvent({
  title: 'Festival',
  type: 'world_event',
  description: 'Annual harvest festival',
  startTime: new Date(Date.now() + 86400000).toISOString(),
  endTime: new Date(Date.now() + 172800000).toISOString(),
  recurrence: 'yearly',
  location: 'capital',
  priority: 'high',
  tags: ['festival', 'culture']
});
assert.equal(evt2.recurrence, 'yearly');
assert.ok(evt2.endTime);
console.log('  PASS');

console.log('\n3. getEvent...');
const got = sched.getEvent(evt1.id);
assert.equal(got.id, evt1.id);
assert.equal(got.title, 'Daily Market');
console.log('  PASS');

console.log('\n4. updateEvent...');
const updated = sched.updateEvent(evt1.id, { priority: 'high', tags: ['economy', 'recurring', 'important'] });
assert.equal(updated.ok, true);
assert.equal(updated.event.priority, 'high');
assert.ok(updated.event.tags.includes('important'));
assert.equal(updated.event.version, 2);
console.log('  PASS');

console.log('\n4b. getEvents filter...');
const all = sched.getEvents({ type: 'world_event' });
assert.ok(all.length >= 2);
assert.ok(all.every(e => e.type === 'world_event'));
const highPrio = sched.getEvents({ priority: 'high' });
assert.ok(highPrio.every(e => e.priority === 'high'));
console.log('  PASS');

console.log('\n5. deleteEvent...');
const del = sched.deleteEvent(evt2.id);
assert.equal(del, true);
assert.equal(sched.getEvent(evt2.id), undefined);
console.log('  PASS');

console.log('\n6. getUpcomingEvents...');
const soon = sched.createEvent({
  title: 'Soon Event',
  type: 'custom',
  startTime: new Date(Date.now() + 1800000).toISOString(),
  recurrence: 'none'
});
const upcoming = sched.getUpcomingEvents(3600000);
assert.ok(upcoming.some(e => e.id === soon.id));
console.log('  PASS');

console.log('\n7. evaluateCondition...');
const testState = State.createState(seed);
const condEvent = sched.createEvent({
  title: 'Conditional Event',
  type: 'custom',
  startTime: new Date(Date.now() + 1000).toISOString(),
  condition: 'state.timeline.tick > 3'
});
const result1 = sched.evaluateCondition(testState, condEvent);
assert.equal(result1, true);
const condEvent2 = sched.createEvent({
  title: 'False Conditional',
  type: 'custom',
  condition: 'state.timeline.tick > 100'
});
const result2 = sched.evaluateCondition(testState, condEvent2);
assert.equal(result2, false);
console.log('  PASS');

console.log('\n8. executeAction - notify...');
const notifyEvent = sched.createEvent({
  title: 'Notify',
  type: 'custom',
  action: { type: 'notify', message: 'Market opens!', target: 'all' }
});
const changes = sched.executeAction(testState, notifyEvent);
assert.equal(changes.length, 1);
assert.equal(changes[0].type, 'notification');
assert.equal(changes[0].message, 'Market opens!');
console.log('  PASS');

console.log('\n8b. executeAction - spawn_npc...');
const spawnEvent = sched.createEvent({
  title: 'Spawn',
  type: 'custom',
  action: { type: 'spawn_npc', npc: { name: 'Merchant', role: 'merchant' }, location: 'capital' }
});
const changes2 = sched.executeAction(testState, spawnEvent);
assert.equal(changes2[0].type, 'spawn_npc');
console.log('  PASS');

console.log('\n8c. executeAction - modify_world...');
const worldEvent = sched.createEvent({
  title: 'World Mod',
  type: 'custom',
  action: { type: 'modify_world', path: 'economy.marketOpen', value: true }
});
const changes3 = sched.executeAction(testState, worldEvent);
assert.equal(changes3[0].type, 'world_modify');
assert.equal(changes3[0].path, 'economy.marketOpen');
assert.equal(changes3[0].value, true);
console.log('  PASS');

console.log('\n9. triggerEvent...');
const triggerEvent = sched.createEvent({
  title: 'Trigger Test',
  type: 'custom',
  startTime: new Date(Date.now() - 1000).toISOString(),
  action: { type: 'notify', message: 'Triggered!' }
});
const triggerResult = sched.triggerEvent(testState, triggerEvent.id);
assert.equal(triggerResult.ok, true);
assert.ok(triggerResult.changes.length > 0);
assert.ok(triggerResult.event.triggerCount === 1);
assert.ok(triggerResult.event.lastTriggered);
assert.equal(triggerResult.event.enabled, false); // no recurrence
console.log('  PASS');

console.log('\n10. triggerEvent with recurrence...');
const recurEvent = sched.createEvent({
  title: 'Recurring',
  type: 'custom',
  startTime: new Date(Date.now() - 1000).toISOString(),
  recurrence: 'daily',
  recurrenceRule: 'every 1 days',
  action: { type: 'notify', message: 'Daily!' }
});
const recurResult = sched.triggerEvent(testState, recurEvent.id);
assert.equal(recurResult.ok, true);
assert.equal(recurResult.event.enabled, true);
assert.ok(recurResult.event.startTime > recurEvent.startTime);
console.log('  PASS');

console.log('\n11. processEvents...');
const processEvent = sched.createEvent({
  title: 'Process Test',
  type: 'custom',
  startTime: new Date(Date.now() - 1000).toISOString(),
  action: { type: 'notify', message: 'Processed!' }
});
const results = sched.processEvents(testState);
assert.ok(results.length >= 1);
console.log('  PASS');

console.log('\n12. createSchedule...');
const schedule = sched.createSchedule({
  name: 'Daily Routine',
  events: [
    { title: 'Morning Briefing', type: 'npc_schedule', startTime: new Date(Date.now() + 3600000).toISOString() },
    { title: 'Evening Patrol', type: 'npc_schedule', startTime: new Date(Date.now() + 7200000).toISOString() }
  ],
  timezone: 'UTC'
});
assert.ok(schedule.id.startsWith('sched-'));
assert.equal(schedule.events.length, 2);
console.log('  PASS');

console.log('\n13. getEventStats...');
const stats = sched.getEventStats();
assert.ok(stats.total >= 5);
assert.ok(stats.byType);
assert.ok(stats.byPriority);
assert.ok(typeof stats.enabled === 'number');
assert.ok(typeof stats.disabled === 'number');
assert.ok(typeof stats.upcoming === 'number');
console.log('  PASS');

console.log('\n14. createCalendarView...');
const cal = sched.createCalendarView(state, {
  from: new Date(Date.now() - 86400000).toISOString(),
  to: new Date(Date.now() + 86400000).toISOString()
});
assert.ok(cal.range);
assert.ok(cal.days);
assert.ok(typeof cal.totalEvents === 'number');
console.log('  PASS');

console.log('\n15. calculateNextOccurrence...');
const daily = sched.calculateNextOccurrence('2024-01-15T10:00:00Z', 'daily');
assert.ok(new Date(daily).getTime() > new Date('2024-01-15T10:00:00Z').getTime());
const weekly = sched.calculateNextOccurrence('2024-01-15T10:00:00Z', 'weekly');
assert.ok(new Date(weekly).getTime() > new Date('2024-01-15T10:00:00Z').getTime());
const custom = sched.calculateNextOccurrence('2024-01-15T10:00:00Z', 'custom', 'every 3 days');
assert.ok(new Date(custom).getTime() > new Date('2024-01-15T10:00:00Z').getTime());
console.log('  PASS');

console.log('\n✅ All RPG Event Scheduler tests passed!');
console.log('\nCoverage: RPG-15-09 (event scheduler)');