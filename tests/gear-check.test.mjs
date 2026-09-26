import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);

// The page uses DOM APIs while rendering. A minimal document lets us exercise the
// actual decision function without adding a browser dependency to the test suite.
globalThis.document={getElementById(){return {replaceChildren(){},append(){},addEventListener(){},set hidden(value){},set textContent(value){}}},createElement(){return {append(){},setAttribute(){},addEventListener(){},className:'',textContent:''}}};
const {equipment,verdictFor}=require('../gear-check.js');
test('all three gear types have a complete good outcome',()=>{
  assert.equal(verdictFor('stick',['skates','good','good']).status,'good');
  assert.equal(verdictFor('gloves',['good','good','good']).status,'good');
  assert.equal(verdictFor('shin',['skates','good','good','good']).status,'good');
});
test('visible coverage gap and a tight glove do not pass',()=>{
  assert.equal(verdictFor('shin',['skates','good','gap','good']).status,'outgrown');
  assert.equal(verdictFor('gloves',['small','good','good']).status,'outgrown');
  assert.equal(verdictFor('shin',['skates','off','good','good']).status,'review');
});
test('no skates and incomplete checks cannot receive a good verdict',()=>{
  assert.equal(verdictFor('shin',['no-skates','good','good','good']).status,'review');
  assert.equal(verdictFor('stick',['shoes','good','good']).status,'review');
  assert.equal(verdictFor('stick',['skates','unsure','good']).status,'review');
  assert.equal(verdictFor('shin',['skates','good']),null);
  for(const item of Object.values(equipment))assert.ok(item.questions.length>=3);
});
