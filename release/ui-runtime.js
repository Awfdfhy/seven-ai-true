(function(root){
  'use strict';
  if(!root||!root.document)return;
  const doc=root.document;
  const state={ready:false,version:'2.0.1',messageObserver:null,composerObserver:null,pendingMessages:new Set()};
  const raf=(key,fn)=>{
    const perf=root.SevenPerformance;
    if(perf&&typeof perf.batchFrame==='function')perf.batchFrame(key,fn);
    else (root.requestAnimationFrame||root.setTimeout)(fn);
  };
  function messageRole(node){
    if(node.classList.contains('user'))return 'user';
    if(node.classList.contains('assistant'))return 'assistant';
    if(node.classList.contains('system'))return 'system';
    return 'unknown';
  }
  function decorateMessage(node){
    if(!node||node.nodeType!==1||!node.classList.contains('message'))return;
    node.dataset.sevenMessageRole=messageRole(node);
    const bubble=node.querySelector('.bubble');
    if(bubble){bubble.dataset.sevenBubble='1';bubble.dir='auto';}
    if(node.dataset.sevenUiDecorated)return;
    node.dataset.sevenUiDecorated='1';
  }
  function queueMessageNode(node){
    if(!node||node.nodeType!==1)return;
    if(node.matches&&node.matches('.message'))state.pendingMessages.add(node);
    if(node.querySelectorAll)node.querySelectorAll('.message').forEach(x=>state.pendingMessages.add(x));
  }
  function flushMessages(){
    const pending=[...state.pendingMessages];state.pendingMessages.clear();
    for(const node of pending)decorateMessage(node);
    syncComposer();syncToolState();
  }
  function syncToolState(){
    doc.querySelectorAll('.tool-btn.toggle').forEach(btn=>{
      btn.setAttribute('aria-pressed',btn.classList.contains('active')?'true':'false');
    });
  }
  function syncComposer(){
    const composer=doc.querySelector('.composer');
    if(!composer)return;
    const textarea=composer.querySelector('textarea');
    if(textarea)textarea.dir='auto';
    const stop=doc.querySelector('.input-area button.stop');
    const send=doc.querySelector('.input-area button.send');
    const busy=!!(textarea&&textarea.disabled)||!!(stop&&root.getComputedStyle(stop).display!=='none');
    composer.dataset.sevenComposerState=busy?'busy':'ready';
    if(send)send.setAttribute('aria-busy',busy?'true':'false');
    doc.documentElement.dataset.sevenBusy=busy?'1':'0';
  }
  function decorateStaticUi(){
    const chat=doc.getElementById('chat');
    if(chat){
      chat.setAttribute('role','log');
      chat.setAttribute('aria-live','polite');
      chat.setAttribute('aria-relevant','additions text');
      chat.querySelectorAll('.message').forEach(decorateMessage);
    }
    const composer=doc.querySelector('.composer');
    if(composer)composer.dataset.sevenComposer='v2';
    const sidebar=doc.querySelector('.sidebar');
    if(sidebar)sidebar.dataset.sevenSurface='navigation';
    const topbar=doc.querySelector('.topbar');
    if(topbar)topbar.dataset.sevenSurface='topbar';
    doc.querySelectorAll('.modal-content').forEach(el=>el.dataset.sevenSurface='modal');
    syncToolState();syncComposer();
  }
  function watchMessages(){
    const chat=doc.getElementById('chat');if(!chat)return;
    state.messageObserver=new MutationObserver(records=>{
      for(const record of records)for(const node of record.addedNodes)queueMessageNode(node);
      raf('seven-ui-messages',flushMessages);
    });
    state.messageObserver.observe(chat,{childList:true,subtree:true});
  }
  function watchComposer(){
    const composer=doc.querySelector('.composer');if(!composer)return;
    state.composerObserver=new MutationObserver(()=>raf('seven-ui-composer',()=>{syncComposer();syncToolState();}));
    state.composerObserver.observe(composer,{subtree:true,attributes:true,attributeFilter:['class','disabled','style']});
    const stop=doc.querySelector('.input-area button.stop');
    const send=doc.querySelector('.input-area button.send');
    if(stop)state.composerObserver.observe(stop,{attributes:true,attributeFilter:['style','class']});
    if(send)state.composerObserver.observe(send,{attributes:true,attributeFilter:['style','class','disabled']});
  }
  function boot(){
    if(state.ready)return state;
    doc.documentElement.dataset.sevenUi='v2';
    decorateStaticUi();watchMessages();watchComposer();
    doc.addEventListener('click',e=>{
      if(e.target&&e.target.closest&&e.target.closest('.tool-btn.toggle'))raf('seven-ui-tool-state',syncToolState);
    },{passive:true});
    state.ready=true;
    doc.documentElement.classList.add('seven-ui-system-ready');
    return state;
  }
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  root.SevenUI={state,boot,sync:decorateStaticUi};
})(typeof globalThis!=='undefined'?globalThis:this);
