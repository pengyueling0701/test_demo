import {aptitudeLevel,refundStoryMaterials} from './aptitude.js';
import {bagCapacity,bagRoom} from './backpack.js';
import {CROPS,harvestYield} from './gardening.js';
import {DUNGEONS} from './dungeons.js';
import {markQuest,recordEconomy} from './chapter.js';
export const IDLE_CAP_MS=24*60*60*1000;
export const cropCycleMs=id=>(CROPS[id]?.minutes??20)*60000;
export const brewDurationMs=(grade,s)=>Math.round((60+grade*45)*(s.furniture.table ? .8 : 1)*1000);
export const queueLimit=s=>6+s.furnace*4;
const count=s=>Object.values(s.inventory).reduce((a,b)=>a+b,0);
const room=s=>Math.max(0,bagCapacity(s)-count(s));
const log=(s,text)=>{s.log.unshift(`第${s.day}日 · ${text}`);s.log=s.log.slice(0,35);};
export function freshProduction(now=Date.now()){
 return {version:1,lastAt:now,elapsedMs:0,xp:0,cash:0,pills:{},refunds:{},queue:null,claimedOnce:false};
}
export function dungeonProgress(s,id){return Math.max(s.dungeonStages?.[id]??0,(s.clearedDungeons??[]).includes(id)?3:0);}
export function idleRate(s){
 let progress=0,label='草庐修行';
 DUNGEONS.forEach((d,i)=>{const stage=dungeonProgress(s,d.id);if(stage&&i*3+stage>progress){progress=i*3+stage;label=d.name+' · '+['','外围','腹地','首领'][stage];}});
 return {progress,label,xp:Math.round(120*Math.pow(1.085,progress)*(1+aptitudeLevel(s)*.1)),cash:0};
}
export function migrateProduction(s,raw,now=Date.now()){
 if(raw.production?.version===1){s.production=structuredClone(raw.production);s.dungeonStages={...raw.dungeonStages};return;}
 s.production=freshProduction(now);s.dungeonStages={};
 for(const id of s.clearedDungeons??[])s.dungeonStages[id]=3;
 s.archivedDebt=raw.debt??0;s.debt=0;s.nextCollection=null;s.failed=false;s.notices=[];
 s.tutorial.completed=s.tutorial.completed.filter(id=>id!=='collection');s.tutorial.claimed=s.tutorial.claimed.filter(id=>id!=='collection');
 s.journey.available=s.journey.available.filter(id=>id!=='collection');s.journey.seen=s.journey.seen.filter(id=>id!=='collection');s.journey.chapterComplete=false;
 s.plots=s.plots.map(p=>p?{...p,continuous:true,lastAt:now,firstReadyAt:now+Math.max(0,(p.ready??s.day)-s.day)*60000,buffer:0,cycleMs:cropCycleMs(p.crop??'herb')}:null);
 log(s,'家园开始持续生产；旧资产保留，债务催收已取消。');
}
export function settleProduction(s,now=Date.now()){
 const pr=s.production??=freshProduction(now);
 if(!Number.isFinite(now)||now<pr.lastAt)return s;
 const delta=now-pr.lastAt,accepted=Math.min(delta,Math.max(0,IDLE_CAP_MS-pr.elapsedMs)),rate=idleRate(s);
 pr.xp+=rate.xp*accepted/3600000;pr.elapsedMs+=accepted;pr.lastAt=now;
 for(const p of s.plots){
  if(!p?.continuous||now<p.lastAt)continue;
  if(p.buffer>0||p.harvestOnly){p.harvestOnly=true;continue;}
  const ready=p.firstReadyAt??p.lastAt+(p.cycleMs??cropCycleMs(p.crop??'herb'));
  if(now>=ready){p.buffer=harvestYield(s,p);p.lastAt=ready;p.firstReadyAt=null;p.harvestOnly=true;}
 }
 const q=pr.queue;
 if(q){
  while(q.done<q.units.length&&now>=q.startedAt+(q.done+1)*q.durationMs){
   const unit=q.units[q.done++];
   if(unit.success){pr.pills[q.item]=(pr.pills[q.item]??0)+1;s.alchemy++;s.alchemyXP+=10;markQuest(s,'brew');}else {q.failures++;refundStoryMaterials(s,unit);}
  }
  if(q.done===q.units.length){s.lastBrew={item:q.item,qty:q.units.length,successes:q.units.length-q.failures,failures:q.failures,success:q.failures<q.units.length,chance:q.chance};log(s,`炼丹队列完成：成功${s.lastBrew.successes}枚，失败${q.failures}枚（失败材料作废）。`);pr.queue=null;}
 }
 return s;
}
function moveBuffer(s,bag,id,available){const qty=Math.min(available,bagRoom(s,id));if(qty){s.inventory[id]=(s.inventory[id]??0)+qty;bag[id]-=qty;}return qty;}
export function claimProduction(s,kind='all',index){
 const pr=s.production,received={xp:0,cash:0,items:{}};
 if(kind==='all'||kind==='idle'){
  received.xp=Math.floor(pr.xp);received.cash=Math.floor(pr.cash);s.cultivation+=received.xp;s.cash+=received.cash;pr.xp-=received.xp;pr.cash-=received.cash;pr.elapsedMs=0;
  if(received.xp||received.cash){pr.claimedOnce=true;markQuest(s,'idle');recordEconomy(s,'idle',received.cash);}
 }
 if(kind==='all'||kind==='alchemy')for(const bag of [pr.pills,pr.refunds])for(const [id,n] of Object.entries(bag)){const qty=moveBuffer(s,bag,id,n);if(qty)received.items[id]=(received.items[id]??0)+qty;}
 if(kind==='all'||kind==='farm')s.plots.forEach((p,i)=>{
  if(!p?.continuous||index!==undefined&&index!==i)return;
  const crop=CROPS[p.crop??'herb'],id=(p.grade??1)===1?crop.item:crop.item+'_q'+p.grade,qty=Math.min(p.buffer,bagRoom(s,id));
  if(qty){s.inventory[id]=(s.inventory[id]??0)+qty;p.buffer-=qty;received.items[id]=(received.items[id]??0)+qty;s.farmingRemainders??={};const key=p.crop??'herb',earned=(s.farmingRemainders[key]??p.claimedForXP??0)+qty;s.farming+=Math.floor(earned/crop.yield);s.farmingRemainders[key]=earned%crop.yield;p.claimedForXP=0;p.harvestOnly=true;if(!p.buffer)s.plots[i]=null;markQuest(s,'harvest');}
 });
 s.lastClaim=received;log(s,`领取收获：修为+${received.xp}，灵石+${received.cash}，物品${Object.values(received.items).reduce((a,b)=>a+b,0)}份；未领物品保留。`);
 return received;
}
export function cancelQueue(s){
 const q=s.production.queue;if(!q)throw new Error('当前没有炼丹队列。');
 const keep=q.done+1,pending=q.units.slice(keep);if(!pending.length)throw new Error('只剩正在炼制的一枚，等待完成即可。');
 for(const unit of pending)for(const [id,n]of Object.entries(unit.materials))s.production.refunds[id]=(s.production.refunds[id]??0)+n;
 q.units=q.units.slice(0,keep);log(s,'已取消尚未开始的炼丹，返还材料存于丹房待领取区。');
}
export function pendingItems(s){return Object.values(s.production.pills).reduce((a,b)=>a+b,0)+Object.values(s.production.refunds).reduce((a,b)=>a+b,0)+s.plots.reduce((a,p)=>a+(p?.buffer??0),0);}
export function timeLabel(ms){const seconds=Math.max(0,Math.ceil(ms/1000));return seconds>=3600?`${Math.floor(seconds/3600)}时${Math.floor(seconds%3600/60)}分`:seconds>=60?`${Math.floor(seconds/60)}分${seconds%60}秒`:`${seconds}秒`;}
