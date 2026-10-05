const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.join(__dirname,'..','.github','workflows');
const files=fs.readdirSync(root).filter(x=>/^agent-live-.*-smoke\.yml$/.test(x)||x==='agent-live-smoke.yml').sort();
assert.equal(files.length,10,'expected ten live-agent workflow families');
const branches=[];
for(const file of files){
  const text=fs.readFileSync(path.join(root,file),'utf8');
  assert.match(text,/\nconcurrency:\s*\n[\s\S]*?cancel-in-progress:\s*true/,'missing serialized concurrency: '+file);
  assert.match(text,/actions\/checkout@v4/,'missing isolated checkout: '+file);
  assert.match(text,/timeout \d+s/,'missing bounded agent timeout: '+file);
  assert.match(text,/git clean -fdx/,'missing cleanup boundary: '+file);
  assert.match(text,/git diff --cached --name-only/,'missing staged-diff whitelist: '+file);
  const matrix=[...text.matchAll(/\n\s+branch:\s*([^\s#]+)/g)].map(m=>m[1]).filter(x=>!x.includes('${{'));
  const literal=[...text.matchAll(/HEAD:(agent(?:-b)?\/[a-zA-Z0-9._/-]+)/g)].map(m=>m[1]);
  const own=[...new Set(matrix.concat(literal))];
  assert.equal(own.length,2,'each live-agent workflow must own exactly two explicit branches: '+file);
  branches.push(...own);
}
assert.equal(branches.length,20);
assert.equal(new Set(branches).size,20,'live-agent branches must be globally unique');
console.log('agent workflow isolation: PASS',JSON.stringify({workflows:files.length,branches:branches.length}));
