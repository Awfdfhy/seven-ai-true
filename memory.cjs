const vm=require('vm'),fs=require('fs'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../seven_ai-t152.html'),'utf8');
const source=html.slice(html.indexOf('        // ---------- Memory Fabric Architecture Contract'),html.indexOf('        // ---------- Init ----------'));
const data=new Map();let fail=false;const context=vm.createContext({console,localStorage:{getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>{if(fail)throw Error('QUOTA');data.set(k,v)},removeItem:k=>data.delete(k)}});
vm.runInContext(source,context);
const run=s=>vm.runInContext(s,context);let count=0;
function test(name,fn){fn();count++;console.log('PASS',name)}
test('create + ledger consistency',()=>{assert.ok(run('globalThis.m=addMemory("I prefer Arabic explanations.");m'));assert.equal(run('verifyMemoryLedgerConsistency(m.id).consistent'),true)});
test('update preserves metadata and appends immutable history',()=>{assert.ok(run('updateMemory(m.id,"I prefer Arabic and English explanations.")'));assert.equal(run('getMemoryHistory(m.id).length'),2);assert.equal(run('getMemoryHistory(m.id)[0].changes.after.content'),'I prefer Arabic explanations.')});
test('write failure keeps exact snapshot',()=>{const before=data.get('seven_ai_memory_bundle_v2');fail=true;assert.equal(run('updateMemory(m.id,"This write must fail.")'),null);fail=false;assert.equal(data.get('seven_ai_memory_bundle_v2'),before)});
test('corruption cannot be replaced with empty data',()=>{const old=data.get('seven_ai_memory_bundle_v2');data.set('seven_ai_memory_bundle_v2','bad');assert.equal(run('addMemory("Must not overwrite corrupted data.")'),null);assert.equal(data.get('seven_ai_memory_bundle_v2'),'bad');data.set('seven_ai_memory_bundle_v2',old)});
test('metadata never authorizes actions',()=>{assert.equal(run('canMemoryAuthorizeAction(m,{requireTrackedLedger:false,allowRestricted:true,minimumAuthority:"untrusted"}).allowed'),false)});
test('delete commits ledger with canonical removal',()=>{assert.equal(run('deleteMemory(m.id)'),true);assert.equal(run('getMemoryHistory(m.id).length'),3);assert.equal(run('verifyMemoryLedgerConsistency(m.id).consistent'),true)});
test('legacy keys remain unchanged',()=>{assert.equal(data.has('seven_ai_memory_v1'),false);assert.equal(data.has('seven_ai_memory_event_ledger_v1'),false)});
test('legacy noncanonical update/delete compatibility',()=>{data.delete('seven_ai_memory_bundle_v2');data.set('seven_ai_memory_v1',JSON.stringify([{id:'old',content:'Legacy preference',createdAt:1}]));assert.ok(run('updateMemory("old","Updated legacy preference")'));assert.equal(run('deleteMemory("old")'),true);assert.ok(data.get('seven_ai_memory_v1').includes('Legacy preference'))});
test('duplicate ledger IDs cannot overwrite history',()=>{run('globalThis.x=addMemory("Another memory for duplicate tests.")');const old=data.get('seven_ai_memory_bundle_v2');assert.equal(run('appendMemoryLedgerEvent(getMemoryHistory(x.id)[0])'),null);assert.equal(data.get('seven_ai_memory_bundle_v2'),old)});
fs.writeFileSync(path.join(__dirname,'memory-results.json'),JSON.stringify({passed:count,scope:'Node VM memory subsystem, real source; injected storage adapter',browserIntegration:'separate suite'},null,2));
