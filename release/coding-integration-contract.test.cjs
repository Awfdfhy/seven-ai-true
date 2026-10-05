"use strict";
const assert=require("assert");
const {CONTRACT_VERSION,normalizeRequest,receipt}=require("./coding-integration-contract.cjs");
{
 const r=normalizeRequest({task:"Fix bounded bug",source:"self-development",maxRepairs:99});
 assert.equal(r.contract,CONTRACT_VERSION);assert.equal(r.maxRepairs,3);assert.ok(Object.isFrozen(r));
 assert.throws(()=>normalizeRequest({task:""}),/invalid-coding-request/);
 const e=receipt({schema:"seven-coding-evidence-v1",verdict:"READY_FOR_INTEGRATION",baseSha:"a",resultSha:"b",tests:["t"],failures:[],diffDigest:"d",proposal:{id:1},states:["VERIFY"]});
 assert.equal(e.contract,CONTRACT_VERSION);assert.equal(e.verdict,"READY_FOR_INTEGRATION");assert.deepEqual(e.tests,["t"]);assert.ok(Object.isFrozen(e));
 assert.throws(()=>receipt({schema:"wrong"}),/invalid-coding-evidence/);
}
console.log("coding integration contract: PASS");
