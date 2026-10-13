import {completedTransition as transition,harvestReady} from './helpers.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,transition as unusedTransition,restoreState,advance,collectDebt} from '../src/game.js';
import {economyTotals} from '../src/chapter.js';
test('目标可提前完成，隐藏引导不影响领取，领取与读档不重复且不推进日历',()=>{
 let s=initialState();s.inventory.herb=2;s=transition(s,'brew',{item:'heal'},()=>0);assert.ok(s.tutorial.completed.includes('brew'));
 s=transition(s,'toggle-guide');assert.ok(s.tutorial.hidden);const day=s.day;s=transition(s,'claim-quest',{id:'brew'});assert.equal(s.inventory.seed,12);assert.equal(s.day,day);
 s=restoreState(s);assert.throws(()=>transition(s,'claim-quest',{id:'brew'}));
 const f=initialState();f.inventory.herb=2;const n=transition(f,'brew',{item:'heal'},()=>.999);assert.ok(!n.tutorial.completed.includes('brew'));assert.equal(n.alchemyXP,0);
});
test('交易订单和奖励收支记录正确，日历推进不触发催收',()=>{let s=initialState();s.inventory.herb=10;s=transition(s,'sell',{item:'herb',qty:2});s=transition(s,'buy',{item:'seed'});s=transition(s,'order',{id:s.orders[0].id});s=transition(s,'claim-quest',{id:'order'});const t=economyTotals(s.economy.entries);assert.equal(t.trade,180);assert.equal(t.expense,30);assert.equal(t.order,650);assert.equal(t.reward,150);assert.equal(t.net,950);const cash=s.cash;advance(s,30);assert.equal(s.cash,cash);assert.equal(s.debt,0);assert.equal(s.notices.length,0);assert.equal(s.nextCollection,null);});

test('旧存档可确认目标迁移为已领取，不补发奖励，设置保留',()=>{
 const old=initialState();delete old.tutorial;delete old.economy;old.realm=1;old.farming=3;old.alchemy=2;old.furnace=1;old.settings.sound=false;
 const s=restoreState(old);for(const id of ['plant','harvest','brew','realm','furnace'])assert.ok(s.tutorial.claimed.includes(id));assert.equal(s.cash,500);assert.equal(s.settings.sound,false);assert.throws(()=>transition(s,'claim-quest',{id:'realm'}));
});
