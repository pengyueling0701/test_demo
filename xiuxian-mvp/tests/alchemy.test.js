import {completedTransition as transition,harvestReady} from './helpers.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,transition as unusedTransition,restoreState,RECIPES} from '../src/game.js';
import {alchemyLevel,brewChance,cultivationStrength} from '../src/alchemy.js';
import {cultivationRequired} from '../src/cultivation.js';
test('修为与炼丹等级提高成功率，高品质降低概率，突破不降低修为强度',()=>{
 const s=initialState(),chance=brewChance(s,1);s.cultivation=40;assert.ok(brewChance(s,1)>chance);s.level++;assert.ok(brewChance(s,1)>chance);
 s.alchemyXP=100;assert.equal(alchemyLevel(s),2);assert.ok(brewChance(s,1)>chance);assert.ok(brewChance(s,5)<brewChance(s,0));
 s.level=10;s.cultivation=cultivationRequired(s);s.inventory.foundationPill=1;const n=transition(s,'breakthrough');assert.ok(cultivationStrength(n)>=cultivationStrength(s));
 s.alchemyXP=9000;assert.equal(alchemyLevel(s),10);assert.equal(brewChance(s,0),100);
});
test('炼丹成功失败均消耗资源，仅成功增加经验，概率边界不多发丹药',()=>{
 const s=initialState();s.inventory.herb=4;const chance=brewChance(s,0);
 const success=transition(s,'brew',{item:'heal'},()=>(chance-.1)/100),failure=transition(s,'brew',{item:'heal'},()=>chance/100);
 assert.equal(success.inventory.heal,1);assert.equal(failure.inventory.heal,0);assert.equal(success.alchemyXP,10);assert.equal(failure.alchemyXP,0);
 for(const n of [success,failure]){assert.equal(n.cash,500);assert.equal(n.inventory.herb,2);assert.equal(n.energy,100);}
 assert.equal(s.cash,500);assert.equal(s.inventory.herb,4);
 s.alchemyXP=97;assert.equal(alchemyLevel(transition(s,'brew',{item:'heal'},()=>.999)),1);assert.equal(alchemyLevel(transition(s,'brew',{item:'heal'},()=>0)),2);
});
test('旧炼丹次数换算经验，读档保留新等级',()=>{
 const old=initialState();delete old.alchemyXP;old.alchemy=25;const s=restoreState(old);assert.equal(s.alchemyXP,250);assert.equal(alchemyLevel(s),3);assert.equal(restoreState(s).alchemyXP,250);
});

test('零灵石仍可炼丹，成功失败均不改变资金与债务',()=>{const s=initialState();s.cash=0;s.inventory.herb=2;for(const roll of [0,.999]){const n=transition(s,'brew',{item:'heal'},()=>roll);assert.equal(n.cash,0);assert.equal(n.debt,s.debt);assert.equal(n.inventory.herb,0);}});

test('所有品质丹方均无需矿石，零矿石能炼制聚气丹',()=>{assert.ok(Object.values(RECIPES).every(r=>!Object.hasOwn(r.materials,'ore')));const s=initialState();s.furnace=1;s.inventory.herb=3;s.inventory.ore=0;const n=transition(s,'brew',{item:'spirit'},()=>0);assert.equal(n.inventory.spirit,1);assert.equal(n.inventory.ore,0);assert.equal(n.cash,s.cash);});
test('批量炼制预扣材料，按队列成丹且不消耗精力',()=>{const s=initialState();s.inventory.herb=6;const n=transition(s,'brew',{item:'heal',qty:3},()=>0);assert.equal(n.inventory.heal,3);assert.equal(n.inventory.herb,0);assert.equal(n.energy,100);assert.equal(n.alchemyXP,30);assert.equal(n.alchemy,3);assert.deepEqual([n.lastBrew.successes,n.lastBrew.failures,n.lastBrew.qty],[3,0,3]);});
test('批量炼制逐枚独立判定，失败材料作废且只为成功丹药增加经验',()=>{const s=initialState();s.inventory.herb=6;const rolls=[0,.999,0];const n=transition(s,'brew',{item:'heal',qty:3},()=>rolls.shift());assert.equal(n.inventory.heal,2);assert.equal(n.inventory.herb,0);assert.equal(n.energy,100);assert.equal(n.alchemyXP,20);assert.deepEqual([n.lastBrew.successes,n.lastBrew.failures],[2,1]);});
test('批次数量无效或材料不足不扣材料，生产不消耗精力',()=>{const s=initialState();s.inventory.herb=4;for(const qty of [0,-1,1.5,7])assert.throws(()=>transition(s,'brew',{item:'heal',qty},()=>0));assert.throws(()=>transition(s,'brew',{item:'heal',qty:3},()=>0));s.inventory.herb=8;s.energy=0;const n=transition(s,'brew',{item:'heal',qty:2},()=>0);assert.equal(n.energy,0);assert.equal(n.inventory.herb,4);assert.equal(s.inventory.herb,8);});
