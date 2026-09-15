"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path");let n=0;const ok=(v,m)=>{assert.ok(v,m);n++};
const y=fs.readFileSync(path.join(__dirname,"..",".github","workflows","seven-tests.yml"),"utf8");
const pins={
  checkout:"actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
  setup:"actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
  upload:"actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a"
};
for(const [name,pin] of Object.entries(pins))ok(y.includes(pin),`${name} action must be immutable-SHA pinned`);
ok(!/uses:\s*actions\/(?:checkout|setup-node|upload-artifact)@v\d+/i.test(y),"mutable major tags must not be executable refs");
ok(y.includes("npm install --ignore-scripts --no-save playwright@1.63.0 pdfjs-dist@4.10.38"),"test toolchain must be explicit and install scripts disabled");
ok(y.includes("npm install --package-lock-only --ignore-scripts --no-audit --no-fund"),"audit resolution must suppress install scripts");
ok(y.includes("npm audit --json > /tmp/seven-audit-full.json || true"),"full graph audit evidence required");
ok(y.includes("npm audit --omit=dev --json > /tmp/seven-audit-prod.json || true"),"production audit evidence required");
ok(y.includes("node release/dependency-audit-gate.cjs"),"sealed dependency audit gate required");
ok(y.includes("package-manager-cache: false"),"setup-node package-manager cache must be explicitly disabled without committed lockfile");
ok(/permissions:\s*\n\s*contents:\s*read/.test(y),"workflow token must retain read-only contents permission");
console.log(`CI Supply Chain Contract: PASS (${n} assertions; immutable action pins, no install scripts, explicit tool versions, read-only token, audit gate)`);
