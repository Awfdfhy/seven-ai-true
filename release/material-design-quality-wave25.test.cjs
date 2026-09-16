const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {lintFiles}=require('./design-lint.cjs');

const ROOT=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(ROOT,p),'utf8');
const exists=(p)=>fs.existsSync(path.join(ROOT,p));
let n=0;
const ok=(v,m)=>{assert.ok(v,m);n++};
const eq=(a,b,m)=>{assert.equal(a,b,m);n++};

const plan=read('docs/project-memory/current/FINAL_UI_MATERIALS_AND_DESIGN_QUALITY_PLAN.md');
const css=read('release/seven-final.css');
const beta=read('release/beta-ui.css');
const matrix=JSON.parse(read('docs/project-memory/current/PRODUCT_WIRING_MATRIX.json'));

for(const token of [
  'M0 — Canvas','M1 — Base Surface','M2 — Elevated Surface','M3 — Floating Surface',
  'M4 — Focus / Intelligence Material','M5 — Hero / Identity Material',
  '### Full','### Balanced','### Lite','### Reduced Motion',
  'Anti-Cheapness Failure Catalog','Final Material & Design Quality Gate','Freeze Rule'
]) ok(plan.includes(token),'materials plan lost required contract: '+token);

for(const principle of [
  'Visual hierarchy','Typography','Spacing rhythm','Geometry','Material quality','Color discipline',
  'Iconography','Motion','Interaction quality','State quality','Content quality','Distinctiveness',
  'Accessibility','Arabic / RTL','Responsiveness','Performance','Consistency','Restraint'
]) ok(plan.includes(`**${principle}**`),'design-quality constitution lost '+principle);

ok(css.includes('body.light{'),'day theme material branch missing');
ok(css.includes('body:not(.light){'),'night theme material branch missing');
ok(css.includes('--seven-on-accent:#ffffff'),'semantic on-accent token missing');
ok(css.includes('--seven-code-bg:'),'code material token missing');

for(const token of ['--seven-radius-xs:','--seven-radius-sm:','--seven-radius-md:','--seven-radius-lg:','--seven-radius-xl:','--seven-elev-1:','--seven-elev-2:','--seven-ring:','--seven-surface-glow:'])
  ok(css.includes(token),'governed design token missing: '+token);

ok(css.includes('.topbar{'),'topbar material surface missing');
ok(css.includes('backdrop-filter:saturate(125%) blur(14px)'),'full-tier topbar material missing');
ok(css.includes('.modal{'),'floating modal material missing');
ok(css.includes('backdrop-filter:blur(7px)'),'modal material missing');
ok(css.includes('.composer:focus-within{'),'focus/intelligence material missing');
ok(css.includes('var(--seven-surface-glow)'),'focus halo material token not consumed');

ok(css.includes('html.seven-tier-lite .empty-logo,html.seven-tier-lite .modal-content,html.seven-tier-lite .sidebar,html.seven-tier-lite .composer{box-shadow:none!important}'),'Lite tier must remove expensive shadows');
ok(css.includes('html.seven-tier-lite .topbar,html.seven-tier-lite .modal{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'),'Lite tier must remove live backdrop blur');
ok(css.includes('html.seven-tier-lite .composer::before,html.seven-tier-lite .seven-theme-shift::before,html.seven-tier-lite .message.assistant[data-seven-ui-decorated="1"]::before{display:none}'),'Lite tier must remove nonessential decorative layers');
ok(css.includes('html.seven-tier-balanced .topbar{backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}'),'Balanced tier must reduce live blur');
const fullBlur=Number((css.match(/blur\(14px\)/)||[''])[0].match(/\d+/)?.[0]||0);
const balancedBlur=Number((css.match(/seven-tier-balanced[^}]*blur\((\d+)px\)/)||[])[1]||0);
ok(fullBlur>0&&balancedBlur>0&&balancedBlur<fullBlur,'Balanced material cost must be lower than Full');

ok(css.includes('@media (prefers-reduced-motion:reduce){'),'Reduced Motion media path missing');
ok(css.includes('animation-duration:.001ms!important'),'Reduced Motion must collapse animations');
ok(css.includes('.seven-theme-shift::before{display:none!important}'),'Reduced Motion must remove signature theme sweep');
ok(css.includes('.composer:focus-within{transform:none}'),'Reduced Motion must preserve focus state without movement');

ok(css.includes('@media (max-width:720px){'),'phone composition breakpoint missing');
ok(css.includes('env(safe-area-inset-bottom)'),'safe-area bottom handling missing');
ok(css.includes('env(safe-area-inset-top)'),'safe-area top handling missing');
ok(css.includes('min-height:40px'),'mobile interactive target floor missing from final CSS');
ok(css.includes('content-visibility:auto'),'long-message rendering optimization missing');
ok(css.includes('contain:layout style paint'),'render containment missing');

const lint=lintFiles(['release/seven-final.css','release/beta-ui.css'],{root:ROOT});
eq(lint.counts.fail,0,'Wave25 requires zero Design Lint hard failures');
eq(lint.counts.warn,0,'Wave25 requires zero Design Lint warnings');
eq(lint.verdict,'PASS','Wave25 requires clean Design Lint PASS');

eq(matrix.schema,'seven.product-wiring-matrix.v1');
ok(Array.isArray(matrix.rows)&&matrix.rows.length>=29,'Wave25 requires complete product wiring matrix');
const fallibleSignals=new Set(['loading','running','streaming','retry','cancel','post_cancel','permission_required','offline','provider_degraded','resource_degraded','recovery','malformed_input']);
const failureStates=new Set(['error','permission_denied','offline','provider_degraded','resource_degraded','recovery','malformed_input']);
for(const row of matrix.rows){
  if(!row.release_relevant) continue;
  ok(row.status==='WIRED_VERIFIED'||row.status==='INFRA_VERIFIED','release-relevant surface lost verified state: '+row.capability_id);
  ok(row.entry_point_class!=='NO_USER_SURFACE','release-relevant capability lost user/runtime surface: '+row.capability_id);
  ok(Array.isArray(row.applicable_states)&&row.applicable_states.length>0,'release-relevant capability lacks state model: '+row.capability_id);
  const interactive=row.entry_point_class==='DIRECT_UI'||row.entry_point_class==='CONTEXTUAL_UI'||row.entry_point_class==='EXPERT_ESCAPE';
  const fallible=row.applicable_states.some(s=>fallibleSignals.has(s));
  if(interactive&&fallible)
    ok(row.applicable_states.some(s=>failureStates.has(s)),'fallible interactive capability lacks failure/degraded-state treatment: '+row.capability_id);
}

for(const file of [
  'release/global-ui-browser.test.cjs','release/specialist-ui-browser.test.cjs',
  'release/generated-ui-browser.test.cjs','release/motion-browser.test.cjs',
  'release/rtl-browser.test.cjs','release/accessibility-passb-browser.test.cjs',
  'release/mobile-performance-browser.test.cjs','release/contrast.test.cjs',
  'release/product-wiring-browser.test.cjs','release/visual-red-team-wave26.test.cjs',
  'release/android-visual-certification.test.cjs','release/source-integrity.test.cjs'
]) ok(exists(file),'Wave25 missing required cross-cutting proof: '+file);

for(const file of ['release/workspaces/hub.js','release/workspaces/coding.js','release/workspaces/research.js','release/workspaces/rpg.js'])
  ok(exists(file),'specialist material/product surface missing: '+file);

const liveCss=css+'\n'+beta;
const backdropUses=(liveCss.match(/(?:-webkit-)?backdrop-filter\s*:/g)||[]).length;
ok(backdropUses>0,'material system lost all intentional depth treatment');
ok(backdropUses<=24,'backdrop-filter proliferation violates restraint/performance boundary');
ok(!/transition\s*:\s*all\b/i.test(liveCss),'transition:all is forbidden in final material system');

const source=fs.readFileSync(path.join(ROOT,'seven_ai-final.html'));
const blob=crypto.createHash('sha1').update(Buffer.from(`blob ${source.length}\0`)).update(source).digest('hex');
eq(source.length,658133,'protected source byte size changed');
eq(blob,'3e8dfa8e7da7124e16504140eb9631c10cabf053','protected source Git blob changed');

console.log(`Wave 25 Materials + Design Quality Gate: PASS (${n} assertions; ${matrix.rows.length} capability bindings; ${backdropUses} governed backdrop-filter declarations; Design Lint ${lint.verdict})`);
