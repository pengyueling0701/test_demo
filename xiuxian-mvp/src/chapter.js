export const QUESTS=[
 {id:'plant',title:'播下一粒希望',text:'到药田选择草药，启用持续培育。',page:'farm',reward:{seed:4}},
 {id:'harvest',title:'第一篓灵草',text:'首次培育约一分钟产出，离线继续生产；领取第一批仙草。',page:'farm',cash:100,xp:40},
 {id:'order',title:'道友的委托',text:'云游药师：先交一单，让田地养活你。',page:'orders',cash:150},
 {id:'furnace',title:'重燃炉火',text:'购买两份赤铜矿，在炼丹洞升级青铜丹炉。',page:'alchemy',reward:{herb:4}},
 {id:'brew',title:'第一颗丹药',text:'成功炼丹；失败材料作废，可以返回药田补充。',page:'alchemy',reward:{seed:4},xp:80},
 {id:'realm',title:'筑基御剑',text:'在住宅修炼和突破，达到筑基。',page:'home',reward:{heal:2,manaPill:2}},
 {id:'skill',title:'剑修的叮嘱',text:'山中剑修：买书研读，再在人物面板携带技能。',page:'person',cash:100},
 {id:'wind',title:'御风古碑',text:'进入青岚竹海，向右找到御风碑，领悟二段跳。',page:'realm',cash:100},
 {id:'boss',title:'青岚归来',text:'击败青岚兽王并返回，解锁扫荡。',page:'realm',cash:300},
 {id:'idle',title:'修行不息',text:'点击住宅蒲团，领取一次挂机修为或灵石。',page:'home'},
];
export const freshTutorial=()=>({version:1,completed:[],claimed:[],hidden:false,readSkill:null});
export const freshEconomy=(day=1)=>({startDay:day,entries:[],lastPeriod:null});
export function recordEconomy(s,kind,amount){if(!amount)return;s.economy??=freshEconomy(s.day);s.economy.entries.push({day:s.day,kind,amount});}
export function economyTotals(entries){const t={idle:0,trade:0,order:0,reward:0,expense:0,repay:0,collection:0};for(const e of entries)t[e.kind]=(t[e.kind]??0)+e.amount;t.net=t.trade+t.order+t.reward+t.idle-t.expense;t.operating=t.trade+t.order+t.idle-t.expense;return t;}
export function markQuest(s,id){s.tutorial??=freshTutorial();if(!s.tutorial.completed.includes(id))s.tutorial.completed.push(id);}
export function migrateChapter(s,raw){
 s.settings={sound:true,battleHints:true,...raw.settings};s.notices=raw.notices??[];s.remindedDays=raw.remindedDays??[];s.economy=raw.economy??freshEconomy(s.day);
 if(raw.tutorial){s.tutorial=structuredClone(raw.tutorial);return;}s.tutorial=freshTutorial();
 const known={plant:s.plots.some(Boolean)||s.farming>0,harvest:s.farming>0,order:s.reputation>0||s.orders.some(o=>o.done),furnace:s.furnace>=1,brew:s.alchemy>0,realm:s.realm>=1,wind:s.doubleJump,boss:s.clearedDungeons.includes('qinglan'),idle:!!s.production?.claimedOnce};
 for(const [id,done]of Object.entries(known))if(done){markQuest(s,id);s.tutorial.claimed.push(id);}
}
export function trackChapter(s,before,action,payload){
 const direct={plant:'plant','plant-all':'plant',harvest:'harvest',order:'order',furnace:'furnace'};if(direct[action])markQuest(s,direct[action]);
 if(s.realm>=1)markQuest(s,'realm');
 if(['use-skillbook','learn-skill'].includes(action)){s.tutorial.readSkill=action==='learn-skill'?payload.item:payload.item.replace(/^book_/,'').split('_q')[0];}
 if(s.tutorial.readSkill&&s.skillLoadout.includes(s.tutorial.readSkill))markQuest(s,'skill');
 if(action==='return'&&s.selectedDungeon==='qinglan'){if(s.doubleJump)markQuest(s,'wind');if(s.clearedDungeons.includes('qinglan'))markQuest(s,'boss');}
 const delta=s.cash-before.cash;
 if(action==='sell')recordEconomy(s,'trade',delta);if(action==='order')recordEconomy(s,'order',delta);
 if(['buy','market-buy','buy-weapon','buy-equipment','armor','furnace','house','furniture','soil','expand-plot'].includes(action))recordEconomy(s,'expense',-delta);
 if(action==='repay')recordEconomy(s,'repay',-delta);
}
