(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateLauncher=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const check=(v,m)=>{if(!v)throw new Error(m)};
function minutes(date){return date.getHours()*60+date.getMinutes();}
function identityFor(date=new Date(),opts={}){const dayStart=Number(opts.dayStartMinutes??420),nightStart=Number(opts.nightStartMinutes??1140),m=minutes(date),night=m<dayStart||m>=nightStart;return{period:night?'night':'day',alias:night?(opts.nightAlias||'SevenNight'):(opts.dayAlias||'SevenDay'),icon:night?'seven-night':'seven-day',monochrome:night?'seven-night-monochrome':'seven-day-monochrome'};}
function nextSwitch(date=new Date(),opts={}){const dayStart=Number(opts.dayStartMinutes??420),nightStart=Number(opts.nightStartMinutes??1140),m=minutes(date),next=new Date(date);next.setSeconds(0,0);if(m<dayStart)next.setHours(Math.floor(dayStart/60),dayStart%60,0,0);else if(m<nightStart)next.setHours(Math.floor(nightStart/60),nightStart%60,0,0);else{next.setDate(next.getDate()+1);next.setHours(Math.floor(dayStart/60),dayStart%60,0,0);}return next;}
class LauncherIdentityController{
 constructor(opts={}){this.opts=opts;this.lastAlias=null;this.history=[];}
 desired(date=new Date()){return identityFor(date,this.opts);}
 plan(date=new Date()){const desired=this.desired(date),changed=this.lastAlias!==desired.alias;return{...desired,changed,nextSwitchAt:nextSwitch(date,this.opts).toISOString(),reason:changed?'time_identity_changed':'already_current'};}
 async apply(adapter,date=new Date()){check(adapter&&typeof adapter.enableAlias==='function','LAUNCHER_ADAPTER_REQUIRED');const plan=this.plan(date);if(!plan.changed)return plan;await adapter.enableAlias(plan.alias,{disableOthers:true});this.lastAlias=plan.alias;this.history.push({alias:plan.alias,at:date.toISOString(),period:plan.period});return{...plan,applied:true};}
 resume(adapter,date=new Date()){return this.apply(adapter,date);}
 manifestAliases(){return[{name:this.opts.dayAlias||'SevenDay',icon:'@mipmap/ic_launcher_day',monochrome:'@drawable/ic_launcher_day_monochrome',enabled:true},{name:this.opts.nightAlias||'SevenNight',icon:'@mipmap/ic_launcher_night',monochrome:'@drawable/ic_launcher_night_monochrome',enabled:false}];}
}
return{identityFor,nextSwitch,LauncherIdentityController};
});