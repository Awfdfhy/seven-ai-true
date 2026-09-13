"use strict";

const DEFAULT_SHARES = Object.freeze({
  instructions: 0.12,
  task: 0.16,
  evidence: 0.22,
  project: 0.18,
  memory: 0.14,
  tools: 0.10,
  conversation: 0.08
});

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function asArray(v) { return Array.isArray(v) ? v : []; }
function tokensOf(item) {
  const explicit = Number(item && item.tokens);
  if (Number.isFinite(explicit) && explicit >= 0) return Math.ceil(explicit);
  const text = typeof item?.content === "string" ? item.content : JSON.stringify(item?.content ?? "");
  return Math.max(1, Math.ceil(text.length / 4));
}
function score(item) {
  const priority = Number(item.priority || 0);
  const pinned = item.pinned ? 10000 : 0;
  const required = item.required ? 5000 : 0;
  const fresh = item.fresh === false ? -1000 : 0;
  const trusted = item.trust === "trusted" ? 100 : item.trust === "untrusted" ? -25 : 0;
  return pinned + required + priority + fresh + trusted;
}

function normalizeShares(input = {}) {
  const merged = { ...DEFAULT_SHARES, ...input };
  const sum = Object.values(merged).reduce((a, b) => a + Math.max(0, Number(b) || 0), 0) || 1;
  return Object.fromEntries(Object.entries(merged).map(([k, v]) => [k, Math.max(0, Number(v) || 0) / sum]));
}

function compileContext({ items = [], maxTokens, reserveTokens = 0, categoryShares = {}, activeScope = null } = {}) {
  const max = Math.max(0, Math.floor(Number(maxTokens) || 0));
  const reserve = Math.max(0, Math.floor(Number(reserveTokens) || 0));
  const available = Math.max(0, max - reserve);
  if (!available) return { selected: [], evicted: asArray(items).map(clone), tokensUsed: 0, tokenBudget: 0, categoryUsage: {}, warnings: ["zero-context-budget"] };

  const shares = normalizeShares(categoryShares);
  const categoryBudgets = Object.fromEntries(Object.entries(shares).map(([k, share]) => [k, Math.floor(available * share)]));
  const usage = Object.fromEntries(Object.keys(categoryBudgets).map(k => [k, 0]));
  const warnings = [];
  const eligible = [];
  const evicted = [];

  for (const raw of asArray(items)) {
    const item = { ...clone(raw), category: raw.category || "conversation" };
    item.tokens = tokensOf(item);
    if (item.lifecycle === "deleted" || item.lifecycle === "invalid") { evicted.push({ ...item, evictionReason: "lifecycle" }); continue; }
    if (activeScope && item.scope && item.scope !== activeScope) { evicted.push({ ...item, evictionReason: "scope" }); continue; }
    eligible.push(item);
    if (!Object.prototype.hasOwnProperty.call(categoryBudgets, item.category)) {
      categoryBudgets[item.category] = 0;
      usage[item.category] = 0;
    }
  }

  eligible.sort((a, b) => score(b) - score(a) || (Number(b.recency || 0) - Number(a.recency || 0)) || String(a.id || "").localeCompare(String(b.id || "")));

  const selected = [];
  let total = 0;
  for (const item of eligible) {
    const category = item.category;
    const hardRequired = item.pinned || item.required;
    const categoryFits = usage[category] + item.tokens <= (categoryBudgets[category] || 0);
    const totalFits = total + item.tokens <= available;
    if (totalFits && (hardRequired || categoryFits)) {
      selected.push(item);
      usage[category] += item.tokens;
      total += item.tokens;
      if (hardRequired && !categoryFits) warnings.push(`category-overflow:${category}:${item.id || "item"}`);
    } else {
      evicted.push({ ...item, evictionReason: totalFits ? "category-budget" : "total-budget" });
    }
  }

  const missingRequired = eligible.filter(x => (x.required || x.pinned) && !selected.some(s => s.id === x.id));
  if (missingRequired.length) warnings.push(`required-items-evicted:${missingRequired.map(x => x.id || "item").join(",")}`);

  return {
    selected,
    evicted,
    tokensUsed: total,
    tokenBudget: available,
    categoryUsage: usage,
    categoryBudgets,
    warnings
  };
}

function buildModelMessages(compiled, render = item => item.content) {
  if (!compiled || !Array.isArray(compiled.selected)) throw new Error("compiled context required");
  return compiled.selected.map(item => ({
    role: item.role || "system",
    content: render(item),
    sevenContext: { id: item.id || null, category: item.category, lineage: clone(item.lineage || null), canonical: item.canonical === true }
  }));
}

module.exports = { DEFAULT_SHARES, normalizeShares, compileContext, buildModelMessages, tokensOf };
