"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const android = require("../release/android-visual-certification.cjs");
const profile = require("./capture-android-release-profile.cjs");

const APP_ID = "ai.seven.app";
const DEFAULT_APK = "android/app/build/outputs/apk/release/app-release.apk";
const DEFAULT_BUILD = "evidence/android/build-identity.json";
const SET_WALLPAPER = "android.intent.action.SET_WALLPAPER";

function run(cmd, args, { allow = false, encoding = "utf8", timeout = 20000 } = {}) {
  const r = spawnSync(cmd, args, { encoding, maxBuffer: 32 * 1024 * 1024, timeout });
  if (!allow && (r.error || r.status !== 0)) {
    throw Error(`${cmd} ${args.join(" ")} failed: ${r.error?.message || r.stderr || r.stdout}`);
  }
  return r;
}
function adb(...args) { return run("adb", args); }
function sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
function shaBytes(b) { return crypto.createHash("sha256").update(b).digest("hex"); }
function writeJson(p, v) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
}
function textProp(name) { return adb("shell", "getprop", name).stdout.trim(); }
function attrs(s) {
  const o = {};
  for (const m of String(s).matchAll(/([A-Za-z0-9_:-]+)="([^"]*)"/g)) {
    o[m[1]] = m[2].replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  }
  return o;
}
function parseNodes(xml) {
  return [...String(xml).matchAll(/<node\b([^>]*)\/?>/g)].map(m => attrs(m[1]));
}
function parseBounds(s) {
  const m = String(s || "").match(/^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$/);
  if (!m) return null;
  const x1 = +m[1], y1 = +m[2], x2 = +m[3], y2 = +m[4];
  if (x2 <= x1 || y2 <= y1) return null;
  return {
    x1, y1, x2, y2,
    cx: Math.round((x1 + x2) / 2),
    cy: Math.round((y1 + y2) / 2),
    w: x2 - x1,
    h: y2 - y1
  };
}
function nodeText(n) { return `${n.text || ""} ${n["content-desc"] || ""}`.trim(); }
function dumpUi() {
  const remote = "/data/local/tmp/seven-themed-ui.xml";
  run("adb", ["shell", "uiautomator", "dump", remote]);
  const r = spawnSync("adb", ["exec-out", "cat", remote], {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024
  });
  if (r.error || r.status !== 0 || !r.stdout.includes("<hierarchy")) {
    throw Error(`customization UI dump unavailable: ${r.error?.message || r.stderr || r.stdout}`);
  }
  return r.stdout;
}
function visibleUiSummary(xml) {
  const rows = [];
  for (const n of parseNodes(xml)) {
    const text = nodeText(n), id = n["resource-id"] || "";
    if (!text && !id) continue;
    const item = [
      text && `text=${JSON.stringify(text)}`,
      id && `id=${id}`,
      n.clickable === "true" && "clickable",
      n.checkable === "true" && `checkable:${n.checked}`,
      n.selected === "true" && "selected"
    ].filter(Boolean).join(" ");
    if (item && !rows.includes(item)) rows.push(item);
    if (rows.length >= 40) break;
  }
  return rows.join(" | ") || "<no labeled UI nodes>";
}
function foreground() {
  const r = run("adb", ["shell", "dumpsys", "activity", "activities"], { allow: true, timeout: 12000 });
  const raw = String(r.stdout || "");
  const lines = raw.split(/\r?\n/).map(x => x.trim()).filter(x => /mResumedActivity|topResumedActivity|ResumedActivity/.test(x));
  return (lines.slice(0, 4).join(" ; ") || "<foreground unavailable>").replace(/\s+/g, " ");
}
function tapNode(n, label) {
  const b = parseBounds(n && n.bounds);
  if (!b) throw Error(`${label || "UI node"} has no verified bounds`);
  adb("shell", "input", "tap", String(b.cx), String(b.cy));
  return b;
}
function screen(outPath) {
  const r = spawnSync("adb", ["exec-out", "screencap", "-p"], { encoding: null, maxBuffer: 32 * 1024 * 1024 });
  if (r.error || r.status !== 0) throw Error(`system screencap failed: ${r.error?.message || r.stderr}`);
  const b = r.stdout;
  if (!Buffer.isBuffer(b) || b.length < 24 || b.toString("hex", 0, 8) !== "89504e470d0a1a0a") {
    throw Error("invalid PNG bytes");
  }
  const result = { width: b.readUInt32BE(16), height: b.readUInt32BE(20), sha256: shaBytes(b) };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, b);
  return result;
}
function home() { adb("shell", "input", "keyevent", "KEYCODE_HOME"); sleep(700); }
function wm() {
  const [widthPx, heightPx] = profile.lastPair(adb("shell", "wm", "size").stdout);
  return { widthPx, heightPx };
}
function sevenNode(xml) {
  return parseNodes(xml).find(n => /(^|\s)Seven(\s|$)/i.test(nodeText(n)) && parseBounds(n.bounds)) || null;
}
function appsNode(xml) {
  return parseNodes(xml).find(n => /^(apps|all apps)$/i.test(nodeText(n)) && parseBounds(n.bounds)) || null;
}
function openAllAppsAndFindSeven() {
  home();
  let xml = dumpUi(), node = sevenNode(xml);
  if (node) return { xml, node, context: "home" };
  const apps = appsNode(xml), m = wm();
  if (apps) {
    const b = parseBounds(apps.bounds);
    adb("shell", "input", "tap", String(b.cx), String(b.cy));
    sleep(700);
  } else {
    adb("shell", "input", "swipe", String(Math.round(m.widthPx * .5)), String(Math.round(m.heightPx * .82)), String(Math.round(m.widthPx * .5)), String(Math.round(m.heightPx * .24)), "450");
    sleep(800);
  }
  for (let i = 0; i < 12; i++) {
    xml = dumpUi();
    node = sevenNode(xml);
    if (node) return { xml, node, context: "all-apps" };
    adb("shell", "input", "swipe", String(Math.round(m.widthPx * .55)), String(Math.round(m.heightPx * .78)), String(Math.round(m.widthPx * .55)), String(Math.round(m.heightPx * .28)), "350");
    sleep(450);
  }
  throw Error("Seven launcher node not found in genuine system launcher");
}
function ensureSevenOnHome() {
  home();
  let xml = dumpUi(), node = sevenNode(xml);
  if (node) return { xml, node, context: "home" };
  const found = openAllAppsAndFindSeven(), b = parseBounds(found.node.bounds), m = wm();
  adb("shell", "input", "swipe", String(b.cx), String(b.cy), String(Math.round(m.widthPx * .52)), String(Math.round(m.heightPx * .32)), "1400");
  sleep(1300);
  home();
  xml = dumpUi();
  node = sevenNode(xml);
  if (!node) throw Error("Seven could not be placed and verified on launcher workspace");
  return { xml, node, context: "home" };
}
function versionParts(v) { return String(v).split(/[^0-9]+/).filter(Boolean).map(Number); }
function compareVersions(a, b) {
  const x = versionParts(a), y = versionParts(b), n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) {
    const d = (x[i] || 0) - (y[i] || 0);
    if (d) return d;
  }
  return String(a).localeCompare(String(b));
}
function latestBuildTool(name) {
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!sdk) throw Error("ANDROID_HOME/ANDROID_SDK_ROOT required");
  const root = path.join(sdk, "build-tools");
  const versions = fs.readdirSync(root, { withFileTypes: true })
    .filter(x => x.isDirectory()).map(x => x.name).sort(compareVersions).reverse();
  for (const v of versions) {
    const p = path.join(root, v, name);
    if (fs.existsSync(p)) return p;
  }
  throw Error(`${name} unavailable in Android build-tools`);
}
function exactThemedResourceWitness(apk) {
  const out = run(latestBuildTool("aapt"), ["dump", "resources", apk], { timeout: 30000 }).stdout;
  const esc = APP_ID.replace(/\./g, "\\.");
  const has = (type, name) => new RegExp(`(?:${esc}:)?${type}/${name}(?=[:\\s])`).test(out);
  const launcher = has("mipmap", "ic_launcher");
  const foreground = has("mipmap", "ic_launcher_foreground");
  const background = has("color", "seven_launcher_background");
  const monochrome = has("mipmap", "ic_launcher_monochrome");
  if (!launcher || !foreground || !background || !monochrome) {
    throw Error(`exact APK themed launcher resources incomplete (launcher=${launcher},foreground=${foreground},background=${background},monochrome=${monochrome})`);
  }
  return { class: "monochrome-themed", resourceTable: "aapt", witnessHash: shaBytes(Buffer.from(out)) };
}
function resolveCustomization() {
  const args = ["resolve-activity", "--brief", "-a", SET_WALLPAPER];
  let r = run("adb", ["shell", "cmd", "package", ...args], { allow: true });
  let raw = `${r.stdout || ""}\n${r.stderr || ""}`;
  if (r.status !== 0 || !raw.includes("/")) {
    r = run("adb", ["shell", "pm", ...args], { allow: true });
    raw = `${r.stdout || ""}\n${r.stderr || ""}`;
  }
  const component = raw.trim().split(/\r?\n/).filter(Boolean).reverse()
    .find(x => /^[A-Za-z0-9_.]+\/[A-Za-z0-9_.$]+$/.test(x.trim()));
  if (!component) throw Error(`system wallpaper/customization activity unavailable: ${raw.trim()}`);
  return component.trim();
}
function resolverState(xml) {
  const nodes = parseNodes(xml).filter(n => parseBounds(n.bounds));
  const active = nodes.some(n => /^complete action using$/i.test(nodeText(n))) || /ResolverActivity/.test(foreground());
  if (!active) return { active: false };
  const target = nodes.find(n => /^wallpaper\s*(?:&|and)\s*style$/i.test(nodeText(n)))
    || nodes.find(n => /wallpaper.*style/i.test(nodeText(n)));
  const once = nodes.find(n => /^just once$/i.test(nodeText(n)));
  const always = nodes.find(n => /^always$/i.test(nodeText(n)));
  return { active: true, target: target || null, once: once || null, always: always || null };
}
function traverseResolverIfPresent() {
  const proof = { encountered: false, target: null, targetBounds: null, confirmation: null, beforeUiHash: null, afterUiHash: null };
  let last = "";
  for (let pass = 0; pass < 7; pass++) {
    const xml = dumpUi();
    last = xml;
    const state = resolverState(xml);
    if (!state.active) {
      proof.afterUiHash = shaBytes(Buffer.from(xml));
      return proof;
    }
    proof.encountered = true;
    if (!proof.beforeUiHash) proof.beforeUiHash = shaBytes(Buffer.from(xml));
    if (!proof.target && state.target) {
      proof.target = nodeText(state.target);
      proof.targetBounds = tapNode(state.target, "Wallpaper & style resolver target");
      sleep(700);
      continue;
    }
    if (proof.target && state.once) {
      tapNode(state.once, "Just once resolver confirmation");
      proof.confirmation = "Just once";
      sleep(1200);
      continue;
    }
    if (proof.target && !state.once && !state.always) {
      sleep(500);
      continue;
    }
    throw Error(`Android resolver could not select genuine Wallpaper & style target; foreground=${foreground()}; ui=${visibleUiSummary(xml)}`);
  }
  throw Error(`Android resolver did not exit after selecting Wallpaper & style; foreground=${foreground()}; ui=${visibleUiSummary(last)}`);
}
function themedUiState(xml) {
  const nodes = parseNodes(xml);
  const labels = nodes.filter(n => /\bthemed\s+icons?\b/i.test(nodeText(n)) && parseBounds(n.bounds));
  if (!labels.length) return null;
  for (const label of labels) {
    const lb = parseBounds(label.bounds);
    const near = nodes.filter(n => n.checkable === "true" && parseBounds(n.bounds))
      .map(n => ({ node: n, b: parseBounds(n.bounds) }))
      .filter(x => Math.abs(x.b.cy - lb.cy) <= Math.max(180, lb.h * 3))
      .sort((a, b) => Math.abs(a.b.cy - lb.cy) - Math.abs(b.b.cy - lb.cy))[0];
    if (near) return { label, toggle: near.node, checked: near.node.checked === "true", activation: near.node, bounds: near.b };
  }
  const clickable = labels.find(n => n.clickable === "true") || labels[0];
  return { label: labels[0], toggle: null, checked: null, activation: clickable, bounds: parseBounds(clickable.bounds) };
}
function homeScreenTab(xml) {
  const nodes = parseNodes(xml).filter(n => parseBounds(n.bounds));
  const exact = nodes.filter(n => /^home screen$/i.test(nodeText(n)));
  if (exact.length) return exact.find(n => n.clickable === "true") || exact[0];
  const ids = nodes.filter(n => /(?:^|:id\/)(?:home_screen_tab(?:_text)?|secondary_tab(?:_text)?)$/i.test(n["resource-id"] || "") && /home/i.test(nodeText(n)));
  return ids.find(n => n.clickable === "true") || ids[0] || null;
}
function wallpaperStyleEntry(xml) {
  const nodes = parseNodes(xml).filter(n => parseBounds(n.bounds));
  const exact = nodes.filter(n => /^wallpaper\s*(?:&|and)\s*style$/i.test(nodeText(n)));
  if (exact.length) return exact.find(n => n.clickable === "true") || exact[0];
  const loose = nodes.filter(n => /wallpaper.*style/i.test(nodeText(n)));
  return loose.find(n => n.clickable === "true") || loose[0] || null;
}
function customizationSurfaceVisible(xml) {
  if (themedUiState(xml) || homeScreenTab(xml)) return true;
  return parseNodes(xml).some(n => /wallpaper\s*(?:&|and)\s*style/i.test(nodeText(n)) && /(?:wallpaper|customization|picker)/i.test(n["resource-id"] || ""));
}
function openCustomizationFromLauncher() {
  const m = wm();
  const points = [[.50, .56], [.50, .46], [.25, .58], [.75, .58], [.50, .68]];
  let last = "";
  for (let attempt = 0; attempt < points.length; attempt++) {
    home();
    const [fx, fy] = points[attempt];
    const x = Math.round(m.widthPx * fx), y = Math.round(m.heightPx * fy);
    adb("shell", "input", "swipe", String(x), String(y), String(x), String(y), "1250");
    sleep(850);
    const menuXml = dumpUi();
    last = menuXml;
    const entry = wallpaperStyleEntry(menuXml);
    if (!entry) continue;
    const menuHash = shaBytes(Buffer.from(menuXml));
    const bounds = tapNode(entry, "Wallpaper & style launcher menu entry");
    sleep(1500);
    const after = dumpUi();
    last = after;
    if (customizationSurfaceVisible(after) || /(?:wallpaper|customization|picker)/i.test(foreground())) {
      return {
        method: "launcher-long-press",
        attempt: attempt + 1,
        press: { x, y, durationMs: 1250 },
        entry: nodeText(entry),
        entryBounds: bounds,
        menuUiHash: menuHash,
        afterUiHash: shaBytes(Buffer.from(after))
      };
    }
  }
  throw Error(`genuine launcher long-press did not expose/open Wallpaper & style; foreground=${foreground()}; ui=${visibleUiSummary(last)}`);
}
function ensureCustomizationSurface() {
  let xml = dumpUi();
  if (customizationSurfaceVisible(xml)) {
    return { method: "set-wallpaper-action", uiHash: shaBytes(Buffer.from(xml)) };
  }
  sleep(500);
  xml = dumpUi();
  if (customizationSurfaceVisible(xml)) {
    return { method: "set-wallpaper-action-delayed", uiHash: shaBytes(Buffer.from(xml)) };
  }
  return openCustomizationFromLauncher();
}
function selectHomeScreen() {
  let last = "";
  for (let pass = 0; pass < 6; pass++) {
    const xml = dumpUi();
    last = xml;
    if (themedUiState(xml)) return { selected: false, alreadyHome: true, uiHash: shaBytes(Buffer.from(xml)) };
    const tab = homeScreenTab(xml);
    if (tab) {
      const before = shaBytes(Buffer.from(xml));
      const bounds = tapNode(tab, "Home screen customization tab");
      sleep(900);
      const after = dumpUi();
      const state = themedUiState(after);
      const selected = parseNodes(after).some(n => /^home screen$/i.test(nodeText(n)) && n.selected === "true");
      if (state || selected || shaBytes(Buffer.from(after)) !== before) {
        return { selected: true, alreadyHome: false, bounds, uiHash: shaBytes(Buffer.from(after)) };
      }
      last = after;
    }
    sleep(350);
  }
  throw Error(`Home screen customization tab unavailable; foreground=${foreground()}; ui=${visibleUiSummary(last)}`);
}
function findThemedControl() {
  const m = wm();
  let last = "";
  for (let pass = 0; pass < 10; pass++) {
    const xml = dumpUi();
    last = xml;
    const state = themedUiState(xml);
    if (state) return { xml, state, pass };
    adb("shell", "input", "swipe", String(Math.round(m.widthPx * .5)), String(Math.round(m.heightPx * .80)), String(Math.round(m.widthPx * .5)), String(Math.round(m.heightPx * .24)), "380");
    sleep(550);
  }
  throw Error(`genuine Home screen customization UI did not expose a Themed icons control; foreground=${foreground()}; ui=${visibleUiSummary(last)}`);
}
function enableThemedViaSystemUi() {
  const component = resolveCustomization();
  const pkg = component.split("/")[0];
  if (pkg && pkg !== "android") run("adb", ["shell", "am", "force-stop", pkg], { allow: true });
  const launch = run("adb", ["shell", "am", "start", "-W", "-a", SET_WALLPAPER], { timeout: 12000 });
  sleep(1300);
  const resolver = traverseResolverIfPresent();
  sleep(500);
  const entry = ensureCustomizationSurface();
  sleep(500);
  const homeSelection = selectHomeScreen();
  let found = findThemedControl();
  const beforeHash = shaBytes(Buffer.from(found.xml));
  if (found.state.checked !== true) {
    tapNode(found.state.activation, "Themed icons toggle");
    sleep(1200);
    found = findThemedControl();
  }
  if (found.state.checked !== true) {
    throw Error(`Themed icons system UI did not expose a checked state after activation; foreground=${foreground()}; ui=${visibleUiSummary(found.xml)}`);
  }
  return {
    kind: "system-customization-ui",
    component,
    action: SET_WALLPAPER,
    launchHash: shaBytes(Buffer.from(String(launch.stdout || ""))),
    resolver,
    entry,
    homeSelection,
    label: nodeText(found.state.label),
    toggleResourceId: found.state.toggle?.["resource-id"] || null,
    checked: true,
    beforeUiHash: beforeHash,
    afterUiHash: shaBytes(Buffer.from(found.xml)),
    proof: "uiautomator-checked-state"
  };
}
function main(env = process.env) {
  const apk = path.resolve(env.SEVEN_RELEASE_APK || DEFAULT_APK);
  const build = JSON.parse(fs.readFileSync(path.resolve(env.SEVEN_ANDROID_BUILD_IDENTITY || DEFAULT_BUILD), "utf8"));
  if (!android.verifyBuildIdentity(build)) throw Error("verified release build identity required");
  if (profile.fileHash(apk) !== build.artifactSha256) throw Error("exact APK hash/build identity mismatch");
  const profileId = String(env.SEVEN_ANDROID_PROFILE_ID || "api36-modern");
  const outDir = path.resolve(env.SEVEN_ANDROID_PROFILE_OUT || `evidence/android/profiles/${profileId}`);
  const ePath = path.join(outDir, "profile-evidence.json");
  if (!fs.existsSync(ePath)) throw Error("existing genuine release profile evidence required before themed launcher capture");
  const evidence = JSON.parse(fs.readFileSync(ePath, "utf8"));
  if (evidence.buildSeal !== build.seal || evidence.artifactSha256 !== build.artifactSha256) throw Error("profile evidence build drift");
  if (!android.verifyDeviceProof(evidence.device) || evidence.device.apiLevel < 33) throw Error("verified API33+ device proof required");
  adb("install", "-r", apk);
  const resource = exactThemedResourceWitness(apk);
  const customization = enableThemedViaSystemUi();
  const found = ensureSevenOnHome();
  const file = path.join(outDir, "system-screenshots", "launcher-themed.png");
  const shot = screen(file);
  const witness = {
    kind: "system-launcher-themed",
    customization,
    resource,
    uiHash: shaBytes(Buffer.from(found.xml)),
    bounds: found.node.bounds,
    context: found.context
  };
  const receipt = android.createCaptureReceipt({
    build,
    device: evidence.device,
    scenario: "launcher-themed",
    captureMethod: "adb-screencap",
    screenshotSha256: shot.sha256,
    width: shot.width,
    height: shot.height,
    locale: textProp("persist.sys.locale") || textProp("ro.product.locale") || "en-US",
    direction: "ltr",
    theme: "system",
    reducedMotion: false,
    sourceRef: `github-actions:${env.GITHUB_RUN_ID || "local"}:${profileId}:launcher-themed:system-customization-ui:${android.hash(witness)}`
  });
  evidence.captures = (evidence.captures || []).filter(c => c.scenario !== "launcher-themed");
  evidence.captures.push(receipt);
  evidence.captureFiles = evidence.captureFiles || {};
  evidence.captureFiles["launcher-themed"] = { path: "system-screenshots/launcher-themed.png", sha256: shot.sha256 };
  evidence.systemWitnesses = evidence.systemWitnesses || {};
  evidence.systemWitnesses["launcher-themed"] = witness;
  evidence.claimBoundary = "GENUINE_RELEASE_BUILD_SYSTEM_UI_EVIDENCE_WITH_EXPLICIT_LAUNCHER_OR_STARTING_WINDOW_WITNESSES";
  writeJson(ePath, evidence);
  console.log(`Android themed launcher evidence: PASS (${profileId}; genuine resolver/customization checked state + launcher screenshot)`);
}

try { main(); }
catch (e) {
  console.error("Android themed launcher evidence: FAIL", e.message);
  process.exit(1);
}