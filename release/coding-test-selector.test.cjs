"use strict";
const assert=require("assert/strict");const {selectTests}=require("./coding-test-selector.cjs");
let s=selectTests(["release/workspaces/coding.js"]);assert.ok(s.tests.includes("release/release-verify.cjs"));assert.ok(s.tests.includes("release/static-audit.cjs"));assert.ok(s.tests.includes("release/github-self-dev.test.cjs"));assert.ok(s.tests.includes("release/coding-production-runtime.test.cjs"));
s=selectTests(["release/rpg-live-integration.js"]);assert.ok(s.tests.includes("release/canon-simulator.test.cjs"));assert.ok(s.tests.includes("release/world-runtime.test.cjs"));
s=selectTests(["memory.cjs"]);assert.ok(s.tests.includes("memory.cjs"));
assert.throws(()=>selectTests(["../escape"]),/invalid/);console.log("coding test selector: PASS");
