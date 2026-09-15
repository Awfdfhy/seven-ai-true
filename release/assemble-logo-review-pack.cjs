"use strict";
const fs=require("fs");
const path=require("path");
const portfolioRuntime=require("./logo-candidate-portfolio.cjs");
const reviewPack=require("./logo-review-pack.cjs");

(()=>{
  const root=process.cwd(),outDir=path.resolve(root,"dist/logo-tournament"),hostPath=path.join(outDir,"host-visual-evidence.json");
  if(!fs.existsSync(hostPath))throw new Error("host visual evidence must be captured before assembling review pack");
  const hostPack=JSON.parse(fs.readFileSync(hostPath,"utf8")),portfolio=portfolioRuntime.buildPortfolio();
  const artifactRef=process.env.GITHUB_RUN_ID&&process.env.GITHUB_REPOSITORY?`github-actions://${process.env.GITHUB_REPOSITORY}/${process.env.GITHUB_RUN_ID}/seven-ai-release`:"dist/logo-tournament";
  const bundle=reviewPack.writeReviewBundle({root,portfolio,hostPack,builderContext:"seven-ci-logo-builder-wave14-v1",artifactRef});
  const reportPath=path.join(outDir,"build-report.json");if(fs.existsSync(reportPath)){
    const report=JSON.parse(fs.readFileSync(reportPath,"utf8"));report.status="READY_FOR_INDEPENDENT_SEMANTIC_REVIEW";report.reviewPackSeal=bundle.seal;report.hostPackHash=bundle.hostPackHash;report.reviewHandoffCount=bundle.candidateCount;report.winner=null;report.freezeEligible=false;report.notes=[...(report.notes||[]),"HOST render evidence is indexed into each reviewer worksheet.","Six sealed independent-review handoffs and submission templates are materialized.","Independent semantic/distinctiveness review and RELEASE_BUILD_DEVICE evidence remain mandatory."];
    fs.writeFileSync(reportPath,JSON.stringify(report,null,2));
  }
  console.log(`logo independent review pack: PASS (${bundle.candidateCount} sealed handoffs; HOST evidence indexed; no winner claim)`);
})()
