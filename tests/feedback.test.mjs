import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import worker,{FeedbackInbox} from '../worker.mjs';
function setup(){
 const db=new DatabaseSync(':memory:');let queue=Promise.resolve();
 const state={storage:{sql:{exec:(query,...args)=>{const stmt=db.prepare(query);const rows=stmt.all(...args);return {toArray:()=>rows};}},transactionSync:fn=>{db.exec('BEGIN');try{fn();db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}},setAlarm:async()=>{}},blockConcurrencyWhile:fn=>{const r=queue.then(fn);queue=r.catch(()=>{});return r;}};
 const inbox=new FeedbackInbox(state);return {env:{FEEDBACK_INBOX:{idFromName:k=>k,get:()=>({fetch:(url,init)=>inbox.fetch(new Request(url,init))})}},db};
}
const payload=()=>({id:crypto.randomUUID(),rating:4,name:'',comment:'Helpful guide',feature:'photo',ageGroup:'U12',website:''});
const req=(body,origin='https://myhockeyfit.com')=>new Request('https://myhockeyfit.com/api/feedback',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.10'},body:JSON.stringify(body)});
test('anonymous feedback, idempotency, validation, private export and abuse limit',async()=>{
 const {env,db}=setup();const body=payload();
 assert.equal((await worker.fetch(req(body),env)).status,200);
 assert.equal((await worker.fetch(req(body),env)).status,200);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM feedback').get().n,1);
 assert.equal(db.prepare('SELECT name FROM feedback').get().name,'');
 assert.equal((await worker.fetch(req({...body,rating:8}),env)).status,400);
 assert.equal((await worker.fetch(req(body,'https://bad.example'),env)).status,403);
 assert.equal((await worker.fetch(req({...body,website:'spam'}),env)).status,400);
 assert.equal((await worker.fetch(new Request('https://myhockeyfit.com/api/feedback'),env)).status,403);
 for(let i=0;i<4;i++)assert.equal((await worker.fetch(req(payload()),env)).status,200);
 assert.equal((await worker.fetch(req(payload()),env)).status,429);
 const exported=await worker.fetch(new Request('https://myhockeyfit.com/api/feedback',{headers:{Authorization:'Bearer test-secret'}}),{...env,FEEDBACK_ADMIN_TOKEN:'test-secret'});
 assert.equal((await exported.json()).feedback.length,5);db.close();
});
