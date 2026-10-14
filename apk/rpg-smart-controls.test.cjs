'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'rpg-smart-controls.js'),'utf8');
const model=fs.readFileSync(path.join(__dirname,'rpg-model-repair.cjs'),'utf8');
const entry=fs.readFileSync(path.join(__dirname,'rpg-standalone-entry.js'),'utf8');
for(const hook of ['seven:rpg-model-catalog-updated','draftModel','Select a model','Refresh failed','outcome.ok!==true']){
  const expected=hook==='Select a model'?'Choose a model from these results':hook;
  assert.ok(src.includes(expected),'RPG model menu missing '+expected);
}
assert.ok(!src.includes('if(picker.value&&picker.value!==selected&&typeof win.onModelChange'), 'Filtering must never silently alter narration model');
assert.ok(model.includes('return {ok:true,report};'),'Provider catalog refresh must return completion status');
assert.ok(model.includes('throw e;'),'Provider catalog refresh failures must reach the UI');
assert.ok(model.includes('seven:rpg-model-catalog-updated'),'Transport must notify menu of fresh catalog');
assert.ok(entry.includes('var usableRoutes'),'Model button must not select manual routing without usable providers');
assert.ok(src.includes('rpg-connect-from-model'),'No-route screen needs a direct connection action');
assert.ok(src.includes('rpg-narrator-unavailable'),'RPG must explain and recover from quota errors');
console.log('Seven RPG menus: PASS (non-mutating search, catalog synchronization and refresh failures)');
