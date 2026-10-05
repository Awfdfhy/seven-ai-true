const {minify_sync}=require('terser');
const files=new Set(['rpg-state.js','rpg-session.js','rpg-context.js','rpg-live-integration.js']);
function minifyRpg(source){
  const result=minify_sync(source,{compress:false,mangle:true,keep_fnames:true,format:{comments:false},ecma:2020});
  if(typeof result.code!=='string'||!result.code.trim())throw new Error('RPG packaging emitted no code');
  return result.code;
}
module.exports={files,minifyRpg};
