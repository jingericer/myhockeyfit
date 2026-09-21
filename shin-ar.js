(() => {
  'use strict';
  const overlay=document.createElement('section');
  overlay.className='sg-ar';overlay.hidden=true;
  overlay.setAttribute('aria-label','AR shin measurement');
  overlay.innerHTML='<header><h2>AR two point measure</h2><button type="button" data-ar="close">Close</button></header><p class="sg-ar-instruction" role="status"></p><span class="sg-ar-target" aria-hidden="true">+</span><span class="sg-ar-point" data-point="0" hidden>1</span><span class="sg-ar-point" data-point="1" hidden>2</span><footer><output class="sg-ar-distance"></output><p>Experimental estimate. Keep the leg still. A point on the background gives a wrong distance.</p><label class="sg-ar-confirm" hidden><input type="checkbox"> Both markers stayed on the knee and outer ankle, not the background.</label><div><button type="button" data-ar="mark" disabled>Set knee point</button><button type="button" data-ar="reset">Start again</button><button type="button" data-ar="use" hidden disabled>Use estimate</button></div></footer>';
  document.body.append(overlay);
  const find=s=>overlay.querySelector(s);
  let active=null,generation=0;
  const distanceCm=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)*100;
  const validCm=value=>Number.isFinite(value)&&value>=15&&value<=65;
  function message(text){find('.sg-ar-instruction').textContent=text;}
  function clearPoints(state){
    state.points=[];state.hit=null;state.samples=[];state.fresh=0;
    find('.sg-ar-distance').textContent='';find('.sg-ar-confirm').hidden=true;
    find('input').checked=false;find('[data-ar=use]').hidden=true;find('[data-ar=use]').disabled=true;
    find('[data-ar=mark]').hidden=false;find('[data-ar=mark]').disabled=true;
    find('[data-ar=mark]').textContent='Set knee point';
    overlay.querySelectorAll('[data-point]').forEach(el=>el.hidden=true);
    message('Move the phone slowly to scan. Aim the centre target at the kneecap centre.');
  }
  function dispose(state){
    if(state.disposed)return;state.disposed=true;
    try{state.source?.cancel();}catch{}
    state.gl?.getExtension('WEBGL_lose_context')?.loseContext();
    state.canvas?.remove();state.points=[];state.samples=[];state.hit=null;
    if(active===state){active=null;overlay.hidden=true;document.body.classList.remove('sg-ar-open');state.focus?.isConnected&&state.focus.focus();}
  }
  async function stop(){
    generation++;const state=active;if(!state)return;
    dispose(state);
    try{await state.session?.end();}catch{}
  }
  function project(position,view){
    const v=[position.x,position.y,position.z,1];
    const mul=(m,p)=>[0,1,2,3].map(r=>m[r]*p[0]+m[4+r]*p[1]+m[8+r]*p[2]+m[12+r]*p[3]);
    const clip=mul(view.projectionMatrix,mul(view.transform.inverse.matrix,v));
    if(clip[3]<=0)return null;
    const x=clip[0]/clip[3],y=clip[1]/clip[3];
    return Math.abs(x)<=1&&Math.abs(y)<=1?{x:(x+1)*50,y:(1-y)*50}:null;
  }
  function frame(state,time,xrFrame){
    if(active!==state||state.disposed)return;
    state.session.requestAnimationFrame((t,f)=>frame(state,t,f));
    const gl=state.gl;gl.bindFramebuffer(gl.FRAMEBUFFER,state.layer.framebuffer);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const pose=xrFrame.getViewerPose(state.space);
    const visible=pose&&state.session.visibilityState==='visible'&&!pose.emulatedPosition;
    const hit=visible?xrFrame.getHitTestResults(state.source)[0]?.getPose(state.space):null;
    state.hit=null;find('[data-ar=mark]').disabled=true;
    if(visible){
      state.points.forEach((p,i)=>{const pos=project(p,pose.views[0]),el=find('[data-point="'+i+'"]');el.hidden=!pos;if(pos){el.style.left=pos.x+'%';el.style.top=pos.y+'%';}});
    }else overlay.querySelectorAll('[data-point]').forEach(el=>el.hidden=true);
    if(hit&&!hit.emulatedPosition){
      const p=hit.transform.position;
      const point={x:p.x,y:p.y,z:p.z};
      if([p.x,p.y,p.z].every(Number.isFinite)){
        state.samples.push(point);if(state.samples.length>8)state.samples.shift();
        const steady=state.samples.length===8&&state.samples.every(v=>distanceCm(v,point)<0.8);
        if(steady){state.hit=point;state.fresh=performance.now();}
      }
    }else state.samples=[];
    const ready=!!state.hit&&state.points.length<2;
    find('.sg-ar-target').classList.toggle('ready',ready);
    find('[data-ar=mark]').disabled=!ready;
    if(state.points.length<2)message(ready?(state.points.length?'Aim at the outer ankle centre. Keep the leg still, then set point 2.':'Aim at the kneecap centre, then set point 1.'):'No steady surface point. Move slowly. Do not use a point on the wall or floor.');
  }
  async function start(onUse,onError){
    if(active)return;
    if(!window.isSecureContext||!navigator.xr){onError('AR measurement is unavailable in this browser. Enter a tape measurement instead.');return;}
    const token=++generation;
    const state={points:[],samples:[],session:null,focus:document.activeElement,onUse};
    active=state;overlay.hidden=false;document.body.classList.add('sg-ar-open');clearPoints(state);
    message('Allow AR access to start.');
    try{
      // Request directly within the button gesture, without an awaited support probe.
      const session=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['hit-test','dom-overlay'],domOverlay:{root:overlay}});
      if(token!==generation||state.disposed){await session.end();return;}
      state.session=session;session.addEventListener('end',()=>dispose(state));
      if(session.domOverlayState?.type!=='screen')throw new Error('screen overlay unavailable');
      state.canvas=document.createElement('canvas');
      state.gl=state.canvas.getContext('webgl',{alpha:true,xrCompatible:true});
      if(!state.gl)throw new Error('WebGL unavailable');
      await state.gl.makeXRCompatible();
      if(state.disposed)return;
      state.layer=new XRWebGLLayer(session,state.gl,{alpha:true});
      session.updateRenderState({baseLayer:state.layer});
      state.space=await session.requestReferenceSpace('local');
      const viewer=await session.requestReferenceSpace('viewer');
      if(state.disposed)return;
      // Never silently fall back to plane-only hits, which often land behind a leg.
      try{state.source=await session.requestHitTestSource({space:viewer,entityTypes:['mesh']});}
      catch{if(state.disposed)return;state.source=await session.requestHitTestSource({space:viewer,entityTypes:['point']});}
      if(state.disposed){state.source?.cancel();return;}
      state.space.addEventListener('reset',()=>{clearPoints(state);message('Tracking moved. Start the two points again.');});
      session.addEventListener('visibilitychange',()=>{if(session.visibilityState!=='visible'){clearPoints(state);message('Tracking paused. Start again when the camera view returns.');}});
      session.requestAnimationFrame((t,f)=>frame(state,t,f));
    }catch(error){
      if(state.disposed)return;
      await stop();
      onError(error.name==='NotAllowedError'?'AR permission was not granted. You can retry or enter a tape measurement.':'This device could not start the required AR surface measurement. Use a tape measurement instead.');
    }
  }
  overlay.addEventListener('beforexrselect',e=>e.preventDefault());
  overlay.addEventListener('change',()=>{find('[data-ar=use]').disabled=!find('input').checked||!active||active.points.length!==2||!validCm(distanceCm(...active.points));});
  overlay.addEventListener('click',async event=>{
    const action=event.target.closest('button')?.dataset.ar,state=active;
    if(action==='close'){await stop();return;}if(!state)return;
    if(action==='reset'){clearPoints(state);return;}
    if(action==='mark'&&state.hit&&performance.now()-state.fresh<250&&state.points.length<2){
      state.points.push({...state.hit});state.samples=[];state.hit=null;find('[data-ar=mark]').disabled=true;
      if(state.points.length===1)find('[data-ar=mark]').textContent='Set ankle point';
      else{
        const cm=distanceCm(...state.points);
        find('[data-ar=mark]').hidden=true;
        find('.sg-ar-distance').textContent=cm.toFixed(1)+' cm / '+(cm/2.54).toFixed(2)+' in';
        find('.sg-ar-confirm').hidden=!validCm(cm);find('[data-ar=use]').hidden=!validCm(cm);
        message(validCm(cm)?'Check both markers. Repeat the measurement to check consistency. Confirm with a tape before choosing a size.':'Outside the supported shin range. Start again or use a tape.');
      }
    }
    if(action==='use'&&state.points.length===2&&find('input').checked){
      const cm=distanceCm(...state.points);if(!validCm(cm))return;
      const callback=state.onUse;await stop();callback(Number(cm.toFixed(1)));
    }
  });
  window.addEventListener('pagehide',stop);
  window.ShinAR={start,stop,distanceCm,validCm};
})();
