const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');

function loadRuntime(){
  const html=fs.readFileSync(__dirname+'/../seven_ai-final.html','utf8');
  const start=html.indexOf('window.SevenRuntime ='),end=html.indexOf('\n    </script>',start);
  assert.ok(start>=0&&end>start,'SevenRuntime source must exist');
  const store=new Map();
  const ctx={window:{addEventListener:()=>{}},localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},console};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
  return {runtime:ctx.window.SevenRuntime,store};
}

const {runtime}=loadRuntime();
global.SevenRuntime=runtime;
const Control=require('./control-runtime.js');
global.SevenControl=Control;
const Execution=require('./execution-bridge.js');
const Research=require('./research-runtime.js');
const World=require('./world-runtime.js');
const Canon=require('./canon-simulator.js');

let count=0;
function check(name,fn){assert.ok(fn(),name);count++;console.log('PASS',name);}

check('control/runtime/execution boot contract',()=>Control.state.ready&&runtime.version===4&&Execution.state.ready);

const task={goal:'integration write',allowedCapabilities:['fs.write'],scope:{files:['src']},verification:{required:true}};
const subject=runtime.createMemory('integration authorization','fact',{id:'integration-auth',scope:'user'});
runtime.commitMemory(subject);
const grant=runtime.issuePermissionGrant(subject.id,{actionClass:'fs.write'});
const tool={id:'write-file',name:'write file',capability:'fs.write',risk:'side_effect',schema:{type:'object',required:['path'],properties:{path:{type:'string'}},additionalProperties:false}};
const run=Execution.createRun(task,{id:'integration-run'});
const planned=Execution.planToolCall({run,tool,args:{path:'src/a.js'},grant,idempotencyKey:'integration:src/a.js'});
check('tool call crosses control -> runtime permission gate',()=>planned.allowed&&planned.call.status==='PLANNED');
const blockedRun=Execution.createRun(task,{id:'integration-blocked'});
const blocked=Execution.planToolCall({run:blockedRun,tool,args:{path:'docs/outside.md'},grant,idempotencyKey:'integration:outside'});
check('task file scope blocks cross-system escape',()=>!blocked.allowed&&blocked.call.authorization.reason==='file-outside-task-scope');
Execution.markToolAttempt(run,planned.call.id,{requestId:'req-1'});
Execution.verifyToolCall(run,planned.call.id,{kind:'write-proof',path:'src/a.js'});
Execution.beginVerification(run);
Execution.recordVerification(run,{status:'PASS',evidence:[{kind:'test',id:'integration'}]});
check('verification gate allows commit only after tool evidence',()=>Execution.canCommit(run).allowed===true);
Execution.beginCommit(run);Execution.completeRun(run,'integration-proof');
check('execution lifecycle reaches terminal completion',()=>run.task.state==='COMPLETED');

const cancelRun=Execution.createRun({goal:'cancel',allowedCapabilities:['fs.write']},{id:'cancel-run'});
Execution.cancelRun(cancelRun,'user-cancelled');
assert.throws(()=>Execution.appendEvent(cancelRun,'late',{}),/late event rejected/);count++;console.log('PASS cancellation rejects late events');

const checkpointRun=Execution.createRun({goal:'checkpoint',allowedCapabilities:['fs.write']},{id:'checkpoint-run'});
const checkpoint=Execution.persistCheckpoint(checkpointRun,'integration');
check('checkpoint restore preserves run identity',()=>Execution.restoreLatest(checkpointRun.task.id).id===checkpointRun.id);
const tampered=JSON.parse(JSON.stringify(checkpoint));tampered.snapshot.sequence=999;
check('checkpoint integrity rejects tampering',()=>Execution.validateCheckpoint(tampered,checkpointRun.task.id).valid===false);

const context=Control.compileContext({maxTokens:500,reserveTokens:50,principal:'user-a',namespace:'chat-a',activeScope:'normal',items:[
  {id:'ok',category:'memory',content:'relevant',principal:'user-a',namespace:'chat-a',scope:'normal',relevance:1},
  {id:'wrong-chat',category:'memory',content:'must not leak',principal:'user-a',namespace:'chat-b',scope:'normal',relevance:1},
  {id:'wrong-mode',category:'world',content:'rpg state',principal:'user-a',namespace:'chat-a',scope:'rpg',relevance:1}
]});
check('context compiler isolates chat and mode state',()=>context.selected.some(x=>x.id==='ok')&&!context.selected.some(x=>x.id==='wrong-chat'||x.id==='wrong-mode'));

const research=Research.verify(
  [{id:'c1',text:'current claim',timeSensitive:true,freshnessDays:7}],
  [{id:'s1',title:'source',url:'https://example.com/a',authority:'A1',publishedAt:'2026-10-04T00:00:00Z',retrievedAt:'2026-10-05T00:00:00Z',evidence:[{claimId:'c1',stance:'support',excerpt:'evidence',locator:'p1'}]}],
  {now:'2026-10-05T00:00:00Z'}
);
check('research evidence -> citation lock contract',()=>research.analysis.status==='PASS'&&research.citationLock.claims.c1?.[0]?.url==='https://example.com/a');

const work=World.createEngine({id:'w',sources:[{id:'src'}],beats:[
  {id:'b1',sourceRefs:['src']},{id:'b2',sourceRefs:['src']}
]});
let ws=work.createSession();
let wr=work.commitBeat(ws,{beatId:'b1',playerAction:'go',playerActionSource:'user'});ws=wr.session;
check('world runtime accepts in-order user-authored beat',()=>wr.status==='CANON'&&work.audit(ws).sequence.status==='PASS');
check('world runtime preserves player agency lock',()=>work.commitBeat(ws,{beatId:'b2',playerAction:'forced',playerActionSource:'model'}).reason==='player-agency');

const canon=Canon.createEngine({id:'canon',facts:[],anchors:[],sources:[],invariants:[]});
let cs=canon.createSession({position:0});
cs=canon.applySceneDelta(cs,{position:10},{id:'e1'}).session;
cs=canon.applySceneDelta(cs,{position:5},{id:'e2'}).session;
check('canon audit detects chronology regression',()=>canon.audit(cs).chronology.status==='FAIL'&&canon.audit(cs).chronology.issues[0].reason==='position-regression');

console.log('integration contracts: PASS ('+count+' assertions)');
