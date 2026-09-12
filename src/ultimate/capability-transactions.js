(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenCapabilityTransactions=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const now=()=>Date.now();

class IdempotencyLedger{
 constructor(limit=5000){this.limit=limit;this.rows=new Map();}
 begin(key,input={}){check(key,'IDEMPOTENCY_KEY_REQUIRED');const old=this.rows.get(key);if(old)return{duplicate:true,row:clone(old)};const row={key,state:'started',operation:clone(input),startedAt:now(),updatedAt:now(),result:null};this.rows.set(key,row);this.trim();return{duplicate:false,row:clone(row)};}
 finish(key,result,state='completed'){const r=this.rows.get(key);check(r,'IDEMPOTENCY_OPERATION_NOT_FOUND');r.state=state;r.result=clone(result);r.updatedAt=now();return clone(r);}
 get(key){return clone(this.rows.get(key)||null);}
 trim(){while(this.rows.size>this.limit)this.rows.delete(this.rows.keys().next().value);}
}

class TransactionJournal{
 constructor(){this.events=[];}
 append(txId,type,data={}){const e={seq:this.events.length+1,txId,type,at:now(),data:clone(data)};this.events.push(e);return clone(e);}
 trace(txId){return this.events.filter(e=>e.txId===txId).map(clone);}
 uncertain(){const by=new Map();for(const e of this.events)by.set(e.txId,e);return[...by.values()].filter(e=>e.type==='UNCERTAIN').map(clone);}
}

class TransactionCoordinator{
 constructor(input={}){check(input.runtime,'TRANSACTION_RUNTIME_REQUIRED');this.runtime=input.runtime;this.idempotency=input.idempotency||new IdempotencyLedger();this.journal=input.journal||new TransactionJournal();}
 async execute(input={}){const txId=input.txId||`tx_${now()}_${Math.random().toString(36).slice(2)}`,key=input.idempotencyKey||txId;const started=this.idempotency.begin(key,{capabilityId:input.capabilityId,args:input.args,scope:input.scope});if(started.duplicate){const row=started.row;if(row.state==='completed')return{state:'success',txId,deduplicated:true,result:row.result};return{state:'uncertain',txId,deduplicated:true,reason:'PRIOR_OPERATION_NOT_TERMINAL',prior:row};}this.journal.append(txId,'PREPARE',{capabilityId:input.capabilityId});try{if(input.precondition){const p=await input.precondition();if(!p?.ok){this.journal.append(txId,'ABORT',{reason:'PRECONDITION_FAILED'});this.idempotency.finish(key,p,'aborted');return{state:'blocked',txId,reason:'PRECONDITION_FAILED',details:p};}}this.journal.append(txId,'EXECUTE');const result=await this.runtime.execute({...input,callId:input.callId||txId});if(result.state!=='success'){this.journal.append(txId,'ABORT',{runtimeState:result.state,reason:result.reason});this.idempotency.finish(key,result,result.state);return{...result,txId};}this.journal.append(txId,'POSTCONDITION');if(input.postcondition){const p=await input.postcondition(result.packet);if(!p?.ok){if(input.compensate){this.journal.append(txId,'COMPENSATE');try{await input.compensate(result.packet);this.journal.append(txId,'ROLLED_BACK');this.idempotency.finish(key,{result,p},'rolled_back');return{state:'failed',txId,reason:'POSTCONDITION_FAILED_ROLLED_BACK'};}catch(error){this.journal.append(txId,'UNCERTAIN',{reason:'COMPENSATION_FAILED',error:String(error?.message||error)});this.idempotency.finish(key,{result,p},'uncertain');return{state:'uncertain',txId,reason:'COMPENSATION_FAILED'};}}this.journal.append(txId,'UNCERTAIN',{reason:'POSTCONDITION_FAILED'});this.idempotency.finish(key,{result,p},'uncertain');return{state:'uncertain',txId,reason:'POSTCONDITION_FAILED'};}}
 this.journal.append(txId,'COMMIT');this.idempotency.finish(key,result,'completed');return{...result,txId,transactionCommitted:true};}catch(error){this.journal.append(txId,'UNCERTAIN',{error:String(error?.message||error)});this.idempotency.finish(key,{error:String(error?.message||error)},'uncertain');return{state:'uncertain',txId,reason:'TRANSACTION_EXCEPTION',error:String(error?.message||error)};}}
}

class GenerationFence{
 constructor(){this.generations=new Map();}
 current(scope='global'){return this.generations.get(scope)||0;}
 issue(scope='global'){const generation=this.current(scope)+1;this.generations.set(scope,generation);return{scope,generation};}
 cancel(scope='global'){return this.issue(scope);}
 accepts(token){return !!token&&this.current(token.scope)===token.generation;}
}

class SideEffectReconciler{
 constructor(input={}){this.inspect=input.inspect||null;}
 async reconcile(record={}){if(!this.inspect)return{state:'manual_review',reason:'NO_RECONCILER'};const x=await this.inspect(record);if(x?.applied===true)return{state:'applied',evidence:clone(x)};if(x?.applied===false)return{state:'not_applied',evidence:clone(x)};return{state:'uncertain',evidence:clone(x)};}
}

return{IdempotencyLedger,TransactionJournal,TransactionCoordinator,GenerationFence,SideEffectReconciler};
});