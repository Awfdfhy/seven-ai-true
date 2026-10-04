import { SevenError } from "../../core/errors";
import {
  canonicalCapability,
  isMutatingTool,
  type ToolApproval,
  type ToolDefinition,
  type ToolGrant,
  type ToolInvocation,
} from "./contracts";

export type ToolAuthorization = Readonly<{
  allowed:true;
  grantIds:readonly string[];
}>;

function validTime(value:number):boolean{
  return Number.isFinite(value) && value>=0;
}

function validateGrant(grant:ToolGrant):void{
  if(!grant || typeof grant!=="object" || typeof grant.grantId!=="string" || !grant.grantId.trim()){
    throw new SevenError({code:"VALIDATION",message:"Tool grant is malformed."});
  }
  if(!validTime(grant.issuedAt)||!validTime(grant.expiresAt)||grant.expiresAt<=grant.issuedAt){
    throw new SevenError({code:"VALIDATION",message:"Tool grant lifetime is invalid."});
  }
  if(!["user","system","admin"].includes(grant.source)){
    throw new SevenError({code:"VALIDATION",message:"Tool grant source is invalid."});
  }
  grant.capabilities.forEach(canonicalCapability);
}

function grantMatches(
  grant:ToolGrant,
  definition:ToolDefinition,
  invocation:ToolInvocation,
  now:number,
):boolean{
  validateGrant(grant);
  if(now<grant.issuedAt||now>=grant.expiresAt)return false;
  if(grant.scope.roomId!==undefined&&grant.scope.roomId!==invocation.roomId)return false;
  if(grant.scope.taskId!==undefined&&grant.scope.taskId!==invocation.taskId)return false;
  if(grant.toolIds!==undefined&&!grant.toolIds.includes(definition.id))return false;
  return true;
}

function approvalRequired(definition:ToolDefinition):boolean{
  return definition.annotations.approval==="always" ||
    (definition.annotations.approval==="if-mutating"&&isMutatingTool(definition));
}

export class ToolReferenceMonitor {
  authorizeCapabilities(input:Readonly<{
    definition:ToolDefinition;
    invocation:ToolInvocation;
    grants:readonly ToolGrant[];
    now:number;
  }>):ToolAuthorization{
    const {definition,invocation,grants,now}=input;
    if(!validTime(now))throw new SevenError({code:"VALIDATION",message:"Authorization time is invalid."});
    const matching=grants.filter(grant=>grantMatches(grant,definition,invocation,now));
    const grantedCapabilities=new Set(matching.flatMap(grant=>grant.capabilities));
    const missing=definition.requiredCapabilities.filter(cap=>!grantedCapabilities.has(cap));
    if(missing.length>0){
      throw new SevenError({
        code:"PERMISSION",
        message:"Tool capability is not granted.",
        details:{missingCapabilities:Object.freeze([...missing])},
      });
    }
    return Object.freeze({allowed:true as const,grantIds:Object.freeze(matching.map(grant=>grant.grantId))});
  }

  authorize(input:Readonly<{
    definition:ToolDefinition;
    invocation:ToolInvocation;
    invocationFingerprint:string;
    grants:readonly ToolGrant[];
    approval?:ToolApproval;
    now:number;
  }>):ToolAuthorization{
    const {definition,invocation,invocationFingerprint,grants,approval,now}=input;
    const capabilityAuth=this.authorizeCapabilities({definition,invocation,grants,now});
    if(approvalRequired(definition)){
      if(!approval){
        throw new SevenError({code:"PERMISSION",message:"Tool execution requires approval."});
      }
      if(
        approval.invocationFingerprint!==invocationFingerprint ||
        !validTime(approval.issuedAt) ||
        !validTime(approval.expiresAt) ||
        now<approval.issuedAt ||
        now>=approval.expiresAt
      ){
        throw new SevenError({code:"PERMISSION",message:"Tool approval is invalid or expired."});
      }
    }
    return capabilityAuth;
  }
}
