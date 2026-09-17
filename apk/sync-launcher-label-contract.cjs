"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CONFIG = path.join(ROOT, "capacitor.config.json");
const CAPTURE = path.join(__dirname, "capture-android-system-visuals.cjs");

const config = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
const label = String(config.appName || "").trim();
if (!label) throw new Error("capacitor appName is required");

const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
let source = fs.readFileSync(CAPTURE, "utf8");

const oldMatcher = 'return /(^|\\s)Seven(\\s|$)/i.test(t)&&parseBounds(n.bounds)';
const newMatcher = `return /(^|\\s)${escaped}(\\s|$)/i.test(t)&&parseBounds(n.bounds)`;

if (source.includes(newMatcher)) {
  console.log(`Android launcher label contract: PASS (${label}; already synchronized)`);
  process.exit(0);
}
if (!source.includes(oldMatcher)) {
  throw new Error("launcher label matcher drifted; refusing blind rewrite");
}

source = source.replace(oldMatcher, newMatcher)
  .replace(/Seven launcher node not found in genuine system launcher/g, `${label} launcher node not found in genuine system launcher`)
  .replace(/Seven could not be placed and verified on launcher workspace/g, `${label} could not be placed and verified on launcher workspace`);
fs.writeFileSync(CAPTURE, source);
console.log(`Android launcher label contract: PASS (${label})`);
