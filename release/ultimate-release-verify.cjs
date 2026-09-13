'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {build,OUT}=require('./build-ultimate.cjs');
const REQUIRED=[
 'src/ultimate/runtime.js','src/ultimate/core.js','src/ultimate/persistence.js','src/ultimate/system-persistence.js',
 'src/ultimate/memory-fabric.js','src/ultimate/context.js','src/ultimate/knowledge-fabric.js','src/ultimate/local-intelligence.js',
 'src/ultimate/tool-fabric.js','src/ultimate/tool-runtime.js','src/ultimate/capability-os.js','src/ultimate/frontier-capability-bridge.js',
 'src/ultimate/model-fabric.js','src/ultimate/model-control-plane.js','src/ultimate/model-agent-extension.js','src/ultimate/cognitive-controller.js',
 'src/ultimate/agent-runtime.js','src/ultimate/coding-studio.js','src/ultimate/project-workspace.js',
 'src/ultimate/research.js','src/ultimate/search-fabric.js','src/ultimate/search-runtime.js',
 'src/ultimate/rpg-engine.js','src/ultimate/rpg-state.js','src/ultimate/rpg-director.js','src/ultimate/story-scheduler.js',
 'src/ultimate/canon-universe.js','src/ultimate/canon-journey.js','src/ultimate/character-genesis.js','src/ultimate/character-mind.js',
 'src/ultimate/npc-life.js','src/ultimate/persona-dynamics.js','src/ultimate/narrative-engine.js','src/ultimate/parallel-story.js',
 'src/ultimate/world-simulation.js','src/ultimate/world-title-forge.js','src/ultimate/visual-canon.js','src/ultimate/performance-fabric.js',
 'src/ultimate/frontier-chat-fabric.js','src/ultimate/frontier-inference-runtime.js','src/ultimate/frontier-tool-loop.js',
 'src/ultimate/raw-intelligence-v2.js','src/ultimate/weight-evolution-runtime.js','src/ultimate/full-stack-extension.js',
 'src/ultimate/browser-state.js','src/ultimate/browser-runtime-facade.js','src/ultimate/browser-entry.js'
];
(async()=>{const built=await build(),meta=built.metafile||JSON.parse(fs.readFileSync(path.join(path.dirname(OUT),'ultimate-metafile.json'),'utf8'));const inputs=Object.keys(meta.inputs||{}).map(x=>x.replaceAll('\\','/'));const missing=REQUIRED.filter(req=>!inputs.some(x=>x.endsWith(req)));assert.deepEqual(missing,[],`required Ultimate subsystems missing from browser bundle: ${missing.join(', ')}`);const html=fs.readFileSync(OUT,'utf8'),bundle=fs.readFileSync(path.join(path.dirname(OUT),'ultimate-app.js'),'utf8'),size=Buffer.byteLength(html)+Buffer.byteLength(bundle);assert.ok(html.includes('SEVEN_ULTIMATE_RELEASE_V1'),'release marker missing');assert.ok(html.includes('ultimate-app.js'),'integrated app bundle not referenced');assert.ok(!bundle.includes('sourceMappingURL='),'production bundle must not ship a source map');assert.ok(size<4*1024*1024,`web payload budget exceeded: ${size}`);const report={pass:true,requiredSubsystems:REQUIRED.length,bundledInputs:inputs.length,payloadBytes:size,release:path.basename(OUT)};fs.writeFileSync(path.join(path.dirname(OUT),'ultimate-release-verify.json'),JSON.stringify(report,null,2));console.log(`Ultimate release lineage: PASS (${REQUIRED.length} required subsystems, ${inputs.length} bundled inputs)`);})().catch(e=>{console.error(e);process.exit(1)});
