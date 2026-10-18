(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgStoryGenerator = api;
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
  function stableId(prefix, n) { return prefix + '-' + String(n).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }
  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function weightedPick(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  const TEMPLATE_TYPES = Object.freeze([
    'hook', 'scene', 'encounter', 'plot_twist', 'character_moment', 'world_building', 'downtime', 'climax', 'resolution'
  ]);

  const NARRATIVE_ARCHETYPES = Object.freeze([
    'hero_journey', 'mystery', 'revenge', 'redemption', 'coming_of_age', 'tragedy', 'comedy', 'exploration', 'political_intrigue', 'survival'
  ]);

  const SCENE_PACING = Object.freeze(['slow', 'moderate', 'fast', 'intense']);

  function createStoryGenerator(stateApi, memoryApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const templates = new Map();
    const lastIdNums = new Map();

    // Collision-safe monotonic id: Date.now() repeats within the same
    // millisecond, silently overwriting an existing record.
    function nextId(prefix, isTaken) {
      let n = Date.now();
      const last = lastIdNums.get(prefix) || 0;
      if (n <= last) n = last + 1;
      let id = stableId(prefix, n);
      if (typeof isTaken === 'function') { while (isTaken(id)) { n += 1; id = stableId(prefix, n); } }
      lastIdNums.set(prefix, n);
      return id;
    }

    function registerTemplate(template) {
      const t = obj(template);
      if (!t.id) t.id = nextId('template', key => templates.has(key));
      if (!t.name) t.name = 'Unnamed Template';
      if (!TEMPLATE_TYPES.includes(t.type)) t.type = 'scene';
      if (!t.weight) t.weight = 1;
      if (!t.tags) t.tags = [];
      if (!t.requiredContext) t.requiredContext = [];
      if (!t.template) t.template = '';
      t.createdAt = now();
      templates.set(t.id, t);
      return t;
    }

    function getTemplate(id) {
      return templates.get(id);
    }

    function getTemplatesByType(type) {
      return Array.from(templates.values()).filter(t => t.type === type);
    }

    function getTemplatesByTag(tag) {
      return Array.from(templates.values()).filter(t => t.tags.includes(tag));
    }

    function renderTemplate(templateId, context) {
      const template = templates.get(templateId);
      if (!template) return { ok: false, reason: 'template-not-found' };
      if (!contextMatches(template, context)) return { ok: false, reason: 'context-mismatch' };

      let output = template.template;
      const vars = { ...context, ...generateDynamicVars(template, context) };

      for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
        output = output.replace(regex, String(value));
      }

      const missing = output.match(/\{\{[^}]+\}\}/g) || [];
      if (missing.length > 0) {
        return { ok: false, reason: 'missing-variables', missing };
      }

      return { ok: true, output, templateId: template.id };
    }

    function contextMatches(template, context) {
      for (const req of template.requiredContext) {
        if (!(req in context)) return false;
      }
      return true;
    }

    function generateDynamicVars(template, context) {
      const vars = {};
      const state = context.state || {};
      const characters = obj(state.characters);
      const world = obj(state.world);

      vars.currentLocation = context.locationId || (Object.values(characters).find(c => c.control === 'player')?.locationId) || 'unknown';
      vars.currentTime = state.timeline?.dateLabel || 'unknown time';
      vars.partySize = Object.values(characters).filter(c => c.control !== 'narrator').length;
      vars.weather = world.weather?.current || 'clear';
      vars.timeOfDay = world.timeOfDay || 'day';
      vars.hook = generateStoryHook(state);

      if (template.type === 'encounter') {
        vars.enemyType = pickRandom(['goblin', 'bandit', 'wolf', 'spirit', 'cultist', 'beast']);
        vars.enemyCount = Math.floor(Math.random() * 3) + 1;
      }

      return vars;
    }

    function generateStoryHook(state, options) {
      const archetype = options?.archetype || pickRandom(NARRATIVE_ARCHETYPES);
      const hooks = {
        hero_journey: [
          'A mysterious stranger arrives with a desperate plea for help.',
          'An ancient prophecy names the party as the world\'s only hope.',
          'The party\'s homeland is threatened by a rising darkness.'
        ],
        mystery: [
          'A noble is found dead under impossible circumstances.',
          'A valuable artifact vanishes from a sealed vault.',
          'Strange symbols appear on buildings throughout the city.'
        ],
        revenge: [
          'The villain who destroyed the party\'s home resurfaces.',
          'A betrayed ally seeks vengeance against the party.',
          'An old enemy returns with terrifying new power.'
        ],
        redemption: [
          'A fallen hero seeks a chance to atone for past sins.',
          'A villain offers a surprising path to redemption.',
          'The party must forgive an enemy to save the world.'
        ],
        coming_of_age: [
          'Young heroes must prove themselves in a trial by fire.',
          'A coming-of-age ceremony is interrupted by disaster.',
          'The party\'s youngest member discovers a hidden heritage.'
        ],
        tragedy: [
          'A beloved NPC sacrifices themselves for the party.',
          'The party\'s victory comes at a terrible cost.',
          'A hard choice forces the party to betray their values.'
        ],
        comedy: [
          'A case of mistaken identity leads to chaotic consequences.',
          'A magical mishap causes hilarious misunderstandings.',
          'The party must navigate a absurd social situation.'
        ],
        exploration: [
          'An ancient map reveals a lost civilization.',
          'A new continent is discovered across the sea.',
          'A portal opens to a realm of wonder and danger.'
        ],
        political_intrigue: [
          'A royal succession crisis threatens civil war.',
          'The party is framed for a crime they didn\'t commit.',
          'Secret societies vie for control of the kingdom.'
        ],
        survival: [
          'The party is stranded in a hostile wilderness.',
          'A magical catastrophe cuts off all supply lines.',
          'A relentless predator hunts the party through the night.'
        ]
      };

      const hookList = hooks[archetype] || hooks.hero_journey;
      return pickRandom(hookList);
    }

    function generateEncounter(state, options) {
      const difficulty = options?.difficulty || 'moderate';
      const encounterTypes = ['combat', 'social', 'exploration', 'puzzle', 'hazard'];
      const type = options?.type || pickRandom(encounterTypes);

      const templates = {
        combat: [
          '{{enemyCount}} {{enemyType}}(s) block the path.',
          'A {{enemyType}} ambushes the party from hiding.',
          'A territorial {{enemyType}} challenges the party.'
        ],
        social: [
          'A suspicious merchant offers a deal too good to be true.',
          'A noble demands the party prove their worth.',
          'A spirit demands a toll for passage.'
        ],
        exploration: [
          'The party discovers an ancient ruin.',
          'A hidden passage opens behind a waterfall.',
          'Strange lights dance in the ruins ahead.'
        ],
        puzzle: [
          'A door sealed with magical runes blocks the way.',
          'A riddle carved in stone must be solved.',
          'A mechanism requires a specific sequence to activate.'
        ],
        hazard: [
          'The floor gives way to a hidden pit trap.',
          'Poison gas seeps from cracks in the walls.',
          'A magical ward burns those who pass uninvited.'
        ]
      };

      const template = pickRandom(templates[type] || templates.combat);
      const context = { ...options, state };
      let output = template;

      const vars = generateDynamicVars({ type: 'encounter' }, { state });
      for (const [key, value] of Object.entries(vars)) {
        output = output.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), String(value));
      }

      return { type, difficulty, description: output };
    }

    function generatePlotTwist(state, options) {
      const twists = [
        'The quest giver was the villain all along.',
        'The artifact the party seeks is a fake.',
        'A trusted ally has been mind-controlled.',
        'The "monster" is actually a cursed innocent.',
        'The party\'s memories have been altered.',
        'The world is a simulation or dream.',
        'The villain is a future version of a party member.',
        'The prophecy was misinterpreted deliberately.',
        'The "gods" are actually advanced beings.',
        'The party\'s actions caused the very threat they fight.'
      ];

      const filtered = options?.exclude ? twists.filter(t => !options.exclude.includes(t)) : twists;
      return pickRandom(filtered);
    }

    function generateNarrativeBeat(state, currentBeat) {
      const beats = [
        { type: 'setup', weight: 10, templates: ['The party {{action}} at {{location}}.', 'As the {{timeOfDay}} {{weather}}, the party {{action}}.'] },
        { type: 'inciting', weight: 15, templates: ['Suddenly, {{event}}!', 'A {{hook}} draws the party into action.'] },
        { type: 'rising', weight: 30, templates: ['The party {{action}} and discovers {{discovery}}.', 'An {{encounter}} tests the party\'s resolve.'] },
        { type: 'climax', weight: 20, templates: ['The final confrontation with {{villain}} begins!', 'The party faces their greatest challenge: {{challenge}}.'] },
        { type: 'falling', weight: 15, templates: ['With {{villain}} defeated, the party {{action}}.', 'The dust settles as the party {{action}}.'] },
        { type: 'resolution', weight: 10, templates: ['The party returns to {{location}} as heroes.', 'A new chapter begins for the party.'] }
      ];

      const nextBeat = weightedPick(beats, beats.map(b => b.weight));
      const template = pickRandom(nextBeat.templates);

      let output = template;
      output = output.replace(/\{\{action\}\}/g, pickRandom(['advances', 'investigates', 'confronts', 'flees', 'negotiates']));
      output = output.replace(/\{\{location\}\}/g, 'the current location');
      output = output.replace(/\{\{timeOfDay\}\}/g, 'morning');
      output = output.replace(/\{\{weather\}\}/g, 'clear skies');
      output = output.replace(/\{\{event\}\}/g, 'a sudden disturbance');
      output = output.replace(/\{\{hook\}\}/g, generateStoryHook({}));
      output = output.replace(/\{\{discovery\}\}/g, 'a hidden secret');
      output = output.replace(/\{\{encounter\}\}/g, generateEncounter({}).description);
      output = output.replace(/\{\{villain\}\}/g, 'the dark lord');
      output = output.replace(/\{\{challenge\}\}/g, 'the ultimate test');
      output = output.replace(/\{\{timeOfDay\}\}/g, 'evening');

      return { type: nextBeat.type, description: output };
    }

    function generateSceneCard(state, templateId, context) {
      const template = templates.get(templateId);
      if (!template) return { ok: false, reason: 'template-not-found' };

      const rendered = renderTemplate(templateId, { state, ...context });
      if (!rendered.ok) return rendered;

      return {
        ok: true,
        scene: {
          id: nextId('scene'),
          content: rendered.output,
          templateId,
          pacing: pickRandom(SCENE_PACING),
          tags: template.tags,
          generatedAt: now()
        }
      };
    }

    return {
      TEMPLATE_TYPES, NARRATIVE_ARCHETYPES, SCENE_PACING,
      registerTemplate, getTemplate, getTemplatesByType, getTemplatesByTag,
      renderTemplate, generateStoryHook, generateEncounter,
      generatePlotTwist, generateNarrativeBeat, generateSceneCard,
      generateDynamicVars,
      exportState, importState
    };

    // Ids here are `prefix-Date.now()` watermarks rather than a sequential
    // counter, so `lastIdNums` is the allocator state that must survive a
    // restore for post-restore ids to stay collision-free.
    function exportState() {
      return {
        version: 1,
        templates: clone(mapsToPlain(Object.fromEntries(templates))),
        lastIdNums: clone(mapsToPlain(Object.fromEntries(lastIdNums)))
      };
    }

    function importState(data) {
      const d = obj(data);
      templates.clear();
      for (const [k, v] of Object.entries(obj(d.templates))) templates.set(k, plainToMaps(v));
      lastIdNums.clear();
      for (const [k, v] of Object.entries(obj(d.lastIdNums))) lastIdNums.set(k, Number(v) || 0);
      return { ok: true, restored: templates.size + lastIdNums.size };
    }
  }

  return { createStoryGenerator };
});