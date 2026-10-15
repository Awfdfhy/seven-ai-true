"use strict";
const path=require("path");
const ALWAYS=Object.freeze(["release/coding-production-runtime.test.cjs","release/coding-github-adapter.test.cjs","release/coding-test-selector.test.cjs","release/coding-fixture-e2e.test.cjs","release/coding-proposal-policy.test.cjs","release/coding-integration-contract.test.cjs"]);
const RULES=Object.freeze([
 {match:/^(release\/|seven_ai-final\.html$)/,tests:["release/github-self-dev.test.cjs","release/release-verify.cjs"]},
 {match:/^(release\/workspaces\/|release\/.*(?:css|js)$)/,tests:["release/static-audit.cjs"]},
 {match:/^(apk\/|package\.json$)/,tests:["apk/binary-verification.test.cjs"]},
 {match:/rpg|canon|world/i,tests:["release/canon-simulator.test.cjs","release/world-runtime.test.cjs"]},
 {match:/memory/i,tests:["memory.cjs"]},
 {match:/github|coding/i,tests:["release/github-self-dev.test.cjs"]}
]);
function norm(p){p=String(p||"").replace(/\\/g,"/").replace(/^\.\//,"");if(!p||p.includes(".."))throw Error("invalid-changed-path");return p}
function selectTests(changed){
 const files=[...new Set((changed||[]).map(norm))],selected=new Set(ALWAYS),reasons=[];
 for(const f of files)for(const rule of RULES)if(rule.match.test(f)){for(const t of rule.tests)selected.add(t);reasons.push({file:f,tests:rule.tests})}
 const tests=[...selected].sort();
 return Object.freeze({files,tests,reasons,mandatory:Object.freeze(ALWAYS.slice())});
}
function commands(selection){return selection.tests.map(t=>Object.freeze({file:t,command:[process.execPath,path.normalize(t)]}))}
module.exports={selectTests,commands};
