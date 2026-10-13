(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgWorldManager = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  let idCounter = 0;
  function nextId() { return ++idCounter; }

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }
  function uniq(xs) { return Array.from(new Set(arr(xs).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))); }
  function stableId(prefix) { return prefix + '-' + String(nextId()).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }
  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  const WORLD_TEMPLATES = {
    fantasy: {
      id: 'fantasy', name: 'Classic Fantasy', description: 'Swords, sorcery, and ancient kingdoms',
      genres: ['fantasy', 'adventure'], tone: 'heroic', difficulty: 'normal',
      startingLocation: { name: 'Border Town', type: 'settlement' },
      worldRules: [
        { type: 'magic', scope: 'global', priority: 50, name: 'Magic Exists', effect: { type: 'set', target: 'world', path: 'magicEnabled', value: true } },
        { type: 'combat', scope: 'global', priority: 40, name: 'Heroic Combat', effect: { type: 'modify', target: 'world', path: 'combatLethality', value: 0.7, operator: '=' } }
      ],
      suggestedArchetypes: ['hero_journey', 'exploration', 'political_intrigue'],
      defaultNPCs: [
        { name: 'Village Elder', role: 'quest_giver', disposition: 'friendly' },
        { name: 'Mysterious Stranger', role: 'mentor', disposition: 'neutral' }
      ]
    },
    scifi: {
      id: 'scifi', name: 'Sci-Fi Space Opera', description: 'Starships, aliens, and galactic empires',
      genres: ['sci-fi', 'space'], tone: 'epic', difficulty: 'normal',
      startingLocation: { name: 'Space Station Alpha', type: 'station' },
      worldRules: [
        { type: 'physics', scope: 'global', priority: 60, name: 'FTL Travel', effect: { type: 'set', target: 'world', path: 'ftlEnabled', value: true } },
        { type: 'technology', scope: 'global', priority: 50, name: 'Advanced Tech', effect: { type: 'set', target: 'world', path: 'techLevel', value: 'advanced' } }
      ],
      suggestedArchetypes: ['exploration', 'political_intrigue', 'survival'],
      defaultNPCs: [
        { name: 'Station Commander', role: 'authority', disposition: 'professional' },
        { name: 'Rogue Trader', role: 'merchant', disposition: 'shady' }
      ]
    },
    horror: {
      id: 'horror', name: 'Gothic Horror', description: 'Dark secrets, ancient curses, and creeping dread',
      genres: ['horror', 'mystery'], tone: 'grim', difficulty: 'hard',
      startingLocation: { name: 'Isolated Village', type: 'settlement' },
      worldRules: [
        { type: 'magic', scope: 'global', priority: 70, name: 'Corrupting Magic', effect: { type: 'set', target: 'world', path: 'corruptionEnabled', value: true } },
        { type: 'combat', scope: 'global', priority: 60, name: 'Lethal Encounters', effect: { type: 'modify', target: 'world', path: 'combatLethality', value: 1.5, operator: '=' } }
      ],
      suggestedArchetypes: ['mystery', 'survival', 'tragedy'],
      defaultNPCs: [
        { name: 'Local Priest', role: 'informant', disposition: 'worried' },
        { name: 'Wandering Hunter', role: 'ally', disposition: 'grim' }
      ]
    },
    cyberpunk: {
      id: 'cyberpunk', name: 'Cyberpunk Dystopia', description: 'Neon streets, corporate wars, and chrome souls',
      genres: ['cyberpunk', 'noir'], tone: 'gritty', difficulty: 'hard',
      startingLocation: { name: 'Neo-Shanghai Sector', type: 'city' },
      worldRules: [
        { type: 'technology', scope: 'global', priority: 60, name: 'Cybernetics', effect: { type: 'set', target: 'world', path: 'cyberneticsEnabled', value: true } },
        { type: 'economy', scope: 'global', priority: 50, name: 'Corporate Control', effect: { type: 'set', target: 'world', path: 'corporateControl', value: 0.8 } }
      ],
      suggestedArchetypes: ['noir', 'political_intrigue', 'survival'],
      defaultNPCs: [
        { name: 'Fixer', role: 'contact', disposition: 'professional' },
        { name: 'Corporate Spy', role: 'antagonist', disposition: 'cold' }
      ]
    },
    postapoc: {
      id: 'postapoc', name: 'Post-Apocalyptic Wasteland', description: 'Scavenging, survival, and rebuilding civilization',
      genres: ['post-apocalyptic', 'survival'], tone: 'bleak', difficulty: 'hard',
      startingLocation: { name: 'Bunker Outpost', type: 'bunker' },
      worldRules: [
        { type: 'physics', scope: 'global', priority: 50, name: 'Scarcity', effect: { type: 'set', target: 'world', path: 'resourceScarcity', value: 0.9 } },
        { type: 'combat', scope: 'global', priority: 60, name: 'Brutal Survival', effect: { type: 'modify', target: 'world', path: 'combatLethality', value: 1.3, operator: '=' } }
      ],
      suggestedArchetypes: ['survival', 'exploration', 'redemption'],
      defaultNPCs: [
        { name: 'Scavenger Leader', role: 'leader', disposition: 'cautious' },
        { name: 'Wasteland Doctor', role: 'healer', disposition: 'weary' }
      ]
    }
  };

  const DIFFICULTY_PROFILES = {
    easy: { name: 'Storyteller', description: 'Focus on narrative, minimal challenge', combatLethality: 0.5, resourceAbundance: 1.5, xpMultiplier: 1.5, deathPenalty: 'none', hintsEnabled: true },
    normal: { name: 'Adventurer', description: 'Balanced challenge and story', combatLethality: 1.0, resourceAbundance: 1.0, xpMultiplier: 1.0, deathPenalty: 'minor', hintsEnabled: true },
    hard: { name: 'Veteran', description: 'Significant challenge, tactical play required', combatLethality: 1.5, resourceAbundance: 0.7, xpMultiplier: 0.8, deathPenalty: 'moderate', hintsEnabled: false },
    deadly: { name: 'Ironman', description: 'Permadeath, extreme scarcity, no mercy', combatLethality: 2.0, resourceAbundance: 0.3, xpMultiplier: 0.5, deathPenalty: 'permadeath', hintsEnabled: false }
  };

  const TONE_PROFILES = {
    heroic: { name: 'Heroic', description: 'Epic deeds, clear morality, triumph of good', narrativeWeight: { heroic: 1.0, gritty: 0.0, comedic: 0.2, mysterious: 0.3 } },
    gritty: { name: 'Gritty', description: 'Moral ambiguity, consequences, scars remain', narrativeWeight: { heroic: 0.2, gritty: 1.0, comedic: 0.1, mysterious: 0.4 } },
    comedic: { name: 'Comedic', description: 'Lighthearted, absurd, fourth-wall breaks', narrativeWeight: { heroic: 0.3, gritty: 0.1, comedic: 1.0, mysterious: 0.2 } },
    mysterious: { name: 'Mysterious', description: 'Secrets, uncertainty, unreliable narrators', narrativeWeight: { heroic: 0.2, gritty: 0.3, comedic: 0.1, mysterious: 1.0 } },
    horror: { name: 'Horror', description: 'Fear, helplessness, cosmic indifference', narrativeWeight: { heroic: 0.1, gritty: 0.5, comedic: 0.0, mysterious: 0.8 } },
    whimsical: { name: 'Whimsical', description: 'Fairy-tale logic, wonder, capricious magic', narrativeWeight: { heroic: 0.4, gritty: 0.0, comedic: 0.5, mysterious: 0.6 } }
  };

  function createWorldManager(stateApi, templateApi, rulesApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const worlds = new Map();
    const activeWorldId = null;

    const defaultTemplates = clone(WORLD_TEMPLATES);
    const templates = new Map(Object.entries(defaultTemplates));

    function createWorld(input) {
      const i = obj(input);
      const id = i.id || stableId('world');
      const name = text(i.name) || 'Unnamed World';
      const templateId = text(i.templateId);
      const template = templateId ? templates.get(templateId) : null;

      let worldData = {
        id, name, templateId: templateId || null,
        createdAt: now(), updatedAt: now(), version: 1,
        status: 'draft',
        locations: {}, characters: {}, factions: {}, quests: {},
        worldState: { flags: {}, timeline: { tick: 0 }, economy: {}, politics: {} },
        rules: [], ruleRegistry: {},
        difficulty: text(i.difficulty) || (template?.difficulty || 'normal'),
        tone: text(i.tone) || (template?.tone || 'heroic'),
        metadata: obj(i.metadata)
      };

      if (template) {
        worldData.rules = clone(template.worldRules || []);
        worldData.worldState.locations = clone(template.startingLocation ? { [template.startingLocation.name]: template.startingLocation } : {});
        if (template.defaultNPCs) {
          template.defaultNPCs.forEach((npc, idx) => {
            const npcId = stableId('npc');
            worldData.characters[npcId] = { id: npcId, ...npc, locationId: template.startingLocation?.name || 'start' };
          });
        }
      }

      if (i.difficulty) worldData.difficulty = i.difficulty;
      if (i.tone) worldData.tone = i.tone;
      if (i.rules) worldData.rules = arr(i.rules);
      if (i.worldState) worldData.worldState = { ...worldData.worldState, ...obj(i.worldState) };

      worlds.set(id, worldData);
      return worldData;
    }

    function createFromTemplate(templateId, overrides) {
      const template = templates.get(templateId);
      if (!template) return { ok: false, reason: 'template-not-found' };
      const world = createWorld({ templateId, ...overrides });
      return { ok: true, world };
    }

    function getWorld(id) {
      return worlds.get(id);
    }

    function getAllWorlds() {
      return Array.from(worlds.values());
    }

    function updateWorld(id, updates) {
      const world = worlds.get(id);
      if (!world) return { ok: false, reason: 'not-found' };
      const next = clone(world);
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'createdAt' && key !== 'version') {
          next[key] = value;
        }
      }
      next.updatedAt = now();
      next.version = (world.version || 1) + 1;
      worlds.set(id, next);
      return { ok: true, world: next };
    }

    function deleteWorld(id) {
      return worlds.delete(id);
    }

    function archiveWorld(id) {
      const world = worlds.get(id);
      if (!world) return { ok: false, reason: 'not-found' };
      const next = clone(world);
      next.status = 'archived';
      next.archivedAt = now();
      next.updatedAt = now();
      next.version = (world.version || 1) + 1;
      worlds.set(id, next);
      return { ok: true, world: next };
    }

    function restoreWorld(id) {
      const world = worlds.get(id);
      if (!world) return { ok: false, reason: 'not-found' };
      const next = clone(world);
      next.status = 'active';
      next.restoredAt = now();
      next.updatedAt = now();
      next.version = (world.version || 1) + 1;
      worlds.set(id, next);
      return { ok: true, world: next };
    }

    function exportWorld(id) {
      const world = worlds.get(id);
      if (!world) return { ok: false, reason: 'not-found' };
      return { ok: true, data: clone(world) };
    }

    function importWorld(data, overwrite) {
      const i = obj(data);
      if (!i.id || !i.name) return { ok: false, reason: 'invalid-world-data' };
      if (worlds.has(i.id) && !overwrite) return { ok: false, reason: 'world-exists' };
      const world = clone(i);
      world.importedAt = now();
      worlds.set(i.id, world);
      return { ok: true, world };
    }

    function getWorldSummary(id) {
      const world = worlds.get(id);
      if (!world) return null;
      return {
        id: world.id, name: world.name, templateId: world.templateId,
        status: world.status, difficulty: world.difficulty, tone: world.tone,
        locationCount: Object.keys(world.worldState.locations || {}).length,
        characterCount: Object.keys(world.characters || {}).length,
        factionCount: Object.keys(world.factions || {}).length,
        questCount: Object.keys(world.quests || {}).length,
        ruleCount: world.rules.length,
        createdAt: world.createdAt, updatedAt: world.updatedAt
      };
    }

    function getWorldStats() {
      const all = Array.from(worlds.values());
      return {
        total: all.length,
        active: all.filter(w => w.status === 'active').length,
        archived: all.filter(w => w.status === 'archived').length,
        draft: all.filter(w => w.status === 'draft').length,
        byTemplate: all.reduce((acc, w) => { acc[w.templateId || 'custom'] = (acc[w.templateId || 'custom'] || 0) + 1; return acc; }, {}),
        byDifficulty: all.reduce((acc, w) => { acc[w.difficulty] = (acc[w.difficulty] || 0) + 1; return acc; }, {}),
        byTone: all.reduce((acc, w) => { acc[w.tone] = (acc[w.tone] || 0) + 1; return acc; }, {})
      };
    }

    function registerTemplate(template) {
      const t = obj(template);
      if (!t.id) t.id = stableId('template');
      if (!t.name) t.name = 'Unnamed Template';
      templates.set(t.id, t);
      return t;
    }

    function getTemplate(id) {
      return templates.get(id);
    }

    function getAllTemplates() {
      return Array.from(templates.values());
    }

    function getDifficultyProfile(id) {
      return DIFFICULTY_PROFILES[id] || DIFFICULTY_PROFILES.normal;
    }

    function getToneProfile(id) {
      return TONE_PROFILES[id] || TONE_PROFILES.heroic;
    }

    function setWorldDifficulty(worldId, difficultyId) {
      const profile = DIFFICULTY_PROFILES[difficultyId];
      if (!profile) return { ok: false, reason: 'invalid-difficulty' };
      return updateWorld(worldId, { difficulty: difficultyId, ...profile });
    }

    function setWorldTone(worldId, toneId) {
      const profile = TONE_PROFILES[toneId];
      if (!profile) return { ok: false, reason: 'invalid-tone' };
      return updateWorld(worldId, { tone: toneId, ...profile });
    }

    // ---- Roadmap-aligned foundation capabilities ----

    // RPG-02-05: World delete with confirmation — destructive deletes require an
    // explicit confirmation token first; deleting without confirming is refused.
    const pendingDeletes = new Map();

    function requestDeleteWorld(id) {
      const world = worlds.get(id);
      if (!world) return { ok: false, reason: 'not-found' };
      const token = stableId('del');
      pendingDeletes.set(id, {
        token,
        worldId: id,
        worldName: world.name,
        createdAt: now(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });
      return {
        ok: true,
        requiresConfirmation: true,
        token,
        worldId: id,
        worldName: world.name,
        // The confirmation prompt the UI must show before proceeding
        confirmation: {
          message: 'Delete world "' + world.name + '"? This cannot be undone.',
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
          destructive: true
        }
      };
    }

    function confirmDeleteWorld(id, token) {
      const pending = pendingDeletes.get(id);
      if (!pending) return { ok: false, reason: 'no-pending-delete' };
      if (pending.token !== token) return { ok: false, reason: 'invalid-token' };
      if (pending.expiresAt < new Date().toISOString()) {
        pendingDeletes.delete(id);
        return { ok: false, reason: 'confirmation-expired' };
      }
      const world = worlds.get(id);
      if (!world) { pendingDeletes.delete(id); return { ok: false, reason: 'not-found' }; }
      worlds.delete(id);
      pendingDeletes.delete(id);
      return { ok: true, deleted: true, worldId: id, worldName: world.name };
    }

    function cancelDeleteWorld(id) {
      return { ok: pendingDeletes.delete(id) };
    }

    function getPendingDeletes() {
      return Array.from(pendingDeletes.values()).map(p => ({
        worldId: p.worldId, worldName: p.worldName, token: p.token, expiresAt: p.expiresAt
      }));
    }

    // RPG-02-06: World export preview — show what an export will contain BEFORE exporting.
    function previewWorldExport(id) {
      const world = worlds.get(id);
      if (!world) return { ok: false, reason: 'not-found' };
      const locations = Object.keys(world.worldState.locations || {});
      const characters = Object.keys(world.characters || {});
      const quests = Object.keys(world.quests || {});
      const factions = Object.keys(world.factions || {});
      const preview = {
        ok: true,
        worldId: id,
        worldName: world.name,
        format: 'seven-rpg-world-export',
        version: world.version || 1,
        contents: {
          locations: locations.length,
          characters: characters.length,
          quests: quests.length,
          factions: factions.length,
          rules: (world.rules || []).length,
          canon: Object.keys(world.canon || {}).length
        },
        includes: ['world', 'rules', 'canon', 'characters', 'quests'],
        excludes: ['provider-secrets', 'session-cache'],
        estimatedBytes: JSON.stringify(world).length,
        checksumPreview: null
      };
      // Estimated size + a preview checksum over the identity fields
      preview.estimatedBytes = Buffer.byteLength(JSON.stringify(world), 'utf8');
      preview.checksumPreview = stableChecksum(JSON.stringify([world.id, world.name, world.version]));
      return preview;
    }

    // RPG-02-07: World import preview — validate + summarize an incoming world
    // BEFORE committing the import, including conflict detection.
    function previewWorldImport(data) {
      const i = obj(data);
      if (!i.id || !i.name) return { ok: false, reason: 'invalid-world-data' };
      const existing = worlds.get(i.id);
      const locations = Object.keys((i.worldState && i.worldState.locations) || {});
      const characters = Object.keys(i.characters || {});
      const quests = Object.keys(i.quests || {});
      return {
        ok: true,
        valid: true,
        worldId: i.id,
        worldName: i.name,
        conflict: existing ? {
          exists: true,
          strategy: 'overwrite' // caller chooses; preview reports the default
        } : { exists: false, strategy: 'create' },
        contents: {
          locations: locations.length,
          characters: characters.length,
          quests: quests.length,
          rules: Array.isArray(i.rules) ? i.rules.length : 0
        },
        templateId: i.templateId || 'custom',
        difficulty: i.difficulty || 'normal',
        tone: i.tone || 'heroic',
        estimatedBytes: Buffer.byteLength(JSON.stringify(i), 'utf8'),
        warnings: existing ? ['World already exists; import will overwrite it.'] : []
      };
    }

    // RPG-02-13: World rules schema — a declarative JSON-Schema-like description of
    // the world rules structure so rules can be validated/exported interchangeably.
    const WORLD_RULES_SCHEMA = Object.freeze({
      $schema: 'https://seven-rpg/schemas/world-rules-v1.json',
      type: 'object',
      required: ['rules'],
      properties: {
        rules: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'type', 'scope'],
            properties: {
              id: { type: 'string', minLength: 1 },
              type: { type: 'string', enum: ['physics', 'technology', 'magic', 'social', 'economy', 'combat'] },
              scope: { type: 'string', enum: ['global', 'region', 'location', 'character'] },
              description: { type: 'string' },
              condition: { type: 'object' },
              effect: { type: 'object' },
              priority: { type: 'integer', minimum: 0 },
              enabled: { type: 'boolean' }
            },
            additionalProperties: true
          }
        },
        difficulty: { type: 'string', enum: ['easy', 'normal', 'hard', 'deadly'] },
        tone: { type: 'string' }
      },
      additionalProperties: true
    });

    function getWorldRulesSchema() {
      return clone(WORLD_RULES_SCHEMA);
    }

    // Validate a world's rules against the declarative schema.
    function validateWorldRulesSchema(worldId) {
      const world = worlds.get(worldId);
      if (!world) return { valid: false, reason: 'not-found', errors: [] };
      const rules = Array.isArray(world.rules) ? world.rules : [];
      const errors = [];
      const allowedTypes = WORLD_RULES_SCHEMA.properties.rules.items.properties.type.enum;
      const allowedScopes = WORLD_RULES_SCHEMA.properties.rules.items.properties.scope.enum;
      for (let idx = 0; idx < rules.length; idx++) {
        const r = obj(rules[idx]);
        if (!text(r.id)) errors.push({ index: idx, field: 'id', message: 'required' });
        if (!allowedTypes.includes(r.type)) errors.push({ index: idx, field: 'type', message: 'must be one of ' + allowedTypes.join('|') });
        if (!allowedScopes.includes(r.scope)) errors.push({ index: idx, field: 'scope', message: 'must be one of ' + allowedScopes.join('|') });
      }
      return {
        valid: errors.length === 0,
        ruleCount: rules.length,
        errors,
        schema: WORLD_RULES_SCHEMA.$schema
      };
    }

    // Stable 8-hex checksum helper (FNV-1a)
    function stableChecksum(str) {
      let h = 0x811c9dc5;
      const s = String(str);
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
      }
      return ('00000000' + h.toString(16)).slice(-8);
    }

    return {
      WORLD_TEMPLATES, DIFFICULTY_PROFILES, TONE_PROFILES,
      createWorld, createFromTemplate, getWorld, getAllWorlds,
      updateWorld, deleteWorld, archiveWorld, restoreWorld,
      exportWorld, importWorld, getWorldSummary, getWorldStats,
      registerTemplate, getTemplate, getAllTemplates,
      getDifficultyProfile, getToneProfile,
      setWorldDifficulty, setWorldTone,
      requestDeleteWorld, confirmDeleteWorld, cancelDeleteWorld, getPendingDeletes,
      previewWorldExport, previewWorldImport,
      getWorldRulesSchema, validateWorldRulesSchema
    };
  }

  return { createWorldManager };
});