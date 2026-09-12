const {spawnSync}=require('child_process');
const path=require('path');
for(const file of ['memory.cjs','runtime-smoke.cjs','ultimate-core.cjs','ultimate-systems.cjs','ultimate-runtime.cjs','ultimate-advanced.cjs','ultimate-agent-provider.cjs','ultimate-narrative.cjs','ultimate-rpg-extended.cjs','ultimate-platform.cjs','ultimate-performance-ui-migration.cjs','ultimate-rpg-ui-observatory.cjs','ultimate-tool-runtime.cjs','ultimate-cognitive.cjs','ultimate-memory-fabric.cjs','ultimate-knowledge.cjs','ultimate-search-runtime.cjs','ultimate-rpg-director.cjs','ultimate-story-scheduler.cjs','ultimate-character-mind.cjs','ultimate-npc-life.cjs','ultimate-persona-dynamics.cjs','ultimate-canon-universe.cjs','ultimate-coding-studio.cjs','ultimate-rpg-life-ui.cjs','ultimate-rpg-depth-dom.cjs','ultimate-ui-deep.cjs','ultimate-tool-ui.cjs','ultimate-world-simulation.cjs','ultimate-canon-title.cjs','ultimate-model-agent-v2.cjs','ultimate-model-agent-integration.cjs','ultimate-ui-browser.cjs','verify.cjs']) {
 const result=spawnSync(process.execPath,[path.join(__dirname,file)],{stdio:'inherit',timeout:120000});
 if(result.error) console.error(result.error);
 if(result.error || result.status!==0) process.exit(result.status || 1);
}
console.log('all test suites: PASS');
