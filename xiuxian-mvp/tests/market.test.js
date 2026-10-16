import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,transition,advance,restoreState,marketCatalog,ITEMS,WEAPONS} from '../src/game.js';
import {EQUIPMENT} from '../src/systems.js';
import {makeMarket} from '../src/market.js';
test('商店接口拒绝传说级丹药、技能书、武器、装备',()=>{
 const s=initialState();s.realm=2;s.cash=999999;
 for(const item of ['heal5','book_fire_q5'])assert.throws(()=>transition(s,'buy',{item}));
 assert.throws(()=>transition(s,'buy-weapon',{item:'ancient'}));assert.throws(()=>transition(s,'buy-equipment',{item:'head_spirit_q5'}));assert.equal(s.cash,999999);
});
test('集市随机传说分支与普通分支，价格为商店八折，不出售洗髓丹',()=>{
 const catalog=marketCatalog();const rare=makeMarket(0,catalog,()=>0),normal=makeMarket(0,catalog,()=>.5);
 assert.equal(catalog.find(p=>p.kind===rare[5].kind&&p.item===rare[5].item).grade,5);
 assert.ok(normal.every(o=>catalog.find(p=>p.kind===o.kind&&p.item===o.item).grade<5));
 for(const o of rare){const p=catalog.find(p=>p.kind===o.kind&&p.item===o.item);assert.ok(o.price<p.price);assert.notEqual(o.item,'supreme');}
});
test('集市购入只一次，读档保留售罄，七日刷新而非离线刷新',()=>{
 let s=initialState();s.cash=10000;s.marketOffers=makeMarket(0,marketCatalog(),()=>.5);
 const offer=s.marketOffers.find(o=>o.kind==='item');const cash=s.cash;s=transition(s,'market-buy',{id:offer.id});assert.equal(s.cash,cash-offer.price);assert.equal(s.inventory[offer.item],1);assert.throws(()=>transition(s,'market-buy',{id:offer.id}));
 s=restoreState(s);assert.ok(s.marketOffers.find(o=>o.id===offer.id).sold);advance(s,6);assert.equal(s.marketCycle,0);advance(s,1);assert.equal(s.marketCycle,1);assert.ok(s.marketOffers.every(o=>!o.sold));
});
test('集市可购传说物品，资金或容量不足不损失资源',()=>{
 let s=initialState();s.marketOffers=makeMarket(0,marketCatalog(),()=>0);const o=s.marketOffers[5];s.cash=999999;
 const n=transition(s,'market-buy',{id:o.id});assert.equal(n.inventory[o.item],1);assert.equal(n.cash,s.cash-o.price);
 s.cash=0;assert.throws(()=>transition(s,'market-buy',{id:o.id}));assert.ok(!s.marketOffers[5].sold);s.cash=999999;s.inventory.herb=999*9;s.inventory.seed=999;assert.throws(()=>transition(s,'market-buy',{id:o.id}));assert.equal(s.cash,999999);assert.ok(!s.marketOffers[5].sold);
});
