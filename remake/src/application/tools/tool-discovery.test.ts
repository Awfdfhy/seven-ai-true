import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { ToolDefinition } from "./contracts";
import { ToolCapabilityGraph } from "./capability-graph";
import { ToolDiscovery } from "./discovery";
import { ToolRegistry } from "./registry";

function tool(
  id:string,
  title:string,
  description:string,
  capability:string,
  risk:ToolDefinition["annotations"]["risk"]="read",
):ToolDefinition<{q:string},{ok:boolean}>{
  return {
    id,version:"1.0.0",title,description,
    inputSchema:z.object({q:z.string()}).strict(),
    outputSchema:z.object({ok:z.boolean()}).strict(),
    requiredCapabilities:[capability],
    annotations:{
      risk,idempotency:"idempotent",approval:risk==="write"||risk==="destructive"?"if-mutating":"never",
      sensitivity:"user-data",reversibility:risk==="destructive"?"irreversible":"reversible",
    },
    timeoutMs:500,maxResultBytes:1024,
    async handler(){return {ok:true};},
  };
}

describe("Tool capability graph and discovery",()=>{
  it("builds deterministic capability and namespace indexes",()=>{
    const registry=new ToolRegistry();
    registry.register(tool("memory.search","Search memory","Find saved memories","memory.read"));
    registry.register(tool("memory.delete","Delete memory","Delete a saved memory","memory.write","destructive"));
    registry.register(tool("rooms.search","Search rooms","Search conversation history","rooms.read"));
    const snapshot=new ToolCapabilityGraph(registry).snapshot();
    expect(snapshot.namespaces).toEqual([
      {namespace:"memory",toolIds:["memory.delete","memory.search"]},
      {namespace:"rooms",toolIds:["rooms.search"]},
    ]);
    expect(snapshot.capabilities.find(node=>node.capability==="memory.read")?.toolIds).toEqual(["memory.search"]);
  });

  it("discovers only tools whose capabilities are available",()=>{
    const registry=new ToolRegistry();
    registry.register(tool("memory.search","Search memory","Find saved personal memories","memory.read"));
    registry.register(tool("memory.delete","Delete memory","Delete saved personal memory","memory.write","destructive"));
    const discovery=new ToolDiscovery(registry);
    const candidates=discovery.discover({
      query:"find something from my memory",
      availableCapabilities:["memory.read"],
    });
    expect(candidates.map(c=>c.tool.id)).toEqual(["memory.search"]);
  });

  it("can hide high-risk tools even when their capability exists",()=>{
    const registry=new ToolRegistry();
    registry.register(tool("files.read","Read file","Read file content","files.read","read"));
    registry.register(tool("files.delete","Delete file","Delete file permanently","files.delete","destructive"));
    const discovery=new ToolDiscovery(registry);
    const ids=discovery.discover({
      query:"file",
      availableCapabilities:["files.read","files.delete"],
      allowedRisks:["pure","read"],
    }).map(candidate=>candidate.tool.id);
    expect(ids).toEqual(["files.read"]);
  });

  it("does not treat discovery as authorization",()=>{
    const registry=new ToolRegistry();
    registry.register(tool("github.create_file","Create GitHub file","Write a repository file","github.write","write"));
    const discovery=new ToolDiscovery(registry);
    expect(discovery.discover({
      query:"create github file",
      availableCapabilities:[],
    })).toHaveLength(0);
    expect(discovery.discover({
      query:"create github file",
      availableCapabilities:["github.write"],
    })[0]?.tool.id).toBe("github.create_file");
  });

  it("keeps candidate count bounded",()=>{
    const registry=new ToolRegistry();
    for(let i=0;i<20;i+=1){
      registry.register(tool(`search.tool${i}`,`Search tool ${i}`,"Search data","search.read"));
    }
    const discovery=new ToolDiscovery(registry);
    expect(discovery.discover({
      query:"search",
      availableCapabilities:["search.read"],
      maxTools:5,
    })).toHaveLength(5);
  });
});
