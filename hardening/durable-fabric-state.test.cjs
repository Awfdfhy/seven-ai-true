"use strict";
const assert=require("assert");
const d=require("./durable-fabric-state.cjs");
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++},eq=(a,b,m)=>{assert.strictEqual(a,b,m);n++},throws=(f,r,m)=>{assert.throws(f,r,m);n++};
const H=x=>d.sha(x),T0="2026-09-15T02:00:00.000Z";
class MemStore{
  constructor(){this.manifest=new Map();this.objects=new Map();this.failCas=false;this.corruptRead=new Set()}
  async readManifest({key}){return this.manifest.get(key)||null}
  async readCheckpoint({key,checkpointSeal}){const x=this.objects.get(`${key}:${checkpointSeal}`)||null;if(!x)return null;if(this.corruptRead.has(checkpointSeal))return {...x,state:{corrupt:true}};return x}
  async writeCheckpoint({key,checkpointSeal,checkpoint}){const k=`${key}:${checkpointSeal}`,old=this.objects.get(k);if(old&&old.seal!==checkpoint.seal)throw Error("immutable checkpoint collision");this.objects.set(k,checkpoint)}
  async compareAndSwapManifest({key,expectedSeal,manifest}){if(this.failCas){this.failCas=false;return false}const old=this.manifest.get(key)||null;if((old?.seal||null)!==expectedSeal)return false;this.manifest.set(key,manifest);return true}
}
(async()=>{
  const c0=d.createFabricCheckpoint({fabricId:"research",principalId:"user-1",scopeId:"project-7",revision:0,state:{claims:["a"],authority:"source-bound"},dependencyHeads:{sourceA:"v1",sourceB:"v5"},committedAt:T0,rebuildable:false});
  ok(d.verifyFabricCheckpoint(c0));eq(c0.authorityMode,"PRESERVE_ONLY");eq(c0.previousSeal,null);eq(d.assessCheckpointFreshness(c0,{sourceA:"v1",sourceB:"v5"}).status,"FRESH");
  let fresh=d.assessCheckpointFreshness(c0,{sourceA:"v2",sourceB:"v5"});eq(fresh.status,"STALE");ok(fresh.staleDependencies.includes("sourceA"));
  const forged={...c0,state:{claims:["fabricated"]}};eq(d.verifyFabricCheckpoint(forged),false);
  throws(()=>d.createFabricCheckpoint({fabricId:"research",principalId:"u",revision:1,state:{}}),/previous checkpoint/);
  throws(()=>d.createFabricCheckpoint({fabricId:"research",principalId:"u",revision:0,previousSeal:H("x"),state:{}}),/revision zero/);

  const store=new MemStore();let recovery=await d.recoverCommittedCheckpoint({adapter:store,key:"r"});eq(recovery.status,"EMPTY");
  let saved=await d.persistCheckpointAtomic({adapter:store,key:"r",checkpoint:c0,expectedManifestSeal:null,updatedAt:T0});eq(saved.status,"COMMITTED");eq(saved.manifest.generation,0);eq(saved.checkpoint.seal,c0.seal);ok(d.verifyCheckpointManifest(saved.manifest));
  recovery=await d.recoverCommittedCheckpoint({adapter:store,key:"r"});eq(recovery.status,"ACTIVE");eq(recovery.checkpoint.revision,0);
  const c1=d.createFabricCheckpoint({fabricId:"research",principalId:"user-1",scopeId:"project-7",revision:1,previousSeal:c0.seal,state:{claims:["a","b"],authority:"source-bound"},dependencyHeads:{sourceA:"v1",sourceB:"v5"},committedAt:"2026-09-15T02:01:00Z"});
  saved=await d.persistCheckpointAtomic({adapter:store,key:"r",checkpoint:c1,expectedManifestSeal:saved.manifest.seal,updatedAt:"2026-09-15T02:01:00Z"});eq(saved.manifest.generation,1);eq(saved.manifest.previousCheckpointSeal,c0.seal);eq(saved.checkpoint.seal,c1.seal);
  const c2=d.createFabricCheckpoint({fabricId:"research",principalId:"user-1",scopeId:"project-7",revision:2,previousSeal:c1.seal,state:{claims:["c"]},dependencyHeads:{sourceA:"v1"},committedAt:"2026-09-15T02:02:00Z"});
  await assert.rejects(()=>d.persistCheckpointAtomic({adapter:store,key:"r",checkpoint:c2,expectedManifestSeal:"0".repeat(64)}),/compare-and-swap conflict/);n++;
  const wrongLineage=d.createFabricCheckpoint({fabricId:"research",principalId:"user-1",scopeId:"project-7",revision:2,previousSeal:c0.seal,state:{claims:["bad"]},dependencyHeads:{sourceA:"v1"},committedAt:"2026-09-15T02:02:00Z"});
  await assert.rejects(()=>d.persistCheckpointAtomic({adapter:store,key:"r",checkpoint:wrongLineage,expectedManifestSeal:saved.manifest.seal}),/lineage mismatch/);n++;
  const skipped=d.createFabricCheckpoint({fabricId:"research",principalId:"user-1",scopeId:"project-7",revision:3,previousSeal:c1.seal,state:{},dependencyHeads:{},committedAt:"2026-09-15T02:03:00Z"});
  await assert.rejects(()=>d.persistCheckpointAtomic({adapter:store,key:"r",checkpoint:skipped,expectedManifestSeal:saved.manifest.seal}),/advance exactly one/);n++;
  store.failCas=true;await assert.rejects(()=>d.persistCheckpointAtomic({adapter:store,key:"r",checkpoint:c2,expectedManifestSeal:saved.manifest.seal}),/compare-and-swap failed/);n++;
  recovery=await d.recoverCommittedCheckpoint({adapter:store,key:"r"});eq(recovery.status,"ACTIVE");eq(recovery.checkpoint.seal,c1.seal);ok(store.objects.has(`r:${c2.seal}`));

  store.corruptRead.add(c1.seal);recovery=await d.recoverCommittedCheckpoint({adapter:store,key:"r"});eq(recovery.status,"FALLBACK");eq(recovery.checkpoint.seal,c0.seal);ok(recovery.reasons.includes("verified-previous-checkpoint-used"));
  await assert.rejects(()=>d.persistCheckpointAtomic({adapter:store,key:"r",checkpoint:c2,expectedManifestSeal:saved.manifest.seal}),/repair manifest/);n++;
  const receipt=d.createManifestRepairReceipt({manifest:recovery.manifest,recoveredCheckpoint:recovery.checkpoint,reviewer:"recovery-controller",reason:"active content-addressed object failed integrity",at:"2026-09-15T02:04:00Z"});ok(d.verifyManifestRepairReceipt(receipt));
  const repaired=await d.repairManifestToFallback({adapter:store,key:"r",recovery,receipt,updatedAt:"2026-09-15T02:04:00Z"});eq(repaired.status,"REPAIRED_TO_VERIFIED_FALLBACK");eq(repaired.checkpoint.seal,c0.seal);eq(repaired.manifest.generation,2);
  recovery=await d.recoverCommittedCheckpoint({adapter:store,key:"r"});eq(recovery.status,"ACTIVE");eq(recovery.checkpoint.seal,c0.seal);
  const c1b=d.createFabricCheckpoint({fabricId:"research",principalId:"user-1",scopeId:"project-7",revision:1,previousSeal:c0.seal,state:{claims:["recovered-new"]},dependencyHeads:{sourceA:"v2"},committedAt:"2026-09-15T02:05:00Z"});
  saved=await d.persistCheckpointAtomic({adapter:store,key:"r",checkpoint:c1b,expectedManifestSeal:repaired.manifest.seal,updatedAt:"2026-09-15T02:05:00Z"});eq(saved.checkpoint.seal,c1b.seal);
  store.corruptRead.add(c1b.seal);store.corruptRead.add(c0.seal);recovery=await d.recoverCommittedCheckpoint({adapter:store,key:"r"});eq(recovery.status,"HALT");ok(recovery.reasons.includes("no-verified-fallback"));
  await assert.rejects(()=>d.persistCheckpointAtomic({adapter:store,key:"r",checkpoint:c2,expectedManifestSeal:saved.manifest.seal}),/unrecoverable/);n++;

  const badManifestStore=new MemStore();badManifestStore.manifest.set("x",{schema:"seven.fabric-checkpoint-manifest.v1",seal:"0".repeat(64)});recovery=await d.recoverCommittedCheckpoint({adapter:badManifestStore,key:"x"});eq(recovery.status,"HALT");ok(recovery.reasons.includes("manifest-corrupt"));
  await assert.rejects(()=>d.recoverCommittedCheckpoint({adapter:{},key:"x"}),/missing readManifest/);n++;

  let journal=d.createJournal({fabricId:"vision",principalId:"u",scopeId:"s"});ok(d.verifyJournal(journal));eq(journal.revision,0);
  journal=d.appendJournal(journal,{type:"CHECKPOINT_COMMIT",subjectSeal:c0.seal,detailHash:H("detail-1"),at:T0});ok(d.verifyJournal(journal));eq(journal.revision,1);eq(journal.events[0].previousEventSeal,null);
  journal=d.appendJournal(journal,{type:"RECOVERY",subjectSeal:c0.seal,detailHash:H("detail-2"),at:"2026-09-15T02:01:00Z"});ok(d.verifyJournal(journal));eq(journal.events[1].previousEventSeal,journal.events[0].eventSeal);
  const journalTamper={...journal,events:journal.events.map((e,i)=>i?{...e,type:"FAKE"}:e)};eq(d.verifyJournal(journalTamper),false);

  const e1=d.createDerivedCacheEntry({fabricId:"research",principalId:"user-1",scopeId:"project-7",sourceRefs:[{sourceId:"doc-a",versionId:"v1",locatorId:"L1"},{sourceId:"doc-b",versionId:"v2"}],transformHash:H("extractor-v1"),producerHash:H("producer-v1"),payload:{summary:"derived only",authority:false},createdAt:"2026-09-15T02:00:00Z",expiresAt:"2026-09-16T02:00:00Z"});
  ok(d.verifyDerivedCacheEntry(e1));eq(e1.authoritative,false);eq(e1.grantsAuthority,false);eq(e1.rebuildable,true);
  let hit=d.evaluateDerivedCacheEntry(e1,{principalId:"user-1",scopeId:"project-7",currentSourceVersions:{"doc-a":"v1","doc-b":"v2"},now:Date.parse("2026-09-15T03:00:00Z")});eq(hit.status,"HIT");eq(hit.payload.summary,"derived only");
  hit=d.evaluateDerivedCacheEntry(e1,{principalId:"other",scopeId:"project-7",currentSourceVersions:{"doc-a":"v1","doc-b":"v2"},now:Date.parse("2026-09-15T03:00:00Z")});eq(hit.status,"BLOCK");ok(hit.reasons.includes("principal-mismatch"));
  hit=d.evaluateDerivedCacheEntry(e1,{principalId:"user-1",scopeId:"project-7",currentSourceVersions:{"doc-a":"v9","doc-b":"v2"},now:Date.parse("2026-09-15T03:00:00Z")});eq(hit.status,"STALE");ok(hit.reasons.includes("source-version-drift:doc-a"));eq(hit.payload,null);
  hit=d.evaluateDerivedCacheEntry(e1,{principalId:"user-1",scopeId:"project-7",currentSourceVersions:{"doc-a":"v1","doc-b":"v2"},now:Date.parse("2026-09-17T03:00:00Z")});eq(hit.status,"STALE");ok(hit.reasons.includes("expired"));
  const cacheTamper={...e1,authoritative:true};eq(d.verifyDerivedCacheEntry(cacheTamper),false);eq(d.evaluateDerivedCacheEntry(cacheTamper,{currentSourceVersions:{}}).status,"BLOCK");
  throws(()=>d.createDerivedCacheEntry({fabricId:"x",principalId:"u",sourceRefs:[],transformHash:H("a"),producerHash:H("b"),payload:{}}),/sourceRefs required/);
  throws(()=>d.createDerivedCacheEntry({fabricId:"x",principalId:"u",sourceRefs:[{sourceId:"a",versionId:"1"},{sourceId:"a",versionId:"1"}],transformHash:H("a"),producerHash:H("b"),payload:{}}),/duplicate source/);
  throws(()=>d.createDerivedCacheEntry({fabricId:"x",principalId:"u",sourceRefs:[{sourceId:"a",versionId:"1"}],transformHash:H("a"),producerHash:H("b"),payload:{},createdAt:"2026-09-16T00:00:00Z",expiresAt:"2026-09-15T00:00:00Z"}),/expiry/);
  const e2=d.createDerivedCacheEntry({fabricId:"research",principalId:"user-1",scopeId:"project-7",sourceRefs:[{sourceId:"doc-a",versionId:"v1"}],transformHash:H("t2"),producerHash:H("p2"),payload:{x:"newer"},createdAt:"2026-09-15T04:00:00Z"});
  const e3=d.createDerivedCacheEntry({fabricId:"research",principalId:"user-1",scopeId:"project-7",sourceRefs:[{sourceId:"doc-a",versionId:"old"}],transformHash:H("t3"),producerHash:H("p3"),payload:{x:"stale"},createdAt:"2026-09-15T05:00:00Z"});
  let compact=d.compactDerivedCache([e1,e2,e3],{maxEntries:2,maxBytes:999999,currentSourceVersions:{"doc-a":"v1","doc-b":"v2"},now:Date.parse("2026-09-15T06:00:00Z")});eq(compact.kept.length,2);ok(compact.kept.some(x=>x.seal===e2.seal));ok(compact.kept.some(x=>x.seal===e1.seal));eq(compact.kept.some(x=>x.seal===e3.seal),false);
  compact=d.compactDerivedCache([e1,e2],{maxEntries:1,maxBytes:999999});eq(compact.kept.length,1);eq(compact.kept[0].seal,e2.seal);eq(compact.evictedSeals.length,1);
  compact=d.compactDerivedCache([e1,e2],{maxEntries:10,maxBytes:e2.payloadBytes});eq(compact.kept.length,1);eq(compact.totalBytes,e2.payloadBytes);

  const vision=d.createFabricCheckpoint({fabricId:"vision",principalId:"user-1",scopeId:"project-7",revision:0,state:{frames:["f1"]},dependencyHeads:{visualSource:"version-1"},committedAt:T0,rebuildable:true});ok(d.verifyFabricCheckpoint(vision));eq(vision.rebuildable,true);eq(vision.keyId===c0.keyId,false);
  const canon=d.createDerivedCacheEntry({fabricId:"canon",principalId:"user-1",scopeId:"work-1",sourceRefs:[{sourceId:"canon-source",versionId:"edition-2",locatorId:"episode-7"}],transformHash:H("canon-extract-v2"),producerHash:H("canon-pipeline"),payload:{factIds:["fact-1"]},createdAt:T0});ok(d.verifyDerivedCacheEntry(canon));eq(d.evaluateDerivedCacheEntry(canon,{principalId:"user-1",scopeId:"work-1",currentSourceVersions:{"canon-source":"edition-3"},now:Date.parse(T0)}).status,"STALE");

  console.log(`Durable Fabric State + Derived Cache: PASS (${n} assertions)`);
})().catch(e=>{console.error(e);process.exit(1)});
