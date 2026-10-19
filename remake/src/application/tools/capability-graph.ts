import { SevenError } from "../../core/errors";
import type { ToolDefinition } from "./contracts";
import { ToolRegistry } from "./registry";

export type ToolCapabilityNode = Readonly<{
  capability: string;
  toolIds: readonly string[];
}>;

export type ToolNamespaceNode = Readonly<{
  namespace: string;
  toolIds: readonly string[];
}>;

export type ToolCapabilityGraphSnapshot = Readonly<{
  capabilities: readonly ToolCapabilityNode[];
  namespaces: readonly ToolNamespaceNode[];
}>;

function namespaceOf(toolId:string):string{
  const index=toolId.indexOf(".");
  return index>0?toolId.slice(0,index):toolId;
}

export class ToolCapabilityGraph {
  constructor(private readonly registry:ToolRegistry){}

  snapshot():ToolCapabilityGraphSnapshot{
    const capabilityMap=new Map<string,string[]>();
    const namespaceMap=new Map<string,string[]>();
    for(const tool of this.registry.list()){
      const ns=namespaceOf(tool.id);
      const nsList=namespaceMap.get(ns)??[];
      nsList.push(tool.id);
      namespaceMap.set(ns,nsList);
      for(const capability of tool.requiredCapabilities){
        const list=capabilityMap.get(capability)??[];
        list.push(tool.id);
        capabilityMap.set(capability,list);
      }
    }
    return Object.freeze({
      capabilities:Object.freeze(
        [...capabilityMap.entries()]
          .sort(([a],[b])=>a.localeCompare(b))
          .map(([capability,ids])=>Object.freeze({
            capability,
            toolIds:Object.freeze([...ids].sort()),
          })),
      ),
      namespaces:Object.freeze(
        [...namespaceMap.entries()]
          .sort(([a],[b])=>a.localeCompare(b))
          .map(([namespace,ids])=>Object.freeze({
            namespace,
            toolIds:Object.freeze([...ids].sort()),
          })),
      ),
    });
  }

  toolsForCapability(capability:string):readonly ToolDefinition[]{
    if(typeof capability!=="string"||!capability.trim()||capability!==capability.trim()){
      throw new SevenError({code:"VALIDATION",message:"Capability lookup is invalid."});
    }
    return Object.freeze(
      this.registry.list().filter(tool=>tool.requiredCapabilities.includes(capability)),
    );
  }

  toolsForNamespace(namespace:string):readonly ToolDefinition[]{
    if(typeof namespace!=="string"||!/^[a-z0-9][a-z0-9_-]{1,63}$/i.test(namespace)){
      throw new SevenError({code:"VALIDATION",message:"Tool namespace is invalid."});
    }
    return Object.freeze(
      this.registry.list().filter(tool=>namespaceOf(tool.id)===namespace),
    );
  }
}
