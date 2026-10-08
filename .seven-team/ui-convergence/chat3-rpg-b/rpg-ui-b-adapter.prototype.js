// Chat 3 RPG UI B — reference adapter prototype.
// Research artifact only; not loaded by production build.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.SevenRpgUiBAdapterPrototype=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  const arr=v=>Array.isArray(v)?v:[];
  const entries=o=>Object.entries(obj(o)).map(([label,value])=>({label,value}));
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));

  function abilityVM(state,id,a){
    a=obj(a); const turn=Number.isInteger(state&&state.turn)?state.turn:null;
    const cd=Math.max(0,Number(a.cooldownTurns)||0);
    const last=Number.isInteger(a.lastUsedTurn)?a.lastUsedTurn:null;
    let remaining=null,ready=null;
    if(turn!=null){
      remaining=last==null?0:Math.max(0,(last+cd)-turn);
      ready=remaining===0&&!a.forbidden;
    }
    return {
      id:String(id),name:String(a.name||id),owners:arr(a.ownerIds).slice(),tags:arr(a.tags).slice(),
      costEntries:entries(a.costs),limitations:arr(a.limitations).slice(),weaknesses:arr(a.weaknesses).slice(),
      cooldown:{turns:cd,lastUsedTurn:last,ready,remainingTurns:remaining},
      forbidden:a.forbidden===true,powerScale:Number.isFinite(Number(a.powerScale))?Number(a.powerScale):null
    };
  }

  function itemVM(id,x){
    x=obj(x);
    return {
      id:String(id),name:String(x.name||id),quantity:Number.isFinite(Number(x.quantity))?Number(x.quantity):null,
      ownerId:x.ownerId||null,locationId:x.locationId||null,equippedBy:x.equippedBy||null,
      consumable:x.consumable===true,tags:arr(x.tags).slice(),stateEntries:entries(x.state)
    };
  }

  function factionVM(id,f){
    f=obj(f);
    return {
      id:String(id),name:String(f.name||id),goals:arr(f.goals).slice(),leaders:arr(f.leaderIds).slice(),
      members:arr(f.memberIds).slice(),resources:entries(f.resources),alliances:arr(f.alliances).slice(),
      enemies:arr(f.enemies).slice(),territory:arr(f.territory).slice(),reputation:entries(f.reputation),
      updatedTurn:Number.isInteger(f.updatedTurn)?f.updatedTurn:null
    };
  }

  function battleContext(state){
    state=obj(state); const scene=state.scene?obj(state.scene):null;
    return {
      active:!!(scene&&arr(scene.activeConflicts).length),
      sceneId:scene&&scene.id||null,locationId:scene&&scene.locationId||null,
      conflicts:scene?arr(scene.activeConflicts).slice():[],
      participantIds:scene?arr(scene.participantIds).slice():[],
      abilities:Object.entries(obj(state.abilities)).map(([id,a])=>abilityVM(state,id,a)),
      turnOrder:null,hp:null,mp:null
    };
  }

  function worldPulse(state){
    state=obj(state); const world=obj(state.world),timeline=obj(state.timeline),scene=state.scene?obj(state.scene):null;
    return {
      currentLocationId:scene&&scene.locationId||null,
      activeEvents:clone(obj(world.activeEvents)),wars:clone(obj(world.wars)),politics:clone(obj(world.politics)),
      economy:clone(obj(world.economy)),resources:clone(obj(world.resources)),
      timeline:{tick:Number.isFinite(Number(timeline.tick))?Number(timeline.tick):null,dateLabel:String(timeline.dateLabel||''),recentEvents:arr(timeline.events).slice(-8).map(clone)}
    };
  }

  function project(state){
    state=obj(state);
    return {
      abilities:Object.entries(obj(state.abilities)).map(([id,a])=>abilityVM(state,id,a)),
      items:Object.entries(obj(state.items)).map(([id,x])=>itemVM(id,x)),
      factions:Object.entries(obj(state.factions)).map(([id,f])=>factionVM(id,f)),
      battle:battleContext(state),
      world:worldPulse(state)
    };
  }

  return Object.freeze({abilityVM,itemVM,factionVM,battleContext,worldPulse,project});
});
