const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const attachment=fs.readFileSync(__dirname+'/attachment-runtime.js','utf8');
assert.match(attachment,/MAX_FILE_BYTES=25\*1024\*1024/);
assert.match(attachment,/TYPE_MISMATCH/);
assert.match(attachment,/ATTACHMENT_TOTAL_TOO_LARGE/);
const loader=fs.readFileSync(__dirname+'/attachment-loader.js','utf8');
assert.match(loader,/seven-attachment-runtime-lazy/);
assert.match(loader,/\.remove\(\)/);
const rpg=fs.readFileSync(__dirname+'/workspaces/rpg.js','utf8');
assert.match(rpg,/function snapshot\(\)\{return clone/);
assert.match(rpg,/PACK_TOO_LARGE/);
assert.match(rpg,/PACK_TOO_DEEP/);
const Canon=require('./canon-simulator.js');
const engine=Canon.createEngine({id:'c',anchors:[],facts:[],sources:[],invariants:[]});
let s=engine.createSession();
let out=engine.applySceneDelta(s,{canonDebtDelta:0.1},{forceBranch:'true'});
assert.ok(out.session.branchId,'serialized forceBranch must create branch');
console.log('resilience contracts: PASS');

const html=fs.readFileSync(__dirname+'/../seven_ai-final.html','utf8');
assert.match(html,/fetchProviderWithTimeout\(provider\.modelsUrl[\s\S]{0,160}8000\)/);
assert.match(html,/fallbackAttemptBudgetV2/);
assert.match(html,/requestDeadlineMs/);
console.log('network resilience contracts: PASS');

const native=fs.readFileSync(__dirname+'/../apk/materialize-native-platform.cjs','utf8');
assert.match(native,/path\.equals\(GITHUB_REPO\)\|\|path\.startsWith\(GITHUB_REPO\+"\/"\)/,'GitHub native path boundary must be exact');
assert.doesNotMatch(native,/out\.length\(\)>180000/,'job logs must not be silently cut to 180KB');
assert.match(native,/ret\.put\("truncated",text\.size\(\)>=MAX_GITHUB_RESPONSE\)/);
console.log('GitHub native path/log contracts: PASS');

const attachmentRuntime=fs.readFileSync(__dirname+'/attachment-runtime.js','utf8');
assert.doesNotMatch(attachmentRuntime,/finally\{clearSelection\(\)\}/,'failed sends retain attachment selection');
assert.match(attachmentRuntime,/await original\.apply\(this,arguments\);clearSelection\(\);return out/);
const appHtml=fs.readFileSync(__dirname+'/../seven_ai-final.html','utf8');
assert.match(appHtml,/ch\.charCodeAt\(0\) < 128 \? 0\.25 : 1/,'main estimator must be multilingual-conservative');
console.log('attachment and token convergence contracts: PASS');
