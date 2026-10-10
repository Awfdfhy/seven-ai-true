import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {renderSurface} from "../ui/workspaces.mjs";

const here=path.dirname(fileURLToPath(import.meta.url));
const css=fs.readFileSync(path.join(here,"../ui/workspaces.css"),"utf8");

test("all v3 workspaces render inside the same component grammar",()=>{
 for(const name of ["settings","coding","selfdev","research","rpg"]){
  const html=renderSurface(name);
  assert.match(html,/s7-workspace/);
  assert.match(html,/s7-workspace-inner/);
  assert.match(html,/s7-workspace-head/);
 }
});

test("workspace CSS remains one system without override hacks",()=>{
 assert.doesNotMatch(css,/!important/);
 assert.doesNotMatch(css,/--sb-|--seven-ui-/);
 assert.doesNotMatch(css,/margin-left|margin-right|padding-left|padding-right/);
 assert.match(css,/var\(--s7-surface\)/);
 assert.match(css,/var\(--s7-border\)/);
});

test("self-development exposes guarded workflow stages",()=>{
 const html=renderSurface("selfdev");
 for(const label of ["Task","Plan","Changes","Verify","Commit","Result"])assert.ok(html.includes(label));
 assert.ok(html.includes("Protected paths"));
});

test("RPG stays expressive without creating a second token system",()=>{
 const html=renderSurface("rpg");
 assert.ok(html.includes("Living world"));
 assert.ok(html.includes("Canon stable"));
 assert.ok(html.includes("World state"));
});
