(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateMedia=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};
const STATES=new Set(['queued','preparing','running','validating','success','failed','cancelled']);
class MediaJob{
 constructor(input={}){check(input.id&&input.kind,'MEDIA_JOB_ID_KIND_REQUIRED');this.id=input.id;this.kind=input.kind;this.status='queued';this.request=clone(input.request||{});this.result=null;this.error=null;this.events=[{state:'queued',at:Date.now()}];}
 transition(state,data={}){check(STATES.has(state),'MEDIA_STATE_INVALID');const allowed={queued:['preparing','cancelled'],preparing:['running','failed','cancelled'],running:['validating','success','failed','cancelled'],validating:['success','failed','cancelled'],success:[],failed:[],cancelled:[]};check((allowed[this.status]||[]).includes(state),'MEDIA_STATE_TRANSITION');this.status=state;this.events.push({state,at:Date.now(),data:clone(data)});if(state==='success')this.result=clone(data.result||data);if(state==='failed')this.error=String(data.error||'MEDIA_FAILED');return this.snapshot();}
 snapshot(){return clone({id:this.id,kind:this.kind,status:this.status,request:this.request,result:this.result,error:this.error,events:this.events});}
}
class MediaProviderRegistry{
 constructor(){this.providers=new Map();}
 register(input={}){check(input.id&&typeof input.execute==='function','MEDIA_PROVIDER_REQUIRED');check(!this.providers.has(input.id),'MEDIA_PROVIDER_EXISTS');const p={id:input.id,kinds:[...(input.kinds||[])],local:!!input.local,costClass:input.costClass||'free',execute:input.execute,health:input.health||'healthy',priority:Number(input.priority||0)};this.providers.set(p.id,p);return p.id;}
 candidates(kind,{freeOnly=true}={}){return[...this.providers.values()].filter(p=>p.health!=='down'&&p.kinds.includes(kind)&&(!freeOnly||p.local||p.costClass==='free')).sort((a,b)=>b.priority-a.priority);}
}
class MediaForge{
 constructor(opts={}){this.enabled={image:false,video:false,audio:false,voice:false,...opts.enabled};this.providers=opts.providers||new MediaProviderRegistry();this.visuals=opts.visuals||null;this.jobs=new Map();}
 configure(kind,enabled){check(Object.prototype.hasOwnProperty.call(this.enabled,kind),'MEDIA_KIND_UNKNOWN');this.enabled[kind]=!!enabled;return clone(this.enabled);}
 isEnabled(kind){return !!this.enabled[kind];}
 createJob(input={}){check(this.isEnabled(input.kind),'MEDIA_DISABLED');check(input.id&&!this.jobs.has(input.id),'MEDIA_JOB_EXISTS');const request=clone(input.request||{});if(input.kind==='image'&&this.visuals&&Array.isArray(request.characters)){request.characterReferences=request.characters.map(c=>({entityId:c.entityId,slot:c.slot||null,referencePack:this.visuals.referencePack(request.gameId,c.entityId)}));}const j=new MediaJob({id:input.id,kind:input.kind,request});this.jobs.set(j.id,j);return j.snapshot();}
 async run(id,opts={}){const j=this.jobs.get(id);check(j,'MEDIA_JOB_NOT_FOUND');j.transition('preparing');const providers=this.providers.candidates(j.kind,{freeOnly:opts.freeOnly!==false});check(providers.length,'MEDIA_PROVIDER_UNAVAILABLE');let lastError=null;for(const p of providers){if(opts.signal?.aborted){j.transition('cancelled',{reason:'aborted'});return j.snapshot();}try{j.transition('running',{providerId:p.id});const result=await p.execute(clone(j.request),{signal:opts.signal});if(j.kind==='image'&&this.visuals&&result?.imageId&&result?.scores){j.transition('validating',{providerId:p.id});const verdict=this.visuals.evaluateImage(result.imageId,result.scores);if(!verdict.accepted)throw new Error('VISUAL_CANON_DRIFT');}j.transition('success',{providerId:p.id,result});return j.snapshot();}catch(e){lastError=e;if(j.status==='validating'||j.status==='running'){j.status='preparing';j.events.push({state:'retry_provider',at:Date.now(),data:{providerId:p.id,error:String(e&&e.message||e)}});}}}j.transition('failed',{error:String(lastError&&lastError.message||lastError||'MEDIA_PROVIDER_FAILED')});return j.snapshot();}
 cancel(id){const j=this.jobs.get(id);check(j,'MEDIA_JOB_NOT_FOUND');if(['success','failed','cancelled'].includes(j.status))return j.snapshot();j.transition('cancelled');return j.snapshot();}
 list(){return[...this.jobs.values()].map(j=>j.snapshot());}
}
return{MEDIA_STATES:Object.freeze([...STATES]),MediaJob,MediaProviderRegistry,MediaForge};
});