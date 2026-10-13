(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgProgression = api;
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

  const SKILL_CATEGORIES = Object.freeze(['combat', 'magic', 'social', 'exploration', 'crafting', 'knowledge', 'stealth']);
  const ABILITY_TYPES = Object.freeze(['active', 'passive', 'toggle', 'ultimate']);
  const COOLDOWN_TYPES = Object.freeze(['turns', 'seconds', 'rounds', 'scene', 'none']);
  const STATUS_CATEGORIES = Object.freeze(['buff', 'debuff', 'crowd-control', 'damage-over-time', 'heal-over-time', 'special']);
  const QUEST_STATUSES = Object.freeze(['available', 'active', 'completed', 'failed', 'abandoned']);
  const ACHIEVEMENT_RARITIES = Object.freeze(['common', 'uncommon', 'rare', 'epic', 'legendary']);
  const ITEM_RARITIES = Object.freeze(['common', 'uncommon', 'rare', 'epic', 'legendary', 'artifact']);
  const ITEM_TYPES = Object.freeze(['weapon', 'armor', 'accessory', 'consumable', 'material', 'quest-item', 'currency']);
  const EQUIPMENT_SLOTS = Object.freeze(['main-hand', 'off-hand', 'head', 'chest', 'legs', 'feet', 'hands', 'ring-1', 'ring-2', 'amulet', 'cloak']);
  const CRAFTING_CATEGORIES = Object.freeze(['smithing', 'alchemy', 'enchanting', 'cooking', 'leatherworking', 'jewelcrafting']);

  function createProgressionManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const characters = new Map();
    const skillTrees = new Map();
    const abilities = new Map();
    const statusEffects = new Map();
    const quests = new Map();
    const achievements = new Map();
    const inventory = new Map();
    const craftingRecipes = new Map();
    let idCounter = 0;
    function nextId() { return ++idCounter; }

    // RPG-08-01: Optional rulesets
    const rulesets = new Map();

    function createRuleset(input) {
      const i = obj(input);
      const id = i.id || stableId('ruleset', nextId());
      const ruleset = {
        id,
        name: text(i.name) || 'Default Ruleset',
        description: text(i.description),
        enabled: i.enabled !== false,
        rules: {
          levelingCurve: text(i.rules?.levelingCurve) || 'standard', // standard, fast, slow, milestone
          maxLevel: clamp(i.rules?.maxLevel ?? 20, 1, 100),
          xpPerLevel: clamp(i.rules?.xpPerLevel ?? 100, 10, 10000),
          allowMulticlass: i.rules?.allowMulticlass !== false,
          deathPenalty: text(i.rules?.deathPenalty) || 'none', // none, xp-loss, item-loss, permadeath
          skillCheckDifficulty: text(i.rules?.skillCheckDifficulty) || 'standard', // easy, standard, hard, brutal
          criticalRange: clamp(i.rules?.criticalRange ?? 20, 10, 20),
          autoLevelUp: i.rules?.autoLevelUp === true
        },
        metadata: obj(i.metadata),
        createdAt: now(),
        updatedAt: now()
      };
      rulesets.set(id, ruleset);
      return ruleset;
    }

    function getRuleset(id) { return rulesets.get(id) || null; }

    function updateRuleset(id, updates) {
      const ruleset = rulesets.get(id);
      if (!ruleset) return { ok: false, reason: 'ruleset-not-found' };
      const u = obj(updates);
      if (u.name != null) ruleset.name = text(u.name);
      if (u.description != null) ruleset.description = text(u.description);
      if (u.enabled != null) ruleset.enabled = u.enabled !== false;
      if (u.rules != null) {
        const r = obj(u.rules);
        if (r.levelingCurve != null) ruleset.rules.levelingCurve = text(r.levelingCurve);
        if (r.maxLevel != null) ruleset.rules.maxLevel = clamp(r.maxLevel, 1, 100);
        if (r.xpPerLevel != null) ruleset.rules.xpPerLevel = clamp(r.xpPerLevel, 10, 10000);
        if (r.allowMulticlass != null) ruleset.rules.allowMulticlass = r.allowMulticlass !== false;
        if (r.deathPenalty != null) ruleset.rules.deathPenalty = text(r.deathPenalty);
        if (r.skillCheckDifficulty != null) ruleset.rules.skillCheckDifficulty = text(r.skillCheckDifficulty);
        if (r.criticalRange != null) ruleset.rules.criticalRange = clamp(r.criticalRange, 10, 20);
        if (r.autoLevelUp != null) ruleset.rules.autoLevelUp = r.autoLevelUp === true;
      }
      ruleset.updatedAt = now();
      return { ok: true, ruleset };
    }

    function listRulesets() {
      return Array.from(rulesets.values()).map(r => ({
        id: r.id, name: r.name, enabled: r.enabled, maxLevel: r.rules.maxLevel
      }));
    }

    // RPG-08-02: Character levels
    function createCharacterProgression(input) {
      const i = obj(input);
      const id = i.id || stableId('charprog', nextId());
      const char = {
        id,
        name: text(i.name) || 'Unnamed',
        level: clamp(i.level ?? 1, 1, 100),
        xp: clamp(i.xp ?? 0, 0, 999999999),
        xpToNextLevel: clamp(i.xpToNextLevel ?? 100, 1, 1000000),
        totalXpEarned: clamp(i.xp ?? 0, 0, 999999999),
        class: text(i.class) || 'adventurer',
        race: text(i.race) || 'human',
        attributes: {
          strength: clamp(i.attributes?.strength ?? 10, 1, 30),
          dexterity: clamp(i.attributes?.dexterity ?? 10, 1, 30),
          constitution: clamp(i.attributes?.constitution ?? 10, 1, 30),
          intelligence: clamp(i.attributes?.intelligence ?? 10, 1, 30),
          wisdom: clamp(i.attributes?.wisdom ?? 10, 1, 30),
          charisma: clamp(i.attributes?.charisma ?? 10, 1, 30)
        },
        health: { current: clamp(i.health?.current ?? 100, 0, 99999), max: clamp(i.health?.max ?? 100, 1, 99999) },
        mana: { current: clamp(i.mana?.current ?? 50, 0, 99999), max: clamp(i.mana?.max ?? 50, 0, 99999) },
        stamina: { current: clamp(i.stamina?.current ?? 100, 0, 99999), max: clamp(i.stamina?.max ?? 100, 1, 99999) },
        skills: {},
        abilities: [],
        statusEffects: [],
        equipment: {},
        inventory: [],
        quests: [],
        achievements: [],
        deathCount: clamp(i.deathCount ?? 0, 0, 999),
        createdAt: now(),
        updatedAt: now()
      };
      characters.set(id, char);
      return char;
    }

    function getCharacterProgression(id) { return characters.get(id) || null; }

    function calculateXpForLevel(level, rulesetId) {
      const rs = rulesetId ? rulesets.get(rulesetId) : null;
      const xpPerLevel = rs?.rules?.xpPerLevel ?? 100;
      const curve = rs?.rules?.levelingCurve ?? 'standard';
      if (curve === 'fast') return Math.floor(xpPerLevel * level * 0.7);
      if (curve === 'slow') return Math.floor(xpPerLevel * level * 1.5);
      return Math.floor(xpPerLevel * level);
    }

    function addXp(characterId, amount, rulesetId) {
      const char = characters.get(characterId);
      if (!char) return { ok: false, reason: 'character-not-found' };
      const xpGain = Math.max(0, Math.floor(amount));
      char.xp += xpGain;
      char.totalXpEarned += xpGain;
      let leveledUp = false;
      let levelsGained = 0;
      const rs = rulesetId ? rulesets.get(rulesetId) : null;
      const maxLevel = rs?.rules?.maxLevel ?? 20;
      while (char.xp >= char.xpToNextLevel && char.level < maxLevel) {
        char.xp -= char.xpToNextLevel;
        char.level++;
        char.xpToNextLevel = calculateXpForLevel(char.level, rulesetId);
        leveledUp = true;
        levelsGained++;
      }
      char.updatedAt = now();
      return {
        ok: true, xpGained: xpGain, leveledUp, levelsGained,
        newLevel: char.level, currentXp: char.xp, xpToNextLevel: char.xpToNextLevel
      };
    }

    function getLevelProgress(characterId) {
      const char = characters.get(characterId);
      if (!char) return null;
      return {
        level: char.level,
        currentXp: char.xp,
        xpToNextLevel: char.xpToNextLevel,
        percentage: Math.round((char.xp / char.xpToNextLevel) * 100),
        totalXpEarned: char.totalXpEarned
      };
    }

    // RPG-08-03: Experience (covered in addXp)
    // RPG-08-04: Skill checks
    function performSkillCheck(characterId, skillName, difficulty, bonuses) {
      const char = characters.get(characterId);
      if (!char) return { ok: false, reason: 'character-not-found' };
      const skillLevel = char.skills[skillName] || 0;
      const attrBonus = Math.floor(skillLevel / 2);
      const bonusTotal = clamp(bonuses || 0, -10, 20);
      const d20 = randomInt(1, 20);
      const total = d20 + skillLevel + attrBonus + bonusTotal;
      const diffMap = { easy: 8, standard: 12, hard: 16, brutal: 20 };
      const dc = diffMap[difficulty] || (Number(difficulty) || 12);
      const critical = d20 === 20;
      const fumble = d20 === 1;
      return {
        ok: true,
        d20, skillLevel, attrBonus, bonusTotal, total, dc,
        success: critical ? true : fumble ? false : total >= dc,
        critical, fumble,
        margin: total - dc
      };
    }

    // RPG-08-05: Skill tree
    function createSkillTree(input) {
      const i = obj(input);
      const id = i.id || stableId('tree', nextId());
      const tree = {
        id,
        name: text(i.name) || 'Skill Tree',
        category: SKILL_CATEGORIES.includes(i.category) ? i.category : 'combat',
        nodes: arr(i.nodes).map(n => ({
          id: n.id || stableId('node', nextId()),
          name: text(n.name),
          description: text(n.description),
          maxRank: clamp(n.maxRank ?? 1, 1, 10),
          currentRank: 0,
          cost: clamp(n.cost ?? 1, 1, 100),
          requires: uniq(n.requires),
          prerequisites: uniq(n.prerequisites),
          effects: obj(n.effects)
        })),
        metadata: obj(i.metadata),
        createdAt: now()
      };
      skillTrees.set(id, tree);
      return tree;
    }

    function getSkillTree(id) { return skillTrees.get(id) || null; }

    function unlockSkillNode(treeId, nodeId, characterId) {
      const tree = skillTrees.get(treeId);
      if (!tree) return { ok: false, reason: 'tree-not-found' };
      const char = characters.get(characterId);
      if (!char) return { ok: false, reason: 'character-not-found' };
      const node = tree.nodes.find(n => n.id === nodeId);
      if (!node) return { ok: false, reason: 'node-not-found' };
      // Check prerequisites
      for (const prereqId of node.prerequisites) {
        const prereq = tree.nodes.find(n => n.id === prereqId);
        if (prereq && prereq.currentRank < 1) {
          return { ok: false, reason: 'prerequisite-not-met', missingNode: prereqId };
        }
      }
      if (node.currentRank >= node.maxRank) {
        return { ok: false, reason: 'max-rank-reached' };
      }
      node.currentRank++;
      // Apply skill point
      if (!char.skills[node.name]) char.skills[node.name] = 0;
      char.skills[node.name]++;
      char.updatedAt = now();
      return { ok: true, node: clone(node), newRank: node.currentRank };
    }

    // RPG-08-06: Abilities
    function grantAbility(input) {
      const i = obj(input);
      const id = i.id || stableId('ability', nextId());
      const ability = {
        id,
        name: text(i.name) || 'Unnamed Ability',
        description: text(i.description),
        type: ABILITY_TYPES.includes(i.type) ? i.type : 'active',
        level: clamp(i.level ?? 1, 1, 100),
        manaCost: clamp(i.manaCost ?? 0, 0, 9999),
        staminaCost: clamp(i.staminaCost ?? 0, 0, 9999),
        cooldown: {
          type: COOLDOWN_TYPES.includes(i.cooldown?.type) ? i.cooldown.type : 'turns',
          value: clamp(i.cooldown?.value ?? 0, 0, 999),
          current: 0
        },
        effects: obj(i.effects),
        targeting: text(i.targeting) || 'single', // single, area, self, all
        damage: clamp(i.damage ?? 0, 0, 99999),
        healing: clamp(i.healing ?? 0, 0, 99999),
        createdAt: now()
      };
      abilities.set(id, ability);
      return ability;
    }

    function useAbility(characterId, abilityId) {
      const char = characters.get(characterId);
      if (!char) return { ok: false, reason: 'character-not-found' };
      const ability = abilities.get(abilityId);
      if (!ability) return { ok: false, reason: 'ability-not-found' };
      if (ability.cooldown.current > 0) {
        return { ok: false, reason: 'on-cooldown', remaining: ability.cooldown.current };
      }
      if (char.mana.current < ability.manaCost) {
        return { ok: false, reason: 'insufficient-mana', required: ability.manaCost, current: char.mana.current };
      }
      if (char.stamina.current < ability.staminaCost) {
        return { ok: false, reason: 'insufficient-stamina', required: ability.staminaCost, current: char.stamina.current };
      }
      char.mana.current -= ability.manaCost;
      char.stamina.current -= ability.staminaCost;
      if (ability.cooldown.type !== 'none') {
        ability.cooldown.current = ability.cooldown.value;
      }
      char.updatedAt = now();
      return {
        ok: true,
        ability: clone(ability),
        manaSpent: ability.manaCost,
        staminaSpent: ability.staminaCost,
        damage: ability.damage,
        healing: ability.healing
      };
    }

    function tickCooldowns() {
      let ticked = 0;
      for (const ability of abilities.values()) {
        if (ability.cooldown.current > 0) {
          ability.cooldown.current--;
          ticked++;
        }
      }
      return { ok: true, ticked };
    }

    // RPG-08-07: Cooldowns (covered in useAbility/tickCooldowns)

    // RPG-08-08: Status conditions
    function applyStatusEffect(input) {
      const i = obj(input);
      const id = i.id || stableId('status', nextId());
      const effect = {
        id,
        characterId: text(i.characterId),
        name: text(i.name) || 'Status Effect',
        description: text(i.description),
        category: STATUS_CATEGORIES.includes(i.category) ? i.category : 'buff',
        duration: clamp(i.duration ?? 3, 0, 999),
        remaining: clamp(i.duration ?? 3, 0, 999),
        stacks: clamp(i.stacks ?? 1, 1, 99),
        maxStacks: clamp(i.maxStacks ?? 1, 1, 99),
        magnitude: clamp(i.magnitude ?? 1, -999, 999),
        dispellable: i.dispellable !== false,
        appliedAt: now()
      };
      statusEffects.set(id, effect);
      // Add to character if exists
      const char = characters.get(effect.characterId);
      if (char) {
        char.statusEffects.push(id);
        char.updatedAt = now();
      }
      return effect;
    }

    function removeStatusEffect(effectId, dispel) {
      const effect = statusEffects.get(effectId);
      if (!effect) return { ok: false, reason: 'effect-not-found' };
      if (dispel && !effect.dispellable) return { ok: false, reason: 'not-dispellable' };
      const char = characters.get(effect.characterId);
      if (char) {
        char.statusEffects = char.statusEffects.filter(eid => eid !== effectId);
      }
      statusEffects.delete(effectId);
      return { ok: true, removed: effect };
    }

    function tickStatusEffects() {
      const expired = [];
      for (const [id, effect] of statusEffects) {
        if (effect.duration > 0) {
          effect.remaining--;
          if (effect.remaining <= 0) {
            expired.push(id);
            const char = characters.get(effect.characterId);
            if (char) char.statusEffects = char.statusEffects.filter(eid => eid !== id);
            statusEffects.delete(id);
          }
        }
      }
      return { ok: true, expired, remaining: statusEffects.size };
    }

    function getCharacterStatusEffects(characterId) {
      const char = characters.get(characterId);
      if (!char) return [];
      return char.statusEffects.map(eid => statusEffects.get(eid)).filter(Boolean);
    }

    // RPG-08-09: Quest journal
    function createQuest(input) {
      const i = obj(input);
      const id = i.id || stableId('quest', nextId());
      const quest = {
        id,
        title: text(i.title) || 'Untitled Quest',
        description: text(i.description),
        status: QUEST_STATUSES.includes(i.status) ? i.status : 'available',
        level: clamp(i.level ?? 1, 1, 100),
        objectives: arr(i.objectives).map(o => ({
          id: o.id || stableId('qobj', nextId()),
          description: text(o.description),
          completed: o.completed === true,
          optional: o.optional === true
        })),
        rewards: {
          xp: clamp(i.rewards?.xp ?? 0, 0, 999999),
          gold: clamp(i.rewards?.gold ?? 0, 0, 999999),
          items: arr(i.rewards?.items)
        },
        prerequisites: uniq(i.prerequisites),
        giver: text(i.giver),
        locationId: text(i.locationId),
        acceptedAt: null,
        completedAt: null,
        createdAt: now(),
        updatedAt: now()
      };
      quests.set(id, quest);
      return quest;
    }

    function getQuest(id) { return quests.get(id) || null; }

    function acceptQuest(questId, characterId) {
      const quest = quests.get(questId);
      if (!quest) return { ok: false, reason: 'quest-not-found' };
      const char = characters.get(characterId);
      if (char) char.quests.push(questId);
      quest.status = 'active';
      quest.acceptedAt = now();
      quest.updatedAt = now();
      return { ok: true, quest: clone(quest) };
    }

    function completeQuest(questId, characterId) {
      const quest = quests.get(questId);
      if (!quest) return { ok: false, reason: 'quest-not-found' };
      if (quest.status !== 'active') return { ok: false, reason: 'quest-not-active' };
      quest.status = 'completed';
      quest.completedAt = now();
      quest.updatedAt = now();
      // Grant rewards
      const char = characters.get(characterId);
      let xpGranted = 0;
      if (char) {
        xpGranted = quest.rewards.xp;
        char.totalXpEarned += xpGranted;
        char.xp += xpGranted;
      }
      return { ok: true, quest: clone(quest), rewards: clone(quest.rewards), xpGranted };
    }

    function getQuestJournal(characterId, statusFilter) {
      const char = characters.get(characterId);
      if (!char) return [];
      let result = char.quests.map(qid => quests.get(qid)).filter(Boolean);
      if (statusFilter) result = result.filter(q => q.status === statusFilter);
      return result;
    }

    // RPG-08-10: Achievements
    function createAchievement(input) {
      const i = obj(input);
      const id = i.id || stableId('ach', nextId());
      const achievement = {
        id,
        name: text(i.name) || 'Achievement',
        description: text(i.description),
        rarity: ACHIEVEMENT_RARITIES.includes(i.rarity) ? i.rarity : 'common',
        category: text(i.category) || 'general',
        requirement: obj(i.requirement),
        secret: i.secret === true,
        unlocked: false,
        unlockedAt: null,
        unlockCount: 0,
        metadata: obj(i.metadata),
        createdAt: now()
      };
      achievements.set(id, achievement);
      return achievement;
    }

    function unlockAchievement(achievementId, characterId) {
      const achievement = achievements.get(achievementId);
      if (!achievement) return { ok: false, reason: 'achievement-not-found' };
      if (achievement.unlocked) return { ok: false, reason: 'already-unlocked' };
      achievement.unlocked = true;
      achievement.unlockedAt = now();
      achievement.unlockCount++;
      const char = characters.get(characterId);
      if (char) char.achievements.push(achievementId);
      return { ok: true, achievement: clone(achievement) };
    }

    function getUnlockedAchievements(characterId) {
      const char = characters.get(characterId);
      if (!char) return [];
      return char.achievements.map(aid => achievements.get(aid)).filter(Boolean);
    }

    // RPG-08-11: Milestones (level-up milestones tracked via addXp)
    function getMilestones() {
      return Array.from(achievements.values())
        .filter(a => a.category === 'milestone')
        .map(a => ({ id: a.id, name: a.name, unlocked: a.unlocked, rarity: a.rarity }));
    }

    // RPG-08-12: Titles
    const titles = new Map();

    function grantTitle(input) {
      const i = obj(input);
      const id = i.id || stableId('title', nextId());
      const title = {
        id,
        name: text(i.name) || 'Title',
        description: text(i.description),
        characterId: text(i.characterId),
        source: text(i.source) || 'achievement', // achievement, quest, level, reputation, custom
        active: i.active === true,
        grantedAt: now()
      };
      titles.set(id, title);
      return title;
    }

    function activateTitle(titleId) {
      const title = titles.get(titleId);
      if (!title) return { ok: false, reason: 'title-not-found' };
      // Deactivate other titles for this character
      for (const [tid, t] of titles) {
        if (t.characterId === title.characterId && t.active) t.active = false;
      }
      title.active = true;
      return { ok: true, title: clone(title) };
    }

    function getCharacterTitles(characterId) {
      return Array.from(titles.values()).filter(t => t.characterId === characterId);
    }

    // RPG-08-13: Inventory
    function createItem(input) {
      const i = obj(input);
      const id = i.id || stableId('item', nextId());
      const item = {
        id,
        name: text(i.name) || 'Item',
        description: text(i.description),
        type: ITEM_TYPES.includes(i.type) ? i.type : 'material',
        rarity: ITEM_RARITIES.includes(i.rarity) ? i.rarity : 'common',
        value: clamp(i.value ?? 1, 0, 999999),
        weight: clamp(i.weight ?? 0.1, 0, 999),
        stackable: i.stackable !== false,
        maxStack: clamp(i.maxStack ?? 99, 1, 999),
        quantity: clamp(i.quantity ?? 1, 1, 999),
        stats: obj(i.stats),
        effects: obj(i.effects),
        requirements: obj(i.requirements),
        metadata: obj(i.metadata),
        createdAt: now()
      };
      inventory.set(id, item);
      return item;
    }

    function addToInventory(characterId, itemId, quantity) {
      const char = characters.get(characterId);
      if (!char) return { ok: false, reason: 'character-not-found' };
      const item = inventory.get(itemId);
      if (!item) return { ok: false, reason: 'item-not-found' };
      const existing = char.inventory.find(entry => entry.itemId === itemId);
      const qty = Math.max(1, Math.floor(quantity || 1));
      if (existing) {
        existing.quantity = Math.min(existing.quantity + qty, item.maxStack);
      } else {
        char.inventory.push({ itemId, quantity: Math.min(qty, item.maxStack), addedAt: now() });
      }
      char.updatedAt = now();
      return { ok: true, item: clone(item), quantity: qty };
    }

    function removeFromInventory(characterId, itemId, quantity) {
      const char = characters.get(characterId);
      if (!char) return { ok: false, reason: 'character-not-found' };
      const entry = char.inventory.find(e => e.itemId === itemId);
      if (!entry) return { ok: false, reason: 'item-not-in-inventory' };
      const qty = Math.max(1, Math.floor(quantity || 1));
      if (entry.quantity < qty) return { ok: false, reason: 'insufficient-quantity', available: entry.quantity };
      entry.quantity -= qty;
      if (entry.quantity <= 0) {
        char.inventory = char.inventory.filter(e => e.itemId !== itemId);
      }
      char.updatedAt = now();
      return { ok: true, removed: qty };
    }

    function getInventory(characterId) {
      const char = characters.get(characterId);
      if (!char) return [];
      return char.inventory.map(entry => {
        const item = inventory.get(entry.itemId);
        return item ? { ...clone(item), quantity: entry.quantity, addedAt: entry.addedAt } : null;
      }).filter(Boolean);
    }

    // RPG-08-14: Equipment
    function equipItem(characterId, itemId, slot) {
      const char = characters.get(characterId);
      if (!char) return { ok: false, reason: 'character-not-found' };
      const item = inventory.get(itemId);
      if (!item) return { ok: false, reason: 'item-not-found' };
      if (!EQUIPMENT_SLOTS.includes(slot)) return { ok: false, reason: 'invalid-slot' };
      // Check if character has the item
      const invEntry = char.inventory.find(e => e.itemId === itemId);
      if (!invEntry) return { ok: false, reason: 'item-not-owned' };
      // Unequip current item in slot
      let previousItemId = null;
      if (char.equipment[slot]) {
        previousItemId = char.equipment[slot];
        addToInventory(characterId, previousItemId, 1);
      }
      // Remove from inventory and equip
      removeFromInventory(characterId, itemId, 1);
      char.equipment[slot] = itemId;
      char.updatedAt = now();
      return { ok: true, equipped: itemId, slot, previousItemId };
    }

    function unequipItem(characterId, slot) {
      const char = characters.get(characterId);
      if (!char) return { ok: false, reason: 'character-not-found' };
      if (!EQUIPMENT_SLOTS.includes(slot)) return { ok: false, reason: 'invalid-slot' };
      const itemId = char.equipment[slot];
      if (!itemId) return { ok: false, reason: 'slot-empty' };
      delete char.equipment[slot];
      addToInventory(characterId, itemId, 1);
      char.updatedAt = now();
      return { ok: true, unequipped: itemId, slot };
    }

    function getEquipment(characterId) {
      const char = characters.get(characterId);
      if (!char) return {};
      const result = {};
      for (const [slot, itemId] of Object.entries(char.equipment)) {
        const item = inventory.get(itemId);
        if (item) result[slot] = clone(item);
      }
      return result;
    }

    // RPG-08-15: Loot and rewards
    function generateLoot(tableId, luckBonus) {
      const table = craftingRecipes.get(tableId); // reuse storage for loot tables
      if (!table) return { ok: false, reason: 'table-not-found' };
      const entries = arr(table.lootEntries);
      if (entries.length === 0) return { ok: false, reason: 'empty-table' };
      const luck = clamp(luckBonus || 0, -5, 5);
      // Weighted random selection
      const weights = entries.map(e => Math.max(0.01, (e.weight || 1) + luck * 0.1));
      const totalWeight = weights.reduce((s, w) => s + w, 0);
      let roll = Math.random() * totalWeight;
      for (let i = 0; i < entries.length; i++) {
        roll -= weights[i];
        if (roll <= 0) {
          const entry = entries[i];
          const quantity = randomInt(entry.minQuantity || 1, entry.maxQuantity || 1);
          return { ok: true, item: clone(entry), quantity };
        }
      }
      return { ok: true, item: clone(entries[entries.length - 1]), quantity: 1 };
    }

    function createLootTable(input) {
      const i = obj(input);
      const id = i.id || stableId('loot', nextId());
      const table = {
        id,
        name: text(i.name) || 'Loot Table',
        lootEntries: arr(i.lootEntries).map(e => ({
          itemId: text(e.itemId),
          name: text(e.name),
          weight: clamp(e.weight ?? 1, 0.01, 100),
          minQuantity: clamp(e.minQuantity ?? 1, 1, 99),
          maxQuantity: clamp(e.maxQuantity ?? 1, 1, 99)
        })),
        metadata: obj(i.metadata),
        createdAt: now()
      };
      craftingRecipes.set(id, table); // reuse map
      return table;
    }

    // RPG-08-16: Crafting
    function createCraftingRecipe(input) {
      const i = obj(input);
      const id = i.id || stableId('recipe', nextId());
      const recipe = {
        id,
        name: text(i.name) || 'Recipe',
        category: CRAFTING_CATEGORIES.includes(i.category) ? i.category : 'smithing',
        resultItemId: text(i.resultItemId),
        resultQuantity: clamp(i.resultQuantity ?? 1, 1, 99),
        ingredients: arr(i.ingredients).map(ing => ({
          itemId: text(ing.itemId),
          quantity: clamp(ing.quantity ?? 1, 1, 99)
        })),
        requiredSkill: text(i.requiredSkill) || null,
        requiredSkillLevel: clamp(i.requiredSkillLevel ?? 0, 0, 100),
        craftingTime: clamp(i.craftingTime ?? 1, 0, 999),
        successRate: clamp(i.successRate ?? 1, 0, 1),
        metadata: obj(i.metadata),
        createdAt: now()
      };
      craftingRecipes.set(id, recipe);
      return recipe;
    }

    function craftItem(characterId, recipeId) {
      const char = characters.get(characterId);
      if (!char) return { ok: false, reason: 'character-not-found' };
      const recipe = craftingRecipes.get(recipeId);
      if (!recipe) return { ok: false, reason: 'recipe-not-found' };
      // Check skill requirement
      if (recipe.requiredSkill) {
        const skillLevel = char.skills[recipe.requiredSkill] || 0;
        if (skillLevel < recipe.requiredSkillLevel) {
          return { ok: false, reason: 'insufficient-skill', required: recipe.requiredSkillLevel, current: skillLevel };
        }
      }
      // Check ingredients
      for (const ing of recipe.ingredients) {
        const entry = char.inventory.find(e => e.itemId === ing.itemId);
        if (!entry || entry.quantity < ing.quantity) {
          return { ok: false, reason: 'missing-ingredient', itemId: ing.itemId, required: ing.quantity, available: entry?.quantity || 0 };
        }
      }
      // Check success rate
      const roll = Math.random();
      if (roll > recipe.successRate) {
        // Consume some ingredients on failure
        for (const ing of recipe.ingredients) {
          removeFromInventory(characterId, ing.itemId, Math.max(1, Math.floor(ing.quantity / 2)));
        }
        return { ok: false, reason: 'crafting-failed', successRate: recipe.successRate };
      }
      // Consume ingredients
      for (const ing of recipe.ingredients) {
        removeFromInventory(characterId, ing.itemId, ing.quantity);
      }
      // Add result
      addToInventory(characterId, recipe.resultItemId, recipe.resultQuantity);
      // Grant skill XP
      if (recipe.requiredSkill) {
        if (!char.skills[recipe.requiredSkill]) char.skills[recipe.requiredSkill] = 0;
        char.skills[recipe.requiredSkill]++;
      }
      char.updatedAt = now();
      return {
        ok: true,
        recipe: clone(recipe),
        resultItemId: recipe.resultItemId,
        resultQuantity: recipe.resultQuantity
      };
    }

    function getAvailableRecipes(characterId) {
      const char = characters.get(characterId);
      if (!char) return [];
      return Array.from(craftingRecipes.values())
        .filter(r => r.resultItemId !== undefined) // exclude loot tables
        .filter(r => {
          if (!r.requiredSkill) return true;
          return (char.skills[r.requiredSkill] || 0) >= r.requiredSkillLevel;
        });
    }

    return {
      SKILL_CATEGORIES, ABILITY_TYPES, COOLDOWN_TYPES, STATUS_CATEGORIES,
      QUEST_STATUSES, ACHIEVEMENT_RARITIES, ITEM_RARITIES, ITEM_TYPES,
      EQUIPMENT_SLOTS, CRAFTING_CATEGORIES,
      createRuleset, getRuleset, updateRuleset, listRulesets,
      createCharacterProgression, getCharacterProgression,
      calculateXpForLevel, addXp, getLevelProgress,
      performSkillCheck,
      createSkillTree, getSkillTree, unlockSkillNode,
      grantAbility, useAbility, tickCooldowns,
      applyStatusEffect, removeStatusEffect, tickStatusEffects, getCharacterStatusEffects,
      createQuest, getQuest, acceptQuest, completeQuest, getQuestJournal,
      createAchievement, unlockAchievement, getUnlockedAchievements, getMilestones,
      grantTitle, activateTitle, getCharacterTitles,
      createItem, addToInventory, removeFromInventory, getInventory,
      equipItem, unequipItem, getEquipment,
      generateLoot, createLootTable,
      createCraftingRecipe, craftItem, getAvailableRecipes
    };
  }

  return { createProgressionManager };
});
