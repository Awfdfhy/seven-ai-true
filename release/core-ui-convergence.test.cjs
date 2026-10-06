const fs=require('fs'),assert=require('assert/strict');
const polish=fs.readFileSync(__dirname+'/workspaces/ui-polish-fixes.js','utf8');
const loader=fs.readFileSync(__dirname+'/ui-polish-loader.js','utf8');
const final=fs.readFileSync(__dirname+'/workspaces/seven-shell-final.js','utf8');
const finalCss=fs.readFileSync(__dirname+'/workspaces/seven-shell-final.css','utf8');

assert.doesNotMatch(polish,/seven-model-panel/,'UI polish must not create a second model panel');
assert.doesNotMatch(polish,/function\s+modelPicker\s*\(/,'UI polish must not own model picker construction');
assert.match(polish,/markCanonicalModelPicker/,'UI polish may only acknowledge the canonical shell picker');

assert.match(final,/seven-shell-model-menu/,'canonical final shell must own the model menu');
assert.match(final,/seven-shell-model-chip/,'canonical final shell must own the model trigger');
assert.match(final,/function\s+ensureMessageActions\s*\(/,'canonical final shell must own message-action decoration');
assert.match(final,/function\s+bindComposer\s*\(/,'canonical final shell must own composer geometry hooks');
assert.match(final,/function\s+bindSidebar\s*\(/,'canonical final shell must own mobile sidebar interaction');
assert.match(final,/new MutationObserver\(sync\)/,'canonical final shell must own one dynamic synchronization observer');
assert.doesNotMatch(loader,/['"]seven-shell['"]/,'legacy shell must be absent from runtime load path');
assert.match(finalCss,/Canonical Core shell/,'canonical stylesheet must contain the merged shell rules');

const pickerConstructors=[
  /seven-shell-model-menu/.test(final),
  /seven-model-panel/.test(polish)
].filter(Boolean).length;
assert.equal(pickerConstructors,1,'exactly one loaded Core model picker implementation must remain');

console.log('core UI convergence contract: PASS (single canonical Core owner)');
