"use strict";
const {createArchive}=require("./learning-archive.cjs");
const {persistStateAtomic,loadCommittedState}=require("./state-store.cjs");
const KEY="seven-evolution-learning-v1";
async function loadLearningArchive({storeAdapter,key=KEY}={}){
 const state=await loadCommittedState({adapter:storeAdapter,key});
 const records=state&&Array.isArray(state.records)?state.records:[];
 return createArchive(records);
}
async function appendLearningRecord({storeAdapter,key=KEY,record}={}){
 if(!storeAdapter)throw new Error("storeAdapter required");
 const archive=await loadLearningArchive({storeAdapter,key});
 const saved=archive.append(record);
 await persistStateAtomic({adapter:storeAdapter,key,state:{schemaVersion:1,records:archive.list()}});
 const verify=await loadLearningArchive({storeAdapter,key});
 if(!verify.verify().valid)throw new Error("learning archive verification failed after commit");
 return saved;
}
async function failedExperimentSeen({storeAdapter,key=KEY,experiment}={}){
 const archive=await loadLearningArchive({storeAdapter,key});return archive.failedBefore(experiment);
}
module.exports={KEY,loadLearningArchive,appendLearningRecord,failedExperimentSeen};
