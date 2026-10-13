(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgUi = api;
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

  const LAYOUT_MODES = Object.freeze(['mobile', 'tablet', 'desktop', 'wide']);
  const THEMES = Object.freeze(['light', 'dark', 'sepia', 'high-contrast', 'auto']);
  const DICE_TYPES = Object.freeze([4, 6, 8, 10, 12, 20, 100]);
  const PANEL_TYPES = Object.freeze(['scene', 'dialogue', 'choices', 'character-sheet', 'inventory', 'map', 'journal', 'settings', 'dice', 'combat', 'party', 'glossary']);
  const NOTIFICATION_LEVELS = Object.freeze(['info', 'success', 'warning', 'error', 'critical']);
  const SOUND_EVENTS = Object.freeze(['dialogue', 'choice', 'combat-hit', 'combat-miss', 'level-up', 'quest-complete', 'discovery', 'ambient', 'ui-click', 'notification']);
  const ACCESSIBILITY_MODES = Object.freeze(['default', 'high-contrast', 'large-text', 'reduced-motion', 'screen-reader']);
  const ANIMATION_SPEEDS = Object.freeze(['off', 'reduced', 'normal', 'enhanced']);

  function createUiManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const panels = new Map();
    const notifications = new Map();
    const diceHistory = new Map();
    const tutorialSteps = new Map();
    const soundSettings = new Map();
    let idCounter = 0;
    function nextId() { return ++idCounter; }

    // UI state
    const uiState = {
      layout: 'desktop',
      theme: 'auto',
      rtl: false,
      language: 'en',
      accessibility: 'default',
      animationSpeed: 'normal',
      fontSize: 16,
      sidebarOpen: true,
      activePanel: null,
      panelStack: [],
      modalOpen: false,
      modalContent: null,
      loading: false,
      lastUpdated: now()
    };

    // RPG-11-01: Responsive layout
    function setLayout(mode) {
      if (!LAYOUT_MODES.includes(mode)) return { ok: false, reason: 'invalid-mode' };
      const old = uiState.layout;
      uiState.layout = mode;
      uiState.sidebarOpen = mode === 'desktop' || mode === 'wide';
      uiState.lastUpdated = now();
      return { ok: true, old, new: mode, sidebarOpen: uiState.sidebarOpen };
    }

    function getLayout() {
      return {
        mode: uiState.layout,
        sidebarOpen: uiState.sidebarOpen,
        breakpoints: { mobile: 0, tablet: 600, desktop: 900, wide: 1200 },
        isMobile: uiState.layout === 'mobile',
        isTouch: uiState.layout === 'mobile' || uiState.layout === 'tablet'
      };
    }

    // RPG-11-02: Arabic RTL support
    function setRtl(enabled) {
      uiState.rtl = enabled === true;
      uiState.lastUpdated = now();
      return { ok: true, rtl: uiState.rtl };
    }

    function setLanguage(lang) {
      const l = text(lang) || 'en';
      uiState.language = l;
      // Arabic triggers RTL
      if (l === 'ar' || l === 'he' || l === 'fa' || l === 'ur') uiState.rtl = true;
      uiState.lastUpdated = now();
      return { ok: true, language: l, rtl: uiState.rtl };
    }

    function getTextDirection() {
      return uiState.rtl ? 'rtl' : 'ltr';
    }

    function getLocalizedText(strings, key, fallback) {
      const s = obj(strings);
      const langStrings = obj(s[uiState.language]);
      return text(langStrings[key]) || text(s[key]) || text(fallback) || text(key);
    }

    // RPG-11-03: Scene card UI
    function createSceneCard(input) {
      const i = obj(input);
      const id = i.id || stableId('scard', nextId());
      const card = {
        id,
        title: text(i.title) || 'Scene',
        subtitle: text(i.subtitle) || null,
        locationName: text(i.locationName),
        timeOfDay: text(i.timeOfDay),
        weather: text(i.weather),
        characters: arr(i.characters).map(c => ({
          id: text(c.id) || text(c.name),
          name: text(c.name) || 'Unknown',
          status: text(c.status) || 'present',
          icon: text(c.icon) || null
        })),
        objectives: arr(i.objectives).map(o => ({
          text: text(o.text || o.description),
          completed: o.completed === true,
          optional: o.optional === true
        })),
        mood: text(i.mood) || 'neutral',
        backgroundUrl: text(i.backgroundUrl) || null,
        expanded: i.expanded === true,
        visible: i.visible !== false,
        createdAt: now()
      };
      panels.set(id, { type: 'scene', data: card });
      return card;
    }

    function getSceneCard(id) {
      const p = panels.get(id);
      return p && p.type === 'scene' ? clone(p.data) : null;
    }

    function updateSceneCard(id, updates) {
      const p = panels.get(id);
      if (!p || p.type !== 'scene') return { ok: false, reason: 'card-not-found' };
      const u = obj(updates);
      if (u.title != null) p.data.title = text(u.title);
      if (u.subtitle != null) p.data.subtitle = text(u.subtitle);
      if (u.mood != null) p.data.mood = text(u.mood);
      if (u.expanded != null) p.data.expanded = u.expanded === true;
      if (u.visible != null) p.data.visible = u.visible === true;
      if (u.objectives != null) {
        p.data.objectives = arr(u.objectives).map(o => ({
          text: text(o.text || o.description),
          completed: o.completed === true,
          optional: o.optional === true
        }));
      }
      return { ok: true, card: clone(p.data) };
    }

    // RPG-11-04: Turn order display
    function renderTurnOrder(combatants, currentTurnId) {
      const list = arr(combatants);
      return list.map((c, index) => {
        const cbt = obj(c);
        return {
          index,
          id: text(cbt.id),
          name: text(cbt.name) || 'Unknown',
          initiative: Number(cbt.initiative) || 0,
          health: clamp(cbt.health ?? 0, 0, 99999),
          maxHealth: clamp(cbt.maxHealth ?? 100, 1, 99999),
          healthPercent: Math.round((clamp(cbt.health ?? 0, 0, 99999) / clamp(cbt.maxHealth ?? 100, 1, 99999)) * 100),
          isCurrentTurn: text(cbt.id) === text(currentTurnId),
          isPlayer: cbt.type === 'player',
          status: cbt.alive === false ? 'defeated' : cbt.status || 'active',
          effects: arr(cbt.effects).map(e => text(e))
        };
      }).sort((a, b) => b.initiative - a.initiative);
    }

    // RPG-11-05: Dialogue panel
    function createDialoguePanel(input) {
      const i = obj(input);
      const id = i.id || stableId('dpanel', nextId());
      const panel = {
        id,
        entries: arr(i.entries).map(e => ({
          id: e.id || stableId('dent', nextId()),
          speakerName: text(e.speakerName || e.speaker),
          speakerType: text(e.speakerType) || 'narrator',
          content: text(e.content),
          style: text(e.style) || null,
          timestamp: e.timestamp || now(),
          visible: e.visible !== false
        })),
        currentSpeaker: text(i.currentSpeaker) || null,
        typing: i.typing === true,
        typewriterSpeed: clamp(i.typewriterSpeed ?? 30, 0, 200),
        autoAdvance: i.autoAdvance === true,
        showSpeaker: i.showSpeaker !== false,
        compactMode: i.compactMode === true,
        scrollPosition: clamp(i.scrollPosition ?? 0, 0, 9999),
        createdAt: now(),
        updatedAt: now()
      };
      panels.set(id, { type: 'dialogue', data: panel });
      return panel;
    }

    function addDialogueEntry(panelId, entry) {
      const p = panels.get(panelId);
      if (!p || p.type !== 'dialogue') return { ok: false, reason: 'panel-not-found' };
      const e = obj(entry);
      const record = {
        id: e.id || stableId('dent', nextId()),
        speakerName: text(e.speakerName || e.speaker),
        speakerType: text(e.speakerType) || 'narrator',
        content: text(e.content),
        style: text(e.style) || null,
        timestamp: e.timestamp || now(),
        visible: e.visible !== false
      };
      p.data.entries.push(record);
      p.data.currentSpeaker = record.speakerName;
      p.data.updatedAt = now();
      return { ok: true, entry: record };
    }

    function getDialoguePanel(id) {
      const p = panels.get(id);
      return p && p.type === 'dialogue' ? clone(p.data) : null;
    }

    // RPG-11-06: Choices panel
    function createChoicesPanel(input) {
      const i = obj(input);
      const id = i.id || stableId('choices', nextId());
      const panel = {
        id,
        prompt: text(i.prompt) || 'What do you do?',
        choices: arr(i.choices).map(c => ({
          id: c.id || stableId('ch', nextId()),
          text: text(c.text),
          icon: text(c.icon) || null,
          style: text(c.style) || 'default',
          disabled: c.disabled === true,
          consequenceHint: text(c.consequenceHint) || null,
          skillCheck: c.skillCheck ? {
            skill: text(c.skillCheck.skill),
            dc: clamp(c.skillCheck.dc ?? 10, 1, 30)
          } : null
        })),
        allowCustomInput: i.allowCustomInput === true,
        selectedIndex: i.selectedIndex != null ? clamp(i.selectedIndex, -1, 99) : -1,
        timeLimit: clamp(i.timeLimit ?? 0, 0, 999),
        timeRemaining: clamp(i.timeLimit ?? 0, 0, 999),
        visible: i.visible !== false,
        createdAt: now()
      };
      panels.set(id, { type: 'choices', data: panel });
      return panel;
    }

    function selectChoice(panelId, choiceId) {
      const p = panels.get(panelId);
      if (!p || p.type !== 'choices') return { ok: false, reason: 'panel-not-found' };
      const idx = p.data.choices.findIndex(c => c.id === choiceId);
      if (idx < 0) return { ok: false, reason: 'choice-not-found' };
      if (p.data.choices[idx].disabled) return { ok: false, reason: 'choice-disabled' };
      p.data.selectedIndex = idx;
      return { ok: true, selected: clone(p.data.choices[idx]), index: idx };
    }

    function getChoicesPanel(id) {
      const p = panels.get(id);
      return p && p.type === 'choices' ? clone(p.data) : null;
    }

    // RPG-11-07: Dice roller widget
    function rollDice(input) {
      const i = obj(input);
      const sides = DICE_TYPES.includes(Number(i.sides)) ? Number(i.sides) : 20;
      const count = clamp(i.count ?? 1, 1, 20);
      const modifier = clamp(i.modifier ?? 0, -50, 50);
      const rolls = [];
      for (let n = 0; n < count; n++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }
      const total = rolls.reduce((s, r) => s + r, 0) + modifier;
      const critical = sides === 20 && rolls.includes(20);
      const fumble = sides === 20 && rolls.every(r => r === 1);
      const record = {
        id: stableId('diceroll', nextId()),
        notation: `${count}d${sides}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}`,
        sides, count, modifier,
        rolls, total,
        critical, fumble,
        timestamp: now()
      };
      const histId = text(i.historyId) || 'default';
      if (!diceHistory.has(histId)) diceHistory.set(histId, []);
      diceHistory.get(histId).push(record);
      return record;
    }

    function getDiceHistory(historyId, limit) {
      const id = text(historyId) || 'default';
      const hist = diceHistory.get(id) || [];
      const l = clamp(limit ?? 20, 1, 100);
      return hist.slice(-l);
    }

    // RPG-11-08: Character sheet
    function renderCharacterSheet(character) {
      const c = obj(character);
      const attrs = obj(c.attributes);
      const health = obj(c.health);
      const mana = obj(c.mana);
      return {
        id: text(c.id),
        name: text(c.name) || 'Unnamed',
        level: clamp(c.level ?? 1, 1, 100),
        className: text(c.class || c.className) || 'Adventurer',
        race: text(c.race) || 'Human',
        background: text(c.background) || null,
        attributes: {
          strength: clamp(attrs.strength ?? 10, 1, 30),
          dexterity: clamp(attrs.dexterity ?? 10, 1, 30),
          constitution: clamp(attrs.constitution ?? 10, 1, 30),
          intelligence: clamp(attrs.intelligence ?? 10, 1, 30),
          wisdom: clamp(attrs.wisdom ?? 10, 1, 30),
          charisma: clamp(attrs.charisma ?? 10, 1, 30)
        },
        modifiers: {
          strength: Math.floor((clamp(attrs.strength ?? 10, 1, 30) - 10) / 2),
          dexterity: Math.floor((clamp(attrs.dexterity ?? 10, 1, 30) - 10) / 2),
          constitution: Math.floor((clamp(attrs.constitution ?? 10, 1, 30) - 10) / 2),
          intelligence: Math.floor((clamp(attrs.intelligence ?? 10, 1, 30) - 10) / 2),
          wisdom: Math.floor((clamp(attrs.wisdom ?? 10, 1, 30) - 10) / 2),
          charisma: Math.floor((clamp(attrs.charisma ?? 10, 1, 30) - 10) / 2)
        },
        health: {
          current: clamp(health.current ?? 100, 0, 99999),
          max: clamp(health.max ?? 100, 1, 99999),
          percent: Math.round((clamp(health.current ?? 100, 0, 99999) / clamp(health.max ?? 100, 1, 99999)) * 100)
        },
        mana: {
          current: clamp(mana.current ?? 0, 0, 99999),
          max: clamp(mana.max ?? 0, 0, 99999),
          percent: mana.max > 0 ? Math.round((clamp(mana.current ?? 0, 0, 99999) / clamp(mana.max, 1, 99999)) * 100) : 0
        },
        armorClass: clamp(c.armorClass ?? 10, 0, 50),
        speed: clamp(c.speed ?? 30, 0, 200),
        proficiencyBonus: clamp(c.proficiencyBonus ?? 2, 0, 10),
        skills: obj(c.skills),
        conditions: arr(c.conditions).map(t => text(t)),
        gold: clamp(c.gold ?? 0, 0, 999999999),
        xp: clamp(c.xp ?? 0, 0, 999999999),
        xpToNext: clamp(c.xpToNext ?? 100, 1, 999999)
      };
    }

    // RPG-11-09: Inventory grid
    function renderInventoryGrid(inventory, columns) {
      const items = arr(inventory);
      const cols = clamp(columns ?? 4, 1, 12);
      const grid = [];
      let row = [];
      for (const item of items) {
        const it = obj(item);
        row.push({
          id: text(it.id),
          name: text(it.name) || 'Unknown',
          icon: text(it.icon) || text(it.type) || 'item',
          quantity: clamp(it.quantity ?? 1, 1, 999),
          rarity: text(it.rarity) || 'common',
          equipped: it.equipped === true,
          stackable: it.stackable !== false,
          weight: Number(it.weight) || 0,
          value: clamp(it.value ?? 0, 0, 999999),
          tooltip: text(it.tooltip) || text(it.description) || null,
          empty: false
        });
        if (row.length >= cols) {
          grid.push(row);
          row = [];
        }
      }
      // Pad last row
      while (row.length > 0 && row.length < cols) {
        row.push({ id: null, empty: true });
        if (row.length >= cols) grid.push(row);
      }
      if (row.length > 0 && row.length < cols) grid.push(row);
      return { grid, columns: cols, totalItems: items.length, rowCount: grid.length };
    }

    // RPG-11-10: Map viewer
    function renderMapViewer(mapData, viewport) {
      const d = obj(mapData);
      const v = obj(viewport);
      const nodes = arr(d.nodes);
      const edges = arr(d.edges);
      const vp = {
        x: clamp(v.x ?? 0, -9999, 9999),
        y: clamp(v.y ?? 0, -9999, 9999),
        zoom: clamp(v.zoom ?? 1, 0.1, 5),
        width: clamp(v.width ?? 800, 100, 4000),
        height: clamp(v.height ?? 600, 100, 4000)
      };
      const visibleNodes = nodes.filter(n => {
        const nx = Number(n.x) || 0;
        const ny = Number(n.y) || 0;
        const sx = (nx - vp.x) * vp.zoom + vp.width / 2;
        const sy = (ny - vp.y) * vp.zoom + vp.height / 2;
        return sx >= -50 && sx <= vp.width + 50 && sy >= -50 && sy <= vp.height + 50;
      });
      const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
      const visibleEdges = edges.filter(e => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to));
      return {
        viewport: vp,
        nodes: visibleNodes.map(n => ({
          id: n.id,
          name: text(n.name) || n.id,
          screenX: Math.round(((Number(n.x) || 0) - vp.x) * vp.zoom + vp.width / 2),
          screenY: Math.round(((Number(n.y) || 0) - vp.y) * vp.zoom + vp.height / 2),
          type: text(n.type) || 'location',
          discovered: n.discovered !== false,
          marker: text(n.marker) || null
        })),
        edges: visibleEdges,
        totalNodes: nodes.length,
        visibleCount: visibleNodes.length
      };
    }

    function panMap(viewport, deltaX, deltaY) {
      const v = obj(viewport);
      return {
        x: clamp((Number(v.x) || 0) + Number(deltaX || 0), -9999, 9999),
        y: clamp((Number(v.y) || 0) + Number(deltaY || 0), -9999, 9999),
        zoom: clamp(Number(v.zoom) || 1, 0.1, 5),
        width: v.width, height: v.height
      };
    }

    function zoomMap(viewport, factor) {
      const v = obj(viewport);
      return {
        x: v.x, y: v.y,
        zoom: clamp((Number(v.zoom) || 1) * Number(factor || 1), 0.1, 5),
        width: v.width, height: v.height
      };
    }

    // RPG-11-11: Journal view
    function renderJournalView(journal, filter) {
      const f = obj(filter);
      const entries = arr(journal);
      let filtered = entries;
      if (f.type) filtered = filtered.filter(e => text(e.type) === f.type);
      if (f.search) {
        const q = text(f.search).toLowerCase();
        filtered = filtered.filter(e =>
          text(e.title).toLowerCase().includes(q) ||
          text(e.content).toLowerCase().includes(q)
        );
      }
      if (f.completed != null) filtered = filtered.filter(e => (e.completed === true) === f.completed);
      const grouped = {};
      for (const e of filtered) {
        const section = text(e.section) || 'General';
        if (!grouped[section]) grouped[section] = [];
        grouped[section].push({
          id: e.id,
          title: text(e.title) || 'Untitled',
          content: text(e.content).substring(0, 200),
          completed: e.completed === true,
          pinned: e.pinned === true,
          date: text(e.date) || text(e.timestamp) || null,
          tags: uniq(e.tags)
        });
      }
      return {
        sections: Object.entries(grouped).map(([name, items]) => ({
          name, items: items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
        })),
        totalEntries: entries.length,
        filteredCount: filtered.length
      };
    }

    // RPG-11-12: Settings panel
    const settings = {
      display: {
        theme: 'auto',
        fontSize: 16,
        animationSpeed: 'normal',
        reduceMotion: false,
        showTooltips: true,
        compactMode: false
      },
      audio: {
        masterVolume: 0.8,
        musicVolume: 0.6,
        sfxVolume: 0.7,
        voiceVolume: 1.0,
        muted: false
      },
      gameplay: {
        autoAdvance: false,
        typewriterSpeed: 30,
        confirmDestructive: true,
        showDamageNumbers: true,
        showIntentions: true,
        difficulty: 'normal'
      },
      accessibility: {
        mode: 'default',
        highContrast: false,
        largeText: false,
        reduceMotion: false,
        screenReaderHints: false,
        colorBlindMode: 'none'
      },
      language: {
        locale: 'en',
        rtl: false,
        dateFormat: 'YYYY-MM-DD'
      }
    };

    function getSetting(category, key) {
      const cat = obj(settings[category]);
      return cat[key] !== undefined ? clone(cat[key]) : null;
    }

    function setSetting(category, key, value) {
      if (!settings[category]) return { ok: false, reason: 'invalid-category' };
      const oldValue = settings[category][key];
      if (oldValue === undefined) return { ok: false, reason: 'invalid-key' };
      // Type-check: preserve existing type
      if (typeof oldValue === 'number') {
        const n = Number(value);
        if (!Number.isFinite(n)) return { ok: false, reason: 'invalid-value' };
        settings[category][key] = n;
      } else if (typeof oldValue === 'boolean') {
        settings[category][key] = value === true || value === 'true';
      } else if (typeof oldValue === 'string') {
        settings[category][key] = text(value) || oldValue;
      } else {
        settings[category][key] = value;
      }
      // Sync with uiState
      if (category === 'display' && key === 'theme') uiState.theme = settings.display.theme;
      if (category === 'display' && key === 'fontSize') uiState.fontSize = settings.display.fontSize;
      if (category === 'display' && key === 'animationSpeed') uiState.animationSpeed = settings.display.animationSpeed;
      if (category === 'language' && key === 'locale') uiState.language = settings.language.locale;
      if (category === 'language' && key === 'rtl') uiState.rtl = settings.language.rtl;
      if (category === 'accessibility' && key === 'mode') uiState.accessibility = settings.accessibility.mode;
      return { ok: true, category, key, value: clone(settings[category][key]), oldValue: clone(oldValue) };
    }

    function getAllSettings() {
      return clone(settings);
    }

    function resetSettings(category) {
      if (category && !settings[category]) return { ok: false, reason: 'invalid-category' };
      if (category) {
        const defaults = createDefaultSettings();
        settings[category] = defaults[category];
      } else {
        const defaults = createDefaultSettings();
        Object.assign(settings, defaults);
      }
      return { ok: true, settings: clone(settings) };
    }

    function createDefaultSettings() {
      return {
        display: { theme: 'auto', fontSize: 16, animationSpeed: 'normal', reduceMotion: false, showTooltips: true, compactMode: false },
        audio: { masterVolume: 0.8, musicVolume: 0.6, sfxVolume: 0.7, voiceVolume: 1.0, muted: false },
        gameplay: { autoAdvance: false, typewriterSpeed: 30, confirmDestructive: true, showDamageNumbers: true, showIntentions: true, difficulty: 'normal' },
        accessibility: { mode: 'default', highContrast: false, largeText: false, reduceMotion: false, screenReaderHints: false, colorBlindMode: 'none' },
        language: { locale: 'en', rtl: false, dateFormat: 'YYYY-MM-DD' }
      };
    }

    // RPG-11-13: Tutorial overlay
    function createTutorialStep(input) {
      const i = obj(input);
      const id = i.id || stableId('tut', nextId());
      const step = {
        id,
        order: clamp(i.order ?? 1, 1, 999),
        title: text(i.title) || 'Tutorial',
        content: text(i.content),
        targetElement: text(i.targetElement) || null,
        position: text(i.position) || 'bottom', // top, bottom, left, right, center
        allowSkip: i.allowSkip !== false,
        requiresAction: i.requiresAction === true,
        actionHint: text(i.actionHint) || null,
        completed: false,
        skipped: false,
        createdAt: now()
      };
      tutorialSteps.set(id, step);
      return step;
    }

    function getTutorialSteps() {
      return Array.from(tutorialSteps.values()).sort((a, b) => a.order - b.order);
    }

    function completeTutorialStep(id) {
      const step = tutorialSteps.get(id);
      if (!step) return { ok: false, reason: 'step-not-found' };
      step.completed = true;
      return { ok: true, step: clone(step) };
    }

    function skipTutorialStep(id) {
      const step = tutorialSteps.get(id);
      if (!step) return { ok: false, reason: 'step-not-found' };
      if (!step.allowSkip) return { ok: false, reason: 'skip-not-allowed' };
      step.skipped = true;
      return { ok: true, step: clone(step) };
    }

    function getTutorialProgress() {
      const steps = getTutorialSteps();
      const completed = steps.filter(s => s.completed).length;
      const skipped = steps.filter(s => s.skipped).length;
      const total = steps.length;
      return {
        total,
        completed,
        skipped,
        remaining: total - completed - skipped,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        finished: total > 0 && completed + skipped >= total
      };
    }

    // RPG-11-14: Accessibility
    function getAccessibilityConfig() {
      const a = obj(settings.accessibility);
      const mode = text(a.mode) || uiState.accessibility;
      const configs = {
        default: {
          fontSize: 16,
          contrastRatio: 4.5,
          animationSpeed: 'normal',
          reduceMotion: false,
          screenReaderHints: false,
          focusIndicators: true,
          keyboardNavigation: true
        },
        'high-contrast': {
          fontSize: 18,
          contrastRatio: 7,
          animationSpeed: 'reduced',
          reduceMotion: true,
          screenReaderHints: false,
          focusIndicators: true,
          keyboardNavigation: true
        },
        'large-text': {
          fontSize: 22,
          contrastRatio: 4.5,
          animationSpeed: 'normal',
          reduceMotion: false,
          screenReaderHints: false,
          focusIndicators: true,
          keyboardNavigation: true
        },
        'reduced-motion': {
          fontSize: 16,
          contrastRatio: 4.5,
          animationSpeed: 'off',
          reduceMotion: true,
          screenReaderHints: false,
          focusIndicators: true,
          keyboardNavigation: true
        },
        'screen-reader': {
          fontSize: 18,
          contrastRatio: 7,
          animationSpeed: 'off',
          reduceMotion: true,
          screenReaderHints: true,
          focusIndicators: true,
          keyboardNavigation: true
        }
      };
      const config = configs[mode] || configs.default;
      return { mode, ...config };
    }

    function setAccessibilityMode(mode) {
      if (!ACCESSIBILITY_MODES.includes(mode)) return { ok: false, reason: 'invalid-mode' };
      settings.accessibility.mode = mode;
      settings.accessibility.highContrast = mode === 'high-contrast' || mode === 'screen-reader';
      settings.accessibility.largeText = mode === 'large-text';
      settings.accessibility.reduceMotion = mode === 'reduced-motion' || mode === 'screen-reader';
      settings.accessibility.screenReaderHints = mode === 'screen-reader';
      uiState.accessibility = mode;
      return { ok: true, mode, config: getAccessibilityConfig() };
    }

    // RPG-11-15: Animations
    function getAnimationConfig() {
      const speed = text(uiState.animationSpeed) || settings.display.animationSpeed;
      const configs = {
        off: { enabled: false, duration: 0, easing: 'linear', transitions: false, particles: false },
        reduced: { enabled: true, duration: 100, easing: 'ease-out', transitions: true, particles: false },
        normal: { enabled: true, duration: 250, easing: 'ease-in-out', transitions: true, particles: true },
        enhanced: { enabled: true, duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', transitions: true, particles: true }
      };
      return configs[speed] || configs.normal;
    }

    function setAnimationSpeed(speed) {
      if (!ANIMATION_SPEEDS.includes(speed)) return { ok: false, reason: 'invalid-speed' };
      uiState.animationSpeed = speed;
      settings.display.animationSpeed = speed;
      settings.display.reduceMotion = speed === 'off';
      return { ok: true, speed, config: getAnimationConfig() };
    }

    // RPG-11-16: Sound controls
    function setSoundSetting(event, volume) {
      if (!SOUND_EVENTS.includes(event) && event !== 'master') return { ok: false, reason: 'invalid-event' };
      const v = clamp(volume, 0, 1);
      if (!soundSettings.has(event)) soundSettings.set(event, { volume: v, muted: false });
      else {
        soundSettings.get(event).volume = v;
      }
      return { ok: true, event, volume: v };
    }

    function getSoundSetting(event) {
      return soundSettings.get(event) || { volume: 1, muted: false };
    }

    function toggleMute(event) {
      if (event) {
        const s = soundSettings.get(event) || { volume: 1, muted: false };
        s.muted = !s.muted;
        soundSettings.set(event, s);
        return { ok: true, event, muted: s.muted };
      }
      // Toggle master mute
      const master = soundSettings.get('master') || { volume: 1, muted: false };
      master.muted = !master.muted;
      soundSettings.set('master', master);
      return { ok: true, event: 'master', muted: master.muted };
    }

    function getEffectiveVolume(event) {
      const master = soundSettings.get('master') || { volume: 1, muted: false };
      if (master.muted) return 0;
      const s = soundSettings.get(event) || { volume: 1, muted: false };
      if (s.muted) return 0;
      return Math.round(master.volume * s.volume * 100) / 100;
    }

    // Notifications (supporting)
    function notify(input) {
      const i = obj(input);
      const id = i.id || stableId('notif', nextId());
      const notif = {
        id,
        level: NOTIFICATION_LEVELS.includes(i.level) ? i.level : 'info',
        title: text(i.title) || '',
        message: text(i.message),
        persistent: i.persistent === true,
        actions: arr(i.actions).map(a => ({ label: text(a.label), action: text(a.action) })),
        read: false,
        createdAt: now()
      };
      notifications.set(id, notif);
      // Auto-dismiss non-persistent notifications after keeping last 50
      const all = Array.from(notifications.values());
      if (all.length > 50) {
        const sorted = all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        for (const old of sorted.slice(0, all.length - 50)) {
          notifications.delete(old.id);
        }
      }
      return notif;
    }

    function getNotifications(filter) {
      const f = obj(filter);
      let result = Array.from(notifications.values());
      if (f.level) result = result.filter(n => n.level === f.level);
      if (f.unreadOnly) result = result.filter(n => !n.read);
      return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    function markNotificationRead(id) {
      const n = notifications.get(id);
      if (!n) return { ok: false, reason: 'notification-not-found' };
      n.read = true;
      return { ok: true };
    }

    // Theme
    function setTheme(theme) {
      if (!THEMES.includes(theme)) return { ok: false, reason: 'invalid-theme' };
      uiState.theme = theme;
      settings.display.theme = theme;
      return { ok: true, theme };
    }

    function getTheme() {
      return { theme: uiState.theme, resolved: uiState.theme === 'auto' ? 'dark' : uiState.theme };
    }

    // Modal
    function openModal(content) {
      uiState.modalOpen = true;
      uiState.modalContent = clone(content);
      return { ok: true };
    }

    function closeModal() {
      uiState.modalOpen = false;
      uiState.modalContent = null;
      return { ok: true };
    }

    // Get full UI state
    function getUiState() {
      return clone(uiState);
    }

    return {
      LAYOUT_MODES, THEMES, DICE_TYPES, PANEL_TYPES,
      NOTIFICATION_LEVELS, SOUND_EVENTS, ACCESSIBILITY_MODES, ANIMATION_SPEEDS,
      setLayout, getLayout,
      setRtl, setLanguage, getTextDirection, getLocalizedText,
      createSceneCard, getSceneCard, updateSceneCard,
      renderTurnOrder,
      createDialoguePanel, addDialogueEntry, getDialoguePanel,
      createChoicesPanel, selectChoice, getChoicesPanel,
      rollDice, getDiceHistory,
      renderCharacterSheet,
      renderInventoryGrid,
      renderMapViewer, panMap, zoomMap,
      renderJournalView,
      getSetting, setSetting, getAllSettings, resetSettings,
      createTutorialStep, getTutorialSteps, completeTutorialStep, skipTutorialStep, getTutorialProgress,
      getAccessibilityConfig, setAccessibilityMode,
      getAnimationConfig, setAnimationSpeed,
      setSoundSetting, getSoundSetting, toggleMute, getEffectiveVolume,
      notify, getNotifications, markNotificationRead,
      setTheme, getTheme,
      openModal, closeModal,
      getUiState
    };
  }

  return { createUiManager };
});
