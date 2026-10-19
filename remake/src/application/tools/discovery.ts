import { SevenError } from "../../core/errors";
import type { ToolDefinition, ToolRisk } from "./contracts";
import { ToolRegistry } from "./registry";

export type ToolDiscoveryCandidate = Readonly<{
  tool: ToolDefinition<any, any>;
  score: number;
  reasons: readonly string[];
}>;

export type ToolDiscoveryRequest = Readonly<{
  query: string;
  availableCapabilities: readonly string[];
  maxTools?: number;
  allowedRisks?: readonly ToolRisk[];
}>;

const STOPWORDS=new Set([
  "the","and","for","with","from","this","that","into","about","your","you","please","can","could","would",
  "ما","من","في","على","الى","إلى","عن","هذا","هذه","هل","يمكن","اريد","أريد","لي"
]);

function normalize(value:string):string{
  return value.normalize("NFKC").toLocaleLowerCase("en-US")
    .replace(/[\u064B-\u065F\u0670]/g,"")
    .replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه");
}

const QUERY_ALIASES:Readonly<Record<string,readonly string[]>>=Object.freeze({
  remember:["memory"],
  remembers:["memory"],
  remembered:["memory"],
  recall:["memory"],
  preference:["memory"],
  preferences:["memory"],
  تذكر:["ذاكره","memory"],
  تتذكر:["ذاكره","memory"],
  ذاكره:["memory"],
  الذاكره:["memory"],
  سابقه:["rooms","chat"],
  السابقه:["rooms","chat"],
  history:["rooms","chat"],
  previous:["rooms","chat"],
});

function tokens(value:string,expandAliases=false):readonly string[]{
  const base=(normalize(value).match(/[\p{L}\p{N}_-]{2,}/gu)??[])
    .filter(token=>!STOPWORDS.has(token));
  if(!expandAliases)return Object.freeze([...new Set(base)]);
  const expanded=[...base];
  for(const token of base){
    const aliases=QUERY_ALIASES[token];
    if(aliases)expanded.push(...aliases);
  }
  return Object.freeze([...new Set(expanded)]);
}

function namespaceOf(id:string):string{
  const index=id.indexOf(".");
  return index>0?id.slice(0,index):id;
}

function scoreTool(queryTokens:readonly string[],tool:ToolDefinition<any, any>):ToolDiscoveryCandidate{
  const idTokens=tokens(tool.id.replace(/[._-]+/g," "));
  const titleTokens=tokens(tool.title);
  const descriptionTokens=tokens(tool.description);
  const capabilityTokens=tokens(tool.requiredCapabilities.join(" ").replace(/[._:-]+/g," "));
  const reasons:string[]=[];
  let score=0;

  for(const token of queryTokens){
    if(idTokens.includes(token)){score+=8;reasons.push(`id:${token}`);}
    if(titleTokens.includes(token)){score+=6;reasons.push(`title:${token}`);}
    if(capabilityTokens.includes(token)){score+=4;reasons.push(`capability:${token}`);}
    if(descriptionTokens.includes(token)){score+=2;reasons.push(`description:${token}`);}
  }

  const normalizedQuery=normalize(queryTokens.join(" "));
  const namespace=namespaceOf(tool.id);
  if(queryTokens.includes(namespace)){
    score+=10;
    reasons.push(`namespace:${namespace}`);
  }
  if(normalizedQuery&&normalize(tool.title).includes(normalizedQuery)){
    score+=3;
    reasons.push("title-phrase");
  }

  // Prefer lower-risk candidates when relevance ties. Discovery is not auth,
  // but this reduces needless exposure of mutating tools.
  const riskPenalty:Record<ToolRisk,number>={
    pure:0,read:0.1,write:0.4,external:0.6,destructive:1,
  };
  score-=riskPenalty[tool.annotations.risk];

  return Object.freeze({
    tool,
    score,
    reasons:Object.freeze([...new Set(reasons)]),
  });
}

export class ToolDiscovery {
  constructor(private readonly registry:ToolRegistry){}

  discover(request:ToolDiscoveryRequest):readonly ToolDiscoveryCandidate[]{
    if(!request||typeof request!=="object"){
      throw new SevenError({code:"VALIDATION",message:"Tool discovery request is invalid."});
    }
    const query=request.query.trim();
    if(!query)return Object.freeze([]);
    const maxTools=request.maxTools??8;
    if(!Number.isSafeInteger(maxTools)||maxTools<1||maxTools>32){
      throw new SevenError({code:"VALIDATION",message:"Tool discovery maxTools is invalid."});
    }
    const capabilities=new Set(request.availableCapabilities);
    const allowedRisks=new Set<ToolRisk>(
      request.allowedRisks??["pure","read","write","external","destructive"],
    );
    const queryTokens=tokens(query,true);

    return Object.freeze(
      this.registry.list()
        .filter(tool=>allowedRisks.has(tool.annotations.risk))
        .filter(tool=>tool.requiredCapabilities.every(capability=>capabilities.has(capability)))
        .map(tool=>scoreTool(queryTokens,tool))
        .filter(candidate=>candidate.score>0)
        .sort((a,b)=>b.score-a.score || a.tool.id.localeCompare(b.tool.id))
        .slice(0,maxTools),
    );
  }
}
