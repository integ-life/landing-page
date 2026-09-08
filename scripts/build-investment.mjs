import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateData} from '../docs/investment/research-core.mjs';
import {validateDemo} from '../docs/investment/demo-core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'docs/investment');
const read = file => fs.readFileSync(path.join(site, file));
const hash = data => createHash('sha256').update(data).digest('hex');
const html = read('index.html').toString();
const manifest = JSON.parse(read('data/manifest.json'));
assert.equal(manifest.scenarios.length, 4);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate element IDs');
for(const section of ['demos','results','replay','method','data']) assert(ids.includes(section));
for(const m of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:\?[^"#]*)?"/g)) assert(fs.existsSync(path.join(site,m[1])), `Missing public asset: ${m[1]}`);
assert(html.includes('MODEL-ONLY'));
assert(html.includes('https://integ.life/investment/'));
assert(!html.includes('localhost') && !html.includes('/home/songyy'));
for(const info of manifest.scenarios){
  const bytes = read(`data/${info.id}.json`);
  assert.equal(hash(bytes),info.data_sha256);
  const payload = JSON.parse(bytes);
  const days = validateData(info,payload);
  assert.equal(payload.cycles.length,info.event_counts.CALL_ASSIGNED);
  for(const event of payload.events){
    if(['SELL_PUT','SELL_CALL'].includes(event.action)) assert(event.signal_date<event.date,'Same-day fill');
    assert(event.shares_after===0||event.shares_after===100);
  }
  for(const file of [`data/${info.id}-events.csv`,`data/${info.id}-equity.csv`]) assert(read(file).length>100);
  assert.equal(days.length,2011);
}
const demos=JSON.parse(read('data/demos/manifest.json'));
assert.equal(demos.cases.length,6);assert.equal(demos.runs.length,12);
assert.equal(new Set(demos.runs.map(r=>r.id)).size,12);
let demoDays=0;
for(const info of demos.runs){
  const bytes=read(`data/demos/${info.id}.json`);
  assert.equal(hash(bytes),info.sha256);
  const payload=JSON.parse(bytes),days=validateDemo(payload);demoDays+=days.length;
  assert.equal(payload.case.id,info.case_id);assert.equal(payload.funding.id,info.funding_id);
  assert.deepEqual(info.stats,payload.stats);
  for(const key of ['wheel','floor'])for(const event of payload.events[key])if(['SELL_PUT','SELL_CALL'].includes(event.action))assert(event.signal_date<event.date,'Demo same-day fill');
  for(const suffix of ['-daily.csv','-monthly.csv'])assert(read(`data/demos/${info.id}${suffix}`).length>100);
}
const release = {release:'20260908-investment-v2', evidence:'MODEL-ONLY', manifest_sha256:hash(read('data/manifest.json')), demo_manifest_sha256:hash(read('data/demos/manifest.json')), assets:Object.fromEntries(['index.html','investment.css','investment.mjs','research-core.mjs','demos.css','demos.mjs','demo-core.mjs'].map(file=>[file,hash(read(file))]))};
fs.writeFileSync(path.join(site,'release.json'),JSON.stringify(release,null,2)+'\n');
console.log(`Static publication validated: 4 original scenarios + 12 teaching cases (${demoDays.toLocaleString()} demo daily rows), equal funding, cash-flow-adjusted performance, reconciled monthly ledgers and asset hashes.`);
