(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgMemory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }
  function uniq(xs) { return Array.from(new Set(arr(xs).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))); }
  function stableId(prefix, n) { return prefix + '-' + String(n).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }
  function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).slice(0, 12); }

  const MEMORY_KINDS = Object.freeze([
    'Episodic', 'Semantic', 'Working', 'LongTerm', 'Relationship', 'Location', 'Quest', 'Character'
  ]);

  const SALIENCE_THRESHOLDS = Object.freeze({
    critical: 0.9,
    high: 0.7,
    medium: 0.4,
    low: 0.2
  });

  const FORGETTING_POLICY = Object.freeze({
    workingMaxAge: 1000 * 60 * 30,
    workingMaxSize: 50,
    episodicMaxPerCharacter: 200,
    semanticMaxPerWorld: 500,
    relationshipMaxPerPair: 100,
    locationMaxPerWorld: 100,
    questMaxPerWorld: 50,
    characterMaxPerWorld: 200,
    salienceDecayRate: 0.01,
    minSalienceForLongTerm: 0.3
  });

  function createMemoryManager(stateApi, runtime) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');
    if (!runtime || typeof runtime.createMemory !== 'function' || typeof runtime.commitMemory !== 'function' || typeof runtime.readMemory !== 'function') throw Error('SevenRuntime memory API required');

    const memoryStore = new Map();
    let eventCounter = 0;

    function scopeRef(worldId) { return 'rpg:' + worldId; }

    function estimateArabicTokens(text) {
      if (!text) return 0;
      const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
      const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
      const otherChars = text.length - arabicChars - latinChars;
      return Math.ceil(arabicChars / 1.5 + latinChars / 4 + otherChars / 3);
    }

    function estimateTokens(text) {
      if (!text) return 0;
      return Math.ceil(text.length / 3.5);
    }

    function computeSalience(event, state, characterId) {
      let score = 0.5;
      const char = state.characters?.[characterId];
      if (!char) return score;

      if (event.type === 'character.move' && event.payload?.characterId === characterId) score += 0.1;
      if (event.type === 'relationship.change' && (event.payload?.a === characterId || event.payload?.b === characterId)) score += 0.15;
      if (event.type === 'emotion.change' && event.payload?.characterId === characterId) score += 0.1;
      if (event.type === 'knowledge.learn' && event.payload?.characterId === characterId) score += 0.2;
      if (event.type === 'item.transfer' && (event.payload?.fromOwnerId === characterId || event.payload?.toOwnerId === characterId)) score += 0.1;
      if (event.type === 'quest.update' && event.payload?.questId && state.quests?.[event.payload.questId]?.ownerIds?.includes(characterId)) score += 0.15;
      if (event.type === 'canon.set' && event.payload?.id && char.knowledge?.[event.payload.id]) score += 0.25;
      if (event.type === 'world.set' && event.payload?.path?.[0] === 'flags') score += 0.1;

      return Math.min(1, score);
    }

    function createEpisodicMemory(state, characterId, event, salience) {
      return {
        kind: 'Episodic',
        scope: 'rpg',
        scopeRef: scopeRef(state.worldId),
        canonicalKey: 'episodic:' + characterId + ':' + event.id,
        content: JSON.stringify({
          characterId,
          eventId: event.id,
          eventType: event.type,
          summary: event.summary || '',
          payload: clone(event.payload),
          timestamp: event.at || now(),
          turn: state.turn,
          tick: state.timeline?.tick
        }),
        confidence: salience,
        sourceEventId: event.id,
        metadata: {
          characterId,
          eventType: event.type,
          salience,
          tags: ['episodic', event.type]
        }
      };
    }

    function createSemanticMemory(state, factId, fact, confidence) {
      return {
        kind: 'Semantic',
        scope: 'rpg',
        scopeRef: scopeRef(state.worldId),
        canonicalKey: 'semantic:' + factId,
        content: JSON.stringify({
          factId,
          value: fact.value,
          level: fact.level,
          public: fact.public,
          entityIds: fact.entityIds,
          tags: fact.tags
        }),
        confidence: confidence ?? fact.confidence ?? 1,
        sourceEventId: fact.sourceEventId,
        metadata: {
          factId,
          level: fact.level,
          public: fact.public,
          tags: ['semantic', 'world-fact'].concat(fact.tags || [])
        }
      };
    }

    function createWorkingMemory(state, characterId, context) {
      return {
        kind: 'Working',
        scope: 'rpg',
        scopeRef: scopeRef(state.worldId),
        canonicalKey: 'working:' + characterId + ':' + Date.now(),
        content: JSON.stringify({
          characterId,
          currentLocation: state.characters?.[characterId]?.locationId,
          activeGoals: arr(state.characters?.[characterId]?.goals).filter(g => g.status === 'active').map(g => g.id),
          currentEmotions: clone(state.characters?.[characterId]?.emotions),
          recentEvents: context?.recentEvents || [],
          turn: state.turn
        }),
        confidence: 0.8,
        sourceEventId: null,
        metadata: {
          characterId,
          turn: state.turn,
          tags: ['working', 'current-context'],
          expiresAt: new Date(Date.now() + FORGETTING_POLICY.workingMaxAge).toISOString()
        }
      };
    }

    function createLongTermMemory(state, characterId, semanticMemory, salience) {
      if (salience < FORGETTING_POLICY.minSalienceForLongTerm) return null;
      return {
        kind: 'LongTerm',
        scope: 'rpg',
        scopeRef: scopeRef(state.worldId),
        canonicalKey: 'longterm:' + characterId + ':' + semanticMemory.canonicalKey,
        content: semanticMemory.content,
        confidence: Math.min(1, (semanticMemory.confidence || 1) * salience),
        sourceEventId: semanticMemory.sourceEventId,
        metadata: {
          characterId,
          originalKind: 'Semantic',
          salience,
          consolidatedAt: now(),
          tags: ['longterm'].concat(semanticMemory.metadata?.tags || [])
        }
      };
    }

    function createRelationshipMemory(state, pairKey, relationship, eventId) {
      const rel = relationship || {};
      return {
        kind: 'Relationship',
        scope: 'rpg',
        scopeRef: scopeRef(state.worldId),
        canonicalKey: 'relationship:' + pairKey,
        content: JSON.stringify(clone(rel)),
        confidence: 1,
        sourceEventId: eventId,
        metadata: {
          pair: pairKey,
          dimensions: Object.keys(rel).filter(k => typeof rel[k] === 'number'),
          tags: ['relationship']
        }
      };
    }

    function createLocationMemory(state, locationId, location, eventId) {
      return {
        kind: 'Location',
        scope: 'rpg',
        scopeRef: scopeRef(state.worldId),
        canonicalKey: 'location:' + locationId,
        content: JSON.stringify({
          locationId,
          name: location?.name,
          description: location?.description,
          connections: location?.connections,
          flags: location?.flags
        }),
        confidence: 1,
        sourceEventId: eventId,
        metadata: {
          locationId,
          tags: ['location']
        }
      };
    }

    function createQuestMemory(state, questId, quest, eventId) {
      return {
        kind: 'Quest',
        scope: 'rpg',
        scopeRef: scopeRef(state.worldId),
        canonicalKey: 'quest:' + questId,
        content: JSON.stringify(clone(quest)),
        confidence: 1,
        sourceEventId: eventId,
        metadata: {
          questId,
          status: quest?.status,
          ownerIds: quest?.ownerIds,
          tags: ['quest', quest?.status].filter(Boolean)
        }
      };
    }

    function createCharacterMemory(state, characterId, character, eventId) {
      return {
        kind: 'Character',
        scope: 'rpg',
        scopeRef: scopeRef(state.worldId),
        canonicalKey: 'character:' + characterId,
        content: JSON.stringify({
          characterId,
          control: character?.control,
          identity: clone(character?.identity),
          locationId: character?.locationId,
          personality: clone(character?.personality),
          motivations: arr(character?.motivations),
          goals: arr(character?.goals).map(clone),
          fears: arr(character?.fears),
          voice: clone(character?.voice)
        }),
        confidence: 1,
        sourceEventId: eventId,
        metadata: {
          characterId,
          control: character?.control,
          tags: ['character', character?.control].filter(Boolean)
        }
      };
    }

    function deduplicate(memories) {
      const seen = new Map();
      const result = [];
      for (const mem of memories) {
        const key = mem.canonicalKey;
        const existing = seen.get(key);
        if (!existing) {
          seen.set(key, mem);
          result.push(mem);
        } else if (mem.confidence > existing.confidence) {
          seen.set(key, mem);
          const idx = result.indexOf(existing);
          if (idx >= 0) result[idx] = mem;
        }
      }
      return result;
    }

    function applyForgettingPolicy(memories, state) {
      const now = Date.now();
      const result = [];

      const episodicByChar = new Map();
      for (const mem of memories) {
        if (mem.kind === 'Episodic' && mem.metadata?.characterId) {
          const charId = mem.metadata.characterId;
          if (!episodicByChar.has(charId)) episodicByChar.set(charId, []);
          episodicByChar.get(charId).push(mem);
        }
      }
      const episodicToRemove = new Set();
      for (const [charId, epis] of episodicByChar) {
        if (epis.length > FORGETTING_POLICY.episodicMaxPerCharacter) {
          epis.sort((a, b) => (a.confidence || 0) - (b.confidence || 0));
          const toRemove = epis.slice(0, epis.length - FORGETTING_POLICY.episodicMaxPerCharacter);
          for (const m of toRemove) episodicToRemove.add(m.canonicalKey);
        }
      }

      const semanticMemories = memories.filter(m => m.kind === 'Semantic');
      const semanticToRemove = new Set();
      if (semanticMemories.length > FORGETTING_POLICY.semanticMaxPerWorld) {
        semanticMemories.sort((a, b) => (a.confidence || 0) - (b.confidence || 0));
        const toRemove = semanticMemories.slice(0, semanticMemories.length - FORGETTING_POLICY.semanticMaxPerWorld);
        for (const m of toRemove) semanticToRemove.add(m.canonicalKey);
      }

      for (const mem of memories) {
        const meta = mem.metadata || {};
        if (mem.kind === 'Working') {
          const expiresAt = meta.expiresAt ? new Date(meta.expiresAt).getTime() : 0;
          if (expiresAt && now > expiresAt) continue;
        }
        if (episodicToRemove.has(mem.canonicalKey)) continue;
        if (semanticToRemove.has(mem.canonicalKey)) continue;
        result.push(mem);
      }
      return result;
    }

    function extractMemoriesFromEvent(state, event) {
      const memories = [];
      const charIds = uniq([
        event.payload?.characterId,
        event.payload?.a,
        event.payload?.b,
        event.payload?.fromOwnerId,
        event.payload?.toOwnerId,
        event.actorId
      ].filter(Boolean));

      for (const charId of charIds) {
        if (!state.characters?.[charId]) continue;
        const salience = computeSalience(event, state, charId);

        if (salience >= SALIENCE_THRESHOLDS.low) {
          const episodic = createEpisodicMemory(state, charId, event, salience);
          memories.push(episodic);
        }

        if (salience >= SALIENCE_THRESHOLDS.medium) {
          const working = createWorkingMemory(state, charId, { recentEvents: [event] });
          memories.push(working);
        }
      }

      if (event.type === 'knowledge.learn' && event.payload?.factId) {
        const factId = event.payload.factId;
        const fact = state.canon?.entries?.[factId];
        if (fact) {
          const semantic = createSemanticMemory(state, factId, fact, fact.confidence);
          memories.push(semantic);
          if (event.payload.characterId) {
            const lt = createLongTermMemory(state, event.payload.characterId, semantic, fact.confidence);
            if (lt) memories.push(lt);
          }
        }
      }

      if (event.type === 'relationship.change' && event.payload?.a && event.payload?.b) {
        const pair = [event.payload.a, event.payload.b].sort().join('::');
        const rel = state.relationships?.[pair];
        if (rel) {
          memories.push(createRelationshipMemory(state, pair, rel, event.id));
        }
      }

      if (event.type === 'character.move' && event.payload?.toLocationId) {
        const loc = state.world?.locations?.[event.payload.toLocationId];
        if (loc) {
          memories.push(createLocationMemory(state, event.payload.toLocationId, loc, event.id));
        }
      }

      if (event.type === 'quest.update' && event.payload?.questId) {
        const quest = state.quests?.[event.payload.questId];
        if (quest) {
          memories.push(createQuestMemory(state, event.payload.questId, quest, event.id));
        }
      }

      if (event.type === 'character.set' && event.payload?.characterId) {
        const char = state.characters?.[event.payload.characterId];
        if (char) {
          memories.push(createCharacterMemory(state, event.payload.characterId, char, event.id));
        }
      }

      return memories;
    }

    function buildContextFromMemories(memories, options) {
      const opts = obj(options);
      const maxTokens = Math.max(500, Number(opts.maxTokens) || 4000);
      let tokens = 0;
      const result = {
        episodic: [],
        semantic: [],
        working: [],
        longterm: [],
        relationship: [],
        location: [],
        quest: [],
        character: [],
        _diagnostics: { totalTokens: 0, memoryCount: 0, bounded: true }
      };

      const priorityOrder = ['LongTerm', 'Episodic', 'Semantic', 'Quest', 'Relationship', 'Location', 'Character', 'Working'];

      for (const kind of priorityOrder) {
        const kindMemories = memories.filter(m => m.kind === kind).sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        for (const mem of kindMemories) {
          const memTokens = estimateTokens(mem.content);
          if (tokens + memTokens > maxTokens) {
            result._diagnostics.bounded = false;
            break;
          }
          tokens += memTokens;
          result[kind.toLowerCase()].push(mem);
        }
        if (!result._diagnostics.bounded) break;
      }

      result._diagnostics.totalTokens = tokens;
      result._diagnostics.memoryCount = Object.values(result).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      return result;
    }

    function recordMemoriesFromEvent(state, event) {
      const memories = extractMemoriesFromEvent(state, event);
      const deduped = deduplicate(memories);
      const filtered = applyForgettingPolicy(deduped, state);
      const committed = [];
      for (const mem of filtered) {
        const created = runtime.createMemory(mem.content, mem.kind, {
          id: mem.canonicalKey,
          scope: mem.scope,
          source: 'rpg',
          authority: 'derived'
        });
        if (runtime.commitMemory(created, 'CREATE')) {
          committed.push(mem);
        }
      }
      return committed;
    }

    function getCharacterMemories(state, characterId, kinds) {
      const memories = runtime.readMemory().objects.filter(o => o.scope === 'rpg' && o.metadata?.characterId === characterId);
      if (kinds && kinds.length) {
        return memories.filter(m => kinds.includes(m.type));
      }
      return memories;
    }

    function getWorldMemories(state, kinds) {
      const scopeRef = 'rpg:' + state.worldId;
      const memories = runtime.readMemory().objects.filter(o => o.scopeRef === scopeRef);
      if (kinds && kinds.length) {
        return memories.filter(m => kinds.includes(m.type));
      }
      return memories;
    }

    function getMemoryStats(state) {
      const memories = runtime.readMemory().objects.filter(o => o.scope === 'rpg' && o.scopeRef === scopeRef(state.worldId));
      const stats = { total: memories.length, byKind: {}, byCharacter: {}, totalTokens: 0 };
      for (const mem of memories) {
        stats.byKind[mem.type] = (stats.byKind[mem.type] || 0) + 1;
        const charId = mem.metadata?.characterId;
        if (charId) stats.byCharacter[charId] = (stats.byCharacter[charId] || 0) + 1;
        stats.totalTokens += estimateTokens(mem.content);
      }
      return stats;
    }

    function runMaintenance(state) {
      const allMemories = runtime.readMemory().objects.filter(o => o.scope === 'rpg' && o.scopeRef === scopeRef(state.worldId));
      const deduped = deduplicate(allMemories.map(m => ({
        canonicalKey: m.id,
        kind: m.type,
        content: m.content,
        confidence: m.confidence || 0,
        metadata: m.metadata
      })));
      const filtered = applyForgettingPolicy(deduped, state);

      const currentIds = new Set(allMemories.map(m => m.id));
      const keepIds = new Set(filtered.map(m => m.canonicalKey));
      for (const id of currentIds) {
        if (!keepIds.has(id)) {
          runtime.commitMemory({ id, type: 'DELETE' }, 'DELETE');
        }
      }
      return { pruned: currentIds.size - keepIds.size, remaining: keepIds.size };
    }

    return {
      MEMORY_KINDS,
      SALIENCE_THRESHOLDS,
      FORGETTING_POLICY,
      createEpisodicMemory,
      createSemanticMemory,
      createWorkingMemory,
      createLongTermMemory,
      createRelationshipMemory,
      createLocationMemory,
      createQuestMemory,
      createCharacterMemory,
      deduplicate,
      applyForgettingPolicy,
      extractMemoriesFromEvent,
      buildContextFromMemories,
      recordMemoriesFromEvent,
      getCharacterMemories,
      getWorldMemories,
      getMemoryStats,
      runMaintenance,
      estimateArabicTokens,
      estimateTokens
    };
  }

  return { createMemoryManager };
});