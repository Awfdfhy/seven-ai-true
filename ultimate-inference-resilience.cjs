const assert=require('assert');
const R=require('./src/ultimate/inference-resilience.js');

(async()=>{
const breaker=new R.CircuitBreaker({threshold:2,cooldownMs:100,halfOpenSuccesses:1});
assert.equal(breaker.state('p'), 'closed');
breaker.record('p',{success:false,now:0,errorClass:'timeout'});assert.equal(breaker.state('p',0),'closed');
breaker.record('p',{success:false,now:1,errorClass:'timeout'});assert.equal(breaker.state('p',1),'open');
assert.equal(breaker.allow('p',50),false);
assert.equal(breaker.state('p',150),'half_open');
breaker.record('p',{success:true,now:151});assert.equal(breaker.state('p',151),'closed');

const quota=new R.QuotaWindow({windowMs:1000,requests:2,tokens:100});
assert.equal(quota.canUse('p',{requests:1,tokens:40,now:0}),true);
quota.consume('p',{requests:1,tokens:40,now:0});
quota.consume('p',{requests:1,tokens:50,now:10});
assert.equal(quota.canUse('p',{requests:1,tokens:1,now:20}),false);
assert.equal(quota.snapshot('p',20).remaining.requests,0);
assert.equal(quota.canUse('p',{requests:1,tokens:90,now:1200}),true);

const cache=new R.ExactInferenceCache({maxEntries:2,ttlMs:100});
const k1=cache.key({modelId:'m1',messages:[{role:'user',content:'x'}],contextRevision:'r1'});
const k1b=cache.key({contextRevision:'r1',messages:[{content:'x',role:'user'}],modelId:'m1'});
assert.equal(k1,k1b,'cache fingerprint must be stable across key order');
cache.set(k1,{output:'hello',cacheMeta:{namespace:'chat'}},{now:0,ttlMs:100});
assert.equal(cache.get(k1,{now:50}).output,'hello');
assert.equal(cache.get(k1,{now:101}),null);
const freshness=new R.FreshnessPolicy();
assert.equal(freshness.allowCache({cachePolicy:'exact'}).allow,true);
assert.equal(freshness.allowCache({cachePolicy:'exact',searchRequested:true}).allow,false);
assert.equal(freshness.allowCache({cachePolicy:'exact',authoritativeMutation:true}).allow,false);

let baseCalls=0;const control={fallback:{build:()=>{}},plan:()=>({route:{selected:{providerId:'p1',modelId:'m1'},candidates:[{providerId:'p1',modelId:'m1'}]}})};
const base={execute:async input=>{baseCalls++;return{status:'completed',selected:input.plan.route.selected,attempts:[{providerId:'p1',modelId:'m1',status:'completed'}],run:{id:'r'+baseCalls,status:'completed',output:'cached answer',events:[]}}}};
const resilience=new R.ProviderResilienceController({circuit:{threshold:2},quota:{requests:10,tokens:10000}});
const advanced=new R.AdvancedModelExecutor({base,control,resilience,cache:new R.ExactInferenceCache({ttlMs:1000})});
let streamed='';const a=await advanced.execute({messages:[{role:'user',content:'same'}],cachePolicy:'exact',cacheNamespace:'t',onChunk:x=>streamed+=x});
assert.equal(a.cache.hit,false);assert.equal(baseCalls,1);assert.equal(resilience.snapshot('p1').quota.used.requests,1);
const b=await advanced.execute({messages:[{role:'user',content:'same'}],cachePolicy:'exact',cacheNamespace:'t',onChunk:x=>streamed+=x});
assert.equal(b.cache.hit,true);assert.equal(baseCalls,1,'exact cache should avoid second provider call');assert.ok(streamed.includes('cached answer'));
const c=await advanced.execute({messages:[{role:'user',content:'same'}],cachePolicy:'exact',cacheNamespace:'t',searchRequested:true});
assert.equal(c.cache.hit,false);assert.equal(baseCalls,2,'fresh research must bypass inference cache');
console.log('ultimate inference resilience: 24 assertions PASS');
})().catch(e=>{console.error(e);process.exit(1)});