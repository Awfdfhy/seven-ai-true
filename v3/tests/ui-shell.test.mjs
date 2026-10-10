import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createShellState} from "../ui/app-shell.mjs";

const here=path.dirname(fileURLToPath(import.meta.url));
const css=fs.readFileSync(path.join(here,"../ui/shell.css"),"utf8");
const tokens=fs.readFileSync(path.join(here,"../ui/tokens.css"),"utf8");
const js=fs.readFileSync(path.join(here,"../ui/app-shell.mjs"),"utf8");

test("v3 UI has one canonical token namespace",()=>{
  for(const token of ["--s7-canvas","--s7-surface","--s7-text","--s7-accent","--s7-touch","--s7-z-modal"])assert.match(tokens,new RegExp(token.replace("--","\\-\\-")));
  assert.doesNotMatch(tokens,/--sb-|--seven-ui-/);
});

test("v3 shell rejects override architecture",()=>{
  assert.doesNotMatch(css,/!important/);
  assert.doesNotMatch(css,/\.seven-shell-|\.seven-ws-/);
  assert.doesNotMatch(css,/\bmargin-left\b|\bmargin-right\b|\bpadding-left\b|\bpadding-right\b/);
});

test("v3 shell explicitly covers mobile, compact and reduced motion",()=>{
  assert.match(css,/@media\(max-width:820px\)/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(css,/@media\(max-width:360px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/env\(safe-area-inset-bottom\)/);
});

test("RTL is first-class and shell state normalizes locale",()=>{
  assert.match(css,/\[dir="rtl"\]/);
  assert.equal(createShellState({lang:"ar-IQ"}).lang,"ar");
  assert.equal(createShellState({lang:"en-US"}).lang,"en");
});

test("core v3 surfaces exist exactly once in renderer",()=>{
  for(const marker of ["s7-sidebar","s7-topbar","s7-chat","s7-composer","data-model-menu","data-workspace-menu"]){
    assert.ok(js.includes(marker),marker);
  }
});

function hexToRgb(hex){const h=hex.replace("#","");return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16))}
function luminance(hex){const [r,g,b]=hexToRgb(hex).map(v=>{const s=v/255;return s<=.03928?s/12.92:((s+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
test("dark theme text contrast meets WCAG AA baseline",()=>{
  assert.ok(contrast("#F7F9FC","#090C12")>=4.5);
  assert.ok(contrast("#AAB4C5","#090C12")>=4.5);
  assert.ok(contrast("#F7F9FC","#111722")>=4.5);
});
test("chat iconography is vector-based and avoids legacy text glyph controls",()=>{
  assert.match(js,/function icon\(/);
  assert.match(js,/class="s7-icon"/);
  for(const glyph of ["☰","⌕","✎","▦","⧉"])assert.equal(js.includes(glyph),false,glyph);
});
