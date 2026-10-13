import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialState,transition,tickProduction,restoreState,ITEMS,maxHP} from '../src/game.js';
import {idleRate} from '../src/idle.js';
import {cultivationRequired} from '../src/cultivation.js';
import {economyTotals} from '../src/chapter.js';
import {startBattle} from '../src/battle.js';
let now=1700000000000,s=initialState(now),seed=42;const nodes=[];
const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const act=(action,payload={})=>s=transition(s,action,payload,rng,now);
const wait=ms=>{now+=ms;tickProduction(s,now);};
const claimQuest=id=>{if(s.tutorial.completed.includes(id)&&!s.tutorial.claimed.includes(id))act('claim-quest',{id});};
const finishBrew=(item,qty=1)=>{act('brew',{item,qty});const q=s.production.queue;wait(q.units.length*q.durationMs);act('claim-production',{kind:'all'});claimQuest('brew');};
act('plant-all');claimQuest('plant');wait(60000);act('claim-production',{kind:'all'});claimQuest('harvest');
nodes.push({minute:1,event:'首批灵草与挂机收益已领取',herbs:s.inventory.herb,cash:s.cash,xp:s.cultivation});
act('order',{id:s.orders[0].id});claimQuest('order');act('buy',{item:'ore',qty:2});act('furnace');claimQuest('furnace');
nodes.push({minute:(now-1700000000000)/60000,event:'青铜丹炉升级',cash:s.cash});
for(let round=0;round<24&&!(s.level===10&&s.cultivation>=cultivationRequired(s));round++){
 if(round)wait(20*60000);s=restoreState(s,now);act('claim-production',{kind:'all'});
 if(s.inventory.herb>24)act('sell',{item:'herb',qty:s.inventory.herb-24});
 const qty=Math.min(6,Math.floor(s.inventory.herb/3));if(qty)finishBrew('spirit',qty);
 while(s.inventory.spirit){if(s.toxin>=80)act('rest');act('consume',{item:'spirit'});}if(round===0)nodes.push({minute:Math.round((now-1700000000000)/60000),event:'首批修炼丹带来第一个小等级成长',level:s.level,cultivation:s.cultivation});
}
assert.equal(s.level,10);assert.ok(s.cultivation>=cultivationRequired(s));
if(s.inventory.herb>12)act('sell',{item:'herb',qty:s.inventory.herb-12});
for(let attempt=0;attempt<10&&!s.inventory.foundationPill;attempt++){
 if(s.inventory.herb<4)act('buy',{item:'herb',qty:4-s.inventory.herb});act('buy',{item:'moon'});finishBrew('foundationPill');
}
assert.ok(s.inventory.foundationPill);act('breakthrough');claimQuest('realm');
nodes.push({minute:Math.round((now-1700000000000)/60000),event:'自炼筑基丹完成筑基',cash:s.cash,level:s.level,alchemyXP:s.alchemyXP});
act('buy-weapon',{item:'spirit'});act('weapon',{item:'spirit'});act('buy-equipment',{item:'robe'});act('equip',{item:'robe'});
act('buy',{item:'book_wood'});act('use-skillbook',{item:'book_wood'});act('toggle-skill',{item:'wood'});claimQuest('skill');
if(s.inventory.herb<8)act('buy',{item:'herb',qty:8-s.inventory.herb});finishBrew('heal',4);
while(s.toxin>0)act('rest');act('rest');
if(s.inventory.herb>4)act('sell',{item:'herb',qty:s.inventory.herb-4});
act('expedition',{dungeonId:'qinglan'});
// Real battle rules and input controls; canvas and frame timing are simulated, not a phone test.
const originals={window:globalThis.window,raf:globalThis.requestAnimationFrame,cancel:globalThis.cancelAnimationFrame};
let callback,result,frameTime=performance.now(),frames=0;
const ctx=new Proxy({}, {get(_target,key){return key==='createLinearGradient'?()=>({addColorStop(){}}):()=>{};},set(){return true;}});
globalThis.window={addEventListener(){},removeEventListener(){}};globalThis.requestAnimationFrame=fn=>{callback=fn;return 1;};globalThis.cancelAnimationFrame=()=>callback=null;
const engine=startBattle({getContext:()=>ctx},s,r=>result=r,()=>{});
const step=n=>{for(let i=0;i<n&&callback;i++){frameTime+=16;frames++;const fn=callback;callback=null;fn(frameTime);}};
try{
 for(let turn=0;turn<400&&engine.snapshot().completedStage<3&&!result;turn++){
  const snap=engine.snapshot(),target=snap.enemies.find((m,i)=>m.hp>0&&(i<5||m.boss));if(!target)break;
  if(snap.hp<110){engine.press('heal');engine.release('heal');}
  const right=target.x>snap.x;engine.press(right?'right':'left');engine.release(right?'left':'right');step(12);
  engine.press('skill-metal');engine.release('skill-metal');engine.press('attack');engine.release('attack');step(24);
 }
 assert.equal(engine.snapshot().completedStage,3);engine.retreat();
}finally{engine.dispose();globalThis.window=originals.window;globalThis.requestAnimationFrame=originals.raf;globalThis.cancelAnimationFrame=originals.cancel;}
now+=frames*16;act('return',result);claimQuest('wind');claimQuest('boss');
const combat={seconds:Math.round(frames*.016),remainingHP:Math.round(result.hp),remainingMana:Math.round(result.mana),consumedPills:s.lastExpedition.usedPills,stage:s.dungeonStages.qinglan,bossDefeated:result.bossDefeated};
nodes.push({minute:Math.round((now-1700000000000)/60000),event:'真实战斗逻辑通关青岚三关',...combat,rate:idleRate(s)});
assert.ok(s.journey.chapterComplete);assert.equal(s.debt,0);assert.equal(s.failed,false);
const beforeCash=s.cash;wait(3600000);s=restoreState(s,now);act('claim-production',{kind:'all'});
const report={method:'固定随机种子42、控制现实时间的规则完整流程；动作战斗运行实际引擎与操作输入，画布与帧时间模拟；另做390×844触屏浏览器检查，非真机验证',version:'0.17.0',elapsedRealMinutes:Math.round((now-1700000000000)/60000),gameDay:s.day,nodes,combat,ledger:economyTotals(s.economy.entries),final:{cash:s.cash,realm:s.realm,level:s.level,cultivation:s.cultivation,alchemyXP:s.alchemyXP,chapterComplete:s.journey.chapterComplete,rate:idleRate(s),postClearHourCash:s.cash-beforeCash},pendingFarm:s.plots.map(p=>p?.buffer??0)};
fs.writeFileSync('release/continuous-playthrough-v0.17.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
