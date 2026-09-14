"use strict";
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const {pathToFileURL}=require("url");
const portfolio=require("./logo-candidate-portfolio.cjs");
function sha(buf){return crypto.createHash("sha256").update(buf).digest("hex")}
(async()=>{
  const {out,portfolio:p}=portfolio.writePortfolio(process.cwd());
  const {chromium}=require("playwright");const browser=await chromium.launch({headless:true});
  try{const page=await browser.newPage({viewport:{width:1440,height:1800},deviceScaleFactor:1});await page.goto(pathToFileURL(path.join(out,"contact-sheet.html")).href,{waitUntil:"load"});const pngPath=path.join(out,"contact-sheet.png");await page.screenshot({path:pngPath,fullPage:true,animations:"disabled"});const buf=fs.readFileSync(pngPath);const report={schema:"seven-logo-tournament-review-pack",version:1,candidateCount:p.records.length,portfolioManifestSeal:p.manifest.seal,contactSheet:{path:"dist/logo-tournament/contact-sheet.png",sha256:sha(buf),bytes:buf.length,captureTier:"HOST"},status:"READY_FOR_INDEPENDENT_REVIEW",winner:null,freezeEligible:false,notes:["Host contact sheet is review evidence, not device certification.","No finalist or production Android asset is selected by this build step."]};fs.writeFileSync(path.join(out,"build-report.json"),JSON.stringify(report,null,2));console.log(`logo tournament review pack: PASS (${p.records.length} candidates; ${buf.length} screenshot bytes; review required)`)}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
