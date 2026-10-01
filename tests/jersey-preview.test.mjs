import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateLookInput,previewBlob,previewError,readPreview} from '../jersey-look-utils.mjs';
const jpeg='data:image/jpeg;base64,/9j/'+'A'.repeat(120);
const body={person:jpeg,jersey:jpeg,consent:true,view:'front',number:''};
test('optional jersey numbers accept blank, absent and whitespace; errors identify the actual field',()=>{
 for(const number of ['',undefined,'  ',' 07 ','99'])assert.equal(validateLookInput({...body,number}),null);
 for(const [field,change] of [['person',{person:'data:image/png;base64,AAAA'}],['jersey',{jersey:'invalid'}],['number',{number:'100'}],['consent',{consent:false}],['view',{view:'side'}]]){
 const invalid=validateLookInput({...body,...change});assert.equal(invalid.field,field);if(field!=='number')assert(!invalid.error.includes('99'));
 }
});
test('generated JPEG becomes a displayable Blob without fetching a data URL',async()=>{
 const image='data:image/jpeg;base64,'+btoa(String.fromCharCode(255,216,255)+'x'.repeat(300000));
 const blob=previewBlob(image);assert.equal(blob.type,'image/jpeg');assert.equal(blob.size,300003);assert.deepEqual([...new Uint8Array(await blob.arrayBuffer()).slice(0,3)],[255,216,255]);assert.throws(()=>previewBlob('data:image/png;base64,AAA'));
});
test('a complete preview is usable without waiting for a stream connection to close',async()=>{
 let cancelled=false,progress;const result={image:jpeg,remaining:1};
 const stream=new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('event: progress\ndata: {"message":"Creating","remaining":1}\n\n'));c.enqueue(new TextEncoder().encode('event: result\ndata: '+JSON.stringify(result)+'\n\n'));},cancel(){cancelled=true;}});
 assert.deepEqual(await readPreview(new Response(stream,{headers:{'Content-Type':'text/event-stream'}}),data=>progress=data),result);assert.equal(cancelled,true);assert.equal(progress.remaining,1);
 assert.match(previewError(new TypeError('Load failed')),/connection was interrupted/);assert.match(previewError(new TypeError('Load failed')),/may already have been counted/);
});
