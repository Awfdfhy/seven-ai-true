const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');

const root=path.resolve(__dirname,'..');
const workflowDir=path.join(root,'.github','workflows');
const workflows=[
  'agent-live-cline-smoke.yml',
  'agent-live-codex-smoke.yml',
  'agent-live-gemini-smoke.yml',
  'agent-live-goose-smoke.yml',
  'agent-live-hermes-smoke.yml',
  'agent-live-mini-swe-smoke.yml',
  'agent-live-opencode-smoke.yml',
  'agent-live-openhands-smoke.yml',
  'agent-live-qwen-smoke.yml',
  'agent-live-smoke.yml',
];

const groups=new Map();
const branchOwners=new Map();
const reportOwners=new Map();

function claim(map,value,file,label){
  if(!value) return;
  const previous=map.get(value);
  assert.ok(!previous || previous===file,`${label} ${value} is shared by ${previous} and ${file}`);
  map.set(value,file);
}

for(const file of workflows){
  const full=path.join(workflowDir,file);
  assert.ok(fs.existsSync(full),`missing workflow: ${file}`);
  const text=fs.readFileSync(full,'utf8');

  // These live-agent jobs intentionally use GitHub-hosted runners. GitHub-hosted
  // jobs receive isolated runner workspaces/VMs, so destructive sanitation in one
  // job cannot reset another job's checkout.
  assert.ok(!/runs-on:\s*(?:\[?\s*)?self-hosted\b/i.test(text),`${file} must not use self-hosted runners`);
  const runners=[...text.matchAll(/runs-on:\s*([^\n#]+)/g)].map(m=>m[1].trim());
  assert.ok(runners.length>0,`${file} has no runner declaration`);
  for(const runner of runners){
    assert.equal(runner,'ubuntu-latest',`${file} runner must remain GitHub-hosted ubuntu-latest`);
  }

  // Every checkout in a write-capable agent workflow must explicitly avoid
  // persisting repository credentials into the agent-visible checkout.
  const checkoutBlocks=text.split(/(?=\n\s*- uses: actions\/checkout@v4)/g)
    .filter(x=>x.includes('uses: actions/checkout@v4'));
  assert.ok(checkoutBlocks.length>0,`${file} has no checkout`);
  for(const block of checkoutBlocks){
    const head=block.split(/\n\s*- (?:uses|name): /,2)[0];
    assert.match(head,/persist-credentials:\s*false/,`${file} checkout must set persist-credentials: false`);
  }

  const group=text.match(/concurrency:\s*[\s\S]*?group:\s*([^\n#]+)/);
  assert.ok(group,`${file} must declare a concurrency group`);
  const groupName=group[1].trim();
  claim(groups,groupName,file,'concurrency group');

  // Agents are allowed to mutate their isolated checkout while running, but only
  // the declared report survives. Sanitation is mandatory before any push.
  if(/contents:\s*write/.test(text)){
    assert.match(text,/Sanitize to allowed output only/,`${file} lacks output sanitation`);
    assert.match(text,/git reset --hard HEAD/,`${file} must reset agent mutations`);
    assert.match(text,/git clean -fdx/,`${file} must remove untracked agent mutations`);
  }

  const branches=new Set();
  for(const m of text.matchAll(/\b(?:branch|ref):\s*(agent(?:-b)?\/[A-Za-z0-9._\/-]+)/g)) branches.add(m[1]);
  for(const m of text.matchAll(/HEAD:(agent(?:-b)?\/[A-Za-z0-9._\/-]+)/g)) branches.add(m[1]);
  for(const branch of branches) claim(branchOwners,branch,file,'agent branch');

  const reports=new Set([...text.matchAll(/\.seven-team\/reports\/[A-Za-z0-9._\/-]*live-smoke\.md/g)].map(m=>m[0]));
  assert.ok(reports.size>0 || file==='agent-live-codex-smoke.yml' || file==='agent-live-gemini-smoke.yml',
    `${file} should own at least one live-smoke report path`);
  for(const report of reports) claim(reportOwners,report,file,'report path');
}

assert.equal(groups.size,workflows.length,'every live-agent workflow must own a unique concurrency group');
assert.ok(branchOwners.size>=18,'expected isolated Team A/Team B agent branches across live workflows');
assert.ok(reportOwners.size>=18,'expected isolated Team A/Team B report paths across live workflows');

console.log(`agent workflow isolation: PASS (${workflows.length} workflows, ${branchOwners.size} branches, ${reportOwners.size} reports)`);
