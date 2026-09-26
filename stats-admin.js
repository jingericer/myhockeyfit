const form=document.querySelector('#statsLogin'),password=document.querySelector('#statsPassword'),content=document.querySelector('#statsContent'),statusLine=document.querySelector('#statsStatus');
let credential='',expiry,version=0;
function signOut(message='Signed out.'){
  version++;credential='';clearTimeout(expiry);password.value='';form.hidden=false;content.hidden=true;statusLine.textContent=message;
  for(const id of ['statsSummary','statsPages','statsDays','statsVisitors'])document.getElementById(id).replaceChildren();
}
function renderTable(target,headings,rows){
  const root=document.querySelector(target);root.replaceChildren();
  if(!rows.length){const p=document.createElement('p');p.textContent='No activity yet.';root.append(p);return;}
  const container=document.createElement('div');container.className='stats-table-wrap';const table=document.createElement('table');table.className='stats-table';
  const head=table.createTHead().insertRow();for(const heading of headings){const cell=document.createElement('th');cell.scope='col';cell.textContent=heading;head.append(cell);}
  const body=table.createTBody();for(const row of rows){const tr=body.insertRow();for(const value of row){const cell=tr.insertCell();cell.textContent=String(value);}}
  container.append(table);root.append(container);
}
function render(data){
  document.querySelector('#statsRange').textContent=`Since ${data.since} · UTC`;
  const summary=document.querySelector('#statsSummary');summary.replaceChildren();
  for(const [label,value] of [['Page views',data.summary.pageViews],['Visitor days',data.summary.visitorDays],['AI requests',data.summary.aiRequests],['Completed AI results',data.summary.aiResults]]){
    const card=document.createElement('article'),number=document.createElement('strong'),name=document.createElement('span');number.textContent=Number(value).toLocaleString();name.textContent=label;card.append(number,name);summary.append(card);
  }
  renderTable('#statsPages',['Page','Views'],data.pages.map(row=>[row.page,row.views]));
  renderTable('#statsDays',['Date (UTC)','Views','Visitors','AI requests','AI results'],data.daily.map(row=>[row.day,row.views,row.visitors,row.aiRequests,row.aiResults]));
  renderTable('#statsVisitors',['Date (UTC)','Visitor ID','Pages','Views','AI requests','AI results'],data.visitors.map(row=>[row.day,row.id,row.pages.join(', ')||'Photo Fit only',row.views,row.aiRequests,row.aiResults]));
}
async function loadStats(){
  const current=version;statusLine.textContent='Loading usage statistics…';
  const response=await fetch('/api/usage-stats',{headers:{Authorization:`Bearer ${credential}`},cache:'no-store'});
  const data=await response.json();if(current!==version)return;
  if(!response.ok)throw Error(data.error||'Could not load statistics.');
  if(!data.summary||!Array.isArray(data.daily)||!Array.isArray(data.pages)||!Array.isArray(data.visitors))throw Error('Unexpected statistics response.');
  render(data);form.hidden=true;content.hidden=false;statusLine.textContent='';clearTimeout(expiry);expiry=setTimeout(()=>signOut('Session expired. Please sign in again.'),15*60*1000);
}
form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('button');button.disabled=true;credential=password.value;password.value='';try{await loadStats();}catch(error){signOut(error.message);}finally{button.disabled=false;}});
document.querySelector('#statsRefresh').addEventListener('click',async event=>{event.target.disabled=true;try{await loadStats();}catch(error){signOut(error.message);}finally{event.target.disabled=false;}});
document.querySelector('#statsLogout').addEventListener('click',()=>signOut());window.addEventListener('pagehide',()=>signOut(''));
