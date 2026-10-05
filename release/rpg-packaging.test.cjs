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
for(const file of ['rpg-state.test.cjs','rpg-session.test.cjs','rpg-context.test.cjs','rpg-live-integration.test.cjs','rpg-rules.test.cjs','rpg-planner.test.cjs','rpg-orchestrator.test.cjs','rpg-unified-live.test.cjs'])execute(path.join(__dirname,file),fs.readFileSync(path.join(__dirname,file),'utf8'));
assert.equal(cache.size,6);
const livePacked=minifyRpg(fs.readFileSync(path.join(__dirname,'workspaces','rpg-live.js'),'utf8'));
const workspacePacked=minifyRpg(fs.readFileSync(path.join(__dirname,'workspaces','rpg.js'),'utf8'));
assert.ok(livePacked.includes('SevenRpgLive'));
assert.ok(workspacePacked.includes('SevenRpgWorkspace'));
const publicWorkspaceMarkers={
  'hub.js':'SevenWorkspaces',
  'coding.js':'SevenCodingWorkspace',
  'research.js':'SevenResearchWorkspace',
  'generated-ui.js':'SevenGeneratedUI',
  'seven-shell.js':'SevenShell',
  'seven-shell-final.js':'SevenShell'
};
for(const [name,marker] of Object.entries(publicWorkspaceMarkers)){
  const source=fs.readFileSync(path.join(__dirname,'workspaces',name),'utf8');
  const packed=minifyRpg(source);
  assert.ok(packed.length<source.length,name+' should shrink under parser minification');
  assert.ok(packed.includes(marker),name+' lost public marker '+marker);
}

assert.throws(()=>minifyRpg('function {'),/Unexpected|Name|token/i);
console.log('Packaged RPG runtime: PASS (state/session/context/recovery/rules/planner/orchestrator/live/workspace)');
