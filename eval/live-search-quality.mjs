import fs from "node:fs";

const base = String(process.env.SEVEN_SEARCH_GATEWAY_URL || "").trim().replace(/\/$/, "");
const key = String(process.env.SEVEN_SEARCH_GATEWAY_KEY || "");
const strict = process.env.SEVEN_SEARCH_LIVE_STRICT === "1";
if (!/^https:\/\//i.test(base)) {
  console.error("SEVEN_SEARCH_GATEWAY_URL must be an https URL.");
  process.exit(2);
}

const headers = { "content-type": "application/json", accept: "application/json" };
if (key) headers["x-seven-gateway-key"] = key;

const cases = [
  { id:"en-current", q:"latest Android security update", language:"en", recency:"month" },
  { id:"ar-current", q:"أحدث تحديثات أندرويد الأمنية", language:"ar", recency:"month" },
  { id:"technical", q:"Cloudflare Workers fetch AbortController documentation", language:"en" },
  { id:"comparison", q:"WebView versus Chrome Custom Tabs Android official documentation", language:"en" },
  { id:"primary", q:"Android developer WebView official documentation", language:"en" },
  { id:"niche", q:"Capacitor Android WebView network security configuration", language:"en" }
];

const now=()=>Date.now();
const quantile=(xs,p)=>{
  const a=xs.filter(Number.isFinite).sort((x,y)=>x-y);
  if(!a.length)return null;
  return a[Math.min(a.length-1,Math.max(0,Math.ceil(a.length*p)-1))];
};
const host=u=>{try{return new URL(u).hostname.toLowerCase()}catch{return ""}};

async function jsonFetch(url, options, timeoutMs=8000) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), timeoutMs);
  try {
    const res = await fetch(url,{...options,signal:controller.signal});
    let body=null;
    try{ body=await res.json(); }catch{}
    return {res,body};
  } finally { clearTimeout(timer); }
}

const report={version:1,generatedAt:new Date().toISOString(),gateway:base,cases:[],summary:{}};

const healthStart=now();
const health=await jsonFetch(base+"/health",{headers:{accept:"application/json",...(key?{"x-seven-gateway-key":key}:{})}},6000);
report.health={ok:health.res.ok,status:health.res.status,latencyMs:now()-healthStart,body:health.body||null};
if(!health.res.ok){
  fs.writeFileSync("eval/live-search-quality-report.json",JSON.stringify(report,null,2));
  console.error("Gateway health check failed.");
  process.exit(1);
}

for(const item of cases){
  const started=now();
  let search;
  try{
    search=await jsonFetch(base+"/v1/search",{
      method:"POST",headers,
      body:JSON.stringify({query:item.q,language:item.language,recency:item.recency||null,maxResults:8})
    },8000);
  }catch(error){
    report.cases.push({id:item.id,ok:false,error:error?.name==="AbortError"?"timeout":"transport_error",searchLatencyMs:now()-started});
    continue;
  }
  const searchLatencyMs=now()-started;
  const results=Array.isArray(search.body?.results)?search.body.results:[];
  const uniqueHosts=new Set(results.map(x=>host(x?.url)).filter(Boolean));
  const reads=[];
  for(const candidate of results.slice(0,2)){
    const readStart=now();
    try{
      const out=await jsonFetch(base+"/v1/read",{
        method:"POST",headers,
        body:JSON.stringify({url:candidate.url,maxChars:6000})
      },8000);
      reads.push({
        ok:out.res.ok,
        status:out.res.status,
        latencyMs:now()-readStart,
        readState:out.body?.readState||null,
        textChars:String(out.body?.text||"").length
      });
    }catch(error){
      reads.push({ok:false,latencyMs:now()-readStart,error:error?.name==="AbortError"?"timeout":"transport_error"});
    }
  }
  report.cases.push({
    id:item.id,ok:search.res.ok&&results.length>0,status:search.res.status,
    searchLatencyMs,backend:search.body?.backend||null,
    capability:search.body?.capability||null,
    attemptedBackends:Array.isArray(search.body?.attemptedBackends)?search.body.attemptedBackends:[],
    resultCount:results.length,uniqueHostCount:uniqueHosts.size,
    httpsRatio:results.length?results.filter(x=>/^https:\/\//i.test(String(x?.url||""))).length/results.length:0,
    reads
  });
}

const good=report.cases.filter(x=>x.ok);
const searchLat=good.map(x=>x.searchLatencyMs);
const readRows=good.flatMap(x=>x.reads||[]);
const successfulReads=readRows.filter(x=>x.ok&&["read_success","read_partial"].includes(x.readState));
report.summary={
  caseCount:report.cases.length,
  successfulCaseCount:good.length,
  successRate:report.cases.length?good.length/report.cases.length:0,
  p50SearchMs:quantile(searchLat,.5),
  p95SearchMs:quantile(searchLat,.95),
  meanUniqueHosts:good.length?good.reduce((s,x)=>s+(x.uniqueHostCount||0),0)/good.length:0,
  readAttemptCount:readRows.length,
  readSuccessCount:successfulReads.length,
  readSuccessRate:readRows.length?successfulReads.length/readRows.length:0,
  p95ReadMs:quantile(readRows.map(x=>x.latencyMs),.95)
};

fs.writeFileSync("eval/live-search-quality-report.json",JSON.stringify(report,null,2));
console.log(JSON.stringify(report.summary,null,2));

if(strict){
  const failures=[];
  if(report.summary.successRate<0.80)failures.push("search_success_rate");
  if(report.summary.meanUniqueHosts<2)failures.push("host_diversity");
  if(report.summary.readAttemptCount>=4&&report.summary.readSuccessRate<0.50)failures.push("reader_success_rate");
  if(Number.isFinite(report.summary.p95SearchMs)&&report.summary.p95SearchMs>7000)failures.push("search_p95_latency");
  if(failures.length){
    console.error("Live Search Quality gate failed: "+failures.join(", "));
    process.exit(1);
  }
}
