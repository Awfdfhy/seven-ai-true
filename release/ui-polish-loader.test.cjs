const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const elements=new Map(),scripts=[];
const document={readyState:'loading',addEventListener(){},getElementById:id=>elements.get(id),createElement(tag){return {tag,remove(){elements.delete(this.id)}}},head:{appendChild(el){elements.set(el.id,el);if(el.tag==='script')scripts.push(el)}}};
const ctx={document,console};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/ui-polish-loader.js','utf8'),ctx);
(async()=>{
  const api=ctx.SevenUiPolishLoader;
  const failed=api.load();assert.equal(api.load(),failed);assert.equal(scripts.length,1);
  scripts[0].onerror();await assert.rejects(failed,/failed to load/);
  const absent=api.load();assert.equal(scripts.length,2);scripts[1].onload();await assert.rejects(absent,/did not register/);
  const retry=api.load();assert.equal(scripts.length,3);let synced=0;
  ctx.SevenUiPolish={sync(){synced++}};scripts[2].onload();assert.equal(await retry,ctx.SevenUiPolish);assert.equal(synced,1);
  assert.equal(await api.load(),ctx.SevenUiPolish);assert.equal(scripts.length,3);
  console.log('UI lazy loader: PASS (network failure, absent registration, retry recovery, concurrent deduplication)');
})().catch(e=>{console.error(e);process.exitCode=1});
