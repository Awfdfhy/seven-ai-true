"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path");
const {build}=require("./build-release.cjs");
const ROOT=path.resolve(__dirname,"..");
const built=build();
const html=fs.readFileSync(built.output,"utf8");
const runtime=fs.readFileSync(path.join(__dirname,"attachment-runtime.js"),"utf8");
const night=fs.readFileSync(path.join(__dirname,"brand","seven-night-black.svg"),"utf8");
const day=fs.readFileSync(path.join(__dirname,"brand","seven-day-white.svg"),"utf8");
assert.ok(html.includes('id="seven-attachment-runtime"'),"attachment runtime is not packaged");
assert.ok(html.includes('accept="*/*" multiple'),"release input does not accept universal files");
assert.ok(html.includes('title="Attach photos or files"'),"release attach control was not relabeled");
assert.ok(html.includes('<label>Attachments and knowledge files</label>'),"settings attachment label was not upgraded");
assert.ok(html.includes('window.SevenAttachments.extractForKnowledge'),"knowledge loader is not routed through attachment classifier");
assert.ok(!html.includes('accept=".txt,.pdf"'),"legacy txt/pdf-only accept filter survived release packaging");
assert.match(runtime,/data-seven-attach=["']?photos|dataset\.sevenAttach='photos'/,"Photos attachment route missing");
assert.match(runtime,/data-seven-attach=["']?files|dataset\.sevenAttach='files'/,"Files attachment route missing");
assert.match(runtime,/attachment_metadata_/,"binary metadata safety path missing");
assert.match(runtime,/MAX_TEXT_BYTES=8\*1024\*1024/,"mobile text extraction guard missing");
for(const svg of [night,day]){
  assert.match(svg,/<linearGradient/,"brand gradient missing");
  assert.match(svg,/#32BECF/i,"cyan identity stop missing");
  assert.match(svg,/#8265DC/i,"violet identity stop missing");
  assert.match(svg,/viewBox="0 0 108 108"/,"adaptive logo canvas changed");
}
assert.notEqual(night,day,"day and night logo assets must remain distinct");
console.log("Universal attachments + refreshed Seven logo: PASS");
