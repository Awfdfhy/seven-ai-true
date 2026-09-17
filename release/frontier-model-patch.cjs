"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_OUTPUT = path.join(ROOT, "dist", "seven_ai-release.html");
const MODEL_ID = "z-ai/glm-5-3";
const ANCHOR = "const FREE_MODEL_SEEDS = Object.freeze([";
const MODEL_SEED = 'Object.freeze({ provider:"nvidia", id:"z-ai/glm-5-3", label:"GLM 5.3 • Frontier", free:true, freeBasis:"free_endpoint", contextWindow:1048576, maxTokens:16384, effort:["low","high","max"], defaultEffort:"max", quality:99, speed:60, tasks:{general:98,coding:100,reasoning:99,research:97,planning:100}, capabilities:{stream:true,tools:true,vision:false,structured:false} }),';

function patchText(input) {
  const html = String(input);
  if (html.includes(`id:"${MODEL_ID}"`)) return { html, changed: false };
  const index = html.indexOf(ANCHOR);
  if (index < 0) throw new Error("Seven Free Model Fabric seed anchor missing");
  const at = index + ANCHOR.length;
  const patched = html.slice(0, at) + `\n            // Frontier free model refresh — verified NVIDIA NIM free endpoint, 2026-09.\n            ${MODEL_SEED}` + html.slice(at);
  return { html: patched, changed: true };
}

function patchFile(file = DEFAULT_OUTPUT) {
  if (!fs.existsSync(file)) throw new Error(`release HTML missing: ${file}`);
  const before = fs.readFileSync(file, "utf8");
  const result = patchText(before);
  if (result.changed) fs.writeFileSync(file, result.html);
  return { file, model: MODEL_ID, changed: result.changed, bytes: Buffer.byteLength(result.html) };
}

if (require.main === module) {
  try {
    const result = patchFile(process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_OUTPUT);
    console.log(`Seven frontier model patch: PASS (${result.model}; ${result.changed ? "added" : "already present"}; ${result.bytes} bytes)`);
  } catch (error) {
    console.error("Seven frontier model patch: FAIL", error.message);
    process.exit(1);
  }
}

module.exports = Object.freeze({ MODEL_ID, MODEL_SEED, ANCHOR, patchText, patchFile, DEFAULT_OUTPUT });
