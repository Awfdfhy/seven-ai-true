const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const adapter=fs.readFileSync(path.join(__dirname,'workspaces','rpg-ui-b-adapter.js'),'utf8');
const render=fs.readFileSync(path.join(__dirname,'workspaces','rpg-ui-b-render.js'),'utf8');
const mount=fs.readFileSync(path.join(__dirname,'workspaces','rpg-ui-b-mount.js'),'utf8');
const css=fs.readFileSync(path.join(root,'.seven-team','ui-convergence','chat3-rpg-b','rpg-ui-b.scoped.css'),'utf8');
assert.ok(adapter.includes('turnOrder:null,hp:null,mp:null'),'adapter must keep unsupported combat stats explicit nulls');
assert.ok(!/localStorage|indexedDB|fetch\(|XMLHttpRequest/.test(adapter),'adapter must remain pure/read-only');
assert.ok(!/localStorage|indexedDB|fetch\(|XMLHttpRequest/.test(render),'renderer must remain pure/offline');
assert.ok(!/localStorage|indexedDB|fetch\(|XMLHttpRequest/.test(mount),'mount helper must remain passive');
for(const term of ['HP','MP','XP','Level']) assert.ok(!render.includes('>'+term+'<'),'renderer must not invent '+term+' UI');
assert.ok(!css.includes('!important'),'scoped RPG-B candidate must not introduce !important');
assert.ok(!/(^|\n)\s*(html|body|:root|#seven-app|\.composer|\.sidebar|\.topbar)\b/.test(css),'scoped stylesheet must not own global/shell selectors');
const blocks=css.split('}').map(x=>x.trim()).filter(Boolean);
for(const block of blocks){const selector=block.split('{')[0].trim();if(selector.startsWith('@'))continue;for(const part of selector.split(',')){const s=part.trim();assert.ok(s.startsWith('.seven-rpgb')||s.startsWith('[dir=rtl] .seven-rpgb'),'unscoped RPG-B selector: '+s)}}
assert.ok(!/\.reverse\s*\(/.test(render+adapter),'RTL/data rendering must not reverse source arrays implicitly');
console.log('rpg ui b static gate: PASS',JSON.stringify({cssBytes:css.length,adapterBytes:adapter.length,renderBytes:render.length,mountBytes:mount.length}));
