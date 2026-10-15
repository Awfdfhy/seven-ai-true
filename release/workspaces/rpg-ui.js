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
  // Locales that render right-to-left (drives RTL layout + text direction)
  const RTL_LANGUAGES = Object.freeze(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'dv', 'ckb']);

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
      orientation: 'landscape',
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

    // RPG-11-03: Landscape/portrait orientation (drives responsive CSS + panel density)
    const ORIENTATIONS = Object.freeze(['landscape', 'portrait']);
    function setOrientation(orientation) {
      if (!ORIENTATIONS.includes(orientation)) return { ok: false, reason: 'invalid-orientation' };
      const old = uiState.orientation;
      uiState.orientation = orientation;
      // Portrait collapses the sidebar to preserve vertical space
      if (orientation === 'portrait' && (uiState.layout === 'desktop' || uiState.layout === 'wide')) {
        uiState.sidebarOpen = false;
      }
      uiState.lastUpdated = now();
      return { ok: true, old, new: orientation, sidebarOpen: uiState.sidebarOpen };
    }

    function getLayout() {
      return {
        mode: uiState.layout,
        orientation: uiState.orientation,
        sidebarOpen: uiState.sidebarOpen,
        breakpoints: { mobile: 0, tablet: 600, desktop: 900, wide: 1200 },
        isMobile: uiState.layout === 'mobile',
        isTouch: uiState.layout === 'mobile' || uiState.layout === 'tablet',
        isLandscape: uiState.orientation === 'landscape',
        isPortrait: uiState.orientation === 'portrait'
      };
    }

    // RPG-11-07: Keyboard focus management (roving focus + modal focus trap)
    const focusState = { order: [], index: 0, trapped: false, trapStack: [] };
    function setFocusOrder(ids) {
      const list = arr(ids).filter(id => typeof id === 'string' && id.trim()).map(id => id.trim());
      focusState.order = list;
      focusState.index = 0;
      return { ok: true, count: list.length, order: list.slice() };
    }

    function focusNext() {
      if (!focusState.order.length) return { ok: false, reason: 'no-focus-order' };
      focusState.index = (focusState.index + 1) % focusState.order.length;
      return { ok: true, focused: focusState.order[focusState.index], index: focusState.index };
    }

    function focusPrev() {
      if (!focusState.order.length) return { ok: false, reason: 'no-focus-order' };
      focusState.index = (focusState.index - 1 + focusState.order.length) % focusState.order.length;
      return { ok: true, focused: focusState.order[focusState.index], index: focusState.index };
    }

    function focusElement(id) {
      const idx = focusState.order.indexOf(id);
      if (idx === -1) return { ok: false, reason: 'element-not-in-order' };
      focusState.index = idx;
      return { ok: true, focused: id, index: idx };
    }

    // Trap focus to a set of ids (used while a modal is open); returns the active trap
    function trapFocus(ids) {
      const list = arr(ids).filter(id => typeof id === 'string' && id.trim()).map(id => id.trim());
      if (!list.length) return { ok: false, reason: 'empty-trap' };
      const trap = { ids: list, index: 0, createdAt: now() };
      focusState.trapStack.push(trap);
      focusState.trapped = true;
      return { ok: true, trapped: true, ids: list.slice(), depth: focusState.trapStack.length };
    }

    function releaseFocusTrap() {
      const released = focusState.trapStack.pop();
      focusState.trapped = focusState.trapStack.length > 0;
      return { ok: !!released, released: released ? released.ids.slice() : null, trapped: focusState.trapped };
    }

    function getFocusState() {
      return {
        order: focusState.order.slice(),
        index: focusState.index,
        focused: focusState.order[focusState.index] || null,
        trapped: focusState.trapped,
        depth: focusState.trapStack.length
      };
    }

    // RPG-11-08: Screen reader labels (aria-label registry for controls)
    const srLabels = new Map();
    function setScreenReaderLabel(key, label) {
      const k = text(key);
      if (!k) return { ok: false, reason: 'missing-key' };
      const value = text(label);
      if (!value) { srLabels.delete(k); return { ok: true, removed: true, key: k }; }
      srLabels.set(k, value);
      return { ok: true, key: k, label: value };
    }

    function getScreenReaderLabel(key) {
      return srLabels.get(text(key)) || null;
    }

    function listScreenReaderLabels() {
      return Array.from(srLabels.entries()).map(([key, label]) => ({ key, label }));
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
      // Derive text direction from the locale: RTL languages flip the UI to RTL,
      // and switching back to an LTR locale must restore LTR (otherwise the app
      // stays stuck in RTL after a user leaves Arabic).
      uiState.rtl = RTL_LANGUAGES.includes(l);
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
        off: { enabled: false, duration: 0, easing: 'linear', transitions: false, particles: false, reduceMotion: true },
        reduced: { enabled: true, duration: 100, easing: 'ease-out', transitions: true, particles: false, reduceMotion: true },
        normal: { enabled: true, duration: 250, easing: 'ease-in-out', transitions: true, particles: true, reduceMotion: false },
        enhanced: { enabled: true, duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', transitions: true, particles: true, reduceMotion: false }
      };
      const config = configs[speed] || configs.normal;
      return Object.assign({ speed }, config);
    }

    function setAnimationSpeed(speed) {
      if (!ANIMATION_SPEEDS.includes(speed)) return { ok: false, reason: 'invalid-speed' };
      uiState.animationSpeed = speed;
      settings.display.animationSpeed = speed;
      // Both 'off' and 'reduced' honor a reduced-motion preference.
      settings.display.reduceMotion = speed === 'off' || speed === 'reduced';
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

    // RPG-11-11: Custom typography (user-configurable app font family + scale)
    const customTypography = {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      headingFontFamily: 'inherit',
      fontScale: 1, // multiplier applied to base sizes
      baseSizePx: 16,
      monospace: 'ui-monospace, "Cascadia Code", monospace',
      allowUserFonts: true
    };

    function setCustomTypography(input) {
      const i = obj(input);
      const errors = [];
      if (i.fontFamily !== undefined) {
        const v = text(i.fontFamily);
        if (!v) errors.push({ field: 'fontFamily', message: 'empty' });
        else customTypography.fontFamily = v;
      }
      if (i.headingFontFamily !== undefined) customTypography.headingFontFamily = text(i.headingFontFamily) || 'inherit';
      if (i.monospace !== undefined) customTypography.monospace = text(i.monospace) || customTypography.monospace;
      if (i.fontScale !== undefined) {
        const n = Number(i.fontScale);
        if (!Number.isFinite(n) || n < 0.5 || n > 3) errors.push({ field: 'fontScale', message: 'must be 0.5..3' });
        else customTypography.fontScale = n;
      }
      if (i.baseSizePx !== undefined) {
        const n = Number(i.baseSizePx);
        if (!Number.isFinite(n) || n < 10 || n > 32) errors.push({ field: 'baseSizePx', message: 'must be 10..32' });
        else customTypography.baseSizePx = n;
      }
      if (typeof i.allowUserFonts === 'boolean') customTypography.allowUserFonts = i.allowUserFonts;
      if (errors.length) return { ok: false, reason: 'invalid-typography', errors };
      return { ok: true, typography: clone(customTypography) };
    }

    function getCustomTypography() {
      const t = clone(customTypography);
      t.scaledBasePx = Math.round(customTypography.baseSizePx * customTypography.fontScale);
      return t;
    }

    // RPG-11-12: Story typography (prose rendering presets for narrative text)
    const STORY_TYPOGRAPHY_PRESETS = Object.freeze({
      classic: { fontFamily: 'serif', fontSize: 18, lineHeight: 1.7, paragraphSpacing: 12, italicizeThoughts: true, dropCaps: false },
      modern: { fontFamily: 'sans-serif', fontSize: 16, lineHeight: 1.6, paragraphSpacing: 10, italicizeThoughts: true, dropCaps: false },
      immersive: { fontFamily: 'serif', fontSize: 20, lineHeight: 1.85, paragraphSpacing: 16, italicizeThoughts: true, dropCaps: true },
      compact: { fontFamily: 'sans-serif', fontSize: 14, lineHeight: 1.45, paragraphSpacing: 6, italicizeThoughts: false, dropCaps: false }
    });
    let storyTypography = Object.assign({ preset: 'classic' }, clone(STORY_TYPOGRAPHY_PRESETS.classic));

    function setStoryTypography(input) {
      const i = obj(input);
      if (i.preset) {
        const p = STORY_TYPOGRAPHY_PRESETS[i.preset];
        if (!p) return { ok: false, reason: 'invalid-preset' };
        storyTypography = Object.assign({ preset: i.preset }, clone(p));
      }
      // Allow safe per-field overrides on top of the preset
      if (i.fontSize !== undefined) storyTypography.fontSize = clamp(i.fontSize, 12, 32);
      if (i.lineHeight !== undefined) storyTypography.lineHeight = clamp(i.lineHeight, 1, 2.5);
      if (i.paragraphSpacing !== undefined) storyTypography.paragraphSpacing = clamp(i.paragraphSpacing, 0, 40);
      if (typeof i.italicizeThoughts === 'boolean') storyTypography.italicizeThoughts = i.italicizeThoughts;
      if (typeof i.dropCaps === 'boolean') storyTypography.dropCaps = i.dropCaps;
      if (i.fontFamily) storyTypography.fontFamily = text(i.fontFamily) || storyTypography.fontFamily;
      return { ok: true, typography: clone(storyTypography) };
    }

    function getStoryTypography() {
      return clone(storyTypography);
    }

    function listStoryTypographyPresets() {
      return Object.keys(STORY_TYPOGRAPHY_PRESETS).map(name => ({ preset: name, config: clone(STORY_TYPOGRAPHY_PRESETS[name]) }));
    }

    // RPG-11-14: World dashboard (aggregate overview used by the world dashboard screen)
    function renderWorldDashboard(input) {
      const i = obj(input);
      const stats = obj(i.stats);
      const quests = arr(i.quests);
      const characters = arr(i.characters);
      const locations = arr(i.locations);
      return {
        worldId: text(i.worldId),
        title: text(i.title) || 'World Dashboard',
        summary: {
          characterCount: characters.length,
          activeCharacters: characters.filter(c => c.status === 'active' || c.control === 'player').length,
          locationCount: locations.length,
          questCount: quests.length,
          activeQuests: quests.filter(q => q.status === 'active').length,
          completedQuests: quests.filter(q => q.status === 'completed').length
        },
        stats: {
          sessions: Number(stats.sessions) || 0,
          events: Number(stats.events) || 0,
          playtimeMinutes: Number(stats.playtimeMinutes) || 0,
          canonEntries: Number(stats.canonEntries) || 0
        },
        sections: ['overview', 'characters', 'quests', 'locations', 'canon', 'timeline'],
        updatedAt: now()
      };
    }

    // RPG-11-15: Contextual command palette (searchable command registry, Ctrl/Cmd-K)
    const commandRegistry = new Map();
    function registerCommand(input) {
      const i = obj(input);
      const id = text(i.id) || stableId('cmd', nextId());
      if (!text(i.title)) return { ok: false, reason: 'missing-title' };
      const command = {
        id,
        title: text(i.title),
        category: text(i.category) || 'general',
        keywords: uniq(arr(i.keywords)),
        shortcut: text(i.shortcut) || null,
        context: text(i.context) || 'global',
        enabled: i.enabled !== false,
        run: typeof i.run === 'function' ? i.run : null
      };
      commandRegistry.set(id, command);
      return { ok: true, id, command: Object.assign({}, command, { run: command.run ? '[fn]' : null }) };
    }

    function unregisterCommand(id) {
      if (!commandRegistry.has(id)) return { ok: false, reason: 'command-not-found' };
      commandRegistry.delete(id);
      return { ok: true, id };
    }

    // Contextual search: only commands visible in the current context (a command's
    // own context or 'global') are eligible; matches are ranked by relevance.
    function queryCommands(input) {
      const i = obj(input);
      const q = text(i.query).toLowerCase();
      const context = text(i.context) || 'global';
      const candidates = Array.from(commandRegistry.values()).filter(c => c.enabled);
      const scored = candidates.map(c => {
        // Contextual visibility: world-only commands stay hidden during combat, etc.
        const inContext = c.context === context || c.context === 'global';
        if (!inContext) return null;
        let score = c.context === context ? 2 : 1;
        if (q) {
          const hay = (c.title + ' ' + c.category + ' ' + c.keywords.join(' ')).toLowerCase();
          if (!hay.includes(q)) return null;
          if (c.title.toLowerCase().includes(q)) score += 10;
          if (c.keywords.some(k => k.toLowerCase().includes(q))) score += 5;
        }
        return { command: c, score };
      }).filter(Boolean);
      scored.sort((a, b) => b.score - a.score || a.command.title.localeCompare(b.command.title));
      const limit = Number(i.limit) > 0 ? Number(i.limit) : 20;
      return scored.slice(0, limit).map(s => ({
        id: s.command.id,
        title: s.command.title,
        category: s.command.category,
        shortcut: s.command.shortcut,
        context: s.command.context,
        score: s.score
      }));
    }

    function runCommand(id, payload) {
      const c = commandRegistry.get(id);
      if (!c) return { ok: false, reason: 'command-not-found' };
      if (!c.enabled) return { ok: false, reason: 'command-disabled' };
      if (!c.run) return { ok: true, id, dryRun: true, payload: clone(payload) };
      const result = c.run(payload);
      return { ok: true, id, result: result === undefined ? null : clone(result) };
    }

    function listCommands() {
      return Array.from(commandRegistry.values()).map(c => ({
        id: c.id, title: c.title, category: c.category,
        shortcut: c.shortcut, context: c.context, enabled: c.enabled
      }));
    }

    // RPG-11-16: Loading / offline state projection
    function setLoading(loading, label) {
      uiState.loading = loading === true;
      uiState.loadingLabel = uiState.loading ? (text(label) || 'Loading…') : null;
      uiState.lastUpdated = now();
      return { ok: true, loading: uiState.loading, label: uiState.loadingLabel };
    }

    function setConnectionState(state) {
      const valid = ['online', 'offline', 'reconnecting', 'degraded'];
      if (!valid.includes(state)) return { ok: false, reason: 'invalid-state' };
      uiState.connectionState = state;
      uiState.lastUpdated = now();
      return { ok: true, connectionState: state, offline: state === 'offline' };
    }

    function getLoadingState() {
      return {
        loading: uiState.loading === true,
        label: uiState.loadingLabel || null,
        connectionState: uiState.connectionState || 'online',
        offline: (uiState.connectionState || 'online') === 'offline',
        // A user-facing status string for loading/offline indicators
        status: uiState.loading ? 'loading' : ((uiState.connectionState || 'online') === 'offline' ? 'offline' : 'ready')
      };
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

    // RPG-11-01: RPG-only app shell (declares the standalone shell contract:
    // the shell exposes ONLY RPG surfaces and hides every non-RPG workspace)
    const APP_SHELL = Object.freeze({
      name: 'Seven RPG',
      mode: 'standalone',
      surfaces: ['world', 'session', 'story', 'characters', 'canon', 'settings'],
      hiddenWorkspaces: 'all-non-rpg',
      entry: 'rpg-standalone-entry'
    });
    function getAppShell() {
      return clone(APP_SHELL);
    }

    // Returns only the surfaces the RPG shell exposes (contract for "RPG-only")
    function getShellSurfaces() {
      return APP_SHELL.surfaces.slice();
    }

    // RPG-11-13: Character cards (compact visual card for a character roster)
    function renderCharacterCard(input) {
      const i = obj(input);
      const stats = obj(i.stats);
      const hp = Number(stats.hp), maxHp = Number(stats.maxHp) || (hp > 0 ? hp : 0);
      const name = text(i.name) || 'Unknown';
      return {
        id: text(i.id) || stableId('ccard', nextId()),
        name,
        portrait: text(i.portrait) || null,
        subtitle: text(i.subtitle),
        level: Number(i.level) || 1,
        className: text(i.className) || text(i.klass) || 'Adventurer',
        status: text(i.status) || 'active',
        hp, maxHp,
        hpPercent: maxHp > 0 ? Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100))) : 0,
        attributes: Object.keys(stats).reduce((acc, k) => {
          if (k !== 'hp' && k !== 'maxHp') acc[k] = stats[k];
          return acc;
        }, {}),
        tags: uniq(arr(i.tags)),
        accentColor: text(i.accentColor) || null,
        createdAt: now()
      };
    }

    function getCharacterCard(id) {
      // Character cards are stateless projections; re-render by id is not stored.
      return null;
    }

    return {
      LAYOUT_MODES, THEMES, DICE_TYPES, PANEL_TYPES,
      NOTIFICATION_LEVELS, SOUND_EVENTS, ACCESSIBILITY_MODES, ANIMATION_SPEEDS,
      ORIENTATIONS, STORY_TYPOGRAPHY_PRESETS,
      setLayout, getLayout, setOrientation,
      setRtl, setLanguage, getTextDirection, getLocalizedText,
      createSceneCard, getSceneCard, updateSceneCard,
      renderTurnOrder,
      createDialoguePanel, addDialogueEntry, getDialoguePanel,
      createChoicesPanel, selectChoice, getChoicesPanel,
      rollDice, getDiceHistory,
      renderCharacterSheet,
      renderCharacterCard,
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
      setStoryTypography, getStoryTypography, listStoryTypographyPresets,
      setCustomTypography, getCustomTypography,
      renderWorldDashboard,
      registerCommand, unregisterCommand, queryCommands, runCommand, listCommands,
      setFocusOrder, focusNext, focusPrev, focusElement, trapFocus, releaseFocusTrap, getFocusState,
      setScreenReaderLabel, getScreenReaderLabel, listScreenReaderLabels,
      setLoading, setConnectionState, getLoadingState,
      getAppShell, getShellSurfaces,
      openModal, closeModal,
      getUiState
    };
  }

  return { createUiManager };
});
