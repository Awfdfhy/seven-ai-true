(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateLocalIntelligence=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const words=s=>String(s||'').toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}_-]+/gu)||[];
const hashWord=w=>{let h=2166136261;for(let i=0;i<w.length;i++){h^=w.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function embedding(text,dim=256){const v=new Float32Array(dim);for(const w of words(text)){const h=hashWord(w),i=h%dim,sign=(h&0x10000)?1:-1;v[i]+=sign*(1+Math.min(3,w.length/8));}let norm=0;for(const x of v)norm+=x*x;norm=Math.sqrt(norm)||1;for(let i=0;i<v.length;i++)v[i]/=norm;return v;}
function cosine(a,b){let n=0,aa=0,bb=0;const len=Math.min(a.length,b.length);for(let i=0;i<len;i++){n+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i]}return n/(Math.sqrt(aa)*Math.sqrt(bb)||1);}
class LocalIntelligencePlane{
 constructor(opts={}){this.dim=opts.dim||256;this.cache=new Map();}
 embed(text){const k=String(text||'');if(!this.cache.has(k))this.cache.set(k,embedding(k,this.dim));return this.cache.get(k);}
 similarity(a,b){return cosine(this.embed(a),this.embed(b));}
 rerank(query,items,opts={}){return items.map((item,index)=>{const text=typeof item==='string'?item:(opts.text?.(item)??JSON.stringify(item)),semantic=this.similarity(query,text),lexical=(()=>{const q=new Set(words(query)),d=new Set(words(text));let n=0;for(const x of q)if(d.has(x))n++;return q.size?n/q.size:0})();const prior=Number(opts.prior?.(item)||0);return{item,score:+(semantic*.55+lexical*.35+prior*.1).toFixed(5),semantic:+semantic.toFixed(5),lexical:+lexical.toFixed(5),index}}).sort((a,b)=>b.score-a.score||a.index-b.index);}
 classifyTask(text){const w=new Set(words(text)),score={coding:0,research:0,rpg:0,math:0,writing:0,general:.1};const hit=(cat,list,weight=1)=>{for(const x of list)if(w.has(x))score[cat]+=weight};hit('coding',['code','bug','javascript','html','css','python','test','repo','git','كود','برمجة','خطأ']);hit('research',['search','source','research','latest','evidence','بحث','مصدر','ابحث']);hit('rpg',['rpg','character','episode','story','canon','npc','قصة','شخصية','حلقة']);hit('math',['calculate','equation','integral','math','احسب','معادلة']);hit('writing',['write','rewrite','story','essay','اكتب','صياغة'],.7);const sorted=Object.entries(score).sort((a,b)=>b[1]-a[1]);const total=sorted.reduce((n,x)=>n+x[1],0)||1;return{label:sorted[0][0],confidence:+(sorted[0][1]/total).toFixed(3),scores:Object.fromEntries(sorted)};}
 clear(){this.cache.clear();}
}
return{words,embedding,cosine,LocalIntelligencePlane};
});
