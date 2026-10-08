(function(r){
"use strict";
if(!r||!r.document)return;
const d=r.document;
const CLIENT_ID="Iv23lilyiGs3RQPZrPjq";
const REPO="Awfdfhy/seven-ai-true";
const REPO_API="/repos/"+REPO;
const DEFAULT_BASE="main";
const PROTECTED_PATHS=[
  /^\.github\//,
  /^evolution\//,
  /^hardening\//,
  /^all\.cjs$/,
  /^verify\.cjs$/,
  /^memory\.cjs$/,
  /^runtime-smoke\.cjs$/,
  /^eval\//,
  /^PROJECT_MANIFEST\.json$/,
  /^release\/github-self-dev\.js$/,
  /^apk\/materialize-native-platform\.cjs$/,
  /^apk\/(?:verify-apk|build-provenance(?:\.test)?)\.cjs$/,
  /^apk\/binary-verification(?:\.test)?\.cjs$/,
  /^release\/(?:static-audit|release-verify)\.cjs$/,
  /^release\/.*\.test\.cjs$/,
  /^release\/(?:exact-rc|final-seven-closure|full-seven-red-team|source-integrity|production-release-contract|visual-red-team|material-design-quality).*\.cjs$/
];
const S={
  version:"1.0.0",
  clientId:CLIENT_ID,
  repo:REPO,
  defaultBase:DEFAULT_BASE,
  connected:false,
  identity:null,
  device:null,
  busy:false,
  stage:"idle",
  last:null,
  panel:null,
  log:[],
  commandWrapped:false
};
const $=s=>d.querySelector(s);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function now(){return new Date().toISOString()}
function pushLog(message,kind){
  S.log.push({at:now(),message:String(message||""),kind:kind||"info"});
  if(S.log.length>160)S.log.splice(0,S.log.length-160);
  render();
}
function setStage(stage,message){
  S.stage=stage;
  if(message)pushLog(message,stage==="error"?"error":"info");
  else render();
}
function plugin(){
  const p=r.Capacitor&&r.Capacitor.Plugins&&r.Capacitor.Plugins.SevenPlatform;
  if(!p)throw new Error("Seven Android native platform bridge is unavailable.");
  return p;
}
function parseBody(res){
  if(!res||typeof res.body!=="string"||!res.body)return null;
  try{return JSON.parse(res.body)}catch(_){return res.body}
}
async function api(method,path,body){
  const res=await plugin().githubApi({clientId:CLIENT_ID,method:String(method||"GET").toUpperCase(),path,bodyJson:body===undefined?null:JSON.stringify(body)});
  const parsed=parseBody(res);
  if(!res.ok){
    const msg=parsed&&parsed.message?parsed.message:(typeof parsed==="string"?parsed:"GitHub API "+res.status);
    const e=new Error(msg);e.status=res.status;e.body=parsed;throw e;
  }
  return parsed;
}
function decodeBase64(value){
  const bin=atob(String(value||"").replace(/\s+/g,""));
  const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function encodeBase64(value){
  const bytes=new TextEncoder().encode(String(value==null?"":value));let binary="";
  for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));
  return btoa(binary);
}
function safeJsonText(text){
  text=String(text||"").trim();
  const fenced=text.match(/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/i);
  if(fenced)text=fenced[1].trim();
  const first=text.indexOf("{"),last=text.lastIndexOf("}");
  if(first>=0&&last>first)text=text.slice(first,last+1);
  return JSON.parse(text);
}
function protectedPath(path){return PROTECTED_PATHS.some(re=>re.test(String(path||"")))}
function safeRepoPath(path){
  path=String(path||"").replace(/^\/+|\/+$/g,"");
  if(!path||path.includes("..")||path.includes("\\")||/[\u0000-\u001f]/.test(path))throw new Error("Unsafe repository path.");
  return path;
}
async function connectionState(){
  const state=await plugin().githubConnectionState();
  S.connected=!!state.connected;
  if(S.connected){
    try{
      const [user,repo]=await Promise.all([api("GET","/user"),api("GET",REPO_API)]);
      S.identity={login:user&&user.login||"",repo:repo&&repo.full_name||REPO,private:!!(repo&&repo.private),defaultBranch:repo&&repo.default_branch||"main"};
    }catch(e){
      S.identity=null;
      pushLog("GitHub token exists but repository access could not be verified: "+e.message,"warn");
    }
  }else S.identity=null;
  render();
  return {connected:S.connected,identity:S.identity};
}
async function connect(){
  if(S.busy)return null;
  S.busy=true;setStage("connecting","Starting GitHub Device Flow…");
  try{
    const p=plugin();
    const flow=await p.githubBeginDeviceFlow({clientId:CLIENT_ID});
    S.device={deviceCode:flow.deviceCode,userCode:flow.userCode,verificationUri:flow.verificationUri||"",expiresAt:Date.now()+Number(flow.expiresIn||900)*1000,interval:Math.max(5,Number(flow.interval||5))};
    render();
    try{await p.githubOpenDevicePage()}catch(_){}
    pushLog("Enter code "+S.device.userCode+" on GitHub to authorize Seven.","action");
    while(Date.now()<S.device.expiresAt){
      await sleep(S.device.interval*1000);
      const poll=await p.githubPollDeviceFlow({clientId:CLIENT_ID,deviceCode:S.device.deviceCode});
      if(poll.authorized){
        S.device=null;S.connected=true;
        await connectionState();
        pushLog("GitHub connected. Tokens are stored in Android Keystore-backed secure storage.","ok");
        return S.identity;
      }
      if(poll.error==="slow_down")S.device.interval=Math.max(S.device.interval+5,Number(poll.interval||0));
      else if(poll.error&&poll.error!=="authorization_pending")throw new Error("GitHub authorization: "+poll.error);
      render();
    }
    throw new Error("GitHub authorization code expired.");
  }finally{S.busy=false;if(!S.connected)S.device=null;render()}
}
async function disconnect(){
  await plugin().githubDisconnect();S.connected=false;S.identity=null;S.device=null;S.last=null;pushLog("GitHub disconnected.","info");render();
}
async function getRef(branch){
  const name=String(branch||"").trim();if(!name)throw new Error("Branch required.");
  return api("GET",REPO_API+"/git/ref/heads/"+encodeURIComponent(name));
}
async function branchHead(branch){
  const ref=await getRef(branch),sha=ref&&ref.object&&ref.object.sha;
  if(!sha)throw new Error("Branch head unavailable.");
  const commit=await api("GET",REPO_API+"/git/commits/"+sha);
  return {sha,treeSha:commit&&commit.tree&&commit.tree.sha};
}
async function createBranch(base,name){
  const safeName=String(name||"").replace(/[^A-Za-z0-9._-]+/g,"-").replace(/^-+|-+$/g,"");
  if(!safeName)throw new Error("Invalid branch name.");
  const head=await branchHead(base);
  await api("POST",REPO_API+"/git/refs",{ref:"refs/heads/"+safeName,sha:head.sha});
  return {branch:safeName,base,sha:head.sha};
}
async function repositoryTree(branch){
  const head=await branchHead(branch);
  const tree=await api("GET",REPO_API+"/git/trees/"+head.treeSha+"?recursive=1");
  return {head,items:Array.isArray(tree&&tree.tree)?tree.tree:[],truncated:tree&&tree.truncated===true};
}
async function readFile(path,ref){
  path=safeRepoPath(path);
  const row=await api("GET",REPO_API+"/contents/"+path+"?ref="+encodeURIComponent(ref||DEFAULT_BASE));
  if(!row||row.type!=="file"||typeof row.content!=="string")throw new Error("File unavailable: "+path);
  return {path,sha:row.sha,size:Number(row.size)||0,content:decodeBase64(row.content)};
}
async function createBlob(content){
  return api("POST",REPO_API+"/git/blobs",{content:String(content),encoding:"utf-8"});
}
async function atomicCommit(branch,files,message){
  if(!Array.isArray(files)||!files.length)throw new Error("No changes to commit.");
  const entries=[],seen=new Set();
  for(const file of files){
    const path=safeRepoPath(file.path);
    if(protectedPath(path))throw new Error("Autonomous edits are blocked for protected path: "+path);
    if(seen.has(path))throw new Error("Duplicate change path: "+path);
    seen.add(path);entries.push({path,type:"blob",content:String(file.content)});
  }
  const snapshot=await repositoryTree(branch);
  if(snapshot.truncated)throw new Error("Truncated repository tree refused.");
  if(!snapshot.head.treeSha)throw new Error("Branch tree unavailable.");
  if(snapshot.items.length===0)throw new Error("Repository tree unavailable.");
  const modes=new Map(snapshot.items.map(x=>[x.path,x.mode]));
  for(const entry of entries){entry.mode=modes.get(entry.path)||"100644";if(!["100644","100755"].includes(entry.mode))throw new Error("Unsupported file mode: "+entry.path)}
  const tree=await api("POST",REPO_API+"/git/trees",{base_tree:snapshot.head.treeSha,tree:entries});
  if(!tree||!tree.sha)throw new Error("GitHub did not return a tree SHA.");
  const commit=await api("POST",REPO_API+"/git/commits",{message:String(message||"Seven autonomous development"),tree:tree.sha,parents:[snapshot.head.sha]});
  if(!commit||!commit.sha)throw new Error("GitHub did not return a commit SHA.");
  // One non-forced ref update publishes all files; a concurrent writer causes rejection.
  await api("PATCH",REPO_API+"/git/refs/heads/"+encodeURIComponent(branch),{sha:commit.sha,force:false});
  return {sha:commit.sha,files:entries.map(x=>x.path)};
}
function taskTokens(task){
  return [...new Set(String(task||"").toLowerCase().match(/[a-z0-9_.-]{3,}|[\u0600-\u06ff]{3,}/g)||[])].slice(0,32);
}
function selectTreePaths(items,task){
  const tokens=taskTokens(task);
  const allowed=items.filter(x=>x&&x.type==="blob"&&typeof x.path==="string"&&!protectedPath(x.path)&&!/(^|\/)(?:node_modules|dist|android|artifacts|screenshots|brand\/final\/renders)(\/|$)/.test(x.path)&&!(/\.(?:png|jpg|jpeg|webp|gif|ico|apk|zip|pdf|woff2?|ttf)$/i.test(x.path)));
  const scored=allowed.map(x=>{
    const p=x.path.toLowerCase();let score=0;
    for(const t of tokens)if(p.includes(t))score+=4;
    if(/seven_ai-final\.html$/.test(p))score+=2;
    if(/^release\//.test(p))score+=1;
    if(/^apk\//.test(p))score+=1;
    return {path:x.path,size:x.size||0,score};
  }).sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));
  return scored.slice(0,500);
}
function excerpt(content,task,maxChars){
  content=String(content||"");maxChars=maxChars||60000;
  if(content.length<=maxChars)return content;
  const tokens=taskTokens(task).filter(t=>/[a-z0-9_.-]/.test(t));
  const points=[];
  for(const token of tokens){
    let at=content.toLowerCase().indexOf(token.toLowerCase());
    if(at>=0)points.push(at);
    if(points.length>=8)break;
  }
  if(!points.length)points.push(0,Math.max(0,content.length-12000));
  const windows=[];let used=0;
  for(const point of points){
    const start=Math.max(0,point-5000),end=Math.min(content.length,point+9000);
    const part=content.slice(start,end);
    if(used+part.length>maxChars)break;
    windows.push("\n--- excerpt chars "+start+"-"+end+" ---\n"+part);used+=part.length;
  }
  return windows.join("\n");
}
async function askJson(system,user,maxTokens){
  const fn=typeof r.requestAI==="function"?r.requestAI:(typeof requestAI==="function"?requestAI:null);
  if(!fn)throw new Error("Seven model runtime is unavailable.");
  const result=await fn({messages:[{role:"system",content:system},{role:"user",content:user}],temperature:0.1,maxTokens:maxTokens||12000,purpose:"selfDev"});
  const text=result&&result.choices&&result.choices[0]&&result.choices[0].message&&result.choices[0].message.content;
  if(!text)throw new Error("The model returned no development plan.");
  return safeJsonText(text);
}
function validateSelectedFiles(plan,candidates){
  const allowed=new Set(candidates.map(x=>x.path));
  const rows=Array.isArray(plan&&plan.files)?plan.files:[];
  return [...new Set(rows.map(String).filter(p=>allowed.has(p)&&!protectedPath(p)))].slice(0,10);
}
function normalizeChanges(payload){
  const rows=Array.isArray(payload&&payload.changes)?payload.changes:[];
  if(!rows.length)throw new Error("Model produced no code changes.");
  if(rows.length>16)throw new Error("Model proposed too many changes in one pass.");
  return rows.map(row=>{
    const path=safeRepoPath(row&&row.path);
    if(protectedPath(path))throw new Error("Model attempted protected path: "+path);
    const type=row&&row.type==="create"?"create":"patch";
    if(type==="create"){
      if(typeof row.content!=="string"||!row.content.length)throw new Error("Create change missing content: "+path);
      return {path,type,content:row.content};
    }
    if(typeof row.find!=="string"||!row.find.length||typeof row.replace!=="string")throw new Error("Patch must contain exact find/replace strings: "+path);
    return {path,type,find:row.find,replace:row.replace};
  });
}
async function materializeChanges(branch,changes){
  const grouped=new Map();
  for(const ch of changes){if(!grouped.has(ch.path))grouped.set(ch.path,[]);grouped.get(ch.path).push(ch)}
  const out=[];let total=0;
  for(const [path,rows] of grouped){
    let content="",exists=true;
    try{content=(await readFile(path,branch)).content}catch(e){if(Number(e&&e.status)!==404)throw e;exists=false}
    for(const ch of rows){
      if(ch.type==="create"){
        if(exists||content)throw new Error("Create target already exists: "+path);
        content=ch.content;exists=true;continue;
      }
      if(!exists)throw new Error("Patch target does not exist: "+path);
      const first=content.indexOf(ch.find),last=content.lastIndexOf(ch.find);
      if(first<0)throw new Error("Patch anchor not found: "+path);
      if(first!==last)throw new Error("Patch anchor is ambiguous: "+path);
      content=content.slice(0,first)+ch.replace+content.slice(first+ch.find.length);
    }
    total+=content.length;if(total>1500000)throw new Error("Autonomous change set exceeds 1.5 MB safety limit.");
    out.push({path,content});
  }
  return out;
}
async function planFiles(task,branch){
  setStage("inspect","Inspecting repository tree…");
  const tree=await repositoryTree(branch),candidates=selectTreePaths(tree.items,task);
  const system="You are Seven's repository planning agent. Select only files actually relevant to the requested development task. Never select evaluator, CI workflow, security-boundary, or protected files. Return JSON only: {\"files\":[\"path\"],\"plan\":\"short implementation plan\"}. Select at most 10 files.";
  const user="Task:\n"+task+"\n\nRepository candidate paths:\n"+candidates.map(x=>x.path+" ("+x.size+" bytes)").join("\n");
  const plan=await askJson(system,user,6000);
  const files=validateSelectedFiles(plan,candidates);
  if(!files.length)throw new Error("Planner selected no editable files.");
  return {plan,files};
}
async function prepareImplementation(task,branch,selected,repairContext){
  setStage(repairContext?"repair":"implement",repairContext?"Preparing CI repair…":"Generating code changes…");
  const docs=[];
  for(const path of selected){
    try{const file=await readFile(path,branch);docs.push({path,content:excerpt(file.content,task,65000)})}catch(_){}
  }
  const system=[
    "You are Seven's autonomous coding agent working on its own GitHub repository.",
    "Return JSON only in this shape:",
    "{\"summary\":\"...\",\"changes\":[{\"path\":\"...\",\"type\":\"patch\",\"find\":\"exact existing text\",\"replace\":\"replacement text\"},{\"path\":\"new/file.js\",\"type\":\"create\",\"content\":\"full content\"}]}",
    "Use exact, minimal patches. The find string must occur exactly once in the provided current file.",
    "Do not weaken tests, CI, security boundaries, authorization, permission checks, release gates, or evaluator logic.",
    "Do not modify protected files. Do not include markdown fences. Maximum 16 changes."
  ].join("\n");
  let user="Task:\n"+task+"\n\nCurrent editable files/excerpts:\n"+docs.map(x=>"\n===== "+x.path+" =====\n"+x.content).join("\n");
  if(repairContext)user+="\n\nCI failure evidence:\n"+String(repairContext).slice(-90000);
  return askJson(system,user,16000);
}
async function waitForRun(branch,headSha,timeoutMs){
  const deadline=Date.now()+(timeoutMs||15*60*1000);
  while(Date.now()<deadline){
    const data=await api("GET",REPO_API+"/actions/workflows/seven-tests.yml/runs?branch="+encodeURIComponent(branch)+"&per_page=20");
    const runs=Array.isArray(data&&data.workflow_runs)?data.workflow_runs:[];
    const run=runs.find(x=>x.head_sha===headSha&&x.head_branch===branch);
    if(run){
      setStage("ci","CI "+run.status+(run.conclusion?" / "+run.conclusion:"")+" · run #"+run.run_number);
      if(run.status==="completed")return run;
    }
    await sleep(9000);
  }
  throw new Error("CI did not complete for the exact autonomous commit: "+headSha);
}
async function failureEvidence(run){
  const jobsData=await api("GET",REPO_API+"/actions/runs/"+run.id+"/jobs?per_page=100");
  const failed=(jobsData.jobs||[]).filter(j=>j.conclusion==="failure"||j.conclusion==="cancelled");
  const parts=[];
  for(const job of failed.slice(0,3)){
    try{
      const row=await plugin().githubJobLogs({clientId:CLIENT_ID,jobId:Number(job.id)});
      parts.push("JOB "+job.name+" (#"+job.id+")\n"+String(row.logs||"").slice(-70000));
    }catch(e){parts.push("JOB "+job.name+" (#"+job.id+"): logs unavailable: "+e.message)}
  }
  return parts.join("\n\n");
}
async function openPullRequest(task,branch,base,summary){
  return api("POST",REPO_API+"/pulls",{title:"Seven self-dev: "+String(task).slice(0,90),head:branch,base,body:"Autonomous Seven development run.\n\nTask: "+task+"\n\nSummary: "+String(summary||"")+"\n\nAll autonomous edits were constrained by Seven's protected-path policy."});
}
async function mergePullRequest(number,expectedSha){
  return api("PUT",REPO_API+"/pulls/"+Number(number)+"/merge",{merge_method:"squash",...(expectedSha?{sha:expectedSha}:{})});
}
async function dispatchWorkflow(workflow,ref){
  const name=String(workflow||"android-apk.yml").replace(/[^A-Za-z0-9._-]/g,"");
  await api("POST",REPO_API+"/actions/workflows/"+encodeURIComponent(name)+"/dispatches",{ref:String(ref||DEFAULT_BASE)});
  return true;
}
async function selfDevelop(task,options){
  task=String(task||"").trim();if(!task)throw new Error("Development task is empty.");
  if(S.busy)throw new Error("Seven is already running a development operation.");
  // The shipped UI must never substitute its own edit/repair loop for Coding.
  const bridge=r.SevenSelfDevelopment;
  if(!bridge||bridge.contract!=="seven-self-development-public-coding-v1"||typeof bridge.runCodingEvolution!=="function"){
    throw new Error("Self-Development is blocked: the public Coding and Trusted Eval production bridge is unavailable.");
  }
  const opts=Object.assign({base:DEFAULT_BASE,maxRepairs:2,autoMerge:false,buildApk:false},options||{});
  S.busy=true;S.last=null;S.log=[];setStage("start","Starting verified self-development: "+task);
  try{
    const state=await connectionState();if(!state.connected||!state.identity)throw new Error("Connect GitHub and install Seven Self Dev on "+REPO+" first.");
    const result=await bridge.runCodingEvolution({task,options:opts});
    const receipt=result&&result.coding&&result.coding.receipt;
    if(!receipt||receipt.contract!=="seven-coding-integration-v1"||receipt.verdict!=="READY_FOR_INTEGRATION"||receipt.baseSha!==result.coding.baselineSha||receipt.resultSha!==result.coding.candidateSha){
      throw new Error("Self-Development did not return an exact-SHA Verified Coding Receipt.");
    }
    if(result.outcome!=="COMMITTED"||result.learningRecorded!==true){
      throw new Error("Self-Development was not accepted and archived: "+String(result.outcome||"unknown"));
    }
    S.last={task,commit:receipt.resultSha,baseSha:receipt.baseSha,outcome:result.outcome,receipt,learningRecorded:true};
    setStage("done","Verified self-development completed.");return S.last;
  }catch(e){
    setStage("error",e.message);S.last={task,error:e.message};throw e;
  }finally{S.busy=false;render()}
}

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function isArabic(){return /^ar\b/i.test(String(d.documentElement.lang||""))}
function L(en,ar){return isArabic()?ar:en}
function closePanel(){
  const back=$("#seven-github-selfdev");if(!back)return;
  const saved=back.__sevenInertSiblings||[];
  back.remove();
  for(const item of saved){const el=item&&item[0];if(el&&el.isConnected)el.inert=!!item[1]}
  S.panel=null;
}

function ensureStyle(){
  if($("#seven-github-selfdev-style"))return;
  const style=d.createElement("style");style.id="seven-github-selfdev-style";style.textContent=`
  .seven-gh-backdrop{position:fixed;inset:0;z-index:var(--seven-ui-z-modal,400);background:rgba(5,7,14,.68);display:flex;align-items:center;justify-content:center;padding:16px}
  .seven-gh-panel{width:min(760px,100%);max-height:min(90dvh,860px);overflow:auto;border:1px solid var(--seven-ui-border,var(--sb-b,#34334a));border-radius:var(--seven-ui-radius-lg,20px);background:var(--seven-ui-surface-1,var(--sb-s,#171625));color:var(--seven-ui-text,var(--sb-t,#f7f7fb));box-shadow:0 22px 70px rgba(0,0,0,.4)}
  .seven-gh-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px;border-bottom:1px solid var(--seven-ui-border,var(--sb-b,#34334a));position:sticky;top:0;background:inherit;z-index:1}.seven-gh-head h2{margin:0;font-size:1rem}
  .seven-gh-close{width:44px;height:44px;border-radius:12px;border:1px solid var(--seven-ui-border,var(--sb-b,#34334a));background:var(--seven-ui-surface-2,var(--sb-s2,#222136));color:inherit}
  .seven-gh-body{padding:16px;display:grid;gap:12px}.seven-gh-card{padding:13px;border:1px solid var(--seven-ui-border,var(--sb-b,#34334a));border-radius:var(--seven-ui-radius-md,16px);background:var(--seven-ui-surface-2,var(--sb-s2,#222136))}
  .seven-gh-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.seven-gh-row strong{font-size:.82rem}.seven-gh-muted{font-size:.72rem;color:var(--seven-ui-text-muted,var(--sb-m,#aaa8bd));line-height:1.5}
  .seven-gh-flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px}.seven-gh-flow span{padding:7px 5px;border-radius:9px;text-align:center;font-size:.64rem;background:var(--seven-ui-surface-1,var(--sb-s,#171625));color:var(--seven-ui-text-muted,var(--sb-m,#aaa8bd));border:1px solid var(--seven-ui-border,var(--sb-b,#34334a))}.seven-gh-flow span[data-active=true]{color:var(--seven-ui-text,var(--sb-t,#fff));border-color:var(--seven-ui-accent,var(--sb-a,#7567ff))}
  .seven-gh-btn{min-height:44px;padding:8px 12px;border-radius:11px;border:1px solid var(--seven-ui-border,var(--sb-b,#34334a));background:var(--seven-ui-surface-1,var(--sb-s,#171625));color:inherit;font:inherit;font-weight:700}.seven-gh-btn.primary{background:var(--seven-ui-accent,var(--sb-a,#7567ff));color:#fff;border:0}.seven-gh-btn:disabled{opacity:.55}
  .seven-gh-code{direction:ltr;unicode-bidi:isolate;font:700 1.15rem ui-monospace,monospace;letter-spacing:.08em;padding:9px 11px;border-radius:10px;background:#0f1020;user-select:all}
  .seven-gh-task{width:100%;min-height:92px;resize:vertical;border:1px solid var(--seven-ui-border,var(--sb-b,#34334a));border-radius:12px;background:var(--seven-ui-surface-1,var(--sb-s,#171625));color:inherit;padding:10px;font:inherit;box-sizing:border-box}
  .seven-gh-log{max-height:210px;overflow:auto;display:grid;gap:5px;font:600 .68rem ui-monospace,monospace;direction:ltr;text-align:left}.seven-gh-log div{padding:6px 8px;border-radius:8px;background:rgba(255,255,255,.035);white-space:pre-wrap;word-break:break-word}.seven-gh-log [data-kind=error]{color:#ff9ca6}.seven-gh-log [data-kind=ok]{color:#8fe3b3}.seven-gh-log [data-kind=warn]{color:#ffd78a}
  .seven-gh-nav{margin-top:6px}.seven-gh-switch{display:flex;gap:7px;align-items:center;font-size:.72rem}.seven-gh-switch input{width:auto}
  @media(max-width:620px){.seven-gh-backdrop{padding:max(6px,env(safe-area-inset-top,0px)) max(6px,env(safe-area-inset-right,0px)) max(6px,env(safe-area-inset-bottom,0px)) max(6px,env(safe-area-inset-left,0px));align-items:flex-end}.seven-gh-panel{max-height:calc(var(--seven-visual-height,100dvh) - 12px);border-radius:18px 18px 10px 10px}.seven-gh-body{padding:12px}.seven-gh-flow{grid-template-columns:repeat(3,minmax(0,1fr))}}
  @media(prefers-reduced-motion:reduce){.seven-gh-panel,.seven-gh-btn{transition:none!important;animation:none!important}}
  `;d.head.appendChild(style);
}
function openPanel(task){
  ensureStyle();
  let back=$("#seven-github-selfdev");
  if(!back){
    back=d.createElement("div");back.id="seven-github-selfdev";back.className="seven-gh-backdrop";back.innerHTML='<section class="seven-gh-panel" role="dialog" aria-modal="true" aria-labelledby="seven-gh-title"><div class="seven-gh-head"><div><h2 id="seven-gh-title">'+esc(L("Seven · GitHub Self Development","Seven · التطوير الذاتي عبر GitHub"))+'</h2><div class="seven-gh-muted">'+esc(L("Secure Device Flow","تدفق جهاز آمن"))+' · '+esc(REPO)+'</div></div><button class="seven-gh-close" aria-label="'+esc(L("Close","إغلاق"))+'">×</button></div><div class="seven-gh-body"></div></section>';
    back.addEventListener("click",e=>{if(e.target===back||e.target.closest(".seven-gh-close"))closePanel()});
    back.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();closePanel()}});
    const host=d.getElementById("seven-app")||d.body;host.appendChild(back);
    back.__sevenInertSiblings=[...host.children].filter(x=>x!==back).map(x=>[x,!!x.inert]);for(const [el]of back.__sevenInertSiblings)el.inert=true;
  }
  S.panel=back;
  if(task){const area=back.querySelector(".seven-gh-task");if(area)area.value=task}
  render();
  connectionState().catch(()=>{});
  return back;
}
function render(){
  const back=$("#seven-github-selfdev");if(!back)return;
  const body=back.querySelector(".seven-gh-body");if(!body)return;
  const identity=S.identity?esc(S.identity.login+" · "+S.identity.repo):esc(L("Not verified","غير متحقق"));
  const device=S.device?'<div class="seven-gh-card"><div class="seven-gh-muted">'+esc(L("Authorize this device on GitHub","اسمح لهذا الجهاز عبر GitHub"))+'</div><div class="seven-gh-row" style="margin-top:8px"><span class="seven-gh-code">'+esc(S.device.userCode)+'</span><button class="seven-gh-btn" data-gh-open>'+esc(L("Open GitHub","فتح GitHub"))+'</button></div><div class="seven-gh-muted" style="margin-top:8px">'+esc(L("Seven never asks you to paste the access token. GitHub sends authorization to the native app after you approve this code.","لن يطلب منك Seven لصق رمز الوصول. يرسل GitHub التفويض إلى التطبيق بعد موافقتك على هذا الرمز."))+'</div></div>':"";
  const logs=S.log.slice(-60).map(x=>'<div data-kind="'+esc(x.kind)+'">'+esc(x.message)+'</div>').join("");
  const last=S.last&&S.last.prUrl?'<div class="seven-gh-muted">PR #'+esc(S.last.prNumber)+' · '+esc(S.last.prUrl)+(S.last.merged?" · merged":"")+'</div>':"";
  const stage=String(S.stage||'idle').toLowerCase();
  const flow=[['task',L('Task','المهمة')],['planning',L('Plan','الخطة')],['executing',L('Changes','التغييرات')],['verifying',L('Verify','التحقق')],['committing',L('Commit','التثبيت')],['done',L('Result','النتيجة')]];
  const activeIndex=Math.max(0,flow.findIndex(x=>stage===x[0]||(x[0]==='executing'&&['repairing','running'].includes(stage))));
  body.innerHTML=`
    <div class="seven-gh-card">
      <div class="seven-gh-row"><strong>${esc(L("Connection","الاتصال"))}</strong><span class="seven-gh-muted">${S.connected?esc(L("Connected","متصل"))+" · "+identity:esc(L("Disconnected","غير متصل"))}</span></div>
      <div class="seven-gh-row" style="margin-top:10px"><button class="seven-gh-btn primary" data-gh-connect ${S.busy?"disabled":""}>${esc(S.connected?L("Re-authorize","إعادة التفويض"):L("Connect GitHub","ربط GitHub"))}</button><button class="seven-gh-btn" data-gh-refresh>${esc(L("Check access","فحص الوصول"))}</button><button class="seven-gh-btn" data-gh-disconnect ${S.connected?"":"disabled"}>${esc(L("Disconnect","قطع الاتصال"))}</button></div>
    </div>
    ${device}
    <div class="seven-gh-flow" aria-label="${esc(L("Development flow","مسار التطوير"))}">${flow.map((x,i)=>'<span data-active="'+(i<=activeIndex)+'">'+esc(x[1])+'</span>').join("")}</div>
    <div class="seven-gh-card">
      <strong>${esc(L("Task","المهمة"))}</strong>
      <div class="seven-gh-muted" style="margin:6px 0 10px">${esc(L("Seven works on an isolated branch and commits only after verification. Protected paths and acceptance gates cannot be weakened.","يعمل Seven على فرع معزول ولا يثبت التغييرات إلا بعد التحقق. لا يمكن إضعاف المسارات المحمية أو بوابات القبول."))}</div>
      <textarea class="seven-gh-task" placeholder="${esc(L("Example: Improve long-context memory retrieval without weakening tests.","مثال: حسّن استرجاع الذاكرة طويلة السياق دون إضعاف الاختبارات."))}"></textarea>
      <div class="seven-gh-row" style="margin-top:9px"><label class="seven-gh-switch"><input type="checkbox" data-gh-auto-merge> ${esc(L("Auto-merge only after green CI","دمج تلقائي فقط بعد نجاح CI"))}</label><label class="seven-gh-switch"><input type="checkbox" data-gh-build-apk> ${esc(L("Build APK after green CI","بناء APK بعد نجاح CI"))}</label></div>
      <div class="seven-gh-row" style="margin-top:10px"><button class="seven-gh-btn primary" data-gh-run ${(!S.connected||S.busy)?"disabled":""}>${esc(S.busy?L("Working…","جارٍ العمل…"):L("Self Develop","تطوير ذاتي"))}</button><span class="seven-gh-muted">${esc(L("Stage","المرحلة"))}: ${esc(S.stage)}</span></div>
      ${last}
    </div>
    <details class="seven-gh-card"><summary><strong>${esc(L("Technical activity","النشاط التقني"))}</strong></summary><div class="seven-gh-log" style="margin-top:8px">${logs||'<div>'+esc(L("No development run yet.","لا توجد عملية تطوير بعد."))+'</div>'}</div></details>
  `;
  const q=sel=>body.querySelector(sel);
  q("[data-gh-connect]")?.addEventListener("click",()=>connect().catch(e=>pushLog(e.message,"error")));
  q("[data-gh-refresh]")?.addEventListener("click",()=>connectionState().catch(e=>pushLog(e.message,"error")));
  q("[data-gh-disconnect]")?.addEventListener("click",()=>disconnect().catch(e=>pushLog(e.message,"error")));
  q("[data-gh-open]")?.addEventListener("click",()=>plugin().githubOpenDevicePage().catch(()=>{}));
  const auto=q("[data-gh-auto-merge]"),build=q("[data-gh-build-apk]");
  if(auto)auto.checked=localStorage.getItem("seven_github_auto_merge_v1")==="1";
  if(build)build.checked=localStorage.getItem("seven_github_build_apk_v1")==="1";
  auto?.addEventListener("change",()=>localStorage.setItem("seven_github_auto_merge_v1",auto.checked?"1":"0"));
  build?.addEventListener("change",()=>localStorage.setItem("seven_github_build_apk_v1",build.checked?"1":"0"));
  q("[data-gh-run]")?.addEventListener("click",async()=>{
    const task=q(".seven-gh-task")?.value.trim();if(!task)return;
    try{await selfDevelop(task,{autoMerge:!!auto?.checked,buildApk:!!build?.checked,maxRepairs:2})}catch(_){}
  });
}
function ensureNav(){
  const nav=$(".seven-shell-primary-nav");if(!nav||nav.querySelector("[data-seven-github-selfdev]"))return;
  const b=d.createElement("button");b.type="button";b.className="seven-shell-nav-btn seven-gh-nav";b.dataset.sevenGithubSelfdev="1";b.innerHTML='<span aria-hidden="true">⌁</span><span>'+esc(L("Self Dev","تطوير ذاتي"))+'</span>';b.setAttribute("aria-label",L("GitHub Self Development","التطوير الذاتي عبر GitHub"));b.onclick=()=>openPanel();nav.appendChild(b);
}
function wrapCommand(){
  if(S.commandWrapped||typeof r.sendMessage!=="function")return;
  const previous=r.sendMessage;
  r.sendMessage=async function(){
    const input=$("#userInput"),text=String(input&&input.value||"").trim();
    const match=text.match(/^\/selfdev(?:\s+([\s\S]+))?$/i);
    if(match){
      if(input){input.value="";input.style.height="auto"}
      openPanel(match[1]||"");
      return;
    }
    return previous.apply(this,arguments);
  };
  S.commandWrapped=true;
}
function boot(){
  ensureStyle();ensureNav();wrapCommand();
  const mo=new MutationObserver(()=>{ensureNav();wrapCommand()});mo.observe(d.body,{childList:true,subtree:true});
  connectionState().catch(()=>{});
}
d.readyState==="loading"?d.addEventListener("DOMContentLoaded",boot,{once:true}):boot();
r.SevenGitHubSelfDev=Object.freeze({
  version:S.version,state:S,clientId:CLIENT_ID,repo:REPO,connect,disconnect,connectionState,api,readFile,createBranch,repositoryTree,atomicCommit,dispatchWorkflow,mergePullRequest,selfDevelop,openPanel,
  protectedPath
});
})(typeof globalThis!=="undefined"?globalThis:this);
