const fs=require('fs'),assert=require('assert/strict');
const base=fs.readFileSync(__dirname+'/workspaces/seven-shell.js','utf8');
const final=fs.readFileSync(__dirname+'/workspaces/seven-shell-final.js','utf8');
assert.match(base,/new MutationObserver\(sync\)/,'base shell must own DOM observation');
assert.match(base,/seven:shellsync/,'base shell must publish synchronization event');
assert.doesNotMatch(final,/new MutationObserver\(sync\)/,'final shell must not own a competing DOM observer');
assert.match(final,/addEventListener\('seven:shellsync',sync\)/,'final shell must decorate base shell synchronization');
console.log('shell ownership contract: PASS');
