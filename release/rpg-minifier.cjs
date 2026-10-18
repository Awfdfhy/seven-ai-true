const {minify_sync}=require('terser');
// Hot lazy-path kernels, pinned as a set because release/rpg-packaging.test.cjs re-executes
// exactly these four through the minifier to prove the packaged form still runs.
const files=new Set(['rpg-state.js','rpg-session.js','rpg-context.js','rpg-live-integration.js']);
// Every workspace script is copied into the shipped web payload (and therefore into the APK),
// so every workspace script is minified. compactJs() only trims lines, which leaves comments,
// indentation and long local names in the bundle; terser removes them without touching
// property names, string literals or function names (keep_fnames). compress:false keeps this a
// semantics-preserving transform -- no dead-code elimination, no constant folding.
function shouldMinify(name){return typeof name==='string'&&name.endsWith('.js');}
function minifyRpg(source){
  const result=minify_sync(source,{compress:false,mangle:true,keep_fnames:true,format:{comments:false},ecma:2020});
  if(typeof result.code!=='string'||!result.code.trim())throw new Error('RPG packaging emitted no code');
  return result.code;
}
function minifyStartup(source){
  return minify_sync(source,{compress:false,mangle:true,keep_fnames:true,format:{comments:false},ecma:2020}).code;
}
module.exports={files,shouldMinify,minifyRpg,minifyStartup};
