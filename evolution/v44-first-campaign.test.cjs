"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { runStrictCodingEvolution, candidateTouchesEvaluation } = require("./v44-coding-evolution.cjs");

const TARGET = path.resolve(__dirname, "..", "release", "performance-runtime.js");

function probe(source, manualBoots = 6) {
  const stats = { observers: 0, visibilityListeners: 0 };
  class PerformanceObserver {
    constructor() { stats.observers += 1; }
    observe() {}
  }
  const document = {
    readyState: "complete",
    hidden: false,
    documentElement: { dataset: {}, classList: { add() {}, remove() {} } },
    addEventListener(name) { if (name === "visibilitychange") stats.visibilityListeners += 1; }
  };
  const context = {
    module: { exports: {} },
    exports: {},
    document,
    navigator: { deviceMemory: 4, hardwareConcurrency: 4 },
    matchMedia() { return { matches: false }; },
    PerformanceObserver,
    performance: { now: () => 1 },
    setTimeout,
    clearTimeout
  };
  vm.runInNewContext(String(source), context, { filename: "performance-runtime.js" });
  const api = context.module.exports;
  for (let i = 0; i < manualBoots; i += 1) api.boot();
  return { ...stats, snapshot: api.snapshot() };
}

const source = fs.readFileSync(TARGET, "utf8");
const result = probe(source, 8);
assert.equal(result.observers, 1, "repeated boot must reuse one PerformanceObserver");
assert.equal(result.visibilityListeners, 1, "repeated boot must install one visibility listener");
assert.equal(result.snapshot.ready, true);
assert.equal(typeof runStrictCodingEvolution, "function");
assert.equal(candidateTouchesEvaluation(["release/performance-runtime.js"]), false);
assert.equal(candidateTouchesEvaluation(["eval/tasks.jsonl"]), true);

console.log("PASS first self-evolution campaign permanent regression gate");
