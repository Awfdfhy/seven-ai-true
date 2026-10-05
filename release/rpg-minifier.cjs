const {minify_sync}=require('terser');
const files=new Set(['rpg-state.js','rpg-session.js','rpg-context.js','rpg-live-integration.js','rpg-planner.js','rpg-orchestrator.js','rpg-live.js','rpg.js','canon-simulator.js','world-runtime.js','hub.js','coding.js','research.js','generated-ui.js','ui-polish-fixes.js','seven-shell.js','seven-shell-final.js']);
function minifyRpg(source){
  const result=minify_sync(source,{compress:{passes:3,unsafe:false,toplevel:true},mangle:{toplevel:true},keep_fnames:true,format:{comments:false},ecma:2020});
  if(typeof result.code!=='string'||!result.code.trim())throw new Error('RPG packaging emitted no code');
  return result.code;
}
function minifyStartup(source){
  return minify_sync(source,{compress:false,mangle:true,keep_fnames:true,format:{comments:false},ecma:2020}).code;
}
module.exports={files,minifyRpg,minifyStartup};
