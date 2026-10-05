const fs=require('fs'),path=require('path'),vm=require('vm'),{createRequire}=require('module'),assert=require('assert/strict');
const {files,minifyRpg}=require('./rpg-minifier.cjs');
const context=vm.createContext({console,Buffer,setTimeout,clearTimeout}),cache=new Map();
function execute(file,code){
  const nodeRequire=createRequire(file),module={exports:{}};
  const packedRequire=spec=>{
    const resolved=nodeRequire.resolve(spec);
    if(path.dirname(resolved)!==path.join(__dirname,'workspaces')||!files.has(path.basename(resolved)))return nodeRequire(spec);
    if(!cache.has(resolved))cache.set(resolved,execute(resolved,minifyRpg(fs.readFileSync(resolved,'utf8'))));
    return cache.get(resolved);
  };
  const fn=vm.runInContext('(function(require,module,exports,__dirname,__filename){\n'+code+'\n})',context,{filename:file,timeout:120000});
  fn(packedRequire,module,module.exports,path.dirname(file),file);return module.exports;
}
for(const file of ['rpg-state.test.cjs','rpg-session.test.cjs','rpg-context.test.cjs','rpg-live-integration.test.cjs'])execute(path.join(__dirname,file),fs.readFileSync(path.join(__dirname,file),'utf8'));
assert.equal(cache.size,4);
assert.throws(()=>minifyRpg('function {'),/Unexpected|Name|token/i);
console.log('Packaged RPG kernels: PASS (state, session, context, live failure/restart gates)');
