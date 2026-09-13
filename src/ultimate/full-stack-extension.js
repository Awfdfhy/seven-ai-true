'use strict';
const {RPGDirector}=require('./rpg-director.js');
const {StorySchedulingEngine}=require('./story-scheduler.js');
const {CanonJourneyEngine}=require('./canon-journey.js');
const {WorldTitleForge}=require('./world-title-forge.js');
const {SearchRuntime,SearchProviderRegistry}=require('./search-runtime.js');

function attachFullStack(os,opts={}){
 if(!os)throw new Error('ULTIMATE_OS_REQUIRED');
 if(!os.rpgDirector)os.rpgDirector=new RPGDirector({core:os.core,memory:os.memory,story:os.story,narrative:os.narrative,tone:os.tone,flashbacks:os.flashbacks,characters:os.characters,parallelStories:os.parallelStories});
 if(!os.storySchedulers)os.storySchedulers=new Map();
 if(!os.canonJourneys)os.canonJourneys=new Map();
 if(!os.titleForges)os.titleForges=new Map();
 if(!os.searchProviders)os.searchProviders=new SearchProviderRegistry();
 if(!os.searchRuntime)os.searchRuntime=new SearchRuntime({fabric:os.search,providers:os.searchProviders,maxProvidersPerQuery:opts.maxSearchProviders??2});
 os.storyScheduler=(timelineId,input={})=>{if(!timelineId)throw new Error('TIMELINE_ID_REQUIRED');if(!os.storySchedulers.has(timelineId))os.storySchedulers.set(timelineId,new StorySchedulingEngine(input));return os.storySchedulers.get(timelineId);};
 os.canonJourney=(universeId,input={})=>{if(!universeId)throw new Error('CANON_UNIVERSE_ID_REQUIRED');const key=`${universeId}|${input.continuityId||'main'}`;if(!os.canonJourneys.has(key))os.canonJourneys.set(key,new CanonJourneyEngine({universeId,...input}));return os.canonJourneys.get(key);};
 os.titleForge=(worldId,input={})=>{if(!worldId)throw new Error('WORLD_ID_REQUIRED');if(!os.titleForges.has(worldId))os.titleForges.set(worldId,new WorldTitleForge({worldId,...input}));return os.titleForges.get(worldId);};
 os.deepPlanSnapshot=()=>({rpgDirector:!!os.rpgDirector,storySchedulers:os.storySchedulers.size,canonJourneys:os.canonJourneys.size,titleForges:os.titleForges.size,searchRuntime:!!os.searchRuntime,searchProviders:os.searchProviders.providers.size});
 return os;
}
module.exports={attachFullStack};
