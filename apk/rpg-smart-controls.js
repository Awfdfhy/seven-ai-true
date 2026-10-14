/* Seven RPG menus and narrator model UX. Local-only controls; no network keys. */
(function(win,doc){
'use strict';
if(!win||!doc)return;
const $=s=>doc.querySelector(s);
const byId=id=>doc.getElementById(id);
const hidden=node=>!node||node.hidden||win.getComputedStyle(node).display==='none';
let previousFocus=null,modelGroups=[],filterReady=false,refreshing=false;
let draftModel=''; // Never change narrator preference just because the user searches the catalog.
function selectable(root){
  if(!root)return[];
  return [...root.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex]:not([tabindex="-1"])')]
    .filter(node=>!hidden(node)&&node.getAttribute('aria-hidden')!=='true'&&!node.closest('[hidden]'));
}
function trap(event,root){
  const list=selectable(root);
  if(!list.length){event.preventDefault();return;}
  const first=list[0],last=list[list.length-1];
  if(event.shiftKey&&(doc.activeElement===first||!root.contains(doc.activeElement))){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&(doc.activeElement===last||!root.contains(doc.activeElement))){event.preventDefault();first.focus();}
}
function updateLibrary(){
  const list=byId('roomList'),query=byId('rpg-library-search');
  if(!list||!query)return;
  const term=query.value.trim().toLocaleLowerCase();
  const items=[...list.querySelectorAll('.room-item')];
  let shown=0;
  for(const item of items){
    const matched=!term||item.textContent.toLocaleLowerCase().includes(term);
    item.hidden=!matched;
    if(matched)shown++;
  }
  const count=byId('rpg-library-count');
  if(count)count.textContent=items.length+' adventures · '+shown+' shown';
  const empty=byId('rpg-library-empty');
  if(empty){empty.hidden=shown!==0;empty.textContent=items.length?(term?'No matching adventures. Clear the search to see your worlds.':'No adventures yet.'):'No adventures yet. Create your first world.';}
}
function readGroups(){
  const picker=byId('modelSelect');
  if(!picker)return;
  modelGroups=[];
  for(const node of picker.children){
    if(node.tagName==='OPTGROUP'){
      modelGroups.push({label:node.label,disabled:!!node.disabled,options:[...node.querySelectorAll('option')].map(o=>o.cloneNode(true))});
    }else if(node.tagName==='OPTION'){
      modelGroups.push({label:'',disabled:false,options:[node.cloneNode(true)]});
    }
  }
  filterReady=true;
  const current=picker.selectedOptions[0];
  if(current&&current.value&&!current.disabled&&!current.parentElement?.disabled)draftModel=current.value;
}
function providerFor(option){
  return option.dataset.provider || (option.value.includes('::')?option.value.split('::')[0]:'groq');
}
function updateProviderChoices(){
  const filter=byId('rpg-provider-filter');
  if(!filter)return;
  const previously=filter.value||'all';
  const providers=new Set();
  modelGroups.forEach(g=>g.options.forEach(o=>{if(o.value)providers.add(providerFor(o));}));
  filter.replaceChildren();
  const all=doc.createElement('option');all.value='all';all.textContent='All providers';filter.appendChild(all);
  [...providers].sort().forEach(provider=>{
    const option=doc.createElement('option');
    option.value=provider;option.textContent=provider.charAt(0).toUpperCase()+provider.slice(1);
    filter.appendChild(option);
  });
  filter.value=providers.has(previously)?previously:'all';
}
function updateModelCount(available,total){
  const el=byId('rpg-model-count');
  if(el)el.textContent=available+' selectable · '+total+' shown';
  const empty=byId('rpg-model-empty');
  if(empty)empty.hidden=total!==0;
}
function filterModels(){
  const picker=byId('modelSelect'),filter=byId('rpg-provider-filter'),input=byId('rpg-model-search');
  if(!picker||!filterReady)return;
  const term=(input&&input.value||'').trim().toLocaleLowerCase();
  const provider=filter&&filter.value||'all';
  const selected=draftModel || picker.value;
  const isFiltered=!!term||provider!=='all';
  const fragment=doc.createDocumentFragment();
  let total=0,available=0;
  for(const group of modelGroups){
    const matching=group.options.filter(option=>(provider==='all'||providerFor(option)===provider)
      &&(!term||(option.textContent+' '+option.value+' '+providerFor(option)).toLocaleLowerCase().includes(term)));
    if(!matching.length)continue;
    const target=group.label?doc.createElement('optgroup'):fragment;
    if(group.label){target.label=group.label;target.disabled=group.disabled;}
    matching.forEach(option=>{
      total++;
      if(!option.disabled&&!group.disabled&&option.value)available++;
      target.appendChild(option.cloneNode(true));
    });
    if(group.label)fragment.appendChild(target);
  }
  const selectedMatches=modelGroups.some(g=>g.options.some(o=>o.value===selected&&!o.disabled&&!g.disabled));
  const currentMatches=selectedMatches&&modelGroups.some(g=>g.options.some(o=>o.value===selected&&!o.disabled&&!g.disabled&&(provider==='all'||providerFor(o)===provider)&&(!term||(o.textContent+' '+o.value+' '+providerFor(o)).toLocaleLowerCase().includes(term))));
  if(!total||!currentMatches&&isFiltered){
    const placeholder=doc.createElement('option');
    placeholder.value='';placeholder.disabled=true;
    placeholder.textContent=total?'Choose a model from these results':'No matching models';
    fragment.insertBefore(placeholder,fragment.firstChild);
  }
  picker.replaceChildren(fragment);
  const keep=[...picker.options].find(o=>o.value===selected&&!o.disabled&&!o.parentElement?.disabled);
  const first=[...picker.options].find(o=>o.value&&!o.disabled&&!o.parentElement?.disabled);
  // A search cannot silently replace the saved narrator with the first result.
  picker.value=keep?keep.value:(!isFiltered&&first?first.value:'');
  if(!isFiltered&&picker.value)draftModel=picker.value;
  const mode=byId('routingModeSelect');
  picker.disabled=(mode&&mode.value==='auto')||!available;
  updateModelCount(available,total);
}
function restoreModelFilters(){
  const search=byId('rpg-model-search'),provider=byId('rpg-provider-filter');
  if(search)search.value='';
  if(provider)provider.value='all';
  if(!filterReady)readGroups();
  updateProviderChoices();
  filterModels();
  updateRouteHint();
}
function updateRouteHint(){
  const mode=byId('routingModeSelect');
  const picker=byId('modelSelect');
  const hint=byId('rpg-mode-help');
  const auto=!mode||mode.value==='auto';
  if(hint)hint.textContent=auto
    ?'Automatic selects a configured free route for the story. A model is not guaranteed online until a request succeeds.'
    :'Manual prefers your selected configured model. Enable fallback if you want narration to continue when that route fails.';
  const search=byId('rpg-model-search'),filter=byId('rpg-provider-filter');
  if(search)search.disabled=auto;
  if(filter)filter.disabled=auto;
  if(picker)picker.disabled=auto||picker.dataset.rpgAvailableCount==='0'||![...picker.options].some(o=>!o.disabled&&o.value);
}
function syncModalSoon(){
  win.setTimeout(()=>{
    const modal=byId('settingsModal');
    if(hidden(modal))return;
    restoreModelFilters();
    const mode=byId('routingModeSelect');
    const target=mode&&mode.value==='auto'?byId('routingModeSelect'):byId('rpg-model-search');
    if(target)target.focus();
  },0);
}
async function refreshModels(){
  if(refreshing)return;
  const trigger=byId('rpg-refresh-models'),status=byId('rpg-model-refresh-state');
  refreshing=true;
  if(trigger)trigger.disabled=true;
  if(status)status.textContent='Checking available routes…';
  try{
    if(typeof win.refreshFreeModelCatalogFromSettings!=='function')throw Error('Model refresh is not available');
    const outcome=await win.refreshFreeModelCatalogFromSettings();
    if(!outcome||outcome.ok!==true)throw Error('Model catalog refresh did not complete');
    const search=byId('rpg-model-search'),provider=byId('rpg-provider-filter');
    if(search)search.value='';
    if(provider)provider.value='all';
    readGroups();updateProviderChoices();filterModels();updateRouteHint();
    const count=Number(byId('modelSelect')?.dataset.rpgAvailableCount||0);
    const errors=outcome.report?.errors?.length||0;
    if(status)status.textContent=count?('Catalog refreshed ('+count+' ready routes'+(errors?', '+errors+' provider errors':'')+'). Connection is confirmed when you send.'):'No usable routes found. Retry later or check provider access.';
  }catch(error){
    if(status)status.textContent='Refresh failed: '+String(error&&error.message||'connection unavailable').slice(0,130);
  }finally{
    refreshing=false;
    if(trigger)trigger.disabled=false;
  }
}
function wire(){
  const search=byId('rpg-library-search'),list=byId('roomList');
  if(search)search.addEventListener('input',updateLibrary);
  if(list&&typeof win.MutationObserver==='function')new win.MutationObserver(updateLibrary).observe(list,{childList:true,subtree:true,characterData:true});
  updateLibrary();
  const modelSearch=byId('rpg-model-search'),provider=byId('rpg-provider-filter'),mode=byId('routingModeSelect');
  if(modelSearch)modelSearch.addEventListener('input',filterModels);
  if(provider)provider.addEventListener('change',filterModels);
  const picker=byId('modelSelect');
  if(picker)picker.addEventListener('change',function(){if(picker.value)draftModel=picker.value;});
  if(mode)mode.addEventListener('change',function(){
    if(mode.value==='auto'){if(modelSearch)modelSearch.value='';if(provider)provider.value='all';filterModels();}
    updateRouteHint();
  });
  // The transport owns the unfiltered catalog. Never cache a previously filtered copy.
  doc.addEventListener('seven:rpg-model-catalog-updated',function(){
    readGroups();updateProviderChoices();filterModels();updateRouteHint();
  });
  const refresh=byId('rpg-refresh-models');
  if(refresh)refresh.addEventListener('click',refreshModels);
  const modal=byId('settingsModal');
  const toggle=byId('rpg-library-toggle'),modelButton=byId('rpg-settings-toggle');
  doc.addEventListener('click',event=>{
    const target=event.target;
    if(!target||typeof target.closest!=='function')return;
    if(target.closest('#rpg-settings-toggle,#seven-rpg-model-control')){
      previousFocus=doc.activeElement;
      syncModalSoon();
    }else if(target.closest('#rpg-library-toggle')){
      previousFocus=doc.activeElement;
      win.setTimeout(()=>{if(!hidden(byId('sidebar')))search&&search.focus();},0);
    }else if(target.closest('#rpg-library-close,#sidebarBackdrop,#rpg-new-adventure')){
      win.setTimeout(()=>{if(hidden(byId('sidebar'))&&toggle)toggle.focus();},0);
    }else if(target.closest('.rpg-settings-close,.rpg-settings-footer button')){
      win.setTimeout(()=>{if(hidden(modal)&&previousFocus&&previousFocus.isConnected)previousFocus.focus();},0);
    }
  });
  // Route mode/status can change on opening settings after asynchronous catalog discovery.
  if(modal&&typeof win.MutationObserver==='function'){
    new win.MutationObserver(()=>{if(!hidden(modal)){restoreModelFilters();}}).observe(modal,{attributes:true,attributeFilter:['style']});
  }
  doc.addEventListener('keydown',event=>{
    const drawer=byId('sidebar');
    if(event.key==='Escape'){
      if(!hidden(modal)){
        event.preventDefault();
        if(typeof win.closeSettings==='function')win.closeSettings();
        if(previousFocus&&previousFocus.isConnected)previousFocus.focus();
      }else if(!hidden(drawer)){
        event.preventDefault();
        const close=byId('rpg-library-close');if(close)close.click();
        if(toggle)toggle.focus();
      }
      return;
    }
    if(event.key==='Tab'){
      if(!hidden(modal))trap(event,modal.querySelector('.rpg-settings-panel')||modal);
      else if(!hidden(drawer))trap(event,drawer);
    }
  });
  // Keep scrollable panels reachable on compact keyboards without reshaping the game stage.
  doc.documentElement.dataset.rpgSmartControls='ready';
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
})(typeof window==='undefined'?null:window,typeof document==='undefined'?null:document);
