"use strict";
const fs=require("fs");
const path=require("path");
const portfolio=require("./logo-candidate-portfolio.cjs");
const host=require("./logo-host-evidence.cjs");
(async()=>{
  const branch=String(process.env.GITHUB_REF_NAME||"local-host"),commitSha=String(process.env.GITHUB_SHA||"local-host-commit"),outDir=path.resolve(process.cwd(),"dist/logo-tournament");
  fs.mkdirSync(outDir,{recursive:true});
  const p=portfolio.buildPortfolio();
  const {chromium}=require("playwright"),browser=await chromium.launch({headless:true});
  try{const pack=await host.capturePortfolio({browser,records:p.records,outDir,branch,commitSha});if(!host.verifyPack(pack,p.records))throw new Error("host visual evidence pack failed verification");fs.writeFileSync(path.join(outDir,"host-visual-evidence.json"),JSON.stringify(pack,null,2));const summary={schema:"seven-logo-host-visual-summary",version:1,branch,commitSha,candidates:pack.candidateCount,packages:pack.packageCount,coverage:Object.fromEntries(pack.candidates.map(c=>[c.candidateId,c.coverage.verdict])),packHash:pack.packHash,authorityBoundary:pack.authorityBoundary};fs.writeFileSync(path.join(outDir,"host-visual-summary.json"),JSON.stringify(summary,null,2));console.log(`logo host visual evidence: PASS (${pack.candidateCount} candidates; ${pack.packageCount} exact bindings; render-integrity only)`)}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
