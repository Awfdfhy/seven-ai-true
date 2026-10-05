const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {minifyStartup}=require('./rpg-minifier.cjs');
const source=fs.readFileSync(__dirname+'/beta-ui-runtime.js','utf8'),packed=minifyStartup(source);
assert.ok(Buffer.byteLength(packed)<Buffer.byteLength(source));
function boot(code,preference,dark){
  const listeners=[],ctx={document:{readyState:'loading',addEventListener:(...args)=>listeners.push(args)},localStorage:{getItem:()=>preference},matchMedia:()=>({matches:dark})};
  vm.runInNewContext(code,ctx);
  return {preference:ctx.SevenTheme.getPreference(),resolved:ctx.SevenTheme.getResolvedTheme(),exports:Object.keys(ctx.SevenBetaUI).sort(),ready:ctx.SevenBetaUI.state.ready,mode:ctx.SevenBetaUI.state.mode,scheduled: listeners.length};
}
for(const preference of [null,'auto','light','dark','day','night','invalid'])for(const dark of [true,false])assert.deepEqual(boot(packed,preference,dark),boot(source,preference,dark));
assert.equal(boot(packed,'auto',true).resolved,'night');assert.equal(boot(packed,'auto',false).resolved,'day');
console.log('Packaged beta startup: PASS (14 theme/system/legacy preference cases and public API)');
