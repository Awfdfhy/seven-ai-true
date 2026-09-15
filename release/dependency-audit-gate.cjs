"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const LEVELS=["info","low","moderate","high","critical"];
function obj(v){return v&&typeof v==="object"&&!Array.isArray(v)?v:{}}
function arr(v){return Array.isArray(v)?v:[]}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function hash(v){return crypto.createHash("sha256").update(JSON.stringify(stable(v))).digest("hex")}
function counts(a){const meta=obj(a?.metadata?.vulnerabilities),out={};for(const k of LEVELS)out[k]=Number(meta[k]||0);out.total=Number(meta.total??LEVELS.reduce((n,k)=>n+out[k],0));return out}
function names(a){return Object.keys(obj(a?.vulnerabilities)).sort()}
function summarize(full,production){
  const f=counts(full),p=counts(production),fullNames=names(full),prodNames=names(production),prodSet=new Set(prodNames),devOnly=fullNames.filter(x=>!prodSet.has(x));
  const findings=fullNames.map(name=>{const v=obj(full.vulnerabilities[name]);return {name,severity:String(v.severity||"unknown"),direct:v.isDirect===true,production:prodSet.has(name),fixAvailable:v.fixAvailable===true||obj(v.fixAvailable).name?true:false,nodes:arr(v.nodes).length}});
  const body={schema:"seven.dependency-audit-summary.v1",production:f?{counts:p,packages:prodNames}:null,full:{counts:f,packages:fullNames},developmentToolingOnly:devOnly,findings,gate:{productionVulnerabilityFree:p.total===0,productionHighCriticalFree:p.high===0&&p.critical===0,fullGraphVulnerabilityFree:f.total===0}};
  return Object.freeze({...body,seal:hash(body)});
}
function verifySummary(s){if(!s||s.schema!=="seven.dependency-audit-summary.v1"||!s.seal)return false;const{seal,...body}=s;return seal===hash(body)&&typeof s.gate?.productionVulnerabilityFree==="boolean"}
function main(){const [fullPath,prodPath,outPath]=process.argv.slice(2);if(!fullPath||!prodPath)throw Error("usage: dependency-audit-gate <full.json> <production.json> [summary.json]");const full=JSON.parse(fs.readFileSync(fullPath,"utf8")),production=JSON.parse(fs.readFileSync(prodPath,"utf8")),s=summarize(full,production);if(outPath){fs.mkdirSync(path.dirname(outPath),{recursive:true});fs.writeFileSync(outPath,JSON.stringify(s,null,2)+"\n")}
  console.log(`Dependency Audit: production ${s.production.counts.total} vulnerabilities; full graph ${s.full.counts.total}; dev/tooling-only packages ${s.developmentToolingOnly.length}`);
  if(s.developmentToolingOnly.length)console.log(`Dependency Audit dev/tooling debt: ${s.developmentToolingOnly.join(", ")}`);
  if(!s.gate.productionVulnerabilityFree){console.error(`Dependency Audit BLOCK: production counts ${JSON.stringify(s.production.counts)}`);process.exit(1)}
  console.log("Dependency Audit production gate: PASS");
}
if(require.main===module){try{main()}catch(e){console.error(e&&e.stack||e);process.exit(1)}}
module.exports=Object.freeze({LEVELS,hash,counts,names,summarize,verifySummary});
