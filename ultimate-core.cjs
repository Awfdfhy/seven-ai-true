const assert=require('assert');
const {SevenUltimateRuntime,TRACK_KINDS,FLASHBACK_KINDS}=require('./src/ultimate/core.js');

let tick=0;
const rt=new SevenUltimateRuntime({clock:()=>`2026-09-12T21:00:${String(tick++).padStart(2,'0')}+03:00`});

const valen=rt.createGame({id:'game_valen',name:'Valen'});
const neon=rt.createGame({id:'game_neon',name:'Neon City'});
assert.equal(valen.id,'game_valen');
assert.equal(neon.id,'game_neon');
assert.equal(rt.snapshot().games.length,2,'multi-game library must isolate games');

rt.createCampaign('game_valen',{id:'camp_main',name:'Ali Story'});
rt.createTimeline('game_valen','camp_main',{id:'tl_main',name:'Main Timeline'});
rt.registerEntity('game_valen',{id:'ali',name:'Ali',tier:'core',identityCore:{role:'player'}});
rt.registerEntity('game_valen',{id:'aria',name:'Aria',tier:'core',identityCore:{values:['autonomy','loyalty']}});

const e1=rt.appendEvent('game_valen','camp_main','tl_main',{id:'e1',type:'meeting',actorIds:['aria'],witnessIds:['ali'],payload:{text:'Aria meets Ali'}});
rt.remember('game_valen','camp_main','tl_main','ali',{id:'m1',sourceEventRef:e1.ref,interpretation:{summary:'First meeting'},emotionalWeight:4});
assert.equal(rt.memories('game_valen','camp_main','tl_main','ali').length,1,'character memory should retain experienced events');
assert.equal(rt.memories('game_valen','camp_main','tl_main','aria').length,0,'knowledge must not leak to characters without a recorded memory');

const main=rt.createTrack('game_valen','camp_main','tl_main',{id:'track_main',kind:'mainline',title:'Main Story'});
const side=rt.createTrack('game_valen','camp_main','tl_main',{id:'track_side',kind:'independent_arc',title:'Three Nights of Elaria'});
const filler=rt.createTrack('game_valen','camp_main','tl_main',{id:'track_filler',kind:'filler',title:'Palace Day Off'});
assert.equal(main.canonStatus,'canon');
assert.equal(side.canonStatus,'canon');
assert.equal(filler.canonStatus,'canon');

rt.addEpisode('game_valen','camp_main','tl_main','track_main',{id:'ep1',number:1,title:'Beginning'});
rt.addEpisode('game_valen','camp_main','tl_main','track_side',{id:'side1',number:1,title:'Night One'});
rt.addEpisode('game_valen','camp_main','tl_main','track_filler',{id:'fill1',number:1,title:'A Quiet Morning'});

const sideFlash=rt.createFlashback('game_valen','camp_main','tl_main',{id:'fb_side',trackId:'track_side',kind:'canonical_recall',sourceEventRefs:[e1.ref]});
const fillerFlash=rt.createFlashback('game_valen','camp_main','tl_main',{id:'fb_filler',trackId:'track_filler',kind:'subjective_memory',perspectiveEntityId:'ali',sourceEventRefs:[e1.ref]});
assert.equal(sideFlash.trackId,'track_side','flashbacks must work in independent arcs');
assert.equal(fillerFlash.trackId,'track_filler','flashbacks must work in filler/interlude content');

rt.createTimeline('game_valen','camp_main',{id:'tl_branch',name:'Branch',parentTimelineId:'tl_main'});
assert.equal(rt.visibleEvents('game_valen','camp_main','tl_branch').length,1,'branch must inherit history at fork');
assert.equal(rt.memories('game_valen','camp_main','tl_branch','ali').length,1,'branch must inherit character memories at fork');
rt.appendEvent('game_valen','camp_main','tl_main',{id:'e_after_fork',type:'later'});
assert.equal(rt.visibleEvents('game_valen','camp_main','tl_branch').length,1,'later parent events must not leak into an existing branch');

rt.createTrack('game_valen','camp_main','tl_branch',{id:'whatif',kind:'what_if',title:'What If'});
assert.equal(rt.storyAtlas('game_valen','camp_main','tl_branch').tracks[0].canonStatus,'isolated','what-if track must be isolated from primary canon');

assert.equal(rt.requiresAgencyGate({playerEntityId:'ali',actorEntityId:'ali',actionType:'opinion'}),true,'player opinion must pause for player agency');
assert.equal(rt.requiresAgencyGate({playerEntityId:'ali',actorEntityId:'aria',actionType:'dialogue'}),false,'NPC dialogue should not trigger player ownership gate');
assert.equal(rt.requiresAgencyGate({playerEntityId:'ali',actorEntityId:'ali',actionType:'movement'}),false,'minor non-owned category should not automatically gate');

assert.throws(()=>rt.appendEvent('game_valen','camp_main','tl_main',{id:'e1'}),/EVENT_EXISTS/,'duplicate canonical events must fail closed');
assert.throws(()=>rt.createFlashback('game_valen','camp_main','tl_main',{trackId:'track_side',kind:'canonical_recall',sourceEventRefs:['missing:event']}),/FLASHBACK_SOURCE_NOT_VISIBLE/,'canonical flashback cannot invent a missing source event');

rt.createCampaign('game_neon',{id:'neon_campaign'});
rt.createTimeline('game_neon','neon_campaign',{id:'neon_timeline'});
assert.equal(rt.visibleEvents('game_neon','neon_campaign','neon_timeline').length,0,'events must not leak between games');
assert.ok(TRACK_KINDS.includes('side_series')&&TRACK_KINDS.includes('filler'),'parallel-story track kinds should be registered');
assert.ok(FLASHBACK_KINDS.includes('historical_gap'),'historical-gap flashbacks should be registered');

const summary=rt.gameSummary('game_valen');
assert.equal(summary.timelines,2);
assert.equal(summary.flashbacks,2);
assert.equal(summary.events,2);

console.log('ultimate core: 20 assertions PASS');
