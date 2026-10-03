import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import worker from '../worker.mjs';
import {NHL_TEAMS} from '../jersey-teams.mjs';
globalThis.crypto ??= webcrypto;
const jpeg='/9j/'+ 'A'.repeat(120);
const person='data:image/jpeg;base64,'+jpeg;
const body={team:'OTT',number:'22',view:'front',person,consent:true};
const request=(changes={},origin='https://myhockeyfit.com')=>new Request('https://myhockeyfit.com/api/jersey-look',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.7'},body:JSON.stringify({...body,...changes})});
function environment(){return {OPENAI_API_KEY:'test-key',ASSETS:{fetch:async()=>new Response(new Uint8Array([255,216,255,1]),{headers:{'Content-Type':'image/jpeg'}})},PHOTO_LIMITER:{limit:async()=>({success:true})},PHOTO_HOURLY:{idFromName:id=>id,get:()=>({fetch:async url=>Response.json(String(url).includes('jersey-')?{allowed:true,remaining:1}:{allowed:true})})}};}
test('jersey catalogue contains all 32 current teams with fixed Canadian shop references',()=>{
 assert.equal(NHL_TEAMS.length,32);assert.equal(new Set(NHL_TEAMS.map(x=>x.id)).size,32);assert.equal(NHL_TEAMS.find(x=>x.id==='UTA').name,'Utah Mammoth');
 for(const item of NHL_TEAMS){assert.match(item.source,/^https:\/\/www\.nhlshop\.ca\/en\//);for(const view of ['front','back']){assert.match(item[view],/^\/jersey-assets\/[a-z]{3}-(front|back)\.(jpg|png)$/);const url=new URL(item['reference'+view[0].toUpperCase()+view.slice(1)]);assert.equal(url.hostname,'images.footballfanatics.com');}}
});
test('invalid consent, photos, team, number and origin cannot reach a paid image call',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('unexpected');};
 try{
  const env=environment();assert.equal((await worker.fetch(request({},'https://other.example'),env)).status,403);
  for(const change of [{consent:false},{person:'https://other.example/photo.jpg'},{person:null},{person:'data:image/jpeg;base64,/9j/'+ 'A'.repeat(121)},{team:'UNKNOWN'},{number:'100'},{number:'make me thinner'},{view:'side'},{view:'back'},{jersey:'https://other.example/jersey.jpg'}])assert.equal((await worker.fetch(request(change),env)).status,400);
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
 try{const env=environment();let asset;env.ASSETS.fetch=async request=>{asset=new URL(request.url).pathname;return new Response(new Uint8Array([255,216,255,1]),{headers:{'Content-Type':'image/jpeg'}});};const response=await worker.fetch(request({number:'07',view:undefined}),env);assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.match(response.headers.get('Content-Type'),/event-stream/);const text=await response.text();assert.match(text,/event: result/);assert.match(text,/data:image\/jpeg;base64/);assert.equal(asset,NHL_TEAMS.find(x=>x.id==='OTT').front);assert.equal(calls.length,1);}finally{globalThis.fetch=original;}
});
test('a custom jersey bypasses remote reference fetching and upstream errors stay private',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.openai.com/v1/images/edits');assert.equal(options.body.getAll('image[]').length,2);return Response.json({error:{code:'model_not_found',message:'sensitive debug test-key'}},{status:403});};
 try{const response=await worker.fetch(request({jersey:person}),environment());const text=await response.text();assert.match(text,/event: error/);assert.match(text,/check image model access/);assert(!text.includes('test-key'));assert(!text.includes('sensitive'));assert.equal(calls,1);}finally{globalThis.fetch=original;}
});

test('quota status is available without a code or a paid AI call',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>{throw Error('unexpected paid call');};
 try{const env=environment();const response=await worker.fetch(new Request('https://myhockeyfit.com/api/jersey-look',{headers:{'CF-Connecting-IP':'192.0.2.7'}}),env);assert.equal(response.status,200);assert.deepEqual(await response.json(),{enabled:true,remaining:1});}
 finally{globalThis.fetch=original;}
});
test('exhausted or unavailable jersey quota never reaches the paid image endpoint',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('unexpected');};
 try{
  const env=environment();env.PHOTO_HOURLY.get=()=>({fetch:async url=>Response.json(String(url).includes('jersey-')?{allowed:false,remaining:0}:{allowed:true})});
  const result=await worker.fetch(request(),env);assert.equal(result.status,429);assert.match((await result.json()).error,/all 2/);
  const status=await worker.fetch(new Request('https://myhockeyfit.com/api/jersey-look',{headers:{'CF-Connecting-IP':'192.0.2.7'}}),env);assert.deepEqual(await status.json(),{enabled:true,remaining:0});
  env.PHOTO_HOURLY.get=()=>({fetch:async()=>Response.json({allowed:true})});assert.equal((await worker.fetch(request(),env)).status,503);assert.equal(calls,0);
 }finally{globalThis.fetch=original;}
});

 test('two photos work without an NHL team and preserve the uploaded jersey',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.openai.com/v1/images/edits');const images=options.body.getAll('image[]');assert.equal(images.length,2);assert.equal(await images[1].text(),await images[0].text());assert.match(options.body.get('prompt'),/Preserve any existing player name and numbers/);assert.match(options.body.get('prompt'),/Use the uploaded jersey design exactly/);return Response.json({data:[{b64_json:jpeg}]});};
 try{const env=environment();env.ASSETS.fetch=async()=>{throw Error('Custom jersey must not load team assets');};
  assert.equal((await worker.fetch(request({team:undefined}),env)).status,400);
  const response=await worker.fetch(request({team:undefined,jersey:person,number:''}),env);assert.equal(response.status,200);assert.match(await response.text(),/event: result/);assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
