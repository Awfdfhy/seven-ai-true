(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.SevenPerformance=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const hasDOM=!!(root&&root.document);
  const doc=hasDOM?root.document:null;
  const state={tier:'balanced',reducedMotion:false,longTasks:[],marks:[],ready:false};
  const frameQueue=new Map();
  let framePending=false;

  function now(){return root.performance&&root.performance.now?root.performance.now():Date.now();}
  function detectTier(){
    if(!hasDOM)return 'balanced';
    const reduce=!!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    state.reducedMotion=reduce;
    const mem=Number(root.navigator&&root.navigator.deviceMemory)||4;
    const cores=Number(root.navigator&&root.navigator.hardwareConcurrency)||4;
    if(reduce||mem<=2||cores<=2)return 'lite';
    if(mem>=6&&cores>=6)return 'full';
    return 'balanced';
  }
  function applyTier(tier){
    state.tier=tier||detectTier();
    if(!hasDOM)return state.tier;
    doc.documentElement.dataset.sevenPerformance=state.tier;
    doc.documentElement.classList.remove('seven-tier-lite','seven-tier-balanced','seven-tier-full');
    doc.documentElement.classList.add('seven-tier-'+state.tier);
    doc.documentElement.dataset.sevenReducedMotion=state.reducedMotion?'1':'0';
    return state.tier;
  }
  function scheduleIdle(task,timeout){
    if(typeof task!=='function')return function(){};
    let cancelled=false,id;
    const run=()=>{if(!cancelled)task();};
    if(root.requestIdleCallback)id=root.requestIdleCallback(run,{timeout:timeout||1200});
    else id=root.setTimeout(run,Math.min(timeout||250,250));
    return ()=>{cancelled=true;if(root.cancelIdleCallback&&id!=null)root.cancelIdleCallback(id);else if(id!=null)root.clearTimeout(id);};
  }
  function batchFrame(key,task){
    if(typeof task!=='function')return;
    frameQueue.set(key||task,task);
    if(framePending)return;
    framePending=true;
    const raf=root.requestAnimationFrame||function(cb){return root.setTimeout(()=>cb(now()),16);};
    raf(()=>{framePending=false;const jobs=Array.from(frameQueue.values());frameQueue.clear();for(const job of jobs){try{job();}catch(e){root.setTimeout(()=>{throw e;},0);}}});
  }
  async function yieldIfNeeded(start,budget){
    const limit=Number(budget)||4;
    if(now()-Number(start||0)<limit)return false;
    await new Promise(resolve=>{
      if(root.scheduler&&root.scheduler.yield)root.scheduler.yield().then(resolve);
      else root.setTimeout(resolve,0);
    });
    return true;
  }
  function measure(name,fn){
    const start=now();
    const value=fn();
    const duration=now()-start;
    state.marks.push({name,duration,at:Date.now()});
    if(state.marks.length>100)state.marks.splice(0,state.marks.length-100);
    return {value,duration};
  }
  function observeLongTasks(){
    if(!hasDOM||!root.PerformanceObserver)return null;
    try{
      const observer=new root.PerformanceObserver(list=>{
        for(const entry of list.getEntries())state.longTasks.push({duration:entry.duration,startTime:entry.startTime});
        if(state.longTasks.length>50)state.longTasks.splice(0,state.longTasks.length-50);
        if(state.longTasks.slice(-3).filter(x=>x.duration>=50).length>=2&&state.tier==='full')applyTier('balanced');
        if(state.longTasks.slice(-3).filter(x=>x.duration>=80).length>=2)applyTier('lite');
      });
      observer.observe({entryTypes:['longtask']});
      return observer;
    }catch(_){return null;}
  }
  function suspendWhenHidden(){
    if(!hasDOM)return;
    doc.addEventListener('visibilitychange',()=>{doc.documentElement.dataset.sevenHidden=doc.hidden?'1':'0';},{passive:true});
  }
  function boot(){
    applyTier(detectTier());
    observeLongTasks();
    suspendWhenHidden();
    state.ready=true;
    return snapshot();
  }
  function snapshot(){return {tier:state.tier,reducedMotion:state.reducedMotion,longTasks:state.longTasks.slice(),marks:state.marks.slice(),ready:state.ready};}
  if(hasDOM){if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});else boot();}
  return {state,detectTier,applyTier,scheduleIdle,batchFrame,yieldIfNeeded,measure,snapshot,boot};
});
