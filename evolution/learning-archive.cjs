"use strict";
const crypto=require("crypto");
function canonical(v){if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())o[k]=canonical(v[k]);return o}return v}
function hash(v){return crypto.createHash("sha256").update(JSON.stringify(canonical(v))).digest("hex")}
function normalizeRecord(r={}){
 for(const k of ["experimentId","hypothesis","baselineSha","candidateSha","outcome"])if(!String(r[k]||"").trim())throw new Error("learning record missing "+k);
 const body={version:1,experimentId:String(r.experimentId),subsystem:String(r.subsystem||"unknown"),hypothesis:String(r.hypothesis),baselineSha:String(r.baselineSha),candidateSha:String(r.candidateSha),patchSha:r.patchSha?String(r.patchSha):null,tests:Array.isArray(r.tests)?r.tests:[],metrics:r.metrics&&typeof r.metrics==="object"?r.metrics:{},outcome:String(r.outcome).toUpperCase(),reason:String(r.reason||""),recordedAt:String(r.recordedAt||new Date().toISOString()),rollback:r.rollback||null};
 return Object.freeze({...body,checksum:hash(body)});
}
function verifyRecord(r){if(!r||typeof r!=="object"||!r.checksum)return false;const {checksum,...body}=r;return checksum===hash(body)}
function experimentFingerprint(r={}){return hash({subsystem:String(r.subsystem||"unknown").trim().toLowerCase(),hypothesis:String(r.hypothesis||"").trim().replace(/\\s+/g," ").toLowerCase(),baselineSha:String(r.baselineSha||"").trim().toLowerCase()})}
function createArchive(seed=[]){
 const rows=[];for(const r of seed){if(!verifyRecord(r))throw new Error("invalid learning archive seed");rows.push(Object.freeze({...r}))}
 function append(input){const record=normalizeRecord(input);rows.push(record);return record}
 function failedBefore(input){const fp=experimentFingerprint(input);return rows.some(r=>verifyRecord(r)&&experimentFingerprint(r)===fp&&["REJECTED","FAILED","ROLLED_BACK","DEPLOYMENT_ABORTED"].includes(r.outcome))}
 function list(){return rows.map(r=>({...r}))}
 function verify(){return {valid:rows.every(verifyRecord),count:rows.length}}
 return Object.freeze({append,failedBefore,list,verify});
}
module.exports={canonical,hash,normalizeRecord,verifyRecord,experimentFingerprint,createArchive};
