'use strict';
const {attachOpenAIProvider}=require('./browser-providers.js');
const {configureStoredProviders,installProviderSettings}=require('./browser-provider-settings.js');
const {renderRuntimeSurfaces,removeDemoState}=require('./browser-surfaces.js');
function attachConfiguredProviders(os){configureStoredProviders(os);const t=globalThis.__SEVEN_TEST_PROVIDER__;if(t?.baseUrl&&t?.model)attachOpenAIProvider(os,{id:'__test__',name:'Test',baseUrl:t.baseUrl,modelId:t.model,local:true,freeProof:'verified_free',quality:.99,speed:1,latencyMs:1});}
function renderChat(shell,state){const stream=document.querySelector('[data-chat-stream]');if(!stream)return;stream.innerHTML='';if(!state.messages.length){shell.addMessage('ai','Seven Ultimate runtime is connected. Connect a free provider in Settings to begin.');return;}for(const m of state.messages){if(m.role==='user')shell.addMessage('user',m.content);if(m.role==='assistant')shell.addMessage('ai',m.content);}}
function hydrateBrowserUI(os,state,shell){renderChat(shell,state);removeDemoState(os);installProviderSettings(os,shell);renderRuntimeSurfaces(os);document.querySelectorAll('[data-view-target]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(()=>renderRuntimeSurfaces(os))));}
module.exports={attachConfiguredProviders,renderChat,hydrateBrowserUI};
