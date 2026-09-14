const fs=require('fs');
const path=require('path');
const genome=require('./design-genome.cjs');

const RULESET='seven-design-lint-v1';
const CANONICAL=new Set(Object.values(genome.CANONICAL_CSS_VARS));
const LEGACY=new Set(Object.keys(genome.LEGACY_ADAPTERS));

function issue(rule,severity,message,extra={}){return {rule,severity,message,...extra};}
function lineOf(text,index){return text.slice(0,index).split('\n').length;}
function occurrences(text,re){const out=[];for(const m of text.matchAll(re))out.push({match:m[0],index:m.index,line:lineOf(text,m.index),groups:m.groups||{}});return out;}

function lintCss(cssText,{sourceId='inline',strictCanonical=false}={}){
  if(typeof cssText!=='string')throw new Error('cssText must be a string');
  const findings=[];
  for(const hit of occurrences(cssText,/transition\s*:\s*all(?:\s|;|!|$)/gi))findings.push(issue('NO_TRANSITION_ALL','FAIL','transition: all is forbidden; enumerate properties',hit));
  for(const hit of occurrences(cssText,/animation\s*:[^;{}]*\binfinite\b[^;{}]*/gi)){
    const hasReduced=/prefers-reduced-motion\s*:\s*reduce/i.test(cssText);
    findings.push(issue('CONTINUOUS_MOTION_GUARD',hasReduced?'WARN':'FAIL',hasReduced?'continuous motion exists but a Reduced Motion path is present':'continuous motion requires an explicit Reduced Motion path',hit));
  }
  for(const hit of occurrences(cssText,/(?:^|[;{])\s*(left|right)\s*:/gmi))findings.push(issue('RTL_PHYSICAL_EDGE','WARN','physical left/right edge found; prefer logical properties when semantics permit',{line:hit.line,match:hit.match}));
  for(const hit of occurrences(cssText,/#[0-9a-f]{3,8}\b/gi))findings.push(issue('RAW_COLOR','INFO','raw color literal present; canonicalization candidate',{line:hit.line,match:hit.match}));

  const declared=occurrences(cssText,/(?<name>--[\w-]+)\s*:/g);
  const used=occurrences(cssText,/var\(\s*(?<name>--[\w-]+)/g);
  const names=[...new Set([...declared,...used].map(x=>x.groups.name))].sort();
  for(const name of names){
    if(name.startsWith('--seven-g-')&&!CANONICAL.has(name))findings.push(issue('UNKNOWN_CANONICAL_TOKEN','FAIL','unknown canonical Design Genome token',{token:name}));
    if((name.startsWith('--seven-')||name.startsWith('--sb-'))&&!CANONICAL.has(name)&&!LEGACY.has(name))findings.push(issue('UNMAPPED_LEGACY_TOKEN',strictCanonical?'FAIL':'WARN','legacy Seven token is not yet mapped into the canonical Genome',{token:name}));
  }

  const primitiveNames=Object.keys(genome.SIGNATURE_PRIMITIVES);
  for(const hit of occurrences(cssText,/data-seven-primitive\s*=\s*["']([^"']+)["']/gi)){
    const m=/["']([^"']+)["']/.exec(hit.match);const name=m&&m[1];
    if(name&&!primitiveNames.includes(name))findings.push(issue('UNKNOWN_SIGNATURE_PRIMITIVE','FAIL','unknown Seven signature primitive',{line:hit.line,primitive:name}));
  }

  const fail=findings.filter(x=>x.severity==='FAIL').length,warn=findings.filter(x=>x.severity==='WARN').length,info=findings.filter(x=>x.severity==='INFO').length;
  const coverage=genome.createCoverageLedger({sourceId,cssText});
  return {ruleset:RULESET,sourceId,verdict:fail?'FAIL':warn?'WARN':'PASS',counts:{fail,warn,info,total:findings.length},findings,coverage};
}

function lintFiles(files,{root=process.cwd(),strictCanonical=false}={}){
  const reports=[];
  for(const file of files){const full=path.resolve(root,file);reports.push(lintCss(fs.readFileSync(full,'utf8'),{sourceId:file,strictCanonical}));}
  const fail=reports.reduce((n,r)=>n+r.counts.fail,0),warn=reports.reduce((n,r)=>n+r.counts.warn,0),info=reports.reduce((n,r)=>n+r.counts.info,0);
  return {ruleset:RULESET,verdict:fail?'FAIL':warn?'WARN':'PASS',counts:{fail,warn,info},reports};
}

function enforce(report,{allowWarnings=true}={}){
  if(!report||!report.verdict)throw new Error('invalid design lint report');
  if(report.verdict==='FAIL'||(!allowWarnings&&report.verdict==='WARN')){
    const e=new Error(`Design Lint ${report.verdict}: ${JSON.stringify(report.counts)}`);e.report=report;throw e;
  }
  return report;
}

if(require.main===module){
  const root=path.resolve(__dirname,'..');
  const report=lintFiles(['release/seven-final.css','release/beta-ui.css'],{root});
  console.log(`Design Lint: ${report.verdict} (${report.counts.fail} fail, ${report.counts.warn} warn, ${report.counts.info} info)`);
  if(report.counts.fail)process.exit(1);
}

module.exports={RULESET,lintCss,lintFiles,enforce};
