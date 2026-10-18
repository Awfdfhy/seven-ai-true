(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgAdvanced = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }
  function uniq(xs) { return Array.from(new Set(arr(xs).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))); }
  function clamp(v, min, max) { v = Number(v); return Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : min; }
  function stableId(prefix, n) { return prefix + '-' + String(n).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }

  // Persistence helpers. Maps (including Maps nested inside records) cannot
  // survive JSON, so they are tagged with a __map wrapper on the way out and
  // rebuilt on the way in.
  function mapsToPlain(v) {
    if (v instanceof Map) return { __map: Object.fromEntries([...v].map(([k, x]) => [k, mapsToPlain(x)])) };
    if (Array.isArray(v)) return v.map(mapsToPlain);
    if (v && typeof v === 'object') {
      const out = {};
      for (const [k, x] of Object.entries(v)) out[k] = mapsToPlain(x);
      return out;
    }
    return v;
  }
  function plainToMaps(v) {
    if (Array.isArray(v)) return v.map(plainToMaps);
    if (v && typeof v === 'object') {
      if (Object.prototype.hasOwnProperty.call(v, '__map')) {
        return new Map(Object.entries(v.__map).map(([k, x]) => [k, plainToMaps(x)]));
      }
      const out = {};
      for (const [k, x] of Object.entries(v)) out[k] = plainToMaps(x);
      return out;
    }
    return v;
  }
  // Replaces every entry of a closure Map from an exported payload, accepting
  // either the {__map:...} shape or a bare object. Returns the entry count.
  function restoreMap(target, payload) {
    target.clear();
    const restored = plainToMaps(payload);
    if (restored instanceof Map) {
      for (const [k, v] of restored) target.set(k, v);
    } else {
      for (const [k, v] of Object.entries(restored)) target.set(k, v);
    }
    return target.size;
  }

  const PLUGIN_CAPABILITIES = Object.freeze(['read-state', 'write-state', 'emit-event', 'register-command', 'ui-panel', 'network']);
  const RUMOR_TYPES = Object.freeze(['whisper', 'gossip', 'prophecy', 'rumor', 'legend', 'warning']);
  const RUMOR_STATES = Object.freeze(['seeded', 'spreading', 'fading', 'confirmed', 'debunked', 'forgotten']);
  const SCENARIO_TYPES = Object.freeze(['module', 'one-shot', 'campaign', 'side-quest', 'encounter']);
  const ATLAS_EPOCHS = Object.freeze(['ancient', 'classical', 'medieval', 'renaissance', 'modern', 'ageless']);
  const VOICE_ENGINES = Object.freeze(['system', 'neural', 'offline', 'catalog']);

  function createAdvancedManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const plugins = new Map();
    const rumors = new Map();
    const scenarioPacks = new Map();
    const questNodes = new Map();
    const atlasEntries = new Map();
    const analyticsEvents = [];
    const voiceCatalog = new Map();
    let idCounter = 0;
    function nextId() { return ++idCounter; }

    // Seeded RNG for deterministic offscreen simulation
    let rngState = 987654321;
    function seedRng(seed) { rngState = Number(seed) || 987654321; }
    function rng() { rngState = (rngState * 1103515245 + 12345) & 0x7fffffff; return rngState / 0x7fffffff; }
    function rngPick(list) { const l = arr(list); return l.length ? l[Math.floor(rng() * l.length)] : null; }
    function rngChance(p) { return rng() < p; }

    // RPG-15-03: Modular plugins sandboxed
    function registerPlugin(input) {
      const i = obj(input);
      const id = i.id || stableId('plugin', nextId());
      const plugin = {
        id,
        name: text(i.name) || 'Plugin',
        version: text(i.version) || '1.0.0',
        author: text(i.author) || null,
        description: text(i.description) || null,
        // Sandboxed: only granted capabilities are allowed
        capabilities: uniq(i.capabilities).filter(c => PLUGIN_CAPABILITIES.includes(c)),
        // Resource limits
        limits: {
          maxEvents: clamp(i.limits?.maxEvents ?? 100, 1, 10000),
          maxStateWrites: clamp(i.limits?.maxStateWrites ?? 50, 1, 5000),
          timeoutMs: clamp(i.limits?.timeoutMs ?? 1000, 10, 30000)
        },
        usage: { eventsEmitted: 0, stateWrites: 0, violations: 0 },
        enabled: i.enabled !== false,
        trusted: i.trusted === true,
        installedAt: now()
      };
      plugins.set(id, plugin);
      return plugin;
    }

    function hasCapability(pluginId, capability) {
      const p = plugins.get(pluginId);
      return p ? p.capabilities.includes(capability) : false;
    }

    function sandboxCall(pluginId, action) {
      const p = plugins.get(pluginId);
      if (!p) return { ok: false, reason: 'plugin-not-found' };
      if (!p.enabled) return { ok: false, reason: 'plugin-disabled' };
      const a = obj(action);
      const requiredCap = text(a.requiresCapability);
      if (requiredCap && !p.capabilities.includes(requiredCap)) {
        p.usage.violations++;
        return { ok: false, reason: 'capability-denied', capability: requiredCap, message: `Plugin '${p.name}' lacks capability '${requiredCap}'` };
      }
      // Enforce resource limits
      if (a.type === 'emit-event') {
        if (p.usage.eventsEmitted >= p.limits.maxEvents) {
          p.usage.violations++;
          return { ok: false, reason: 'limit-exceeded', limit: 'maxEvents' };
        }
        p.usage.eventsEmitted++;
      } else if (a.type === 'write-state') {
        if (p.usage.stateWrites >= p.limits.maxStateWrites) {
          p.usage.violations++;
          return { ok: false, reason: 'limit-exceeded', limit: 'maxStateWrites' };
        }
        p.usage.stateWrites++;
      }
      return { ok: true, pluginId, action: a.type, sandboxed: true };
    }

    function getPlugin(id) { return plugins.get(id) || null; }

    function listPlugins(filter) {
      const f = obj(filter);
      let result = Array.from(plugins.values());
      if (f.enabledOnly) result = result.filter(p => p.enabled);
      if (f.capability) result = result.filter(p => p.capabilities.includes(f.capability));
      return result;
    }

    function unregisterPlugin(id) {
      const existed = plugins.delete(id);
      return existed ? { ok: true } : { ok: false, reason: 'plugin-not-found' };
    }

    // RPG-15-08: Scenario packs
    function createScenarioPack(input) {
      const i = obj(input);
      const id = i.id || stableId('pack', nextId());
      const pack = {
        id,
        name: text(i.name) || 'Scenario Pack',
        type: SCENARIO_TYPES.includes(i.type) ? i.type : 'module',
        description: text(i.description) || null,
        author: text(i.author) || null,
        version: text(i.version) || '1.0.0',
        recommendedLevel: clamp(i.recommendedLevel ?? 1, 1, 100),
        estimatedHours: clamp(i.estimatedHours ?? 4, 0.5, 100),
        tags: uniq(i.tags),
        content: {
          locations: arr(i.content?.locations).map(l => text(l)),
          characters: arr(i.content?.characters).map(c => text(c)),
          quests: arr(i.content?.quests).map(q => text(q)),
          items: arr(i.content?.items).map(it => text(it)),
          encounters: arr(i.content?.encounters).map(e => text(e))
        },
        prerequisites: uniq(i.prerequisites),
        installed: false,
        installCount: 0,
        rating: clamp(i.rating ?? 0, 0, 5),
        createdAt: now()
      };
      scenarioPacks.set(id, pack);
      return pack;
    }

    function installScenarioPack(id) {
      const pack = scenarioPacks.get(id);
      if (!pack) return { ok: false, reason: 'pack-not-found' };
      pack.installed = true;
      pack.installCount++;
      return { ok: true, pack: clone(pack), contentSummary: {
        locations: pack.content.locations.length,
        characters: pack.content.characters.length,
        quests: pack.content.quests.length,
        items: pack.content.items.length,
        encounters: pack.content.encounters.length
      } };
    }

    function uninstallScenarioPack(id) {
      const pack = scenarioPacks.get(id);
      if (!pack) return { ok: false, reason: 'pack-not-found' };
      pack.installed = false;
      return { ok: true, pack: clone(pack) };
    }

    function listScenarioPacks(filter) {
      const f = obj(filter);
      let result = Array.from(scenarioPacks.values());
      if (f.installedOnly) result = result.filter(p => p.installed);
      if (f.type) result = result.filter(p => p.type === f.type);
      if (f.tag) result = result.filter(p => p.tags.includes(f.tag));
      return result;
    }

    // RPG-15-10: Emergent rumors
    function seedRumor(input) {
      const i = obj(input);
      const id = i.id || stableId('rumor', nextId());
      const rumor = {
        id,
        text: text(i.text) || 'A rumor spreads...',
        type: RUMOR_TYPES.includes(i.type) ? i.type : 'rumor',
        originLocationId: text(i.originLocationId) || null,
        originCharacterId: text(i.originCharacterId) || null,
        seedLocations: uniq(i.seedLocations),
        veracity: clamp(i.veracity ?? 0.5, 0, 1), // truth chance
        spreadRate: clamp(i.spreadRate ?? 0.3, 0, 1),
        sensitivity: clamp(i.sensitivity ?? 0.5, 0, 1),
        state: 'seeded',
        reachCount: 0,
        believedBy: [],
        debunkedBy: [],
        generation: 0,
        seed: clamp(i.seed ?? Math.floor(rng() * 999999), 1, 999999),
        createdAt: now(),
        lastSpreadAt: null
      };
      rumors.set(id, rumor);
      return rumor;
    }

    function spreadRumor(rumorId, options) {
      const rumor = rumors.get(rumorId);
      if (!rumor) return { ok: false, reason: 'rumor-not-found' };
      const o = obj(options);
      seedRng(rumor.seed + rumor.generation);
      const candidates = uniq(o.locations || rumor.seedLocations);
      const newlyReached = [];
      for (const loc of candidates) {
        if (rngChance(rumor.spreadRate)) {
          newlyReached.push(loc);
        }
      }
      rumor.generation++;
      rumor.reachCount += newlyReached.length;
      rumor.lastSpreadAt = now();
      if (rumor.state === 'seeded' && newlyReached.length > 0) rumor.state = 'spreading';
      // Fade if spread has stalled
      if (newlyReached.length === 0 && rumor.state === 'spreading') {
        rumor.state = rngChance(0.3) ? 'fading' : rumor.state;
      }
      return { ok: true, rumor: clone(rumor), newlyReached, newReachCount: newlyReached.length };
    }

    function believeRumor(rumorId, characterId, belief) {
      const rumor = rumors.get(rumorId);
      if (!rumor) return { ok: false, reason: 'rumor-not-found' };
      const cid = text(characterId);
      if (belief === true) {
        if (!rumor.believedBy.includes(cid)) rumor.believedBy.push(cid);
        rumor.debunkedBy = rumor.debunkedBy.filter(x => x !== cid);
      } else if (belief === false) {
        if (!rumor.debunkedBy.includes(cid)) rumor.debunkedBy.push(cid);
        rumor.believedBy = rumor.believedBy.filter(x => x !== cid);
      }
      return { ok: true, rumor: clone(rumor) };
    }

    function resolveRumor(rumorId, outcome) {
      const rumor = rumors.get(rumorId);
      if (!rumor) return { ok: false, reason: 'rumor-not-found' };
      if (outcome === 'confirmed') rumor.state = 'confirmed';
      else if (outcome === 'debunked') rumor.state = 'debunked';
      else if (outcome === 'forgotten') rumor.state = 'forgotten';
      else return { ok: false, reason: 'invalid-outcome' };
      return { ok: true, rumor: clone(rumor) };
    }

    function getRumors(filter) {
      const f = obj(filter);
      let result = Array.from(rumors.values());
      if (f.state) result = result.filter(r => r.state === f.state);
      if (f.type) result = result.filter(r => r.type === f.type);
      if (f.locationId) result = result.filter(r => r.seedLocations.includes(f.locationId));
      return result;
    }

    // RPG-15-11: NPC offscreen simulation
    function simulateNpcOffscreen(input) {
      const i = obj(input);
      const npcs = arr(i.npcs).map(n => obj(n));
      const ticks = clamp(i.ticks ?? 1, 1, 100);
      const seed = clamp(i.seed ?? 42, 1, 999999);
      seedRng(seed);
      const results = [];
      for (const npc of npcs) {
        const name = text(npc.name) || 'NPC';
        const homeLocation = text(npc.homeLocationId) || 'unknown';
        const schedule = arr(npc.schedule);
        const activities = [];
        const locationHistory = [];
        let currentLocation = homeLocation;
        for (let t = 0; t < ticks; t++) {
          // Follow schedule if present, else idle
          const scheduled = schedule.find(s => s.tick === t);
          let activity = 'idle';
          if (scheduled) {
            activity = text(scheduled.activity) || 'idle';
            if (scheduled.locationId) currentLocation = text(scheduled.locationId);
          } else {
            // Random wander near home
            activity = rngPick(['working', 'resting', 'socializing', 'traveling', 'eating']);
            if (rngChance(0.2)) currentLocation = rngPick([homeLocation, currentLocation]);
          }
          activities.push({ tick: t, activity, locationId: currentLocation });
          locationHistory.push(currentLocation);
        }
        // Memory of offscreen events (what the NPC would report)
        const offscreenMemory = activities.filter(a => a.activity !== 'idle').slice(-5);
        results.push({
          npcId: text(npc.id) || name.toLowerCase().replace(/\s+/g, '-'),
          name,
          homeLocationId: homeLocation,
          ticks,
          activities,
          finalLocation: currentLocation,
          uniqueLocations: uniq(locationHistory),
          offscreenMemory
        });
      }
      return { ok: true, tickCount: ticks, seed, npcResults: results };
    }

    // RPG-15-12: Dynamic quest graph
    function createQuestNode(input) {
      const i = obj(input);
      const id = i.id || stableId('qnode', nextId());
      const node = {
        id,
        questId: text(i.questId) || id,
        title: text(i.title) || 'Quest Step',
        description: text(i.description) || null,
        type: text(i.type) || 'objective', // objective, decision, branch, gate, completion
        status: 'available', // available, active, completed, failed, locked
        prerequisites: uniq(i.prerequisites), // node ids that must complete first
        unlocks: uniq(i.unlocks), // node ids this unlocks
        conditions: obj(i.conditions), // dynamic conditions to become available
        optional: i.optional === true,
        depth: clamp(i.depth ?? 0, 0, 50),
        choiceOutcome: text(i.choiceOutcome) || null,
        createdAt: now()
      };
      questNodes.set(id, node);
      return node;
    }

    function linkQuestNodes(fromId, toId) {
      const from = questNodes.get(fromId);
      const to = questNodes.get(toId);
      if (!from || !to) return { ok: false, reason: 'node-not-found' };
      if (!from.unlocks.includes(toId)) from.unlocks.push(toId);
      if (!to.prerequisites.includes(fromId)) to.prerequisites.push(fromId);
      return { ok: true };
    }

    function evaluateQuestGraph(questId, completedNodeIds) {
      const completed = new Set(arr(completedNodeIds));
      const nodes = Array.from(questNodes.values()).filter(n => n.questId === questId);
      const available = [];
      const locked = [];
      const done = [];
      for (const node of nodes) {
        if (completed.has(node.id)) { done.push(node.id); continue; }
        const prereqsMet = node.prerequisites.every(p => completed.has(p));
        if (prereqsMet) available.push(node.id);
        else locked.push(node.id);
      }
      const allComplete = nodes.length > 0 && done.length === nodes.length;
      return {
        ok: true,
        questId,
        totalNodes: nodes.length,
        completed: done.length,
        available,
        locked,
        availableCount: available.length,
        lockedCount: locked.length,
        allComplete
      };
    }

    function getQuestGraph(questId) {
      return Array.from(questNodes.values()).filter(n => n.questId === questId);
    }

    // RPG-15-13: World history atlas
    function addAtlasEntry(input) {
      const i = obj(input);
      const id = i.id || stableId('atlas', nextId());
      const entry = {
        id,
        title: text(i.title) || 'Historical Entry',
        epoch: ATLAS_EPOCHS.includes(i.epoch) ? i.epoch : 'ageless',
        yearLabel: text(i.yearLabel) || null,
        category: text(i.category) || 'event', // event, figure, place, artifact, cataclysm, founding
        description: text(i.description) || '',
        locationIds: uniq(i.locationIds),
        characterIds: uniq(i.characterIds),
        factionIds: uniq(i.factionIds),
        relatedEntries: uniq(i.relatedEntries),
        significance: clamp(i.significance ?? 5, 1, 10), // 1-10 impact
        public: i.public !== false, // known to common folk
        spoilerLevel: clamp(i.spoilerLevel ?? 0, 0, 3),
        createdAt: now()
      };
      atlasEntries.set(id, entry);
      return entry;
    }

    function getAtlas(filter) {
      const f = obj(filter);
      let result = Array.from(atlasEntries.values());
      if (f.epoch) result = result.filter(e => e.epoch === f.epoch);
      if (f.category) result = result.filter(e => e.category === f.category);
      if (f.locationId) result = result.filter(e => e.locationIds.includes(f.locationId));
      if (f.maxSpoilerLevel != null) result = result.filter(e => e.spoilerLevel <= f.maxSpoilerLevel);
      if (f.publicOnly) result = result.filter(e => e.public);
      return result.sort((a, b) => b.significance - a.significance);
    }

    function getTimelineChronology() {
      const order = ATLAS_EPOCHS;
      const byEpoch = {};
      for (const e of order) byEpoch[e] = [];
      for (const entry of atlasEntries.values()) {
        if (byEpoch[entry.epoch]) byEpoch[entry.epoch].push({ id: entry.id, title: entry.title, significance: entry.significance });
      }
      for (const e of order) byEpoch[e].sort((a, b) => b.significance - a.significance);
      return order.map(epoch => ({ epoch, entries: byEpoch[epoch], count: byEpoch[epoch].length }));
    }

    function linkAtlasEntries(fromId, toId, relation) {
      const from = atlasEntries.get(fromId);
      const to = atlasEntries.get(toId);
      if (!from || !to) return { ok: false, reason: 'entry-not-found' };
      const rel = text(relation) || 'related';
      if (!from.relatedEntries.includes(toId)) from.relatedEntries.push(`${rel}:${toId}`);
      return { ok: true };
    }

    // RPG-15-14: Campaign analytics
    function recordAnalytics(input) {
      const i = obj(input);
      const event = {
        id: stableId('ana', nextId()),
        type: text(i.type) || 'event', // turn, choice, combat, travel, session-start, session-end, save, load
        sessionId: text(i.sessionId) || null,
        worldId: text(i.worldId) || null,
        actorId: text(i.actorId) || null,
        data: obj(i.data),
        timestamp: now()
      };
      analyticsEvents.push(event);
      if (analyticsEvents.length > 10000) analyticsEvents.shift();
      return event;
    }

    function getAnalyticsSummary(filter) {
      const f = obj(filter);
      let events = analyticsEvents;
      if (f.sessionId) events = events.filter(e => e.sessionId === f.sessionId);
      if (f.worldId) events = events.filter(e => e.worldId === f.worldId);
      const byType = {};
      for (const e of events) byType[e.type] = (byType[e.type] || 0) + 1;
      const sessions = uniq(events.map(e => e.sessionId).filter(Boolean));
      const worlds = uniq(events.map(e => e.worldId).filter(Boolean));
      return {
        totalEvents: events.length,
        byType,
        sessionCount: sessions.length,
        worldCount: worlds.length,
        firstEvent: events.length > 0 ? events[0].timestamp : null,
        lastEvent: events.length > 0 ? events[events.length - 1].timestamp : null
      };
    }

    function getEngagementMetrics(sessionId) {
      const events = sessionId ? analyticsEvents.filter(e => e.sessionId === sessionId) : analyticsEvents;
      const turns = events.filter(e => e.type === 'turn').length;
      const choices = events.filter(e => e.type === 'choice').length;
      const combats = events.filter(e => e.type === 'combat').length;
      const travels = events.filter(e => e.type === 'travel').length;
      const saves = events.filter(e => e.type === 'save').length;
      const activeSessions = uniq(events.map(e => e.sessionId).filter(Boolean)).length;
      // Simple engagement score
      const score = Math.min(100, turns * 2 + choices * 3 + combats * 5 + travels * 2);
      return {
        sessionId: sessionId || 'all',
        turns, choices, combats, travels, saves,
        activeSessions,
        engagementScore: score,
        avgTurnsPerSession: activeSessions > 0 ? Math.round(turns / activeSessions) : turns
      };
    }

    // RPG-15-15: Localized narrator voices optional
    function registerVoice(input) {
      const i = obj(input);
      const id = i.id || stableId('voice', nextId());
      const voice = {
        id,
        name: text(i.name) || 'Voice',
        language: text(i.language) || 'en',
        locale: text(i.locale) || 'en-US',
        engine: VOICE_ENGINES.includes(i.engine) ? i.engine : 'system',
        gender: text(i.gender) || 'neutral',
        accent: text(i.accent) || null,
        pitch: clamp(i.pitch ?? 1.0, 0.5, 2.0),
        rate: clamp(i.rate ?? 1.0, 0.5, 2.0),
        sampleText: text(i.sampleText) || null,
        sampleAssetId: text(i.sampleAssetId) || null,
        available: i.available !== false,
        optional: i.optional !== false, // narrator voices are optional
        quality: clamp(i.quality ?? 3, 1, 5),
        createdAt: now()
      };
      voiceCatalog.set(id, voice);
      return voice;
    }

    function findVoices(filter) {
      const f = obj(filter);
      let result = Array.from(voiceCatalog.values());
      if (f.language) result = result.filter(v => v.language === f.language);
      if (f.locale) result = result.filter(v => v.locale === f.locale);
      if (f.engine) result = result.filter(v => v.engine === f.engine);
      if (f.availableOnly) result = result.filter(v => v.available);
      return result.sort((a, b) => b.quality - a.quality);
    }

    function getNarratorVoice(language) {
      const lang = text(language) || 'en';
      const candidates = Array.from(voiceCatalog.values())
        .filter(v => (v.language === lang || v.locale.startsWith(lang)) && v.available);
      if (candidates.length === 0) return null;
      // Prefer highest quality narrator
      return clone(candidates.sort((a, b) => b.quality - a.quality)[0]);
    }

    function setVoiceAvailability(id, available) {
      const voice = voiceCatalog.get(id);
      if (!voice) return { ok: false, reason: 'voice-not-found' };
      voice.available = available === true;
      return { ok: true, voice: clone(voice) };
    }

    // Persistence seam: everything this manager keeps in closure scope.
    function exportState() {
      return {
        version: 1,
        counters: { id: idCounter },
        plugins: clone(mapsToPlain(plugins)),
        rumors: clone(mapsToPlain(rumors)),
        scenarioPacks: clone(mapsToPlain(scenarioPacks)),
        questNodes: clone(mapsToPlain(questNodes)),
        atlasEntries: clone(mapsToPlain(atlasEntries)),
        voiceCatalog: clone(mapsToPlain(voiceCatalog)),
        state: clone(mapsToPlain({ analyticsEvents, rngState }))
      };
    }

    function importState(data) {
      const d = obj(data);
      const restoredByKey = {
        plugins: restoreMap(plugins, obj(d.plugins)),
        rumors: restoreMap(rumors, obj(d.rumors)),
        scenarioPacks: restoreMap(scenarioPacks, obj(d.scenarioPacks)),
        questNodes: restoreMap(questNodes, obj(d.questNodes)),
        atlasEntries: restoreMap(atlasEntries, obj(d.atlasEntries)),
        voiceCatalog: restoreMap(voiceCatalog, obj(d.voiceCatalog))
      };
      const s = obj(d.state);
      analyticsEvents.length = 0;
      for (const e of arr(s.analyticsEvents)) analyticsEvents.push(e);
      restoredByKey.analyticsEvents = analyticsEvents.length;
      const restoredRng = Number(s.rngState);
      rngState = Number.isFinite(restoredRng) ? restoredRng : 987654321;
      idCounter = Math.max(idCounter, Number(obj(d.counters).id || 0));
      const restored = Object.values(restoredByKey).reduce((sum, n) => sum + n, 0);
      return { ok: true, restored, restoredByKey };
    }

    return {
      exportState, importState,
      PLUGIN_CAPABILITIES, RUMOR_TYPES, RUMOR_STATES, SCENARIO_TYPES,
      ATLAS_EPOCHS, VOICE_ENGINES,
      registerPlugin, hasCapability, sandboxCall, getPlugin, listPlugins, unregisterPlugin,
      createScenarioPack, installScenarioPack, uninstallScenarioPack, listScenarioPacks,
      seedRumor, spreadRumor, believeRumor, resolveRumor, getRumors,
      simulateNpcOffscreen,
      createQuestNode, linkQuestNodes, evaluateQuestGraph, getQuestGraph,
      addAtlasEntry, getAtlas, getTimelineChronology, linkAtlasEntries,
      recordAnalytics, getAnalyticsSummary, getEngagementMetrics,
      registerVoice, findVoices, getNarratorVoice, setVoiceAvailability,
      seedRng
    };
  }

  return { createAdvancedManager };
});
