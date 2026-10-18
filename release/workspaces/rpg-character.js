(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgCharacter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }
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
  function uniq(xs) { return Array.from(new Set(arr(xs).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))); }
  function clamp(v, min, max) { v = Number(v); return Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : min; }
  function stableId(prefix, n) { return prefix + '-' + String(n).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }

  const CHARACTER_TYPES = Object.freeze(['player', 'npc', 'companion', 'villain', 'creature']);
  const TRAIT_CATEGORIES = Object.freeze(['physical', 'mental', 'social', 'moral', 'supernatural']);
  const DRIVE_TYPES = Object.freeze(['survival', 'power', 'knowledge', 'connection', 'freedom', 'duty', 'redemption', 'vengeance', 'curiosity', 'loyalty']);
  const GOAL_STATUSES = Object.freeze(['active', 'completed', 'failed', 'abandoned', 'paused']);
  const RELATIONSHIP_DIMENSIONS = Object.freeze(['trust', 'affection', 'respect', 'fear', 'loyalty', 'attraction', 'suspicion', 'rivalry', 'resentment', 'dependency', 'familiarity']);
  const REPUTATION_LEVELS = Object.freeze(['unknown', 'recognized', 'respected', 'famous', 'legendary', 'infamous']);
  const KNOWLEDGE_ACCESS = Object.freeze(['public', 'private', 'secret', 'forbidden', 'lost']);
  const SECRET_REVEAL_RULES = Object.freeze(['never', 'on_death', 'on_betrayal', 'on_trust_max', 'on_goal_complete', 'on_condition', 'manual']);
  const DIALOGUE_STYLES = Object.freeze(['formal', 'casual', 'archaic', 'terse', 'verbose', 'cryptic', 'blunt', 'diplomatic', 'sarcastic', 'melancholic', 'cheerful', 'aggressive', 'timid', 'wise', 'childlike']);

  function createCharacterManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const portraits = new Map();
    const dialogueStyles = new Map();
    let idCounter = 0;
    function nextId() { return ++idCounter; }

    function createCharacter(input) {
      const i = obj(input);
      const id = i.id || stableId('char', nextId());
      const type = CHARACTER_TYPES.includes(i.type) ? i.type : 'npc';
      const name = text(i.name) || 'Unnamed Character';
      const identity = obj(i.identity);
      const age = i.age != null ? Number(i.age) : null;
      const appearance = obj(i.appearance);
      const personality = obj(i.personality);
      const motivations = uniq(i.motivations);
      const goals = arr(i.goals).map(g => ({
        id: g.id || stableId('goal', nextId()),
        description: text(g.description),
        status: GOAL_STATUSES.includes(g.status) ? g.status : 'active',
        priority: clamp(g.priority || 0, -10, 10),
        progress: clamp(g.progress || 0, 0, 100),
        createdAt: now(),
        updatedAt: now(),
        completedAt: null
      }));
      const fears = uniq(i.fears);
      const preferences = obj(i.preferences);
      const abilities = uniq(i.abilities);
      const inventory = uniq(i.inventory);
      const locationId = text(i.locationId) || null;
      const emotions = obj(i.emotions);
      const secrets = uniq(i.secrets);
      const beliefs = obj(i.beliefs);
      const knowledge = obj(i.knowledge);
      const history = arr(i.history).slice(-256).map(clone);
      const promises = arr(i.promises).slice(-128).map(clone);
      const injuries = arr(i.injuries).map(clone);
      const status = text(i.status) || 'active';
      const loyalties = obj(i.loyalties);
      const opinions = obj(i.opinions);
      const voice = obj(i.voice);
      const control = i.control || 'ai';

      const character = {
        id, type, name, identity, age, appearance, personality,
        motivations, goals, fears, preferences,
        abilities, inventory, locationId, emotions,
        secrets, beliefs, knowledge, history, promises,
        injuries, status, loyalties, opinions, voice, control,
        createdAt: now(), updatedAt: now(), version: 1,
        traits: [], drives: [],
        relationships: (i.relationships && typeof i.relationships === 'object' && !Array.isArray(i.relationships))
          ? new Map(Object.entries(i.relationships).map(([k, v]) => [k, obj(v)]))
          : new Map(),
        reputation: { level: 'unknown', score: 0, factions: {}, titles: [] },
        factionAffinities: {},
        knowledgeBoundaries: {},
        portraitId: null,
        dialogueStyleId: null,
        motivationHistory: []
      };

      if (i.traits) addTraits(character, i.traits);
      if (i.drives) setDrives(character, i.drives);

      return character;
    }

    function addTraits(character, traits) {
      const t = arr(traits);
      for (const trait of t) {
        const category = TRAIT_CATEGORIES.includes(trait.category) ? trait.category : 'physical';
        character.traits.push({
          id: trait.id || stableId('trait', nextId()),
          name: text(trait.name),
          category,
          value: clamp(trait.value || 0, -5, 5),
          description: text(trait.description),
          source: text(trait.source) || 'innate',
          acquiredAt: now()
        });
      }
    }

    function setDrives(character, drives) {
      const d = arr(drives);
      character.drives = d.map(drive => ({
        type: DRIVE_TYPES.includes(drive.type) ? drive.type : 'survival',
        intensity: clamp(drive.intensity || 0.5, 0, 1),
        description: text(drive.description),
        source: text(drive.source) || 'backstory'
      }));
    }

    function evolveMotivation(character, goalId, newDescription, reason) {
      const goal = character.goals.find(g => g.id === goalId);
      if (!goal) return { ok: false, reason: 'goal-not-found' };
      character.motivationHistory.push({
        goalId,
        oldDescription: goal.description,
        newDescription: text(newDescription),
        reason: text(reason),
        timestamp: now()
      });
      goal.description = text(newDescription);
      goal.updatedAt = now();
      character.updatedAt = now();
      character.version++;
      return { ok: true, goal };
    }

    function updateGoalProgress(character, goalId, progress) {
      const goal = character.goals.find(g => g.id === goalId);
      if (!goal) return { ok: false, reason: 'goal-not-found' };
      goal.progress = clamp(progress, 0, 100);
      if (goal.progress >= 100 && goal.status === 'active') {
        goal.status = 'completed';
        goal.completedAt = now();
      }
      goal.updatedAt = now();
      character.updatedAt = now();
      character.version++;
      return { ok: true, goal };
    }

    function addMemory(character, memory) {
      const m = obj(memory);
      character.history.push({
        id: stableId('mem', nextId()),
        type: text(m.type) || 'event',
        description: text(m.description),
        timestamp: m.timestamp || now(),
        participants: uniq(m.participants),
        location: text(m.location),
        emotionalImpact: obj(m.emotionalImpact),
        importance: clamp(m.importance || 0.5, 0, 1),
        tags: uniq(m.tags)
      });
      character.history = character.history.slice(-256);
      character.updatedAt = now();
      character.version++;
      return { ok: true };
    }

    function getMemories(character, filter) {
      const f = obj(filter);
      let result = character.history;
      if (f.type) result = result.filter(m => m.type === f.type);
      if (f.since) result = result.filter(m => m.timestamp && m.timestamp >= f.since);
      if (f.until) result = result.filter(m => m.timestamp && m.timestamp <= f.until);
      if (f.tag) result = result.filter(m => arr(m.tags).includes(f.tag));
      return result.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    }

    function setRelationship(character, targetId, dimensions, event) {
      const rel = character.relationships.get(targetId) || {};
      for (const k of RELATIONSHIP_DIMENSIONS) {
        rel[k] = clamp((rel[k] || 0) + (dimensions[k] || 0), -1, 1);
      }
      rel.events = arr(rel.events).concat({
        id: stableId('rel', nextId()),
        timestamp: now(),
        reason: text(event?.reason),
        delta: clone(dimensions)
      }).slice(-128);
      rel.lastInteraction = now();
      character.relationships.set(targetId, rel);
      character.updatedAt = now();
      character.version++;
      return { ok: true, relationship: rel };
    }

    function getRelationship(character, targetId) {
      return character.relationships.get(targetId) || null;
    }

    function getAllRelationships(character) {
      return Object.fromEntries(character.relationships);
    }

    function getTrustMetric(character, targetId) {
      const rel = character.relationships.get(targetId);
      return rel ? rel.trust : 0;
    }

    function updateReputation(character, delta, factionId, reason) {
      character.reputation.score = clamp(character.reputation.score + (delta || 0), -1000, 1000);
      const levels = ['infamous', 'unknown', 'recognized', 'respected', 'famous', 'legendary'];
      const idx = Math.floor((character.reputation.score + 1000) / 2000 * (levels.length - 1));
      character.reputation.level = levels[clamp(idx, 0, levels.length - 1)];
      if (factionId) {
        character.reputation.factions[factionId] = clamp((character.reputation.factions[factionId] || 0) + (delta || 0), -100, 100);
      }
      if (reason) {
        character.reputation.titles.push({ title: text(reason), timestamp: now() });
        character.reputation.titles = character.reputation.titles.slice(-10);
      }
      character.updatedAt = now();
      character.version++;
      return { ok: true, reputation: character.reputation };
    }

    function setFactionAffinity(character, factionId, affinity, reason) {
      character.factionAffinities[factionId] = clamp(affinity, -1, 1);
      if (reason) {
        character.history.push({
          id: stableId('mem', nextId()),
          type: 'faction_change',
          description: `Faction affinity with ${factionId} changed: ${reason}`,
          timestamp: now(),
          importance: 0.7,
          tags: ['faction', factionId]
        });
      }
      character.updatedAt = now();
      character.version++;
      return { ok: true, affinity: character.factionAffinities[factionId] };
    }

    function getFactionAffinity(character, factionId) {
      return character.factionAffinities[factionId] ?? 0;
    }

    function setKnowledgeBoundary(character, factId, accessLevel, conditions) {
      const level = KNOWLEDGE_ACCESS.includes(accessLevel) ? accessLevel : 'private';
      character.knowledgeBoundaries[factId] = {
        access: level,
        conditions: obj(conditions),
        setAt: now(),
        setBy: 'gm'
      };
      character.updatedAt = now();
      character.version++;
      return { ok: true, boundary: character.knowledgeBoundaries[factId] };
    }

    function checkKnowledgeAccess(character, factId, requester) {
      const boundary = character.knowledgeBoundaries[factId];
      if (!boundary) return { allowed: true, reason: 'no-boundary' };
      if (boundary.access === 'public') return { allowed: true, reason: 'public' };
      if (boundary.access === 'forbidden') return { allowed: false, reason: 'forbidden' };
      if (boundary.access === 'lost') return { allowed: false, reason: 'lost' };
      if (boundary.access === 'secret') {
        const trust = requester ? getTrustMetric(character, requester) : 0;
        return { allowed: trust > 0.8, reason: trust > 0.8 ? 'high-trust' : 'insufficient-trust', trust };
      }
      return { allowed: false, reason: 'private' };
    }

    function setSecretRevealRule(character, secretId, rule, condition) {
      const r = SECRET_REVEAL_RULES.includes(rule) ? rule : 'never';
      if (!character.secrets.includes(secretId)) return { ok: false, reason: 'not-a-secret' };
      character.knowledgeBoundaries[secretId] = {
        ...character.knowledgeBoundaries[secretId],
        access: 'secret',
        revealRule: r,
        revealCondition: obj(condition)
      };
      character.updatedAt = now();
      character.version++;
      return { ok: true, boundary: character.knowledgeBoundaries[secretId] };
    }

    function checkSecretReveal(character, secretId, context) {
      const boundary = character.knowledgeBoundaries[secretId];
      if (!boundary || boundary.access !== 'secret') return { allowed: false, reason: 'not-a-secret' };
      const rule = boundary.revealRule;
      if (rule === 'never') return { allowed: false, reason: 'never-reveal' };
      if (rule === 'manual') return { allowed: false, reason: 'manual-only' };
      if (rule === 'on_death' && context?.characterDead) return { allowed: true, reason: 'death-reveal' };
      if (rule === 'on_betrayal' && context?.betrayed) return { allowed: true, reason: 'betrayal-reveal' };
      if (rule === 'on_trust_max') {
        const trust = context?.trust || 0;
        return { allowed: trust >= 1, reason: trust >= 1 ? 'max-trust' : 'insufficient-trust' };
      }
      if (rule === 'on_goal_complete' && context?.goalCompleted) return { allowed: true, reason: 'goal-complete' };
      if (rule === 'on_condition') {
        const cond = boundary.revealCondition;
        return { allowed: !!cond && !!context?.[cond.key], reason: 'condition-met' };
      }
      return { allowed: false, reason: 'conditions-not-met' };
    }

    function setPortrait(character, portrait) {
      const p = obj(portrait);
      const id = p.id || stableId('portrait', nextId());
      const record = {
        id, characterId: character.id,
        imageUrl: text(p.imageUrl),
        thumbnailUrl: text(p.thumbnailUrl),
        artist: text(p.artist),
        style: text(p.style),
        variant: text(p.variant),
        metadata: obj(p.metadata),
        createdAt: now()
      };
      portraits.set(id, record);
      character.portraitId = id;
      character.updatedAt = now();
      character.version++;
      return { ok: true, portrait: record };
    }

    function getPortrait(character) {
      return character.portraitId ? portraits.get(character.portraitId) : null;
    }

    function setDialogueStyle(character, style) {
      const s = obj(style);
      const id = s.id || stableId('dialogue', nextId());
      const baseStyle = DIALOGUE_STYLES.includes(s.style) ? s.style : 'casual';
      const record = {
        id, characterId: character.id,
        style: baseStyle,
        vocabulary: text(s.vocabulary),
        sentenceLength: text(s.sentenceLength),
        humor: text(s.humor),
        formality: text(s.formality),
        recurringExpressions: uniq(s.recurringExpressions),
        culturalBackground: text(s.culturalBackground),
        emotionalExpressionStyle: text(s.emotionalExpressionStyle),
        customRules: arr(s.customRules),
        createdAt: now()
      };
      dialogueStyles.set(id, record);
      character.dialogueStyleId = id;
      character.updatedAt = now();
      character.version++;
      return { ok: true, style: record };
    }

    function getDialogueStyle(character) {
      return character.dialogueStyleId ? dialogueStyles.get(character.dialogueStyleId) : null;
    }

    function formatDialogue(character, text) {
      const style = getDialogueStyle(character);
      if (!style) return text;
      let result = text;
      if (style.recurringExpressions.length && Math.random() < 0.3) {
        const expr = style.recurringExpressions[Math.floor(Math.random() * style.recurringExpressions.length)];
        result = expr + ' ' + result;
      }
      return result;
    }

    function exportCharacter(character) {
      const c = clone(character);
      // Serialize the relationships Map to a plain object so export/import round-trips preserve it.
      c.relationships = Object.fromEntries(character.relationships);
      return c;
    }

    function importCharacter(data, options) {
      const d = obj(data);
      const char = createCharacter(d);
      if (options?.portraitId) {
        const p = portraits.get(options.portraitId);
        if (p) char.portraitId = options.portraitId;
      }
      if (options?.dialogueStyleId) {
        const s = dialogueStyles.get(options.dialogueStyleId);
        if (s) char.dialogueStyleId = options.dialogueStyleId;
      }
      return char;
    }

    function getCharacterSummary(character) {
      return {
        id: character.id,
        name: character.name,
        type: character.type,
        status: character.status,
        locationId: character.locationId,
        goals: character.goals.filter(g => g.status === 'active').length,
        fears: character.fears.length,
        traits: character.traits.length,
        drives: character.drives.length,
        relationships: character.relationships.size,
        reputation: character.reputation.level,
        reputationScore: character.reputation.score,
        factionCount: Object.keys(character.factionAffinities).length,
        secrets: character.secrets.length,
        knowledgeBoundaries: Object.keys(character.knowledgeBoundaries).length,
        hasPortrait: !!character.portraitId,
        hasDialogueStyle: !!character.dialogueStyleId,
        version: character.version,
        updatedAt: character.updatedAt
      };
    }

    function normalizeVoice(v) {
      const o = obj(v);
      return {
        vocabulary: text(o.vocabulary),
        sentenceLength: text(o.sentenceLength),
        humor: text(o.humor),
        formality: text(o.formality),
        recurringExpressions: uniq(o.recurringExpressions),
        culturalBackground: text(o.culturalBackground),
        emotionalExpressionStyle: text(o.emotionalExpressionStyle)
      };
    }

    return {
      CHARACTER_TYPES, TRAIT_CATEGORIES, DRIVE_TYPES, GOAL_STATUSES,
      RELATIONSHIP_DIMENSIONS, REPUTATION_LEVELS, KNOWLEDGE_ACCESS,
      SECRET_REVEAL_RULES, DIALOGUE_STYLES,
      createCharacter,
      addTraits, setDrives,
      evolveMotivation, updateGoalProgress,
      addMemory, getMemories,
      setRelationship, getRelationship, getAllRelationships, getTrustMetric,
      updateReputation,
      setFactionAffinity, getFactionAffinity,
      setKnowledgeBoundary, checkKnowledgeAccess,
      setSecretRevealRule, checkSecretReveal,
      setPortrait, getPortrait,
      setDialogueStyle, getDialogueStyle, formatDialogue,
      exportCharacter, importCharacter,
      getCharacterSummary,
      normalizeVoice,
      exportState, importState
    };

    function exportState() {
      return {
        version: 1,
        counters: { id: idCounter },
        portraits: clone(mapsToPlain(Object.fromEntries(portraits))),
        dialogueStyles: clone(mapsToPlain(Object.fromEntries(dialogueStyles)))
      };
    }

    function importState(data) {
      const d = obj(data);
      portraits.clear();
      for (const [k, v] of Object.entries(obj(d.portraits))) portraits.set(k, plainToMaps(v));
      dialogueStyles.clear();
      for (const [k, v] of Object.entries(obj(d.dialogueStyles))) dialogueStyles.set(k, plainToMaps(v));
      idCounter = Math.max(idCounter, Number(obj(d.counters).id || 0));
      return { ok: true, restored: portraits.size + dialogueStyles.size };
    }
  }

  return { createCharacterManager };
});