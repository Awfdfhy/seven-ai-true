// Seven AI Web Search Gateway v2 — Cloudflare Worker module
// Secrets stay server-side. No API key belongs in the APK or repository.

const GATEWAY_VERSION = 2;
const MAX_QUERY_CHARS = 600;
const MAX_QUERY_WORDS = 75;
const MAX_RESULTS = 20;
const MAX_READ_BYTES = 1_000_000;
const MAX_TEXT_CHARS = 20_000;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10_000;

function json(data,status=200,headers={}){
  return new Response(JSON.stringify(data),{
    status,
    headers:Object.assign({"content-type":"application/json; charset=utf-8","cache-control":"no-store"},headers)
  });
}

function parseAllowedOrigins(env){
  const raw=String(env?.ALLOWED_ORIGINS||"https://localhost,http://localhost,capacitor://localhost");
  return raw.split(",").map(x=>x.trim()).filter(Boolean);
}

function corsHeaders(request,env){
  const origin=request.headers.get("origin")||"";
  const allowed=parseAllowedOrigins(env);
  const wildcard=allowed.includes("*");
  const accepted=wildcard?"*":(allowed.includes(origin)?origin:"");
  const out={
    "access-control-allow-methods":"GET,POST,OPTIONS",
    "access-control-allow-headers":"content-type",
    "access-control-max-age":"600",
    "vary":"Origin"
  };
  if(accepted)out["access-control-allow-origin"]=accepted;
  return out;
}

function withCors(response,request,env){
  const headers=new Headers(response.headers);
  for(const [k,v] of Object.entries(corsHeaders(request,env)))headers.set(k,v);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

function words(text){return String(text||"").trim().split(/\s+/).filter(Boolean);}
function cleanText(value,max=4000){return String(value||"").replace(/\s+/g," ").trim().slice(0,max);}

export function normalizeSearchRequest(body){
  const query=cleanText(body?.query,MAX_QUERY_CHARS+1);
  if(!query)return {ok:false,status:400,error:"missing_query"};
  if(query.length>MAX_QUERY_CHARS||words(query).length>MAX_QUERY_WORDS)return {ok:false,status:413,error:"query_too_large"};
  const language=/^[a-z]{2,3}$/i.test(String(body?.language||""))?String(body.language).toLowerCase():"en";
  const freshness=["pd","pw","pm","py"].includes(body?.freshness)?body.freshness:null;
  const maxResults=Math.max(1,Math.min(MAX_RESULTS,Number(body?.maxResults)||10));
  return {ok:true,query,language,freshness,maxResults};
}

function isPrivateIPv4(host){
  const parts=host.split(".");
  if(parts.length!==4||parts.some(x=>!/^(0|[1-9]\d{0,2})$/.test(x)))return false;
  const nums=parts.map(Number);
  if(nums.some(n=>n>255))return false;
  const [a,b]=nums;
  return a===10||a===127||a===0||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===100&&b>=64&&b<=127);
}

function isPrivateIPv6(host){
  const h=host.replace(/^\[|\]$/g,"").toLowerCase();
  if(!h.includes(":"))return false;
  return h==="::1"||h==="::"||h.startsWith("fc")||h.startsWith("fd")||h.startsWith("fe8")||h.startsWith("fe9")||h.startsWith("fea")||h.startsWith("feb")||h.startsWith("::ffff:127.")||h.startsWith("::ffff:10.")||h.startsWith("::ffff:192.168.");
}

export function validateReadableUrl(value){
  let u;
  try{u=new URL(String(value||""));}catch(_){return {ok:false,error:"invalid_url"};}
  if(u.protocol!=="https:")return {ok:false,error:"https_required"};
  u.username="";u.password="";u.hash="";
  const host=u.hostname.replace(/^\[|\]$/g,"").toLowerCase();
  if(!host)return {ok:false,error:"invalid_host"};
  if(host==="localhost"||host.endsWith(".localhost")||host.endsWith(".local")||host.endsWith(".internal"))return {ok:false,error:"blocked_host"};
  if(["metadata.google.internal","metadata","instance-data"].includes(host))return {ok:false,error:"blocked_host"};
  if(isPrivateIPv4(host)||isPrivateIPv6(host))return {ok:false,error:"blocked_ip"};
  return {ok:true,url:u.href};
}

export function extractReadableText(html,maxChars=MAX_TEXT_CHARS){
  const raw=String(html||"");
  const titleMatch=raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title=cleanText((titleMatch&&titleMatch[1])||"",300)
    .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'");
  let text=raw
    .replace(/<(script|style|noscript|svg|form|nav)[^>]*>[\s\S]*?<\/\1>/gi," ")
    .replace(/<!--([\s\S]*?)-->/g," ")
    .replace(/<br\s*\/?\s*>/gi,"\n")
    .replace(/<\/(p|div|section|article|li|h[1-6]|tr)>/gi,"\n")
    .replace(/<[^>]+>/g," ")
    .replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/[ \t]+/g," ").replace(/\n\s*\n+/g,"\n").trim();
  const truncated=text.length>maxChars;
  if(truncated)text=text.slice(0,maxChars);
  return {title,text,truncated};
}

async function readJsonSafe(request){
  try{return await request.json();}catch(_){return null;}
}

async function enforceRateLimit(request,env){
  const limiter=env?.SEARCH_RATE_LIMITER;
  if(!limiter||typeof limiter.limit!=="function")return true;
  try{
    const ip=request.headers.get("cf-connecting-ip")||"unknown";
    const result=await limiter.limit({key:ip});
    return result?.success!==false;
  }catch(_){return true;}
}

async function fetchWithTimeout(fetchImpl,url,options={},timeoutMs=FETCH_TIMEOUT_MS){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{return await fetchImpl(url,Object.assign({},options,{signal:controller.signal}));}
  finally{clearTimeout(timer);}
}

export async function braveSearch(fetchImpl,env,input){
  if(!env?.BRAVE_SEARCH_API_KEY)return {available:false,backend:"none",results:[]};
  const u=new URL("https://api.search.brave.com/res/v1/web/search");
  u.searchParams.set("q",input.query);
  u.searchParams.set("count",String(input.maxResults));
  u.searchParams.set("search_lang",input.language);
  if(input.freshness)u.searchParams.set("freshness",input.freshness);
  const res=await fetchWithTimeout(fetchImpl,u.href,{
    method:"GET",
    headers:{"accept":"application/json","x-subscription-token":String(env.BRAVE_SEARCH_API_KEY)}
  });
  if(!res.ok){
    const error=new Error("search_upstream_"+res.status);
    error.status=res.status;
    throw error;
  }
  const data=await res.json();
  const rows=Array.isArray(data?.web?.results)?data.web.results:[];
  return {
    available:true,
    backend:"brave",
    results:rows.slice(0,input.maxResults).map((item,index)=>({
      title:cleanText(item?.title||"",240),
      url:String(item?.url||""),
      snippet:cleanText(item?.description||item?.snippet||"",2000),
      publishedAt:item?.page_age||item?.age||null,
      sourceType:"web",
      rank:index+1
    })).filter(x=>x.title&&validateReadableUrl(x.url).ok)
  };
}

async function readLimitedBody(response,maxBytes=MAX_READ_BYTES){
  const declared=Number(response.headers.get("content-length")||0);
  if(declared>maxBytes)return {bytes:new Uint8Array(),truncated:true,tooLarge:true};
  if(!response.body||typeof response.body.getReader!=="function"){
    const buf=new Uint8Array(await response.arrayBuffer());
    return {bytes:buf.slice(0,maxBytes),truncated:buf.length>maxBytes,tooLarge:false};
  }
  const reader=response.body.getReader();
  const chunks=[];let total=0,truncated=false;
  while(true){
    const {done,value}=await reader.read();
    if(done)break;
    if(!value)continue;
    if(total+value.length>maxBytes){
      const remaining=Math.max(0,maxBytes-total);
      if(remaining)chunks.push(value.slice(0,remaining));
      total=maxBytes;truncated=true;
      try{await reader.cancel();}catch(_){}
      break;
    }
    chunks.push(value);total+=value.length;
  }
  const out=new Uint8Array(total);let offset=0;
  for(const chunk of chunks){out.set(chunk,offset);offset+=chunk.length;}
  return {bytes:out,truncated,tooLarge:false};
}

export async function readUrl(fetchImpl,value){
  let checked=validateReadableUrl(value);
  if(!checked.ok)return {status:"blocked",error:checked.error,httpStatus:400};
  let url=checked.url;
  for(let redirects=0;redirects<=MAX_REDIRECTS;redirects++){
    const res=await fetchWithTimeout(fetchImpl,url,{
      method:"GET",
      redirect:"manual",
      headers:{"accept":"text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1","user-agent":"SevenSearchGateway/2"}
    });
    if(res.status>=300&&res.status<400){
      if(redirects===MAX_REDIRECTS)return {status:"failed",error:"too_many_redirects",httpStatus:502};
      const location=res.headers.get("location");
      if(!location)return {status:"failed",error:"redirect_without_location",httpStatus:502};
      const next=new URL(location,url).href;
      checked=validateReadableUrl(next);
      if(!checked.ok)return {status:"blocked",error:checked.error,httpStatus:400};
      url=checked.url;
      continue;
    }
    if(!res.ok)return {status:"failed",error:"upstream_"+res.status,httpStatus:502};
    const contentType=String(res.headers.get("content-type")||"").split(";")[0].trim().toLowerCase();
    if(!["text/html","application/xhtml+xml","text/plain"].includes(contentType)){
      return {status:"unsupported",error:"unsupported_content_type",contentType,httpStatus:415};
    }
    const body=await readLimitedBody(res);
    if(body.tooLarge)return {status:"read_partial",error:"declared_body_too_large",contentType,url,text:"",title:"",truncated:true,httpStatus:200};
    const decoded=new TextDecoder("utf-8",{fatal:false}).decode(body.bytes);
    if(contentType==="text/plain"){
      const text=decoded.replace(/\s+/g," ").trim().slice(0,MAX_TEXT_CHARS);
      return {status:body.truncated||decoded.length>MAX_TEXT_CHARS?"read_partial":"read_success",contentType,url,title:"",text,truncated:body.truncated||decoded.length>MAX_TEXT_CHARS,httpStatus:200};
    }
    const extracted=extractReadableText(decoded,MAX_TEXT_CHARS);
    return {status:body.truncated||extracted.truncated?"read_partial":"read_success",contentType,url,title:extracted.title,text:extracted.text,truncated:body.truncated||extracted.truncated,httpStatus:200};
  }
  return {status:"failed",error:"reader_failed",httpStatus:502};
}

export function createHandler(deps={}){
  const fetchImpl=deps.fetchImpl||fetch;
  return async function handle(request,env={}){
    if(request.method==="OPTIONS")return withCors(new Response(null,{status:204}),request,env);
    if(!(await enforceRateLimit(request,env)))return withCors(json({error:"rate_limited"},429),request,env);

    const url=new URL(request.url);
    if(url.pathname==="/health"&&request.method==="GET"){
      return withCors(json({
        ok:true,version:GATEWAY_VERSION,
        capabilities:{search:!!env.BRAVE_SEARCH_API_KEY,reader:true},
        backend:env.BRAVE_SEARCH_API_KEY?"brave":"none"
      }),request,env);
    }

    if(url.pathname==="/v1/search"&&request.method==="POST"){
      const body=await readJsonSafe(request);
      const input=normalizeSearchRequest(body);
      if(!input.ok)return withCors(json({error:input.error},input.status),request,env);
      if(!env.BRAVE_SEARCH_API_KEY)return withCors(json({error:"search_backend_not_configured",version:GATEWAY_VERSION},503),request,env);
      try{
        const result=await braveSearch(fetchImpl,env,input);
        return withCors(json({version:GATEWAY_VERSION,backend:result.backend,capability:"general_web_search",results:result.results}),request,env);
      }catch(error){
        return withCors(json({error:"search_upstream_failure",status:Number(error?.status)||0},502),request,env);
      }
    }

    if(url.pathname==="/v1/read"&&request.method==="POST"){
      const body=await readJsonSafe(request);
      const target=body?.url;
      const result=await readUrl(fetchImpl,target);
      return withCors(json({
        version:GATEWAY_VERSION,status:result.status,url:result.url||String(target||""),
        title:result.title||"",contentType:result.contentType||null,text:result.text||"",
        truncated:result.truncated===true,error:result.error||null
      },result.httpStatus||200),request,env);
    }

    return withCors(json({error:"not_found"},404),request,env);
  };
}

const handler=createHandler();
export default {fetch(request,env){return handler(request,env);}};
