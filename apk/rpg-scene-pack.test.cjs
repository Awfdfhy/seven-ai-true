'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const {THEMES,scene}=require('./build-rpg-scene-pack.cjs');
assert.ok(THEMES.length>=18,'The offline visual-novel edition needs many distinct illustrated scenes');
assert.equal(new Set(THEMES.map(theme=>theme[0])).size,THEMES.length,'Scene names must be unique');
const script=fs.readFileSync(path.join(__dirname,'rpg-scene-controller.js'),'utf8');
assert.ok(script.includes('rpg-scenes/manifest.json')&&script.includes('seven:rpg-world-created'),'The RPG scene controller must connect to world state');
assert.ok(script.includes('rpg-art-cycle'),'The player can change world scenery locally');
assert.ok(script.includes("rpg-scene-gallery") && script.includes("rpg-gallery-close"),'Full-resolution gallery must have a close control');
assert.ok(script.includes("sceneUrl(chosen,true)"),'Ordinary RPG chat must use a small preview, not decode a 2560px illustration');
assert.ok(script.includes("img.removeAttribute('src')"),'Closing the gallery must release full-resolution image');
const buildScript=fs.readFileSync(path.join(__dirname,'build-rpg-scene-pack.cjs'),'utf8');
assert.ok(buildScript.includes("previews")&&buildScript.includes("resize(960,540"),'Builder must emit compact real preview imagery');

(async()=>{
  for(const [index,theme] of [THEMES[0],THEMES[5],THEMES[11],THEMES[17]].entries()){
    const xml=scene(theme,index);
    assert.ok(xml.startsWith('<svg ')&&xml.endsWith('</svg>'),'Generated scene must be real SVG artwork');
    const image=await sharp(Buffer.from(xml)).resize(480,270).jpeg().toBuffer();
    assert.ok(image.length>5000,'Scene must render meaningful raster detail');
  }
  console.log('Seven RPG scene library: PASS (unique original offline artwork, renderable cinematic scenes)');
})().catch(e=>{console.error(e);process.exitCode=1});
