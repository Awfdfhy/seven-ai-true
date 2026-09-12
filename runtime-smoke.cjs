const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(__dirname+'/seven_ai-final.html','utf8');
const start=html.indexOf('window.SevenRuntime =');const end=html.indexOf('\n    </script>',start);
const js=html.slice(start,end);
const store=new Map();
const ctx={window:{addEventListener:()=>{}},localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>{store.set(k,String(v))},removeItem:k=>store.delete(k)},console};
vm.createContext(ctx);vm.runInContext(js,ctx);const r=ctx.window.SevenRuntime;
let count=0;const check=(name,fn)=>{assert.ok(fn(),name);count++;console.log('PASS',name)};
check('runtime version',()=>r&&r.version===4);

const m=r.createMemory('keep exact 42','fact',{scope:'user'});
check('memory create commit',()=>r.commitMemory(m));
check('memory read preserves exact content',()=>r.readMemory().objects[0].content==='keep exact 42');
check('duplicate memory create is rejected',()=>r.commitMemory(r.createMemory('duplicate','note',{id:m.id}))===false);

const issued=r.issuePermissionGrant(m.id,{actionClass:'fs.write'});
check('scoped permission grant is valid',()=>!!issued&&r.canAuthorize(m,issued).allowed);
check('tampered grant is rejected',()=>r.canAuthorize(m,Object.assign({},issued,{scope:'other'})).allowed===false);
const writeTool={id:'write',name:'write',capability:'fs.write',risk:'side_effect',schema:{type:'object',required:['path'],properties:{path:{type:'string'}},additionalProperties:false}};
check('authorized side effect passes schema and permission gate',()=>r.gateTool(writeTool,{path:'src/a.js'},issued).allowed);
check('missing required tool argument is rejected',()=>r.gateTool(writeTool,{},issued).reason==='missing_argument');
check('wrong tool argument type is rejected',()=>r.gateTool(writeTool,{path:7},issued).reason==='invalid_argument_type');
check('unknown tool argument is rejected',()=>r.gateTool(writeTool,{path:'a',extra:true},issued).reason==='unknown_argument');
check('revoked grant is rejected',()=>r.revokePermissionGrant(m.id,issued.id)&&!r.canAuthorize(m,issued).allowed);

let w=r.createWorkspace([{id:'a',content:'alpha 123 with enough context to compress safely'}]);
w=r.contextAction(w,'COMPRESS','a',{max:12});
check('context compression records original',()=>w.items[0].compressed&&w.items[0].originalContent.includes('alpha 123'));
w=r.contextAction(w,'EXPAND','a');
check('context expand reconstructs original',()=>!w.items[0].compressed&&w.items[0].content===w.items[0].originalContent);
w=r.contextAction(w,'EVICT','a');
check('unpinned context can be evicted',()=>w.items[0].evicted===true);
w=r.contextAction(w,'RECONSTRUCT','a',{content:'reconstructed source'});
check('context reconstruct accepts supplied source',()=>w.items[0].content==='reconstructed source'&&!w.items[0].evicted);

const dup=r.createWorkspace([{id:'a',content:'same'},{id:'b',content:'same'}]);
const dedup=r.contextAction(r.contextAction(dup,'PIN','b'),'DEDUPLICATE');
check('tool registry aliases duplicate capabilities to canonical id',()=>{const t=r.registerTools([{id:'x',name:'search',capability:'web.search',schema:{}},{id:'y',name:'search2',capability:'web.search',schema:{}}]);return t.capabilities.length===1&&t.aliases.search2==='x'});
check('context dedupe keeps pin and lineage',()=>dedup.items.length===1&&dedup.items[0].pinned&&dedup.items[0].provenance.parentRefs.includes('b'));

check('run ledger appends events',()=>r.runLedger([{id:'run-1'}])&&r.runLedger([{id:'run-1'},{id:'run-2'}])&&r.readRuns().events.length===2);
store.set('seven_run_bundle_v2','bad');
check('corrupt run ledger fails closed',()=>r.runLedger([{id:'run-3'}])===false);
assert.throws(()=>r.readRuns(),/INVALID_RUNTIME_RUNS/);count++;console.log('PASS corrupt run read is rejected');
store.delete('seven_run_bundle_v2');

check('local outcome is recorded',()=>r.modelOutcome({task:'x',model:'free',success:true})&&r.readOutcomes().rows.length===1);
store.set('seven_model_outcomes_v1','bad');
check('corrupt outcome record fails closed',()=>r.modelOutcome({task:'y',model:'free',success:true})===false);
assert.throws(()=>r.readOutcomes(),/Unexpected token|INVALID_RUNTIME_OUTCOMES/);count++;console.log('PASS corrupt outcome read is rejected');
store.delete('seven_model_outcomes_v1');

check('local embedding is deterministic',()=>Math.abs(r.cosine(r.embed('same'),r.embed('same'))-1)<1e-9);
check('classifier requests evidence for fresh claims',()=>r.classify('latest source').needsEvidence==='high');
check('research envelope locks valid citations',()=>r.research([{url:'https://example.com',title:'x'}]).citationLock.length===1);
check('coding map rejects unsafe path',()=>{try{r.codingMap([{path:'../secret',content:'x'}]);return false}catch{return true}});
check('coding map fingerprints safe file',()=>!!r.codingMap([{path:'src/a.js',content:'x'}]).files[0].fingerprint);
console.log('runtime smoke: PASS ('+count+' assertions)');
