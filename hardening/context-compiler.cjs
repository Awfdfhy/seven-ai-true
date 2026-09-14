"use strict";

const crypto = require("crypto");

const DEFAULT_SHARES = Object.freeze({
  instructions: 0.10,
  task: 0.14,
  evidence: 0.20,
  project: 0.16,
  memory: 0.12,
  tools: 0.10,
  conversation: 0.12,
  other: 0.06
});

const ROLE_CLASSES = Object.freeze([
  "AUTHORITY_INSTRUCTION", "TASK_CONTRACT", "ACTIVE_STATE", "EVIDENCE", "MEMORY_RECALL",
  "PROJECT_MATERIAL", "TOOL_SCHEMA", "TOOL_OBSERVATION", "CONVERSATION", "EXAMPLE",
  "WORLD_STATE", "ARTIFACT_SLICE"
]);

const ROLE_ORDER = Object.freeze({
  AUTHORITY_INSTRUCTION: 0,
  TASK_CONTRACT: 1,
  ACTIVE_STATE: 2,
  EVIDENCE: 3,
  WORLD_STATE: 4,
  PROJECT_MATERIAL: 5,
  MEMORY_RECALL: 6,
  TOOL_SCHEMA: 7,
  TOOL_OBSERVATION: 8,
  ARTIFACT_SLICE: 9,
  CONVERSATION: 10,
  EXAMPLE: 11
});

const TRUSTED_AUTHORITY_SOURCES = new Set(["runtime", "controller", "policy"]);

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function asArray(v) { return Array.isArray(v) ? v : []; }
function tokensOf(item) {
  const explicit = Number(item && item.tokens);
  if (Number.isFinite(explicit) && explicit >= 0) return Math.ceil(explicit);
  const text = typeof item?.content === "string" ? item.content : JSON.stringify(item?.content ?? "");
  return Math.max(1, Math.ceil(text.length / 4));
}
function normalizeText(v) { return String(v || "").trim().replace(/\s+/g, " "); }
function digest(v) { return crypto.createHash("sha256").update(typeof v === "string" ? v : JSON.stringify(v)).digest("hex").slice(0, 20); }
function score(item) {
  const priority = Number(item.priority || 0);
  const pinned = item.pinned ? 10000 : 0;
  const required = item.required ? 5000 : 0;
  const fresh = item.fresh === false || item.stale === true ? -1000 : 0;
  const trusted = item.trust === "trusted" ? 100 : item.trust === "untrusted" ? -25 : 0;
  const relevant = Number(item.relevance || 0) * 100;
  return pinned + required + priority + fresh + trusted + relevant;
}

function normalizeShares(input = {}) {
  const merged = { ...DEFAULT_SHARES, ...input };
  const sum = Object.values(merged).reduce((a, b) => a + Math.max(0, Number(b) || 0), 0) || 1;
  return Object.fromEntries(Object.entries(merged).map(([k, v]) => [k, Math.max(0, Number(v) || 0) / sum]));
}

function inferRoleClass(item = {}) {
  const explicit = String(item.contextRole || item.roleClass || "").toUpperCase();
  if (ROLE_CLASSES.includes(explicit)) return explicit;
  const category = String(item.category || "conversation");
  return category === "instructions" ? "AUTHORITY_INSTRUCTION"
    : category === "task" ? "TASK_CONTRACT"
      : category === "evidence" ? "EVIDENCE"
        : category === "memory" ? "MEMORY_RECALL"
          : category === "project" ? "PROJECT_MATERIAL"
            : category === "tools" ? "TOOL_OBSERVATION"
              : category === "world" ? "WORLD_STATE"
                : "CONVERSATION";
}

function sanitizeItem(raw = {}, index = 0) {
  const item = { ...clone(raw), category: raw.category || "conversation", _inputIndex: index };
  item.contextRole = inferRoleClass(item);
  item.tokens = tokensOf(item);
  const trustedInstruction = item.contextRole === "AUTHORITY_INSTRUCTION"
    && item.trustedInstruction === true
    && TRUSTED_AUTHORITY_SOURCES.has(String(item.authoritySource || ""));
  item.trustedInstruction = trustedInstruction;
  if (item.contextRole === "MEMORY_RECALL") {
    item.epistemicUse = "RECALL_ONLY";
    item.grantsAuthority = false;
    item.role = item.role === "assistant" ? "assistant" : "user";
  } else if (item.contextRole === "AUTHORITY_INSTRUCTION") {
    item.role = trustedInstruction ? "system" : "user";
  } else if (item.contextRole === "CONVERSATION" && ["user", "assistant"].includes(item.role)) {
    item.role = item.role;
  } else {
    item.role = "user";
  }
  return item;
}

function itemDedupeKey(item) {
  if (item.dedupKey) return `explicit:${item.dedupKey}`;
  const lineage = item.lineage || {};
  const revision = lineage.sourceRevisionId || lineage.revisionId || item.sourceRevisionId;
  if (revision) return `revision:${revision}:${item.contextRole}`;
  if (item.contentHash) return `hash:${item.contentHash}:${item.contextRole}`;
  return `content:${digest(normalizeText(typeof item.content === "string" ? item.content : JSON.stringify(item.content ?? "")))}:${item.contextRole}`;
}

function scopeAllowed(item, { activeScope, principal, namespace } = {}) {
  if (principal && item.principal && item.principal !== principal) return false;
  if (namespace && item.namespace && item.namespace !== namespace) return false;
  if (activeScope && item.scope && item.scope !== activeScope) return false;
  return true;
}

function assemblyCompare(a, b) {
  const roleDelta = (ROLE_ORDER[a.contextRole] ?? 99) - (ROLE_ORDER[b.contextRole] ?? 99);
  if (roleDelta) return roleDelta;
  if (a.contextRole === "CONVERSATION") {
    const seqA = Number(a.sequence ?? a.recency ?? a._inputIndex);
    const seqB = Number(b.sequence ?? b.recency ?? b._inputIndex);
    return seqA - seqB || a._inputIndex - b._inputIndex;
  }
  const orderA = Number(a.semanticOrder ?? a.order ?? a._inputIndex);
  const orderB = Number(b.semanticOrder ?? b.order ?? b._inputIndex);
  return orderA - orderB || a._inputIndex - b._inputIndex;
}

function compileContext({ items = [], maxTokens, reserveTokens = 0, categoryShares = {}, activeScope = null, principal = null, namespace = null, phase = "default", tier = "balanced" } = {}) {
  const max = Math.max(0, Math.floor(Number(maxTokens) || 0));
  const reserve = Math.max(0, Math.floor(Number(reserveTokens) || 0));
  const available = Math.max(0, max - reserve);
  if (!available) return { status: "BLOCKED", selected: [], evicted: asArray(items).map(clone), tokensUsed: 0, tokenBudget: 0, categoryUsage: {}, warnings: ["zero-context-budget"], manifest: null };

  const shares = normalizeShares(categoryShares);
  const categoryBudgets = Object.fromEntries(Object.entries(shares).map(([k, share]) => [k, Math.floor(available * share)]));
  const usage = Object.fromEntries(Object.keys(categoryBudgets).map(k => [k, 0]));
  const warnings = [];
  const eligible = [];
  const evicted = [];
  const seen = new Set();
  let blocked = false;

  asArray(items).forEach((raw, index) => {
    const item = sanitizeItem(raw, index);
    if (item.lifecycle === "deleted" || item.lifecycle === "invalid" || item.lifecycle === "PURGED") { evicted.push({ ...item, evictionReason: "lifecycle" }); return; }
    if (!scopeAllowed(item, { activeScope, principal, namespace })) { evicted.push({ ...item, evictionReason: "scope-policy" }); return; }
    if (item.contextRole === "AUTHORITY_INSTRUCTION" && !item.trustedInstruction) {
      evicted.push({ ...item, evictionReason: "instruction-authority" });
      if (item.required || item.pinned) blocked = true;
      warnings.push(`instruction-downgraded-or-rejected:${item.id || "item"}`);
      return;
    }
    const key = itemDedupeKey(item);
    if (seen.has(key)) { evicted.push({ ...item, evictionReason: "duplicate" }); return; }
    seen.add(key);
    eligible.push(item);
    if (!Object.prototype.hasOwnProperty.call(categoryBudgets, item.category)) {
      categoryBudgets[item.category] = categoryBudgets.other || 0;
      usage[item.category] = 0;
    }
  });

  const required = eligible.filter(item => item.required || item.pinned || item.contextRole === "AUTHORITY_INSTRUCTION");
  const optional = eligible.filter(item => !required.includes(item));
  required.sort(assemblyCompare);
  optional.sort((a, b) => score(b) - score(a) || Number(b.recency || 0) - Number(a.recency || 0) || a._inputIndex - b._inputIndex);

  const selected = [];
  let total = 0;
  for (const item of required) {
    if (total + item.tokens > available) {
      evicted.push({ ...item, evictionReason: "mandatory-overflow" });
      warnings.push(`mandatory-overflow:${item.id || "item"}`);
      blocked = true;
      continue;
    }
    selected.push(item);
    usage[item.category] = (usage[item.category] || 0) + item.tokens;
    total += item.tokens;
  }

  const deferred = [];
  for (const item of optional) {
    if (total + item.tokens > available) { evicted.push({ ...item, evictionReason: "total-budget" }); continue; }
    const budget = categoryBudgets[item.category] || 0;
    if ((usage[item.category] || 0) + item.tokens <= budget) {
      selected.push(item); usage[item.category] = (usage[item.category] || 0) + item.tokens; total += item.tokens;
    } else deferred.push(item);
  }

  // Elastic borrowing: unused category capacity is not stranded. Optional items may borrow
  // from the remaining global envelope in score order after baseline category coverage.
  for (const item of deferred) {
    if (total + item.tokens <= available) {
      selected.push(item); usage[item.category] = (usage[item.category] || 0) + item.tokens; total += item.tokens;
      warnings.push(`elastic-borrow:${item.category}:${item.id || "item"}`);
    } else evicted.push({ ...item, evictionReason: "total-budget" });
  }

  const missingRequired = eligible.filter(x => (x.required || x.pinned) && !selected.includes(x));
  if (missingRequired.length) {
    warnings.push(`required-items-evicted:${missingRequired.map(x => x.id || "item").join(",")}`);
    blocked = true;
  }

  selected.sort(assemblyCompare);
  const cleanSelected = selected.map(({ _inputIndex, ...item }) => item);
  const cleanEvicted = evicted.map(({ _inputIndex, ...item }) => item);
  const manifest = {
    kind: "ContextManifest",
    schemaVersion: 1,
    phase,
    tier,
    activeScope,
    principal,
    namespace,
    tokenBudget: available,
    tokensUsed: total,
    items: cleanSelected.map(item => ({
      id: item.id || null,
      contextRole: item.contextRole,
      category: item.category,
      tokens: item.tokens,
      canonical: item.canonical === true,
      lineage: clone(item.lineage || null),
      reconstruct: clone(item.reconstruct || item.reconstructionHandle || null)
    }))
  };
  manifest.identity = digest(manifest);

  return {
    status: blocked ? "BLOCKED" : "PASS",
    selected: cleanSelected,
    evicted: cleanEvicted,
    tokensUsed: total,
    tokenBudget: available,
    categoryUsage: usage,
    categoryBudgets,
    warnings,
    manifest
  };
}

function buildModelMessages(compiled, render = item => item.content) {
  if (!compiled || !Array.isArray(compiled.selected)) throw new Error("compiled context required");
  if (compiled.status === "BLOCKED") throw new Error("blocked context cannot be assembled");
  return compiled.selected.map(item => {
    const role = item.contextRole === "AUTHORITY_INSTRUCTION" && item.trustedInstruction === true
      ? "system"
      : item.contextRole === "CONVERSATION" && item.role === "assistant" ? "assistant" : "user";
    return {
      role,
      content: render(item),
      sevenContext: {
        id: item.id || null,
        contextRole: item.contextRole,
        category: item.category,
        lineage: clone(item.lineage || null),
        canonical: item.canonical === true,
        epistemicUse: item.contextRole === "MEMORY_RECALL" ? "RECALL_ONLY" : item.epistemicUse || null
      }
    };
  });
}

function createContextCapsule(compiled) {
  if (!compiled || !Array.isArray(compiled.selected)) throw new Error("compiled context required");
  return Object.freeze({
    kind: "ContextCapsule",
    schemaVersion: 1,
    status: compiled.status,
    manifest: clone(compiled.manifest),
    items: Object.freeze(compiled.selected.map(item => Object.freeze({
      id: item.id || null,
      contextRole: item.contextRole,
      content: clone(item.content),
      lineage: clone(item.lineage || null),
      reconstruct: clone(item.reconstruct || item.reconstructionHandle || null)
    })))
  });
}

module.exports = { DEFAULT_SHARES, ROLE_CLASSES, ROLE_ORDER, normalizeShares, inferRoleClass, sanitizeItem, compileContext, buildModelMessages, createContextCapsule, tokensOf };