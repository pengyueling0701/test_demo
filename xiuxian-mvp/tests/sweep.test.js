import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState,transition,restoreState,advance } from '../src/game.js';
import { DUNGEONS,sweepAvailable,sweepLoot } from '../src/dungeons.js';

test('未通关不能扫荡，通关后仅一次，使用后完整七日恢复且不累积',()=>{
  let s=initialState();s.realm=1;
  assert.throws(()=>transition(s,'sweep',{dungeonId:'qinglan'}));
  s.clearedDungeons=['qinglan'];const day=s.day;
  s=transition(s,'sweep',{dungeonId:'qinglan'});assert.equal(s.day,day);assert.equal(s.inventory.core,1);
  assert.throws(()=>transition(s,'sweep',{dungeonId:'qinglan'}));advance(s,6);assert.equal(sweepAvailable(s,'qinglan'),false);
  advance(s,1);assert.equal(sweepAvailable(s,'qinglan'),true);advance(s,4);
  s=transition(s,'sweep',{dungeonId:'qinglan'});assert.throws(()=>transition(s,'sweep',{dungeonId:'qinglan'}));
});
test('每境独立计时，重复通关不重置冷却，读档保留状态',()=>{
  let s=initialState();s.realm=2;s.clearedDungeons=['qinglan','creek'];s.selectedDungeon='qinglan';
  s=transition(s,'sweep',{dungeonId:'qinglan'});assert.equal(sweepAvailable(s,'creek'),true);
  s=transition(s,'return',{hp:100,mana:60,toxin:0,heal:0,bossDefeated:true,loot:{}});assert.equal(s.sweepReadyDays.qinglan,8);
  s=restoreState(s);assert.equal(sweepAvailable(s,'qinglan'),false);assert.equal(sweepAvailable(s,'creek'),true);
});
test('满包扫荡扣一次精力与次数，放不下的战利品保留待领',()=>{let s=initialState();s.clearedDungeons=['qinglan'];s.inventory.herb=999*9;const loot=sweepLoot(DUNGEONS[0]);s=transition(s,'sweep',{dungeonId:'qinglan'});assert.equal(s.energy,70);assert.equal(s.sweepReadyDays.qinglan,8);for(const [id,n] of Object.entries(loot))assert.equal(s.pendingLoot[id],n);s=transition(s,'sell',{item:'herb',qty:999*5});s=transition(s,'claim-loot');for(const [id]of Object.entries(loot))assert.equal(s.pendingLoot[id],0);});
