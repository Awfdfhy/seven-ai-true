(function(root){
  'use strict';
  if(!root||!root.document)return;
  const doc=root.document;
  const perf=()=>root.SevenPerformance;
  const state={ready:false,pressTarget:null};
  function reduce(){return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}
  function interactive(el){return el&&el.closest&&el.closest('button,.room-item,.tool-btn,.regenerate-btn,.settings-row button,[role="button"]');}
  function pressStart(e){const el=interactive(e.target);if(!el||reduce())return;state.pressTarget=el;el.classList.add('seven-pressing');}
  function pressEnd(){if(state.pressTarget){state.pressTarget.classList.remove('seven-pressing');state.pressTarget=null;}}
  function reveal(el){if(!el||el.dataset.sevenRevealed)return;el.dataset.sevenRevealed='1';el.classList.add('seven-reveal');root.setTimeout(()=>el.classList.remove('seven-reveal'),420);}
  function watchMessages(){
    const chat=doc.getElementById('chat');if(!chat)return null;
    const observer=new MutationObserver(records=>{
      const run=()=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.matches&&node.matches('.message'))reveal(node);if(node.querySelectorAll)node.querySelectorAll('.message').forEach(reveal);}};
      if(perf()&&perf().batchFrame)perf().batchFrame('seven-message-reveal',run);else run();
    });
    observer.observe(chat,{childList:true,subtree:true});
    return observer;
  }
  function watchTheme(){
    const body=doc.body;if(!body)return null;
    let wasLight=body.classList.contains('light');
    const observer=new MutationObserver(()=>{
      const isLight=body.classList.contains('light');if(isLight===wasLight)return;wasLight=isLight;
      if(reduce())return;
      body.classList.remove('seven-theme-shift');void body.offsetWidth;body.classList.add('seven-theme-shift');
      root.setTimeout(()=>body.classList.remove('seven-theme-shift'),520);
    });
    observer.observe(body,{attributes:true,attributeFilter:['class']});
    return observer;
  }
  function boot(){
    if(state.ready)return;
    state.ready=true;
    doc.documentElement.classList.add('seven-motion-ready');
    doc.addEventListener('pointerdown',pressStart,{passive:true});
    doc.addEventListener('pointerup',pressEnd,{passive:true});
    doc.addEventListener('pointercancel',pressEnd,{passive:true});
    doc.addEventListener('dragstart',pressEnd,{passive:true});
    watchMessages();watchTheme();
    root.setTimeout(()=>doc.documentElement.classList.add('seven-ui-ready'),0);
  }
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  root.SevenMotion={boot,state};
})(typeof globalThis!=='undefined'?globalThis:this);
