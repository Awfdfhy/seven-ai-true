import { SevenError } from "../../core/errors";
import type {
  ToolApproval,
  ToolAuthoritySnapshot,
  ToolAuthoritySource,
  ToolGrant,
  ToolInvocation,
} from "./contracts";

export class InMemoryToolAuthoritySource implements ToolAuthoritySource {
  private readonly grants=new Map<string,ToolGrant>();
  private readonly approvals=new Map<string,ToolApproval>();

  setGrant(grant:ToolGrant):void{
    if(!grant||typeof grant!=="object"||typeof grant.grantId!=="string"||!grant.grantId.trim()){
      throw new SevenError({code:"VALIDATION",message:"Tool grant is invalid."});
    }
    this.grants.set(grant.grantId,Object.freeze({
      ...grant,
      capabilities:Object.freeze([...grant.capabilities]),
      ...(grant.toolIds?{toolIds:Object.freeze([...grant.toolIds])}:{}),
      scope:Object.freeze({...grant.scope}),
    }));
  }

  removeGrant(grantId:string):boolean{
    return this.grants.delete(grantId);
  }

  setApproval(approval:ToolApproval):void{
    if(!approval||typeof approval!=="object"||typeof approval.approvalId!=="string"||!approval.approvalId.trim()){
      throw new SevenError({code:"VALIDATION",message:"Tool approval is invalid."});
    }
    this.approvals.set(approval.invocationFingerprint,Object.freeze({...approval}));
  }

  removeApproval(approvalId:string):boolean{
    for(const [fingerprint,approval] of this.approvals){
      if(approval.approvalId===approvalId){
        this.approvals.delete(fingerprint);
        return true;
      }
    }
    return false;
  }

  resolve(_invocation:ToolInvocation,fingerprint:string):ToolAuthoritySnapshot{
    const approval=this.approvals.get(fingerprint);
    return Object.freeze({
      grants:Object.freeze([...this.grants.values()]),
      ...(approval?{approval}:{}),
    });
  }
}
