"use strict";
const assert=require("assert");
const fs=require("fs");
const os=require("os");
const path=require("path");
const portfolio=require("./logo-candidate-portfolio.cjs");
const tournament=require("./logo-tournament.cjs");
const brand=require("./brand-asset-contract.cjs");
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++},eq=(a,b,m)=>{assert.strictEqual(a,b,m);n++};
const p=portfolio.buildPortfolio();
eq(p.records.length,6);ok(portfolio.verifyPortfolioManifest(p.manifest));eq(p.manifest.winner,null);eq(p.manifest.freezeEligible,false);eq(p.manifest.authorityBoundary.productionAssetReplacementAllowed,false);eq(p.manifest.authorityBoundary.independentDistinctivenessRequired,true);eq(p.manifest.authorityBoundary.releaseBuildDeviceProofRequiredForFreeze,true);
eq(new Set(p.records.map(r=>r.candidate.family)).size,6);eq(new Set(p.records.map(r=>r.geometrySignature)).size,6);eq(new Set(p.records.map(r=>r.assets.find(a=>a.kind==="MASTER_VECTOR").ref.sha256)).size,6);
for(const r of p.records){
  const master=r.assets.find(a=>a.kind==="MASTER_VECTOR").ref;ok(tournament.verifyCandidate(r.candidate,{masterAsset:master,geometry:r.geometry}));eq(r.geometry.essentialSafeRegionPass,true);ok(r.geometry.essentialBounds.x>=tournament.SAFE.margin);ok(r.geometry.essentialBounds.y>=tournament.SAFE.margin);ok(r.geometry.essentialBounds.x+r.geometry.essentialBounds.width<=tournament.SAFE.layer-tournament.SAFE.margin);ok(r.geometry.essentialBounds.y+r.geometry.essentialBounds.height<=tournament.SAFE.layer-tournament.SAFE.margin);
  eq(r.assets.length,brand.REQUIRED_KINDS.length);eq(new Set(r.assets.map(a=>a.kind)).size,brand.REQUIRED_KINDS.length);
  for(const a of r.assets){ok(tournament.verifyAssetRef(a.ref));eq(a.inspection.verdict,"PASS");ok(!/brand\/final\//.test(a.inspection.path));}
  const core=r.assets.filter(a=>portfolio.CORE_VARIANTS.has(a.variant));for(const a of core)ok(a.svg.includes('viewBox="0 0 108 108"'));
  const review=portfolio.buildReviewSkeleton(r);eq(review.winnerEligible,false);eq(review.stages.DISTINCTIVENESS.status,"INDEPENDENT_REVIEW_REQUIRED");eq(review.stages.TINY_SIZE.status,"CAPTURE_REQUIRED");
}
const html=portfolio.contactSheetHtml(p.records);for(const r of p.records)ok(html.includes(r.candidate.id));for(const size of tournament.REQUIRED_SIZES)ok(html.includes(`>${size}<`));ok(html.includes("No winner, brand freeze, or production Android replacement is implied."));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"seven-logo-portfolio-"));const result=portfolio.writePortfolio(temp);ok(fs.existsSync(path.join(result.out,"portfolio-manifest.json")));ok(fs.existsSync(path.join(result.out,"review-worksheet.json")));ok(fs.existsSync(path.join(result.out,"contact-sheet.html")));
const diskManifest=JSON.parse(fs.readFileSync(path.join(result.out,"portfolio-manifest.json"),"utf8"));ok(portfolio.verifyPortfolioManifest(diskManifest));
for(const r of p.records)for(const a of r.assets){const full=path.join(result.out,"candidates",r.candidate.id,a.file);ok(fs.existsSync(full));eq(brand.fileSha256(fs.readFileSync(full)),a.ref.sha256);}
fs.rmSync(temp,{recursive:true,force:true});
console.log(`Logo Candidate Portfolio: PASS (${n} assertions; 6 real vector families, no fabricated winner)`);
