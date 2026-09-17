(function(r){
'use strict';
if(!r||!r.document)return;
var d=r.document;
var MAX_TEXT_BYTES=8*1024*1024;
var TEXT_EXT={txt:1,md:1,markdown:1,rtf:1,csv:1,tsv:1,json:1,jsonl:1,xml:1,yaml:1,yml:1,toml:1,ini:1,cfg:1,conf:1,log:1,html:1,htm:1,css:1,scss:1,sass:1,less:1,js:1,mjs:1,cjs:1,ts:1,tsx:1,jsx:1,py:1,java:1,kt:1,kts:1,c:1,h:1,cpp:1,hpp:1,cc:1,cs:1,go:1,rs:1,rb:1,php:1,swift:1,sh:1,bash:1,zsh:1,fish:1,ps1:1,sql:1,graphql:1,gql:1,vue:1,svelte:1,dart:1,lua:1,r:1,tex:1,bib:1,srt:1,vtt:1,ass:1,ssa:1,env:1,gitignore:1,dockerfile:1,makefile:1};
var CATEGORY_EXT={
 image:'jpg jpeg png gif webp bmp avif heic heif svg ico tif tiff'.split(' '),
 video:'mp4 mkv mov avi webm m4v 3gp mpg mpeg ts mts'.split(' '),
 audio:'mp3 wav flac m4a aac ogg opus wma mid midi'.split(' '),
 archive:'zip rar 7z tar gz bz2 xz tgz tbz apk jar war'.split(' '),
 document:'doc docx odt pages'.split(' '),
 spreadsheet:'xls xlsx ods numbers'.split(' '),
 presentation:'ppt pptx odp key'.split(' '),
 ebook:'epub mobi azw azw3 fb2'.split(' '),
 font:'ttf otf woff woff2'.split(' '),
 model3d:'obj fbx glb gltf stl blend 3ds dae'.split(' '),
 cad:'dwg dxf step stp iges igs'.split(' '),
 executable:'exe msi appimage deb rpm dmg'.split(' '),
 disk:'iso img vhd vhdx qcow qcow2'.split(' ')
};
var S={version:'1.0.0-beta.1',ready:false,open:false,lastSelection:[],lastCategory:null};
function q(sel){return d.querySelector(sel)}
function ext(name){name=String(name||'');var i=name.lastIndexOf('.');return i>=0?name.slice(i+1).toLowerCase():name.toLowerCase()}
function category(file){var type=String(file&&file.type||'').toLowerCase(),e=ext(file&&file.name);if(type==='application/pdf'||e==='pdf')return'pdf';if(type.indexOf('image/')===0)return'image';if(type.indexOf('video/')===0)return'video';if(type.indexOf('audio/')===0)return'audio';if(type.indexOf('text/')===0||TEXT_EXT[e])return'text';for(var k in CATEGORY_EXT)if(CATEGORY_EXT[k].indexOf(e)>=0)return k;return'other'}
function humanBytes(n){n=Number(n)||0;if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(n<10240?1:0)+' KB';if(n<1073741824)return(n/1048576).toFixed(n<10485760?1:0)+' MB';return(n/1073741824).toFixed(1)+' GB'}
function metadataText(file,cat,reason){var lines=['[Seven attachment]','Name: '+String(file&&file.name||'Unnamed file'),'Type: '+String(file&&file.type||'application/octet-stream'),'Category: '+cat,'Size: '+humanBytes(file&&file.size)];if(reason)lines.push('Local extraction: '+reason);lines.push('The original binary file was selected by the user. Seven preserved its identity and metadata without converting binary bytes into fake text.');return lines.join('\n')}
function readText(file){return new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(typeof reader.result==='string'?reader.result:'')};reader.onerror=function(){reject(reader.error||new Error('Could not read file'))};reader.readAsText(file)})}
async function extractForKnowledge(file,extractPdfText,readTextFile){var cat=category(file),name=String(file&&file.name||'file');if(cat==='pdf'&&typeof extractPdfText==='function')return{text:await extractPdfText(file),method:'pdfjs_text',category:cat};if(cat==='text'){if(Number(file&&file.size)>MAX_TEXT_BYTES)return{text:metadataText(file,cat,'Text file is larger than the lightweight local extraction limit of 8 MB.'),method:'attachment_metadata_large_text',category:cat};var fn=typeof readTextFile==='function'?readTextFile:readText;return{text:await fn(file),method:'text_file',category:cat}}return{text:metadataText(file,cat,'Binary format kept as an attachment; content parsing is deferred to a compatible capability.'),method:'attachment_metadata_'+cat,category:cat,name:name}}
function close(){var menu=q('.seven-attach-menu'),btn=q('[data-seven-attach-trigger]');S.open=false;if(menu)menu.hidden=true;if(btn)btn.setAttribute('aria-expanded','false')}
function openFor(kind){var input=q('#fileInput');if(!input)return;S.lastCategory=kind;input.setAttribute('accept',kind==='photos'?'image/*,video/*':'*/*');input.multiple=true;close();input.click()}
function renderSelection(files){S.lastSelection=files.map(function(f){return{name:f.name,type:f.type||'application/octet-stream',size:Number(f.size)||0,category:category(f)}});var strip=q('.seven-attachment-strip');if(!strip){var composer=q('.composer');if(!composer)return;strip=d.createElement('div');strip.className='seven-attachment-strip';strip.setAttribute('aria-live','polite');composer.appendChild(strip)}strip.innerHTML='';for(var i=0;i<S.lastSelection.length;i++){var item=S.lastSelection[i],chip=d.createElement('span');chip.className='seven-attachment-chip';chip.dataset.kind=item.category;chip.textContent=item.name+' · '+humanBytes(item.size);strip.appendChild(chip)}}
function clearSelection(){S.lastSelection=[];var strip=q('.seven-attachment-strip');if(strip)strip.innerHTML=''}
function build(){var tools=q('.composer-tools'),input=q('#fileInput');if(!tools||!input)return false;input.setAttribute('accept','*/*');input.multiple=true;var attach=tools.querySelector('.tool-btn:not(.toggle)');if(!attach)return false;attach.dataset.sevenAttachTrigger='1';attach.title='Attach photos or files';attach.setAttribute('aria-label','Attach photos or files');attach.setAttribute('aria-haspopup','menu');attach.setAttribute('aria-expanded','false');var host=q('.seven-attach-host');if(!host){host=d.createElement('div');host.className='seven-attach-host';attach.parentNode.insertBefore(host,attach);host.appendChild(attach);var menu=d.createElement('div');menu.className='seven-attach-menu';menu.hidden=true;menu.setAttribute('role','menu');menu.setAttribute('aria-label','Attach');menu.innerHTML='<button type="button" role="menuitem" data-seven-attach="photos"><span aria-hidden="true">▣</span><span><strong>Photos</strong><small>Images and videos</small></span></button><button type="button" role="menuitem" data-seven-attach="files"><span aria-hidden="true">⌁</span><span><strong>Files</strong><small>Any file type</small></span></button>';host.appendChild(menu)}
var menu=q('.seven-attach-menu');attach.onclick=function(ev){if(ev){ev.preventDefault();ev.stopPropagation()}S.open=!S.open;if(menu)menu.hidden=!S.open;attach.setAttribute('aria-expanded',S.open?'true':'false')};var photos=menu&&menu.querySelector('[data-seven-attach="photos"]'),files=menu&&menu.querySelector('[data-seven-attach="files"]');if(photos)photos.onclick=function(ev){ev.stopPropagation();openFor('photos')};if(files)files.onclick=function(ev){ev.stopPropagation();openFor('files')};if(!input.dataset.sevenAttachmentBound){input.dataset.sevenAttachmentBound='1';input.addEventListener('change',function(){var list=Array.prototype.slice.call(input.files||[]);if(list.length)renderSelection(list);setTimeout(function(){input.setAttribute('accept','*/*')},0)},true)}return true}
function patchSend(){if(typeof r.sendMessage!=='function'||r.sendMessage.sevenAttachmentPatched)return;var original=r.sendMessage;var wrapped=async function(){try{return await original.apply(this,arguments)}finally{clearSelection()}};wrapped.sevenAttachmentPatched=true;wrapped.previous=original;r.sendMessage=wrapped}
function events(){if(S.events)return;S.events=true;d.addEventListener('click',function(ev){var host=q('.seven-attach-host');if(S.open&&host&&!host.contains(ev.target))close()});d.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&S.open){close();var btn=q('[data-seven-attach-trigger]');if(btn)btn.focus()}})}
function boot(){build();patchSend();events();S.ready=true;d.documentElement.dataset.sevenAttachments='v1';return S}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
r.SevenAttachments={version:S.version,state:S,boot:boot,category:category,extractForKnowledge:extractForKnowledge,openPhotos:function(){openFor('photos')},openFiles:function(){openFor('files')},close:close,clearSelection:clearSelection};
})(typeof globalThis!=='undefined'?globalThis:this);
