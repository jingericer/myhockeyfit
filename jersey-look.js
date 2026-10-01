import {NHL_TEAMS} from './jersey-teams.mjs?v=1';
import {validateLookInput,previewBlob,previewError,readPreview} from './jersey-look-utils.mjs?v=20261001-preview-fix';
const $=selector=>document.querySelector(selector);
let step=0,team=null,person='',customJersey='',resultUrl='',busy=false,enabled=false,uploadVersion=0;
let accessCode='',remaining=0,source='nhl';
const jerseyPhoto=()=>source==='photo'?customJersey:'';
const jerseyName=()=>source==='photo'?'Your jersey':team?.name||'';
function updateJerseySource(){document.querySelectorAll('[data-source]').forEach(button=>{const selected=button.dataset.source===source;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});$('#ownJersey').hidden=source!=='photo';$('#nhlJerseys').hidden=source!=='nhl';$('#ownJerseyPreview').hidden=!customJersey;if(customJersey)$('#ownJerseyPreview').src=customJersey;else $('#ownJerseyPreview').removeAttribute('src');$('#removeJersey').hidden=!customJersey;updateReference();updateButton();}
document.querySelectorAll('[data-source]').forEach(button=>button.addEventListener('click',()=>{source=button.dataset.source;updateJerseySource();status();}));
function showQuota(value){if(Number.isInteger(value)){remaining=value;$('#quotaStatus').textContent=value?`${value} of 2 AI generations remaining.`:'All 2 AI generations have been used for this internet connection.';updateButton();}}
const seen=new Set();
function track(event){if(seen.has(event))return;seen.add(event);fetch('/api/usage-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event}),keepalive:true}).catch(()=>{});}
function status(message=''){$('#lookStatus').textContent=message;}
function renderTeams(){
  const query=$('#teamSearch').value.trim().toLowerCase();const root=$('#teamChoices');root.replaceChildren();
  const matches=NHL_TEAMS.filter(item=>(item.name+' '+item.id).toLowerCase().includes(query));
  for(const item of matches){
    const button=document.createElement('button');button.type='button';button.className='team-button'+(team?.id===item.id?' selected':'');button.dataset.team=item.id;button.setAttribute('aria-pressed',String(team?.id===item.id));
    const image=document.createElement('img');image.src=item.front;image.alt='';image.loading='lazy';image.width=66;image.height=78;image.referrerPolicy='no-referrer';image.addEventListener('error',()=>{image.hidden=true;},{once:true});
    const label=document.createElement('span'),name=document.createElement('strong'),detail=document.createElement('small');name.textContent=item.name;detail.textContent=team?.id===item.id?'SELECTED':'HOME JERSEY';label.append(name,detail);button.append(image,label);root.append(button);
  }
  $('#noTeams').hidden=matches.length>0;
}
function number(){return $('#jerseyNumber').value.trim();}
function validNumber(){return !number()||/^\d{1,2}$/.test(number());}
function view(){return $('.photo-direction .selected').dataset.view;}
function updateReference(){
  $('#selectedTeam').textContent=jerseyName();const image=jerseyPhoto()||(source==='nhl'&&team?.[view()]);if(image)$('#jerseyPreview').src=image;else $('#jerseyPreview').removeAttribute('src');$('#jerseyPreview').alt=jerseyPhoto()?'Your uploaded jersey':jerseyName()+' home jersey';
  $('#numberPreview').textContent=number();$('.number-tag').hidden=!number();$('#jerseySource').href=team?.source||'';$('#jerseySource').hidden=source==='photo'||!team;
}
function updateButton(){const valid=!!accessCode&&(step===0?(source==='photo'?!!customJersey:!!team):step===1?validNumber():validNumber()&&(source==='photo'?!!customJersey:!!team)&&!!person&&$('#aiConsent').checked&&enabled&&remaining>0);$('#nextButton').disabled=!valid||busy;$('#nextButton').textContent=step===2?'Create my look':'Continue';}
function showStep(next,focus=true){step=next;document.querySelectorAll('.step').forEach((element,i)=>element.hidden=i!==step);document.querySelectorAll('.progress>span').forEach((element,i)=>{element.className=i===step?'active':i<step?'done':'';if(i===step)element.setAttribute('aria-current','step');else element.removeAttribute('aria-current');});$('#backButton').hidden=step===0;updateReference();updateButton();status();if(focus)$(`.step[data-step="${step}"] h2`).focus();}
$('#teamChoices').addEventListener('click',event=>{const choice=event.target.closest('[data-team]');if(!choice)return;team=NHL_TEAMS.find(item=>item.id===choice.dataset.team);source='nhl';renderTeams();updateJerseySource();track('jersey_start');});
$('#teamSearch').addEventListener('input',renderTeams);
$('#jerseyNumber').addEventListener('input',()=>{updateReference();updateButton();status(validNumber()?'':'Use a number from 0 to 99.');});
$('#backButton').addEventListener('click',()=>showStep(step-1));
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-view]').forEach(item=>{item.classList.toggle('selected',item===button);item.setAttribute('aria-pressed',String(item===button));});$('#poseHint').textContent=view()==='front'?'Face the camera with your arms slightly away from your body.':'Use a photo taken from behind, with your shoulders and hips visible.';updateReference();}));
async function imageData(file){
  if(!file||!file.type.startsWith('image/'))throw Error('Choose a photo file.');
  if(file.size>20000000)throw Error('Choose a photo smaller than 20 MB.');
  const url=URL.createObjectURL(file);
  try{
    const image=new Image();image.src=url;await image.decode();if(!image.width||!image.height)throw Error('This photo could not be opened.');
    const scale=Math.min(1,1280/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
    let data=canvas.toDataURL('image/jpeg',.86);if(data.length>1600000)data=canvas.toDataURL('image/jpeg',.65);if(data.length>1600000)throw Error('This photo is too large. Choose a simpler or smaller image.');return data;
  }catch(error){throw Error(error.message==='The source image cannot be decoded.'?'This photo format could not be opened. Try a JPEG or a screenshot.':error.message);}finally{URL.revokeObjectURL(url);}
}
async function upload(event,kind){
  const current=++uploadVersion;$('#nextButton').disabled=true;status('Preparing your photo…');
  try{const data=await imageData(event.target.files?.[0]);if(current!==uploadVersion)return;if(!/^data:image\/jpeg;base64,\/9j\//.test(data))throw Error('This photo could not be converted. Try a JPEG, PNG or screenshot.');if(kind==='person'){person=data;$('#personPreview').src=data;$('#personPreview').hidden=false;$('#photoEmpty').hidden=true;$('#removePhoto').hidden=false;$('#aiConsent').checked=false;}else{customJersey=data;source='photo';$('#jerseyNumber').value='';renderTeams();updateJerseySource();track('jersey_start');}status();}
  catch(error){if(current===uploadVersion)status(error.message);}finally{event.target.value='';if(current===uploadVersion)updateButton();}
}
$('#personCamera').addEventListener('change',event=>upload(event,'person'));$('#personUpload').addEventListener('change',event=>upload(event,'person'));$('#customJersey').addEventListener('change',event=>upload(event,'jersey'));$('#jerseyCamera').addEventListener('change',event=>upload(event,'jersey'));
function removePerson(){uploadVersion++;person='';$('#personPreview').removeAttribute('src');$('#personPreview').hidden=true;$('#photoEmpty').hidden=false;$('#removePhoto').hidden=true;$('#aiConsent').checked=false;updateButton();}
$('#removePhoto').addEventListener('click',removePerson);$('#removeJersey').addEventListener('click',()=>{uploadVersion++;customJersey='';$('#customJersey').value='';updateJerseySource();});$('#aiConsent').addEventListener('change',updateButton);
$('#lookForm').addEventListener('submit',async event=>{
  event.preventDefault();if(busy||$('#nextButton').disabled)return;
  if(step<2){showStep(step+1);return;}
  const payload={accessCode,team:source==='nhl'?team?.id:undefined,number:number(),view:view(),person,jersey:jerseyPhoto()||undefined,consent:$('#aiConsent').checked};
  const invalid=validateLookInput(payload);if(invalid){status(invalid.error);return;}
  busy=true;updateButton();status();$('#lookForm').hidden=true;$('.progress').hidden=true;$('#creating').hidden=false;
  try{
    const response=await fetch('/api/jersey-look',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(190000)});
    const data=await readPreview(response,data=>{$('#creatingStatus').textContent=data.message;showQuota(data.remaining);});clearResult();resultUrl=URL.createObjectURL(previewBlob(data.image));showQuota(data.remaining);$('#resultImage').src=resultUrl;$('#resultTeam').textContent=jerseyName()+(number()?' · #'+number():'');$('#lookResult').hidden=false;$('#resultHeading').focus();
  }catch(error){$('#lookForm').hidden=false;$('.progress').hidden=false;status(previewError(error));try{const check=await fetch('/api/jersey-look',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'access',accessCode}),signal:AbortSignal.timeout(10000)});if(check.ok)showQuota((await check.json()).remaining);}catch{}}
  finally{busy=false;$('#creating').hidden=true;updateButton();}
});
function clearResult(){if(resultUrl)URL.revokeObjectURL(resultUrl);resultUrl='';$('#resultImage').removeAttribute('src');$('#lookResult').hidden=true;}
$('#downloadLook').addEventListener('click',()=>{if(!resultUrl)return;const link=document.createElement('a');link.href=resultUrl;link.download=`my-jersey-look-${source==='photo'?'custom':team.id.toLowerCase()}${number()?'-'+number():''}.jpg`;link.click();track('jersey_download');});
$('#anotherLook').addEventListener('click',()=>{clearResult();$('#lookForm').hidden=false;$('.progress').hidden=false;$('#aiConsent').checked=false;showStep(0);});
$('#clearLook').addEventListener('click',()=>{clearResult();removePerson();customJersey='';team=null;source='nhl';updateJerseySource();$('#lookForm').hidden=false;$('.progress').hidden=false;renderTeams();showStep(0);});
window.addEventListener('pagehide',()=>{accessCode='';$('#accessCode').value='';person='';customJersey='';clearResult();$('#personPreview').removeAttribute('src');$('#jerseyPreview').removeAttribute('src');$('#ownJerseyPreview').removeAttribute('src');});
window.addEventListener('pageshow',event=>{if(event.persisted){accessCode='';$('#lookFlow').hidden=true;$('#accessGate').hidden=false;removePerson();customJersey='';updateJerseySource();$('#lookForm').hidden=false;$('.progress').hidden=false;$('#creating').hidden=true;busy=false;showStep(0,false);}});
$('#accessForm').addEventListener('submit',async event=>{
  event.preventDefault();const button=$('#accessButton');if(button.disabled)return;
  button.disabled=true;$('#accessStatus').textContent='Checking your code…';
  try{
    const candidate=$('#accessCode').value.trim().toUpperCase();
    const response=await fetch('/api/jersey-look',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'access',accessCode:candidate}),signal:AbortSignal.timeout(15000)});
    const data=await response.json();if(!response.ok||data.authorized!==true)throw Error(data.error||'Could not verify this code.');
    accessCode=candidate;showQuota(data.remaining);$('#accessCode').value='';$('#accessStatus').textContent='';$('#accessGate').hidden=true;$('#lookFlow').hidden=false;showStep(0);
  }catch(error){$('#accessStatus').textContent=error.name==='TimeoutError'?'Code verification took too long. Please try again.':error.message||'Could not verify this code.';}
  finally{button.disabled=false;}
});
renderTeams();showStep(0,false);
fetch('/api/jersey-look',{cache:'no-store'}).then(response=>response.json()).then(data=>{enabled=data.enabled===true;updateButton();if(!enabled)status('AI previews are temporarily unavailable. You can still explore the jerseys.');}).catch(()=>status('Could not check AI availability. Please refresh before creating a look.'));
