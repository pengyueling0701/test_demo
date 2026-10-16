import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,transition,restoreState,ITEMS} from '../src/game.js';
import {ELEMENTS,SKILLS} from '../src/elements.js';
test('五灵根可学五系，携带四种上限，卸下后换装',()=>{
 let s=initialState();s.cash=5000;s=transition(s,'buy',{item:'book_metal'});s=transition(s,'learn-skill',{item:'metal'});s=transition(s,'toggle-skill',{item:'metal'});for(const id of ['wood','water','fire','earth']){s=transition(s,'buy',{item:'book_'+id});s=transition(s,'learn-skill',{item:id});}
 for(const id of ['wood','water','fire'])s=transition(s,'toggle-skill',{item:id});
 assert.throws(()=>transition(s,'toggle-skill',{item:'earth'}));s=transition(s,'toggle-skill',{item:'metal'});s=transition(s,'toggle-skill',{item:'earth'});assert.equal(s.skillLoadout.length,4);assert.equal(s.learnedSkills.length,5);
 assert.deepEqual(restoreState({ ...initialState(),learnedSkills:undefined,skillLoadout:undefined }).skillLoadout,[]);
});
test('回灵丹恢复法力并累加丹毒，满蓝及满毒不消耗',()=>{
 let s=initialState();s.inventory.manaPill=2;assert.throws(()=>transition(s,'consume',{item:'manaPill'}));s.mana=0;
 s=transition(s,'consume',{item:'manaPill'});assert.equal(s.mana,40);assert.equal(s.toxin,18);assert.equal(s.inventory.manaPill,1);
 s.toxin=100;assert.throws(()=>transition(s,'consume',{item:'manaPill'}));
 assert.ok(Object.values(ITEMS).every(i=>ELEMENTS[i.element]));assert.ok(Object.values(SKILLS).every(i=>i.mana>0));
});
import {COUNTERS,skillDamage,dungeonElement} from '../src/elements.js';
import {DUNGEONS} from '../src/dungeons.js';
test('五行克制全部方向精确双倍，其余关系正常伤害',()=>{
 for(const from of Object.keys(ELEMENTS))for(const to of Object.keys(ELEMENTS)){
 const skill={element:from,power:1.8};assert.equal(skillDamage(36,skill,to),COUNTERS[from]===to?72:36);
 }
 assert.deepEqual(COUNTERS,{earth:'water',water:'fire',fire:'metal',metal:'wood',wood:'earth'});
 assert.ok(DUNGEONS.every(d=>ELEMENTS[dungeonElement(d)]));
});
test('新人物无任何已学或携带技能，购书研读后才能携带，读档不自动发技能',()=>{let s=initialState();assert.deepEqual(s.learnedSkills,[]);assert.deepEqual(s.skillLoadout,[]);assert.deepEqual(s.skillGrades,{});assert.deepEqual(restoreState(s).learnedSkills,[]);assert.throws(()=>transition(s,'toggle-skill',{item:'metal'}));s=transition(s,'buy',{item:'book_metal'});s=transition(s,'use-skillbook',{item:'book_metal'});assert.deepEqual(s.learnedSkills,['metal']);assert.deepEqual(s.skillLoadout,[]);s=transition(s,'toggle-skill',{item:'metal'});assert.deepEqual(s.skillLoadout,['metal']);});
