import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, restoreState, transition as gameTransition, collectDebt, advance, availableCredit, credit, lifeLeft } from '../src/game.js';
const transition=(s,a,p)=>gameTransition(s,a,p,()=>0);

test('开局炼气五级，百万欠款，500资金且额度占满',()=>{
  const s=initialState();assert.equal(s.level,5);assert.equal(s.realm,0);assert.equal(s.cash,500);assert.equal(s.debt,1000000);assert.equal(availableCredit(s),0);
});
test('有现金仅收现金，不扣库存，利息先计',()=>{
  const s=initialState();s.inventory.herb=5;collectDebt(s);assert.equal(s.cash,0);assert.equal(s.debt,1009500);assert.equal(s.inventory.herb,5);assert.equal(s.failed,false);
});
test('零现金扣低价仙草，超额返还，清债不失败',()=>{
  const s=initialState();s.cash=0;s.debt=100;s.inventory.herb=1;s.inventory.moon=1;collectDebt(s);assert.equal(s.debt,0);assert.equal(s.cash,409);assert.equal(s.inventory.herb,0);assert.equal(s.inventory.moon,0);assert.equal(s.failed,false);assert.equal(s.nextCollection,null);
});
test('库存抵债不足时失败，装备和丹药不豁免',()=>{
  const s=initialState();s.cash=0;s.inventory.herb=1;s.inventory.heal=20;s.armor=true;collectDebt(s);assert.equal(s.failed,true);assert.equal(s.inventory.heal,20);
});
test('还款恢复额度，借款到账，重新借款重启周期',()=>{
  let s=transition(initialState(),'repay',{amount:200});assert.equal(s.cash,300);assert.equal(availableCredit(s),200);
  s=transition(s,'borrow',{amount:200});assert.equal(s.cash,500);assert.equal(s.debt,1000000);
  s.cash=2000000;s=transition(s,'repay',{amount:s.debt});assert.equal(s.nextCollection,null);s.day=40;s=transition(s,'borrow',{amount:100});assert.equal(s.nextCollection,70);
});
test('拒绝负数、小数、超额借款与超额还款，原状态不变',()=>{
  const s=initialState();for(const amount of [-1,.5,1000])assert.throws(()=>transition(s,'repay',{amount}));assert.throws(()=>transition(s,'borrow',{amount:1}));assert.equal(s.cash,500);
});
test('播种消耗种子，等待两日收获，库存容量检查是原子的',()=>{
  let s=transition(initialState(),'plant',{index:0});assert.equal(s.inventory.seed,7);assert.throws(()=>transition(s,'harvest',{index:0}));
  s=transition(s,'rest');s=transition(s,'rest');s=transition(s,'harvest',{index:0});assert.equal(s.inventory.herb,3);assert.equal(s.plots[0],null);
  s.inventory.herb=60;const before=structuredClone(s);assert.throws(()=>transition(s,'buy',{item:'seed'}));assert.deepEqual(s,before);
});
test('订单七日刷新，交付不可重复，不足不扣材料',()=>{
  let s=initialState();assert.throws(()=>transition(s,'order',{id:s.orders[0].id}));s.inventory.herb=4;
  s=transition(s,'order',{id:s.orders[0].id});assert.equal(s.cash,1150);assert.equal(s.inventory.herb,0);assert.throws(()=>transition(s,'order',{id:s.orders[0].id}));
  const previous=s.orders[0].id;advance(s,7);assert.notEqual(s.orders[0].id,previous);assert.equal(s.day,8);
});
test('高级商品有境界门槛，极品丹药不能交易',()=>{
  const s=initialState();s.cash=10000;s.inventory.supreme=1;assert.throws(()=>transition(s,'buy',{item:'advanced'}));assert.throws(()=>transition(s,'buy',{item:'supreme'}));assert.throws(()=>transition(s,'sell',{item:'supreme'}));
  s.realm=1;assert.equal(transition(s,'buy',{item:'advanced'}).inventory.advanced,1);
});
test('丹炉与材料门槛、成丹消耗以及工作台减耗',()=>{
  let s=initialState();s.inventory.herb=4;s=transition(s,'brew',{item:'heal'});assert.equal(s.inventory.heal,1);assert.equal(s.inventory.herb,2);assert.equal(s.cash,500);assert.equal(s.energy,82);
});
test('炼气十级突破筑基必须消耗筑基丹，寿元与额度提高且不重置年龄',()=>{
  const s=initialState();s.level=10;s.cultivation=80;s.ageDays=360;assert.throws(()=>transition(s,'breakthrough'),/筑基丹/);assert.equal(s.cultivation,80);
  s.inventory.foundationPill=1;const n=transition(s,'breakthrough');assert.equal(n.realm,1);assert.equal(n.level,1);assert.equal(n.inventory.foundationPill,0);assert.equal(n.ageDays,360);assert.ok(lifeLeft(n)>lifeLeft(s));assert.ok(credit(n)>credit(s));assert.throws(()=>transition(s,'expedition'));assert.equal(transition(n,'expedition').day,2);
});
test('筑基丹可从丹药商店购入，只作突破材料不能服用或出售',()=>{
  const s=initialState();s.cash=3000;const n=transition(s,'buy',{item:'foundationPill'});assert.equal(n.inventory.foundationPill,1);assert.equal(n.cash,1200);assert.throws(()=>transition(n,'consume',{item:'foundationPill'}),/不能直接服用/);assert.throws(()=>transition(n,'sell',{item:'foundationPill'}),/不收购/);
  const oldSave=structuredClone(s);delete oldSave.inventory.foundationPill;const restored=restoreState(oldSave);assert.equal(restored.inventory.foundationPill,0);
});
test('寿元降低授信，既有欠款与催债周期不变',()=>{
  const s=initialState();s.ageDays=360*50;assert.ok(credit(s)<s.debt);assert.equal(availableCredit(s),0);assert.equal(s.failed,false);assert.equal(s.nextCollection,31);
});
test('丹毒限制服丹，满气血不浪费丹药，场景不清毒',()=>{
  const s=initialState();s.inventory.heal=3;s.toxin=100;s.hp=20;assert.throws(()=>transition(s,'consume',{item:'heal'}));s.toxin=0;
  const n=transition(s,'consume',{item:'heal'});assert.equal(n.hp,68);assert.equal(n.toxin,18);assert.equal(n.inventory.heal,2);s.hp=100;assert.throws(()=>transition(s,'consume',{item:'heal'}));
});
test('战败只损失一半本次战利品，返程仍推进日历',()=>{
  const s=initialState();s.realm=1;s.inventory.herb=10;
  const n=transition(s,'return',{hp:0,mana:10,toxin:50,heal:0,loot:{herb:5,core:3},defeated:true,doubleJump:true});assert.equal(n.inventory.herb,12);assert.equal(n.inventory.core,1);assert.equal(n.hp,1);assert.equal(n.doubleJump,true);assert.equal(n.day,2);assert.equal(n.toxin,44);
});
test('30日触发催债，不因多日推进跳过；清债与洗髓达成成功',()=>{
  const s=initialState();s.inventory.herb=10;advance(s,30);assert.equal(s.day,31);assert.equal(s.debt,1009500);assert.equal(s.nextCollection,61);
  const t=initialState();t.cash=1000000;t.inventory.supreme=1;let n=transition(t,'repay',{amount:1000000});n=transition(n,'consume',{item:'supreme'});assert.equal(n.won,true);assert.equal(n.aptitude,2);
});
test('忽略订单无扣款或日期消耗，不能交付，七日刷新恢复',()=>{const s=initialState();s.inventory.herb=10;const o=s.orders[0];let n=transition(s,'ignore-order',{id:o.id});assert.equal(n.cash,s.cash);assert.equal(n.day,s.day);assert.equal(n.inventory.herb,10);assert.throws(()=>transition(n,'order',{id:o.id}));advance(n,7);assert.ok(n.orders.every(o=>!o.ignored));});
