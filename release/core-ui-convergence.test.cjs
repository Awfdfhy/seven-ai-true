const fs=require('fs'),assert=require('assert/strict');
const polish=fs.readFileSync(__dirname+'/workspaces/ui-polish-fixes.js','utf8');
const shell=fs.readFileSync(__dirname+'/workspaces/seven-shell.js','utf8');
const final=fs.readFileSync(__dirname+'/workspaces/seven-shell-final.js','utf8');

assert.doesNotMatch(polish,/seven-model-panel/,'UI polish must not create a second model panel');
assert.doesNotMatch(polish,/function\s+modelPicker\s*\(/,'UI polish must not own model picker construction');
assert.doesNotMatch(polish,/markCanonicalModelPicker/,'UI polish must not retain a picker ownership shim');

assert.match(shell,/seven-shell-model-menu/,'base shell currently owns the single model menu');
assert.match(shell,/seven-shell-model-chip/,'base shell currently owns the model trigger');
assert.doesNotMatch(final,/seven-model-panel/,'final shell decorator must not introduce a competing picker');
assert.doesNotMatch(final,/seven-shell-model-menu/,'final shell decorator must not introduce a second model menu');

const pickerConstructors=[
  /seven-shell-model-menu/.test(shell),
  /seven-shell-model-menu/.test(final),
  /seven-model-panel/.test(polish)
].filter(Boolean).length;
assert.equal(pickerConstructors,1,'exactly one Core model picker implementation must remain');

console.log('core UI convergence contract: PASS (single model picker owner)');
