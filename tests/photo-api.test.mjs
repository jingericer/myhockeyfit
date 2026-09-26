import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker, {PhotoHourlyLimiter} from '../worker.mjs';
const env = {OPENAI_API_KEY:'test-only',PHOTO_LIMITER:{limit:async()=>({success:true})},PHOTO_HOURLY:{idFromName:key=>key,get:()=>({fetch:async()=>Response.json({allowed:true})})},ASSETS:{fetch:async()=>new Response('asset')}};
const checks = ['player','skates','framing','posture','stick_vertical','toe_contact','landmarks'].map(id=>({id,status:id==='toe_contact'?'unclear':'pass',evidence:id==='toe_contact'?'Blade tip is hidden.':'Visible.',fix:id==='toe_contact'?'Show the blade tip touching the floor.':''}));
const photo = {consent:true,image:'data:image/jpeg;base64,/9j/'+ 'A'.repeat(100)};
const request = (body=photo,headers={}) => new Request('https://myhockeyfit.com/api/photo-fit',{method:'POST',headers:{Origin:'https://myhockeyfit.com','CF-Connecting-IP':'192.0.2.1','Content-Type':'application/json',...headers},body:JSON.stringify(body)});
test('configuration and static routing',async()=>{
 assert.deepEqual(await (await worker.fetch(new Request('https://myhockeyfit.com/api/photo-fit'),{})).json(),{enabled:false});
 assert.equal(await (await worker.fetch(new Request('https://myhockeyfit.com/'),env)).text(),'asset');
 assert.equal((await worker.fetch(request(),{})).status,503);
});
test('invalid origin, consent, image, size and throttled requests never reach OpenAI',async()=>{
 const original=globalThis.fetch;globalThis.fetch=()=>{throw Error('Unexpected network');};
 try{
  assert.equal((await worker.fetch(request(photo,{Origin:'https://other.example'}),env)).status,403);
  assert.equal((await worker.fetch(request({...photo,consent:false}),env)).status,400);
  assert.equal((await worker.fetch(request({...photo,image:'https://internal.example'}),env)).status,400);
  assert.equal((await worker.fetch(request({...photo,image:'A'.repeat(2200001)}),env)).status,413);
  const minute=await worker.fetch(request(),{...env,PHOTO_LIMITER:{limit:async()=>({success:false})}});assert.equal(minute.status,429);assert.equal(minute.headers.get('Retry-After'),'60');assert.match((await minute.json()).error,/10 AI checks per minute/);
  const blocked=await worker.fetch(request(),{...env,PHOTO_HOURLY:{idFromName:key=>key,get:()=>({fetch:async()=>Response.json({allowed:false,retryAfter:120})})}});assert.equal(blocked.status,429);assert.equal(blocked.headers.get('Retry-After'),'120');
  assert.equal((await worker.fetch(request(),{...env,PHOTO_HOURLY:{idFromName:()=>{throw Error('offline');}}})).status,503);
 }finally{globalThis.fetch=original;}
});
test('structured assessment, no response storage, no raw upstream errors',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');
   const body=JSON.parse(options.body);assert.equal(body.store,false);assert.equal(body.model,'gpt-4.1');assert.equal(body.input[0].content[1].image_url,photo.image);
   return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({status:'retake',reason:'Stick is hidden.',next_step:'Show the full stick.',checks})}]}]});
  };
  const result=await worker.fetch(request(),env);assert.equal(result.headers.get('Cache-Control'),'no-store');const assessment=await result.json();assert.equal(assessment.status,'retake');assert.deepEqual(assessment.checks,checks);assert.equal(assessment.checks[5].status,'unclear');
  globalThis.fetch=async()=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({status:'starting_range',reason:'Length looks right.',next_step:'Try it.',checks})}]}]});
  assert.equal((await (await worker.fetch(request(),env)).json()).status,'retake');
  const passed=checks.map(c=>({...c,status:'pass',fix:''}));
  globalThis.fetch=async()=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({status:'starting_range',reason:'Length looks right.',next_step:'Try it.',checks:passed})}]}]});
  assert.equal((await (await worker.fetch(request(),env)).json()).status,'starting_range');
  globalThis.fetch=async()=>new Response('sensitive upstream debug',{status:401});
  const error=await worker.fetch(request(),env);assert.equal(error.status,502);assert(!(await error.text()).includes('sensitive'));
  globalThis.fetch=async()=>Response.json({status:'completed',output:[]});assert.equal((await worker.fetch(request(),env)).status,502);
 }finally{globalThis.fetch=original;}
});

test('rolling hourly limit survives restarts, expires and isolates clients',async()=>{
 const original=Date.now; let now=10000000; Date.now=()=>now;
 const makeState=()=>{const data=new Map();let queue=Promise.resolve();return {storage:{get:async k=>data.get(k),put:async(k,v)=>data.set(k,v),setAlarm:async()=>{},deleteAll:async()=>data.clear()},blockConcurrencyWhile:fn=>{const next=queue.then(fn);queue=next.catch(()=>{});return next;}};};
 const state=makeState();const gate=new PhotoHourlyLimiter(state);const req=()=>new Request('https://limiter/check',{method:'POST'});
 try {
  const burst=await Promise.all(Array.from({length:51},()=>gate.fetch(req()).then(r=>r.json())));
  assert.equal(burst.filter(r=>r.allowed).length,50);
  assert.equal(burst[50].retryAfter,3600);
  const restarted=new PhotoHourlyLimiter(state);assert.equal((await (await restarted.fetch(req())).json()).allowed,false);
  assert.equal((await (await new PhotoHourlyLimiter(makeState()).fetch(req())).json()).allowed,true);
  now+=3599999;assert.equal((await (await restarted.fetch(req())).json()).allowed,false);
  now+=1;assert.equal((await (await restarted.fetch(req())).json()).allowed,true);
  now+=3600000;await restarted.alarm();assert.equal(await state.storage.get('times'),undefined);
 }finally{Date.now=original;}
});
