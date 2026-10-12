import test from 'node:test';
import assert from 'node:assert/strict';
import { DUNGEONS, dungeonUnlocked, dungeonLabel } from '../src/dungeons.js';
import { initialState, transition, REALMS } from '../src/game.js';

test('恰好十个秘境，ID唯一，每个门槛按境界和小等级判断',()=>{
  assert.equal(DUNGEONS.length,10);assert.equal(new Set(DUNGEONS.map(d=>d.id)).size,10);
  for(const d of DUNGEONS){
    assert.equal(dungeonUnlocked({realm:d.realm,level:d.level-1},d),false);
    assert.equal(dungeonUnlocked({realm:d.realm,level:d.level},d),true);
    assert.equal(dungeonUnlocked({realm:d.realm-1,level:10},d),false);
    assert.equal(dungeonUnlocked({realm:d.realm+1,level:1},d),true);
  }
  assert.deepEqual(REALMS,['炼气','筑基','金丹','元婴']);
  assert.deepEqual(DUNGEONS.map(d=>[d.realm,d.level]),[[1,1],[1,4],[1,7],[1,10],[2,1],[2,5],[2,10],[3,1],[3,5],[3,10]]);
  assert.equal(dungeonLabel(DUNGEONS.at(-1)),'元婴10级');
});
test('直接请求进入锁定秘境也被拒绝，不扣日期或资金',()=>{
  const s=initialState();s.realm=1;s.level=1;
  for(const d of DUNGEONS.slice(1))assert.throws(()=>transition(s,'expedition',{dungeonId:d.id}));
  assert.throws(()=>transition(s,'expedition',{dungeonId:'missing'}));assert.equal(s.day,1);assert.equal(s.cash,500);
});
test('进入选定秘境并分别记录通关，不影响旧存档的御风步',()=>{
  let s=initialState();s.realm=3;s.level=10;s.doubleJump=true;
  for(const d of DUNGEONS){
    s=transition(s,'expedition',{dungeonId:d.id});assert.equal(s.selectedDungeon,d.id);
    s=transition(s,'return',{hp:100,mana:60,toxin:0,heal:0,loot:{},bossDefeated:true,defeated:false});
    assert.ok(s.clearedDungeons.includes(d.id));assert.equal(s.doubleJump,true);
  }
  assert.equal(s.clearedDungeons.length,10);
});
