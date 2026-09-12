(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.SevenUltimateCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION='U1.1-chronicle';
  const TRACKS=new Set(['mainline','side_canon','independent_arc','interlude','filler','special','character_spotlight','world_story','mystery','comedy','daily_life','travel','investigation','culture','flashback_story','anthology','parallel_perspective','aftermath','what_if','alternate_timeline','side_series']);
  const FLASHBACKS=new Set(['canonical_recall','subjective_memory','historical_gap','what_if_memory']);
  const PLAYER_OWNED=new Set(['dialogue','decision','opinion','private_thought','intentional_action','irreversible_action']);
  const copy=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const check=(v,m)=>{if(!v) throw new Error(m)};
  const deepFreeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.freeze(v);Object.keys(v).forEach(k=>deepFreeze(v[k]));}return v;};
  let serial=0;
  const uid=p=>`${p}_${Date.now().toString(36)}_${(++serial).toString(36)}`;

  class SevenUltimateRuntime{
    constructor(opts={}){this.version=VERSION;this.clock=opts.clock||(()=>new Date().toISOString());this.games=new Map();}
    game(gameId){const g=this.games.get(gameId);check(g,'GAME_NOT_FOUND');return g;}
    campaign(gameId,campaignId){const c=this.game(gameId).campaigns.get(campaignId);check(c,'CAMPAIGN_NOT_FOUND');return c;}
    timeline(gameId,campaignId,timelineId){const t=this.campaign(gameId,campaignId).timelines.get(timelineId);check(t,'TIMELINE_NOT_FOUND');return t;}
    createGame(input={}){const id=input.id||uid('game');check(!this.games.has(id),'GAME_EXISTS');this.games.set(id,{id,name:input.name||'Untitled Game',createdAt:this.clock(),rules:copy(input.rules||{}),tone:copy(input.tone||{}),entities:new Map(),campaigns:new Map(),events:new Map(),eventSeq:0});return this.gameSummary(id);}
    createCampaign(gameId,input={}){const g=this.game(gameId),id=input.id||uid('campaign');check(!g.campaigns.has(id),'CAMPAIGN_EXISTS');g.campaigns.set(id,{id,name:input.name||'Campaign',createdAt:this.clock(),timelines:new Map()});return {id,gameId};}
    createTimeline(gameId,campaignId,input={}){const c=this.campaign(gameId,campaignId),id=input.id||uid('timeline');check(!c.timelines.has(id),'TIMELINE_EXISTS');let inheritedEvents=[],inheritedMemories=new Map();if(input.parentTimelineId){const p=this.timeline(gameId,campaignId,input.parentTimelineId);inheritedEvents=[...p.inheritedEvents,...p.localEvents];for(const [entityId,list] of [...p.inheritedMemories.entries(),...p.memories.entries()]){const dest=inheritedMemories.get(entityId)||[];dest.push(...list.map(copy));inheritedMemories.set(entityId,dest);}}c.timelines.set(id,{id,name:input.name||'Timeline',parentTimelineId:input.parentTimelineId||null,inheritedEvents,localEvents:[],inheritedMemories,memories:new Map(),tracks:new Map(),flashbacks:[]});return {id,campaignId,parentTimelineId:input.parentTimelineId||null};}
    registerEntity(gameId,input={}){const g=this.game(gameId),id=input.id||uid(input.type||'entity');check(!g.entities.has(id),'ENTITY_EXISTS');const entity=deepFreeze({id,type:input.type||'character',name:input.name||id,tier:input.tier||'background',identityCore:copy(input.identityCore||{}),visualCanon:copy(input.visualCanon||{}),createdFrom:copy(input.createdFrom||{})});g.entities.set(id,entity);return entity;}
    appendEvent(gameId,campaignId,timelineId,input={}){
      const g=this.game(gameId),t=this.timeline(gameId,campaignId,timelineId),id=input.id||uid('event'),ref=`${timelineId}:${id}`;check(!g.events.has(ref),'EVENT_EXISTS');
      for(const entityId of [...(input.actorIds||[]),...(input.witnessIds||[])])check(g.entities.has(entityId),'EVENT_ENTITY_NOT_FOUND');
      if(input.trackId)check(t.tracks.has(input.trackId),'EVENT_TRACK_NOT_FOUND');
      const event=deepFreeze({id,ref,seq:++g.eventSeq,gameId,campaignId,timelineId,trackId:input.trackId||null,seasonId:input.seasonId||null,arcIds:[...(input.arcIds||[])],episodeId:input.episodeId||null,sceneId:input.sceneId||null,beatId:input.beatId||null,locationId:input.locationId||null,type:input.type||'world_event',canonLevel:input.canonLevel||'canonical',worldTime:input.worldTime||null,actorIds:[...(input.actorIds||[])],witnessIds:[...(input.witnessIds||[])],payload:copy(input.payload||{}),causeRefs:[...(input.causeRefs||[])],tags:[...(input.tags||[])],source:copy(input.source||null),committedAt:this.clock()});
      for(const cause of event.causeRefs)check(g.events.has(cause),'EVENT_CAUSE_NOT_FOUND');
      g.events.set(ref,event);t.localEvents.push(ref);return event;
    }
    visibleEvents(gameId,campaignId,timelineId){const g=this.game(gameId),t=this.timeline(gameId,campaignId,timelineId);return [...t.inheritedEvents,...t.localEvents].map(ref=>g.events.get(ref)).filter(Boolean);}
    remember(gameId,campaignId,timelineId,entityId,input={}){const g=this.game(gameId),t=this.timeline(gameId,campaignId,timelineId);check(g.entities.has(entityId),'ENTITY_NOT_FOUND');check(input.sourceEventRef,'MEMORY_SOURCE_REQUIRED');check([...t.inheritedEvents,...t.localEvents].includes(input.sourceEventRef),'MEMORY_SOURCE_NOT_VISIBLE');const record=deepFreeze({id:input.id||uid('memory'),entityId,sourceEventRef:input.sourceEventRef,type:input.type||'episodic',interpretation:copy(input.interpretation||null),beliefBefore:copy(input.beliefBefore||null),beliefAfter:copy(input.beliefAfter||null),emotionalWeight:Number(input.emotionalWeight||0),salience:Number(input.salience==null?50:input.salience),learnedAt:this.clock()});const list=t.memories.get(entityId)||[];check(!list.some(x=>x.id===record.id),'MEMORY_EXISTS');list.push(record);t.memories.set(entityId,list);return record;}
    memories(gameId,campaignId,timelineId,entityId){const t=this.timeline(gameId,campaignId,timelineId);return [...(t.inheritedMemories.get(entityId)||[]),...(t.memories.get(entityId)||[])].map(copy);}
    createTrack(gameId,campaignId,timelineId,input={}){const t=this.timeline(gameId,campaignId,timelineId),kind=input.kind||'mainline',id=input.id||uid('track');check(TRACKS.has(kind),'INVALID_TRACK_KIND');check(!t.tracks.has(id),'TRACK_EXISTS');const track={id,kind,title:input.title||kind,canonStatus:input.canonStatus||(kind==='what_if'||kind==='alternate_timeline'?'isolated':'canon'),status:input.status||'active',isolation:copy(input.isolation||{}),storyScope:copy(input.storyScope||{}),episodes:[]};t.tracks.set(id,track);return copy(track);}
    addEpisode(gameId,campaignId,timelineId,trackId,input={}){const t=this.timeline(gameId,campaignId,timelineId),tr=t.tracks.get(trackId);check(tr,'TRACK_NOT_FOUND');const ep=deepFreeze({id:input.id||uid('episode'),trackId,seasonId:input.seasonId||null,arcIds:[...(input.arcIds||[])],number:input.number==null?tr.episodes.length+1:input.number,title:input.title||'Untitled Episode',role:input.role||null,status:input.status||'planned',metadata:copy(input.metadata||{})});tr.episodes.push(ep);return ep;}
    createFlashback(gameId,campaignId,timelineId,input={}){const t=this.timeline(gameId,campaignId,timelineId),kind=input.kind||'canonical_recall';check(FLASHBACKS.has(kind),'INVALID_FLASHBACK_KIND');check(input.trackId&&t.tracks.has(input.trackId),'FLASHBACK_TRACK_REQUIRED');const refs=[...(input.sourceEventRefs||[])];if(kind==='canonical_recall'||kind==='subjective_memory'){check(refs.length,'FLASHBACK_SOURCE_REQUIRED');const visible=[...t.inheritedEvents,...t.localEvents];refs.forEach(r=>check(visible.includes(r),'FLASHBACK_SOURCE_NOT_VISIBLE'));}const fb=deepFreeze({id:input.id||uid('flashback'),trackId:input.trackId,episodeId:input.episodeId||null,sceneId:input.sceneId||null,kind,perspectiveEntityId:input.perspectiveEntityId||null,sourceEventRefs:refs,scale:input.scale||'scene',returnAnchor:copy(input.returnAnchor||null),historicalCommitAllowed:kind==='historical_gap'});t.flashbacks.push(fb);return fb;}
    requiresAgencyGate(input={}){return !!input.playerEntityId&&input.actorEntityId===input.playerEntityId&&(input.force===true||PLAYER_OWNED.has(input.actionType));}
    storyAtlas(gameId,campaignId,timelineId){const t=this.timeline(gameId,campaignId,timelineId);return {timelineId,parentTimelineId:t.parentTimelineId,tracks:[...t.tracks.values()].map(copy),flashbacks:t.flashbacks.map(copy)};}
    gameSummary(gameId){const g=this.game(gameId);let timelines=0,tracks=0,episodes=0,memories=0,flashbacks=0;for(const c of g.campaigns.values())for(const t of c.timelines.values()){timelines++;tracks+=t.tracks.size;flashbacks+=t.flashbacks.length;for(const tr of t.tracks.values())episodes+=tr.episodes.length;for(const m of t.memories.values())memories+=m.length;}return {id:g.id,name:g.name,entities:g.entities.size,campaigns:g.campaigns.size,timelines,tracks,episodes,events:g.events.size,memories,flashbacks};}
    snapshot(){return {version:this.version,games:[...this.games.keys()].map(id=>this.gameSummary(id))};}
  }
  return {VERSION,TRACK_KINDS:Object.freeze([...TRACKS]),FLASHBACK_KINDS:Object.freeze([...FLASHBACKS]),SevenUltimateRuntime};
});
