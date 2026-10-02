import assert from "node:assert/strict";
import {createHandler,extractReadableText,validateReadableUrl,normalizeSearchRequest} from "./search-gateway.mjs";

const tests=[];
const test=(name,fn)=>tests.push([name,fn]);

test("normalizes bounded search requests",()=>{
  assert.equal(normalizeSearchRequest({query:"android",language:"ar",freshness:"pw",maxResults:99}).maxResults,20);
  assert.equal(normalizeSearchRequest({query:""}).error,"missing_query");
  assert.equal(normalizeSearchRequest({query:"x".repeat(601)}).error,"query_too_large");
});

test("reader rejects unsafe destinations",()=>{
  for(const u of ["http://example.com","https://localhost/a","https://127.0.0.1/x","https://10.0.0.1","https://169.254.169.254/latest","https://[::1]/"]){
    assert.equal(validateReadableUrl(u).ok,false,u);
  }
  assert.equal(validateReadableUrl("https://example.com/a").ok,true);
});

test("html extraction removes active/noisy blocks",()=>{
  const out=extractReadableText("<html><head><title>Hello</title><style>x</style></head><body><nav>menu</nav><main>A <b>useful</b> article<script>alert(1)</script></main></body></html>");
  assert.equal(out.title,"Hello");
  assert.match(out.text,/useful article/);
  assert.doesNotMatch(out.text,/alert|menu/);
});

test("health exposes capabilities but no secret",async()=>{
  const handler=createHandler({fetchImpl:async()=>{throw new Error("unused")}});
  const secret="secret-token";
  const res=await handler(new Request("https://gateway.test/health"),{BRAVE_SEARCH_API_KEY:secret});
  const raw=await res.text();
  assert.equal(res.status,200);
  assert.doesNotMatch(raw,new RegExp(secret));
  assert.equal(JSON.parse(raw).backend,"brave");
});

test("Brave key appears only on outbound search request",async()=>{
  let captured=null;
  const handler=createHandler({fetchImpl:async(url,opts)=>{
    captured={url:String(url),headers:new Headers(opts.headers)};
    return new Response(JSON.stringify({web:{results:[{title:"Example",url:"https://example.com/a",description:"snippet"}]}}),{status:200,headers:{"content-type":"application/json"}});
  }});
  const key="server-only-key";
  const req=new Request("https://gateway.test/v1/search",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({query:"test",language:"en",maxResults:5})});
  const res=await handler(req,{BRAVE_SEARCH_API_KEY:key});
  const body=await res.json();
  assert.equal(res.status,200);
  assert.equal(captured.headers.get("x-subscription-token"),key);
  assert.equal(body.results.length,1);
  assert.equal(JSON.stringify(body).includes(key),false);
});

test("reader revalidates redirect targets",async()=>{
  const handler=createHandler({fetchImpl:async()=>new Response(null,{status:302,headers:{location:"https://127.0.0.1/private"}})});
  const req=new Request("https://gateway.test/v1/read",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({url:"https://example.com/start"})});
  const res=await handler(req,{});
  const body=await res.json();
  assert.equal(res.status,400);
  assert.equal(body.status,"blocked");
});

test("reader returns bounded cleaned HTML",async()=>{
  const large="<html><head><title>Doc</title></head><body><article>"+("Useful sentence. ".repeat(3000))+"</article><script>secret()</script></body></html>";
  const handler=createHandler({fetchImpl:async()=>new Response(large,{status:200,headers:{"content-type":"text/html"}})});
  const req=new Request("https://gateway.test/v1/read",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({url:"https://example.com/doc"})});
  const res=await handler(req,{});
  const body=await res.json();
  assert.equal(res.status,200);
  assert.ok(["read_success","read_partial"].includes(body.status));
  assert.ok(body.text.length<=20000);
  assert.doesNotMatch(body.text,/secret\(\)/);
});

test("unsupported reader content is rejected",async()=>{
  const handler=createHandler({fetchImpl:async()=>new Response(new Uint8Array([1,2,3]),{status:200,headers:{"content-type":"application/octet-stream"}})});
  const req=new Request("https://gateway.test/v1/read",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({url:"https://example.com/file.bin"})});
  const res=await handler(req,{});
  assert.equal(res.status,415);
});

test("optional rate limiter can reject requests",async()=>{
  const handler=createHandler({fetchImpl:async()=>{throw new Error("unused")}});
  const limiter={limit:async()=>({success:false})};
  const res=await handler(new Request("https://gateway.test/health"),{SEARCH_RATE_LIMITER:limiter});
  assert.equal(res.status,429);
});

for(const [name,fn] of tests){
  await fn();
  console.log("PASS gateway "+name);
}
console.log("gateway search/reader: PASS ("+tests.length+" tests)");
