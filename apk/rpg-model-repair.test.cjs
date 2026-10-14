'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {patchRpgModelRuntime}=require('./rpg-model-repair.cjs');
// Test against the actual source anchors, not a mock invented catalog.
const html=fs.readFileSync(path.join(__dirname,'..','seven_ai-final.html'),'utf8');
const patched=patchRpgModelRuntime(html);
assert.ok(patched.includes('No available route — refresh or check provider access'));
assert.ok(patched.includes('const ready = all.filter(m => configured(m) && !isFreeModelCoolingDown(m,now));'));
assert.ok(patched.includes('picker.disabled = mode === "auto" || picker.dataset.rpgAvailableCount==="0";'));
assert.ok(patched.includes('No usable narrator model selected'));
assert.ok(!patched.includes('            document.getElementById("modelSelect").value = currentModel;'));
assert.ok(patched.includes('currentModel = selected && isValidFreeModelSelection(selected) ? selected : currentModel;'));
assert.ok(!patched.includes('            const pool = ready.length ? ready : all;'));
assert.ok(patched.includes('autoWorldTitle'),'RPG autoprompt title migration absent');
assert.ok(patched.includes('window.__SEVEN_RPG_NATIVE_KEYS'),'Android private model credentials not wired');
assert.throws(()=>patchRpgModelRuntime('unsupported source'),/anchors missing/);
console.log('Seven RPG model picker repair: PASS (usable routes, validation, preference integrity)');
