import {startBattle} from '../src/battle.js';
import {initialState,transition} from '../src/game.js';
import {QUESTS,economyTotals} from '../src/chapter.js';
let s=initialState(),seed=123456,events=[];const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function explore(){
 let frame,result,hud,now=performance.now();globalThis.window={addEventListener(){},removeEventListener(){}};globalThis.requestAnimationFrame=fn=>{frame=fn;return 1;};globalThis.cancelAnimationFrame=()=>{frame=null;};
 const context=new Proxy({},{get:(_,key)=>key==='createLinearGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
 const engine=startBattle({getContext:()=>context},s,r=>{result=r;},h=>{hud=h;});
 const step=()=>{if(frame){now+=16;const fn=frame;frame=null;fn(now);}};
 for(let i=0;i<12000&&!result;i++){
  const p=engine.snapshot(),target=p.enemies.filter(m=>m.hp>0).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
  if(target&&p.x>=target.x-65&&p.x<=target.x-30){engine.release('right');engine.release('left');engine.press('right');step();engine.release('right');engine.release('left');engine.press('attack');engine.release('attack');if(target.boss){engine.press('skill-metal');engine.release('skill-metal');}}
  else{engine.release('right');engine.release('left');engine.press(!target||p.x<target.x-30?'right':'left');}
  if(hud?.hp<55){engine.press('heal');engine.release('heal');}
  if(hud?.mana<12&&target?.boss){engine.press('mana');engine.release('mana');}
  step();if(engine.snapshot().enemyHP.at(-1)===0)break;
 }
 if(!result&&engine.snapshot().enemyHP.at(-1)===0){
 const moveTo=x=>{engine.release('left');engine.release('right');for(let i=0;i<500&&Math.abs(engine.snapshot().x-x)>4;i++){engine.press(engine.snapshot().x>x?'left':'right');step();engine.release('left');engine.release('right');}};
 moveTo(1360);engine.press('jump');for(let i=0;i<10;i++)step();engine.press('jump');for(let i=0;i<100;i++)step();
 moveTo(1410);engine.press('right');engine.press('jump');for(let i=0;i<10;i++)step();engine.press('jump');for(let i=0;i<62;i++)step();engine.release('right');for(let i=0;i<80;i++)step();
 events.push('秘境回访高处药谷，角色落点y='+Math.round(engine.snapshot().y));
 }
 if(!result)engine.retreat();engine.dispose();return result;
}
const act=(a,p)=>{s=transition(s,a,p,rng);};
const claim=()=>{for(const q of QUESTS)if(s.tutorial.completed.includes(q.id)&&!s.tutorial.claimed.includes(q.id))act('claim-quest',{id:q.id});};
let explored=false;
while(s.day<31&&!s.failed){
 claim();for(let i=0;i<4;i++)if(s.plots[i]&&s.day>=s.plots[i].ready&&s.energy>=5)act('harvest',{index:i});
 for(const o of s.orders)if(o.item==='herb'&&!o.done&&s.inventory.herb>=o.qty)act('order',{id:o.id});claim();
 if(s.furnace===0&&s.cash>=620){act('buy',{item:'ore',qty:2});act('furnace');events.push('第'+s.day+'日升级青铜丹炉');claim();}
 if(!s.tutorial.completed.includes('brew')&&s.inventory.herb>=2&&s.energy>=18){act('brew',{item:'heal'});events.push('第'+s.day+'日炼丹'+(s.lastBrew.success?'成功':'失败'));claim();}
 if(!s.tutorial.completed.includes('skill')&&s.cash>=250){act('buy',{item:'book_wood'});act('use-skillbook',{item:'book_wood'});act('toggle-skill',{item:'wood'});claim();events.push('第'+s.day+'日携带木系技能');}
 while(s.cultivation>=80){const old=s.realm;act('breakthrough');if(s.realm!==old)events.push('第'+s.day+'日突破筑基');claim();}
 for(let i=0;i<4;i++)if(!s.plots[i]&&s.energy>=8){if(!s.inventory.seed&&s.cash>=30)act('buy',{item:'seed'});if(s.inventory.seed)act('plant',{index:i});}claim();
 if(s.inventory.herb>6)act('sell',{item:'herb',qty:s.inventory.herb-6});
 if(s.realm===1&&!explored&&s.day<=28){act('expedition',{dungeonId:'qinglan'});const result=explore();act('return',result);explored=true;events.push('第'+s.day+'日实际帧循环秘境：'+(result.bossDefeated?'通关':result.defeated?'战败':'撤离'));claim();continue;}
 if(s.realm===0&&s.energy>=20)act('cultivate');else act('rest');
}
claim();const e=s.economy.lastPeriod,t=economyTotals(e.entries);const firstCollection={day:s.day,cash:s.cash,debt:s.debt,herbs:s.inventory.herb,chapterComplete:s.journey.chapterComplete};let continuation=null;
if(process.argv.includes('--continue')){
 const startDay=s.day;act('sell',{item:'moon',qty:3});act('sell',{item:'herb',qty:4});act('house');
 if(s.plots[0]){if(s.plots[0].ready>s.day)act('rest');act('harvest',{index:0});}
 act('soil',{index:0,soil:'spirit'});act('plant',{index:0,crop:'moon'});for(let i=0;i<3;i++)act('rest');act('harvest',{index:0});if(s.inventory.herb<2)throw new Error('周转仙草不足');act('brew',{item:'dew'});if(!s.lastBrew.success){act('rest');act('brew',{item:'dew'});}if(!s.inventory.dew)throw new Error('凝露丹未炼成');act('consume',{item:'dew'});
 continuation={startDay,endDay:s.day,house:s.house,soil:s.plotSoils[0],moonSeeds:s.inventory.moonSeed,moon:s.inventory.moon,dewConsumed:true,cultivation:s.cultivation,toxin:s.toxin,chapterComplete:s.journey.chapterComplete,recipeDiscovered:s.journey.dewRecipe,cash:s.cash};
}
console.log(JSON.stringify({day:s.day,alive:!s.failed,realm:s.realm,level:s.level,cash:s.cash,debt:s.debt,herbs:s.inventory.herb,events,ledger:t,interest:e.interest,collected:e.repaid,quests:s.tutorial.claimed,battle:s.lastExpedition,journey:s.journey,firstCollection,continuation,method:'确定性经营模拟，经营与真实战斗帧循环模拟，不伪造通关、不使用贷款，不是真机试玩'},null,2));if(s.failed||t.operating<10000||!s.lastExpedition?.cleared||s.lastExpedition.loot.moon<4||s.tutorial.claimed.length!==10)process.exitCode=1;
