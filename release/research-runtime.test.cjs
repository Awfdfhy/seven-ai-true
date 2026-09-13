const assert=require('assert/strict');
const {verify,STATUS}=require('./research-runtime.js');

const now='2026-09-13T00:00:00Z';
const claims=[
  {id:'fresh',text:'Current fact',timeSensitive:true,freshnessDays:7},
  {id:'stable',text:'Stable fact'},
  {id:'conflict',text:'Disputed fact'},
  {id:'missing',text:'No evidence yet'},
  {id:'old',text:'Old current claim',timeSensitive:true,freshnessDays:3}
];
const sources=[
  {id:'official',title:'Official',url:'https://example.com/official',authority:'A0',publishedAt:'2026-09-12T00:00:00Z',evidence:[
    {claimId:'fresh',stance:'support',locator:'p1'},
    {claimId:'stable',stance:'support',locator:'p2'},
    {claimId:'conflict',stance:'support',locator:'p3'}
  ]},
  {id:'second',title:'Second source',url:'https://example.org/report',authority:'A2',publishedAt:'2026-09-11T00:00:00Z',evidence:[
    {claimId:'conflict',stance:'contradict',locator:'s4'}
  ]},
  {id:'old-source',title:'Old source',url:'https://example.net/old',authority:'A1',publishedAt:'2026-08-01T00:00:00Z',evidence:[
    {claimId:'old',stance:'support',locator:'old1'}
  ]}
];

const out=verify(claims,sources,{now});
assert.equal(out.analysis.status,STATUS.INCONCLUSIVE);
assert.deepEqual(out.analysis.gaps,['missing']);
assert.deepEqual(out.analysis.stale,['old']);
assert.deepEqual(out.analysis.conflicts,['conflict']);
assert.ok(out.citationLock.claims.fresh[0].url.startsWith('https://'));
assert.ok(out.nextActions.some(x=>x.type==='gap-search'&&x.claimId==='missing'));
assert.ok(out.nextActions.some(x=>x.type==='freshness-search'&&x.claimId==='old'));
assert.ok(out.nextActions.some(x=>x.type==='contradiction-resolution'&&x.claimId==='conflict'));

const clean=verify(
  [{id:'c',text:'Verified current claim',timeSensitive:true,freshnessDays:30}],
  [{id:'s',url:'https://example.com/x',authority:'A0',publishedAt:'2026-09-10',evidence:[{claimId:'c',stance:'support'}]}],
  {now}
);
assert.equal(clean.analysis.status,STATUS.PASS);
assert.equal(clean.analysis.complete,true);
assert.equal(clean.citationLock.status,STATUS.PASS);

const uncitable=verify(
  [{id:'c',text:'Needs citation'}],
  [{id:'s',url:'not-a-url',authority:'A0',evidence:[{claimId:'c',stance:'support'}]}],
  {now}
);
assert.deepEqual(uncitable.analysis.uncitable,['c']);

console.log('research runtime: PASS');
