'use strict';
const {SevenUltimateOS}=require('./runtime.js');
const {attachModelAgentV2}=require('./model-agent-extension.js');
const {CapabilityPlatform}=require('./frontier-capability-bridge.js');
const {attachFullStack}=require('./full-stack-extension.js');
const {BrowserState}=require('./browser-state.js');
const {BrowserRuntimeFacade}=require('./browser-runtime-facade.js');
const {attachConfiguredProviders,hydrateBrowserUI,renderChat}=require('./browser-bootstrap.js');
const {mount}=require('./ui/ultimate-shell.js');
const BUILD='seven-ultimate-integrated-v1';
async function boot(){const os=attachFullStack(new SevenUltimateOS()),state=new BrowserState(os),warnings=await state.restore();attachFullStack(os);attachConfiguredProviders(os);attachModelAgentV2(os,{sessionId:'seven-default-chat'});const capabilities=new CapabilityPlatform();capabilities.migrateLegacy(os.tools,os.toolExecutors,{grantReadScope:'*'});os.capabilityPlatform=capabilities;os.controller.frontierToolLoop=capabilities.createToolLoop(os.providers);const facade=new BrowserRuntimeFacade(os,state),shell=mount('#seven-app',{runtime:facade,initialView:(location.hash||'#home').slice(1)});hydrateBrowserUI(os,state,shell);const api={build:BUILD,ready:true,os,state,shell,facade,capabilities,status:()=>({ready:true,build:BUILD,warnings:[...warnings],...state.snapshot(),runtime:os.snapshot(),deepPlan:os.deepPlanSnapshot()}),save:()=>Promise.all([state.saveChat(),state.saveSystem()]),createRpg:async input=>{const ids=os.createRpg(input||{});if(!os.story.timelines.has(ids.timelineId))os.story.defineSeries(ids.timelineId,{title:input?.name||ids.gameId});os.storyScheduler(ids.timelineId);os.titleForge(ids.gameId);await state.saveSystem();shell.hydrateRuntime();return ids;},clearChat:async()=>{state.messages=[];await state.saveChat();renderChat(shell,state);}};globalThis.SevenIntegrated=Object.freeze(api);document.documentElement.dataset.sevenIntegrated='true';document.documentElement.dataset.sevenBuild=BUILD;if(warnings.length)shell.toast('Seven recovered with persistence warnings.','error',{timeout:0});else shell.announce('Seven Ultimate runtime ready');return api;}
globalThis.SevenBrowserBoot=boot().catch(error=>{console.error('Seven integration boot failed',error);document.documentElement.dataset.sevenIntegrated='failed';throw error;});
module.exports={boot,BUILD};
