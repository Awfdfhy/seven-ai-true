(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgCombat = api;
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
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

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

  const COMBAT_STATUSES = Object.freeze(['active', 'paused', 'victory', 'defeat', 'retreat', 'surrender', 'fled']);
  const COMBATANT_TYPES = Object.freeze(['player', 'npc', 'ally', 'enemy', 'boss', 'summon']);
  const ACTION_TYPES = Object.freeze(['attack', 'defend', 'ability', 'item', 'move', 'wait', 'flee', 'surrender', 'grapple', 'cast']);
  const DAMAGE_TYPES = Object.freeze(['slashing', 'piercing', 'bludgeoning', 'fire', 'ice', 'lightning', 'poison', 'necrotic', 'radiant', 'psychic', 'force']);
  const INTENT_TYPES = Object.freeze(['attack', 'defend', 'ability', 'move', 'flee', 'heal', 'buff', 'debuff', 'grapple', 'unknown']);
  const DIFFICULTY_PROFILES = Object.freeze(['easy', 'normal', 'hard', 'deadly', 'custom']);

  function createCombatManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const encounters = new Map();
    const combatants = new Map();
    const combatLog = new Map();
    const balanceProfiles = new Map();
    let idCounter = 0;
    function nextId() { return ++idCounter; }

    // RNG state for deterministic replays
    let rngState = null;
    function seedRng(seed) {
      rngState = Number(seed) || Date.now();
    }
    function seededRandom() {
      if (rngState === null) return Math.random();
      rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
      return rngState / 0x7fffffff;
    }
    function seededInt(min, max) {
      return Math.floor(seededRandom() * (max - min + 1)) + min;
    }

    // RPG-10-01: Optional turn based combat
    function createEncounter(input) {
      const i = obj(input);
      const id = i.id || stableId('enc', nextId());
      const encounter = {
        id,
        name: text(i.name) || 'Combat Encounter',
        status: 'active',
        round: 0,
        turnOrder: [],
        currentTurnIndex: 0,
        combatants: [],
        locationId: text(i.locationId) || null,
        difficulty: DIFFICULTY_PROFILES.includes(i.difficulty) ? i.difficulty : 'normal',
        environment: obj(i.environment), // terrain, weather, lighting
        startedAt: now(),
        endedAt: null,
        victoryConditions: obj(i.victoryConditions),
        retreatAllowed: i.retreatAllowed !== false,
        surrenderAllowed: i.surrenderAllowed !== false,
        nonviolentOptions: i.nonviolentOptions !== false,
        metadata: obj(i.metadata),
        seed: Number(i.seed) || null,
        actionHistory: []
      };
      encounters.set(id, encounter);
      return encounter;
    }

    function getEncounter(id) { return encounters.get(id) || null; }

    function getActiveEncounters() {
      return Array.from(encounters.values()).filter(e => e.status === 'active');
    }

    // RPG-10-03: Initiative
    function addCombatant(input) {
      const i = obj(input);
      const id = i.id || stableId('cbt', nextId());
      const encounterId = text(i.encounterId);
      const encounter = encounters.get(encounterId);
      if (!encounter) return { ok: false, reason: 'encounter-not-found' };
      const combatant = {
        id,
        encounterId,
        name: text(i.name) || 'Combatant',
        type: COMBATANT_TYPES.includes(i.type) ? i.type : 'enemy',
        initiative: clamp(i.initiative ?? 0, 0, 50),
        initiativeRoll: clamp(i.initiativeRoll ?? 0, 1, 20),
        dexterity: clamp(i.dexterity ?? 10, 1, 30),
        health: { current: clamp(i.health?.current ?? 100, 0, 99999), max: clamp(i.health?.max ?? 100, 1, 99999) },
        resources: {
          mana: { current: clamp(i.resources?.mana?.current ?? 0, 0, 99999), max: clamp(i.resources?.mana?.max ?? 0, 0, 99999) },
          stamina: { current: clamp(i.resources?.stamina?.current ?? 0, 0, 99999), max: clamp(i.resources?.stamina?.max ?? 0, 0, 99999) }
        },
        actionPoints: clamp(i.actionPoints ?? 3, 0, 10),
        maxActionPoints: clamp(i.actionPoints ?? 3, 1, 10),
        defense: clamp(i.defense ?? 10, 0, 50),
        resistances: obj(i.resistances),
        weaknesses: obj(i.weaknesses),
        statusEffects: [],
        alive: true,
        fleeing: false,
        surrendered: false,
        stats: {
          attacksMade: 0, damageDealt: 0, damageTaken: 0,
          healingDone: 0, killsConfirmed: 0, critsLanded: 0
        },
        intent: null,
        createdAt: now()
      };
      combatants.set(id, combatant);
      encounter.combatants.push(id);
      // Calculate initiative
      combatant.initiative = combatant.initiativeRoll + Math.floor((combatant.dexterity - 10) / 2);
      return combatant;
    }

    function getCombatant(id) { return combatants.get(id) || null; }

    function rollInitiative(encounterId) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return { ok: false, reason: 'encounter-not-found' };
      const rng = encounter.seed != null ? seededInt : randomInt;
      for (const cbtId of encounter.combatants) {
        const cbt = combatants.get(cbtId);
        if (!cbt || !cbt.alive) continue;
        cbt.initiativeRoll = rng(1, 20);
        cbt.initiative = cbt.initiativeRoll + Math.floor((cbt.dexterity - 10) / 2);
      }
      // Sort by initiative (descending), then dexterity
      encounter.turnOrder = encounter.combatants
        .map(cid => combatants.get(cid))
        .filter(c => c && c.alive)
        .sort((a, b) => b.initiative - a.initiative || b.dexterity - a.dexterity)
        .map(c => c.id);
      encounter.currentTurnIndex = 0;
      encounter.round = 1;
      return {
        ok: true,
        turnOrder: encounter.turnOrder.map(cid => {
          const c = combatants.get(cid);
          return { id: cid, name: c.name, initiative: c.initiative };
        })
      };
    }

    // RPG-10-04: Turn order
    function getTurnOrder(encounterId) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return [];
      return encounter.turnOrder.map(cid => {
        const c = combatants.get(cid);
        if (!c) return null;
        return {
          id: c.id, name: c.name, type: c.type,
          initiative: c.initiative,
          health: c.health.current, maxHealth: c.health.max,
          alive: c.alive, actionPoints: c.actionPoints,
          isCurrentTurn: encounter.turnOrder[encounter.currentTurnIndex] === c.id
        };
      }).filter(Boolean);
    }

    function getCurrentTurn(encounterId) {
      const encounter = encounters.get(encounterId);
      if (!encounter || encounter.turnOrder.length === 0) return null;
      const currentId = encounter.turnOrder[encounter.currentTurnIndex];
      return combatants.get(currentId) || null;
    }

    function advanceTurn(encounterId) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return { ok: false, reason: 'encounter-not-found' };
      if (encounter.status !== 'active') return { ok: false, reason: 'encounter-not-active' };
      // Reset action points for current combatant
      const current = getCurrentTurn(encounterId);
      if (current) current.actionPoints = current.maxActionPoints;
      // Advance to next living combatant
      let attempts = 0;
      do {
        encounter.currentTurnIndex++;
        if (encounter.currentTurnIndex >= encounter.turnOrder.length) {
          encounter.currentTurnIndex = 0;
          encounter.round++;
          // Tick status effects at round start
          tickCombatStatusEffects(encounterId);
        }
        attempts++;
      } while (attempts <= encounter.turnOrder.length && !isAlive(encounter.turnOrder[encounter.currentTurnIndex]));
      return { ok: true, newRound: encounter.round, currentTurnId: encounter.turnOrder[encounter.currentTurnIndex] };
    }

    function isAlive(combatantId) {
      const c = combatants.get(combatantId);
      return c ? c.alive && c.health.current > 0 : false;
    }

    // RPG-10-05: Action points
    function spendActionPoints(combatantId, amount) {
      const cbt = combatants.get(combatantId);
      if (!cbt) return { ok: false, reason: 'combatant-not-found' };
      const cost = Math.max(1, Math.floor(amount || 1));
      if (cbt.actionPoints < cost) return { ok: false, reason: 'insufficient-action-points', available: cbt.actionPoints, required: cost };
      cbt.actionPoints -= cost;
      return { ok: true, remaining: cbt.actionPoints };
    }

    // RPG-10-06: Health and resources
    function damageCombatant(combatantId, amount, damageType, sourceId) {
      const cbt = combatants.get(combatantId);
      if (!cbt) return { ok: false, reason: 'combatant-not-found' };
      if (!cbt.alive) return { ok: false, reason: 'already-dead' };
      let dmg = Math.max(0, Math.floor(amount));
      const type = DAMAGE_TYPES.includes(damageType) ? damageType : 'bludgeoning';
      // Apply resistances and weaknesses
      const resistance = clamp(cbt.resistances[type] ?? 0, 0, 1);
      const weakness = clamp(cbt.weaknesses[type] ?? 0, 0, 2);
      dmg = Math.floor(dmg * (1 - resistance + weakness));
      // Apply defense reduction
      dmg = Math.max(1, dmg - Math.floor(cbt.defense / 5));
      cbt.health.current = Math.max(0, cbt.health.current - dmg);
      cbt.stats.damageTaken += dmg;
      if (sourceId) {
        const source = combatants.get(sourceId);
        if (source) source.stats.damageDealt += dmg;
      }
      let died = false;
      if (cbt.health.current <= 0) {
        cbt.alive = false;
        died = true;
        if (sourceId) {
          const source = combatants.get(sourceId);
          if (source) source.stats.killsConfirmed++;
        }
      }
      return { ok: true, damage: dmg, remaining: cbt.health.current, died, type };
    }

    function healCombatant(combatantId, amount, sourceId) {
      const cbt = combatants.get(combatantId);
      if (!cbt) return { ok: false, reason: 'combatant-not-found' };
      const heal = Math.max(0, Math.floor(amount));
      cbt.health.current = Math.min(cbt.health.max, cbt.health.current + heal);
      const actualHeal = cbt.health.current - (cbt.health.current - heal);
      if (sourceId) {
        const source = combatants.get(sourceId);
        if (source) source.stats.healingDone += heal;
      }
      return { ok: true, healed: heal, current: cbt.health.current };
    }

    // RPG-10-07: Skill resolution (via performAttack)
    function performAttack(attackerId, defenderId, options) {
      const attacker = combatants.get(attackerId);
      const defender = combatants.get(defenderId);
      if (!attacker) return { ok: false, reason: 'attacker-not-found' };
      if (!defender) return { ok: false, reason: 'defender-not-found' };
      if (!attacker.alive) return { ok: false, reason: 'attacker-dead' };
      if (!defender.alive) return { ok: false, reason: 'defender-dead' };
      const o = obj(options);
      const rng = o.seed != null ? seededInt : randomInt;
      // Spend action point
      const spendResult = spendActionPoints(attackerId, o.actionPointCost || 1);
      if (!spendResult.ok) return spendResult;
      // Attack roll (d20 + attack bonus)
      const attackBonus = clamp(o.attackBonus ?? Math.floor((attacker.dexterity - 10) / 2), -5, 20);
      const attackRoll = rng(1, 20);
      const totalAttack = attackRoll + attackBonus;
      const defenderDefense = defender.defense;
      const hit = attackRoll === 20 ? true : attackRoll === 1 ? false : totalAttack >= defenderDefense;
      const critical = attackRoll === 20;
      const fumble = attackRoll === 1;
      if (!hit) {
        attacker.stats.attacksMade++;
        return { ok: true, hit: false, critical: false, fumble, attackRoll, totalAttack, defense: defenderDefense, damage: 0 };
      }
      // Damage roll
      const baseDamage = clamp(o.baseDamage ?? 10, 1, 9999);
      const damageBonus = clamp(o.damageBonus ?? Math.floor((attacker.dexterity - 10) / 2), -5, 30);
      let damage = rng(1, baseDamage) + damageBonus;
      if (critical) damage *= 2;
      attacker.stats.attacksMade++;
      if (critical) attacker.stats.critsLanded++;
      const damageType = DAMAGE_TYPES.includes(o.damageType) ? o.damageType : 'slashing';
      const dmgResult = damageCombatant(defenderId, damage, damageType, attackerId);
      return {
        ok: true, hit: true, critical, fumble,
        attackRoll, attackBonus, totalAttack,
        defense: defenderDefense,
        damage: dmgResult.damage, damageType,
        defenderHealth: dmgResult.remaining,
        defenderDied: dmgResult.died
      };
    }

    // RPG-10-08: Status effects (reuse from progression or manage locally)
    const combatEffects = new Map();

    function applyCombatEffect(input) {
      const i = obj(input);
      const id = i.id || stableId('ceff', nextId());
      const effect = {
        id,
        combatantId: text(i.combatantId),
        name: text(i.name) || 'Effect',
        type: text(i.type) || 'debuff',
        duration: clamp(i.duration ?? 3, 0, 99),
        remaining: clamp(i.duration ?? 3, 0, 99),
        stacks: clamp(i.stacks ?? 1, 1, 99),
        magnitude: clamp(i.magnitude ?? 1, -999, 999),
        tickDamage: clamp(i.tickDamage ?? 0, 0, 999),
        tickHeal: clamp(i.tickHeal ?? 0, 0, 999),
        dispellable: i.dispellable !== false,
        appliedAt: now()
      };
      combatEffects.set(id, effect);
      const cbt = combatants.get(effect.combatantId);
      if (cbt) cbt.statusEffects.push(id);
      return effect;
    }

    function tickCombatStatusEffects(encounterId) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return { ok: false, reason: 'encounter-not-found' };
      const expired = [];
      for (const cbtId of encounter.combatants) {
        const cbt = combatants.get(cbtId);
        if (!cbt || !cbt.alive) continue;
        for (const effId of [...cbt.statusEffects]) {
          const effect = combatEffects.get(effId);
          if (!effect) continue;
          // Apply tick damage/heal
          if (effect.tickDamage > 0) {
            damageCombatant(cbtId, effect.tickDamage, 'force', null);
          }
          if (effect.tickHeal > 0) {
            healCombatant(cbtId, effect.tickHeal);
          }
          effect.remaining--;
          if (effect.remaining <= 0) {
            expired.push(effId);
            cbt.statusEffects = cbt.statusEffects.filter(e => e !== effId);
            combatEffects.delete(effId);
          }
        }
      }
      return { ok: true, expired };
    }

    function removeCombatEffect(effectId) {
      const effect = combatEffects.get(effectId);
      if (!effect) return { ok: false, reason: 'effect-not-found' };
      const cbt = combatants.get(effect.combatantId);
      if (cbt) cbt.statusEffects = cbt.statusEffects.filter(e => e !== effectId);
      combatEffects.delete(effectId);
      return { ok: true };
    }

    // RPG-10-09: Enemy intent
    function setEnemyIntent(combatantId, intent) {
      const cbt = combatants.get(combatantId);
      if (!cbt) return { ok: false, reason: 'combatant-not-found' };
      const i = obj(intent);
      cbt.intent = {
        type: INTENT_TYPES.includes(i.type) ? i.type : 'unknown',
        targetId: text(i.targetId) || null,
        description: text(i.description) || '',
        confidence: clamp(i.confidence ?? 0.5, 0, 1),
        revealed: i.revealed === true,
        setAt: now()
      };
      return { ok: true, intent: clone(cbt.intent) };
    }

    function getEnemyIntents(encounterId, revealAll) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return [];
      return encounter.combatants
        .map(cid => combatants.get(cid))
        .filter(c => c && c.intent && (c.intent.revealed || revealAll))
        .map(c => ({ combatantId: c.id, name: c.name, intent: clone(c.intent) }));
    }

    // RPG-10-10: Combat log
    function logCombatAction(encounterId, entry) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return { ok: false, reason: 'encounter-not-found' };
      const e = obj(entry);
      const log = combatLog.get(encounterId) || [];
      const record = {
        id: stableId('log', nextId()),
        round: encounter.round,
        turn: encounter.currentTurnIndex,
        combatantId: text(e.combatantId),
        action: text(e.action) || 'unknown',
        targetType: text(e.targetType),
        targetId: text(e.targetId),
        description: text(e.description),
        damage: clamp(e.damage ?? 0, 0, 99999),
        healing: clamp(e.healing ?? 0, 0, 99999),
        critical: e.critical === true,
        timestamp: now()
      };
      log.push(record);
      combatLog.set(encounterId, log);
      encounter.actionHistory.push(record.id);
      return { ok: true, entry: record };
    }

    function getCombatLog(encounterId, filter) {
      const log = combatLog.get(encounterId) || [];
      const f = obj(filter);
      let result = log;
      if (f.round != null) result = result.filter(e => e.round === f.round);
      if (f.combatantId) result = result.filter(e => e.combatantId === f.combatantId);
      if (f.action) result = result.filter(e => e.action === f.action);
      if (f.limit != null) result = result.slice(-clamp(f.limit, 1, 1000));
      return result;
    }

    // RPG-10-11: Retreat and surrender
    function attemptRetreat(encounterId, combatantId) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return { ok: false, reason: 'encounter-not-found' };
      if (!encounter.retreatAllowed) return { ok: false, reason: 'retreat-not-allowed' };
      const cbt = combatants.get(combatantId);
      if (!cbt) return { ok: false, reason: 'combatant-not-found' };
      if (!cbt.alive) return { ok: false, reason: 'combatant-dead' };
      // Retreat check: d20 + dexterity vs DC 12
      const roll = randomInt(1, 20);
      const dexBonus = Math.floor((cbt.dexterity - 10) / 2);
      const success = roll + dexBonus >= 12;
      if (success) {
        cbt.fleeing = true;
        cbt.alive = false; // removed from combat
        logCombatAction(encounterId, {
          combatantId, action: 'retreat',
          description: `${cbt.name} successfully retreats from combat! (Roll: ${roll}+${dexBonus}=${roll + dexBonus})`
        });
        checkEncounterEnd(encounterId);
      }
      return { ok: true, success, roll, dexBonus, total: roll + dexBonus, dc: 12 };
    }

    function attemptSurrender(encounterId, combatantId) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return { ok: false, reason: 'encounter-not-found' };
      if (!encounter.surrenderAllowed) return { ok: false, reason: 'surrender-not-allowed' };
      const cbt = combatants.get(combatantId);
      if (!cbt) return { ok: false, reason: 'combatant-not-found' };
      cbt.surrendered = true;
      cbt.actionPoints = 0;
      logCombatAction(encounterId, {
        combatantId, action: 'surrender',
        description: `${cbt.name} surrenders!`
      });
      return { ok: true, surrendered: true };
    }

    // RPG-10-12: Nonviolent alternatives
    function attemptNonviolentResolution(encounterId, approach, skillBonus) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return { ok: false, reason: 'encounter-not-found' };
      if (!encounter.nonviolentOptions) return { ok: false, reason: 'nonviolent-not-allowed' };
      const a = text(approach) || 'persuasion'; // persuasion, intimidation, deception, performance, insight
      const bonus = clamp(skillBonus || 0, -5, 20);
      const roll = randomInt(1, 20);
      const total = roll + bonus;
      const dc = encounter.difficulty === 'easy' ? 8 : encounter.difficulty === 'normal' ? 12 : encounter.difficulty === 'hard' ? 16 : 12;
      const success = roll === 20 ? true : roll === 1 ? false : total >= dc;
      if (success) {
        encounter.status = 'victory';
        encounter.endedAt = now();
        logCombatAction(encounterId, {
          action: 'nonviolent-resolution',
          description: `Combat resolved peacefully through ${a}! (Roll: ${roll}+${bonus}=${total} vs DC ${dc})`
        });
      }
      return { ok: true, approach: a, roll, bonus, total, dc, success, resolved: success };
    }

    // RPG-10-13: Balance profiles
    function createBalanceProfile(input) {
      const i = obj(input);
      const id = i.id || stableId('balance', nextId());
      const profile = {
        id,
        name: text(i.name) || 'Balance Profile',
        difficulty: DIFFICULTY_PROFILES.includes(i.difficulty) ? i.difficulty : 'normal',
        enemyHealthMultiplier: clamp(i.enemyHealthMultiplier ?? 1, 0.1, 10),
        enemyDamageMultiplier: clamp(i.enemyDamageMultiplier ?? 1, 0.1, 10),
        enemyCountBonus: clamp(i.enemyCountBonus ?? 0, -10, 10),
        playerHealthMultiplier: clamp(i.playerHealthMultiplier ?? 1, 0.1, 10),
        playerDamageMultiplier: clamp(i.playerDamageMultiplier ?? 1, 0.1, 10),
        xpMultiplier: clamp(i.xpMultiplier ?? 1, 0.1, 10),
        lootMultiplier: clamp(i.lootMultiplier ?? 1, 0.1, 10),
        description: text(i.description),
        createdAt: now()
      };
      balanceProfiles.set(id, profile);
      return profile;
    }

    function getBalanceProfile(id) { return balanceProfiles.get(id) || null; }

    function applyBalanceProfile(encounterId, profileId) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return { ok: false, reason: 'encounter-not-found' };
      const profile = balanceProfiles.get(profileId);
      if (!profile) return { ok: false, reason: 'profile-not-found' };
      // Apply multipliers to enemies
      for (const cbtId of encounter.combatants) {
        const cbt = combatants.get(cbtId);
        if (!cbt) continue;
        if (cbt.type === 'enemy' || cbt.type === 'boss') {
          cbt.health.max = Math.floor(cbt.health.max * profile.enemyHealthMultiplier);
          cbt.health.current = cbt.health.max;
        } else {
          cbt.health.max = Math.floor(cbt.health.max * profile.playerHealthMultiplier);
          cbt.health.current = cbt.health.max;
        }
      }
      encounter.difficulty = profile.difficulty;
      return { ok: true, profile: clone(profile) };
    }

    // RPG-10-14: Difficulty modifiers
    function getDifficultyModifiers(difficulty) {
      const profiles = {
        easy: { enemyHealthMult: 0.75, enemyDamageMult: 0.5, playerHealMult: 1.5, dcReduction: -2, xpMult: 0.5 },
        normal: { enemyHealthMult: 1, enemyDamageMult: 1, playerHealMult: 1, dcReduction: 0, xpMult: 1 },
        hard: { enemyHealthMult: 1.5, enemyDamageMult: 1.5, playerHealMult: 0.75, dcReduction: 2, xpMult: 1.5 },
        deadly: { enemyHealthMult: 2, enemyDamageMult: 2, playerHealMult: 0.5, dcReduction: 4, xpMult: 2.5 }
      };
      return profiles[difficulty] || profiles.normal;
    }

    // RPG-10-15: Deterministic replays
    function replayAction(actionData, seed) {
      const d = obj(actionData);
      seedRng(seed);
      const rng = seededInt;
      // Recreate attack roll
      const attackBonus = clamp(d.attackBonus ?? 0, -5, 20);
      const attackRoll = rng(1, 20);
      const totalAttack = attackRoll + attackBonus;
      const hit = attackRoll === 20 ? true : attackRoll === 1 ? false : totalAttack >= (d.defense ?? 10);
      let damage = 0;
      if (hit) {
        const baseDamage = clamp(d.baseDamage ?? 10, 1, 9999);
        const damageBonus = clamp(d.damageBonus ?? 0, -5, 30);
        damage = rng(1, baseDamage) + damageBonus;
        if (attackRoll === 20) damage *= 2;
      }
      return {
        attackRoll, attackBonus, totalAttack,
        hit, critical: attackRoll === 20, fumble: attackRoll === 1,
        damage
      };
    }

    function getReplayState(encounterId) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return null;
      return {
        encounterId,
        seed: encounter.seed,
        round: encounter.round,
        turnOrder: encounter.turnOrder,
        actionHistory: encounter.actionHistory.slice(-100)
      };
    }

    // RPG-10-02: Combat narration (generate narration from log)
    function generateCombatNarration(encounterId, options) {
      const o = obj(options);
      const maxEntries = clamp(o.maxEntries ?? 10, 1, 50);
      const log = getCombatLog(encounterId, { limit: maxEntries });
      const lines = log.map(entry => {
        const cbt = combatants.get(entry.combatantId);
        const name = cbt ? cbt.name : 'Unknown';
        if (entry.critical) return `[ROUND ${entry.round}] 🌟 CRITICAL! ${entry.description}`;
        if (entry.damage > 0) return `[ROUND ${entry.round}] ${entry.description} (${entry.damage} damage)`;
        if (entry.healing > 0) return `[ROUND ${entry.round}] ${entry.description} (${entry.healing} healing)`;
        return `[ROUND ${entry.round}] ${entry.description}`;
      });
      return {
        encounterId,
        narration: lines.join('\n'),
        entryCount: lines.length,
        currentRound: encounters.get(encounterId)?.round || 0
      };
    }

    // Check encounter end conditions
    function checkEncounterEnd(encounterId) {
      const encounter = encounters.get(encounterId);
      if (!encounter || encounter.status !== 'active') return { ended: false };
      const aliveEnemies = encounter.combatants
        .map(cid => combatants.get(cid))
        .filter(c => c && c.alive && (c.type === 'enemy' || c.type === 'boss'));
      const alivePlayers = encounter.combatants
        .map(cid => combatants.get(cid))
        .filter(c => c && c.alive && (c.type === 'player' || c.type === 'ally'));
      if (aliveEnemies.length === 0) {
        encounter.status = 'victory';
        encounter.endedAt = now();
        return { ended: true, result: 'victory' };
      }
      if (alivePlayers.length === 0) {
        encounter.status = 'defeat';
        encounter.endedAt = now();
        return { ended: true, result: 'defeat' };
      }
      return { ended: false };
    }

    function endEncounter(encounterId, status) {
      const encounter = encounters.get(encounterId);
      if (!encounter) return { ok: false, reason: 'encounter-not-found' };
      if (!COMBAT_STATUSES.includes(status)) return { ok: false, reason: 'invalid-status' };
      encounter.status = status;
      encounter.endedAt = now();
      return { ok: true, status };
    }

    // Persistence seam: everything this manager keeps in closure scope.
    function exportState() {
      return {
        version: 1,
        counters: { id: idCounter },
        encounters: clone(mapsToPlain(encounters)),
        combatants: clone(mapsToPlain(combatants)),
        combatLog: clone(mapsToPlain(combatLog)),
        balanceProfiles: clone(mapsToPlain(balanceProfiles)),
        combatEffects: clone(mapsToPlain(combatEffects)),
        state: clone(mapsToPlain({ rngState }))
      };
    }

    function importState(data) {
      const d = obj(data);
      const restoredByKey = {
        encounters: restoreMap(encounters, obj(d.encounters)),
        combatants: restoreMap(combatants, obj(d.combatants)),
        combatLog: restoreMap(combatLog, obj(d.combatLog)),
        balanceProfiles: restoreMap(balanceProfiles, obj(d.balanceProfiles)),
        combatEffects: restoreMap(combatEffects, obj(d.combatEffects))
      };
      const restoredRng = obj(d.state).rngState;
      rngState = (restoredRng == null || !Number.isFinite(Number(restoredRng))) ? null : Number(restoredRng);
      idCounter = Math.max(idCounter, Number(obj(d.counters).id || 0));
      const restored = Object.values(restoredByKey).reduce((sum, n) => sum + n, 0);
      return { ok: true, restored, restoredByKey };
    }

    return {
      exportState, importState,
      COMBAT_STATUSES, COMBATANT_TYPES, ACTION_TYPES,
      DAMAGE_TYPES, INTENT_TYPES, DIFFICULTY_PROFILES,
      createEncounter, getEncounter, getActiveEncounters,
      addCombatant, getCombatant, rollInitiative,
      getTurnOrder, getCurrentTurn, advanceTurn,
      spendActionPoints,
      damageCombatant, healCombatant, performAttack,
      applyCombatEffect, tickCombatStatusEffects, removeCombatEffect,
      setEnemyIntent, getEnemyIntents,
      logCombatAction, getCombatLog,
      attemptRetreat, attemptSurrender, attemptNonviolentResolution,
      createBalanceProfile, getBalanceProfile, applyBalanceProfile,
      getDifficultyModifiers,
      replayAction, getReplayState,
      generateCombatNarration,
      checkEncounterEnd, endEncounter,
      seedRng
    };
  }

  return { createCombatManager };
});
