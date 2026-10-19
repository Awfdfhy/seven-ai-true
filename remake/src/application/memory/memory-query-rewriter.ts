import type { ProviderAdapter } from "../../providers/contracts";

export interface MemoryQueryRewriter {
  rewrite(query:string,signal:AbortSignal):Promise<readonly string[]>;
}

function parseRewritePayload(text:string,original:string):readonly string[]{
  const match=text.match(/\[[\s\S]*\]/);
  if(!match)return Object.freeze([]);
  let parsed:unknown;
  try{parsed=JSON.parse(match[0]);}catch{return Object.freeze([]);}
  if(!Array.isArray(parsed))return Object.freeze([]);
  const originalKey=original.trim().toLocaleLowerCase("en-US");
  const out:string[]=[];
  for(const value of parsed){
    if(typeof value!=="string")continue;
    const item=value.trim().replace(/[\s\u00A0]+/g," ");
    if(!item||item.length>160||item.toLocaleLowerCase("en-US")===originalKey)continue;
    if(!out.includes(item))out.push(item);
    if(out.length>=4)break;
  }
  return Object.freeze(out);
}

export class ProviderMemoryQueryRewriter implements MemoryQueryRewriter {
  constructor(
    private readonly provider:ProviderAdapter,
    private readonly modelId:string,
  ){}

  async rewrite(query:string,signal:AbortSignal):Promise<readonly string[]>{
    if(!query.trim())return Object.freeze([]);
    let text="";
    for await(const chunk of this.provider.stream({
      modelId:this.modelId,
      maxOutputTokens:96,
      messages:[
        {
          role:"system",
          content:[
            "Rewrite the user's memory-search question into 3 or 4 short search phrases.",
            "Return ONLY a JSON array of strings.",
            "Do not answer the question.",
            "Do not invent any user facts, names, dates, preferences, or entities.",
            "Keep the meaning of the query; use synonyms/paraphrases that could match stored notes.",
          ].join(" "),
        },
        {role:"user",content:query},
      ],
    },signal)){
      text+=chunk.delta;
      if(text.length>1200)break;
    }
    return parseRewritePayload(text,query);
  }
}

export { parseRewritePayload };
