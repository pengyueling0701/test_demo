import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState,transition,restoreState,collectDebt } from '../src/game.js';
import { SOILS,CROPS,plotLimit,expansionPrice } from '../src/gardening.js';

test('开局四块普通地，未升级住宅不能扩建；升级不自动新增',()=>{
  let s=initialState();assert.deepEqual(s.plotSoils,['normal','normal','normal','normal']);
  assert.throws(()=>transition(s,'expand-plot'));s.cash=2000;s=transition(s,'house');
  assert.equal(s.plots.length,4);assert.equal(plotLimit(s),6);
  const cash=s.cash;s=transition(s,'expand-plot');assert.equal(s.plots.length,5);assert.equal(s.plotSoils[4],'normal');assert.equal(s.cash,cash-400);
});
test('住宅逐级支持4、6、8、12块，扩建分别付费，达到上限不再扣款',()=>{
  let s=initialState();s.cash=100000;
  for(let h=1;h<=3;h++){
    s=transition(s,'house');const limit=[4,6,8,12][h],price=[0,400,800,1200][h];
    while(s.plots.length<limit){const cash=s.cash;s=transition(s,'expand-plot');assert.equal(s.cash,cash-price);}
    assert.equal(s.plotSoils.length,limit);const before=structuredClone(s);assert.throws(()=>transition(s,'expand-plot'));assert.deepEqual(s,before);
  }
});
test('缺灵石或住宅等级不足时土地改造失败，已有作物不能改土',()=>{
  let s=initialState();s.cash=10000;assert.throws(()=>transition(s,'soil',{index:0,soil:'spirit'}));
  s.house=1;s.cash=100;assert.throws(()=>transition(s,'soil',{index:0,soil:'spirit'}));
  s.cash=2000;s=transition(s,'plant',{index:0});const before=structuredClone(s);
  assert.throws(()=>transition(s,'soil',{index:0,soil:'spirit'}));assert.deepEqual(s,before);
});
test('特殊草药种植需要对应土地，不匹配时不消耗种子或精力',()=>{
  for(const [id,c]of Object.entries(CROPS).filter(([id])=>id!=='herb')){
    let s=initialState();s.realm=1;s.house=2;s.cash=10000;s.inventory[c.seed]=2;
    const original=structuredClone(s);assert.throws(()=>transition(s,'plant',{index:0,crop:id}));assert.deepEqual(s,original);
    s=transition(s,'soil',{index:0,soil:c.soils[0]});s=transition(s,'plant',{index:0,crop:id});
    assert.equal(s.inventory[c.seed],1);assert.equal(s.plots[0].crop,id);assert.equal(s.plots[0].ready,s.day+c.days);
    assert.throws(()=>transition(s,'harvest',{index:0}));s.day=s.plots[0].ready;s=transition(s,'harvest',{index:0});
    assert.equal(s.inventory[c.item],c.yield);assert.equal(s.plots[0],null);assert.equal(s.plotSoils[0],c.soils[0]);
  }
});
test('青灵草适应所有土地，改土不叠加收益，恢复普通地不退费用',()=>{
  let s=initialState();s.house=2;s.cash=10000;
  for(const key of Object.keys(SOILS)){
    if(s.plotSoils[0]!==key)s=transition(s,'soil',{index:0,soil:key});
    const cash=s.cash;assert.throws(()=>transition(s,'soil',{index:0,soil:key}));assert.equal(s.cash,cash);
    s=transition(s,'plant',{index:0});s.day+=2;s=transition(s,'harvest',{index:0});assert.equal(s.plotSoils[0],key);
  }
  const cash=s.cash;s=transition(s,'soil',{index:0,soil:'normal'});assert.equal(s.cash,cash);
});
test('旧存档补齐土地与种子字段，保留成熟时间及资产，老作物可正常收获',()=>{
  const old=initialState();delete old.plotSoils;delete old.inventory.moonSeed;delete old.inventory.fireHerb;
  old.plots[0]={planted:1,ready:3};old.day=3;old.cash=1234;old.inventory.herb=7;
  const s=restoreState(old);assert.equal(s.cash,1234);assert.equal(s.inventory.herb,7);assert.equal(s.inventory.moonSeed,0);assert.equal(s.inventory.fireHerb,0);
  assert.deepEqual(s.plotSoils,['normal','normal','normal','normal']);assert.equal(s.plots[0].ready,3);
  assert.equal(transition(s,'harvest',{index:0}).inventory.herb,10);assert.equal(old.plotSoils,undefined);
});
test('新增草药按售价抵债，土地和未收获作物不能代替库存',()=>{
  const s=initialState();s.cash=0;s.debt=100;s.inventory.fireHerb=1;
  collectDebt(s);assert.equal(s.debt,0);assert.equal(s.cash,549);assert.equal(s.inventory.fireHerb,0);
  const t=initialState();t.cash=0;t.plotSoils[0]='spirit';t.plots[0]={crop:'moon',planted:1,ready:4};collectDebt(t);assert.equal(t.failed,true);assert.equal(t.plotSoils[0],'spirit');
});
