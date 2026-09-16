const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');

const ROOT=path.resolve(__dirname,'..');
const MATRIX_PATH=path.join(ROOT,'docs/project-memory/current/PRODUCT_WIRING_MATRIX.json');
const matrix=JSON.parse(fs.readFileSync(MATRIX_PATH,'utf8'));

assert.equal(matrix.schema,'seven.product-wiring-matrix.v1');
assert.equal(matrix.version,2);
assert.ok(Array.isArray(matrix.rows)&&matrix.rows.length>=20,'product wiring matrix must remain comprehensive');

const ENTRY=new Set(['DIRECT_UI','CONTEXTUAL_UI','EXPERT_ESCAPE','AUTOMATIC_RUNTIME','NO_USER_SURFACE']);
const STATUS=new Set(['WIRED_VERIFIED','INFRA_VERIFIED','BLOCKED','NOT_RELEASE_RELEVANT']);
const ids=new Set();
const states=new Set();
let assertions=0;
const ok=(condition,message)=>{assert.ok(condition,message);assertions++};

for(const row of matrix.rows){
  ok(row&&typeof row==='object','row must be an object');
  ok(typeof row.capability_id==='string'&&row.capability_id.length>2,'row requires capability_id');
  ok(!ids.has(row.capability_id),'duplicate capability_id: '+row.capability_id);ids.add(row.capability_id);
  ok(typeof row.release_relevant==='boolean','release_relevant must be boolean: '+row.capability_id);
  ok(ENTRY.has(row.entry_point_class),'invalid entry_point_class: '+row.capability_id);
  ok(STATUS.has(row.status),'invalid status: '+row.capability_id);
  ok(typeof row.surface==='string'&&row.surface.length>1,'surface required: '+row.capability_id);
  ok(typeof row.trigger==='string'&&row.trigger.length>1,'trigger required: '+row.capability_id);
  ok(typeof row.runtime_target==='string'&&row.runtime_target.length>1,'runtime_target required: '+row.capability_id);
  ok(Array.isArray(row.applicable_states)&&row.applicable_states.length>0,'applicable_states required: '+row.capability_id);
  row.applicable_states.forEach(x=>states.add(x));
  ok(typeof row.permission_boundary==='string'&&row.permission_boundary.length>5,'permission boundary required: '+row.capability_id);
  ok(typeof row.persistence_behavior==='string'&&row.persistence_behavior.length>3,'persistence behavior required: '+row.capability_id);
  ok(Array.isArray(row.evidence_refs)&&row.evidence_refs.length>0,'evidence refs required: '+row.capability_id);
  for(const ref of row.evidence_refs){
    ok(typeof ref==='string'&&ref.length>2,'invalid evidence ref: '+row.capability_id);
    ok(fs.existsSync(path.join(ROOT,ref)),'stale/nonexistent evidence ref '+ref+' for '+row.capability_id);
  }
  if(row.release_relevant){
    ok(row.status!=='BLOCKED'&&row.status!=='NOT_RELEASE_RELEVANT','release-relevant capability is not product-ready: '+row.capability_id);
    ok(row.entry_point_class!=='NO_USER_SURFACE','release-relevant capability cannot be NO_USER_SURFACE: '+row.capability_id);
  }else{
    ok(row.status==='NOT_RELEASE_RELEVANT','excluded capability must be explicitly NOT_RELEASE_RELEVANT: '+row.capability_id);
    ok(row.entry_point_class==='NO_USER_SURFACE','excluded capability must not advertise a user surface: '+row.capability_id);
    ok(typeof row.rationale==='string'&&row.rationale.length>10,'excluded capability requires rationale: '+row.capability_id);
  }
}

const families={
  chat:['chat.conversation','sessions.rooms','generation.stop_retry_continue'],
  models:['model.manual_selector','model.auto_free_routing','model.capability_profile','adaptive_compute'],
  memory:['memory.context'],
  files:['knowledge.txt_pdf','projects.persistent_full_system'],
  research:['search.web','research.workspace'],
  coding:['coding.workspace'],
  rpg:['rpg.real_works_workspace'],
  generated:['generated_ui'],
  vision:['vision.live_multimodal_input'],
  tools:['tool_fabric','permissions.side_effect_uncertainty'],
  persistence:['persistence.recovery_import_export'],
  android:['android.native_saf_keystore'],
  ops:['performance.resource_governor','observability.full_product','self_evolution_engine']
};
for(const [family,required] of Object.entries(families))for(const id of required)ok(ids.has(id),'missing '+family+' product binding: '+id);

const requiredStateCoverage=['ready','loading','running','streaming','success','empty','error','retry','cancel','post_cancel','permission_required','permission_denied','offline','provider_degraded','persistence_restart','long_content','malformed_input','compact_mobile'];
for(const state of requiredStateCoverage)ok(states.has(state),'state matrix missing '+state);

const source=fs.readFileSync(path.join(ROOT,'seven_ai-final.html'),'utf8');
const sourceTokens=[
  'id="modelSelect"','populateFreeModelSelect','onModelChange','id="routingModeSelect"','onRoutingModeChange',
  'id="freeFallbackToggle"','id="deepThinkToggle"','id="searchToggle"','id="fileInput"','handleKnowledgeFiles',
  'openSettings','stopGeneration','createNewChat','switchRoom','deleteRoomById'
];
for(const token of sourceTokens)ok(source.includes(token),'protected product source lost required binding token: '+token);

for(const file of ['release/workspaces/hub.js','release/workspaces/coding.js','release/workspaces/research.js','release/workspaces/rpg.js'])ok(fs.existsSync(path.join(ROOT,file)),'missing workspace surface: '+file);

const vision=matrix.rows.find(x=>x.capability_id==='vision.live_multimodal_input');
ok(vision.release_relevant===false&&vision.status==='NOT_RELEASE_RELEVANT'&&vision.entry_point_class==='NO_USER_SURFACE','partial Vision foundation must not be promoted into a fake live input surface');
const projects=matrix.rows.find(x=>x.capability_id==='projects.persistent_full_system');
ok(projects.release_relevant===false,'partial full Projects system must remain outside release claims');

console.log(`Product Wiring Contract: PASS (${assertions} assertions; ${matrix.rows.length} capability bindings; ${states.size} state classes)`);
