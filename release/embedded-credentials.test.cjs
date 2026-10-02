const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const {build,embeddedCredentialsFromEnv}=require('./build-release.cjs');

const ROOT=path.resolve(__dirname,'..');
const SOURCE=path.join(ROOT,'seven_ai-final.html');
const fixture={
  SEVEN_EMBED_CLOUDFLARE_API_TOKEN:'fixture-cloudflare-token-not-a-real-secret',
  SEVEN_EMBED_CLOUDFLARE_ACCOUNT_ID:'fixture-account-id',
  SEVEN_EMBED_SEARCH_GATEWAY_URL:'https://fixture-gateway.example',
  SEVEN_EMBED_SEARCH_GATEWAY_KEY:'fixture-gateway-key'
};
const old={};
for(const [k,v] of Object.entries(fixture)){old[k]=process.env[k];process.env[k]=v;}

try{
  const mapped=embeddedCredentialsFromEnv();
  assert.equal(mapped.CLOUDFLARE_API_TOKEN,fixture.SEVEN_EMBED_CLOUDFLARE_API_TOKEN);
  assert.equal(mapped.CLOUDFLARE_ACCOUNT_ID,fixture.SEVEN_EMBED_CLOUDFLARE_ACCOUNT_ID);
  assert.equal(mapped.SEARCH_GATEWAY_URL,fixture.SEVEN_EMBED_SEARCH_GATEWAY_URL);
  assert.equal(mapped.SEARCH_GATEWAY_KEY,fixture.SEVEN_EMBED_SEARCH_GATEWAY_KEY);

  const source=fs.readFileSync(SOURCE,'utf8');
  for(const value of Object.values(fixture)) assert.equal(source.includes(value),false,'fixture leaked into source');

  const out=build();
  const html=fs.readFileSync(out.output,'utf8');
  for(const value of Object.values(fixture)) assert.equal(html.includes(value),true,'fixture missing from packaged release');
  assert.deepEqual(out.embeddedCredentialNames,[
    'CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_TOKEN','SEARCH_GATEWAY_KEY','SEARCH_GATEWAY_URL'
  ]);
  assert.match(html,/id="seven-embedded-credentials"/);
  console.log('embedded credential packaging: PASS');
} finally {
  for(const k of Object.keys(fixture)){
    if(old[k]===undefined) delete process.env[k];
    else process.env[k]=old[k];
  }
  build(); // leave dist clean after the fixture test
}
