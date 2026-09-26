import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import worker from '../worker.mjs';
globalThis.crypto ??= webcrypto;

test('page visits record anonymous daily IDs, and usage reports require admin password',async()=>{
  const recorded=[];
  const env={ASSETS:{fetch:async()=>new Response('ok')},FEEDBACK_ADMIN_TOKEN:'secret-for-test',ADMIN_LIMITER:{limit:async()=>({success:true})},USAGE_STATS:{idFromName:name=>name,get:()=>({fetch:async(url,options)=>{
    if(url.endsWith('/report'))return Response.json({summary:{pageViews:1,visitorDays:1,aiRequests:0,aiResults:0},daily:[],pages:[],visitors:[]});
    recorded.push(JSON.parse(options.body));return Response.json({ok:true});
  }})}};
  const visit=(path,ip)=>worker.fetch(new Request('https://myhockeyfit.com'+path,{headers:{'CF-Connecting-IP':ip}}),env);
  await visit('/','192.0.2.1');await visit('/team.html','192.0.2.1');await visit('/volunteer.html','192.0.2.2');await visit('/admin.html','192.0.2.1');await visit('/styles.css','192.0.2.1');
  assert.equal(recorded.length,3);assert.deepEqual(recorded.map(x=>x.page),['Home','Project team','Volunteer testing']);
  assert.equal(recorded[0].visitor,recorded[1].visitor);assert.notEqual(recorded[0].visitor,recorded[2].visitor);
  assert(!JSON.stringify(recorded).includes('192.0.2'));
  assert.equal((await worker.fetch(new Request('https://myhockeyfit.com/api/usage-stats'),env)).status,403);
  const allowed=await worker.fetch(new Request('https://myhockeyfit.com/api/usage-stats',{headers:{Authorization:'Bearer secret-for-test'}}),env);
  assert.equal(allowed.status,200);assert.equal((await allowed.json()).summary.pageViews,1);
});
