const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const {lintFiles}=require('./design-lint.cjs');

const ROOT=path.resolve(__dirname,'..');
const matrix=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/project-memory/current/FINAL_DESIGN_QUALITY_MATRIX.json'),'utf8'));
const finalCss=fs.readFileSync(path.join(ROOT,'release/seven-final.css'),'utf8');
const betaCss=fs.readFileSync(path.join(ROOT,'release/beta-ui.css'),'utf8');
const css=finalCss+'\n'+betaCss;
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++};

ok(matrix.schema==='seven.final-design-quality.v1','bad final design schema');
ok(matrix.version===1,'bad final design version');
ok(Array.isArray(matrix.materials)&&matrix.materials.length===6,'M0-M5 material ladder must be complete');
ok(matrix.materials.map(x=>x.id).join('|')==='M0_CANVAS|M1_BASE|M2_ELEVATED|M3_FLOATING|M4_FOCUS_INTELLIGENCE|M5_HERO_IDENTITY','material ladder order drift');
ok(new Set(matrix.quality_dimensions).size===18,'18 final quality dimensions must remain explicit');
ok(matrix.freeze_policy.required_challenge_rounds===2,'two challenge rounds are mandatory before freeze');

for(const token of ['--seven-g-canvas','--seven-g-surface','--seven-g-surface-raised'])ok(betaCss.includes(token+':'),'missing canonical material token '+token);
for(const selector of ['.modal-content','.composer','.composer:focus-within','.empty-logo','.seven-beta-status','.topbar'])ok(css.includes(selector),'missing material selector '+selector);
for(const token of ['--seven-radius-xs','--seven-radius-sm','--seven-radius-md','--seven-radius-lg','--seven-radius-xl'])ok(finalCss.includes(token+':'),'geometry scale missing '+token);
for(const token of ['--seven-motion-instant','--seven-motion-fast','--seven-motion-standard','--seven-motion-deliberate','--seven-motion-signature'])ok(finalCss.includes(token+':'),'motion scale missing '+token);
for(const token of ['--seven-border-soft','--seven-border-strong','--seven-elev-1','--seven-elev-2','--seven-ring'])ok(finalCss.includes(token+':'),'material primitive missing '+token);

ok(betaCss.includes('html[data-seven-theme=day]'),'day theme sibling missing');
ok(betaCss.includes(':root{color-scheme:dark'),'night/default theme sibling missing');
ok(finalCss.includes('body.light{')&&finalCss.includes('body:not(.light){'),'legacy theme bridge must preserve day/night semantic parity');
ok(betaCss.includes('html.seven-tier-lite.seven-beta-ui .main{background:var(--sb-bg)}'),'Lite tier must remove hero canvas decoration');
ok(finalCss.includes('html.seven-tier-lite .topbar,html.seven-tier-lite .modal{backdrop-filter:none!important'),'Lite tier must remove expensive blur');
ok(finalCss.includes('html.seven-tier-lite .empty-logo')&&finalCss.includes('box-shadow:none!important'),'Lite tier must remove nonessential elevation');
ok(finalCss.includes('html.seven-tier-balanced .topbar{backdrop-filter:blur(8px)'), 'Balanced tier must explicitly reduce blur');

ok(finalCss.includes('@media (prefers-reduced-motion:reduce)')&&betaCss.includes('@media(prefers-reduced-motion:reduce)'), 'reduced-motion guards must cover both release style layers');
ok(finalCss.includes('inset-inline-start')&&betaCss.includes('inset-inline-start'),'logical RTL edges required');
ok(betaCss.includes('html[dir=rtl].seven-beta-ui .message.user .bubble'),'RTL geometry adaptation missing');
ok(finalCss.includes('@media (max-width:720px)')&&betaCss.includes('@media(max-width:720px)'), 'compact mobile adaptations missing');
ok(betaCss.includes('min-width:44px;min-height:44px')&&finalCss.includes('min-height:40px'),'touch target policy missing');
ok(finalCss.includes('scrollbar-gutter:stable')&&finalCss.includes('overflow-wrap:anywhere'),'long-content containment missing');
ok(finalCss.includes('content-visibility:auto'),'message rendering should remain viewport efficient');

const live=lintFiles(['release/seven-final.css','release/beta-ui.css'],{root:ROOT});
ok(live.verdict==='PASS'&&live.counts.fail===0&&live.counts.warn===0,'final design must remain Design Lint clean');
ok(!/transition\s*:\s*all\b/i.test(css),'transition:all is forbidden');
ok(!/animation\s*:[^;}]*infinite/i.test(css),'unguarded infinite animation is forbidden in release CSS');
const blurValues=[...css.matchAll(/blur\((\d+(?:\.\d+)?)px\)/g)].map(m=>Number(m[1]));
ok(blurValues.length>0&&Math.max(...blurValues)<=14,'blur must remain bounded to <=14px');
const gradients=(css.match(/(?:linear|radial)-gradient\(/g)||[]).length;
ok(gradients<=20,'gradient density exceeded restraint budget: '+gradients);
const shadows=(css.match(/box-shadow\s*:/g)||[]).length;
ok(shadows<=24,'shadow density exceeded restraint budget: '+shadows);

for(const required of ['visual_hierarchy','typography','spacing','geometry','material_depth','day_night_sibling_coherence','identity_restraint','anti_cheapness'])ok(matrix.quality_dimensions.includes(required),'quality dimension missing '+required);
for(const forbidden of matrix.anti_cheapness.forbidden)ok(typeof forbidden==='string'&&forbidden.length>4,'invalid anti-cheapness rule');

console.log(`Final Design Quality Contract: PASS (${n} assertions; M0-M5 + 18 dimensions; ${gradients} gradients; ${shadows} shadow rules; Design Lint 0 warnings)`);
