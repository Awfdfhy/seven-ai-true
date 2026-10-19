import type { RepositoryEntry } from "./repository-port";
import { canonicalRepositoryPath } from "./workspace-truth";

const TEXT_EXTENSIONS = new Set([
  "ts","tsx","mts","cts","js","jsx","mjs","cjs","json","md","mdx","css","scss","html","htm",
  "java","kt","kts","py","sh","bash","yml","yaml","txt","xml","toml","ini","gradle","properties",
]);
const EXCLUDED = /(^|\/)(?:node_modules|dist|build|coverage|vendor|\.git|android\/app\/build)(\/|$)/i;

function queryTerms(query:string):readonly string[]{
  return Object.freeze([...new Set(query.normalize("NFKC").toLocaleLowerCase("en-US").match(/[\p{L}\p{N}_-]{2,}/gu)??[])]);
}
function textLike(path:string):boolean{
  const name=path.split("/").at(-1)??path;
  const ext=name.includes(".")?(name.split(".").at(-1)??"").toLowerCase():"";
  return TEXT_EXTENSIONS.has(ext)||/^(?:AGENTS|CLAUDE|GEMINI|README)(?:\.md)?$/i.test(name)||/^Dockerfile$/i.test(name);
}
function instruction(path:string):boolean{return /(^|\/)(?:AGENTS|CLAUDE|GEMINI|README)\.md$/i.test(path)||/^\.github\/copilot-instructions\.md$/i.test(path)}
function build(path:string):boolean{return /(^|\/)(?:package(?:-lock)?\.json|pnpm-lock\.yaml|yarn\.lock|tsconfig[^/]*\.json|vite\.config\.[^/]+|build\.gradle(?:\.kts)?|settings\.gradle(?:\.kts)?|pom\.xml)$/i.test(path)}

export function selectInspectionPaths(entries:readonly RepositoryEntry[],query:string,options:Readonly<{maxFiles?:number;maxBytes?:number}>={}):readonly string[]{
  const terms=queryTerms(query);
  const maxFiles=options.maxFiles??64,maxBytes=options.maxBytes??4_000_000;
  if(!Number.isSafeInteger(maxFiles)||maxFiles<1||maxFiles>256)throw new Error("Inspection maxFiles is invalid.");
  if(!Number.isSafeInteger(maxBytes)||maxBytes<1024||maxBytes>32_000_000)throw new Error("Inspection maxBytes is invalid.");
  const ranked=entries.map(entry=>{
    const path=canonicalRepositoryPath(entry.path);
    if(EXCLUDED.test(path)||!textLike(path)||entry.bytes>2_000_000)return null;
    const lower=path.toLocaleLowerCase("en-US");let score=0;
    for(const term of terms){if(lower.includes(term))score+=8;}
    if(instruction(path))score+=40;
    if(build(path))score+=12;
    if(/\.(?:test|spec)\.[^.]+$/i.test(path))score+=2;
    if(/^remake\/src\//.test(path))score+=1;
    return {path,bytes:entry.bytes,score};
  }).filter((x):x is {path:string;bytes:number;score:number}=>x!==null)
    .sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));
  const out:string[]=[];let bytes=0;
  for(const item of ranked){if(out.length>=maxFiles)break;if(out.length>0&&bytes+item.bytes>maxBytes)continue;out.push(item.path);bytes+=item.bytes;}
  if(out.length===0)throw new Error("No inspectable repository text files were selected.");
  return Object.freeze(out);
}
