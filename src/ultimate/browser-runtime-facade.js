'use strict';
const out=r=>String(r?.run?.output??r?.execution?.run?.output??r?.execution?.output??r?.output??'');
class BrowserRuntimeFacade{
 constructor(os,state){this.os=os;this.state=state;}
 get active(){return this.os.active;}
 get rpgUI(){return this.os.rpgUI;}
 get activity(){return this.os.activity;}
 async chat(input={}){const text=String(input.text||input.userInput||input.messages?.at?.(-1)?.content||'').trim();if(!text)throw new Error('EMPTY_MESSAGE');await this.state.append('user',text);const messages=this.state.messages.map(m=>({role:m.role,content:m.content}));const plan=this.os.planRequest({...input,text,messages});const result=await this.os.chat({...input,text,messages,plan,useFrontierLedger:true});const body=out(result),status=result?.execution?.status||result?.run?.status||'completed';if(status==='completed'&&body){await this.state.append('assistant',body);this.state.saveSystem().catch(()=>{});}return result;}
}
module.exports={BrowserRuntimeFacade};
