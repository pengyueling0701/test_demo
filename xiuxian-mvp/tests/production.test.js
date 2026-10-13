import {completedTransition as transition,harvestReady} from './helpers.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,transition as unusedTransition,restoreState,ITEMS,RECIPES,makeOrders} from '../src/game.js';
import {brewChance} from '../src/alchemy.js';
import {brewEconomics} from '../src/production.js';
import {harvestYield} from '../src/gardening.js';
test('加工预览与实际材料顺序一致，初始粗制炼丹有风险回报且无倒卖套利',()=>{
 const s=initialState();s.inventory.herb=2;const e=brewEconomics(s,'heal',ITEMS,RECIPES,brewChance(s,0));assert.equal(e.direct,180);assert.ok(e.margin>0);assert.ok(e.expected<e.sale);
 for(const [id,i] of Object.entries(ITEMS))if(i.price&&i.sell)assert.ok(i.sell<=Math.ceil(i.price*.8),id);
 s.inventory.herb=1;s.inventory.herb_q3=1;const high=brewEconomics(s,'heal',ITEMS,RECIPES,78);assert.equal(high.direct,450);assert.equal(high.used.length,2);assert.ok(high.margin<0);
});
test('引露与催生按境界解锁，每轮一次，保存后不重复施术，收获保留收益',()=>{
 let s=initialState();s=transition(s,'plant',{index:0});assert.throws(()=>transition(s,'farm-art',{item:'tend'}));s.level=7;const day=s.day;s=transition(s,'farm-art',{item:'tend'});assert.equal(s.day,day);assert.equal(s.mana,48);assert.equal(harvestYield(s,s.plots[0]),4);s=restoreState(s);assert.throws(()=>transition(s,'farm-art',{item:'tend'}));assert.throws(()=>transition(s,'farm-art',{item:'hasten'}));s.realm=1;s=transition(s,'farm-art',{item:'hasten'});assert.ok(s.plots[0].firstReadyAt<=s.production.lastAt+30000);assert.equal(s.mana,24);assert.throws(()=>transition(s,'farm-art',{item:'hasten'}));s.energy=100;s=harvestReady(s);assert.equal(s.inventory.herb,4);
});
test('玩家明确选择种子品质，错误种子不扣资源；订单轮换且奖励高于直售',()=>{
 let s=initialState();s.inventory.seed_q3=1;s=transition(s,'plant',{index:0,seed:'seed'});assert.equal(s.inventory.seed_q3,1);s=transition(s,'plant',{index:1,seed:'seed_q3'});assert.equal(s.plots[1].grade,3);assert.throws(()=>transition(s,'plant',{index:2,seed:'moonSeed'}));assert.equal(makeOrders(1)[1].item,'manaPill');assert.equal(makeOrders(2,1)[2].item,'mid');for(const o of makeOrders(0))assert.ok(o.reward>ITEMS[o.item].sell*o.qty);
});
test('旧集市价格迁移不重抽、不恢复售罄，也不变更资产',()=>{
 const s=initialState();delete s.productionVersion;s.cash=321;s.inventory.heal=2;s.marketOffers=[{id:'0-0',kind:'item',item:'heal',price:128,sold:true}];const n=restoreState(s);assert.equal(n.cash,321);assert.equal(n.inventory.heal,2);assert.equal(n.marketOffers[0].sold,true);assert.equal(n.marketOffers[0].item,'heal');assert.equal(n.marketOffers[0].price,Math.floor(ITEMS.heal.price*.8));assert.equal(restoreState(n).marketOffers[0].price,n.marketOffers[0].price);
});
