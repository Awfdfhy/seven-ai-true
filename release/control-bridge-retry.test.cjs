const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=fs.readFileSync(__dirname+'/control-bridge.js','utf8');
const ctx={console,setTimeout,clearTimeout,document:{readyState:'complete'}};
vm.createContext(ctx);vm.runInContext(src,ctx);
assert.ok(ctx.SevenBridge,'SevenBridge must register');
assert.equal(ctx.SevenBridge.state.ready,false,'bridge should fail closed before control exists');
setTimeout(()=>{ctx.SevenControl={
  state:{ready:true,budget:null},
  TIERS:{balanced:{}},
  selectTier:()=> 'balanced',
  createBudget:({tier})=>({tier,baseContextTokens:16000,baseMemoryMb:256,baseToolCalls:12})
}},5);
setTimeout(()=>{
  try{
    assert.equal(ctx.SevenBridge.state.ready,true,'bridge must recover when SevenControl arrives late');
    assert.equal(ctx.SevenBridge.state.error,null);
    assert.equal(ctx.SevenBridge.state.tier,'balanced');
    console.log('control bridge retry: PASS');
  }catch(e){console.error(e);process.exitCode=1}
},120);
