import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,transition,restoreState,tickProduction} from '../src/game.js';
import {idleRate,IDLE_CAP_MS,cropCycleMs} from '../src/idle.js';
import {cultivationRequired} from '../src/cultivation.js';
const start=1700000000000;
const act=(s,a,p={},now=s.production.lastAt,roll=()=>0)=>transition(s,a,p,roll,now);
test('在线分段和一次离线积累一致，现实时间不推进日历或刷新订单',()=>{
 let offline=act(initialState(start),'plant',{index:0}),online=structuredClone(offline);
 tickProduction(offline,start+3600000);for(let i=1;i<=60;i++)tickProduction(online,start+i*60000);
 assert.ok(Math.abs(online.production.xp-offline.production.xp)<1e-8);assert.ok(Math.abs(online.production.cash-offline.production.cash)<1e-8);assert.equal(online.plots[0].buffer,offline.plots[0].buffer);
 assert.equal(offline.day,1);assert.equal(offline.orders[0].id,'0-herb');assert.equal(offline.marketCycle,0);
});
test('24小时封顶、领取读档和重复领取不复制收益，时钟回拨无奖励',()=>{
 let s=initialState(start);tickProduction(s,start+IDLE_CAP_MS*2);assert.equal(s.production.xp,120*24);assert.equal(s.production.cash,60*24);
 s=act(s,'claim-production',{kind:'idle'});const cash=s.cash,xp=s.cultivation,level=s.level;s=restoreState(s,s.production.lastAt);s=act(s,'claim-production',{kind:'idle'});assert.equal(s.cash,cash);assert.equal(s.level,level);assert.equal(s.cultivation,xp);
 tickProduction(s,start);assert.equal(s.production.xp,0);assert.equal(s.production.cash,0);
});
test('持续培育只消耗启用种子，不能用休养跳过等待，满仓可分批领且不丢产物',()=>{
 let s=act(initialState(start),'plant',{index:0});s=act(s,'rest');assert.equal(s.plots[0].buffer,0);assert.equal(s.inventory.seed,7);assert.equal(s.energy,100);
 tickProduction(s,start+60000);assert.equal(s.plots[0].buffer,3);s.inventory.herb=52;s=act(s,'harvest',{index:0});assert.equal(s.inventory.herb,53);assert.equal(s.plots[0].buffer,2);assert.equal(s.farming,0);
 s=act(s,'sell',{item:'herb',qty:3});s=act(s,'harvest',{index:0});assert.equal(s.plots[0].buffer,0);assert.equal(s.inventory.seed,7);assert.ok(s.plots[0].continuous);assert.equal(s.farming,1);
 tickProduction(s,start+60000+cropCycleMs('herb'));assert.ok(s.plots[0].buffer>0);assert.throws(()=>act(s,'stop-plot',{index:0}),/先领取/);
});
test('队列预扣材料，逐枚完成；失败无经验，读档不重新随机结果',()=>{
 let s=initialState(start);s.inventory.herb=6;s.energy=0;const rolls=[0,.999,0];s=act(s,'brew',{item:'heal',qty:3},start,()=>rolls.shift());assert.equal(s.inventory.herb,0);assert.equal(s.inventory.heal,0);assert.equal(s.alchemyXP,0);
 tickProduction(s,start+60000);assert.equal(s.production.pills.heal,1);assert.equal(s.alchemyXP,10);assert.equal(s.production.queue.done,1);
 s=restoreState(s,start+180000);assert.equal(s.production.queue,null);assert.equal(s.production.pills.heal,2);assert.equal(s.alchemyXP,20);assert.equal(s.lastBrew.failures,1);assert.equal(s.energy,0);assert.equal(s.day,1);
 s=act(s,'claim-production',{kind:'alchemy'});assert.equal(s.inventory.heal,2);const n=restoreState(s,s.production.lastAt);assert.equal(n.inventory.heal,2);assert.equal(n.alchemyXP,20);assert.equal(n.production.pills.heal,0);
});
test('取消未开始部分保留正在炼制的一枚，返还材料与成品不能重复领取',()=>{
 let s=initialState(start);s.inventory.herb=6;s=act(s,'brew',{item:'heal',qty:3});s=act(s,'cancel-brew');assert.equal(s.production.queue.units.length,1);assert.equal(s.production.refunds.herb,4);assert.throws(()=>act(s,'cancel-brew'),/正在炼制/);
 tickProduction(s,start+60000);s=act(s,'claim-production',{kind:'alchemy'});assert.equal(s.inventory.herb,4);assert.equal(s.inventory.heal,1);assert.equal(s.alchemyXP,10);s=act(s,'claim-production',{kind:'alchemy'});assert.equal(s.inventory.herb,4);assert.equal(s.inventory.heal,1);
});
test('满仓成品和取消材料留在丹房，腾出空间后可以领取',()=>{
 let s=initialState(start);s.inventory.herb=4;s=act(s,'brew',{item:'heal',qty:2});s.inventory.ore=52;tickProduction(s,start+120000);s=act(s,'claim-production',{kind:'alchemy'});assert.equal(s.inventory.heal,0);assert.equal(s.production.pills.heal,2);
 s=act(s,'sell',{item:'ore',qty:1});s=act(s,'claim-production',{kind:'alchemy'});assert.equal(s.inventory.heal,1);assert.equal(s.production.pills.heal,1);
});
test('旧债务失败存档保留资产技能与通关记录，迁移从启用时开始且不补发任务奖励',()=>{
 const old=initialState(start);delete old.production;old.debt=1234567;old.failed=true;old.cash=321;old.inventory.herb=4;old.clearedDungeons=['qinglan'];old.tutorial.completed=['collection','plant'];old.tutorial.claimed=['collection','plant'];old.plots[0]={crop:'herb',planted:1,ready:1};
 let s=restoreState(old,start+IDLE_CAP_MS);assert.equal(s.cash,321);assert.equal(s.inventory.herb,4);assert.equal(s.debt,0);assert.equal(s.failed,false);assert.equal(s.nextCollection,null);assert.equal(s.production.xp,0);assert.equal(s.dungeonStages.qinglan,3);assert.deepEqual(s.learnedSkills,old.learnedSkills);assert.ok(s.tutorial.claimed.includes('plant'));assert.ok(!s.tutorial.completed.includes('collection'));assert.ok(s.plots[0].continuous);
 s=restoreState(s,s.production.lastAt);assert.equal(s.cash,321);assert.equal(s.inventory.herb,4);assert.throws(()=>act(s,'claim-quest',{id:'plant'}));
});
test('推进关卡提高后续小时收益，旧时间按旧效率；撤离或战败保留已完成关卡',()=>{
 let s=initialState(start);s.realm=1;const old=idleRate(s);s=act(s,'return',{mana:90,toxin:0,healingStock:{},loot:{},completedStage:1,defeated:true},start+3600000);const next=idleRate(s);assert.equal(s.dungeonStages.qinglan,1);assert.ok(next.xp>old.xp);assert.equal(s.production.xp,old.xp);
 tickProduction(s,start+7200000);assert.equal(s.production.xp,old.xp+next.xp);s=act(s,'return',{mana:90,toxin:0,healingStock:{},loot:{},completedStage:0});assert.equal(s.dungeonStages.qinglan,1);assert.equal(idleRate(s).xp,next.xp);
 s.selectedDungeon='creek';s=act(s,'return',{mana:90,toxin:0,healingStock:{},loot:{},bossDefeated:true});assert.ok(idleRate(s).xp>next.xp);
});
test('领取修为连续提升小等级，十级停留且溢出保留，仍需对应突破丹',()=>{
 let s=initialState(start);s.production.xp=2000;s=act(s,'claim-production',{kind:'idle'});assert.equal(s.realm,0);assert.equal(s.level,10);assert.equal(s.cultivation,1000);assert.throws(()=>act(s,'breakthrough'),/筑基丹/);
 s.inventory.foundationPill=1;s=act(s,'breakthrough');assert.equal(s.realm,1);assert.equal(s.inventory.foundationPill,0);assert.equal(s.cultivation,160);assert.equal(s.level,3);assert.equal(s.day,1);
});
