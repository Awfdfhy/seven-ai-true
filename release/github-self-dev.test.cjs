const assert=require('assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/github-self-dev.js','utf8');
function load(handler){
  let clock=0;const calls=[];
  const document={readyState:'loading',addEventListener(){},querySelector(){return null}};
  const context={document,console,TextEncoder,TextDecoder,Uint8Array,Date:class extends Date{static now(){return clock}},setTimeout(fn,ms){clock+=ms;fn()},Capacitor:{Plugins:{SevenPlatform:{async githubApi(request){calls.push(request);const result=await handler(request);return {ok:true,status:200,body:JSON.stringify(result)}}}}}};
  vm.createContext(context);
  vm.runInContext(source.replace('r.SevenGitHubSelfDev=Object.freeze({','r.__test={waitForRun};r.SevenGitHubSelfDev=Object.freeze({'),context);
  return {api:context.SevenGitHubSelfDev,wait:context.__test.waitForRun,calls};
}
(async()=>{
  let polled=0;
  const stale=load(req=>{assert.match(req.path,/actions\/workflows\/seven-tests\.yml\/runs/);polled++;return {workflow_runs:[{id:1,head_sha:'old',head_branch:'work',status:'completed',conclusion:'success'}]}});
  await assert.rejects(stale.wait('work','new',1),/exact autonomous commit/);
  assert.equal(polled,1);console.log('PASS stale CI success cannot verify a new commit');
  const wrongBranch=load(()=>({workflow_runs:[{head_sha:'new',head_branch:'other',status:'completed',conclusion:'success'}]}));
  await assert.rejects(wrongBranch.wait('work','new',1),/exact autonomous commit/);
  console.log('PASS same SHA from another branch cannot satisfy the gate');
  const pending=load(()=>({workflow_runs:[{head_sha:'new',head_branch:'work',status:'in_progress'}]}));
  await assert.rejects(pending.wait('work','new',1),/exact autonomous commit/);
  console.log('PASS timeout cannot return an unfinished CI run');
  const exact=load(()=>({workflow_runs:[{id:2,head_sha:'new',head_branch:'work',status:'completed',conclusion:'failure'}]}));
  assert.equal((await exact.wait('work','new',1)).conclusion,'failure');
  console.log('PASS exact failing CI is returned as failure');
  const atomic=load(req=>{
    if(req.path.includes('/git/ref/heads/'))return {object:{sha:'base'}};
    if(req.path.endsWith('/git/commits/base'))return {tree:{sha:'base-tree'}};
    if(req.path.includes('/git/trees/base-tree'))return {tree:[{path:'a.js',mode:'100755'}]};
    const body=JSON.parse(req.bodyJson);
    if(req.path.endsWith('/git/trees')){assert.equal(body.base_tree,'base-tree');assert.equal(body.tree.length,2);assert.equal(body.tree[0].mode,'100755');return {sha:'tree'}};
    if(req.path.endsWith('/git/commits')){assert.deepEqual(body.parents,['base']);return {sha:'candidate'}};
    assert.equal(req.method,'PATCH');assert.deepEqual(body,{sha:'candidate',force:false});return {object:{sha:'candidate'}};
  });
  const result=await atomic.api.atomicCommit('work',[{path:'a.js',content:'a'},{path:'b.js',content:'b'}],'change');
  assert.equal(result.sha,'candidate');assert.equal(atomic.calls.filter(x=>x.method==='PATCH').length,1);
  assert.ok(!atomic.calls.some(x=>x.path.includes('/contents/')));
  console.log('PASS multi-file changes publish once and preserve executable modes');
  const conflict=load(req=>{
    if(req.path.includes('/git/ref/heads/'))return {object:{sha:'base'}};
    if(req.path.endsWith('/git/commits/base'))return {tree:{sha:'base-tree'}};
    if(req.path.includes('/git/trees/base-tree'))return {tree:[{path:'a.js',mode:'100644'}]};
    if(req.method==='PATCH')throw new Error('non-fast-forward');return {sha:'candidate'};
  });
  await assert.rejects(conflict.api.atomicCommit('work',[{path:'a.js',content:'new'}],'change'),/non-fast-forward/);
  console.log('PASS concurrent ref updates fail without overwriting the branch');
  const forbidden=load(()=>{throw new Error('unexpected write')});
  await assert.rejects(forbidden.api.atomicCommit('work',[{path:'safe.js',content:'x'},{path:'all.cjs',content:'weaken'}],'change'),/protected path/);
  await assert.rejects(forbidden.api.atomicCommit('work',[{path:'a.js',content:'x'},{path:'a.js',content:'y'}],'change'),/Duplicate/);
  assert.equal(forbidden.calls.length,0);console.log('PASS all paths validate before any remote mutation');
  const merge=load(req=>{assert.equal(JSON.parse(req.bodyJson).sha,'verified');return {merged:true}});
  await merge.api.mergePullRequest(1,'verified');console.log('PASS merge is bound to the verified commit');
  assert.equal((source.match(/await dispatchWorkflow\("seven-tests\.yml",branch\)/g)||[]).length,2);
  console.log('github self-development failure hunt: PASS (9 cases)');
})().catch(e=>{console.error(e);process.exitCode=1});
