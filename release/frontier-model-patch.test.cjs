"use strict";

const assert = require("assert/strict");
const { MODEL_ID, MODEL_SEED, patchText } = require("./frontier-model-patch.cjs");

const fixture = '<script>const FREE_MODEL_SEEDS = Object.freeze([\nObject.freeze({ provider:"groq", id:"openai/gpt-oss-120b" })\n]);</script>';
const first = patchText(fixture);
assert.equal(first.changed, true);
assert.ok(first.html.includes(`id:"${MODEL_ID}"`));
assert.ok(first.html.includes(MODEL_SEED));
assert.ok(first.html.indexOf(`id:"${MODEL_ID}"`) < first.html.indexOf('id:"openai/gpt-oss-120b"'));

const second = patchText(first.html);
assert.equal(second.changed, false);
assert.equal(second.html, first.html);
assert.equal((second.html.match(new RegExp(MODEL_ID.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 1);

assert.throws(() => patchText("<html></html>"), /seed anchor missing/);
console.log("frontier model patch: PASS (GLM 5.3 free NVIDIA seed, idempotent, fail-closed)");
