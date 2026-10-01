export function jpeg(value){return typeof value==='string'&&value.length>=100&&value.length<=1600000&&/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(value)&&value.split(',')[1].length%4===0;}
export function validateLookInput(body){
 if(!body||typeof body!=='object')return {field:'request',error:'The photo request could not be read. Refresh this page.'};
 if(body.consent!==true)return {field:'consent',error:'Confirm permission to send your photos to AI.'};
 if(!jpeg(body.person))return {field:'person',error:'Your personal photo could not be used. Please upload it again as a JPEG or PNG.'};
 if(body.jersey!==undefined&&!jpeg(body.jersey))return {field:'jersey',error:'Your jersey photo could not be used. Please upload it again as a JPEG or PNG.'};
 if(!['front','back'].includes(body.view))return {field:'view',error:'Choose a front or back view.'};
 if(body.number!==undefined&&(typeof body.number!=='string'||!/^(?:\d{1,2})?$/.test(body.number.trim())))return {field:'number',error:'Use a number from 0 to 99, or leave it empty.'};
 return null;
}
export function previewBlob(image){
 if(typeof image!=='string'||image.length>10000000||!/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(image))throw Error('The preview image could not be opened.');
 const binary=atob(image.slice(image.indexOf(',')+1));const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
 return new Blob([bytes],{type:'image/jpeg'});
}
export function previewError(error){
 if(error.name==='TimeoutError')return 'The connection timed out. Your AI use may already have been counted. Please wait before trying again.';
 if(error instanceof TypeError||error.name==='AbortError')return 'The connection was interrupted. Your AI use may already have been counted. Check your connection and wait before trying again.';
 return error.message||'Could not create your look. Please return later.';
}

export async function readPreview(response,onProgress=()=>{}){
  if(!response.ok){const data=await response.json();throw Error(data.error||'Could not create your look.');}
  if(!response.body||!response.headers.get('Content-Type')?.includes('text/event-stream'))throw Error('Unexpected response. Please return later.');
  const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',result;
  try{
    while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});if(buffer.length>10000000)throw Error('The generated image is too large.');let end;
      while((end=buffer.indexOf('\n\n'))!==-1){const block=buffer.slice(0,end);buffer=buffer.slice(end+2);const event=block.match(/^event: (.+)$/m)?.[1],payload=block.match(/^data: (.+)$/m)?.[1];if(!payload)continue;const data=JSON.parse(payload);if(event==='error')throw Error(data.error||'Could not create your look.');if(event==='progress'){onProgress(data);}if(event==='result'){result=data;break;}}
      if(result)break;
    }
  }finally{await reader.cancel().catch(()=>{});}
  if(!result||typeof result.image!=='string'||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(result.image))throw Error('No image was returned. Please return later.');return result;
}
