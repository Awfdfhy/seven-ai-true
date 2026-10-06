const fs=require('fs'),assert=require('assert/strict');
const loader=fs.readFileSync(__dirname+'/ui-polish-loader.js','utf8');
const legacy=fs.readFileSync(__dirname+'/workspaces/seven-shell.js','utf8');
const final=fs.readFileSync(__dirname+'/workspaces/seven-shell-final.js','utf8');

assert.match(final,/new MutationObserver\(sync\)/,'final shell must own DOM observation');
assert.match(final,/seven:shellsync/,'final shell must publish synchronization events');
assert.match(final,/SevenShellFinal/,'canonical runtime must register SevenShellFinal');
assert.doesNotMatch(loader,/['"]seven-shell['"]/,'loader must not load the legacy shell runtime or stylesheet');
assert.doesNotMatch(loader,/loadShell/,'legacy loadShell API must be removed');
assert.match(loader,/seven-shell-final/,'loader must load the canonical final shell');

assert.match(legacy,/SevenShell/,'legacy shell may remain temporarily as an unreferenced rollback artifact');
console.log('shell ownership contract: PASS (SevenShellFinal is the only loaded Core shell)');
