const fs=require('fs'),assert=require('assert/strict');
const src=fs.readFileSync(__dirname+'/workspaces/hub.js','utf8');
assert.match(src,/openEpoch:0/,'workspace hub must own a monotonic open operation epoch');
assert.match(src,/loads:\{\}/,'workspace loaders must be keyed per workspace');
assert.match(src,/if\(S\.loads\[kind\]\)return S\.loads\[kind\]/,'same workspace lazy load must deduplicate');
assert.match(src,/if\(S\.loads\[kind\]===promise\)delete S\.loads\[kind\]/,'stale loader completion must not clear a newer loader');
const guards=(src.match(/if\(epoch!==S\.openEpoch\)return next/g)||[]).length;
assert.equal(guards,2,'both RPG and specialist mount paths must reject stale opens');
assert.match(src,/function close\(\)\{S\.openEpoch\+\+/,'closing chat must invalidate pending workspace opens');
console.log('workspace concurrent-open ownership: PASS');

assert.match(src,/old&&old\.remove\(\)/,'stale failed script elements must be removed before retry');
assert.match(src,/s\.onerror=\(\)=>\{s\.remove\(\);reject/,'failed lazy loads must remove their script element');
