import { SevenError } from "../../core/errors";
import {
  canonicalToolId,
  validateToolDefinition,
  type ToolDefinition,
} from "./contracts";

export class ToolRegistry {
  private readonly definitions=new Map<string,ToolDefinition>();

  register<TInput,TOutput>(definition:ToolDefinition<TInput,TOutput>):void{
    const validated=validateToolDefinition(definition) as ToolDefinition;
    if(this.definitions.has(validated.id)){
      throw new SevenError({code:"VALIDATION",message:"Tool id is already registered."});
    }
    this.definitions.set(validated.id,validated);
  }

  get(toolId:string):ToolDefinition|undefined{
    return this.definitions.get(canonicalToolId(toolId));
  }

  require(toolId:string):ToolDefinition{
    const id=canonicalToolId(toolId);
    const definition=this.definitions.get(id);
    if(!definition){
      throw new SevenError({code:"VALIDATION",message:"Requested tool is not registered."});
    }
    return definition;
  }

  list():readonly ToolDefinition[]{
    return Object.freeze(
      [...this.definitions.values()]
        .sort((a,b)=>a.id.localeCompare(b.id))
        .map(definition=>Object.freeze({...definition})),
    );
  }
}
