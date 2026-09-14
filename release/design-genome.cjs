const crypto=require('crypto');

const VERSION='1.0.0';
const SCHEMA='seven-design-genome';

function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function sha(value){return crypto.createHash('sha256').update(typeof value==='string'?value:stable(value)).digest('hex');}
function clone(v){return JSON.parse(JSON.stringify(v));}

const TOKENS=Object.freeze({
  color:{
    canvas:{night:'#07111f',day:'#f7fbff'},surface:{night:'#0c1828',day:'#ffffff'},surfaceRaised:{night:'#122238',day:'#edf5fc'},
    text:{night:'#f7fbff',day:'#0b1728'},muted:{night:'#91a2b7',day:'#60748a'},brand:{night:'#087bff',day:'#087bff'},brandAlt:{night:'#21d7f2',day:'#08bddd'},
    semantic:{success:'#20a878',warning:'#dc9418',error:'#dd5263'},
    aurora:{idle:['#087bff','#21d7f2'],thinking:['#087bff','#735cff'],research:['#00aee8','#21d7f2'],coding:['#1267ee','#079cff'],rpg:['#7657f4','#a08cff'],success:['#20a878','#61d9ad'],warning:['#dc9418','#ffc45b'],error:['#dd5263','#ff8592']},
    domain:{core:'#087bff',build:'#1267ee',research:'#00aee8',world:'#7657f4'}
  },
  typography:{display:{weight:720,tracking:'-.045em'},screenTitle:{weight:680,tracking:'-.025em'},sectionTitle:{weight:650,tracking:'-.012em'},body:{weight:400,tracking:'0'},evidence:{weight:600,tracking:'.01em'},label:{weight:700,tracking:'.02em'},code:{family:'monospace'},numeric:{weight:700,tracking:'-.01em'}},
  spacing:{xxs:2,xs:4,sm:8,md:12,lg:16,xl:24,xxl:32},
  shape:{radius:{xs:8,sm:12,md:16,lg:22,xl:28},cutAngleDeg:7},
  motion:{instant:90,fast:150,standard:220,deliberate:320,signature:520,easeEnter:'cubic-bezier(.2,.8,.2,1)',easeExit:'cubic-bezier(.4,0,1,1)',easeMove:'cubic-bezier(.2,.7,.2,1)'},
  target:{mobileTouchPreferred:48,mobileTouchHard:44}
});

const SIGNATURE_PRIMITIVES=Object.freeze({
  orbitThread:{purpose:'active cognitive flow or lineage',allowed:['state','evidence','progress'],forbidden:['constant-decoration'],motionOptional:true},
  sevenCut:{purpose:'directional identity derived from numeral 7',allowed:['selected-state','divider','icon-terminal','hero'],forbidden:['every-component'],motionOptional:false},
  evidenceRail:{purpose:'provenance and verification structure',allowed:['citation','tool-output','verification','source'],forbidden:['decorative-only'],motionOptional:false},
  focusHalo:{purpose:'local active-control emphasis',allowed:['composer','focused-control','active-state'],forbidden:['full-surface-glow','always-on'],motionOptional:true},
  stateNode:{purpose:'semantic runtime-state marker',allowed:['aurora','run-state'],forbidden:['color-only-meaning'],motionOptional:true}
});

const LEGACY_ADAPTERS=Object.freeze({
  '--sb-bg':'color.canvas','--sb-s':'color.surface','--sb-s2':'color.surfaceRaised','--sb-t':'color.text','--sb-m':'color.muted','--sb-a':'color.brand','--sb-a2':'color.brandAlt',
  '--sb-mode':'color.aurora.primary','--sb-mode2':'color.aurora.secondary','--sb-rate':'motion.auroraRate','--sb-ao':'effect.auroraOpacity',
  '--bg':'color.canvas','--surface':'color.surface','--surface2':'color.surfaceRaised','--text':'color.text','--muted':'color.muted','--accent':'color.brand',
  '--seven-motion-instant':'motion.instant','--seven-motion-fast':'motion.fast','--seven-motion-standard':'motion.standard','--seven-motion-deliberate':'motion.deliberate','--seven-motion-signature':'motion.signature',
  '--seven-ease-enter':'motion.easeEnter','--seven-ease-exit':'motion.easeExit','--seven-ease-move':'motion.easeMove',
  '--seven-radius-xs':'shape.radius.xs','--seven-radius-sm':'shape.radius.sm','--seven-radius-md':'shape.radius.md','--seven-radius-lg':'shape.radius.lg','--seven-radius-xl':'shape.radius.xl',
  '--seven-on-accent':'color.onBrand','--seven-on-danger':'color.onDanger','--seven-border-soft':'effect.borderSoft','--seven-border-strong':'effect.borderStrong','--seven-elev-1':'effect.elevation1','--seven-elev-2':'effect.elevation2','--seven-ring':'effect.focusRing','--seven-surface-glow':'effect.surfaceGlow','--seven-code-bg':'effect.codeBackground'
});

const CANONICAL_CSS_VARS=Object.freeze({
  canvas:'--seven-g-canvas',surface:'--seven-g-surface',surfaceRaised:'--seven-g-surface-raised',text:'--seven-g-text',muted:'--seven-g-muted',brand:'--seven-g-brand',brandAlt:'--seven-g-brand-alt',auroraPrimary:'--seven-g-aurora-1',auroraSecondary:'--seven-g-aurora-2',domain:'--seven-g-domain',radiusSm:'--seven-g-radius-sm',radiusMd:'--seven-g-radius-md',radiusLg:'--seven-g-radius-lg',motionFast:'--seven-g-motion-fast',motionStandard:'--seven-g-motion-standard',focusRing:'--seven-g-focus-ring'
});

function assertEnum(value,allowed,label){if(!allowed.includes(value))throw new Error(`${label} must be one of ${allowed.join(', ')}`);}
function resolveContext(input={}){
  const theme=input.theme||'night',aurora=input.aurora||'idle',domain=input.domain||'core';
  assertEnum(theme,['night','day'],'theme');
  assertEnum(aurora,Object.keys(TOKENS.color.aurora),'aurora');
  assertEnum(domain,Object.keys(TOKENS.color.domain),'domain');
  const a=TOKENS.color.aurora[aurora];
  return {theme,aurora,domain,values:{canvas:TOKENS.color.canvas[theme],surface:TOKENS.color.surface[theme],surfaceRaised:TOKENS.color.surfaceRaised[theme],text:TOKENS.color.text[theme],muted:TOKENS.color.muted[theme],brand:TOKENS.color.brand[theme],brandAlt:TOKENS.color.brandAlt[theme],auroraPrimary:a[0],auroraSecondary:a[1],domain:TOKENS.color.domain[domain],radiusSm:`${TOKENS.shape.radius.sm}px`,radiusMd:`${TOKENS.shape.radius.md}px`,radiusLg:`${TOKENS.shape.radius.lg}px`,motionFast:`${TOKENS.motion.fast}ms`,motionStandard:`${TOKENS.motion.standard}ms`,focusRing:`0 0 0 3px color-mix(in srgb,${TOKENS.color.brand[theme]} 28%,transparent)`}};
}

function createSnapshot(input={}){
  const resolved=resolveContext(input);
  const body={schema:SCHEMA,version:VERSION,context:{theme:resolved.theme,aurora:resolved.aurora,domain:resolved.domain},values:resolved.values,canonicalCssVars:CANONICAL_CSS_VARS,primitiveVersion:'1.0.0'};
  return {...body,seal:sha(body)};
}
function verifySnapshot(snapshot){
  if(!snapshot||snapshot.schema!==SCHEMA||snapshot.version!==VERSION)return false;
  const {seal,...body}=snapshot;
  return typeof seal==='string'&&seal===sha(body);
}

function emitCanonicalCss(input={}){
  const s=createSnapshot(input);if(!verifySnapshot(s))throw new Error('snapshot integrity failure');
  return ':root{'+Object.entries(CANONICAL_CSS_VARS).map(([k,v])=>`${v}:${s.values[k]}`).join(';')+'}';
}

function createCoverageLedger({sourceId,cssText}){
  if(!sourceId||typeof sourceId!=='string')throw new Error('sourceId required');
  if(typeof cssText!=='string')throw new Error('cssText required');
  const declared=[...cssText.matchAll(/(--[\w-]+)\s*:/g)].map(m=>m[1]);
  const used=[...cssText.matchAll(/var\(\s*(--[\w-]+)/g)].map(m=>m[1]);
  const seen=[...new Set([...declared,...used])].sort();
  const adapted=seen.filter(v=>Object.prototype.hasOwnProperty.call(LEGACY_ADAPTERS,v));
  const legacySeven=seen.filter(v=>(v.startsWith('--seven-')||v.startsWith('--sb-'))&&!Object.prototype.hasOwnProperty.call(LEGACY_ADAPTERS,v)&&!Object.values(CANONICAL_CSS_VARS).includes(v));
  const canonical=seen.filter(v=>Object.values(CANONICAL_CSS_VARS).includes(v));
  const body={schema:'seven-design-genome-coverage',version:1,sourceId,sourceSha256:sha(cssText),declaredCount:new Set(declared).size,usedCount:new Set(used).size,adapted,canonical,legacyUnmapped:legacySeven};
  return {...body,seal:sha(body)};
}
function verifyCoverageLedger(ledger,cssText){
  if(!ledger||ledger.schema!=='seven-design-genome-coverage')return false;
  const {seal,...body}=ledger;
  if(seal!==sha(body))return false;
  return typeof cssText==='string'?ledger.sourceSha256===sha(cssText):true;
}

function primitiveContract(name){
  if(!Object.prototype.hasOwnProperty.call(SIGNATURE_PRIMITIVES,name))throw new Error('unknown Seven signature primitive: '+name);
  return clone(SIGNATURE_PRIMITIVES[name]);
}

module.exports={VERSION,SCHEMA,TOKENS,SIGNATURE_PRIMITIVES,LEGACY_ADAPTERS,CANONICAL_CSS_VARS,stable,sha,resolveContext,createSnapshot,verifySnapshot,emitCanonicalCss,createCoverageLedger,verifyCoverageLedger,primitiveContract};
