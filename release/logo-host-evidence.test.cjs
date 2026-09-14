"use strict";
const assert=require("assert");
const portfolio=require("./logo-candidate-portfolio.cjs");
const host=require("./logo-host-evidence.cjs");
const passb=require("./logo-tournament-passb.cjs");
const visual=require("./visual-evidence-runtime-final.cjs");
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++},eq=(a,b,m)=>{assert.strictEqual(a,b,m);n++};
const p=portfolio.buildPortfolio(),record=p.records[0],m=host.matrix();eq(m.length,18);eq(new Set(m.map(x=>`${x.stage}:${x.variant}`)).size,18);
for(const [stage,variants] of Object.entries(passb.requiredVisualCoverage()))for(const variant of variants)ok(m.some(x=>x.stage===stage&&x.variant===variant));
const packages=m.map(d=>host.createSyntheticPackage({record,descriptor:d,branch:"unit-branch",commitSha:"unit-commit"}));eq(packages.length,18);for(const pkg of packages){eq(pkg.evidence.foundation.tier,visual.EVIDENCE_TIER.SIMULATED);ok(passb.verifyVisualEvidenceBinding(pkg.binding,{candidate:record.candidate,scenario:pkg.scenario,artifact:pkg.artifact,evidence:pkg.evidence}));eq(pkg.evidence.status,"PASS");ok(pkg.evidence.foundation.notes.includes("render-integrity-only"));}
const coverage=passb.evaluateVisualEvidenceCoverage({candidate:record.candidate,packages});eq(coverage.verdict,"PASS");eq(coverage.missing.length,0);eq(coverage.failures.length,0);eq(coverage.covered.length,18);
const missing=passb.evaluateVisualEvidenceCoverage({candidate:record.candidate,packages:packages.slice(1)});eq(missing.verdict,"INCONCLUSIVE");eq(missing.missing.length,1);
const second=host.createSyntheticPackage({record,descriptor:m[0],branch:"other-branch",commitSha:"other-commit"});const cross=passb.evaluateVisualEvidenceCoverage({candidate:record.candidate,packages:[second,...packages.slice(1)]});eq(cross.verdict,"BLOCK");ok(cross.failures.some(x=>x.startsWith("cross-revision-evidence:")));
for(const d of m){const html=host.renderHtml(record,d);ok(html.includes('id="mark"'));ok(html.includes(record.candidate.id));}
const tiny=host.renderHtml(record,{stage:"TINY_SIZE",variant:"size-16"});ok(tiny.includes("width:16px;height:16px"));const circle=host.renderHtml(record,{stage:"ADAPTIVE_MASK",variant:"mask-circle"});ok(circle.includes("border-radius:50%"));const day=host.renderHtml(record,{stage:"DAY_NIGHT",variant:"day"});ok(day.includes("#f7fbff"));const launcher=host.renderHtml(record,{stage:"PRODUCT_CONTEXT",variant:"launcher"});ok(launcher.includes("Launcher"));
const scenario=host.createScenario(record.candidate,{stage:"SILHOUETTE",variant:"mono-silhouette"},{branch:"b",commitSha:"c"});ok(visual.verifyScenario(scenario));ok(scenario.tags.includes(`logo-candidate:${record.candidate.id}`));ok(scenario.tags.includes("logo-stage:SILHOUETTE"));ok(scenario.tags.includes("logo-variant:mono-silhouette"));
const audits=host.auditsForScenario(scenario);eq(audits.length,2);eq(audits[0].status,"PASS");eq(audits[1].status,"PASS");
console.log(`Logo Host Evidence: PASS (${n} assertions; full 18-variant render coverage matrix, simulated unit evidence only)`);
