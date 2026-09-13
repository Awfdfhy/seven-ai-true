const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');
const motion=require('./motion-runtime.js');

let checks=0;
function check(name,fn){fn();checks++;console.log('PASS',name);}

check('Motion OS exposes the governed 3.0 runtime',()=>assert.equal(motion.VERSION,'3.0.0'));
check('all eight semantic motion families exist',()=>assert.deepEqual(Object.keys(motion.FAMILY),['snap','glide','settle','reveal','orbit','pulse','collapse','transfer']));
check('automatic motion defaults to Balanced',()=>assert.equal(motion.deriveProfile({preference:'auto',performanceTier:'full'}),'balanced'));
check('Ultra requires an explicit preference and capable tier',()=>assert.equal(motion.deriveProfile({preference:'ultra',performanceTier:'full'}),'ultra'));
check('Balanced performance caps an Ultra preference',()=>assert.equal(motion.deriveProfile({preference:'ultra',performanceTier:'balanced'}),'balanced'));
check('Lite performance caps every visual preference',()=>assert.equal(motion.deriveProfile({preference:'ultra',performanceTier:'lite'}),'lite'));
check('low power caps motion without changing features',()=>assert.equal(motion.deriveProfile({preference:'ultra',performanceTier:'full',lowPower:true}),'lite'));
check('system Reduced Motion is authoritative',()=>assert.equal(motion.deriveProfile({preference:'ultra',performanceTier:'full',reducedMotion:true}),'reduced'));
check('hidden documents resolve to Off',()=>assert.equal(motion.deriveProfile({preference:'ultra',performanceTier:'full',hidden:true}),'off'));
check('frame pressure degrades only the motion profile',()=>assert.equal(motion.deriveProfile({preference:'ultra',performanceTier:'full',pressure:'critical'}),'reduced'));
check('unexplained motion is rejected',()=>assert.equal(motion.compileMotion({family:'reveal'},{profile:'balanced'}).reason,'unexplained-motion'));
check('unknown families are rejected',()=>assert.equal(motion.compileMotion({family:'bounce',purpose:'state'},{profile:'balanced'}).reason,'unknown-family'));
check('idle ambient motion is rejected',()=>assert.equal(motion.compileMotion({family:'orbit',purpose:'state',priority:4},{profile:'ultra'}).reason,'idle-motion-forbidden'));
check('unbounded loops must be state-bound',()=>assert.equal(motion.compileMotion({family:'orbit',purpose:'state',iterations:Infinity},{profile:'ultra'}).reason,'unbounded-idle-motion'));
check('layout animation is rejected',()=>assert.equal(motion.compileMotion({family:'glide',purpose:'space',keyframes:[{width:'10px'},{width:'20px'}]},{profile:'balanced'}).reason,'forbidden-animated-property:width'));
check('paint-heavy animation is rejected',()=>assert.equal(motion.compileMotion({family:'pulse',purpose:'state',keyframes:[{filter:'blur(2px)'},{filter:'none'}]},{profile:'balanced'}).reason,'forbidden-animated-property:filter'));
check('Reduced Motion strips spatial transforms',()=>{
  const plan=motion.compileMotion({family:'transfer',purpose:'space'},{profile:'reduced'});
  assert.equal(plan.accepted,true);assert.ok(plan.frames.every(frame=>!Object.prototype.hasOwnProperty.call(frame,'transform')));assert.ok(plan.duration<=120);
});
check('Lite replaces signature choreography and caps duration',()=>{
  const plan=motion.compileMotion({family:'orbit',purpose:'state',signature:true,duration:900,delay:999},{profile:'lite'});
  assert.equal(plan.accepted,true);assert.equal(plan.family,'settle');assert.ok(plan.duration<=190);assert.equal(plan.delay,0);
});
check('Off preserves the state change while skipping animation',()=>assert.equal(motion.compileMotion({family:'reveal',purpose:'state'},{profile:'off'}).skip,true));
check('release CSS has no transition-all shortcut',()=>{
  const css=fs.readFileSync(path.join(__dirname,'seven-final.css'),'utf8');assert.doesNotMatch(css,/transition\s*:\s*all\b/i);assert.match(css,/data-seven-motion-profile="reduced"[^\n]+animation-duration:\.001ms/);
});
check('the executable specification keeps the real-device truth boundary',()=>{
  const spec=fs.readFileSync(path.join(__dirname,'..','SEVEN_MOTION_OS.md'),'utf8');assert.match(spec,/Tecno Pova 5/);assert.match(spec,/state, space, cause, or hierarchy/);
});

console.log(`motion runtime: PASS (${checks} checks)`);
