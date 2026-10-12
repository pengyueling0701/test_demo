import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,transition,restoreState,makeOrders,collectDebt} from '../src/game.js';
import {QUESTS} from '../src/chapter.js';
import {updateJourney} from '../src/journey.js';
const result=(extra={})=>({hp:100,mana:60,toxin:0,healingStock:{},loot:{moonSeed:2,moon:4,core:2},bossDefeated:true,doubleJump:true,...extra});
test('青岚通关发现残卷，失败不解锁，凝露丹仅能自己炼，失败材料作废',()=>{
 let s=initialState();s.realm=1;s.furnace=1;s.inventory.herb=8;s.inventory.moon=4;assert.throws(()=>transition(s,'brew',{item:'dew'},()=>0));const defeated=transition(s,'return',result({defeated:true}));assert.equal(defeated.journey.dewRecipe,false);
 s=transition(s,'return',result());assert.equal(s.inventory.moonSeed,2);assert.equal(s.journey.dewRecipe,true);assert.ok(s.journey.available.includes('discovery'));assert.throws(()=>transition(s,'buy',{item:'dew'}));const oldXP=s.alchemyXP,herbs=s.inventory.herb,moon=s.inventory.moon;const failed=transition(s,'brew',{item:'dew'},()=>.999);assert.equal(failed.inventory.herb,herbs-2);assert.equal(failed.inventory.moon,moon-1);assert.equal(failed.alchemyXP,oldXP);assert.equal(failed.inventory.dew,0);s=transition(s,'brew',{item:'dew'},()=>0);assert.equal(s.inventory.dew,1);const before=s.cultivation;s=transition(s,'consume',{item:'dew'});assert.equal(s.cultivation,before+55);assert.equal(s.toxin,10);
});
test('秘境种子回到家园种植，收获可继续炼凝露丹并交付对应需求',()=>{
 let s=initialState();s.realm=1;s.furnace=1;s.cash=10000;s=transition(s,'return',result());s=transition(s,'house');s=transition(s,'soil',{index:0,soil:'spirit'});s=transition(s,'plant',{index:0,crop:'moon'});for(let i=0;i<3;i++)s=transition(s,'rest');s=transition(s,'harvest',{index:0});assert.ok(s.inventory.moon>=6);s.inventory.herb=4;for(let i=0;i<2;i++){s.energy=100;s=transition(s,'brew',{item:'dew'},()=>0);}s.orders=makeOrders(5,1,true);const o=s.orders.find(o=>o.item==='dew');const cash=s.cash;s=transition(s,'order',{id:o.id});assert.equal(s.cash,cash+o.reward);assert.equal(s.inventory.dew,0);
});
test('章节依据目标完成而非领奖，故事阅读不推进日期不发奖励，读档保存',()=>{
 let s=initialState();s.tutorial.completed=QUESTS.map(q=>q.id);updateJourney(s);assert.ok(s.journey.chapterComplete);assert.ok(s.journey.available.includes('chapter'));const cash=s.cash,day=s.day;s=transition(s,'read-story',{id:'chapter'});s=transition(s,'read-story',{id:'chapter'});assert.equal(s.cash,cash);assert.equal(s.day,day);assert.equal(s.journey.seen.filter(id=>id==='chapter').length,1);s=restoreState(s);assert.ok(s.journey.chapterComplete);assert.ok(s.journey.seen.includes('chapter'));
});
test('旧存档只推断残卷与章节状态，不补发种子，催收后库存与种子可支持下一轮',()=>{
 let s=initialState();delete s.journey;s.realm=1;s.clearedDungeons=['qinglan'];s.inventory.moonSeed=0;const oldCash=s.cash;s=restoreState(s);assert.ok(s.journey.dewRecipe);assert.equal(s.inventory.moonSeed,0);assert.equal(s.cash,oldCash);s.day=30;s.inventory.herb=2;s=transition(s,'rest');assert.equal(s.cash,0);assert.equal(s.failed,false);s=transition(s,'plant',{index:0});s=transition(s,'rest');s=transition(s,'rest');s=transition(s,'harvest',{index:0});s=transition(s,'sell',{item:'herb',qty:1});s=transition(s,'buy',{item:'seed',qty:2});assert.equal(s.cash,30);assert.ok(s.inventory.herb>=2);
});
