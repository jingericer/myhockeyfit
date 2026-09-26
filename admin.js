const login=document.querySelector('#adminLogin');
const password=document.querySelector('#adminPassword');
const statusLine=document.querySelector('#adminStatus');
const content=document.querySelector('#adminContent');
let credential='',rows=[],expiry,sessionVersion=0;
function signOut(message='Signed out.'){
 sessionVersion++;credential='';rows=[];clearTimeout(expiry);password.value='';content.hidden=true;login.hidden=false;
 document.querySelector('#feedbackList').replaceChildren();document.querySelector('#adminSummary').textContent='';statusLine.textContent=message;
}
function renderFeedback(){
 const list=document.querySelector('#feedbackList');list.replaceChildren();
 document.querySelector('#adminSummary').textContent=`${rows.length} feedback ${rows.length===1?'message':'messages'}`;
 if(!rows.length){const p=document.createElement('p');p.textContent='No feedback yet.';list.append(p);return;}
 const features={stick:'Stick finder',shin:'Shin guard fit',photo:'Stick Photo Fit',general:'General experience'};
 for(const row of rows){
  const entry=document.createElement('article');entry.className='admin-entry';
  const title=document.createElement('h2');title.textContent=row.name||'Anonymous';entry.append(title);
  const stars=document.createElement('div');stars.className='admin-stars';stars.textContent='★'.repeat(row.rating)+'☆'.repeat(5-row.rating);stars.setAttribute('aria-label',`${row.rating} out of 5 stars`);entry.append(stars);
  const meta=document.createElement('p');meta.className='admin-meta';meta.textContent=[row.age_group,features[row.feature]].filter(Boolean).join(' · ')||'No age group or feature provided';entry.append(meta);
  const comment=document.createElement('p');comment.className='admin-comment';comment.textContent=row.comment||'No written comment.';entry.append(comment);
  const time=document.createElement('time');time.dateTime=row.created_at;time.textContent=new Date(row.created_at).toLocaleString();entry.append(time);list.append(entry);
 }
}
async function loadFeedback(){
 const version=sessionVersion;statusLine.textContent='Loading feedback…';
 const response=await fetch('/api/feedback',{headers:{Authorization:`Bearer ${credential}`},cache:'no-store'});
 const data=await response.json();if(version!==sessionVersion)return;if(!response.ok)throw Error(data.error||'Could not load feedback.');
 if(!Array.isArray(data.feedback))throw Error('Unexpected feedback response.');
 rows=data.feedback;login.hidden=true;content.hidden=false;statusLine.textContent='';renderFeedback();
 clearTimeout(expiry);expiry=setTimeout(()=>signOut('Session expired. Please sign in again.'),15*60*1000);
}
login.addEventListener('submit',async event=>{
 event.preventDefault();if(!login.reportValidity())return;const button=login.querySelector('button');button.disabled=true;credential=password.value;password.value='';
 try{await loadFeedback();}catch(error){signOut(error.message);}finally{button.disabled=false;}
});
document.querySelector('#adminRefresh').addEventListener('click',async event=>{event.target.disabled=true;try{await loadFeedback();}catch(error){signOut(error.message);}finally{event.target.disabled=false;}});
document.querySelector('#adminLogout').addEventListener('click',()=>signOut());
function csvCell(value){let text=String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
document.querySelector('#adminExport').addEventListener('click',()=>{
 const data=[['Submitted','Rating','Name','Age group','Feature','Feedback'],...rows.map(r=>[r.created_at,r.rating,r.name||'Anonymous',r.age_group,r.feature,r.comment])];
 const blob=new Blob(['\uFEFF'+data.map(r=>r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='myhockeyfit-feedback.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
window.addEventListener('pagehide',()=>signOut(''));
