import {initialState,transition,ITEMS} from '../src/game.js';
import {economyTotals} from '../src/chapter.js';
let s=initialState(),seed=Number(process.argv[2]??147),brews=0,failures=0,tends=0,hastens=0;const nodes=[];
const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const act=(a,p)=>s=transition(s,a,p,rng);
while(s.day<31&&!s.failed){
 for(let i=0;i<s.plots.length;i++)if(s.plots[i]&&s.plots[i].ready<=s.day&&s.energy>=5)act('harvest',{index:i});
 for(const o of s.orders)if(!o.done&&!o.ignored&&s.inventory[o.item]>=o.qty)act('order',{id:o.id});
 if(!s.furnace&&s.cash>=620){act('buy',{item:'ore',qty:2});act('furnace');nodes.push('第'+s.day+'日青铜丹炉');}
 if(s.inventory.herb>=10&&s.energy>=18){const id=s.furnace&&s.realm===0?'spirit':s.orders.find(o=>!o.done&&['heal','manaPill'].includes(o.item))?.item??'heal';act('brew',{item:id});brews++;if(!s.lastBrew.success)failures++;}
 if(s.inventory.spirit&&s.toxin<65&&s.realm===0)act('consume',{item:'spirit'});
 while(s.cultivation>=80){const old=s.realm,level=s.level;act('breakthrough');if(old!==s.realm||level===6)nodes.push('第'+s.day+'日'+(s.realm?'筑基':'炼气七级'));}
 if(s.inventory.herb>8)act('sell',{item:'herb',qty:s.inventory.herb-8});
 for(let i=0;i<s.plots.length;i++)if(!s.plots[i]&&s.energy>=8){if(!s.inventory.seed&&s.cash>=30)act('buy',{item:'seed'});if(s.inventory.seed)act('plant',{index:i});}
 if((s.realm||s.level>=7)&&s.mana>=12&&s.energy>=8&&s.plots.some(p=>p&&p.ready>s.day&&!p.tend)){act('farm-art',{item:'tend'});tends++;}
 if(s.realm&&s.mana>=24&&s.energy>=12&&s.plots.some(p=>p&&p.ready>s.day&&!p.hasten)){act('farm-art',{item:'hasten'});hastens++;}
 if(s.realm===0&&s.energy>=20)act('cultivate');else act('rest');
}
const period=s.economy.lastPeriod,t=economyTotals(period.entries);console.log(JSON.stringify({method:'固定随机种子'+(process.argv[2]??147)+'的经营规则模拟，无贷款、无任务奖励、无集市倒卖，不是真机试玩',day:s.day,alive:!s.failed,realm:s.realm,level:s.level,herbs:s.inventory.herb,debt:s.debt,cash:s.cash,nodes,brews,failures,tends,hastens,ledger:t,interest:period.interest,repaid:period.repaid},null,2));if(s.failed||t.operating<10000||!tends||!hastens)process.exitCode=1;
