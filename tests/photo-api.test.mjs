import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.mjs';
const env = {OPENAI_API_KEY:'test-only',PHOTO_LIMITER:{limit:async()=>({success:true})},ASSETS:{fetch:async()=>new Response('asset')}};
const photo = {consent:true,image:'data:image/jpeg;base64,/9j/'+ 'A'.repeat(100)};
const request = (body=photo,headers={}) => new Request('https://myhockeyfit.com/api/photo-fit',{method:'POST',headers:{Origin:'https://myhockeyfit.com','Content-Type':'application/json',...headers},body:JSON.stringify(body)});
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
  assert.equal((await worker.fetch(request(),{...env,PHOTO_LIMITER:{limit:async()=>({success:false})}})).status,429);
 }finally{globalThis.fetch=original;}
});
test('structured assessment, no response storage, no raw upstream errors',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');
   const body=JSON.parse(options.body);assert.equal(body.store,false);assert.equal(body.model,'gpt-4.1-mini');assert.equal(body.input[0].content[1].image_url,photo.image);
   return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({status:'retake',reason:'Stick is hidden.',next_step:'Show the full stick.'})}]}]});
  };
  const result=await worker.fetch(request(),env);assert.equal(result.headers.get('Cache-Control'),'no-store');assert.equal((await result.json()).status,'retake');
  globalThis.fetch=async()=>new Response('sensitive upstream debug',{status:401});
  const error=await worker.fetch(request(),env);assert.equal(error.status,502);assert(!(await error.text()).includes('sensitive'));
  globalThis.fetch=async()=>Response.json({status:'completed',output:[]});assert.equal((await worker.fetch(request(),env)).status,502);
 }finally{globalThis.fetch=original;}
});
