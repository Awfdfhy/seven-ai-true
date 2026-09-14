const assert=require('assert');
const g=require('./design-genome.cjs');

let n=0;const ok=(v,m)=>{assert.ok(v,m);n++};const eq=(a,b,m)=>{assert.strictEqual(a,b,m);n++};const throws=(fn,re,m)=>{assert.throws(fn,re,m);n++};

eq(g.VERSION,'1.0.0');
eq(g.SCHEMA,'seven-design-genome');
ok(Object.isFrozen(g.TOKENS));
ok(Object.isFrozen(g.SIGNATURE_PRIMITIVES));
ok(Object.isFrozen(g.LEGACY_ADAPTERS));
ok(Object.isFrozen(g.CANONICAL_CSS_VARS));

eq(g.TOKENS.target.mobileTouchPreferred,48);
eq(g.TOKENS.target.mobileTouchHard,44);
eq(g.TOKENS.shape.cutAngleDeg,7);

const night=g.resolveContext({theme:'night',aurora:'thinking',domain:'build'});
eq(night.values.canvas,'#07111f');
eq(night.values.auroraSecondary,'#735cff');
eq(night.values.domain,'#1267ee');
eq(night.values.motionFast,'150ms');
const day=g.resolveContext({theme:'day',aurora:'research',domain:'research'});
eq(day.values.canvas,'#f7fbff');
eq(day.values.text,'#0b1728');
eq(day.values.auroraPrimary,'#00aee8');
throws(()=>g.resolveContext({theme:'sepia'}),/theme must be one of/);
throws(()=>g.resolveContext({aurora:'fake'}),/aurora must be one of/);
throws(()=>g.resolveContext({domain:'fake'}),/domain must be one of/);

const s1=g.createSnapshot({theme:'night',aurora:'thinking',domain:'build'});
const s2=g.createSnapshot({domain:'build',aurora:'thinking',theme:'night'});
ok(g.verifySnapshot(s1));
eq(s1.seal,s2.seal,'snapshot must be deterministic');
const tampered=JSON.parse(JSON.stringify(s1));tampered.values.canvas='#000';
eq(g.verifySnapshot(tampered),false,'tamper must invalidate seal');
eq(g.verifySnapshot({...s1,version:'2'}),false);

const css=g.emitCanonicalCss({theme:'day',aurora:'success',domain:'core'});
ok(css.startsWith(':root{'));
ok(css.includes('--seven-g-canvas:#f7fbff'));
ok(css.includes('--seven-g-aurora-1:#20a878'));
ok(css.includes('--seven-g-domain:#087bff'));

eq((css.match(/--seven-g-/g)||[]).length,Object.keys(g.CANONICAL_CSS_VARS).length);

const c=g.createCoverageLedger({sourceId:'fixture.css',cssText:':root{--sb-bg:#000;--seven-motion-fast:150ms;color:var(--sb-bg);border-radius:var(--seven-radius-sm)}'});
eq(c.schema,'seven-design-genome-coverage');
ok(g.verifyCoverageLedger(c));
ok(g.verifyCoverageLedger(c,':root{--sb-bg:#000;--seven-motion-fast:150ms;color:var(--sb-bg);border-radius:var(--seven-radius-sm)}'));
eq(g.verifyCoverageLedger(c,'different'),false);
ok(c.adapted.includes('--sb-bg'));
ok(c.adapted.includes('--seven-motion-fast'));
eq(c.legacyUnmapped.length,0);
const ct=JSON.parse(JSON.stringify(c));ct.sourceId='evil';
eq(g.verifyCoverageLedger(ct),false);
throws(()=>g.createCoverageLedger({cssText:'x'}),/sourceId required/);
throws(()=>g.createCoverageLedger({sourceId:'x'}),/cssText required/);

const p=g.primitiveContract('orbitThread');
eq(p.purpose,'active cognitive flow or lineage');
ok(p.forbidden.includes('constant-decoration'));
const node=g.primitiveContract('stateNode');
ok(node.forbidden.includes('color-only-meaning'));
throws(()=>g.primitiveContract('sparkleStorm'),/unknown Seven signature primitive/);

for(const required of ['orbitThread','sevenCut','evidenceRail','focusHalo','stateNode'])ok(g.SIGNATURE_PRIMITIVES[required],`missing ${required}`);
for(const canonical of Object.values(g.CANONICAL_CSS_VARS))ok(canonical.startsWith('--seven-g-'));
for(const [legacy,target] of Object.entries(g.LEGACY_ADAPTERS)){ok(legacy.startsWith('--'));ok(typeof target==='string'&&target.length>2);}

console.log(`Design Genome: PASS (${n} assertions)`);
