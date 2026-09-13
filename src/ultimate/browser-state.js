'use strict';
const { IndexedDBStore } = require('./persistence.js');
const SYSTEM_KEY='seven:ultimate:system:v1';
const CHAT_KEY='seven:ultimate:chat:default:v1';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));

class BrowserState {
 constructor(os){this.os=os;this.store=new IndexedDBStore({dbName:'seven-ai',storeName:'ultimate-canonical'});this.os.persistence=this.store;this.systemRevision=0;this.chatRevision=0;this.messages=[];}
 async restore(){
  const warnings=[];
  try{const row=await this.os.load(SYSTEM_KEY);if(row)this.systemRevision=Number(row.revision||0);}catch(e){warnings.push({area:'system',message:String(e?.message||e)});}
  try{const row=await this.store.load(CHAT_KEY);if(row){this.chatRevision=Number(row.revision||0);const v=row.value||{};if(v.schema==='seven.ultimate.chat'&&Array.isArray(v.messages))this.messages=v.messages.filter(m=>m&&['user','assistant','system'].includes(m.role)&&typeof m.content==='string');}}catch(e){warnings.push({area:'chat',message:String(e?.message||e)});}
  return warnings;
 }
 async saveChat(){const value={schema:'seven.ultimate.chat',schemaVersion:1,updatedAt:new Date().toISOString(),messages:clone(this.messages)};const row=await this.store.save(CHAT_KEY,value,this.chatRevision);this.chatRevision=row.revision;return row;}
 async saveSystem(){const row=await this.os.save(SYSTEM_KEY,this.systemRevision);this.systemRevision=row.revision;return row;}
 async append(role,content){this.messages.push({role,content:String(content)});await this.saveChat();return this.messages.length;}
 snapshot(){return{systemRevision:this.systemRevision,chatRevision:this.chatRevision,messages:this.messages.length};}
}
module.exports={BrowserState,SYSTEM_KEY,CHAT_KEY};
