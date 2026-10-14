/* Seven RPG provider connections: Android Keystore only, never localStorage. */
(function(win,doc){
'use strict';
if(!win||!doc)return;
const PROVIDERS=Object.freeze(['groq','openrouter','nvidia','mistral','gemini']);
const keys=Object.create(null);
win.__SEVEN_RPG_NATIVE_KEYS=keys;
let busy=false,loaded=false;
const el=id=>doc.getElementById(id);
function nativePlugin(){
  const cap=win.Capacitor;
  if(!cap)return null;
  return cap.Plugins?.SevenPlatform || (typeof cap.registerPlugin==='function'?cap.registerPlugin('SevenPlatform'):null);
}
function status(message,error=false){
  const node=el('rpg-provider-key-status');
  if(node){node.textContent=message;node.dataset.state=error?'error':'ready';}
}
function announce(){
  win.dispatchEvent(new Event('seven:rpg-credentials-ready'));
  const count=PROVIDERS.filter(p=>!!keys[p]).length;
  const provider=el('rpg-key-provider')?.value;
  status(count+' provider'+(count===1?'':'s')+' connected on this device.'+
    (provider&&keys[provider]?' Selected provider has a key.':' Selected provider is not connected.'));
}
async function hydrate(){
  if(busy)return;
  busy=true;
  try{
    const plugin=nativePlugin();
    if(!plugin||typeof plugin.secureGet!=='function'){
      status('Android secure storage is unavailable here. Open the installed Seven RPG APK to connect a provider.',true);
      return;
    }
    const values=await Promise.all(PROVIDERS.map(p=>plugin.secureGet({key:'rpg.provider.'+p})));
    PROVIDERS.forEach((p,i)=>{
      if(values[i]?.found&&typeof values[i].value==='string'&&values[i].value.trim())keys[p]=values[i].value.trim();
      else delete keys[p];
    });
    loaded=true;
    announce();
  }catch(_){
    status('Android Keystore could not be opened. No provider key was changed.',true);
  }finally{busy=false;}
}
async function save(){
  if(busy)return;
  const p=el('rpg-key-provider')?.value;
  const input=el('rpg-key-input');
  const value=input?.value.trim()||'';
  if(!PROVIDERS.includes(p)||value.length<8||value.length>4096){status('Select a provider and paste a valid key (8–4096 characters).',true);return;}
  const plugin=nativePlugin();
  if(!plugin||typeof plugin.secureSet!=='function'){status('Android Keystore is required to save this key.',true);return;}
  busy=true;
  const btn=el('rpg-key-save');if(btn)btn.disabled=true;
  try{
    await plugin.secureSet({key:'rpg.provider.'+p,value});
    keys[p]=value;
    win.dispatchEvent(new CustomEvent('seven:rpg-provider-key-changed',{detail:{provider:p}}));
    if(input){input.value='';input.type='password';}
    announce();
    status(p.toUpperCase()+' key saved securely. Open Narrator and tap Refresh, then Test narrator.');
  }catch(_){status('Secure save failed. Check Android storage and retry.',true);}
  finally{busy=false;if(btn)btn.disabled=false;}
}
async function remove(){
  if(busy)return;
  const p=el('rpg-key-provider')?.value;
  if(!PROVIDERS.includes(p))return;
  const plugin=nativePlugin();
  if(!plugin||typeof plugin.secureRemove!=='function'){status('Android Keystore unavailable.',true);return;}
  busy=true;
  try{
    await plugin.secureRemove({key:'rpg.provider.'+p});
    delete keys[p];
    win.dispatchEvent(new CustomEvent('seven:rpg-provider-key-changed',{detail:{provider:p}}));
    const input=el('rpg-key-input');if(input)input.value='';
    announce();
    status(p.toUpperCase()+' key removed from this device.');
  }catch(_){status('Could not remove the key.',true);}
  finally{busy=false;}
}
// One-time personal key import. Only the installed Android Keystore keeps keys.
function parseCredentialBundle(raw){
  const input=String(raw||'').trim();
  if(!input||input.length>20000)throw Error('Credential bundle is empty or too large');
  let found={};
  if(input.startsWith('{')){
    const object=JSON.parse(input);
    if(!object || typeof object!=='object'||Array.isArray(object))throw Error('Expected a JSON object');
    const direct=object.keys&&typeof object.keys==='object'?object.keys:object;
    for(const provider of PROVIDERS){
      if(typeof direct[provider]==='string')found[provider]=direct[provider].trim();
    }
  }else{
    // Accept legacy concatenated personal bundle without copying a key into
    // source, logs, network requests, or GitHub.
    const starters=[['openrouter','sk-or-v1-'],['mistral','AQ.'],['nvidia','nvapi-'],['groq','gsk_']];
    const positions=starters.map(([provider,prefix])=>({provider,prefix,offset:input.indexOf(prefix)}))
      .filter(row=>row.offset>=0).sort((a,b)=>a.offset-b.offset);
    for(let i=0;i<positions.length;i++){
      const start=positions[i],end=i+1<positions.length?positions[i+1].offset:input.length;
      let token=input.slice(start.offset,end).trim();
      if(i===positions.length-1)token=token.split(/\s/)[0];
      found[start.provider]=token;
    }
  }
  const pairs=Object.entries(found);
  if(!pairs.length)throw Error('No recognized provider names or key prefixes found');
  for(const [provider,token] of pairs){
    if(!PROVIDERS.includes(provider) || token.length<8 || token.length>4096 || !/^[A-Za-z0-9._-]+$/.test(token))throw Error('One provider key has an invalid format');
  }
  return found;
}
async function importBundle(){
  if(busy)return;
  const input=el('rpg-key-bundle');
  let bundle;
  try{bundle=parseCredentialBundle(input?.value)}catch(_){status('Invalid key bundle. Use provider JSON or a recognized concatenated string.',true);return;}
  const plugin=nativePlugin();
  if(!plugin||typeof plugin.secureSet!=='function'){status('Android Keystore unavailable. Use the installed APK.',true);return;}
  busy=true;
  const button=el('rpg-bundle-import');if(button)button.disabled=true;
  const changed=[];
  try{
    // Every key is encrypted natively before it enters the app's model runtime.
    for(const [provider,value] of Object.entries(bundle)){
      await plugin.secureSet({key:'rpg.provider.'+provider,value});
      keys[provider]=value;
      changed.push(provider);
      win.dispatchEvent(new CustomEvent('seven:rpg-provider-key-changed',{detail:{provider}}));
    }
    if(input)input.value='';
    announce();
    status(changed.length+' provider key'+(changed.length===1?'':'s')+' securely imported. Open Narrator → Refresh → Test.');
    const node=el('rpg-key-bundle');
    if(node)node.value='';
  }catch(_){
    if(input)input.value=''; // Never leave live secrets in a visible textarea.
    announce();
    status('Import stopped after '+changed.length+' saved provider(s). Please retry remaining keys.',true);
  }finally{busy=false;if(button)button.disabled=false;}
}
function wire(){
  const saveButton=el('rpg-key-save'),removeButton=el('rpg-key-remove');
  saveButton?.addEventListener('click',save);
  el('rpg-bundle-import')?.addEventListener('click',importBundle);
  removeButton?.addEventListener('click',remove);
  el('rpg-key-provider')?.addEventListener('change',()=>{
    const input=el('rpg-key-input');
    if(input){input.value='';input.type='password';}
    if(loaded)announce();
  });
  el('rpg-key-toggle')?.addEventListener('click',()=>{
    const input=el('rpg-key-input');if(!input)return;
    input.type=input.type==='password'?'text':'password';
  });
  hydrate();
}
win.SevenRpgProviderKeys=Object.freeze({recheck:()=>{if(loaded)announce();else if(!busy)hydrate();},connected:()=>PROVIDERS.filter(p=>!!keys[p])});
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
})(typeof window!=='undefined'?window:null,typeof document!=='undefined'?document:null);
