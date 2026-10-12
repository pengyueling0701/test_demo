import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,transition as gameTransition,ITEMS,RECIPES} from '../src/game.js';
const transition=(s,a,p)=>gameTransition(s,a,p,()=>0);
test('生产品六档，仙草内丹五档，材料不可当丹药服用',()=>{
 for(const base of ['seed','ore','book_fire','manaPill'])assert.deepEqual([...new Set(Object.entries(ITEMS).filter(([id,i])=>id===base||i.baseItem===base).map(([,i])=>i.grade))].sort(),[0,1,2,3,4,5]);
 for(const base of ['herb','moon','fireHerb','frostHerb','core'])assert.deepEqual(Object.entries(ITEMS).filter(([id,i])=>id===base||i.baseItem===base).map(([,i])=>i.grade).sort(),[1,2,3,4,5]);
 const s=initialState();s.inventory.herb=3;assert.throws(()=>transition(s,'consume',{item:'herb'}));
});
test('购书再研读，消耗书籍，高品质可提升技能，重复不消耗',()=>{
 let s=initialState();s.cash=10000;s.realm=2;assert.throws(()=>transition(s,'learn-skill',{item:'fire'}));
 s=transition(s,'buy',{item:'book_fire_q3'});assert.ok(!s.learnedSkills.includes('fire'));
 s=transition(s,'use-skillbook',{item:'book_fire_q3'});assert.equal(s.inventory.book_fire_q3,0);assert.equal(s.skillGrades.fire,3);
 s.inventory.book_fire=1;assert.throws(()=>transition(s,'use-skillbook',{item:'book_fire'}));assert.equal(s.inventory.book_fire,1);
});
test('高品质种子可播种收获同阶仙草，高阶材料可炼丹',()=>{
 let s=initialState();s.inventory.seed=0;s.inventory.seed_q3=1;
 s=transition(s,'plant',{index:0});assert.equal(s.inventory.seed_q3,0);s.day+=2;s=transition(s,'harvest',{index:0});assert.equal(s.inventory.herb_q3,3);
 s=transition(s,'brew',{item:'heal'});assert.equal(s.inventory.herb_q3,1);assert.equal(s.inventory.heal,1);
 assert.ok(Object.entries(RECIPES).every(([id,r])=>ITEMS[id].pill&&r.furnace===ITEMS[id].grade));
});
