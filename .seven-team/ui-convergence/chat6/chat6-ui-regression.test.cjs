'use strict';
// Chat 6 UI-only regression guards. Run: node --test .seven-team/ui-convergence/chat6/chat6-ui-regression.test.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const coding=fs.readFileSync(path.join(root,'release/workspaces/coding.js'),'utf8');
const selfdev=fs.readFileSync(path.join(root,'release/github-self-dev.js'),'utf8');
test('Coding retains execution and context bridge contracts',()=>{
  for(const x of ['sendMessage()','stopGeneration','regenerateLastReply','createKnowledgeArtifact','saveRooms','r.SevenCodingWorkspace=']) assert.ok(coding.includes(x),x);
});
test('Coding file selection and read-only code have accessibility/direction semantics',()=>{
  for(const x of ["aria-pressed","pre.setAttribute('dir','ltr')","setAttribute('dir','ltr')","pre.style.overflowX='auto'"]) assert.ok(coding.includes(x),x);
});
test('Coding import inputs can reimport same selection',()=>{
  assert.match(coding,/fi\.value=''/);
  assert.match(coding,/fo\.value=''/);
});
test('SelfDev preserves task draft, selection and focus across state renders',()=>{
  for(const x of ['preservedTask','taskFocused','selectionStart','selectionEnd','setSelectionRange(selectionStart,selectionEnd)']) assert.ok(selfdev.includes(x),x);
});
test('SelfDev keeps protected path and exact-receipt trust boundaries',()=>{
  for(const x of ['PROTECTED_PATHS','protectedPath(path)','seven-self-development-public-coding-v1','seven-coding-integration-v1','READY_FOR_INTEGRATION','receipt.baseSha!==result.coding.baselineSha']) assert.ok(selfdev.includes(x),x);
});
test('SelfDev technical logs are disclosed and OAuth code stays LTR',()=>{
  assert.ok(selfdev.includes('<details><summary>'));
  assert.ok(selfdev.includes('class="seven-gh-code" dir="ltr"'));
});
