"use strict";

const { spawnSync } = require("child_process");

const UI_DUMP_ATTEMPTS = 12;
const UI_DUMP_RETRY_MS = 350;

function run(args, { allow = false, timeout = 20000 } = {}) {
  const r = spawnSync("adb", args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024, timeout });
  if (!allow && (r.error || r.status !== 0)) {
    throw Error(`adb ${args.join(" ")} failed: ${r.error?.message || r.stderr || r.stdout}`);
  }
  return r;
}
function adb(...args) { return run(args); }
function sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
function attrs(s) {
  const o = {};
  for (const m of String(s).matchAll(/([A-Za-z0-9_:-]+)="([^"]*)"/g)) {
    o[m[1]] = m[2].replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  }
  return o;
}
function nodes(xml) {
  return [...String(xml).matchAll(/<node\b([^>]*)\/?>/g)].map(m => attrs(m[1]));
}
function bounds(s) {
  const m = String(s || "").match(/^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$/);
  if (!m) return null;
  const x1 = +m[1], y1 = +m[2], x2 = +m[3], y2 = +m[4];
  if (x2 <= x1 || y2 <= y1) return null;
  return { x1, y1, x2, y2, cx: Math.round((x1 + x2) / 2), cy: Math.round((y1 + y2) / 2) };
}
function text(n) { return `${n.text || ""} ${n["content-desc"] || ""}`.trim(); }
function foreground() {
  const r = run(["shell", "dumpsys", "activity", "activities"], { allow: true, timeout: 12000 });
  return String(r.stdout || "").split(/\r?\n/).map(x => x.trim())
    .filter(x => /mResumedActivity|topResumedActivity|ResumedActivity/.test(x)).slice(0, 4).join(" ; ") || "<unknown>";
}
function dumpUi() {
  const remote = "/data/local/tmp/seven-launcher-home.xml";
  const failures = [];
  for (let attempt = 1; attempt <= UI_DUMP_ATTEMPTS; attempt++) {
    run(["wait-for-device"], { allow: true, timeout: 12000 });
    run(["shell", "rm", "-f", remote], { allow: true, timeout: 5000 });
    const dumped = run(["shell", "uiautomator", "dump", "--compressed", remote], { allow: true, timeout: 12000 });
    const read = run(["exec-out", "cat", remote], { allow: true, timeout: 8000 });
    const xml = String(read.stdout || "");
    if (dumped.status === 0 && read.status === 0 && xml.includes("<hierarchy")) return xml;
    failures.push({
      attempt,
      dumpStatus: dumped.status,
      readStatus: read.status,
      dumpError: String(dumped.error?.message || dumped.stderr || dumped.stdout || "").trim().slice(0, 180),
      readError: String(read.error?.message || read.stderr || "").trim().slice(0, 180)
    });
    // Pixel Launcher may still be settling after instrumentation or first boot.
    // Keep retries bounded and observe only the genuine system UI hierarchy.
    if (attempt < UI_DUMP_ATTEMPTS) sleep(UI_DUMP_RETRY_MS);
  }
  throw Error(`launcher UI hierarchy unavailable after ${UI_DUMP_ATTEMPTS} bounded retries; foreground=${foreground()}; attempts=${JSON.stringify(failures)}`);
}
function summary(xml) {
  return nodes(xml).map(n => text(n)).filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).slice(0, 35).join(" | ");
}
function screenSize() {
  const raw = adb("shell", "wm", "size").stdout;
  const all = [...raw.matchAll(/(\d+)x(\d+)/g)];
  if (!all.length) throw Error(`wm size unavailable: ${raw.trim()}`);
  const m = all[all.length - 1];
  return { width: +m[1], height: +m[2] };
}
function sevenNode(xml) {
  return nodes(xml).find(n => /(^|\s)Seven(\s|$)/i.test(text(n)) && bounds(n.bounds)) || null;
}
function home() {
  run(["wait-for-device"], { allow: false, timeout: 12000 });
  run(["shell", "input", "keyevent", "KEYCODE_WAKEUP"], { allow: true, timeout: 5000 });
  run(["shell", "wm", "dismiss-keyguard"], { allow: true, timeout: 5000 });
  adb("shell", "input", "keyevent", "KEYCODE_HOME");
  sleep(1000);
}
function openAllApps() {
  home();
  // Prove the home surface is queryable before entering All Apps. This absorbs
  // first-boot/instrumentation handoff latency without replacing real UI input.
  dumpUi();
  const size = screenSize();
  adb("shell", "input", "swipe",
    String(Math.round(size.width * 0.50)), String(Math.round(size.height * 0.84)),
    String(Math.round(size.width * 0.50)), String(Math.round(size.height * 0.22)), "500");
  sleep(1100);
}
function findSevenInAllApps() {
  const size = screenSize();
  openAllApps();
  for (let pass = 0; pass < 14; pass++) {
    const xml = dumpUi();
    const node = sevenNode(xml);
    if (node) return { xml, node, pass };
    adb("shell", "input", "swipe",
      String(Math.round(size.width * 0.56)), String(Math.round(size.height * 0.78)),
      String(Math.round(size.width * 0.56)), String(Math.round(size.height * 0.30)), "380");
    sleep(500);
  }
  const xml = dumpUi();
  throw Error(`Seven not found in genuine Pixel Launcher All Apps; foreground=${foreground()}; ui=${summary(xml)}`);
}
function verifyHome() {
  home();
  const xml = dumpUi();
  const node = sevenNode(xml);
  return node ? { xml, node } : null;
}
function placeSeven() {
  const already = verifyHome();
  if (already) return { alreadyPresent: true, attempts: 0, bounds: already.node.bounds };

  const size = screenSize();
  const targets = [
    [0.50, 0.34],
    [0.28, 0.34],
    [0.72, 0.34],
    [0.50, 0.48]
  ];
  const attempts = [];

  for (let i = 0; i < targets.length; i++) {
    const found = findSevenInAllApps();
    const from = bounds(found.node.bounds);
    if (!from) throw Error("Seven launcher node has no usable bounds");
    const [fx, fy] = targets[i];
    const toX = Math.round(size.width * fx);
    const toY = Math.round(size.height * fy);

    // Android's input draganddrop performs a long-press drag. A normal swipe does
    // not enter Pixel Launcher's app-drag state reliably, especially on API 36.
    const drag = run(["shell", "input", "draganddrop",
      String(from.cx), String(from.cy), String(toX), String(toY), "1800"], { allow: true, timeout: 10000 });
    attempts.push({
      from: { x: from.cx, y: from.cy },
      to: { x: toX, y: toY },
      status: drag.status,
      stderr: String(drag.stderr || "").trim().slice(0, 300)
    });
    if (drag.error || drag.status !== 0) continue;

    sleep(1900);
    const placed = verifyHome();
    if (placed) {
      return { alreadyPresent: false, attempts: i + 1, bounds: placed.node.bounds, dragAttempts: attempts };
    }
  }

  const xml = (() => { try { return dumpUi(); } catch { return ""; } })();
  throw Error(`Seven could not be placed on Pixel Launcher workspace via genuine draganddrop; foreground=${foreground()}; attempts=${JSON.stringify(attempts)}; ui=${summary(xml)}`);
}

try {
  const proof = placeSeven();
  console.log(`Pixel Launcher Seven placement: PASS (${proof.alreadyPresent ? "already-present" : `draganddrop attempts=${proof.attempts}`})`);
} catch (e) {
  console.error("Pixel Launcher Seven placement: FAIL", e.message);
  process.exit(1);
}
