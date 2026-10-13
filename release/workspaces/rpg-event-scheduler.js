(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgEventScheduler = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }
  function uniq(xs) { return Array.from(new Set(arr(xs).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))); }
  function stableId(prefix, n) { return prefix + '-' + String(n).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }
  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  const EVENT_TYPES = Object.freeze(['npc_schedule', 'world_event', 'quest_event', 'weather_change', 'faction_action', 'random_encounter', 'plot_advance', 'custom']);
  const RECURRENCE = Object.freeze(['none', 'daily', 'weekly', 'monthly', 'yearly', 'custom']);
  const PRIORITY = Object.freeze(['low', 'normal', 'high', 'critical']);

  function createEventScheduler(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const events = new Map();
    const timers = new Map();
    const lastIdNums = new Map();

    // Collision-safe monotonic id generator. Date.now() alone repeats when two
    // creations land in the same millisecond (or when the clock moves back),
    // which silently overwrote the earlier record. Tracks the last numeric id
    // per prefix and bumps forward so ids never repeat within this scheduler.
    function nextId(prefix, isTaken) {
      let n = Date.now();
      const last = lastIdNums.get(prefix) || 0;
      if (n <= last) n = last + 1;
      let id = stableId(prefix, n);
      if (typeof isTaken === 'function') { while (isTaken(id)) { n += 1; id = stableId(prefix, n); } }
      lastIdNums.set(prefix, n);
      return id;
    }

    function createEvent(input) {
      const i = obj(input);
      const id = i.id || nextId('evt', key => events.has(key));
      const type = EVENT_TYPES.includes(i.type) ? i.type : 'custom';
      const title = text(i.title);
      const description = text(i.description);
      const startTime = i.startTime || now();
      const endTime = i.endTime || null;
      const recurrence = RECURRENCE.includes(i.recurrence) ? i.recurrence : 'none';
      const recurrenceRule = text(i.recurrenceRule);
      const location = text(i.location);
      const participants = arr(i.participants);
      const priority = PRIORITY.includes(i.priority) ? i.priority : 'normal';
      const tags = arr(i.tags);
      const metadata = obj(i.metadata);
      const condition = text(i.condition);
      const action = obj(i.action);
      const enabled = i.enabled !== false;

      const event = {
        id, type, title, description,
        startTime, endTime, recurrence, recurrenceRule,
        location, participants, priority, tags, metadata,
        condition, action, enabled,
        createdAt: now(), updatedAt: now(), version: 1,
        lastTriggered: null, triggerCount: 0
      };
      events.set(id, event);
      return event;
    }

    function updateEvent(id, updates) {
      const event = events.get(id);
      if (!event) return { ok: false, reason: 'not-found' };
      const next = clone(event);
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'createdAt' && key !== 'version' && key !== 'triggerCount' && key !== 'lastTriggered') {
          next[key] = value;
        }
      }
      next.updatedAt = now();
      next.version = (event.version || 1) + 1;
      events.set(id, next);
      return { ok: true, event: next };
    }

    function deleteEvent(id) {
      return events.delete(id);
    }

    function getEvent(id) {
      return events.get(id);
    }

    function getEvents(filter) {
      const f = obj(filter);
      let result = Array.from(events.values());
      if (f.type) result = result.filter(e => e.type === f.type);
      if (f.enabled !== undefined) result = result.filter(e => e.enabled === f.enabled);
      if (f.priority) result = result.filter(e => e.priority === f.priority);
      if (f.tag) result = result.filter(e => e.tags.includes(f.tag));
      if (f.participant) result = result.filter(e => e.participants.includes(f.participant));
      if (f.location) result = result.filter(e => e.location === f.location);
      if (f.from) result = result.filter(e => e.startTime >= f.from);
      if (f.to) result = result.filter(e => e.startTime <= f.to);
      if (f.enabled !== undefined) result = result.filter(e => e.enabled === f.enabled);
      return result.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    function getUpcomingEvents(withinMs = 86400000) {
      const nowTime = Date.now();
      const cutoff = nowTime + withinMs;
      return getEvents({ from: now(), to: new Date(cutoff).toISOString() });
    }

    function evaluateCondition(state, event) {
      if (!event.condition || event.condition === 'always') return true;
      if (event.condition === 'never') return false;
      try {
        const scope = { state, event };
        const vm = require('vm');
        const script = new vm.Script('"use strict"; (' + event.condition + ')');
        return script.runInNewContext(scope, { timeout: 100 });
      } catch (e) {
        return false;
      }
    }

    function executeAction(state, event) {
      const act = event.action;
      if (!act || !act.type) return [];
      const changes = [];

      switch (act.type) {
        case 'notify':
          changes.push({ type: 'notification', message: act.message, target: act.target });
          break;
        case 'spawn_npc':
          changes.push({ type: 'spawn_npc', npc: act.npc, location: act.location });
          break;
        case 'modify_world':
          changes.push({ type: 'world_modify', path: act.path, value: act.value, operator: act.operator || '=' });
          break;
        case 'trigger_quest':
          changes.push({ type: 'quest_trigger', questId: act.questId, action: act.questAction });
          break;
        case 'change_weather':
          changes.push({ type: 'weather_change', weather: act.weather, location: act.location });
          break;
        case 'faction_action':
          changes.push({ type: 'faction_action', factionId: act.factionId, action: act.factionAction });
          break;
        case 'custom':
          changes.push({ type: 'custom', data: act.data });
          break;
      }
      return changes;
    }

    function triggerEvent(state, eventId) {
      const event = events.get(eventId);
      if (!event || !event.enabled) return { ok: false, reason: 'not-found-or-disabled' };

      const stateObj = stateApi.createState ? stateApi.createState(state) : state;
      if (!evaluateCondition(stateObj, event)) return { ok: false, reason: 'condition-not-met' };

      const changes = executeAction(stateObj, event);
      const nextEvent = clone(event);
      nextEvent.lastTriggered = now();
      nextEvent.triggerCount = (event.triggerCount || 0) + 1;
      nextEvent.updatedAt = now();
      nextEvent.version = (event.version || 1) + 1;

      if (event.recurrence !== 'none' && event.recurrenceRule) {
        nextEvent.startTime = calculateNextOccurrence(event.startTime, event.recurrence, event.recurrenceRule);
        if (event.endTime) {
          nextEvent.endTime = calculateNextOccurrence(event.endTime, event.recurrence, event.recurrenceRule);
        }
      } else {
        nextEvent.enabled = false;
      }

      events.set(eventId, nextEvent);
      return { ok: true, event: nextEvent, changes };
    }

    function calculateNextOccurrence(currentTime, recurrence, rule) {
      const date = new Date(currentTime);
      switch (recurrence) {
        case 'daily':
          date.setDate(date.getDate() + 1);
          break;
        case 'weekly':
          date.setDate(date.getDate() + 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() + 1);
          break;
        case 'yearly':
          date.setFullYear(date.getFullYear() + 1);
          break;
        case 'custom':
          if (rule) {
            const match = rule.match(/every (\d+) (days?|weeks?|months?|years?)/i);
            if (match) {
              const num = parseInt(match[1]);
              const unit = match[2].toLowerCase();
              if (unit.startsWith('day')) date.setDate(date.getDate() + num);
              else if (unit.startsWith('week')) date.setDate(date.getDate() + num * 7);
              else if (unit.startsWith('month')) date.setMonth(date.getMonth() + num);
              else if (unit.startsWith('year')) date.setFullYear(date.getFullYear() + num);
            }
          }
          break;
      }
      return date.toISOString();
    }

    function processEvents(state) {
      const stateObj = stateApi.createState ? stateApi.createState(state) : state;
      const nowTime = now();
      const dueEvents = Array.from(events.values()).filter(e => e.enabled && e.startTime <= nowTime);
      const results = [];
      for (const event of dueEvents) {
        const result = triggerEvent(stateObj, event.id);
        if (result.ok) results.push(result);
      }
      return results;
    }

    function createSchedule(input) {
      const i = obj(input);
      const id = i.id || nextId('sched');
      const name = text(i.name);
      const events = arr(i.events).map(e => createEvent(e));
      const timezone = text(i.timezone) || 'UTC';
      const active = i.active !== false;

      return { id, name, events: events.map(e => e.id), timezone, active, createdAt: now(), updatedAt: now() };
    }

    function getEventStats() {
      const all = Array.from(events.values());
      const stats = { total: all.length, byType: {}, byPriority: {}, enabled: 0, disabled: 0, upcoming: 0 };
      const nowTime = Date.now();
      for (const e of all) {
        stats.byType[e.type] = (stats.byType[e.type] || 0) + 1;
        stats.byPriority[e.priority] = (stats.byPriority[e.priority] || 0) + 1;
        if (e.enabled) stats.enabled++; else stats.disabled++;
        if (e.enabled && new Date(e.startTime).getTime() <= Date.now() + 86400000) stats.upcoming++;
      }
      return stats;
    }

    function createCalendarView(state, range) {
      const r = obj(range);
      const eventsInRange = getEvents({ from: r.from, to: r.to });
      const days = {};
      for (const e of eventsInRange) {
        const date = e.startTime.split('T')[0];
        if (!days[date]) days[date] = [];
        days[date].push({ id: e.id, title: e.title, type: e.type, startTime: e.startTime, priority: e.priority });
      }
      return { range, days, totalEvents: eventsInRange.length };
    }

    return {
      EVENT_TYPES, RECURRENCE, PRIORITY,
      createEvent, updateEvent, deleteEvent, getEvent, getEvents,
      getUpcomingEvents, evaluateCondition, executeAction, triggerEvent,
      processEvents, createSchedule, getEventStats, createCalendarView,
      calculateNextOccurrence
    };
  }

  return { createEventScheduler };
});