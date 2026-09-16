const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {lintCss,lintFiles,enforce,RULESET}=require('./design-lint.cjs');

let n=0;const ok=(v,m)=>{assert.ok(v,m);n++};const eq=(a,b,m)=>{assert.strictEqual(a,b,m);n++};const throws=(fn,re,m)=>{assert.throws(fn,re,m);n++};

eq(RULESET,'seven-design-lint-v1');
let r=lintCss(':root{--seven-g-canvas:#000;color:var(--seven-g-canvas)}',{sourceId:'ok.css'});
eq(r.counts.fail,0);ok(['PASS','WARN'].includes(r.verdict));

r=lintCss('.x{transition:all .2s}',{sourceId:'bad.css'});
eq(r.verdict,'FAIL');ok(r.findings.some(x=>x.rule==='NO_TRANSITION_ALL'&&x.severity==='FAIL'));
throws(()=>enforce(r),/Design Lint FAIL/);

r=lintCss(':root{--seven-g-imaginary:1}.x{color:var(--seven-g-imaginary)}',{sourceId:'bad-token.css'});
eq(r.verdict,'FAIL');ok(r.findings.some(x=>x.rule==='UNKNOWN_CANONICAL_TOKEN'));

r=lintCss('.x{animation:pulse 1s infinite}',{sourceId:'motion.css'});
eq(r.verdict,'FAIL');ok(r.findings.some(x=>x.rule==='CONTINUOUS_MOTION_GUARD'&&x.severity==='FAIL'));
r=lintCss('@media(prefers-reduced-motion:reduce){.x{animation:none}}.x{animation:pulse 1s infinite}',{sourceId:'motion-guarded.css'});
eq(r.counts.fail,0);ok(r.findings.some(x=>x.rule==='CONTINUOUS_MOTION_GUARD'&&x.severity==='WARN'));
ok(enforce(r,{allowWarnings:true}));
throws(()=>enforce(r,{allowWarnings:false}),/Design Lint WARN/);

r=lintCss('.x{left:4px;color:#fff}',{sourceId:'rtl.css'});
ok(r.findings.some(x=>x.rule==='RTL_PHYSICAL_EDGE'&&x.severity==='WARN'));
ok(r.findings.some(x=>x.rule==='RAW_COLOR'&&x.severity==='INFO'));

r=lintCss(':root{--seven-mystery:1}',{sourceId:'legacy.css'});
eq(r.counts.fail,0);ok(r.findings.some(x=>x.rule==='UNMAPPED_LEGACY_TOKEN'&&x.severity==='WARN'));
r=lintCss(':root{--seven-mystery:1}',{sourceId:'legacy-strict.css',strictCanonical:true});
eq(r.verdict,'FAIL');ok(r.findings.some(x=>x.rule==='UNMAPPED_LEGACY_TOKEN'&&x.severity==='FAIL'));

r=lintCss('[data-seven-primitive="orbitThread"]{display:block}',{sourceId:'primitive.css'});
eq(r.counts.fail,0);
r=lintCss('[data-seven-primitive="sparkles"]{display:block}',{sourceId:'primitive-bad.css'});
eq(r.verdict,'FAIL');ok(r.findings.some(x=>x.rule==='UNKNOWN_SIGNATURE_PRIMITIVE'));

const root=path.resolve(__dirname,'..');
const live=lintFiles(['release/seven-final.css','release/beta-ui.css'],{root});
eq(live.counts.fail,0,'current release CSS must have zero Design Lint hard failures');eq(live.counts.warn,0,'current release CSS must have zero Design Lint warnings');eq(live.verdict,'PASS','current release CSS Design Lint must be clean PASS');
eq(live.reports.length,2);
for(const report of live.reports){ok(report.coverage&&report.coverage.seal);ok(report.coverage.sourceSha256.length===64);}
const beta=live.reports.find(x=>x.sourceId==='release/beta-ui.css');ok(beta.coverage.adapted.includes('--sb-bg'));ok(beta.coverage.adapted.includes('--sb-a'));ok(beta.coverage.adapted.includes('--sb-mode'));
const final=live.reports.find(x=>x.sourceId==='release/seven-final.css');ok(final.coverage.adapted.includes('--seven-motion-fast'));ok(final.coverage.adapted.includes('--seven-radius-sm'));

const temp=path.join(root,'release','.design-lint-temp.css');fs.writeFileSync(temp,'.x{transition:all 1s}');
try{const multi=lintFiles(['release/.design-lint-temp.css'],{root});eq(multi.verdict,'FAIL');eq(multi.counts.fail,1);}finally{fs.unlinkSync(temp);}

console.log(`Design Lint: PASS (${n} assertions; live ${live.verdict}, ${live.counts.warn} warnings, ${live.counts.info} info)`);
