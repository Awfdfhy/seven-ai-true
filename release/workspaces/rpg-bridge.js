(function(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgBridge = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(root) {
  'use strict';

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }
  function clamp(v, min, max) { v = Number(v); return Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : min; }
  function now() { return new Date().toISOString(); }

  // Bridge singleton state
  let stateApi = null;
  let progressionApi = null;
  let combatApi = null;
  let workspaceApi = null;

  let activeProgression = null;
  let activeCombat = null;
  let currentEncounterId = null;
  let currentWorldId = null;
  let currentRoomId = null;

  const DEFAULT_HERO_ID = 'hero';

  function resolveApis() {
    stateApi = stateApi || (root && root.SevenRpgState) || (typeof require === 'function' ? require('./rpg-state.js') : null);
    progressionApi = progressionApi || (root && root.SevenRpgProgression) || (typeof require === 'function' ? require('./rpg-progression.js') : null);
    combatApi = combatApi || (root && root.SevenRpgCombat) || (typeof require === 'function' ? require('./rpg-combat.js') : null);
    workspaceApi = workspaceApi || (root && root.SevenRpgWorkspace) || null;
    return { stateApi, progressionApi, combatApi, workspaceApi };
  }

  function activeContext() {
    let roomId = 'default';
    try {
      if (root && typeof root.getConversationState === 'function') {
        const s = root.getConversationState();
        if (s && s.roomId) roomId = String(s.roomId);
      }
    } catch (_) {}
    let worldId = 'default';
    if (workspaceApi && workspaceApi.state) {
      const we = workspaceApi.state.worldEngine;
      if (we && we.work && (we.work.id || we.work.title)) worldId = String(we.work.id || we.work.title);
      else if (workspaceApi.state.liveWorldId) worldId = String(workspaceApi.state.liveWorldId);
    }
    return { roomId, worldId };
  }

  function getStorageKey(roomId, worldId) {
    return 'seven_rpg_bridge_v1:' + encodeURIComponent(roomId) + ':' + encodeURIComponent(worldId);
  }

  function loadPersistedBridge(roomId, worldId) {
    if (!root || !root.localStorage) return null;
    try {
      const raw = root.localStorage.getItem(getStorageKey(roomId, worldId));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function savePersistedBridge(roomId, worldId, payload) {
    if (!root || !root.localStorage) return false;
    try {
      const key = getStorageKey(roomId, worldId);
      root.localStorage.setItem(key, JSON.stringify(payload));
      // Mirror to IndexedDB if SevenRpgLiveIntegration is available
      if (root.indexedDB) {
        try {
          const req = root.indexedDB.open('seven_rpg_durable_v1', 1);
          req.onsuccess = function() {
            const db = req.result;
            if (db.objectStoreNames.contains('kv')) {
              const tx = db.transaction('kv', 'readwrite');
              tx.objectStore('kv').put(JSON.stringify(payload), key);
            }
          };
        } catch (_) {}
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function initManagers(persistedState) {
    resolveApis();
    if (!stateApi || !progressionApi || !combatApi) {
      throw new Error('Required RPG backend engines missing for SevenRpgBridge');
    }
    activeProgression = progressionApi.createProgressionManager(stateApi);
    activeCombat = combatApi.createCombatManager(stateApi);

    if (persistedState && persistedState.progression) {
      try {
        activeProgression.importState(persistedState.progression);
      } catch (_) {}
    }
    if (persistedState && persistedState.combat) {
      try {
        activeCombat.importState(persistedState.combat);
      } catch (_) {}
    }

    // Ensure player character exists with standard starter pack
    ensurePlayerCharacter();
  }

  function ensurePlayerCharacter() {
    if (!activeProgression) return null;
    let char = activeProgression.getCharacterProgression(DEFAULT_HERO_ID);
    if (!char) {
      char = activeProgression.createCharacterProgression({
        id: DEFAULT_HERO_ID,
        name: 'البطل · Hero',
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        attributes: {
          strength: 12,
          dexterity: 12,
          constitution: 14,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        },
        health: { current: 100, max: 100 },
        mana: { current: 50, max: 50 },
        stamina: { current: 100, max: 100 }
      });

      // Populate Starter Items
      const starterItems = [
        {
          id: 'item_health_potion',
          name: 'جرعة شفاء · Health Potion',
          description: 'تستعيد 40 نقطة صحة على الفور.',
          type: 'consumable',
          rarity: 'common',
          value: 15,
          effects: { heal: 40 },
          stackable: true,
          quantity: 3
        },
        {
          id: 'item_mana_potion',
          name: 'جرعة مانا · Mana Potion',
          description: 'تستعيد 30 نقطة مانا للمهارات.',
          type: 'consumable',
          rarity: 'common',
          value: 15,
          effects: { mana: 30 },
          stackable: true,
          quantity: 2
        },
        {
          id: 'item_iron_sword',
          name: 'سيف حديدي · Iron Sword',
          description: 'سيف صلب يمنح هجومًا إضافيًا (+8 هجوم).',
          type: 'weapon',
          rarity: 'common',
          value: 30,
          stats: { attack: 8 },
          stackable: false,
          quantity: 1
        },
        {
          id: 'item_leather_armor',
          name: 'درع جلدي · Leather Armor',
          description: 'سترة جلدية خفيفة تمنح حماية جيدة (+5 دفاع).',
          type: 'armor',
          rarity: 'common',
          value: 25,
          stats: { defense: 5 },
          stackable: false,
          quantity: 1
        },
        {
          id: 'item_travel_bread',
          name: 'خبز السفر · Travel Bread',
          description: 'طعام يمنح طاقة ويستعيد 15 نقطة صحة.',
          type: 'consumable',
          rarity: 'common',
          value: 5,
          effects: { heal: 15 },
          stackable: true,
          quantity: 4
        },
        {
          id: 'item_realm_map',
          name: 'خريطة الأراضي · Realm Map',
          description: 'خريطة قديمة توضح المعالم والبلدات المجاورة.',
          type: 'quest-item',
          rarity: 'uncommon',
          value: 50,
          stackable: false,
          quantity: 1
        }
      ];

      for (const it of starterItems) {
        activeProgression.createItem(it);
        activeProgression.addToInventory(DEFAULT_HERO_ID, it.id, it.quantity);
      }

      // Equip starter weapon & armor
      activeProgression.equipItem(DEFAULT_HERO_ID, 'item_iron_sword', 'main-hand');
      activeProgression.equipItem(DEFAULT_HERO_ID, 'item_leather_armor', 'chest');

      // Initialize Prologue Quest
      activeProgression.createQuest({
        id: 'quest_prologue',
        title: 'صحوة البطل · The Awakening',
        description: 'بداية الرحلة في هذا العالم. تفقد حقيبتك وعتادك، واكتشف المعالم المحيطة.',
        status: 'active',
        type: 'main',
        objectives: [
          { id: 'obj_equip', description: 'تجهيز السلاح والدرع · Equip starter gear', required: 1, current: 1, completed: true },
          { id: 'obj_explore', description: 'استكشاف المشهد الأول · Explore opening scene', required: 1, current: 0, completed: false },
          { id: 'obj_interact', description: 'خوض أول تفاعل أو معركة · First interaction', required: 1, current: 0, completed: false }
        ],
        rewards: { xp: 50, gold: 20 }
      });
      activeProgression.acceptQuest('quest_prologue', DEFAULT_HERO_ID);
    }
    return char;
  }

  function ensureReady() {
    const ctx = activeContext();
    if (!activeProgression || currentRoomId !== ctx.roomId || currentWorldId !== ctx.worldId) {
      currentRoomId = ctx.roomId;
      currentWorldId = ctx.worldId;
      const persisted = loadPersistedBridge(currentRoomId, currentWorldId);
      initManagers(persisted);
    }
    return activeProgression;
  }

  function notifyChange() {
    const ctx = activeContext();
    if (activeProgression && activeCombat) {
      const snap = {
        progression: activeProgression.exportState(),
        combat: activeCombat.exportState(),
        updatedAt: now()
      };
      savePersistedBridge(ctx.roomId, ctx.worldId, snap);
    }
    if (root && root.document && typeof root.document.dispatchEvent === 'function') {
      root.document.dispatchEvent(new CustomEvent('seven:rpg-state-updated', {
        detail: getPlayerSummary()
      }));
    }
  }

  function getPlayerSummary() {
    ensureReady();
    const char = activeProgression.getCharacterProgression(DEFAULT_HERO_ID);
    if (!char) return null;
    const inventory = activeProgression.getInventory(DEFAULT_HERO_ID);
    const quests = activeProgression.getQuestJournal(DEFAULT_HERO_ID);
    const equipment = char.equipment || {};

    let totalAttack = 5 + Math.floor((char.attributes.strength - 10) / 2);
    let totalDefense = 2 + Math.floor((char.attributes.constitution - 10) / 2);

    for (const [slot, itemId] of Object.entries(equipment)) {
      const it = inventory.find(i => i.id === itemId);
      if (it && it.stats) {
        if (it.stats.attack) totalAttack += Number(it.stats.attack) || 0;
        if (it.stats.defense) totalDefense += Number(it.stats.defense) || 0;
      }
    }

    return {
      id: char.id,
      name: char.name,
      level: char.level,
      xp: char.xp,
      xpToNextLevel: char.xpToNextLevel,
      totalXpEarned: char.totalXpEarned,
      health: char.health,
      mana: char.mana,
      stamina: char.stamina,
      attributes: char.attributes,
      combatStats: {
        attack: totalAttack,
        defense: totalDefense
      },
      equipment,
      inventory,
      quests,
      inCombat: currentEncounterId !== null,
      encounterId: currentEncounterId
    };
  }

  // --- Core Game Actions ---

  function useItem(itemId) {
    ensureReady();
    const char = activeProgression.getCharacterProgression(DEFAULT_HERO_ID);
    if (!char) return { ok: false, reason: 'character-not-found' };

    const inv = activeProgression.getInventory(DEFAULT_HERO_ID);
    const item = inv.find(i => i.id === itemId);
    if (!item) return { ok: false, reason: 'item-not-in-inventory' };

    if (item.type !== 'consumable') {
      return { ok: false, reason: 'item-not-consumable' };
    }

    const effects = item.effects || {};
    let healed = 0;
    let restoredMana = 0;

    if (effects.heal) {
      const amount = Number(effects.heal) || 0;
      const oldHp = char.health.current;
      char.health.current = Math.min(char.health.max, char.health.current + amount);
      healed = char.health.current - oldHp;
    }

    if (effects.mana) {
      const amount = Number(effects.mana) || 0;
      const oldMp = char.mana.current;
      char.mana.current = Math.min(char.mana.max, char.mana.current + amount);
      restoredMana = char.mana.current - oldMp;
    }

    // Deduct 1 count from inventory
    activeProgression.removeFromInventory(DEFAULT_HERO_ID, itemId, 1);
    notifyChange();

    return {
      ok: true,
      item: clone(item),
      healed,
      restoredMana,
      health: clone(char.health),
      mana: clone(char.mana)
    };
  }

  function equipItem(itemId, slot) {
    ensureReady();
    const res = activeProgression.equipItem(DEFAULT_HERO_ID, itemId, slot);
    if (res.ok) {
      notifyChange();
    }
    return res;
  }

  function unequipItem(slot) {
    ensureReady();
    const res = activeProgression.unequipItem(DEFAULT_HERO_ID, slot);
    if (res.ok) {
      notifyChange();
    }
    return res;
  }

  function addXp(amount) {
    ensureReady();
    const res = activeProgression.addXp(DEFAULT_HERO_ID, amount);
    notifyChange();
    return res;
  }

  function allocateAttribute(attrName) {
    ensureReady();
    const char = activeProgression.getCharacterProgression(DEFAULT_HERO_ID);
    if (!char || !char.attributes || !char.attributes.hasOwnProperty(attrName)) {
      return { ok: false, reason: 'invalid-attribute' };
    }
    char.attributes[attrName] = clamp(char.attributes[attrName] + 1, 1, 30);
    if (attrName === 'constitution') {
      char.health.max += 5;
      char.health.current += 5;
    } else if (attrName === 'intelligence') {
      char.mana.max += 5;
      char.mana.current += 5;
    }
    notifyChange();
    return { ok: true, attributes: clone(char.attributes) };
  }

  function rest() {
    ensureReady();
    const char = activeProgression.getCharacterProgression(DEFAULT_HERO_ID);
    if (!char) return { ok: false };
    char.health.current = char.health.max;
    char.mana.current = char.mana.max;
    char.stamina.current = char.stamina.max;
    notifyChange();
    return { ok: true, health: clone(char.health), mana: clone(char.mana) };
  }

  function advanceQuestObjective(questId, objectiveIndex) {
    ensureReady();
    const quests = activeProgression.getQuestJournal(DEFAULT_HERO_ID);
    const q = quests.find(x => x.id === questId);
    if (!q) return { ok: false, reason: 'quest-not-found' };

    const objs = q.objectives || [];
    if (!objs[objectiveIndex]) return { ok: false, reason: 'objective-not-found' };

    objs[objectiveIndex].completed = true;
    objs[objectiveIndex].current = objs[objectiveIndex].required || 1;

    const allDone = objs.every(o => o.completed);
    if (allDone && q.status !== 'completed') {
      activeProgression.completeQuest(questId, DEFAULT_HERO_ID);
      if (q.rewards && q.rewards.xp) {
        activeProgression.addXp(DEFAULT_HERO_ID, q.rewards.xp);
      }
    }
    notifyChange();
    return { ok: true, quest: clone(q), allDone };
  }

  // --- Combat Integration ---

  function startCombat(encounterOptions) {
    ensureReady();
    const opts = obj(encounterOptions);
    const enemyName = text(opts.enemyName) || 'وحش الغابة · Wild Beast';
    const enemyHp = clamp(opts.enemyHp || 60, 10, 500);
    const enemyAtk = clamp(opts.enemyAtk || 8, 2, 50);

    const enc = activeCombat.createEncounter({
      title: 'معركة ضد ' + enemyName,
      locationId: text(opts.locationId) || 'arena'
    });
    currentEncounterId = enc.id;

    // Register Player
    const player = getPlayerSummary();
    activeCombat.addCombatant({
      id: DEFAULT_HERO_ID,
      encounterId: enc.id,
      name: player.name,
      type: 'player',
      health: { current: player.health.current, max: player.health.max },
      defense: player.combatStats.defense,
      dexterity: player.attributes.dexterity
    });

    // Register Enemy
    const enemyId = 'enemy_' + Date.now().toString(36);
    activeCombat.addCombatant({
      id: enemyId,
      encounterId: enc.id,
      name: enemyName,
      type: 'enemy',
      health: { current: enemyHp, max: enemyHp },
      defense: 3,
      dexterity: 10
    });
    activeCombat.rollInitiative(enc.id);

    notifyChange();
    return {
      ok: true,
      encounterId: enc.id,
      enemy: { id: enemyId, name: enemyName, hp: enemyHp, maxHp: enemyHp },
      combatState: getCombatState()
    };
  }

  function getCombatState() {
    if (!currentEncounterId || !activeCombat) return null;
    const enc = activeCombat.getEncounter(currentEncounterId);
    if (!enc) return null;
    const combatants = (enc.combatants || []).map(cid => activeCombat.getCombatant(cid)).filter(Boolean);
    const player = combatants.find(c => c.id === DEFAULT_HERO_ID) || null;
    const enemies = combatants.filter(c => c.type === 'enemy' && c.alive !== false);
    const log = activeCombat.getCombatLog(currentEncounterId);
    return {
      encounter: clone(enc),
      player: clone(player),
      enemies: clone(enemies),
      log: clone(log).slice(-10)
    };
  }

  function performCombatAction(actionType, extra) {
    if (!currentEncounterId || !activeCombat) return { ok: false, reason: 'no-active-encounter' };
    const encState = getCombatState();
    if (!encState || !encState.player || !encState.enemies.length) return { ok: false, reason: 'invalid-encounter-state' };

    const targetEnemy = encState.enemies[0];
    const player = encState.player;
    const char = activeProgression.getCharacterProgression(DEFAULT_HERO_ID);
    const combatLog = [];

    // --- 1. Player Action ---
    if (actionType === 'attack') {
      const roll = Math.floor(Math.random() * 20) + 1;
      const isCrit = roll >= 19;
      let dmg = Math.max(1, (player.stats.attack || 8) - (targetEnemy.stats.defense || 2));
      if (isCrit) dmg = Math.floor(dmg * 1.8);
      
      const res = activeCombat.damageCombatant(targetEnemy.id, dmg, 'slashing');
      combatLog.push({
        actor: player.name,
        action: 'attack',
        text: (isCrit ? 'ضربة حاسمة! ' : '') + `${player.name} هاجم ${targetEnemy.name} وألحق ${dmg} ضرر.`,
        damage: dmg,
        isCrit
      });

      if (res.died || res.remaining <= 0) {
        // Enemy defeated!
        currentEncounterId = null;
        const xpEarned = 40;
        activeProgression.addXp(DEFAULT_HERO_ID, xpEarned);
        combatLog.push({
          actor: 'system',
          action: 'victory',
          text: `تم القضاء على ${targetEnemy.name}! حصلت على ${xpEarned} نقطة خبرة.`
        });
        notifyChange();
        return {
          ok: true,
          status: 'victory',
          log: combatLog,
          player: getPlayerSummary()
        };
      }
    } else if (actionType === 'skill') {
      if (char.mana.current < 15) {
        return { ok: false, reason: 'insufficient-mana' };
      }
      char.mana.current -= 15;
      const dmg = Math.floor((player.stats.attack || 8) * 1.6);
      const res = activeCombat.damageCombatant(targetEnemy.id, dmg, 'fire');
      combatLog.push({
        actor: player.name,
        action: 'skill',
        text: `أطلق ${player.name} ضربة المهارة النارية على ${targetEnemy.name} وألحق ${dmg} ضرر!`,
        damage: dmg
      });

      if (res.died || res.remaining <= 0) {
        currentEncounterId = null;
        const xpEarned = 50;
        activeProgression.addXp(DEFAULT_HERO_ID, xpEarned);
        combatLog.push({
          actor: 'system',
          action: 'victory',
          text: `تم القضاء على ${targetEnemy.name}! حصلت على ${xpEarned} نقطة خبرة.`
        });
        notifyChange();
        return {
          ok: true,
          status: 'victory',
          log: combatLog,
          player: getPlayerSummary()
        };
      }
    } else if (actionType === 'item') {
      const useRes = useItem(extra || 'item_health_potion');
      if (!useRes.ok) return useRes;
      combatLog.push({
        actor: player.name,
        action: 'item',
        text: `${player.name} استخدم ${useRes.item.name} واستعاد ${useRes.healed} صحة.`
      });
    } else if (actionType === 'flee') {
      const fleeSuccess = Math.random() > 0.4;
      if (fleeSuccess) {
        currentEncounterId = null;
        combatLog.push({
          actor: player.name,
          action: 'flee',
          text: `نجح ${player.name} في التراجع والهروب بسلام.`
        });
        notifyChange();
        return {
          ok: true,
          status: 'fled',
          log: combatLog,
          player: getPlayerSummary()
        };
      } else {
        combatLog.push({
          actor: player.name,
          action: 'flee-failed',
          text: `فشلت محاولة الهروب! العدو يمنع الانسحاب.`
        });
      }
    }

    // --- 2. Enemy Action (if still alive and in combat) ---
    if (targetEnemy.health.current > 0) {
      const enemyDmg = Math.max(1, (targetEnemy.stats.attack || 6) - (player.stats.defense || 2));
      char.health.current = Math.max(0, char.health.current - enemyDmg);
      activeCombat.damageCombatant(DEFAULT_HERO_ID, enemyDmg, 'bludgeoning');
      combatLog.push({
        actor: targetEnemy.name,
        action: 'attack',
        text: `رد ${targetEnemy.name} بهجوم مضاد وألحق ${enemyDmg} ضرر بـ ${player.name}.`,
        damage: enemyDmg
      });

      if (char.health.current <= 0) {
        // Player defeated
        currentEncounterId = null;
        combatLog.push({
          actor: 'system',
          action: 'defeat',
          text: `سقط البطل في المعركة! تم الإنعاش في المشهد بأدنى صحة.`
        });
        char.health.current = Math.floor(char.health.max * 0.25);
        notifyChange();
        return {
          ok: true,
          status: 'defeat',
          log: combatLog,
          player: getPlayerSummary()
        };
      }
    }

    notifyChange();
    return {
      ok: true,
      status: 'active',
      log: combatLog,
      combatState: getCombatState(),
      player: getPlayerSummary()
    };
  }

  return {
    version: '2.5.0',
    init: resolveApis,
    getPlayerSummary,
    useItem,
    equipItem,
    unequipItem,
    addXp,
    allocateAttribute,
    rest,
    advanceQuestObjective,
    startCombat,
    getCombatState,
    performCombatAction,
    notifyChange
  };
});
