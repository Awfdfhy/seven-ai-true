const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');

const foundation=fs.readFileSync(path.join(__dirname,'beta-ui.css'),'utf8');
const shell=fs.readFileSync(path.join(__dirname,'workspaces','seven-shell-final.css'),'utf8');
const rpg=fs.readFileSync(path.join(__dirname,'workspaces','rpg.js'),'utf8');
const build=fs.readFileSync(path.join(__dirname,'build-release.cjs'),'utf8');

for(const token of [
  '--seven-ui-canvas','--seven-ui-surface-1','--seven-ui-surface-2','--seven-ui-border',
  '--seven-ui-text','--seven-ui-text-muted','--seven-ui-accent','--seven-ui-touch-android',
  '--seven-ui-z-modal','--seven-ui-motion-normal','--seven-ui-radius-md'
]){
  assert.ok(foundation.includes(token+':'),'missing canonical UI token '+token);
}

assert.doesNotMatch(shell,/repeat\(4\s*,\s*minmax\(0\s*,\s*1fr\)\)/,'primary nav must not hard-code four columns');
assert.match(shell,/grid-auto-flow:column/,'primary nav must be count-agnostic');
assert.match(shell,/grid-auto-columns:minmax\(0,1fr\)/,'primary nav must allocate equal count-agnostic columns');

assert.match(build,/uiFoundationCss=compactCss\(read\('workspaces\/ui-foundation\.css'\)\)/,'release build must load canonical UI foundation');
assert.match(build,/seven-ui-foundation-style/,'release head must embed canonical UI foundation deterministically');

assert.match(rpg,/--seven-ui-accent/,'RPG visual layer must consume canonical UI tokens');
assert.match(rpg,/--seven-ui-surface-1/,'RPG visual layer must share canonical Seven surfaces');
assert.match(rpg,/inset-inline/,'RPG must retain logical direction-safe geometry');

console.log('UI convergence contract: PASS');
