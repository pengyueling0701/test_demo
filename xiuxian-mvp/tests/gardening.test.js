import {completedTransition as transition,harvestReady} from './helpers.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState,transition as unusedTransition,restoreState,collectDebt } from '../src/game.js';
import { SOILS,CROPS,plotLimit,expansionPrice } from '../src/gardening.js';

test('开局九块普通药田，特殊药田按境界整页开放且不能重复扣款',()=>{let s=initialState();assert.equal(s.plots.length,9);assert.deepEqual(s.plotSoils,Array(9).fill('normal'));s.cash=10000;assert.throws(()=>transition(s,'unlock-garden',{soil:'spirit'}));for(const [realm,soil,price] of [[1,'spirit',800],[2,'fire',1400],[3,'frost',1800]]){s.realm=realm;const cash=s.cash;s=transition(s,'unlock-garden',{soil});assert.equal(s.plotSoils.filter(x=>x===soil).length,9);assert.equal(s.cash,cash-price);assert.throws(()=>transition(s,'unlock-garden',{soil}));}assert.equal(s.plots.length,36);});
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
    assert.equal(s.inventory[c.seed],1);assert.equal(s.plots[0].crop,id);assert.ok(s.plots[0].firstReadyAt>s.production.lastAt);
    assert.throws(()=>transition(s,'harvest',{index:0}));s=harvestReady(s);
    assert.equal(s.inventory[c.item],c.yield);assert.ok(s.plots[0].continuous);assert.equal(s.plotSoils[0],c.soils[0]);
  }
});
test('青灵草适应所有土地，改土不叠加收益，恢复普通地不退费用',()=>{
  let s=initialState();s.house=2;s.cash=10000;
  for(const key of Object.keys(SOILS)){
    if(s.plotSoils[0]!==key)s=transition(s,'soil',{index:0,soil:key});
    const cash=s.cash;assert.throws(()=>transition(s,'soil',{index:0,soil:key}));assert.equal(s.cash,cash);
    s=transition(s,'plant',{index:0});s=harvestReady(s);assert.equal(s.plotSoils[0],key);s=transition(s,'stop-plot',{index:0});
  }
  const cash=s.cash;s=transition(s,'soil',{index:0,soil:'normal'});assert.equal(s.cash,cash);
});
test('旧存档补齐土地与种子字段，保留成熟时间及资产，老作物可正常收获',()=>{
  const old=initialState();delete old.plotSoils;delete old.inventory.moonSeed;delete old.inventory.fireHerb;
  delete old.production;old.plots[0]={planted:1,ready:3};old.day=3;old.cash=1234;old.inventory.herb=7;
  const s=restoreState(old);assert.equal(s.cash,1234);assert.equal(s.inventory.herb,7);assert.equal(s.inventory.moonSeed,0);assert.equal(s.inventory.fireHerb,0);
  assert.deepEqual(s.plotSoils,Array(9).fill('normal'));assert.equal(s.plots[0].ready,3);
  assert.equal(transition(s,'harvest',{index:0}).inventory.herb,10);assert.equal(old.plotSoils,undefined);
});
test('取消催收后不扣除草药，低资金也可继续经营',()=>{const s=initialState();s.cash=0;s.inventory.fireHerb=1;collectDebt(s);assert.equal(s.cash,0);assert.equal(s.inventory.fireHerb,1);assert.equal(s.failed,false);assert.equal(s.nextCollection,null);});
