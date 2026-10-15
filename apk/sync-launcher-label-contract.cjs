"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CONFIG = path.join(ROOT, "capacitor.config.json");

const config = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
const label = String(config.appName || "").trim();
if (!label) throw new Error("capacitor appName is required");

const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const targets = [
  {
    file: "capture-android-system-visuals.cjs",
    replacements: [
      ['return /(^|\\s)Seven(\\s|$)/i.test(t)&&parseBounds(n.bounds)', `return /(^|\\s)${escaped}(\\s|$)/i.test(t)&&parseBounds(n.bounds)`]
    ]
  },
  {
    file: "prepare-pixel-launcher-home.cjs",
    replacements: [
      ['/(^|\\s)Seven(\\s|$)/i.test(text(n))', `/(^|\\s)${escaped}(\\s|$)/i.test(text(n))`]
    ]
  },
  {
    file: "capture-android-themed-launcher-ui.cjs",
    replacements: [
      ['/(^|\\s)Seven(\\s|$)/i.test(nodeText(n))', `/(^|\\s)${escaped}(\\s|$)/i.test(nodeText(n))`]
    ]
  },
  {
    file: "capture-android-legacy-launcher-ui.cjs",
    replacements: [
      ['/(^|\\s)Seven(?:\\s|$)/i.test(text(n))', `/(^|\\s)${escaped}(?:\\s|$)/i.test(text(n))`],
      ['query:"Seven"', `query:${JSON.stringify(label)}`],
      ['"input","text","Seven"', `"input","text",${JSON.stringify(label)}`]
    ]
  }
];

let changed = 0;
for (const target of targets) {
  const file = path.join(__dirname, target.file);
  let source = fs.readFileSync(file, "utf8");
  let touched = false;
  for (const [oldText, newText] of target.replacements) {
    if (source.includes(newText)) continue;
    // Current Seven AI captures already contain the previous launcher label
    // ("Seven 2.4.3"), not the original "Seven" placeholder. Match either
    // exact known anchor; never rewrite arbitrary regular expressions.
    const plainLabelAnchor=oldText.includes('query:"Seven"')||oldText.includes('"input","text","Seven"');
    const legacyText=oldText.replace('Seven',plainLabelAnchor?'Seven 2.4.3':'Seven 2\\.4\\.3');
    const from=source.includes(oldText)?oldText:(source.includes(legacyText)?legacyText:null);
    if (!from) {
      throw new Error(`${target.file} launcher label contract drifted; refusing blind rewrite`);
    }
    source = source.replace(from, newText);
    touched = true;
  }
  if (touched) {
    fs.writeFileSync(file, source);
    changed++;
  }
}

console.log(`Android launcher label contract: PASS (${label}; synchronized ${changed}/${targets.length} launcher capture files)`);
