const equipment = {
  stick: {
    name: 'Hockey stick',
    questions: [
      {title:'What is the player wearing?',hint:'Stand straight. Hold the stick upright with its blade toe touching the floor.',options:[['skates','Ice skates','Check against the chin to nose range.'],['shoes','Regular shoes','Check against the upper lip to nose range.'],['unsure','Not sure','Come back with the footwear they use for the check.']]},
      {title:'Where does the top of the stick reach?',hint:'Keep the stick upright beside the player. Check the top of the shaft.',byFootwear:{skates:[['good','Between chin and nose'],['short','Below the chin'],['long','Above the nose'],['unsure','Hard to tell']],shoes:[['good','Between upper lip and nose'],['short','Below the upper lip'],['long','Above the nose'],['unsure','Hard to tell']]}},
      {title:'Can they use it comfortably?',hint:'Have the player hold it in a normal hockey stance and move the puck.',options:[['good','Yes','They can handle the stick comfortably.'],['problem','No','It feels awkward or difficult to control.'],['unsure','Have not tried it','Try this with the player before deciding.']]}
    ],
    result:{short:'The stick may be too short. Compare a longer stick before changing this one.',long:'The stick may be too long. Confirm with a fitter before cutting it.',problem:'The length may look fine standing still, but handling the stick feels awkward. Compare another length in a hockey stance.',good:'The standing length and handling look like a reasonable starting fit.'},
    next:'Try the stick on skates in a normal hockey stance. Length alone does not check flex or blade contact.',
    links:[['Check stick with a photo','/#photo-fit'],['Find a stick','/']]
  },
  gloves: {
    name:'Hockey gloves',
    questions:[
      {title:'How do the fingers fit?',hint:'Have the player put on both gloves and open and close their hands.',options:[['good','Fingers reach near the ends','They can open and close their hands.'],['small','Fingertips press into the ends','The gloves may be too small.'],['large','A lot of extra room','The gloves may be too big.'],['unsure','Not sure','Ask the player to try again.']]},
      {title:'What about the wrist?',hint:'Wear the elbow pads too. Bend the wrist while holding the stick.',options:[['good','Covered and moves freely','The glove and elbow pad protect the wrist area.'],['gap','Wrist is exposed','There is an exposed gap between glove and elbow pad.'],['stiff','Movement is restricted','The cuff or elbow pad makes movement difficult.'],['unsure','Not sure','Try with the elbow pads on.']]},
      {title:'Can they grip the stick?',hint:'Have the player hold and move their own stick.',options:[['good','Yes, comfortably'],['problem','No, grip is difficult'],['unsure','Have not tried it']]}
    ],
    result:{small:'Fingers press into the ends. These gloves may have been outgrown.',large:'The fingers have too much room. Compare a smaller or differently shaped glove.',gap:'The wrist is exposed between the glove and elbow pad. Try a different glove or cuff fit.',stiff:'Wrist movement is restricted. Compare another cuff fit.',problem:'The player struggles to grip the stick. Check glove size and palm condition.',good:'The finger space, wrist coverage and grip all passed this quick check.'},
    next:'Try the gloves with elbow pads and the player’s own stick. Replace gloves with worn or torn palms even when the size seems right.',links:[]
  },
  shin: {
    name:'Shin guards',
    questions:[
      {title:'What are they wearing?',hint:'Put on the usual skates and shin guards before checking.',options:[['skates','Skates on'],['no-skates','No skates yet','Put them on to check lower leg coverage accurately.']]},
      {title:'Where is the kneecap?',hint:'With the straps secured, bend and straighten the knees.',options:[['good','Centered in the knee cup'],['off','Outside the knee cup'],['slips','Pad slides when they bend'],['unsure','Hard to tell']]},
      {title:'How is the lower leg covered?',hint:'Wear the skate tongue the way the player usually does. Bend the knees.',options:[['good','Covered without pressing on the skate'],['gap','Exposed gap above the skate'],['press','Pad presses into the skate'],['unsure','Hard to tell']]},
      {title:'Can the player move?',hint:'Have them squat and take a few skating stance steps.',options:[['good','Yes, comfortably'],['problem','No, the pad shifts or restricts movement'],['unsure','Have not tried it']]}
    ],
    result:{off:'The knee is outside the knee cup. This pad is not sitting in the right place.',slips:'The pad slides when the knee bends. Check the size and straps.',gap:'There is an exposed gap near the skate. Compare a longer pad with the usual skate tongue setup.',press:'The pad presses into the skate. Try another length or shape before buying.',problem:'The pad shifts or restricts movement. Try a different fit with skates on.',good:'Knee position, lower leg coverage and movement passed this quick check.'},
    next:'Try again with skates and the player’s usual tongue position. Check both legs; bring the gear to a store fitter if anything feels wrong.',links:[['Explore shin guards','/']]
  }
};

let gear=null;
let step=0;
let answers=[];
const stepNode=document.getElementById('checkStep');
const resultNode=document.getElementById('checkResult');
const nextButton=document.getElementById('nextButton');
const backButton=document.getElementById('backButton');
const progress=document.getElementById('progress');
const actions=document.getElementById('actions');

function element(tag,klass,content){const node=document.createElement(tag);if(klass)node.className=klass;if(content!==undefined)node.textContent=content;return node;}
function addChoice(container,value,label,hint,selected,onSelect){
  const button=element('button','gc-choice'+(selected?' selected':''));button.type='button';button.setAttribute('aria-pressed',String(selected));
  button.append(element('strong','',label));if(hint)button.append(element('small','',hint));
  button.addEventListener('click',()=>onSelect(value));container.append(button);
}
function render(){
  stepNode.replaceChildren();resultNode.hidden=true;actions.hidden=false;
  const total=gear?equipment[gear].questions.length+1:4;
  progress.replaceChildren(...Array.from({length:total},(_,i)=>element('span',i<step?'done':i===step?'active':'')));
  backButton.hidden=step===0;
  nextButton.textContent=gear&&step===equipment[gear].questions.length?'See result →':'Continue →';
  nextButton.disabled=step===0?!gear:!answers[step-1];
  stepNode.append(element('p','gc-step-label',step===0?'CHOOSE GEAR':`STEP ${step} OF ${total-1}`));
  const question=step===0?{title:'What would you like to check?',hint:'Use the gear your child wears now.',options:[['stick','Hockey stick','Standing length and comfort'],['gloves','Hockey gloves','Fingers, wrist and grip'],['shin','Shin guards','Knee position, coverage and movement']]}:equipment[gear].questions[step-1];
  stepNode.append(element('h2','',question.title),element('p','gc-hint',question.hint));
  const options=step===2&&gear==='stick'?question.byFootwear[answers[0]==='shoes'?'shoes':'skates']:question.options;
  const wrapper=element('div','gc-options');stepNode.append(wrapper);
  for(const [value,label,hint] of options){
    addChoice(wrapper,value,label,hint,(step===0?gear:answers[step-1])===value,chosen=>{
      if(step===0){gear=chosen;answers=[];}else{answers[step-1]=chosen;answers.length=step;}
      render();
    });
  }
}

function verdictFor(kind,selected){
  if(!equipment[kind]||selected.length!==equipment[kind].questions.length)return null;
  const issues=selected.filter(x=>!['good','skates','shoes'].includes(x)&&x!=='unsure'&&x!=='no-skates');
  const unclear=selected.includes('unsure')||selected.includes('no-skates')||(kind==='stick'&&selected[0]==='shoes');
  const priority=['off','gap','small','short','slips','press','large','long','stiff','problem'];
  const issue=priority.find(x=>issues.includes(x));
  return {status:issue?['small','short','gap'].includes(issue)?'outgrown':'review':unclear?'review':'good',issue,unclear};
}
function showResult(){
  const item=equipment[gear],verdict=verdictFor(gear,answers);
  if(!verdict)return;
  stepNode.replaceChildren();actions.hidden=true;resultNode.hidden=false;
  progress.replaceChildren(...Array.from({length:item.questions.length+1},()=>element('span','done')));
  resultNode.append(element('p','gc-step-label',item.name.toUpperCase()+' · YOUR CHECK'));
  const labels={good:'Looks okay for now',review:'Check in store',outgrown:'May have outgrown it'};
  resultNode.append(element('h2','gc-verdict '+verdict.status,labels[verdict.status]));
  const messages=[];
  if(verdict.issue)messages.push(item.result[verdict.issue]);
  if(verdict.unclear)messages.push(gear==='stick'&&answers[0]==='shoes'?'This is a quick check in regular shoes. Check the length again on skates before deciding.':'Some checks are incomplete. Repeat them with the player and their usual gear before deciding.');
  if(!messages.length)messages.push(item.result.good);
  const list=element('ul');for(const message of messages)list.append(element('li','',message));resultNode.append(list);
  const note=element('div','gc-next-steps');note.append(element('strong','','What to do next'),element('p','',item.next));resultNode.append(note);
  const links=element('div','gc-result-links');for(const [label,url] of item.links){const link=element('a','',label);link.href=url;links.append(link);}
  const restart=element('button','','Check another item');restart.type='button';restart.addEventListener('click',()=>{gear=null;answers=[];step=0;render();window.scrollTo({top:0,behavior:'smooth'});});links.append(restart);resultNode.append(links);
  window.scrollTo({top:0,behavior:'smooth'});
}
nextButton.addEventListener('click',()=>{if(nextButton.disabled)return;if(step===equipment[gear].questions.length){showResult();return;}step++;render();window.scrollTo({top:0,behavior:'smooth'});});
backButton.addEventListener('click',()=>{step--;render();window.scrollTo({top:0,behavior:'smooth'});});
render();
if(typeof module!=='undefined')module.exports={equipment,verdictFor};
