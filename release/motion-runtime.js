(function(root,factory){
  const api=factory(root||{});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SevenMotion=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  const VERSION='3.0.0';
  const hasDOM=!!(root&&root.document);
  const doc=hasDOM?root.document:null;
  const PROFILE_ORDER=Object.freeze({off:0,reduced:1,lite:2,balanced:3,ultra:4});
  const PRIORITY=Object.freeze({CRITICAL:0,USER:1,SYSTEM:2,CONTEXT:3,AMBIENT:4});
  const PURPOSES=Object.freeze(['state','space','cause','hierarchy']);
  const FAMILY=Object.freeze({
    snap:Object.freeze({duration:105,easing:'cubic-bezier(.2,.9,.25,1)',frames:[{transform:'scale(1)',opacity:1},{transform:'scale(.972)',opacity:.94},{transform:'scale(1)',opacity:1}]}),
    glide:Object.freeze({duration:220,easing:'cubic-bezier(.22,.72,.18,1)',frames:[{transform:'translate3d(0,8px,0)',opacity:0},{transform:'translate3d(0,0,0)',opacity:1}]}),
    settle:Object.freeze({duration:300,easing:'cubic-bezier(.16,1,.3,1)',frames:[{transform:'scale(.985)',opacity:.72},{transform:'scale(1)',opacity:1}]}),
    reveal:Object.freeze({duration:210,easing:'cubic-bezier(.2,.8,.2,1)',frames:[{transform:'translate3d(0,7px,0)',opacity:0},{transform:'translate3d(0,0,0)',opacity:1}]}),
    orbit:Object.freeze({duration:760,easing:'linear',frames:[{transform:'rotate(0deg)',opacity:.72},{transform:'rotate(360deg)',opacity:1}]}),
    pulse:Object.freeze({duration:280,easing:'cubic-bezier(.2,.8,.2,1)',frames:[{transform:'scale(.985)',opacity:.65},{transform:'scale(1)',opacity:1}]}),
    collapse:Object.freeze({duration:190,easing:'cubic-bezier(.4,0,1,1)',frames:[{transform:'scale(1)',opacity:1},{transform:'scale(.94)',opacity:0}]}),
    transfer:Object.freeze({duration:300,easing:'cubic-bezier(.18,.82,.2,1)',frames:[{transform:'translate3d(0,12px,0) scale(.97)',opacity:.55},{transform:'translate3d(0,0,0) scale(1)',opacity:1}]})
  });
  const CAPS=Object.freeze({
    ultra:Object.freeze({concurrent:5,durationScale:1.06,maxDuration:920,spatial:true,signature:true,ambient:true,stagger:24,distance:18}),
    balanced:Object.freeze({concurrent:3,durationScale:1,maxDuration:680,spatial:true,signature:true,ambient:false,stagger:18,distance:11}),
    lite:Object.freeze({concurrent:1,durationScale:.72,maxDuration:190,spatial:true,signature:false,ambient:false,stagger:0,distance:4}),
    reduced:Object.freeze({concurrent:1,durationScale:.5,maxDuration:120,spatial:false,signature:false,ambient:false,stagger:0,distance:0}),
    off:Object.freeze({concurrent:0,durationScale:0,maxDuration:0,spatial:false,signature:false,ambient:false,stagger:0,distance:0})
  });
  const ALLOWED_FRAME_KEYS=new Set(['transform','opacity','offset','easing','composite']);
  const PREFERENCE_KEY='seven_motion_preference_v1';
  const VALID_PREFERENCES=new Set(['auto','ultra','balanced','lite','reduced','off']);
  const active=new Map();
  const state={
    ready:false,version:VERSION,preference:'auto',profile:'balanced',mode:'core',reducedMotion:false,
    lowPower:false,batteryLevel:null,pressure:'none',ambientSuppressedUntil:0,lastOrigin:null,
    sendOrigin:null,nextId:1,history:[],frameSamples:[],frameProbe:false,observers:[],executionSteps:new Map()
  };

  function now(){return root.performance&&typeof root.performance.now==='function'?root.performance.now():Date.now();}
  function clamp(value,min,max){return Math.min(max,Math.max(min,value));}
  function capProfile(value,max){return PROFILE_ORDER[value]<=PROFILE_ORDER[max]?value:max;}
  function validProfile(value){return Object.prototype.hasOwnProperty.call(PROFILE_ORDER,value);}
  function deriveProfile(input){
    const ctx=input||{};
    if(ctx.hidden)return 'off';
    if(ctx.reducedMotion)return 'reduced';
    let result=VALID_PREFERENCES.has(ctx.preference)?ctx.preference:'auto';
    result=result==='auto'?'balanced':result;
    if(result==='off')return 'off';
    if(ctx.performanceTier==='lite')result=capProfile(result,'lite');
    else if(ctx.performanceTier==='balanced')result=capProfile(result,'balanced');
    if(ctx.lowPower)result=capProfile(result,'lite');
    if(ctx.pressure==='high')result=capProfile(result,'lite');
    if(ctx.pressure==='critical')result=capProfile(result,'reduced');
    return result;
  }
  function storageGet(){
    if(!hasDOM)return 'auto';
    try{const value=root.localStorage&&root.localStorage.getItem(PREFERENCE_KEY);return VALID_PREFERENCES.has(value)?value:'auto';}catch(_){return 'auto';}
  }
  function storageSet(value){if(!hasDOM)return;try{if(root.localStorage)root.localStorage.setItem(PREFERENCE_KEY,value);}catch(_){}}
  function performanceTier(){
    const perf=root.SevenPerformance;
    if(perf&&perf.state&&typeof perf.state.tier==='string')return perf.state.tier;
    return 'balanced';
  }
  function currentContext(extra){
    return Object.assign({preference:state.preference,reducedMotion:state.reducedMotion,hidden:hasDOM&&doc.hidden,performanceTier:performanceTier(),lowPower:state.lowPower,pressure:state.pressure},extra||{});
  }
  function emit(name,detail){
    if(!hasDOM||typeof root.CustomEvent!=='function')return;
    root.dispatchEvent(new root.CustomEvent(name,{detail:detail||{}}));
  }
  function record(entry){
    state.history.push(Object.assign({at:Date.now()},entry));
    if(state.history.length>80)state.history.splice(0,state.history.length-80);
  }
  function refreshProfile(reason){
    const next=deriveProfile(currentContext());
    const changed=next!==state.profile;state.profile=next;
    if(hasDOM){
      const element=doc.documentElement;
      element.dataset.sevenMotionProfile=next;element.dataset.sevenMotionPreference=state.preference;element.dataset.sevenMotionVersion=VERSION;element.dataset.sevenMotionMode=state.mode;
      element.style.setProperty('--seven-motion-distance',CAPS[next].distance+'px');
      const select=doc.getElementById('sevenMotionPreference');if(select&&select.value!==state.preference)select.value=state.preference;
    }
    if(changed&&active.size){
      const caps=CAPS[next];let kept=0;
      const entries=Array.from(active.values()).sort((a,b)=>a.plan.priority-b.plan.priority||b.id-a.id);
      for(const entry of entries){
        const incompatible=next==='off'||next==='reduced'||(entry.plan.signature&&!caps.signature)||(entry.plan.priority===PRIORITY.AMBIENT&&!caps.ambient)||kept>=caps.concurrent;
        if(incompatible)cancelEntry(entry,'profile-governed');else kept++;
      }
    }
    if(changed)emit('seven:motion-profile',{profile:next,preference:state.preference,reason:reason||'context'});
    return next;
  }
  function setPreference(value){
    if(!VALID_PREFERENCES.has(value))throw new Error('invalid motion preference');
    state.preference=value;storageSet(value);return refreshProfile('preference');
  }
  function setMode(value,origin){
    const mode=['core','build','world','research'].includes(value)?value:'core';
    if(mode===state.mode)return mode;
    const previous=state.mode;state.mode=mode;refreshProfile('mode');
    signal(mode==='world'?'world-entry':'mode-change',{target:doc&&doc.querySelector('.main'),origin,detail:{from:previous,to:mode}});
    return mode;
  }
  function validateFrames(frames){
    if(!Array.isArray(frames)||frames.length<2)return {ok:false,reason:'keyframes-required'};
    for(const frame of frames){
      if(!frame||typeof frame!=='object')return {ok:false,reason:'invalid-keyframe'};
      for(const key of Object.keys(frame))if(!ALLOWED_FRAME_KEYS.has(key))return {ok:false,reason:'forbidden-animated-property:'+key};
    }
    return {ok:true};
  }
  function reducedFrames(frames){
    const stripped=frames.map(frame=>{const next={};for(const key of Object.keys(frame))if(key!=='transform')next[key]=frame[key];return next;});
    if(!stripped.some(frame=>Object.prototype.hasOwnProperty.call(frame,'opacity'))){stripped[0].opacity=.72;stripped[stripped.length-1].opacity=1;}
    return stripped;
  }
  function compileMotion(input,context){
    const request=input||{};const purpose=String(request.purpose||'').toLowerCase();
    if(!PURPOSES.includes(purpose))return {accepted:false,reason:'unexplained-motion'};
    const requestedFamily=String(request.family||'').toLowerCase();
    if(!Object.prototype.hasOwnProperty.call(FAMILY,requestedFamily))return {accepted:false,reason:'unknown-family'};
    const priority=Number.isInteger(request.priority)?request.priority:PRIORITY.SYSTEM;
    if(priority<0||priority>4)return {accepted:false,reason:'invalid-priority'};
    if(priority===PRIORITY.AMBIENT&&!request.stateful)return {accepted:false,reason:'idle-motion-forbidden'};
    const profile=context&&validProfile(context.profile)?context.profile:deriveProfile(Object.assign({},context||{}));const caps=CAPS[profile];
    let family=requestedFamily;if(request.signature&&!caps.signature)family=purpose==='space'?'reveal':'settle';
    const definition=FAMILY[family];let frames=(request.keyframes||definition.frames).map(frame=>Object.assign({},frame));
    const validation=validateFrames(frames);if(!validation.ok)return {accepted:false,reason:validation.reason};
    if(!caps.spatial)frames=reducedFrames(frames);
    let iterations=request.iterations==null?1:request.iterations;
    if(iterations===Infinity&&!request.stateful)return {accepted:false,reason:'unbounded-idle-motion'};
    if(profile==='lite'||profile==='reduced')iterations=1;
    const requestedDuration=Number.isFinite(Number(request.duration))?Number(request.duration):definition.duration;
    const duration=clamp(Math.round(requestedDuration*caps.durationScale),0,caps.maxDuration);
    const delayLimit=caps.stagger===0?0:Math.min(240,caps.maxDuration);
    const delay=clamp(Math.max(0,Number(request.delay)||0),0,delayLimit);
    return {accepted:true,skip:profile==='off'||duration===0,profile,family,requestedFamily,purpose,priority,frames,duration,easing:request.easing||definition.easing,iterations,delay,stateful:!!request.stateful,signature:!!request.signature};
  }
  function finishEntry(entry,outcome){
    if(!entry||entry.done)return;entry.done=true;active.delete(entry.id);
    if(entry.element&&entry.element.dataset&&!Array.from(active.values()).some(item=>item.element===entry.element)){delete entry.element.dataset.sevenMotionActive;entry.element.style.willChange='';}
    record({id:entry.id,key:entry.key,family:entry.plan.family,purpose:entry.plan.purpose,priority:entry.plan.priority,profile:entry.plan.profile,outcome});
    emit('seven:motion-end',{id:entry.id,key:entry.key,family:entry.plan.family,outcome});
  }
  function cancelEntry(entry,outcome){if(!entry)return;try{entry.animation.cancel();}catch(_){}finishEntry(entry,outcome||'cancelled');}
  function arbitrate(plan){
    if(plan.priority===PRIORITY.CRITICAL){for(const entry of Array.from(active.values()))if(entry.plan.priority>=PRIORITY.CONTEXT)cancelEntry(entry,'suppressed');}
    else if(plan.priority===PRIORITY.USER){for(const entry of Array.from(active.values()))if(entry.plan.priority===PRIORITY.AMBIENT)cancelEntry(entry,'suppressed');}
    const budget=CAPS[plan.profile].concurrent;if(active.size<budget)return true;
    const candidate=Array.from(active.values()).sort((a,b)=>b.plan.priority-a.plan.priority)[0];
    if(candidate&&candidate.plan.priority>plan.priority){cancelEntry(candidate,'budget-preempted');return true;}return false;
  }
  function probeFrames(){
    if(!hasDOM||state.frameProbe||state.profile==='off'||state.profile==='reduced')return;
    state.frameProbe=true;let previous=now();const raf=root.requestAnimationFrame||function(callback){return root.setTimeout(()=>callback(now()),16);};
    const tick=time=>{
      const delta=time-previous;previous=time;if(delta>0&&delta<250)state.frameSamples.push(delta);
      if(state.frameSamples.length>120)state.frameSamples.splice(0,state.frameSamples.length-120);
      if(state.frameSamples.length>=24&&state.pressure==='none'){
        const recent=state.frameSamples.slice(-36);const poor=recent.filter(value=>value>27).length/recent.length;const severe=recent.filter(value=>value>42).length/recent.length;
        if(severe>.45){state.pressure='critical';refreshProfile('frame-pressure');}else if(poor>.5){state.pressure='high';refreshProfile('frame-pressure');}
      }
      if(active.size&&state.frameSamples.length<120)raf(tick);else state.frameProbe=false;
    };raf(tick);
  }
  function run(element,input){
    const plan=compileMotion(input,currentContext({profile:state.profile}));
    if(!plan.accepted){record({family:input&&input.family,purpose:input&&input.purpose,outcome:'rejected',reason:plan.reason});return Object.assign({finished:Promise.resolve(plan)},plan);}
    if(!element||typeof element.animate!=='function'||plan.skip){
      const outcome=plan.skip?'profile-off':'animation-api-unavailable';record({family:plan.family,purpose:plan.purpose,profile:plan.profile,outcome});
      return Object.assign({skipped:true,reason:outcome,finished:Promise.resolve(plan)},plan);
    }
    if(plan.priority===PRIORITY.AMBIENT&&(Date.now()<state.ambientSuppressedUntil||!CAPS[plan.profile].ambient)){
      record({family:plan.family,purpose:plan.purpose,profile:plan.profile,outcome:'ambient-suppressed'});
      return Object.assign({skipped:true,reason:'ambient-suppressed',finished:Promise.resolve(plan)},plan);
    }
    const key=String(input.key||'motion-'+state.nextId);for(const entry of Array.from(active.values()))if(entry.key===key)cancelEntry(entry,'replaced');
    if(!arbitrate(plan)){record({key,family:plan.family,purpose:plan.purpose,profile:plan.profile,outcome:'budget-skipped'});return Object.assign({skipped:true,reason:'concurrency-budget',finished:Promise.resolve(plan)},plan);}
    const id=state.nextId++;let animation;
    try{
      element.style.willChange=plan.frames.some(frame=>frame.transform!=null)?'transform, opacity':'opacity';
      animation=element.animate(plan.frames,{duration:plan.duration,easing:plan.easing,iterations:plan.iterations,delay:plan.delay,fill:'none'});
    }catch(error){
      element.style.willChange='';record({key,family:plan.family,outcome:'animation-error',reason:String(error&&error.message||error)});
      return Object.assign({skipped:true,reason:'animation-error',finished:Promise.resolve(plan)},plan);
    }
    const entry={id,key,element,animation,plan,done:false};active.set(id,entry);element.dataset.sevenMotionActive=plan.family;
    emit('seven:motion-start',{id,key,family:plan.family,purpose:plan.purpose,priority:plan.priority,profile:plan.profile});
    const finished=animation.finished.then(()=>{finishEntry(entry,'finished');return plan;},()=>{finishEntry(entry,'cancelled');return plan;});
    probeFrames();return Object.assign({id,animation,finished,cancel:()=>cancelEntry(entry,'cancelled')},plan);
  }
  function stop(key,outcome){for(const entry of Array.from(active.values()))if(entry.key===key)cancelEntry(entry,outcome||'state-ended');}
  function cancelAmbient(){state.ambientSuppressedUntil=Date.now()+220;for(const entry of Array.from(active.values()))if(entry.plan.priority===PRIORITY.AMBIENT)cancelEntry(entry,'interaction-suppressed');}
  function rectCenter(rect){return rect?{x:rect.left+rect.width/2,y:rect.top+rect.height/2}:null;}
  function visible(element){if(!element||!hasDOM)return false;const style=root.getComputedStyle(element);return style.display!=='none'&&style.visibility!=='hidden';}
  function closest(target,selector){return target&&target.closest?target.closest(selector):null;}
  function interactive(target){return closest(target,'button,.room-item,.tool-btn,.regenerate-btn,.settings-row button,.card,[role="button"],[role="tab"],[data-seven-card]');}
  function captureOrigin(target,x,y){
    const element=interactive(target)||target;let point=Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
    if(!point&&element&&element.getBoundingClientRect)point=rectCenter(element.getBoundingClientRect());
    if(point)state.lastOrigin={x:point.x,y:point.y,at:Date.now(),element};return state.lastOrigin;
  }
  function pressStart(event){const element=interactive(event.target);if(!element||state.profile==='off'||state.profile==='reduced')return;captureOrigin(element,event.clientX,event.clientY);element.classList.add('seven-pressing');}
  function pressEnd(){const element=doc.querySelector('.seven-pressing');if(!element)return;element.classList.remove('seven-pressing');if(state.profile==='balanced'||state.profile==='ultra')run(element,{family:'settle',purpose:'cause',priority:PRIORITY.USER,key:'press-settle',duration:150});}
  function captureSendOrigin(){const composer=doc.querySelector('.composer');if(!composer)return;state.sendOrigin=Object.assign(rectCenter(composer.getBoundingClientRect())||{}, {at:Date.now()});}
  function messageNodes(node){if(!node||node.nodeType!==1)return [];const values=[];if(node.matches&&node.matches('.message'))values.push(node);if(node.querySelectorAll)values.push(...node.querySelectorAll('.message'));return values;}
  function boundedDelta(value,limit){return clamp(value,-limit,limit);}
  function revealMessage(message,bulk){
    if(!message||message.dataset.sevenMotionSeen)return;message.dataset.sevenMotionSeen='1';message.dataset.sevenMotionFamily='reveal';if(bulk)return;
    const bubble=message.querySelector('.bubble')||message;run(bubble,{family:'reveal',purpose:'hierarchy',priority:PRIORITY.SYSTEM,key:'message-reveal-'+state.nextId});
  }
  function transferMessage(message){
    const origin=state.sendOrigin;state.sendOrigin=null;const bubble=message&&message.querySelector('.bubble');if(!origin||!bubble||Date.now()-origin.at>1800)return false;
    const target=rectCenter(bubble.getBoundingClientRect());if(!target)return false;const distance=state.profile==='ultra'?180:110;
    const dx=boundedDelta(origin.x-target.x,distance),dy=boundedDelta(origin.y-target.y,distance);bubble.dataset.sevenMotionFamily='transfer';
    run(bubble,{family:'transfer',purpose:'space',priority:PRIORITY.USER,key:'message-transfer',keyframes:[{transform:`translate3d(${dx}px,${dy}px,0) scale(.94)`,opacity:.42},{transform:'translate3d(0,0,0) scale(1)',opacity:1}]});return true;
  }
  function addOrbit(bubble,kind){
    if(!bubble||bubble.querySelector('.seven-activity-orbit'))return;const orbit=doc.createElement('span');orbit.className='seven-activity-orbit';orbit.setAttribute('role','status');orbit.setAttribute('aria-label',kind==='deep'?'Thinking deeply':'Thinking');orbit.dataset.kind=kind||'thinking';orbit.innerHTML='<i></i><i></i><i></i>';
    bubble.prepend(orbit);const message=bubble.closest('.message');if(message)message.setAttribute('data-seven-thinking',kind||'thinking');
  }
  function decorateMessage(message){
    const bubble=message.querySelector('.bubble')||message;if(bubble.querySelector('.typing-dots'))addOrbit(bubble,'thinking');const text=(message.textContent||'').toLowerCase();
    if(message.classList.contains('system')&&(/thinking deeply|deep think|يفكر بعمق/.test(text)))addOrbit(bubble,'deep');
    if(/⚠|\berror\b|\bfailed\b|\bblocked\b|خطأ|فشل|متعذر/.test(text))message.dataset.sevenOutcome='error';
  }
  function revealSources(container){
    if(!container||container.dataset.sevenTopology)return;container.dataset.sevenTopology='1';container.dataset.sevenMotionFamily='reveal';
    const items=Array.from(container.querySelectorAll('li')).slice(0,Math.max(1,CAPS[state.profile].concurrent));const stagger=CAPS[state.profile].stagger;
    if(!items.length){run(container,{family:'reveal',purpose:'hierarchy',priority:PRIORITY.SYSTEM,key:'research-source'});return;}
    items.forEach((item,index)=>run(item,{family:'reveal',purpose:'cause',priority:PRIORITY.SYSTEM,key:'research-source-'+index,delay:index*stagger,duration:180}));
  }
  function finishMessage(button){
    const message=button&&button.closest('.message.assistant');if(!message||message.dataset.sevenCompletion)return;message.dataset.sevenCompletion='1';const bubble=message.querySelector('.bubble')||message;
    bubble.querySelector('.seven-activity-orbit')?.remove();delete message.dataset.sevenThinking;
    run(bubble,{family:'settle',purpose:'state',priority:PRIORITY.SYSTEM,key:'assistant-complete'});
  }
  function scheduleDomWork(key,task){const perf=root.SevenPerformance;if(perf&&typeof perf.batchFrame==='function')perf.batchFrame(key,task);else (root.requestAnimationFrame||root.setTimeout)(task);}
  function watchChat(){
    const chat=doc.getElementById('chat');if(!chat)return null;
    const observer=new MutationObserver(records=>scheduleDomWork('seven-motion-chat',()=>{
      const messages=[],sources=[],buttons=[],empty=[];
      for(const record of records)for(const node of record.addedNodes){
        messages.push(...messageNodes(node));if(node.nodeType!==1)continue;
        if(node.matches&&node.matches('.search-sources'))sources.push(node);if(node.querySelectorAll)sources.push(...node.querySelectorAll('.search-sources'));
        if(node.matches&&node.matches('.regenerate-btn'))buttons.push(node);if(node.querySelectorAll)buttons.push(...node.querySelectorAll('.regenerate-btn'));
        if(node.matches&&node.matches('.empty-state'))empty.push(node);if(node.querySelectorAll)empty.push(...node.querySelectorAll('.empty-state'));
      }
      const unique=Array.from(new Set(messages));const restoredBatch=unique.length>1;
      unique.forEach((message,index)=>{decorateMessage(message);const last=index===unique.length-1;if(message.classList.contains('user')&&last&&transferMessage(message))message.dataset.sevenMotionSeen='1';else revealMessage(message,restoredBatch&&!last);});
      Array.from(new Set(sources)).forEach(revealSources);Array.from(new Set(buttons)).forEach(finishMessage);Array.from(new Set(empty)).forEach(node=>run(node,{family:'reveal',purpose:'hierarchy',priority:PRIORITY.CONTEXT,key:'empty-state'}));
    }));
    observer.observe(chat,{childList:true,subtree:true});state.observers.push(observer);return observer;
  }
  function animateSidebar(opening){
    const sidebar=doc.getElementById('sidebar');if(!sidebar)return;
    const mobile=root.innerWidth<=720;
    if(!mobile&&opening)run(sidebar,{family:'glide',purpose:'space',priority:PRIORITY.USER,key:'sidebar-shell',duration:220,keyframes:[{transform:'translate3d(-10px,0,0)',opacity:.7},{transform:'translate3d(0,0,0)',opacity:1}]});
    if(opening&&state.profile!=='lite'){
      const limit=Math.max(1,CAPS[state.profile].concurrent-(mobile?0:1));
      Array.from(sidebar.querySelectorAll('.sidebar-header,.new-chat-btn,.sidebar-section-label,.room-item,.sidebar-footer')).slice(0,limit).forEach((item,index)=>run(item,{family:'reveal',purpose:'hierarchy',priority:PRIORITY.CONTEXT,key:'sidebar-item-'+index,delay:index*CAPS[state.profile].stagger,duration:170}));
    }
  }
  function watchSidebar(){
    const sidebar=doc.getElementById('sidebar');if(!sidebar)return null;let collapsed=sidebar.classList.contains('collapsed');
    const observer=new MutationObserver(()=>{const next=sidebar.classList.contains('collapsed');if(next===collapsed)return;collapsed=next;animateSidebar(!next);});
    observer.observe(sidebar,{attributes:true,attributeFilter:['class']});state.observers.push(observer);return observer;
  }
  function modalOriginFrames(content,closing){
    const rect=content.getBoundingClientRect(),center=rectCenter(rect),origin=state.lastOrigin;const dx=origin&&center?boundedDelta((origin.x-center.x)*.12,18):0;const dy=origin&&center?boundedDelta((origin.y-center.y)*.12,18):10;
    if(origin&&rect){content.style.transformOrigin=clamp(origin.x-rect.left,0,rect.width)+'px '+clamp(origin.y-rect.top,0,rect.height)+'px';}
    return closing?[{transform:'translate3d(0,0,0) scale(1)',opacity:1},{transform:`translate3d(${dx}px,${dy}px,0) scale(.982)`,opacity:0}]:[{transform:`translate3d(${dx}px,${dy}px,0) scale(.975)`,opacity:0},{transform:'translate3d(0,0,0) scale(1)',opacity:1}];
  }
  function animateModalOpen(modal){
    const content=modal.querySelector('.modal-content');if(!content)return;modal.dataset.sevenModalState='opening';
    run(modal,{family:'reveal',purpose:'hierarchy',priority:PRIORITY.USER,key:'modal-backdrop',duration:170,keyframes:[{opacity:0},{opacity:1}]});
    const handle=run(content,{family:'glide',purpose:'space',priority:PRIORITY.USER,key:'modal-content',keyframes:modalOriginFrames(content,false)});
    handle.finished.then(()=>{if(modal.isConnected&&visible(modal))modal.dataset.sevenModalState='open';});
  }
  function watchModals(){
    doc.querySelectorAll('.modal').forEach(modal=>{let wasVisible=visible(modal);const observer=new MutationObserver(()=>{const isVisible=visible(modal);if(isVisible&&!wasVisible)animateModalOpen(modal);wasVisible=isVisible;});observer.observe(modal,{attributes:true,attributeFilter:['style','class']});state.observers.push(observer);if(wasVisible)animateModalOpen(modal);});
  }
  function wrapModalClose(){
    if(typeof root.closeSettings!=='function'||root.closeSettings.__sevenMotionWrapped)return;const original=root.closeSettings;
    function wrapped(){
      const args=arguments,modal=doc.getElementById('settingsModal'),content=modal&&modal.querySelector('.modal-content');
      if(!modal||!content||!visible(modal)||modal.dataset.sevenModalState==='closing'||state.profile==='off')return original.apply(this,args);
      modal.dataset.sevenModalState='closing';modal.style.pointerEvents='none';
      const first=run(content,{family:'collapse',purpose:'space',priority:PRIORITY.USER,key:'modal-content-close',keyframes:modalOriginFrames(content,true)});
      const second=run(modal,{family:'collapse',purpose:'hierarchy',priority:PRIORITY.USER,key:'modal-backdrop-close',duration:150,keyframes:[{opacity:1},{opacity:0}]});
      Promise.all([first.finished,second.finished]).finally(()=>{modal.style.pointerEvents='';delete modal.dataset.sevenModalState;original.apply(root,args);});
    }
    wrapped.__sevenMotionWrapped=true;root.closeSettings=wrapped;
  }
  function createLayer(className,signature){const layer=doc.createElement('div');layer.className=className;layer.setAttribute('aria-hidden','true');if(signature)layer.dataset.sevenSignature=signature;doc.body.appendChild(layer);return layer;}
  function removeAfter(layer,handles,padding){const promises=(handles||[]).map(handle=>handle&&handle.finished).filter(Boolean);Promise.all(promises).finally(()=>{layer.style.opacity='0';root.setTimeout(()=>layer.remove(),padding||20);});}
  function sevenWake(){
    if(!['ultra','balanced'].includes(state.profile))return;
    try{if(root.sessionStorage&&root.sessionStorage.getItem('seven_motion_wake_v3'))return;if(root.sessionStorage)root.sessionStorage.setItem('seven_motion_wake_v3','1');}catch(_){}
    const layer=createLayer('seven-wake','wake');layer.innerHTML='<span class="seven-wake-mark"><i class="seven-wake-cut"></i><i class="seven-wake-stem"></i><i class="seven-wake-orbit"></i></span>';
    const mark=layer.firstElementChild,orbit=mark.querySelector('.seven-wake-orbit');
    const intro=run(layer,{family:'reveal',purpose:'hierarchy',priority:PRIORITY.CONTEXT,key:'seven-wake-layer',signature:true,duration:560,keyframes:[{opacity:0},{opacity:1,offset:.28},{opacity:1,offset:.72},{opacity:0}]});
    const form=run(mark,{family:'settle',purpose:'state',priority:PRIORITY.CONTEXT,key:'seven-wake-mark',signature:true,duration:480,keyframes:[{transform:'scale(.82) rotate(-5deg)',opacity:0},{transform:'scale(1) rotate(0deg)',opacity:1}]});
    const turn=run(orbit,{family:'orbit',purpose:'cause',priority:PRIORITY.CONTEXT,key:'seven-wake-orbit',signature:true,duration:520});removeAfter(layer,[intro,form,turn],30);
  }
  function celestialShift(){
    if(!['ultra','balanced'].includes(state.profile))return;doc.querySelectorAll('.seven-celestial-shift').forEach(node=>node.remove());
    const layer=createLayer('seven-celestial-shift','celestial-shift'),light=doc.body.classList.contains('light');layer.dataset.theme=light?'light':'dark';layer.innerHTML='<span class="seven-celestial-core"></span><span class="seven-celestial-orbit"></span>';
    const origin=state.lastOrigin||{x:root.innerWidth*.82,y:root.innerHeight*.12};layer.style.setProperty('--seven-origin-x',origin.x+'px');layer.style.setProperty('--seven-origin-y',origin.y+'px');
    const veil=run(layer,{family:'reveal',purpose:'state',priority:PRIORITY.USER,key:'celestial-veil',signature:true,duration:560,keyframes:[{opacity:0,transform:'scale(.985)'},{opacity:1,transform:'scale(1)',offset:.38},{opacity:0,transform:'scale(1.018)'}]});
    const orbit=run(layer.querySelector('.seven-celestial-orbit'),{family:'orbit',purpose:'cause',priority:PRIORITY.USER,key:'celestial-orbit',signature:true,duration:520});removeAfter(layer,[veil,orbit],20);
  }
  function watchTheme(){let light=doc.body.classList.contains('light');const observer=new MutationObserver(()=>{const next=doc.body.classList.contains('light');if(next===light)return;light=next;celestialShift();});observer.observe(doc.body,{attributes:true,attributeFilter:['class']});state.observers.push(observer);return observer;}
  function transientSignature(kind){
    if(state.profile==='off'||state.profile==='reduced')return null;
    if(state.profile==='lite')return run(doc.querySelector('.main'),{family:'reveal',purpose:kind==='canon-divergence'?'cause':'state',priority:PRIORITY.CONTEXT,key:'signature-lite-'+kind,duration:150});
    const layer=createLayer('seven-signature-layer seven-signature-'+kind,kind);layer.dataset.mode=state.mode;
    if(kind==='canon-divergence')layer.innerHTML='<span class="seven-branch-anchor"></span><span class="seven-branch-path a"></span><span class="seven-branch-path b"></span>';
    else if(kind==='world-entry')layer.innerHTML='<span class="seven-world-ring"></span><span class="seven-world-horizon"></span>';
    else layer.innerHTML='<span class="seven-completion-ring"></span><span class="seven-completion-cut"></span>';
    const handle=run(layer,{family:kind==='canon-divergence'?'transfer':'settle',purpose:kind==='canon-divergence'?'cause':'state',priority:kind==='agent-completion'?PRIORITY.SYSTEM:PRIORITY.CONTEXT,key:'signature-'+kind,signature:true,duration:state.profile==='ultra'?620:470,keyframes:[{transform:'scale(.92)',opacity:0},{transform:'scale(1)',opacity:1,offset:.42},{transform:'scale(1.025)',opacity:0}]});removeAfter(layer,[handle],20);return handle;
  }
  function toolIndicator(target,detail){
    const host=target||doc.querySelector('.composer');if(!host)return null;let indicator=host.querySelector(':scope > .seven-tool-path');
    if(!indicator){indicator=doc.createElement('span');indicator.className='seven-tool-path';indicator.setAttribute('role','status');indicator.setAttribute('aria-live','polite');indicator.innerHTML='<i></i><i></i><i></i>';host.appendChild(indicator);}const stage=String(detail&&detail.stage||'running');indicator.dataset.stage=stage;indicator.setAttribute('aria-label','Seven is '+stage);host.setAttribute('aria-busy','true');return indicator;
  }
  function clearToolIndicator(target){const host=target||doc.querySelector('.composer'),indicator=host&&host.querySelector(':scope > .seven-tool-path');if(indicator)indicator.remove();if(host)host.removeAttribute('aria-busy');}
  function errorFeedback(target){
    const element=target||doc.querySelector('.composer');if(!element)return null;element.dataset.sevenOutcome='error';root.setTimeout(()=>{if(element.dataset.sevenOutcome==='error')delete element.dataset.sevenOutcome;},720);
    return run(element,{family:'pulse',purpose:'state',priority:PRIORITY.CRITICAL,key:'error-feedback',duration:250,keyframes:[{opacity:1},{opacity:.86},{opacity:1}]});
  }
  function codingDiff(target){
    const host=target||doc.querySelector('[data-seven-diff],.diff');if(!host)return null;const lines=Array.from(host.querySelectorAll('[data-line],.diff-line,li')).slice(0,16);
    lines.forEach((line,index)=>run(line,{family:'reveal',purpose:'cause',priority:PRIORITY.SYSTEM,key:'diff-line-'+index,delay:index*CAPS[state.profile].stagger,duration:160}));return lines.length;
  }
  function signal(name,options){
    if(!hasDOM)return null;const opts=options||{},target=opts.target||null;
    switch(name){
      case 'thinking':case 'deep-think':addOrbit(target||doc.querySelector('.message:last-child .bubble'),name==='deep-think'?'deep':'thinking');return true;
      case 'tool-run':return toolIndicator(target,opts.detail);
      case 'tool-complete':clearToolIndicator(target);return true;
      case 'success':return run(target||doc.querySelector('.composer'),{family:'settle',purpose:'state',priority:PRIORITY.SYSTEM,key:'success'});
      case 'agent-completion':return transientSignature('agent-completion');
      case 'error':return errorFeedback(target);
      case 'retry':return run(target,{family:'transfer',purpose:'cause',priority:PRIORITY.USER,key:'retry',keyframes:[{transform:'translate3d(-7px,0,0)',opacity:.68},{transform:'translate3d(0,0,0)',opacity:1}]});
      case 'delete':return run(target,{family:'collapse',purpose:'cause',priority:PRIORITY.USER,key:'delete'});
      case 'undo':return run(target,{family:'transfer',purpose:'cause',priority:PRIORITY.USER,key:'undo',keyframes:[{transform:'scale(.94)',opacity:0},{transform:'scale(1)',opacity:1}]});
      case 'world-entry':return transientSignature('world-entry');
      case 'world-scene-change':return run(target||doc.querySelector('.main'),{family:'glide',purpose:'state',priority:PRIORITY.CONTEXT,key:'world-scene',signature:true,duration:360,keyframes:[{opacity:.68,transform:'translate3d(0,5px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}]});
      case 'canon-divergence':return transientSignature('canon-divergence');
      case 'research-topology':return revealSources(target||doc.querySelector('.search-sources'));
      case 'coding-diff':return codingDiff(target);
      case 'menu-open':return run(target,{family:'glide',purpose:'space',priority:PRIORITY.USER,key:'menu-open',duration:180,keyframes:[{transform:'scale(.975) translate3d(0,-3px,0)',opacity:0},{transform:'scale(1) translate3d(0,0,0)',opacity:1}]});
      case 'tab-change':return run(target,{family:'transfer',purpose:'hierarchy',priority:PRIORITY.USER,key:'tab-indicator',duration:190});
      case 'drag-start':if(target)target.classList.add('seven-dragging');return target;
      case 'drag-end':if(target)target.classList.remove('seven-dragging');return run(target,{family:'settle',purpose:'space',priority:PRIORITY.USER,key:'drag-settle',duration:170});
      case 'loading-start':if(target)target.setAttribute('data-seven-skeleton','');return target;
      case 'loading-end':if(target)target.removeAttribute('data-seven-skeleton');return run(target,{family:'reveal',purpose:'state',priority:PRIORITY.SYSTEM,key:'loading-complete'});
      case 'mode-change':{
        const expression=state.mode==='build'?{family:'snap',purpose:'cause',duration:150}:state.mode==='research'?{family:'reveal',purpose:'hierarchy',duration:230}:{family:'glide',purpose:'hierarchy',duration:210};
        return run(target||doc.querySelector('.main'),Object.assign(expression,{priority:PRIORITY.CONTEXT,key:'mode-change'}));
      }
      default:return null;
    }
  }
  function executionState(event){
    const detail=event&&event.detail||{},key=String(detail.runId||'run')+':'+String(detail.stepId||'step');
    if(detail.status==='running'){
      state.executionSteps.set(key,{at:Date.now(),stepId:detail.stepId});doc.documentElement.dataset.sevenExecutionStage=String(detail.stepId||'running');signal('tool-run',{target:doc.querySelector('.composer'),detail:{stage:detail.stepId}});
    }else{
      state.executionSteps.delete(key);if(!state.executionSteps.size){clearToolIndicator();delete doc.documentElement.dataset.sevenExecutionStage;}
      if(detail.status==='failed'||detail.status==='blocked')signal('error',{target:doc.querySelector('.composer')});
      if(detail.stepId==='result'&&detail.status==='passed'){const significant=Number(detail.runStepCount||0)>=6||Number(detail.runAgeMs||0)>=6000;signal(significant?'agent-completion':'success',{target:doc.querySelector('.composer'),detail});}
    }
  }
  function installSettings(){
    if(doc.getElementById('sevenMotionPreference'))return;const modal=doc.querySelector('#settingsModal .modal-content');if(!modal)return;const buttons=modal.querySelector('.modal-buttons'),group=doc.createElement('div');group.className='seven-motion-setting';group.dataset.sevenComponent='motion-preference';
    const label=doc.createElement('label');label.htmlFor='sevenMotionPreference';label.textContent='Motion quality';const select=doc.createElement('select');select.id='sevenMotionPreference';select.setAttribute('aria-describedby','sevenMotionPreferenceNote');
    [['auto','Auto · Balanced default'],['ultra','Ultra'],['balanced','Balanced'],['lite','Lite'],['reduced','Reduced Motion'],['off','Off']].forEach(([value,text])=>{const option=doc.createElement('option');option.value=value;option.textContent=text;select.appendChild(option);});
    select.value=state.preference;select.addEventListener('change',()=>setPreference(select.value));const note=doc.createElement('div');note.id='sevenMotionPreferenceNote';note.className='seven-motion-setting-note';note.textContent='Seven may lower motion automatically for accessibility, battery, visibility, or sustained frame pressure. Features never change.';
    group.append(label,select,note);modal.insertBefore(group,buttons||null);
  }
  function initBattery(){
    if(!root.navigator||typeof root.navigator.getBattery!=='function')return;
    root.navigator.getBattery().then(battery=>{const update=()=>{state.batteryLevel=Number(battery.level);state.lowPower=!battery.charging&&battery.level<=.18;refreshProfile('battery');};update();battery.addEventListener('levelchange',update);battery.addEventListener('chargingchange',update);}).catch(()=>{});
  }
  function bindEnvironment(){
    const media=root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)');state.reducedMotion=!!(media&&media.matches);
    if(media){const change=event=>{state.reducedMotion=!!event.matches;refreshProfile('reduced-motion');};if(media.addEventListener)media.addEventListener('change',change);else if(media.addListener)media.addListener(change);}
    doc.addEventListener('visibilitychange',()=>refreshProfile('visibility'),{passive:true});doc.addEventListener('scroll',cancelAmbient,{passive:true,capture:true});
    doc.addEventListener('pointerdown',event=>{pressStart(event);if(closest(event.target,'#sendBtn'))captureSendOrigin();},{passive:true,capture:true});
    doc.addEventListener('pointerup',pressEnd,{passive:true});doc.addEventListener('pointercancel',pressEnd,{passive:true});doc.addEventListener('dragstart',pressEnd,{passive:true});
    doc.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&closest(event.target,'#userInput'))captureSendOrigin();},{capture:true});
    doc.addEventListener('click',event=>{captureOrigin(event.target,event.clientX,event.clientY);},{passive:true,capture:true});
    root.addEventListener('seven:execution-state',executionState);root.addEventListener('seven:motion-request',event=>{const detail=event.detail||{};signal(detail.name,detail);});
    root.addEventListener('seven:performance-tier',()=>refreshProfile('performance-tier'));
    root.addEventListener('seven:world-entry',event=>signal('world-entry',{detail:event.detail}));root.addEventListener('seven:world-scene-change',event=>signal('world-scene-change',{detail:event.detail}));root.addEventListener('seven:canon-divergence',event=>signal('canon-divergence',{detail:event.detail}));
    root.addEventListener('seven:research-topology',event=>signal('research-topology',{target:event.detail&&event.detail.target,detail:event.detail}));root.addEventListener('seven:coding-diff',event=>signal('coding-diff',{target:event.detail&&event.detail.target,detail:event.detail}));root.addEventListener('seven:mode-change',event=>setMode(event.detail&&event.detail.mode,event.detail&&event.detail.origin));
  }
  function boot(){
    if(!hasDOM||state.ready)return state;state.preference=storageGet();const media=root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)');state.reducedMotion=!!(media&&media.matches);
    refreshProfile('boot');bindEnvironment();installSettings();watchChat();watchSidebar();watchModals();watchTheme();wrapModalClose();initBattery();doc.documentElement.classList.add('seven-motion-ready');state.ready=true;root.setTimeout(sevenWake,0);return state;
  }
  function snapshot(){return {ready:state.ready,version:VERSION,preference:state.preference,profile:state.profile,mode:state.mode,reducedMotion:state.reducedMotion,lowPower:state.lowPower,batteryLevel:state.batteryLevel,pressure:state.pressure,active:active.size,history:state.history.slice()};}

  const api=Object.freeze({VERSION,PRIORITY,PURPOSES,FAMILY,CAPS,state,deriveProfile,compileMotion,run,stop,signal,setMode,setPreference,refresh:refreshProfile,snapshot,boot});
  if(hasDOM){if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});else boot();}
  return api;
});
