(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgWorldRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }
  function uniq(xs) { return Array.from(new Set(arr(xs).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))); }
  function stableId(prefix, n) { return prefix + '-' + String(n).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }

  const RULE_TYPES = Object.freeze([
    'physics', 'magic', 'combat', 'social', 'economy', 'travel', 'time', 'death', 'custom'
  ]);

  const RULE_SCOPES = Object.freeze([
    'global', 'region', 'location', 'faction', 'character', 'scene'
  ]);

  const CONFLICT_RESOLUTION = Object.freeze([
    'highest-priority', 'most-specific', 'first-defined', 'last-defined', 'merge'
  ]);

  function createWorldRulesManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    function createRule(input) {
      const i = obj(input);
      const id = i.id || stableId('rule', Date.now());
      const name = text(i.name) || 'Unnamed Rule';
      const type = RULE_TYPES.includes(i.type) ? i.type : 'custom';
      const scope = RULE_SCOPES.includes(i.scope) ? i.scope : 'global';
      const scopeRef = text(i.scopeRef) || null;
      const priority = Math.max(0, Math.min(100, Number(i.priority) || 50));
      const condition = text(i.condition) || 'always';
      const effect = obj(i.effect);
      const description = text(i.description);
      const tags = uniq(i.tags);
      const enabled = i.enabled !== false;
      const conflictResolution = CONFLICT_RESOLUTION.includes(i.conflictResolution) ? i.conflictResolution : 'highest-priority';
      const metadata = obj(i.metadata);

      return {
        id, name, type, scope, scopeRef, priority, condition, effect,
        description, tags, enabled, conflictResolution, metadata,
        createdAt: now(), updatedAt: now(), version: 1
      };
    }

    function validateRule(state, rule) {
      const issues = [];
      if (!rule.name) issues.push({ code: 'missing-name', severity: 'error' });
      if (!RULE_TYPES.includes(rule.type)) issues.push({ code: 'invalid-type', severity: 'error' });
      if (!RULE_SCOPES.includes(rule.scope)) issues.push({ code: 'invalid-scope', severity: 'error' });
      if (rule.scope !== 'global' && !rule.scopeRef) issues.push({ code: 'missing-scope-ref', severity: 'error' });
      if (rule.scope !== 'global' && rule.scopeRef) {
        const refExists = checkScopeRefExists(state, rule.scope, rule.scopeRef);
        if (!refExists) issues.push({ code: 'invalid-scope-ref', severity: 'error', scopeRef: rule.scopeRef });
      }
      if (rule.priority < 0 || rule.priority > 100) issues.push({ code: 'invalid-priority', severity: 'warn' });
      if (!conditionIsValid(rule.condition)) issues.push({ code: 'invalid-condition', severity: 'warn' });
      if (!effectIsValid(rule.effect)) issues.push({ code: 'invalid-effect', severity: 'warn' });
      return { valid: !issues.some(x => x.severity === 'error'), issues };
    }

    function checkScopeRefExists(state, scope, scopeRef) {
      switch (scope) {
        case 'region': return !!state.world?.kingdoms?.[scopeRef] || !!state.world?.locations?.[scopeRef];
        case 'location': return !!state.world?.locations?.[scopeRef];
        case 'faction': return !!state.factions?.[scopeRef];
        case 'character': return !!state.characters?.[scopeRef];
        case 'scene': return !!state.scene && state.scene.id === scopeRef;
        default: return true;
      }
    }

    function conditionIsValid(condition) {
      if (condition === 'always' || condition === 'never') return true;
      // Simple condition syntax: "stat > value", "flag == true", etc.
      return /^[\w\s\.\-\>\<\=\!\|\&\(\)]+$/.test(condition);
    }

    function effectIsValid(effect) {
      if (!effect || typeof effect !== 'object') return false;
      const validEffectTypes = ['modify', 'set', 'add', 'remove', 'trigger', 'narrate'];
      if (!validEffectTypes.includes(effect.type)) return false;
      if (effect.type === 'narrate') return !!effect.text;
      return !!effect.target;
    }

    function evaluateCondition(state, rule, context) {
      if (rule.condition === 'always') return true;
      if (rule.condition === 'never') return false;
      try {
        const ctx = obj(context);
        const scope = { state, ...ctx };
        const vm = require('vm');
        const script = new vm.Script('"use strict"; (' + rule.condition + ')');
        const sandbox = Object.assign({}, scope);
        console.log('Evaluating:', rule.condition, 'with sandbox keys:', Object.keys(sandbox));
        return script.runInNewContext(sandbox, { timeout: 100 });
      } catch (e) {
        console.log('Evaluate error:', e.message);
        return false;
      }
    }

    function applyEffect(state, rule, context) {
      const eff = rule.effect;
      const changes = [];
      switch (eff.type) {
        case 'modify':
          changes.push(applyModify(state, eff.target, eff.path, eff.value, eff.operator));
          break;
        case 'set':
          changes.push(applySet(state, eff.target, eff.path, eff.value));
          break;
        case 'add':
          changes.push(applyAdd(state, eff.target, eff.path, eff.value));
          break;
        case 'remove':
          changes.push(applyRemove(state, eff.target, eff.path));
          break;
        case 'trigger':
          changes.push({ type: 'trigger', event: eff.event, data: eff.data });
          break;
        case 'narrate':
          changes.push({ type: 'narrate', text: eff.text, style: eff.style });
          break;
      }
      return changes;
    }

    function applyModify(state, target, path, value, operator) {
      const t = getTarget(state, target);
      if (!t) return { success: false, reason: 'target-not-found' };
      const current = getNested(t, path);
      let result;
      switch (operator) {
        case '+=': result = (current || 0) + value; break;
        case '-=': result = (current || 0) - value; break;
        case '*=': result = (current || 1) * value; break;
        case '/=': result = (current || 1) / value; break;
        default: result = current + value;
      }
      setNested(t, path, result);
      return { success: true, target, path, oldValue: current, newValue: result };
    }

    function applySet(state, target, path, value) {
      const t = getTarget(state, target);
      if (!t) return { success: false, reason: 'target-not-found' };
      const old = getNested(t, path);
      setNested(t, path, value);
      return { success: true, target, path, oldValue: old, newValue: value };
    }

    function applyAdd(state, target, path, value) {
      const t = getTarget(state, target);
      if (!t) return { success: false, reason: 'target-not-found' };
      const arr = getNested(t, path) || [];
      if (!Array.isArray(arr)) return { success: false, reason: 'not-array' };
      arr.push(value);
      setNested(t, path, arr);
      return { success: true, target, path, added: value };
    }

    function applyRemove(state, target, path) {
      const t = getTarget(state, target);
      if (!t) return { success: false, reason: 'target-not-found' };
      const arr = getNested(t, path) || [];
      if (!Array.isArray(arr)) return { success: false, reason: 'not-array' };
      const removed = arr.pop();
      setNested(t, path, arr);
      return { success: true, target, path, removed };
    }

    function getTarget(state, target) {
      if (typeof target === 'string') {
        if (target === 'world') return state.world;
        if (target === 'party') return state.party;
        if (target.startsWith('character:')) return state.characters?.[target.split(':')[1]];
        if (target.startsWith('faction:')) return state.factions?.[target.split(':')[1]];
        if (target.startsWith('location:')) return state.world?.locations?.[target.split(':')[1]];
        if (target === 'scene') return state.scene;
      }
      return target;
    }

    function getNested(obj, path) {
      if (!path) return obj;
      const parts = path.split('.');
      let cur = obj;
      for (const p of parts) {
        if (cur == null) return undefined;
        cur = cur[p];
      }
      return cur;
    }

    function setNested(obj, path, value) {
      if (!path) return;
      const parts = path.split('.');
      let cur = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        if (cur[parts[i]] == null) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
    }

    function getApplicableRules(state, rules, context) {
      const applicable = [];
      for (const rule of Object.values(rules)) {
        if (!rule.enabled) continue;
        if (!ruleAppliesToContext(rule, context)) continue;
        if (evaluateCondition(state, rule, context)) {
          applicable.push(rule);
        }
      }
      applicable.sort((a, b) => b.priority - a.priority);
      return applicable;
    }

    function ruleAppliesToContext(rule, context) {
      if (rule.scope === 'global') return true;
      if (rule.scope === 'scene' && context.sceneId === rule.scopeRef) return true;
      if (rule.scope === 'character' && context.characterId === rule.scopeRef) return true;
      if (rule.scope === 'location' && context.locationId === rule.scopeRef) return true;
      if (rule.scope === 'faction' && context.factionId === rule.scopeRef) return true;
      if (rule.scope === 'region' && context.regionId === rule.scopeRef) return true;
      return false;
    }

    function resolveConflicts(rules) {
      const groups = {};
      for (const rule of rules) {
        const key = rule.effect?.target + '.' + (rule.effect?.path || '');
        if (!groups[key]) groups[key] = [];
        groups[key].push(rule);
      }
      const resolved = [];
      for (const [key, group] of Object.entries(groups)) {
        if (group.length === 1) {
          resolved.push(group[0]);
        } else {
          const strategy = group[0].conflictResolution;
          let winner;
          switch (strategy) {
            case 'highest-priority':
              winner = group.reduce((a, b) => a.priority > b.priority ? a : b);
              break;
            case 'most-specific':
              winner = group.reduce((a, b) => (a.scope === 'global' ? b : a));
              break;
            case 'first-defined':
              winner = group[0];
              break;
            case 'last-defined':
              winner = group[group.length - 1];
              break;
            case 'merge':
              resolved.push(...group);
              continue;
          }
          resolved.push(winner);
        }
      }
      return resolved;
    }

    function createRuleset(input) {
      const i = obj(input);
      const id = i.id || stableId('ruleset', Date.now());
      const name = text(i.name) || 'Unnamed Ruleset';
      const description = text(i.description);
      const rules = arr(i.rules).map(r => createRule(r));
      const baseRules = arr(i.baseRules);
      const tags = uniq(i.tags);
      return { id, name, description, rules, baseRules, tags, createdAt: now(), updatedAt: now(), version: 1 };
    }

    function compileRuleset(ruleset, state) {
      const allRules = [...ruleset.rules, ...ruleset.baseRules.map(id => state.ruleRegistry?.[id]).filter(Boolean)];
      const validRules = allRules.filter(r => validateRule(state, r).valid);
      return { ruleset: ruleset.id, rules: validRules, compiledAt: now() };
    }

    return {
      RULE_TYPES, RULE_SCOPES, CONFLICT_RESOLUTION,
      createRule, validateRule, evaluateCondition, applyEffect,
      getApplicableRules, resolveConflicts,
      createRuleset, compileRuleset,
      checkScopeRefExists, conditionIsValid, effectIsValid
    };
  }

  return { createWorldRulesManager };
});