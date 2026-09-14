"use strict";
const core=require("./visual-evidence-runtime-passb.cjs");
function arr(v){return Array.isArray(v)?v:[]}
function finite(v,name){const n=Number(v);if(!Number.isFinite(n))throw new Error(`${name} must be finite`);return n}
function auditTouchTargets(targets,opts={}){
  const preferred=finite(opts.preferredMin??44,"preferredMin"),hard=finite(opts.hardMin??24,"hardMin"),tolerance=Math.max(0,Math.min(1,finite(opts.measurementTolerance??0.25,"measurementTolerance")));
  if(hard>preferred)throw new Error("hardMin cannot exceed preferredMin");
  const hardIssues=[],warnIssues=[];let checked=0;
  for(const t of arr(targets)){
    if(t?.visible===false||t?.disabled===true)continue;
    const w=Number(t?.width),h=Number(t?.height);if(!Number.isFinite(w)||!Number.isFinite(h))continue;
    checked++;const id=String(t.selector||t.id||`target-${checked}`);
    if(w+tolerance<hard||h+tolerance<hard)hardIssues.push(`touch-target-hard:${id}:${w.toFixed(1)}x${h.toFixed(1)}`);
    else if(w+tolerance<preferred||h+tolerance<preferred)warnIssues.push(`touch-target-preferred:${id}:${w.toFixed(1)}x${h.toFixed(1)}`);
  }
  const issues=[...hardIssues,...warnIssues].sort(),status=hardIssues.length?core.VERDICT.FAIL:warnIssues.length?core.VERDICT.WARN:core.VERDICT.PASS;
  const metrics={checked,preferredMin:preferred,hardMin:hard,measurementTolerance:tolerance,hardFailures:hardIssues.length,warnings:warnIssues.length};
  const audit={kind:"TOUCH_TARGETS",status,issues,metrics};
  return Object.freeze({...audit,auditHash:core.hash(audit)});
}
module.exports=Object.freeze({...core,auditTouchTargets});
