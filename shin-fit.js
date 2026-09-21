(() => {
  'use strict';
  const root=document.querySelector('#shinGuardsComing');
  const chart=[
    {size:8,min:25.5,max:28},{size:9,min:28,max:31},{size:10,min:31,max:33.5},
    {size:11,min:33.5,max:36},{size:12,min:36,max:38.5},{size:13,min:38.5,max:41},
    {size:14,min:41,max:43.5},{size:15,min:43.5,max:46},{size:16,min:46,max:48.5},
    {size:17,min:48.5,max:51.5},{size:18,min:51.5,max:Infinity}
  ];
  const data={level:'',budget:150,tongue:'',cm:'',checks:{},sort:'price',count:5};
  let page=0;
  const photos={};
  let cameraStream=null,cameraSession=0,cameraTarget=null,cameraReturnFocus=null;
  const camera=document.createElement('dialog');
  camera.className='sg-camera';
  camera.setAttribute('aria-labelledby','sg-camera-title');
  camera.innerHTML='<header><div><h2 id="sg-camera-title">Shin guard photo</h2><p id="sg-camera-hint"></p></div><button type="button" data-camera="close" aria-label="Close camera">✕</button></header><div class="sg-camera-view"><video autoplay muted playsinline></video><canvas hidden></canvas><div class="sg-camera-guide" aria-hidden="true"><span>KNEE IN FRAME</span><span>ENTIRE PAD AND SKATE</span></div></div><p class="sg-camera-status" role="status">Starting camera…</p><footer><button type="button" data-camera="capture" disabled>Take photo</button><button type="button" data-camera="retake" hidden>Retake</button><button type="button" data-camera="use" hidden>Use photo</button></footer>';
  document.body.append(camera);
  function stopCameraStream(){
    cameraStream?.getTracks().forEach(track=>track.stop());cameraStream=null;
    camera.querySelector('video').srcObject=null;
  }
  function closeCamera(){
    cameraSession++;stopCameraStream();
    if(camera.open)camera.close();
    const canvas=camera.querySelector('canvas');canvas.width=0;canvas.height=0;
    document.body.classList.remove('sg-camera-open');
    cameraReturnFocus?.isConnected&&cameraReturnFocus.focus();
  }
  async function openCamera(key){
    stopCameraStream();const session=++cameraSession;cameraTarget=key;
    if(!camera.open){cameraReturnFocus=document.activeElement;camera.showModal();}
    document.body.classList.add('sg-camera-open');
    const video=camera.querySelector('video'),canvas=camera.querySelector('canvas');
    canvas.width=0;canvas.height=0;canvas.hidden=true;video.hidden=false;
    camera.querySelector('.sg-camera-guide').hidden=false;
    camera.querySelector('#sg-camera-title').textContent=key==='front'?'Front view':'Side view';
    camera.querySelector('#sg-camera-hint').textContent=key==='front'?'Face the camera. Include both knees, pads and skates.':'Turn sideways and gently bend your knees. Include the knee, pad and skate.';
    camera.querySelector('.sg-camera-status').textContent='Starting camera…';
    camera.querySelector('[data-camera=capture]').hidden=false;
    camera.querySelector('[data-camera=capture]').disabled=true;
    camera.querySelector('[data-camera=retake]').hidden=true;
    camera.querySelector('[data-camera=use]').hidden=true;
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('unavailable');
      const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1080},height:{ideal:1440}}});
      if(session!==cameraSession){stream.getTracks().forEach(track=>track.stop());return;}
      cameraStream=stream;video.srcObject=stream;await video.play();
      if(session!==cameraSession)return;
      camera.querySelector('[data-camera=capture]').disabled=false;
      camera.querySelector('.sg-camera-status').textContent='Ask someone to take the photo. Stay supported on a stable surface with skate guards.';
    }catch(error){
      if(session!==cameraSession)return;
      stopCameraStream();
      camera.querySelector('.sg-camera-status').textContent='Camera unavailable. Allow camera access on this HTTPS site, or close this window and choose a photo from your device.';
    }
  }
  camera.addEventListener('cancel',event=>{event.preventDefault();closeCamera();});
  camera.addEventListener('click',event=>{
    const action=event.target.closest('button')?.dataset.camera;
    if(action==='close'){closeCamera();return;}
    if(action==='retake'){openCamera(cameraTarget);return;}
    const canvas=camera.querySelector('canvas'),video=camera.querySelector('video');
    if(action==='capture'){
      if(!video.videoWidth||!video.videoHeight)return;
      canvas.width=video.videoWidth;canvas.height=video.videoHeight;
      canvas.getContext('2d').drawImage(video,0,0);
      stopCameraStream();video.hidden=true;canvas.hidden=false;
      camera.querySelector('.sg-camera-guide').hidden=true;
      camera.querySelector('[data-camera=capture]').hidden=true;
      camera.querySelector('[data-camera=retake]').hidden=false;
      camera.querySelector('[data-camera=use]').hidden=false;
      camera.querySelector('[data-camera=use]').disabled=false;
      camera.querySelector('.sg-camera-status').textContent='Check that the knee, whole pad and skate are visible. This photo stays in this tab.';
    }
    if(action==='use'){
      const session=cameraSession,key=cameraTarget;
      camera.querySelector('[data-camera=use]').disabled=true;
      canvas.toBlob(blob=>{
        if(session!==cameraSession)return;
        if(!blob){camera.querySelector('[data-camera=use]').disabled=false;camera.querySelector('.sg-camera-status').textContent='Could not save this preview. Please retake the photo.';return;}
        if(photos[key])URL.revokeObjectURL(photos[key]);photos[key]=URL.createObjectURL(blob);
        closeCamera();render(false);root.querySelector('[data-open-camera="'+key+'"]').focus();
      },'image/jpeg',0.9);
    }
  });
  const source='https://ca.bauer.com/pages/size-guide-shin-pads';
  function sizesFor(cm) {
    if(!Number.isFinite(cm)||cm<15||cm>65) return [];
    return chart.filter(row=>cm>=row.min&&cm<=row.max).map(row=>row.size);
  }
  function shortlist(catalog,sizes,budget) {
    return catalog.flatMap(product=>{
      const variants=product.variants.filter(v=>sizes.includes(v.size)&&Number.isFinite(v.price)&&v.price<=budget&&v.available);
      return variants.length?[{...product,variants,price:Math.min(...variants.map(v=>v.price))}]:[];
    }).sort((a,b)=>a.price-b.price||a.name.localeCompare(b.name));
  }
  function verdict(checks) {
    const values=['knee','coverage','secure','movement'].map(key=>checks[key]);
    if(values.some(v=>v==='no')) return {title:'Adjust and try again',detail:'One or more fit checks need attention. Ask a store fitter to check length, knee position and strap adjustment before choosing this pair.'};
    if(values.some(v=>v!=='yes')) return {title:'More checking needed',detail:'Complete all four checks. If you are unsure about coverage or comfort, ask a store fitter.'};
    return {title:'Your fit checks look promising',detail:'You reported a centred knee, coverage, secure straps and comfortable movement. This is a self check, not a safety certification or automatic photo assessment.'};
  }
  function clearPhotos() {
    closeCamera();
    Object.values(photos).forEach(URL.revokeObjectURL); Object.keys(photos).forEach(k=>delete photos[k]);
    root.querySelectorAll('.sg-photos img').forEach(img=>{img.removeAttribute('src');img.hidden=true;});
    root.querySelectorAll('input[type=file]').forEach(input=>input.value='');
  }
  const radio=(name,items,value)=>'<fieldset class="sg-options"><legend>'+({level:'Playing level',tongue:'Choose your usual setup'}[name]||'Choose one')+'</legend>'+items.map(([key,label])=>'<label><input type="radio" name="sg-'+name+'" value="'+key+'" '+(value===key?'checked':'')+'><span>'+label+'</span></label>').join('')+'</fieldset>';
  function results() {
    const sizes=sizesFor(Number(data.cm));
    let products=shortlist(window.shinCatalog||[],sizes,Number(data.budget));
    if(data.sort==='name')products.sort((a,b)=>a.name.localeCompare(b.name));
    const tongue={outside:'Tongue outside: check that the tongue overlaps comfortably without pushing the pad up.',tucked:'Tongue tucked: check that the pad does not press into the boot when you bend.',unsure:'Try both tongue positions with a store fitter before deciding.'}[data.tongue];
    return '<h2 tabindex="-1">Your starting fit</h2><div class="sg-size">'+(sizes.length?sizes.map(s=>s+'″').join(' or '):'Store fitting needed')+'</div>'+
      '<p>'+ (sizes.length?'Bauer chart starting size, based on your measurement. Try on before buying.':'Your measurement is outside the supported chart range. Remeasure or ask a store fitter. We will not guess a size.')+'</p>'+
      '<p><b>Shin measurement:</b> '+Number(data.cm).toFixed(1)+' cm / '+(Number(data.cm)/2.54).toFixed(2)+' in<br><b>Budget:</b> CAD $'+Number(data.budget)+' before tax and shipping.</p>'+
      '<p class="sg-notice">'+tongue+' Do not buy extra length just for growth.</p>'+
      '<p>'+(data.level==='rep'?'For competitive play, ask the fitter about calf coverage and impact protection as well as mobility. A low price alone does not confirm suitable protection.':'Choose a comfortable, secure fit first. The most expensive model is not automatically the best fit.')+'</p>'+
      '<h3>Options to try</h3><p>Bauer Canada models in your starting size and within your budget. Check the fit of each model in store.</p>'+
      '<label class="sg-field">Sort<select id="sg-sort"><option value="price" '+(data.sort==='price'?'selected':'')+'>Price: low to high</option><option value="name" '+(data.sort==='name'?'selected':'')+'>Model name</option></select></label>'+
      '<div>'+products.slice(0,data.count).map(p=>'<article class="sg-product"><h3>'+p.name+'</h3><p>'+p.variants.map(v=>v.size+'″: CAD $'+v.price.toFixed(2)).join(' · ')+'</p><a href="'+p.url+'" target="_blank" rel="noopener">Check model and availability ↗</a></article>').join('')+'</div>'+
      (!products.length?'<p>No verified options meet this size and budget. Change your budget or ask about local sales. We have not added oversized or over budget alternatives.</p>':'')+
      (products.length>data.count?'<button type="button" class="sg-action" data-action="more">Show '+Math.min(5,products.length-data.count)+' more</button>':'')+
      '<p>'+products.length+' matching models. Price and stock snapshot: September 21, 2026. Verify the exact size and current price at the retailer.</p>'+
      '<details><summary>How this result works</summary><p><a href="'+source+'" target="_blank" rel="noopener">Bauer official size and measurement guide</a>. We match the published metric measurement intervals, not a direct conversion of leg length to the product size. At an interval boundary we show both sizes. No automatic size change is made for tongue position.</p><p><a href="https://ca.bauer.com/collections/hockey-shin-pads" target="_blank" rel="noopener">Bauer Canada product catalog</a>. CCM sizing is not inferred from the Bauer chart.</p></details>';
  }
  function checkPage() {
    const questions=[
      ['knee','Knee position','Place the kneecap in the centre of the knee cup. Does it stay centred when bending?'],
      ['coverage','Coverage','With skates and hockey pants on, is the front of the leg covered without an obvious gap at the skate or above the knee?'],
      ['secure','Straps and calf','Fasten the straps. Does the pad stay in place without rotating, slipping or uncomfortable pressure?'],
      ['movement','Movement','On a stable nonslip surface with suitable skate guards, hold a support and bend into a skating stance. Can you move comfortably without the pad hitting the boot?']
    ];
    return '<h2 tabindex="-1">Try them on in store</h2><p>Use your own skates and usual tongue position. Check both legs. Ask an adult or fitter to help.</p>'+
      '<section aria-label="Optional fit photos"><h3>Take your fit photos</h3><p>Use the camera for a front and side view, or choose existing photos. Photos are optional and help you answer the checks below. They stay in this tab and are cleared when you leave this tool. There is no automatic photo analysis.</p><div class="sg-photos">'+['front','side'].map(key=>'<div><h3>'+(key==='front'?'Front view':'Side view')+'</h3><button type="button" class="sg-action" data-open-camera="'+key+'">Open camera</button><label class="sg-field">Or choose a photo<input type="file" accept="image/*" data-photo="'+key+'"></label><img alt="'+key+' view for your fit check" '+(photos[key]?'src="'+photos[key]+'"':'hidden')+'><button type="button" class="sg-delete" data-delete="'+key+'">Clear photo</button></div>').join('')+'</div></section>'+
      questions.map(([key,title,hint])=>'<fieldset class="sg-options"><legend>'+title+'</legend><p>'+hint+'</p>'+[['yes','Yes'],['no','No'],['unsure','Not sure']].map(([value,label])=>'<label><input type="radio" name="sg-check-'+key+'" value="'+value+'" '+(data.checks[key]===value?'checked':'')+'>'+label+'</label>').join('')+'</fieldset>').join('')+
      '<div id="sg-verdict" role="status"></div>';
  }
  function render(focus=true) {
    const screens=[
      ()=>'<h2 tabindex="-1">Find your shin guard fit</h2><p>A simple starting size, then a real fit check. No account needed.</p>'+radio('level',[['new','Learning / recreational'],['rep','Competitive / rep']],data.level)+'<label class="sg-field">Maximum budget in CAD<input id="sg-budget" type="number" min="1" max="2000" step="1" inputmode="numeric" value="'+data.budget+'"></label><p>Before tax and shipping. Products above this amount will be excluded.</p>',
      ()=>'<h2 tabindex="-1">Where is your skate tongue?</h2><p>The yellow part is the skate tongue. Neither choice means a higher playing level.</p><a href="shin-tongue-guide.png" target="_blank" rel="noopener" aria-label="Open larger tongue comparison illustration"><img class="sg-illustration" src="shin-tongue-guide.png" alt="Left: yellow skate tongue overlaps outside the shin pad. Right: the shin pad covers the upper yellow tongue."></a>'+radio('tongue',[['outside','Tongue outside the shin pad'],['tucked','Tongue under the shin pad'],['unsure','Not sure yet']],data.tongue),
      ()=>'<h2 tabindex="-1">Measure your shin</h2><p>Remove the shin pad. Locate the centre of the kneecap and the centre of the bony bump on the outside of the ankle. Measure between these points with a tape. Measure both legs; if they differ, ask a fitter to check both.</p><p><a href="'+source+'" target="_blank" rel="noopener">View Bauer’s measurement picture and size chart ↗</a></p><div class="sg-units"><label class="sg-field">Shin length in cm<input id="sg-cm" type="number" inputmode="decimal" step="any" min="15" max="65" value="'+data.cm+'"></label><label class="sg-field">Shin length in inches<input id="sg-in" type="number" inputmode="decimal" step="any" min="5.9" max="25.6" value="'+(data.cm?Number((Number(data.cm)/2.54).toFixed(2)):'')+'"></label></div><p class="sg-notice">Enter your leg measurement, not the size printed on an old pad. The measurement is not the same as the product size.</p>',
      results,checkPage
    ];
    root.innerHTML='<div class="shin-fit"><button class="equipment-back" type="button" data-action="home">← Equipment</button><p class="sg-progress">Step '+(page+1)+' of 5 · '+['Player','Tongue','Measure','Results','Store check'][page]+'</p><progress value="'+(page+1)+'" max="5" aria-label="Shin fit progress"></progress>'+screens[page]()+'<p id="sg-error" class="sg-error" role="alert"></p><div class="sg-actions"><button type="button" class="sg-back" data-action="back" '+(page===0?'hidden':'')+'>Back</button><button type="button" data-action="next">'+(page===2?'Get my starting size':page===3?'Check in store':page===4?'See fit conclusion':'Next →')+'</button></div></div>';
    if(focus&&!root.hidden)root.querySelector('h2').focus();
  }
  root.addEventListener('input',e=>{
    if(e.target.id==='sg-budget')data.budget=e.target.value;
    if(e.target.id==='sg-cm'){data.cm=e.target.value;root.querySelector('#sg-in').value=data.cm?Number((Number(data.cm)/2.54).toFixed(2)):'';}
    if(e.target.id==='sg-in'){data.cm=e.target.value?Number((Number(e.target.value)*2.54).toFixed(3)):'';root.querySelector('#sg-cm').value=data.cm;}
  });
  root.addEventListener('change',e=>{
    if(e.target.name==='sg-level')data.level=e.target.value;
    if(e.target.name==='sg-tongue')data.tongue=e.target.value;
    if(e.target.name.startsWith('sg-check-')){data.checks[e.target.name.slice(9)]=e.target.value;root.querySelector('#sg-verdict').textContent='';}
    if(e.target.id==='sg-sort'){data.sort=e.target.value;render(false);}
    if(e.target.dataset.photo){
      const key=e.target.dataset.photo,file=e.target.files[0];if(!file)return;
      if(!file.type.startsWith('image/')||file.size>20*1024*1024){root.querySelector('#sg-error').textContent='Choose an image smaller than 20 MB.';e.target.value='';return;}
      if(photos[key])URL.revokeObjectURL(photos[key]);photos[key]=URL.createObjectURL(file);
      const img=e.target.closest('div').querySelector('img');img.src=photos[key];img.hidden=false;
      img.onerror=()=>{URL.revokeObjectURL(photos[key]);delete photos[key];img.hidden=true;img.removeAttribute('src');root.querySelector('#sg-error').textContent='This image could not be displayed. Try a JPEG or PNG photo.';};
    }
  });
  root.addEventListener('click',e=>{
    const button=e.target.closest('button');if(!button)return;
    if(button.dataset.openCamera){openCamera(button.dataset.openCamera);return;}
    if(button.dataset.delete){const key=button.dataset.delete;if(photos[key])URL.revokeObjectURL(photos[key]);delete photos[key];render(false);return;}
    const action=button.dataset.action;
    if(action==='home'){clearPhotos();showEquipmentHome();return;}
    if(action==='more'){data.count+=5;render(false);return;}
    if(action==='back'){if(page===4)clearPhotos();page=Math.max(0,page-1);render();return;}
    if(action!=='next')return;
    let error='';
    if(page===0&&(!data.level||!Number.isFinite(Number(data.budget))||Number(data.budget)<1||Number(data.budget)>2000))error='Choose your playing level and enter a budget from 1 to 2000 CAD.';
    if(page===1&&!data.tongue)error='Choose a tongue position, or select Not sure yet.';
    if(page===2&&(!data.cm||!Number.isFinite(Number(data.cm))||Number(data.cm)<15||Number(data.cm)>65))error='Enter a shin measurement from 15 to 65 cm, or its equivalent in inches.';
    if(error){root.querySelector('#sg-error').textContent=error;return;}
    if(page===4){const v=verdict(data.checks);root.querySelector('#sg-verdict').innerHTML='<h3>'+v.title+'</h3><p>'+v.detail+'</p>';root.querySelector('#sg-verdict').scrollIntoView({behavior:'smooth',block:'center'});return;}
    if(page===2){data.count=5;data.checks={};}
    page++;render();root.scrollIntoView({behavior:'smooth',block:'start'});
  });
  window.addEventListener('pagehide',clearPhotos);
  window.ShinFit={sizesFor,shortlist,verdict,clearPhotos};
  render(false);
})();
