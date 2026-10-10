const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const wrap=(title,kicker,desc,body,actions="")=>`<section class="s7-workspace"><div class="s7-workspace-inner"><header class="s7-workspace-head"><div><div class="s7-kicker">${esc(kicker)}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div><div class="s7-actions">${actions}</div></header>${body}</div></section>`;

export function renderSettingsSurface(){
 return wrap("Settings","Seven · System","One place for appearance, models, privacy and runtime behavior.",`
 <div class="s7-settings">
  <nav class="s7-card s7-card-body s7-settings-nav"><button data-active="true">General</button><button>Models</button><button>Memory</button><button>Privacy</button><button>Advanced</button></nav>
  <section class="s7-card"><div class="s7-card-head"><strong>General</strong><span class="s7-status" data-state="ok">SAVED</span></div><div class="s7-card-body">
   <div class="s7-setting-row"><div><strong>Dark appearance</strong><p>Follow Seven's dark theme across all workspaces.</p></div><button class="s7-switch" data-on="true" aria-label="Dark appearance"></button></div>
   <div class="s7-setting-row"><div><strong>Arabic interface</strong><p>Use RTL layout and Arabic presentation where available.</p></div><button class="s7-switch" data-on="false" aria-label="Arabic interface"></button></div>
   <div class="s7-setting-row"><div><strong>Memory</strong><p>Allow Seven to use durable conversation memory.</p></div><button class="s7-switch" data-on="true" aria-label="Memory"></button></div>
   <div class="s7-setting-row"><div><strong>Reasoning</strong><p>Default reasoning effort for supported models.</p></div><select class="s7-field"><option>Medium</option><option>High</option></select></div>
  </div></section>
 </div>`);
}

export function renderCodingSurface(){
 return wrap("Coding","Seven · Coding","Inspect the project, run the task, then verify the result.",`
 <section class="s7-taskbox"><textarea placeholder="Describe what you want Seven to inspect, build, debug, or explain…"></textarea><div class="s7-actions"><button class="s7-btn">Stop</button><button class="s7-btn">Retry</button><button class="s7-btn" data-primary="true">Run through Seven</button></div></section>
 <div class="s7-grid">
  <section class="s7-card"><div class="s7-card-head"><strong>Project</strong><span class="s7-muted">3 files</span></div><div class="s7-card-body s7-list">
   <div class="s7-list-row" data-active="true"><span>JS</span><code>src/runtime.js</code></div>
   <div class="s7-list-row"><span>CSS</span><code>src/ui.css</code></div>
   <div class="s7-list-row"><span>MD</span><code>README.md</code></div>
  </div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>Preview</strong><span class="s7-status">READ ONLY</span></div><div class="s7-card-body"><pre class="s7-code">export async function runTask(task) {
  const plan = await createPlan(task);
  const result = await execute(plan);
  return verify(result);
}</pre></div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>Execution / Verify</strong><span class="s7-status" data-state="ok">PASS</span></div><div class="s7-card-body s7-list"><div class="s7-list-row">Plan created</div><div class="s7-list-row">2 files inspected</div><div class="s7-list-row">Tests passed</div><div class="s7-list-row">Result ready</div></div></section>
 </div>`,`<button class="s7-btn">Import files</button><button class="s7-btn">Use as context</button>`);
}

export function renderSelfDevSurface(){
 return wrap("Self-Development","Seven · Guarded engineering","Changes are isolated, verified, and committed only after acceptance gates pass.",`
 <div class="s7-flow"><div class="s7-flow-step" data-state="done">Task</div><div class="s7-flow-step" data-state="done">Plan</div><div class="s7-flow-step" data-state="done">Changes</div><div class="s7-flow-step" data-state="active">Verify</div><div class="s7-flow-step">Commit</div><div class="s7-flow-step">Result</div></div>
 <section class="s7-taskbox" style="margin-block-start:12px"><textarea>Improve long-context memory retrieval without weakening tests.</textarea><div class="s7-actions"><span class="s7-status" data-state="ok">GitHub connected</span><button class="s7-btn" data-primary="true">Continue verification</button></div></section>
 <div class="s7-grid">
  <section class="s7-card"><div class="s7-card-head"><strong>Safety</strong><span class="s7-status" data-state="ok">LOCKED</span></div><div class="s7-card-body s7-list"><div class="s7-list-row">Protected paths enabled</div><div class="s7-list-row">Acceptance gates immutable</div><div class="s7-list-row">Atomic commits only</div></div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>Changes</strong><span class="s7-muted">branch: selfdev/run-184</span></div><div class="s7-card-body"><div class="s7-list-row" data-active="true">memory/retrieval.js <span class="s7-status" data-state="ok">+24 −7</span></div><div class="s7-list-row">memory/retrieval.test.js <span class="s7-status">+31</span></div></div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>Technical activity</strong><span class="s7-status" data-state="warn">VERIFYING</span></div><div class="s7-card-body s7-log"><div>✓ static safety audit</div><div>✓ memory regression suite</div><div>→ long-context benchmark</div></div></section>
 </div>`);
}

export function renderResearchSurface(){
 return wrap("Research","Seven · Research","Build claims from evidence, surface conflicts, and keep citations inspectable.",`
 <section class="s7-taskbox"><textarea>Compare the strongest approaches to persistent memory for agentic assistants.</textarea><div class="s7-actions"><button class="s7-btn">Clear</button><button class="s7-btn" data-primary="true">Research</button></div></section>
 <div class="s7-research-grid">
  <section class="s7-card"><div class="s7-card-head"><strong>Claims</strong><span class="s7-status" data-state="ok">4 verified</span></div><div class="s7-card-body s7-list">
   <article class="s7-claim"><strong>Hybrid memory outperforms a single store</strong><p class="s7-muted">Durable facts and retrieval context solve different failure modes.</p></article>
   <article class="s7-claim" data-state="conflict"><strong>Long context does not replace memory</strong><p class="s7-muted">Sources disagree on the point at which retrieval remains beneficial.</p></article>
   <article class="s7-claim" data-state="gap"><strong>Open question: forgetting policy</strong><p class="s7-muted">More evidence is required before recommending automatic deletion.</p></article>
  </div></section>
  <aside class="s7-card"><div class="s7-card-head"><strong>Evidence</strong><span class="s7-muted">6 sources</span></div><div class="s7-card-body s7-list"><div class="s7-list-row" data-active="true">Provider docs · primary</div><div class="s7-list-row">Architecture paper · primary</div><div class="s7-list-row">Benchmark · supporting</div></div></aside>
 </div>`);
}

export function renderRpgSurface(){
 return wrap("RPG","Seven · Living world","Narrative first. Canon, character knowledge and world state stay persistent.",`
 <div class="s7-research-grid">
  <section class="s7-card s7-rpg-hero"><div class="s7-kicker">Episode 34</div><div class="s7-rpg-title">The Hall Before Dawn</div><p class="s7-muted">Royal One gathers while the capital wakes under a quiet storm warning.</p><div class="s7-rpg-meta"><span class="s7-status">Valen</span><span class="s7-status" data-state="ok">Canon stable</span><span class="s7-status">Ali POV locked</span></div></section>
  <aside class="s7-card"><div class="s7-card-head"><strong>Scene state</strong><span class="s7-status" data-state="ok">LIVE</span></div><div class="s7-card-body s7-list"><div class="s7-list-row">Location: Royal Academy</div><div class="s7-list-row">Time: 06:42</div><div class="s7-list-row">Characters: 8 present</div></div></aside>
 </div>
 <div class="s7-grid" style="margin-block-start:12px">
  <section class="s7-card"><div class="s7-card-head"><strong>Cast</strong><span class="s7-muted">room knowledge</span></div><div class="s7-card-body s7-list"><div class="s7-list-row" data-active="true">Aria</div><div class="s7-list-row">Selene Marr</div><div class="s7-list-row">Lyra</div><div class="s7-list-row">Ren</div></div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>Story</strong><span class="s7-muted">narrator</span></div><div class="s7-card-body"><p>Rain pressed softly against the eastern glass. No one in Royal One spoke above a murmur.</p><p>Across the hall, the academy wards flickered once—then steadied.</p></div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>World state</strong><span class="s7-status" data-state="warn">1 change</span></div><div class="s7-card-body s7-list"><div class="s7-rpg-event">Storm warning raised<small class="s7-muted">Valen capital</small></div><div class="s7-rpg-event">Royal One assembled<small class="s7-muted">18 students</small></div></div></section>
 </div>`);
}

export function renderSurface(name){
 switch(name){
  case "settings":return renderSettingsSurface();
  case "coding":return renderCodingSurface();
  case "selfdev":return renderSelfDevSurface();
  case "research":return renderResearchSurface();
  case "rpg":return renderRpgSurface();
  default:return "";
 }
}
