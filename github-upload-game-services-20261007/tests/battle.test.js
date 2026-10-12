import test from 'node:test';
import assert from 'node:assert/strict';
import { startBattle } from '../src/battle.js';
import { initialState, maxHP } from '../src/game.js';

// Exercise the actual frame loop and controls with a deterministic canvas and clock.
function harness(state, dungeon) {
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
  const engine=startBattle({getContext:()=>context},state,r=>result=r,h=>hud=h,dungeon,e=>feedback.push(e));
  return {
    engine, feedback, get hud(){return hud;}, get result(){return result;},
    step(frames){for(let i=0;i<frames && callback;i++){now+=16;const fn=callback;callback=null;fn(now);}},
    rects,
    emit(type){listeners.get(type)?.();},
    cleanup(){engine.dispose();if(originals.window===undefined)delete globalThis.window;else globalThis.window=originals.window;globalThis.requestAnimationFrame=originals.raf;globalThis.cancelAnimationFrame=originals.cancel;},
  };
}
test('真实战斗循环可绘制、移动、释放按键、技能耗灵与撤离',()=>{
  const s=initialState();s.realm=1;s.hp=140;s.mana=90;
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
test('单跳可以登上80高平台；探索石碑解锁二段跳',()=>{
  const s=initialState();s.realm=2;s.hp=maxHP(s);s.armor=true;s.weapon='spirit';
  const h=harness(s);
  try{
    h.step(8);h.engine.press('right');h.step(46);h.engine.press('jump');h.step(26);
    assert.ok(h.engine.snapshot().y+48<330,'single jump exceeds the first platform height');
    for(let i=0;i<180&&!h.result;i++){if(i%20===0)h.engine.press('jump');if(i%21===0)h.engine.press('dodge');if(i%20===0)h.engine.press('attack');h.step(2);}
    h.engine.release('right');if(!h.result)h.engine.retreat();assert.equal(h.result.doubleJump,true);
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
 const s=initialState();s.realm=1;s.mana=10;s.inventory.manaPill=2;
 const h=harness(s);try{
 h.engine.press('skill-fire');h.step(10);assert.equal(h.hud.mana,10);
 h.engine.press('mana');h.step(10);assert.equal(h.hud.mana,50);assert.equal(h.hud.toxin,18);
 h.engine.press('skill-metal');h.step(10);assert.equal(h.hud.mana,38);
 h.engine.retreat();assert.equal(h.result.healingStock.manaPill,1);
 }finally{h.cleanup();}
});

test('独立命中反馈标识克制，连续点击冷却不重复伤害，战斗提示可关闭',()=>{const s=initialState();s.realm=1;s.hp=140;s.mana=90;const h=harness(s);try{h.step(8);assert.ok(h.hud.hint);h.engine.setHints(false);h.engine.press('right');h.step(50);h.engine.release('right');h.engine.press('skill-metal');h.step(8);assert.ok(h.feedback.some(e=>e.type==='skill'));assert.ok(h.feedback.some(e=>e.type==='damage'&&e.counter));const hp=h.engine.snapshot().enemyHP[0],mana=h.hud.mana;h.engine.press('skill-metal');h.step(8);assert.equal(h.engine.snapshot().enemyHP[0],hp);assert.equal(h.hud.mana,mana);assert.equal(h.hud.hint,'');}finally{h.cleanup();}});
