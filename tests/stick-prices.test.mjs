import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const prices=runInNewContext(readFileSync(new URL('../stick-prices.js',import.meta.url),'utf8')+'\nwindow.stickCanadianPrices',{window:{}});
const families=runInNewContext(source.slice(source.indexOf('const productFamilies ='),source.indexOf('// Exact model'))+'\nproductFamilies');
const ranking=source.slice(source.indexOf('const tierScore ='),source.indexOf('function reasonFor('));
function runRanking(budget){
 const context={window:{stickCanadianPrices:prices},productFamilies:families,nearest:(value,options)=>options.reduce((a,b)=>Math.abs(b-value)<Math.abs(a-value)?b:a)};
 const rank=runInNewContext(ranking+'\nrankProducts',context);
 return rank({budget,level:'developing',reviewsOnly:false},{stickClass:'Junior',flex:40,kick:'Low'});
}
test('stick budgets use only verified Canadian prices for the selected class and flex',()=>{
 const picks=runRanking(150);
 assert(picks.length>0);
 assert(picks.every(p=>p.price!==null && p.price<=150 && p.priceSource));
 assert(!picks.some(p=>p.brand==='Warrior'&&p.name==='Alpha LX3'));
 assert.equal(picks.find(p=>p.brand==='CCM'&&p.name==='Ribcor Trigger 60')?.price,99.99);
});
test('unrestricted list flags Canadian prices that have not been checked',()=>{
 const picks=runRanking(999);
 assert(picks.some(p=>p.price===null && p.priceSource===null));
 assert(picks.some(p=>p.price!==null && p.priceSource));
});
