import {DUNGEONS} from '../src/dungeons.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { startBattle } from '../src/battle.js';
import { initialState, maxHP } from '../src/game.js';
import {WEAPONS} from '../src/game.js';

// Exercise the actual frame loop and controls with a deterministic canvas and clock.
function harness(state, dungeon, random=()=>.99) {
  const originals = { window:globalThis.window, raf:globalThis.requestAnimationFrame, cancel:globalThis.cancelAnimationFrame };
  const feedback=[];let callback, hud, result, now=performance.now();
  const rects=[];
  const listeners=new Map();
  const context=new Proxy({}, {get(_target,key){
    if(key==='createLinearGradient')return()=>({addColorStop(){}});
    if(key==='fillRect')return(...args)=>rects.push(args);
    return()=>{};
  },set(){return true;}});
  globalThis.window={addEventListener(type,fn){listeners.set(type,fn);},removeEventListener(type){listeners.delete(type);}};
  globalThis.requestAnimationFrame=fn=>{callback=fn;return 1;};
  globalThis.cancelAnimationFrame=()=>{callback=null;};
  const engine=startBattle({getContext:()=>context},state,r=>result=r,h=>hud=h,dungeon,e=>feedback.push(e),random);
  return {
    engine, feedback, get hud(){return hud;}, get result(){return result;},
    step(frames){for(let i=0;i<frames && callback;i++){now+=16;const fn=callback;callback=null;fn(now);}},
    rects,
    emit(type){listeners.get(type)?.();},
    cleanup(){engine.dispose();if(originals.window===undefined)delete globalThis.window;else globalThis.window=originals.window;globalThis.requestAnimationFrame=originals.raf;globalThis.cancelAnimationFrame=originals.cancel;},
  };
}
test('真实战斗循环可绘制、移动、释放按键、技能耗灵与撤离',()=>{
  const s=initialState();s.learnedSkills=['metal'];s.skillLoadout=['metal'];s.realm=1;s.hp=140;s.mana=90;
  const h=harness(s);
  try{
    h.step(10);assert.equal(h.hud.hp,140);assert.ok(h.rects.length>0);
    h.engine.press('skill');h.step(10);assert.equal(h.hud.mana,78);
    h.engine.press('right');h.step(20);h.engine.release('right');
    h.engine.retreat();assert.ok(h.result);assert.equal(h.result.defeated,false);assert.equal(h.result.mana,78);
    const result=h.result;h.engine.retreat();assert.equal(h.result,result);
  }finally{h.cleanup();}
});

test('竖屏镜头限定420逻辑宽度并跟随主角，横转时暂停战斗',()=>{
  const s=initialState();s.realm=2;s.hp=maxHP(s);s.armor=true;
  const h=harness(s);
  try{
    assert.equal(h.engine.snapshot().viewWidth,420);
    h.engine.press('right');h.step(75);assert.ok(h.engine.snapshot().camera>0);
    const x=h.engine.snapshot().x;
    window.innerWidth=844;window.innerHeight=390;h.emit('resize');h.step(90);
    assert.equal(h.engine.snapshot().paused,true);assert.equal(h.engine.snapshot().x,x);
    window.innerWidth=390;window.innerHeight=844;h.emit('resize');h.engine.press('right');h.step(10);
    assert.equal(h.engine.snapshot().paused,false);assert.ok(h.engine.snapshot().x>x);
  }finally{h.cleanup();}
});
test('战斗回春丹按丹毒衰减，满毒不扣丹药，撤离保持资源',()=>{
  const s=initialState();s.realm=1;s.hp=40;s.inventory.heal=3;s.toxin=82;
  const h=harness(s);
  try{
    h.engine.press('heal');h.step(10);assert.equal(h.hud.hp,57);assert.equal(h.hud.toxin,100);assert.equal(h.hud.heal,2);
    h.engine.press('heal');h.step(10);assert.equal(h.hud.heal,2);
    h.engine.retreat();assert.equal(h.result.heal,2);assert.equal(h.result.toxin,100);
  }finally{h.cleanup();}
});
test('被妖兽击败自动结算，无法重复发放掉落',()=>{
  const s=initialState();s.realm=1;s.hp=1;
  const h=harness(s);
  try{
    h.engine.press('right');h.step(70);h.engine.release('right');h.step(200);assert.equal(h.result.defeated,true);assert.equal(h.result.hp,0);
    const result=h.result;h.engine.retreat();assert.equal(h.result,result);
  }finally{h.cleanup();}
});
test('单跳可以登上80高平台；探索古碑不再解锁二段跳',()=>{
  const s=initialState();s.realm=2;s.hp=maxHP(s);s.armor=true;s.weapon='spirit';
  const h=harness(s);
  try{
    h.step(8);h.engine.press('right');h.step(46);h.engine.press('jump');h.step(26);
    assert.ok(h.engine.snapshot().y+48<330,'single jump exceeds the first platform height');
    for(let i=0;i<180&&!h.result;i++){if(i%20===0)h.engine.press('jump');if(i%21===0)h.engine.press('dodge');if(i%20===0)h.engine.press('attack');h.step(2);}
    h.engine.release('right');if(!h.result)h.engine.retreat();assert.equal(h.result.doubleJump,false);assert.equal(h.result.exploredStele,true);
  }finally{h.cleanup();}
});

test('战斗高品质回血丹用尽切换低品质，返程保留各库存',()=>{
 const s=initialState();s.realm=2;s.hp=1;s.inventory.heal1=1;s.inventory.heal=2;
 const h=harness(s);try{
 h.engine.press('heal');h.step(10);assert.equal(h.hud.healItem,'heal');assert.equal(h.hud.heal,2);
 h.engine.retreat();assert.equal(h.result.healingStock.heal1,0);assert.equal(h.result.healingStock.heal,2);
 }finally{h.cleanup();}
});

test('秘境禁止未携带技能，回灵丹恢复法力并结算库存',()=>{
 const s=initialState();s.learnedSkills=['metal'];s.skillLoadout=['metal'];s.realm=1;s.mana=10;s.inventory.manaPill=2;
 const h=harness(s);try{
 h.engine.press('skill-fire');h.step(10);assert.equal(h.hud.mana,10);
 h.engine.press('mana');h.step(10);assert.equal(h.hud.mana,50);assert.equal(h.hud.toxin,18);
 h.engine.press('skill-metal');h.step(10);assert.equal(h.hud.mana,38);
 h.engine.retreat();assert.equal(h.result.healingStock.manaPill,1);
 }finally{h.cleanup();}
});

test('独立命中反馈标识克制，连续点击冷却不重复伤害，战斗提示可关闭',()=>{const s=initialState();s.learnedSkills=['metal'];s.skillLoadout=['metal'];s.realm=1;s.hp=140;s.mana=90;const h=harness(s);try{h.step(8);assert.ok(h.hud.hint);h.engine.setHints(false);h.engine.press('right');h.step(50);h.engine.release('right');h.engine.press('skill-metal');h.step(8);assert.ok(h.feedback.some(e=>e.type==='skill'));assert.ok(h.feedback.some(e=>e.type==='damage'&&e.counter));const hp=h.engine.snapshot().enemyHP[0],mana=h.hud.mana;h.engine.press('skill-metal');h.step(8);assert.equal(h.engine.snapshot().enemyHP[0],hp);assert.equal(h.hud.mana,mana);assert.equal(h.hud.hint,'');}finally{h.cleanup();}});

test('青岚关卡由击败指定妖兽触发，越过区域不能通关，重试从检查点开始',()=>{
 const s=initialState();s.realm=1;s.hp=100000;let h=harness(s);
 try{h.engine.press('right');h.step(1000);h.engine.release('right');assert.equal(h.engine.snapshot().completedStage,0);h.engine.retreat();assert.equal(h.result.completedStage,0);}finally{h.cleanup();}
 s.dungeonStages.qinglan=2;h=harness(s);try{const snap=h.engine.snapshot();assert.equal(snap.x,1970);assert.equal(snap.completedStage,2);assert.ok(snap.enemyHP.slice(0,5).every(n=>n===0));h.engine.retreat();assert.equal(h.result.completedStage,2);}finally{h.cleanup();}
});
test('青岚击败外围与腹地妖兽推进两关，首领通关保持真实攻击结算',()=>{
 const s=initialState();s.realm=3;s.hp=100000;s.mana=100000;const old=WEAPONS.wood.attack;WEAPONS.wood.attack=10000;const h=harness(s);
 try{
  for(let turn=0;turn<220&&h.engine.snapshot().completedStage<3;turn++){
   const snap=h.engine.snapshot(),target=snap.enemies.find((m,i)=>m.hp>0&&(i<5||m.boss));if(!target)break;
   const right=target.x>snap.x;h.engine.press(right?'right':'left');h.engine.release(right?'left':'right');h.step(12);
   h.engine.press('attack');h.engine.release('attack');h.step(12);
  }
  assert.equal(h.engine.snapshot().completedStage,3);h.engine.retreat();assert.equal(h.result.bossDefeated,true);assert.equal(h.result.completedStage,3);
 }finally{h.cleanup();WEAPONS.wood.attack=old;}
});

test('筑基基础备战可通关青岚三关，保留血量法力与丹药结算',()=>{
 const s=initialState();s.realm=1;s.weapon='spirit';s.weapons.push('spirit');s.equipped.body='robe';s.hp=maxHP(s);s.mana=90;s.inventory.heal=4;const h=harness(s);
 try{
  for(let turn=0;turn<400&&h.engine.snapshot().completedStage<3&&!h.result;turn++){
   const snap=h.engine.snapshot(),target=snap.enemies.find((m,i)=>m.hp>0&&(i<5||m.boss));if(!target)break;
   if(snap.hp<110){h.engine.press('heal');h.engine.release('heal');}
   const right=target.x>snap.x;h.engine.press(right?'right':'left');h.engine.release(right?'left':'right');h.step(12);
   h.engine.press('skill-metal');h.engine.release('skill-metal');h.engine.press('attack');h.engine.release('attack');h.step(24);
  }
  assert.equal(h.engine.snapshot().completedStage,3);assert.ok(h.engine.snapshot().hp>0);h.engine.retreat();assert.equal(h.result.defeated,false);assert.equal(h.result.bossDefeated,true);
 }finally{h.cleanup();}
});

test('十个秘境都可从腹地检查点重试，击败首领后完成第三关',()=>{
 const old=WEAPONS.wood.attack;WEAPONS.wood.attack=10000;
 try{for(const dungeon of DUNGEONS){const s=initialState();s.realm=3;s.hp=10000;s.dungeonStages[dungeon.id]=2;const h=harness(s,dungeon);try{assert.equal(h.engine.snapshot().completedStage,2,dungeon.id);assert.equal(h.engine.snapshot().x,1970);h.engine.press('right');h.step(40);h.engine.release('right');h.engine.press('attack');h.engine.release('attack');h.step(12);assert.equal(h.engine.snapshot().completedStage,3,dungeon.id);h.engine.retreat();assert.equal(h.result.bossDefeated,true);}finally{h.cleanup();}}}finally{WEAPONS.wood.attack=old;}
});

test('横版战斗中增益丹生效，不重复消耗，返程库存计入结算',()=>{const s=initialState();s.realm=1;s.hp=140;s.inventory.guardPill=2;const h=harness(s);try{h.engine.press('buff-defense');h.engine.release('buff-defense');h.step(10);assert.match(h.hud.buffs,/防御\+4/);assert.equal(h.hud.toxin,12);h.engine.press('buff-defense');h.engine.release('buff-defense');h.step(10);assert.equal(h.hud.toxin,12);h.engine.retreat();assert.equal(h.result.healingStock.guardPill,1);assert.deepEqual(s.temporaryBuffs,{});}finally{h.cleanup();}});

test('横版秘境灵兽可切换防御承伤，攻击状态以属性技能协战',()=>{const s=initialState();s.realm=1;s.hp=140;s.pets=[{id:'pet-1',name:'火灵狼',element:'fire',maxHP:100,skillDamage:18,defense:3,sprite:1}];s.selectedPet='pet-1';const h=harness(s,DUNGEONS[1],()=>0);try{h.engine.press('pet-stance');h.engine.press('right');h.step(70);h.engine.release('right');h.step(70);const before=h.engine.snapshot();assert.equal(before.pet.stance,'defend');assert.ok(before.pet.hp<100&&before.pet.hp>0);assert.equal(before.hp,140);h.engine.press('pet-stance');h.step(15);assert.equal(h.engine.snapshot().pet.stance,'attack');assert.ok(h.engine.snapshot().enemyHP.some((hp,i)=>hp<before.enemyHP[i]));h.engine.retreat();assert.equal(s.pets.length,1);}finally{h.cleanup();}});
test('横版低血妖兽可驯服，御兽丹准确结算且不重复发击杀资源',()=>{const s=initialState();s.inventory.tamePill=1;let roll=.99;const h=harness(s,undefined,()=>roll);try{h.step(10);h.engine.press('right');h.step(50);h.engine.release('right');for(let i=0;i<15&&h.engine.snapshot().enemyHP[0]>13.5;i++){h.engine.press('attack');h.step(20);}assert.ok(h.engine.snapshot().enemyHP[0]>0&&h.engine.snapshot().enemyHP[0]<=13.5);roll=0;h.engine.press('tame');assert.equal(s.pets.length,1);assert.equal(s.inventory.tamePill,0);h.engine.retreat();assert.equal(h.result.usedTame.tamePill,1);assert.equal(h.result.healingStock.tamePill,0);assert.equal(h.result.loot.hide,0);}finally{h.cleanup();}});
