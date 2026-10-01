import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import worker from '../worker.mjs';
import {NHL_TEAMS} from '../jersey-teams.mjs';
globalThis.crypto ??= webcrypto;
const jpeg='/9j/'+ 'A'.repeat(120);
const person='data:image/jpeg;base64,'+jpeg;
const testCode='ABCD';
const testHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(testCode))),b=>b.toString(16).padStart(2,'0')).join('');
const body={accessCode:testCode,team:'OTT',number:'22',view:'front',person,consent:true};
const request=(changes={},origin='https://myhockeyfit.com')=>new Request('https://myhockeyfit.com/api/jersey-look',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.7'},body:JSON.stringify({...body,...changes})});
function environment(){return {JERSEY_ACCESS_CODE_HASH:testHash,ADMIN_LIMITER:{limit:async()=>({success:true})},OPENAI_API_KEY:'test-key',ASSETS:{fetch:async()=>new Response(new Uint8Array([255,216,255,1]),{headers:{'Content-Type':'image/jpeg'}})},PHOTO_LIMITER:{limit:async()=>({success:true})},PHOTO_HOURLY:{idFromName:id=>id,get:()=>({fetch:async url=>Response.json(String(url).includes('jersey-')?{allowed:true,remaining:1}:{allowed:true})})}};}
test('jersey catalogue contains all 32 current teams with fixed Canadian shop references',()=>{
 assert.equal(NHL_TEAMS.length,32);assert.equal(new Set(NHL_TEAMS.map(x=>x.id)).size,32);assert.equal(NHL_TEAMS.find(x=>x.id==='UTA').name,'Utah Mammoth');
 for(const item of NHL_TEAMS){assert.match(item.source,/^https:\/\/www\.nhlshop\.ca\/en\//);for(const view of ['front','back']){assert.match(item[view],/^\/jersey-assets\/[a-z]{3}-(front|back)\.(jpg|png)$/);const url=new URL(item['reference'+view[0].toUpperCase()+view.slice(1)]);assert.equal(url.hostname,'images.footballfanatics.com');}}
});
test('invalid consent, photos, team, number and origin cannot reach a paid image call',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('unexpected');};
 try{
  const env=environment();assert.equal((await worker.fetch(request({},'https://other.example'),env)).status,403);
  for(const change of [{consent:false},{person:'https://other.example/photo.jpg'},{person:null},{person:'data:image/jpeg;base64,/9j/'+ 'A'.repeat(121)},{team:'UNKNOWN'},{number:'100'},{number:'make me thinner'},{view:'side'},{jersey:'https://other.example/jersey.jpg'}])assert.equal((await worker.fetch(request(change),env)).status,400);
  assert.equal(calls,0);
 }finally{globalThis.fetch=original;}
});
test('jersey generation shares the existing minute and hourly limits and fails closed',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('unexpected');};
 try{
  let env=environment();env.PHOTO_LIMITER.limit=async()=>({success:false});const minute=await worker.fetch(request(),env);assert.equal(minute.status,429);assert.match((await minute.json()).error,/10 AI uses per minute/);
  env=environment();env.PHOTO_HOURLY.get=()=>({fetch:async()=>Response.json({allowed:false,retryAfter:120})});const hour=await worker.fetch(request(),env);assert.equal(hour.status,429);assert.equal(hour.headers.get('Retry-After'),'120');assert.match((await hour.json()).error,/50 AI uses per hour/);
  env=environment();env.PHOTO_HOURLY.get=()=>({fetch:async()=>Response.json({})});assert.equal((await worker.fetch(request(),env)).status,503);assert.equal(calls,0);
 }finally{globalThis.fetch=original;}
});
test('image edits use the person and exact jersey references, preserve custom digits and never store images',async()=>{
 const original=globalThis.fetch;const calls=[];
 globalThis.fetch=async(url,options)=>{
  calls.push(String(url));
  assert.equal(url,'https://api.openai.com/v1/images/edits');const form=options.body;assert(form instanceof FormData);assert.equal(form.getAll('image[]').length,2);assert.equal(form.get('model'),'gpt-image-1.5');assert.equal(form.get('input_fidelity'),'high');assert.equal(form.get('output_format'),'jpeg');assert.match(form.get('prompt'),/custom number 07/);assert.match(form.get('prompt'),/Preserve the person's identity/);assert.match(form.get('prompt'),/no claims about real sizes/);assert.equal(form.get('n'),'1');
  return Response.json({data:[{b64_json:jpeg}]});
 };
 try{const env=environment();let asset;env.ASSETS.fetch=async request=>{asset=new URL(request.url).pathname;return new Response(new Uint8Array([255,216,255,1]),{headers:{'Content-Type':'image/jpeg'}});};const response=await worker.fetch(request({number:'07',view:'back'}),env);assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.match(response.headers.get('Content-Type'),/event-stream/);const text=await response.text();assert.match(text,/event: result/);assert.match(text,/data:image\/jpeg;base64/);assert.equal(asset,NHL_TEAMS.find(x=>x.id==='OTT').back);assert.equal(calls.length,1);}finally{globalThis.fetch=original;}
});
test('a custom jersey bypasses remote reference fetching and upstream errors stay private',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.openai.com/v1/images/edits');assert.equal(options.body.getAll('image[]').length,2);return Response.json({error:{code:'model_not_found',message:'sensitive debug test-key'}},{status:403});};
 try{const response=await worker.fetch(request({jersey:person}),environment());const text=await response.text();assert.match(text,/event: error/);assert.match(text,/check image model access/);assert(!text.includes('test-key'));assert(!text.includes('sensitive'));assert.equal(calls,1);}finally{globalThis.fetch=original;}
});

test('referral code is verified on the server before any asset or paid AI call',async()=>{
 const original=globalThis.fetch;let calls=0,assets=0;
 globalThis.fetch=async()=>{calls++;throw Error('unexpected paid call');};
 try{
  const env=environment();env.ASSETS.fetch=async()=>{assets++;throw Error('unexpected asset');};
  for(const change of [{accessCode:undefined},{accessCode:'WRONGCODE123'},{accessCode:null},{accessCode:{}}])assert.equal((await worker.fetch(request(change),env)).status,403);
  const accepted=await worker.fetch(request({action:'access',accessCode:' abcd '}),env);assert.equal(accepted.status,200);assert.deepEqual(await accepted.json(),{authorized:true,remaining:1});
  const config=await worker.fetch(new Request('https://myhockeyfit.com/api/jersey-look'),env);const data=await config.json();assert.equal(data.requiresCode,true);assert(!JSON.stringify(data).includes(testCode));assert(!JSON.stringify(data).includes(testHash));
  assert.equal(calls,0);assert.equal(assets,0);
 }finally{globalThis.fetch=original;}
});
test('code attempts are limited and verification fails closed',async()=>{
 const env=environment();env.ADMIN_LIMITER.limit=async()=>({success:false});
 const response=await worker.fetch(request({action:'access'}),env);assert.equal(response.status,429);assert.equal(response.headers.get('Retry-After'),'60');
 delete env.ADMIN_LIMITER;assert.equal((await worker.fetch(request({action:'access'}),env)).status,503);
 env.ADMIN_LIMITER={limit:async()=>({success:true})};env.JERSEY_ACCESS_CODE_HASH='invalid';assert.equal((await worker.fetch(request({action:'access'}),env)).status,403);
});

test('exhausted or unavailable jersey quota never reaches the paid image endpoint',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('unexpected');};
 try{
  const env=environment();env.PHOTO_HOURLY.get=()=>({fetch:async url=>Response.json(String(url).includes('jersey-')?{allowed:false,remaining:0}:{allowed:true})});
  const result=await worker.fetch(request(),env);assert.equal(result.status,429);assert.match((await result.json()).error,/all 2/);
  const access=await worker.fetch(request({action:'access'}),env);assert.deepEqual(await access.json(),{authorized:true,remaining:0});
  env.PHOTO_HOURLY.get=()=>({fetch:async()=>Response.json({allowed:true})});assert.equal((await worker.fetch(request(),env)).status,503);assert.equal(calls,0);
 }finally{globalThis.fetch=original;}
});

test('Blazers invites 2 through 34 and the existing code are accepted without spending AI quota',async()=>{
 const env=environment();delete env.JERSEY_ACCESS_CODE_HASH;let paid=0,reservations=0;
 const original=globalThis.fetch;globalThis.fetch=async()=>{paid++;throw Error('unexpected AI call');};
 env.PHOTO_HOURLY.get=()=>({fetch:async url=>{if(String(url).endsWith('/jersey-use'))reservations++;return Response.json({allowed:true,remaining:2});}});
 try{
  for(const code of ['repb',...Array.from({length:33},(_,i)=>'blazers'+(i+2))]){
   const response=await worker.fetch(request({action:'access',accessCode:code}),env);assert.equal(response.status,200,code);assert.deepEqual(await response.json(),{authorized:true,remaining:2});
  }
  assert.equal((await worker.fetch(request({action:'access',accessCode:' BLAZERS34 '}),env)).status,200);
  for(const code of ['blazers1','blazers35','blazers02','blazers'])assert.equal((await worker.fetch(request({action:'access',accessCode:code}),env)).status,403,code);
  assert.equal(paid,0);assert.equal(reservations,0);
 }finally{globalThis.fetch=original;}
});
