import type { MemoryFact } from "../../domain/memory/fabric";

const EN_STOP = new Set([
  "the","and","for","with","that","this","from","into","about","what","which","who","where","when","how",
  "my","your","our","their","his","her","its","use","uses","using","used","project","memory","remember",
  "prefer","preferred","like","love","want","need","main","current","work","working","goal"
]);
const GENERIC_MEMORY_TOKENS = new Set([
  "preference","profile","fact","event","decision","procedure","goal","memory",
  "core","recall","global","room","explicit","arabic","work","project"
]);

const AR_STOP = new Set([
  "هذا","هذه","ذلك","التي","الذي","على","الى","إلى","عن","من","في","مع","ما","ماذا","كيف","متى","اين","أين",
  "انا","أنا","لي","لدي","عندي","مشروع","مشروعي","هدفي","احب","أحب","افضل","أفضل","تذكر","ذاكره","ذاكرة"
]);

function normalize(value:string):string{
  return value.normalize("NFKC").toLocaleLowerCase("en-US")
    .replace(/[\u064B-\u065F\u0670]/g,"")
    .replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه");
}

export function associationTokens(value:string):readonly string[]{
  const raw=normalize(value).match(/[\p{L}\p{N}_-]{3,}/gu)??[];
  return Object.freeze([...new Set(raw.filter(t=>
    !EN_STOP.has(t) &&
    !AR_STOP.has(t) &&
    !GENERIC_MEMORY_TOKENS.has(t) &&
    !/^\d+$/.test(t)
  ))].slice(0,32));
}

function documentFrequency(facts:readonly MemoryFact[]):Map<string,number>{
  const df=new Map<string,number>();
  for(const fact of facts){
    for(const token of new Set([...associationTokens(fact.content),...fact.tags.flatMap(associationTokens)])){
      df.set(token,(df.get(token)??0)+1);
    }
  }
  return df;
}

export type AssociationExpansion = Readonly<{
  fact: MemoryFact;
  bridgeTokens: readonly string[];
  score: number;
}>;

export function expandAssociatedMemories(
  facts:readonly MemoryFact[],
  seedFacts:readonly MemoryFact[],
  query:string,
  maxExpansion=4,
):readonly AssociationExpansion[]{
  if(seedFacts.length===0 || maxExpansion<=0)return Object.freeze([]);
  const seedIds=new Set(seedFacts.map(f=>f.id));
  const queryTokens=new Set(associationTokens(query));
  const df=documentFrequency(facts);

  const bridgeWeights=new Map<string,number>();
  for(const seed of seedFacts){
    const tokens=[...associationTokens(seed.content),...seed.tags.flatMap(associationTokens)];
    for(const token of new Set(tokens)){
      if(queryTokens.has(token))continue;
      const frequency=df.get(token)??0;
      if(frequency<2 || frequency>Math.max(6,Math.ceil(facts.length*.08)))continue;
      // Rare bridge tokens are more discriminative.
      bridgeWeights.set(token,Math.max(bridgeWeights.get(token)??0,1/Math.log2(2+frequency)));
    }
  }
  if(bridgeWeights.size===0)return Object.freeze([]);

  const expansions:AssociationExpansion[]=[];
  for(const fact of facts){
    if(seedIds.has(fact.id) || fact.status!=="active")continue;
    const tokens=new Set([...associationTokens(fact.content),...fact.tags.flatMap(associationTokens)]);
    const bridges=[...bridgeWeights.keys()].filter(token=>tokens.has(token));
    if(bridges.length===0)continue;
    const bridgeScore=bridges.reduce((sum,t)=>sum+(bridgeWeights.get(t)??0),0);
    const score=bridgeScore + fact.importance*.15 + fact.confidence*.12;
    expansions.push(Object.freeze({fact,bridgeTokens:Object.freeze(bridges),score}));
  }

  return Object.freeze(expansions
    .sort((a,b)=>b.score-a.score || b.fact.updatedAt-a.fact.updatedAt || a.fact.id.localeCompare(b.fact.id))
    .slice(0,maxExpansion));
}
