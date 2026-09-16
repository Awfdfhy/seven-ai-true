"use strict";
const fs=require("fs"),path=require("path"),assert=require("assert");
const ROOT=path.resolve(__dirname,"..");
const browserFiles=[
  "release/canon-simulator.js",
  "release/world-runtime.js",
  "release/research-runtime.js",
  "release/performance-runtime.js",
  "release/control-runtime.js",
  "release/control-bridge.js",
  "release/execution-bridge.js",
  "release/pdf-runtime.js",
  "release/motion-runtime.js",
  "release/ui-runtime.js",
  "release/beta-ui-runtime.js",
  "release/workspaces/hub.js",
  "release/workspaces/coding.js",
  "release/workspaces/research.js",
  "release/workspaces/rpg.js",
  "release/workspaces/generated-ui.js",
  "release/brand/runtime.js"
];
const forbidden=[
  ["optional chaining",/\?\./],
  ["nullish coalescing",/\?\?/],
  ["logical OR assignment",/\|\|=/],
  ["logical AND assignment",/&&=/],
  ["nullish assignment",/\?\?=/],
  ["String.replaceAll",/\.replaceAll\s*\(/],
  ["Object.fromEntries",/Object\.fromEntries\s*\(/],
  ["Promise.allSettled",/Promise\.allSettled\s*\(/],
  ["DOM replaceChildren",/\.replaceChildren\s*\(/]
];
let checks=0;
for(const rel of browserFiles){
  const abs=path.join(ROOT,rel);
  assert.ok(fs.existsSync(abs),`browser runtime missing: ${rel}`);checks++;
  const src=fs.readFileSync(abs,"utf8");
  for(const [name,re] of forbidden){
    assert.ok(!re.test(src),`${rel} uses ${name}, which is outside the API 28 WebView compatibility floor`);checks++;
  }
}
console.log(`Android WebView Compatibility: PASS (${checks} assertions; ${browserFiles.length} browser runtimes)`);
