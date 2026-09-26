import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import worker,{TeamInbox} from '../worker.mjs';
function setup(){
 const db=new DatabaseSync(':memory:');let queue=Promise.resolve();
 const state={storage:{sql:{exec:(query,...args)=>{const statement=db.prepare(query);if(!/^SELECT/i.test(query)){statement.run(...args);return {toArray:()=>[]}}return {toArray:()=>statement.all(...args)};}},transactionSync:fn=>{db.exec('BEGIN');try{fn();db.exec('COMMIT')}catch(error){db.exec('ROLLBACK');throw error}},setAlarm:async()=>{}},blockConcurrencyWhile:fn=>{const current=queue.then(fn);queue=current.catch(()=>{});return current}};
 const inbox=new TeamInbox(state);
 return {db,env:{TEAM_INBOX:{idFromName:key=>key,get:()=>({fetch:(url,init)=>inbox.fetch(new Request(url,init))})},FEEDBACK_ADMIN_TOKEN:'test-only',ADMIN_LIMITER:{limit:async()=>({success:true})}}};
}
const record=()=>({id:crypto.randomUUID(),volunteerName:'Eric',ageGroup:'U12',roles:['test','build'],parentEmail:'parent@example.org',parentApproval:true,website:''});
const request=(body,origin='https://myhockeyfit.com')=>new Request('https://myhockeyfit.com/api/team-apply',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.24'},body:JSON.stringify(body)});
test('team signups require parent email, authorization protects private list, and duplicate submissions do not grow records',async()=>{
 const {db,env}=setup();const body=record();
 assert.equal((await worker.fetch(request(body),env)).status,200);
 assert.equal((await worker.fetch(request(body),env)).status,200);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM applications').get().n,1);
 assert.equal((await worker.fetch(request({...record(),parentEmail:'invalid'}),env)).status,400);
 assert.equal((await worker.fetch(request({...record(),parentApproval:false}),env)).status,400);
 assert.equal((await worker.fetch(request({...record(),roles:['test','test']}),env)).status,400);
 assert.equal((await worker.fetch(request(record(),'https://not-this-site.example'),env)).status,403);
 const url='https://myhockeyfit.com/api/team-applications';
 assert.equal((await worker.fetch(new Request(url),env)).status,403);
 assert.equal((await worker.fetch(new Request(url,{headers:{Authorization:'Bearer wrong'}}),env)).status,403);
 const list=await worker.fetch(new Request(url,{headers:{Authorization:'Bearer test-only'}}),env);
 assert.equal(list.status,200);assert.equal((await list.json()).applications[0].parent_email,'parent@example.org');
 assert.equal((await worker.fetch(request(record()),env)).status,200);
 assert.equal((await worker.fetch(request(record()),env)).status,200);
 assert.equal((await worker.fetch(request(record()),env)).status,429);
 db.close();
});
