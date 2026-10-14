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
function wire(){
  const saveButton=el('rpg-key-save'),removeButton=el('rpg-key-remove');
  saveButton?.addEventListener('click',save);
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
