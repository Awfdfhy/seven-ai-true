(function(r){
'use strict';
if(!r||!r.document)return;
var d=r.document,S={version:'1.2.0',loading:null,replaying:false};
function ready(){return r.SevenAttachments&&typeof r.SevenAttachments.boot==='function'}
function load(){
  if(ready())return Promise.resolve(r.SevenAttachments);
  if(S.loading)return S.loading;
  S.loading=new Promise(function(resolve,reject){
    var old=d.getElementById('seven-attachment-runtime-lazy');
    if(old){old.addEventListener('load',done,{once:true});old.addEventListener('error',fail,{once:true});return}
    var s=d.createElement('script');s.id='seven-attachment-runtime-lazy';s.src='./attachment-runtime.js';s.async=true;s.onload=done;s.onerror=fail;d.head.appendChild(s);
    function done(){if(!ready()){S.loading=null;return reject(new Error('Attachment runtime did not register'))}try{r.SevenAttachments.boot()}catch(_){}resolve(r.SevenAttachments)}
    function fail(){S.loading=null;reject(new Error('Attachment runtime could not be loaded'))}
  });
  return S.loading;
}
function triggerFrom(node){return node&&node.closest?node.closest('[data-seven-attach-trigger],.composer-tools .tool-btn:not(.toggle)'):null}
function warm(ev){
  if(ready())return;
  var btn=triggerFrom(ev.target);if(!btn)return;
  load().catch(function(){});
}
function click(ev){
  if(ready()||S.replaying)return;
  var btn=triggerFrom(ev.target);if(!btn)return;
  /* A cold paperclip tap only opens Seven's attachment menu. It must not
     attempt to open the native file picker after an async boundary. Consume
     this cold click, finish the lazy boot, then replay only the menu trigger.
     The subsequent Photos/Files tap remains a fresh trusted user gesture and
     opens #fileInput synchronously inside attachment-runtime.js. */
  ev.preventDefault();ev.stopPropagation();
  load().then(function(){
    var live=d.querySelector('[data-seven-attach-trigger]')||btn;
    if(!live||!live.isConnected)return;
    S.replaying=true;
    try{live.click()}finally{S.replaying=false}
  }).catch(function(){});
}
function paste(ev){
  if(ready())return;
  var files=ev.clipboardData&&ev.clipboardData.files;if(!files||!files.length)return;
  load().then(function(api){api.ingestFiles(files,'paste')}).catch(function(){});
}
function drag(ev){
  if(ready())return;
  var types=ev.dataTransfer&&ev.dataTransfer.types;if(!types)return;
  try{if(Array.prototype.indexOf.call(types,'Files')>=0)load().catch(function(){})}catch(_){}
}
d.addEventListener('pointerdown',warm,true);
d.addEventListener('touchstart',warm,{capture:true,passive:true});
d.addEventListener('click',click,true);d.addEventListener('paste',paste,true);d.addEventListener('dragenter',drag,true);
r.SevenAttachmentLoader={version:S.version,state:S,load:load};
})(typeof globalThis!='undefined'?globalThis:this);