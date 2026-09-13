'use strict';
const { SevenUltimateOS } = require('./runtime.js');
const { IndexedDBStore } = require('./persistence.js');
const { attachModelAgentV2 } = require('./model-agent-extension.js');
const { mount } = require('./ui/ultimate-shell.js');

async function boot(){
 const store=new IndexedDBStore({dbName:'seven-ai',storeName:'ultimate-canonical'});
 const os=new SevenUltimateOS({persistence:store});
 try{await os.load('seven:ultimate:system:v1');}catch(error){console.warn('Seven restore warning',error);}
 attachModelAgentV2(os,{sessionId:'seven-default-chat'});
 const shell=mount('#seven-app',{runtime:os,initialView:(location.hash||'#home').slice(1)});
 globalThis.SevenIntegrated={os,shell,ready:true};
 document.documentElement.dataset.sevenIntegrated='true';
 return globalThis.SevenIntegrated;
}
globalThis.SevenBrowserBoot=boot();
module.exports={boot};
