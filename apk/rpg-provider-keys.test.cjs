'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'rpg-provider-keys.js'),'utf8');
assert.ok(!/localStorage\\s*(?:\\.|\\[)/.test(script),'Keys must never call localStorage');
assert.ok(script.includes('secureSet')&&script.includes('secureGet')&&script.includes('secureRemove'),'Keystore must support save/load/revoke');
function element(value=''){
 const node={value,type:'password',dataset:{},textContent:'',disabled:false,handlers:{}};
 node.addEventListener=(event,cb)=>{node.handlers[event]=cb;};
 return node;
}
const nodes=Object.fromEntries(['rpg-key-provider','rpg-key-input','rpg-key-toggle','rpg-key-save','rpg-key-remove','rpg-provider-key-status'].map(n=>[n,element()]));
nodes['rpg-key-provider'].value='groq';
const storage={'rpg.provider.groq':'initial-valid-test-key'};
const plugin={
 async secureGet({key}){return {found:Object.hasOwn(storage,key),value:storage[key]};},
 async secureSet({key,value}){storage[key]=value;return {ok:true};},
 async secureRemove({key}){delete storage[key];return {removed:true};}
};
const events=[];
const win={Capacitor:{Plugins:{SevenPlatform:plugin}},dispatchEvent:e=>events.push(e.type)};
const doc={readyState:'complete',getElementById:id=>nodes[id]||null};
vm.runInNewContext(script,{window:win,document:doc,Event:class{constructor(type){this.type=type;}},Promise,console});
(async()=>{
 await new Promise(setImmediate);
 assert.equal(win.__SEVEN_RPG_NATIVE_KEYS.groq,'initial-valid-test-key','Existing key must hydrate');
 assert.equal(nodes['rpg-key-input'].value,'','Key must never be copied into editable input');
 nodes['rpg-key-input'].value='updated-valid-test-key';
 await nodes['rpg-key-save'].handlers.click();
 assert.equal(storage['rpg.provider.groq'],'updated-valid-test-key','New key must be encrypted via native plugin');
 assert.equal(nodes['rpg-key-input'].value,'','Input must clear after secure save');
 assert.equal(win.__SEVEN_RPG_NATIVE_KEYS.groq,'updated-valid-test-key');
 await nodes['rpg-key-remove'].handlers.click();
 assert.equal(storage['rpg.provider.groq'],undefined,'Revoke must delete Android stored secret');
 assert.equal(win.__SEVEN_RPG_NATIVE_KEYS.groq,undefined,'Revoke must clear in-memory token');
 assert.ok(events.filter(e=>e==='seven:rpg-credentials-ready').length>=3,'Runtime must be notified about credential changes');
 console.log('Seven RPG secure provider keys: PASS (Android Keystore hydration, save, revoke, no localStorage)');
})().catch(e=>{console.error(e);process.exitCode=1;});
