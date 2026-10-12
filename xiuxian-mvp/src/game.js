import {defaultLayout,syncLayout,validateLayout} from './home-layout.js';
import {freshJourney,updateJourney} from './journey.js';
import {FARM_ARTS,artUnlocked} from './production.js';
import {QUESTS,freshTutorial,freshEconomy,recordEconomy,markQuest,migrateChapter,trackChapter} from './chapter.js';
import {makeMarket} from './market.js';
import {alchemyXP,brewChance} from './alchemy.js';
import { DUNGEONS, dungeonById, dungeonUnlocked, sweepAvailable, sweepWait, sweepLoot } from './dungeons.js';
import { SOILS, CROPS, plotLimit, expansionPrice, plantingBlock, harvestYield } from './gardening.js';
import { PILL_GRADES,FURNACES,EQUIPMENT,EQUIPMENT_SLOTS,emptyEquipment,equipmentStats,itemCategory } from './systems.js';
import {SKILLS,assignElements,validLoadout} from './elements.js';
import {cultivationRequired} from './cultivation.js';
export const REALMS = ['炼气', '筑基', '金丹', '元婴'];
export const BASE_CREDIT = [1000000, 2000000, 5000000, 10000000];
export const BREAKTHROUGH_PILLS = ['foundationPill','goldenPill','nascentPill'];
export const ITEMS = {
  dew:{name:'初级凝露丹',price:1200,sell:900,grade:1,realm:1,cultivation:55,toxin:10},
  manaPill:{name:'粗制回灵丹',price:150,sell:110,grade:0,manaRestore:40,toxin:18},
  manaPill1:{name:'初级回灵丹',price:300,sell:225,grade:1,manaRestore:65,toxin:16},
  seed: { name: '青灵草种子', price: 30, sell: 0 },
  moonSeed: { name:'月华仙草种子',price:220,sell:0,realm:1 },
  fireSeed: { name:'焰心草种子',price:350,sell:0,realm:1 },
  frostSeed: { name:'霜露仙草种子',price:450,sell:0,realm:1 },
  herb: { name: '青灵草', price: 120, sell: 90, collateral: true },
  moon: { name: '月华仙草', price: 600, sell: 420, collateral: true },
  fireHerb: { name:'焰心草',price:900,sell:650,realm:1,collateral:true },
  frostHerb: { name:'霜露仙草',price:1200,sell:850,realm:1,collateral:true },
  ore: { name: '赤铜矿', price: 220, sell: 100 },
  heal: { name:'粗制回春丹',price:160,sell:120,grade:0,heal:48,toxin:18 },
  heal1: { name:'初级回春丹',price:300,sell:225,grade:1,heal:65,toxin:17 },
  heal2: { name:'中级回春丹',price:600,sell:450,grade:2,heal:85,toxin:16 },
  heal3: { name:'高级回春丹',price:1200,sell:900,grade:3,heal:110,toxin:15,realm:2 },
  heal4: { name:'稀有回春丹',price:2400,sell:1800,grade:4,heal:150,toxin:14,realm:3 },
  heal5: { name:'传说回春丹',price:5000,sell:3750,grade:5,heal:200,toxin:12,realm:3 },
  spirit: { name:'初级聚气丹',price:380,sell:300,grade:1,cultivation:35,toxin:18 },
  mid: { name:'中级培元丹',price:800,sell:600,grade:2,cultivation:65,toxin:22 },
  advanced: { name:'高级凝元丹',price:1600,sell:1200,realm:2,grade:3,cultivation:100,toxin:28 },
  rare: { name:'稀有固元丹',price:3200,sell:2400,realm:3,grade:4,cultivation:160,toxin:32 },
  foundationPill:{name:'筑基丹',price:1800,sell:0,grade:2,realm:0,breakthroughOnly:true,toxin:0},
  goldenPill:{name:'结金丹',sell:0,grade:3,realm:1,breakthroughOnly:true,toxin:0},
  nascentPill:{name:'元婴丹',sell:0,grade:4,realm:2,breakthroughOnly:true,toxin:0},
  core: { name: '妖兽内丹', sell: 900 },
  supreme: { name:'传说洗髓天灵丹',sell:0,grade:5,realm:3,toxin:40 },
};
export const RECIPES = {
  foundationPill:{materials:{herb:4,moon:1},realm:0,furnace:1},
  goldenPill:{materials:{moon:4,fireHerb:2,core:1},realm:1,furnace:3},
  nascentPill:{materials:{moon:4,frostHerb:3,core:2},realm:2,furnace:3},
  dew:{materials:{herb:2,moon:1},realm:1,furnace:1,discovery:true},
  manaPill:{materials:{herb:2},cost:15,realm:0,furnace:0},
  manaPill1:{materials:{herb:3,ore:1},cost:30,realm:0,furnace:1},
  heal: { materials:{herb:2},cost:15,realm:0,furnace:0 },
  heal1: { materials:{herb:3},cost:25,realm:0,furnace:1 },
  heal2: { materials:{herb:3,moon:1},cost:40,realm:0,furnace:2 },
  heal3: { materials:{moon:2,core:1},cost:80,realm:2,furnace:3 },
  heal4: { materials:{moon:2,frostHerb:2,core:1},cost:160,realm:3,furnace:4 },
  heal5: { materials:{moon:4,frostHerb:3,core:2},cost:320,realm:3,furnace:5 },
  spirit: { materials: { herb: 3, ore: 1 }, cost: 30, realm: 0, furnace: 1 },
  mid: { materials:{herb:4,ore:2},cost:50,realm:0,furnace:2 },
  advanced: { materials:{moon:2,core:1},cost:80,realm:2,furnace:3 },
  rare: { materials:{moon:2,fireHerb:2,core:2},cost:180,realm:3,furnace:4 },
  supreme: { materials:{moon:6,core:3,ore:5},cost:1000,realm:3,furnace:5 },
};
export const WEAPONS = {
  wood: { name: '旧木剑', attack: 12, price: 0, realm: 0 },
  iron: { name: '青锋剑', attack: 22, price: 500, realm: 0 },
  spirit: { name: '流云灵剑', attack: 34, price: 1800, realm: 1 },
  ancient: { name:'玄霄古剑',attack:58,price:8000,realm:2 },
};
assignElements(ITEMS,{seed:'wood',herb:'wood',moonSeed:'water',moon:'water',fireSeed:'fire',fireHerb:'fire',frostSeed:'water',frostHerb:'water',ore:'metal',core:'earth',supreme:'earth',foundationPill:'earth',goldenPill:'metal',nascentPill:'water',manaPill:'water',manaPill1:'water'},'wood');
assignElements(WEAPONS,{},'metal');
// Material quality is separate from consumable effects.
for(const item of Object.values(ITEMS))item.pill=!!(item.heal||item.manaRestore||item.cultivation||item.breakthroughOnly||item===ITEMS.supreme);
for(const [id,item]of Object.entries(ITEMS))if(item.grade===undefined)item.grade=['herb','moon','fireHerb','frostHerb','core'].includes(id)?1:0;
for(const [id,skill]of Object.entries(SKILLS))ITEMS['book_'+id]={name:skill.name+'技能书',price:Math.max(150,skill.cost),sell:Math.max(75,Math.floor(skill.cost/2)),element:skill.element,grade:0,skill:id};
for(const [id,item]of Object.entries({...ITEMS})){
 if(item.pill&&!item.manaRestore)continue;
 const first=['herb','moon','fireHerb','frostHerb','core'].includes(id)?1:0;
 for(let grade=first;grade<6;grade++){
  if(grade===item.grade)continue;
  const key=id+'_q'+grade,factor=Math.pow(2,grade-item.grade);
  ITEMS[key]={...item,name:PILL_GRADES[grade]+item.name.replace(/^(粗制|初级|中级|高级|稀有|传说)/,''),grade,baseItem:id,realm:grade>=4?3:grade>=3?2:item.realm??0};
  if(item.price)ITEMS[key].price=Math.ceil(item.price*factor);if(item.sell)ITEMS[key].sell=Math.ceil(item.sell*factor);
  if(item.manaRestore){ITEMS[key].manaRestore=Math.round(item.manaRestore*(1+.35*(grade-item.grade)));RECIPES[key]={materials:{herb:2+grade,ore:grade},cost:15*(grade+1),realm:ITEMS[key].realm,furnace:grade};}
 }
}
for(const [id,item]of Object.entries({...ITEMS}).filter(([id,i])=>id!=='dew'&&i.cultivation))for(let grade=0;grade<6;grade++){
 if(grade===item.grade)continue;const key=id+'_q'+grade;ITEMS[key]={...item,baseItem:id,grade,name:PILL_GRADES[grade]+item.name.replace(/^(粗制|初级|中级|高级|稀有|传说)/,''),realm:grade>=4?3:grade>=3?2:0,price:Math.round(item.price*Math.pow(2,grade-item.grade)),sell:Math.round(item.sell*Math.pow(2,grade-item.grade)),cultivation:Math.max(10,Math.round(item.cultivation*(1+.2*(grade-item.grade))))};RECIPES[key]={materials:{herb:2+grade,ore:grade},cost:15*(grade+1),realm:ITEMS[key].realm,furnace:grade};
}
for(const [id,w]of Object.entries(WEAPONS))w.grade={wood:0,iron:1,spirit:3,ancient:5}[id];
WEAPONS.bamboo={name:'粗制竹剑',attack:14,price:120,realm:0,element:'wood',grade:0};
for(let grade=2;grade<5;grade++){const w=WEAPONS.iron;WEAPONS['iron_q'+grade]={...w,grade,name:PILL_GRADES[grade]+'青锋剑',price:w.price*Math.pow(2,grade-1),attack:Math.round(w.attack*(1+.4*(grade-1))),realm:grade>=4?2:1};}
for(const recipe of Object.values(RECIPES)){delete recipe.cost;delete recipe.materials.ore;}
// Keep old variant IDs usable in saves, while offering one clear progression per pill family.
const cultivationLine=new Set(['spirit_q0','spirit','mid','advanced','rare','spirit_q5']);
for(const [id,i] of Object.entries(ITEMS))if(i.cultivation&&id!=='dew'&&!cultivationLine.has(id)||i.manaRestore&&(id==='manaPill1'||i.baseItem==='manaPill1'))i.legacyVariant=true;
// Processing compensates for risk; discount buying remains more expensive than resale.
for(const [id,r] of Object.entries(RECIPES)){
 if(id==='supreme'||id==='dew'||ITEMS[id].breakthroughOnly)continue;
 const direct=Object.entries(r.materials).reduce((n,[k,q])=>n+(ITEMS[k].sell??0)*q,0);
 ITEMS[id].sell=Math.max(ITEMS[id].sell??0,Math.ceil(direct*(1.45+ITEMS[id].grade*.12)/10)*10);
 ITEMS[id].price=Math.ceil(ITEMS[id].sell/.75/10)*10;
}
export const materialKeys=(s,base)=>Object.keys(ITEMS).filter(k=>(k===base||ITEMS[k].baseItem===base)&&s.inventory[k]>0).sort((a,b)=>ITEMS[a].grade-ITEMS[b].grade);
export const materialCount=(s,base)=>materialKeys(s,base).reduce((n,k)=>n+s.inventory[k],0);
export const marketCatalog=()=>[...Object.entries(ITEMS).filter(([id,i])=>i.price&&!i.legacyVariant&&id!=='supreme'&&id!=='dew').map(([item,i])=>({kind:'item',item,...i})),...Object.entries(WEAPONS).filter(([,i])=>i.price).map(([item,i])=>({kind:'weapon',item,...i})),...Object.entries(EQUIPMENT).map(([item,i])=>({kind:'equipment',item,...i}))];
export function initialState() {
  return {
    roots:['metal','wood','water','fire','earth'],learnedSkills:['metal'],skillLoadout:['metal'],skillGrades:{metal:0},
    journey:freshJourney(),tutorial:freshTutorial(),economy:freshEconomy(),settings:{sound:true,battleHints:true},notices:[],remindedDays:[],
    marketCycle:0,marketOffers:makeMarket(0,marketCatalog()),
    version:1,systemsVersion:2,productionVersion:1,day:1,realm:0,level:5,cultivation:0,
    cash: 500, debt: 1000000, nextCollection: 31,
    ageDays: 0, lifeYears: 90, startAge: 30, aptitude: 0,
    energy: 100, hp: 100, mana: 60, toxin: 0,
    farming: 0, alchemy: 0, alchemyXP:0, reputation: 0,
    house: 0, furnace: 0, furniture: { cabinet: false, bed: false, table: false },homeWarehouse:{furniture:[]},
    inventory:Object.fromEntries(Object.keys(ITEMS).map(k=>[k,k==='seed'?8:0])),
    plots: Array.from({ length: 4 }, () => null),
    plotSoils:Array.from({length:4},()=>'normal'),
    weapon: 'wood', weapons: ['wood'], armor: false,
    equipped:emptyEquipment(),ownedEquipment:[],
    doubleJump: false, bossDefeated: false, clearedDungeons: [],sweepReadyDays:{},selectedDungeon: DUNGEONS[0].id, failed: false, won: false,
    orders: makeOrders(0), orderCycle: 0,
    log:['债主留下最后通牒。你带着500灵石，回到乡下老屋。','旧箱中藏着失传丹方。破败丹炉还能炼制粗制丹药。'],
  };
}
export function restoreState(raw) {
  if(!raw||raw.version!==1||!raw.inventory||!Array.isArray(raw.plots)||!Number.isFinite(raw.cash)||!Number.isFinite(raw.debt))return initialState();
  const defaults=initialState();
  const s={...defaults,...structuredClone(raw),inventory:{...defaults.inventory,...raw.inventory},furniture:{...defaults.furniture,...raw.furniture},homeWarehouse:{...defaults.homeWarehouse,...raw.homeWarehouse,furniture:[...(raw.homeWarehouse?.furniture??[])]}};
  const legacyMaterials=raw.homeWarehouse?.materials??{};let returnedMaterials=0;
  for(const [id,qty] of Object.entries(legacyMaterials))if(ITEMS[id]&&Number.isSafeInteger(qty)&&qty>0){s.inventory[id]=(s.inventory[id]??0)+qty;returnedMaterials+=qty;}
  if(returnedMaterials)note(s,`家园仓库调整：旧存药材与丹材已移入背包，共${returnedMaterials}份。`);
  delete s.homeWarehouse.materials;
  s.plotSoils=s.plots.map((_,i)=>Object.hasOwn(SOILS,raw.plotSoils?.[i])?raw.plotSoils[i]:'normal');
  s.clearedDungeons=raw.clearedDungeons??(raw.bossDefeated?[DUNGEONS[0].id]:[]);
  s.selectedDungeon=raw.selectedDungeon??DUNGEONS[0].id;
  s.sweepReadyDays={...raw.sweepReadyDays};
  s.equipped={...emptyEquipment(),...raw.equipped};s.ownedEquipment=[...(raw.ownedEquipment??[])];
  if(raw.armor&&!s.equipped.body){s.equipped.body='robe';if(!s.ownedEquipment.includes('robe'))s.ownedEquipment.push('robe');}
  if(raw.systemsVersion!==2){s.furnace=raw.furnace>=2?3:(raw.furnace??0);s.systemsVersion=2;}
  s.roots=[...defaults.roots];s.learnedSkills=raw.learnedSkills??['metal'];s.skillLoadout=raw.skillLoadout??['metal'];s.skillGrades={metal:0,...raw.skillGrades};
  const marketCycle=Math.floor((s.day-1)/7);s.marketCycle=raw.marketCycle??marketCycle;s.marketOffers=raw.marketOffers??makeMarket(marketCycle,marketCatalog());
  migrateChapter(s,raw);
  s.journey=raw.journey??freshJourney();updateJourney(s);
  s.alchemyXP=raw.alchemyXP??(raw.alchemy??0)*10;
  if(!s.failed)advanceMinorRanks(s);
  if(raw.productionVersion!==1){for(const o of s.marketOffers){const catalog={item:ITEMS,weapon:WEAPONS,equipment:EQUIPMENT}[o.kind];if(catalog?.[o.item]?.price)o.price=Math.max(1,Math.floor(catalog[o.item].price*.8));}s.productionVersion=1;}

  syncLayout(s);return s;
}
export function makeOrders(cycle,realm=0,dewUnlocked=false) {
  return [
    { id: `${cycle}-herb`, item: 'herb', qty: 4 + cycle % 3, reward: 650 + (cycle % 3) * 130, done: false, owner: '云游药师' },
    { id: `${cycle}-heal`, item: cycle%2?'manaPill':'heal', qty: 2 + cycle % 2, reward: (2+cycle%2)*Math.round(ITEMS[cycle%2?'manaPill':'heal'].sell*1.4), done: false, owner: '山中剑修' },
    { id: `${cycle}-spirit`, item: realm>=1?(dewUnlocked&&cycle%2?'dew':'advanced'):'spirit', qty: 2, reward: 2*Math.round(ITEMS[realm>=1?(dewUnlocked&&cycle%2?'dew':'advanced'):'spirit'].sell*1.4), done: false, owner: '清溪道人' },
  ];
}
export const lifeLeft = s => Math.max(0, s.lifeYears - s.startAge - s.ageDays / 360);
export const lifeFactor = s => Math.min(1.5, Math.max(0, lifeLeft(s) / 60));
export const credit = s => Math.floor(BASE_CREDIT[s.realm] * lifeFactor(s));
export const availableCredit = s => Math.max(0, credit(s) - s.debt);
export const maxHP=s=>100+s.realm*40+equipmentStats(s).hp;
export const maxMana=s=>60+s.realm*30+equipmentStats(s).mana;
export const attack=s=>WEAPONS[s.weapon].attack+s.realm*8+equipmentStats(s).attack;
export const defense=s=>s.realm*2+equipmentStats(s).defense;
export const healingItem=s=>Object.keys(ITEMS).filter(k=>ITEMS[k].heal&&s.inventory[k]>0).sort((a,b)=>ITEMS[b].grade-ITEMS[a].grade)[0]??'heal';
export const capacity = s => 60 + s.house * 30 + (s.furniture.cabinet ? 40 : 0);
export const inventoryCount = s => Object.values(s.inventory).reduce((a, b) => a + b, 0);
export function note(s, message) { s.log.unshift(`第${s.day}日 · ${message}`); s.log = s.log.slice(0, 35); }
function advanceMinorRanks(s) {
  while(s.level<10&&s.cultivation>=cultivationRequired(s)){
    s.cultivation-=cultivationRequired(s);s.level++;
    note(s,`修为积满，自动提升至${REALMS[s.realm]}${s.level}级。${s.realm===0&&s.level===7?'领悟引露术，可在药田照料作物。':''}`);
  }
}
export function addItem(s, item, qty) {
  if (inventoryCount(s) + qty > capacity(s)) throw new Error('储物空间不足，请出售物品或升级住宅。');
  s.inventory[item] += qty;
}
function spend(s, amount) {
  if (s.cash < amount) throw new Error('灵石不足。');
  s.cash -= amount;
}
function expend(s, amount) {
  if (s.energy < amount) throw new Error('精力不足，先休息一日。');
  s.energy -= amount;
}
export function collectDebt(s) {
  if (s.debt <= 0) return;
  const interest = Math.ceil(s.debt * 0.01);
  s.debt += interest;
  let repaid = 0;
  if (s.cash > 0) {
    repaid = Math.min(s.cash, s.debt); s.cash -= repaid; s.debt -= repaid;
    note(s, `债主上门：利息${interest}，收走现金${repaid}灵石；本次不扣库存。`);
  } else {
    const herbs = Object.keys(ITEMS).filter(k => ITEMS[k].collateral).sort((a,b) => ITEMS[a].sell - ITEMS[b].sell || a.localeCompare(b));
    for (const item of herbs) {
      while (s.inventory[item] > 0 && s.debt > 0) {
        s.inventory[item]--;
        const value = ITEMS[item].sell;
        const paid = Math.min(value, s.debt); repaid += paid;
        s.debt -= paid; s.cash += value - paid;
      }
    }
    note(s, `债主上门：利息${interest}，灵药仙草抵债${repaid}灵石。`);
  }
  if (s.debt > 0 && s.cash === 0 && !Object.keys(ITEMS).some(k => ITEMS[k].collateral && s.inventory[k] > 0)) {
    s.failed = true; note(s, '身无分文，灵草也已耗尽。债主封了老屋，这一局结束。');
  }
  recordEconomy(s,'collection',repaid);if(s.day>=31&&!s.failed)markQuest(s,'collection');s.economy??=freshEconomy(s.day);s.economy.lastPeriod={startDay:s.economy.startDay,endDay:s.day,entries:[...s.economy.entries],interest,repaid};s.economy.entries=[];s.economy.startDay=s.day;
  if (s.debt === 0) { s.nextCollection = null; note(s, '债契已清。从此不再受催债之苦。'); }
}
export function advance(s, days = 1, resting = false) {
  for (let i = 0; i < days && !s.failed; i++) {
    s.day++; s.ageDays++;if(s.day>=31&&s.debt===0&&!s.failed)markQuest(s,'collection');
    if([24,28].includes(s.day)&&s.nextCollection===31&&s.debt>0&&!s.remindedDays.includes(s.day)){s.remindedDays.push(s.day);s.notices.push({day:s.day,text:'债主：第31日上门。有现金只收现金，零现金才扣背包里的抵债仙草。请预备利息，保留至少2份种子与2株仙草作下一轮周转。'});note(s,'债主送来催债预告。');}
    s.energy = Math.min(100, s.energy + (resting ? 70 + (s.furniture.bed ? 20 : 0) : 28));
    s.toxin = Math.max(0, s.toxin - (resting ? 18 : 6));
    if (resting) { s.hp = maxHP(s); s.mana = maxMana(s); }
    const cycle = Math.floor((s.day - 1) / 7);
    if(cycle!==s.marketCycle){s.marketCycle=cycle;s.marketOffers=makeMarket(cycle,marketCatalog());note(s,'集市已换上新一批货物。');}
    if (cycle !== s.orderCycle) {
      s.orderCycle = cycle; s.orders = makeOrders(cycle,s.realm,s.journey?.dewRecipe); note(s, '道友发布了新一批订单，旧订单已替换。');
    }
    if (s.nextCollection !== null && s.day >= s.nextCollection && s.debt > 0) {
      collectDebt(s); if (s.debt > 0) s.nextCollection += 30;
    }
  }
}
export function consume(s, item) {
  const pill=ITEMS[item];
  if(pill?.breakthroughOnly)throw new Error(pill.name+'用于境界突破，不能直接服用。');
  if(pill?.manaRestore&&s.mana>=maxMana(s))throw new Error('法力已满，无需服用回灵丹。');
  if(!pill?.pill)throw new Error('这件物品不能服用。');
  if (!s.inventory[item]) throw new Error('没有这颗丹药。');
  if (s.toxin >= 100) throw new Error('丹毒已满，休养后才能继续服丹。');
  if (item === 'supreme' && s.aptitude >= 2) throw new Error('资质已经完成洗髓，无需重复服用。');
  if(pill.heal&&s.hp>=maxHP(s))throw new Error('气血已满，无需服用回春丹。');
  s.inventory[item]--;
  const efficacy = Math.max(0.2, 1 - s.toxin / 125);
  if(pill.heal)s.hp=Math.min(maxHP(s),s.hp+Math.round(pill.heal*efficacy));
  if(pill.manaRestore)s.mana=Math.min(maxMana(s),s.mana+Math.round(pill.manaRestore*efficacy));
  if(pill.cultivation)s.cultivation+=Math.round(pill.cultivation*efficacy);
  if (item === 'supreme') { s.aptitude = 2; note(s, '洗髓成功，资质由低劣蜕变为卓越！'); }
  s.toxin=Math.min(100,s.toxin+pill.toxin);
  note(s, `服下${ITEMS[item].name}，丹毒增加。`);
}
function baseTransition(state, action, payload = {}, random = Math.random) {
  const s = structuredClone(state);
  if (s.failed) throw new Error('本局已结束，请重新开始。');
  switch (action) {
    case 'plant': {
      const i = payload.index;
      const cropId=payload.crop??'herb',block=plantingBlock(s,i,cropId);
      if(block)throw new Error(block);
      const crop=CROPS[cropId];
      const seed=payload.seed??materialKeys(s,crop.seed)[0];if(!materialKeys(s,crop.seed).includes(seed))throw new Error('没有所选品质的种子。');expend(s,8);s.inventory[seed]--;s.plots[i]={crop:cropId,grade:Math.max(1,ITEMS[seed].grade),planted:s.day,ready:s.day+crop.days};
      note(s,`播下${crop.name}，${crop.days}日后可收获。`);break;
    }
    case 'harvest': {
      const p = s.plots[payload.index];
      if (!p || s.day < p.ready) throw new Error('仙草尚未成熟。');
      const crop=CROPS[p.crop??'herb'],qty=harvestYield(s,p);
      const grade=p.grade??1;const output=grade===1?crop.item:crop.item+'_q'+grade;expend(s,5);addItem(s,output,qty);s.farming++;s.plots[payload.index]=null;
      note(s,`收获${qty}株${crop.name}，种植熟练度提升。`);break;
    }
    case 'expand-plot': {
      if(s.plots.length>=plotLimit(s))throw new Error('当前住宅的药田容量已满，请先升级房屋。');
      spend(s,expansionPrice(s));s.plotSoils??=s.plots.map(()=>'normal');s.plots.push(null);s.plotSoils.push('normal');
      note(s,`扩建一块普通药田，现有${s.plots.length}块。`);break;
    }
    case 'soil': {
      const i=payload.index,soil=SOILS[payload.soil];
      if(!Number.isInteger(i)||i<0||i>=s.plots.length||!soil)throw new Error('药田或土地类型不存在。');
      if(s.plots[i])throw new Error('请先收获作物，再改造土地。');
      if(s.house<soil.house)throw new Error('住宅等级不足，尚未解锁该土地。');
      if((s.plotSoils?.[i]??'normal')===payload.soil)throw new Error('已经是这种土地。');
      spend(s,soil.price);s.plotSoils??=s.plots.map(()=>'normal');s.plotSoils[i]=payload.soil;
      note(s,`药田${i+1}改造为${soil.name}，土地类型在收获后保留。`);break;
    }
    case 'save-home-layout': {validateLayout(s,payload.layout);s.homeLayout=structuredClone(payload.layout);note(s,'小院布置已保存，生产状态不变。');break;}
    case 'read-story': {if(!s.journey.available.includes(payload.id))throw new Error('尚未发生这段故事。');if(!s.journey.seen.includes(payload.id))s.journey.seen.push(payload.id);break;}
    case 'farm-art': {
      const id=payload.item,a=FARM_ARTS[id];if(!a||!artUnlocked(s,id))throw new Error('境界不足，尚未领悟此仙术。');
      const targets=s.plots.filter(p=>p&&p.ready>s.day&&!p[id]);if(!targets.length)throw new Error('没有可施术的未成熟作物，每轮仅一次。');
      if(s.mana<a.mana)throw new Error('法力不足，可服回灵丹或休养。');expend(s,a.energy);s.mana-=a.mana;
      for(const p of targets){p[id]=true;if(id==='hasten')p.ready=Math.max(s.day,p.ready-1);}
      note(s,a.name+'施展成功，影响'+targets.length+'块药田。');break;
    }
    case 'rest': advance(s, 1, true); note(s, '休养一日，恢复气血与精力，丹毒渐消。'); break;
    case 'claim-quest': {const q=QUESTS.find(q=>q.id===payload.id);if(!q||!s.tutorial.completed.includes(q.id)||s.tutorial.claimed.includes(q.id))throw new Error('任务未完成或奖励已领取。');for(const [id,qty]of Object.entries(q.reward??{}))addItem(s,id,qty);s.cash+=q.cash??0;recordEconomy(s,'reward',q.cash??0);s.tutorial.claimed.push(q.id);note(s,'领取任务奖励：'+q.title);break;}
    case 'toggle-guide': s.tutorial.hidden=!s.tutorial.hidden;break;
    case 'toggle-sound': s.settings.sound=!s.settings.sound;break;
    case 'toggle-battle-hints': s.settings.battleHints=!s.settings.battleHints;break;
    case 'dismiss-notice': s.notices=s.notices.filter(n=>n.day!==payload.day);break;
    case 'market-buy': {
      const offer=s.marketOffers.find(o=>o.id===payload.id);if(!offer||offer.sold)throw new Error('该摊位货物已售罄。');
      if(offer.kind==='weapon'&&s.weapons.includes(offer.item)||offer.kind==='equipment'&&s.ownedEquipment.includes(offer.item))throw new Error('已经拥有该装备。');
      spend(s,offer.price);if(offer.kind==='item')addItem(s,offer.item,1);else if(offer.kind==='weapon')s.weapons.push(offer.item);else s.ownedEquipment.push(offer.item);
      offer.sold=true;note(s,'从集市购入'+({item:ITEMS,weapon:WEAPONS,equipment:EQUIPMENT}[offer.kind][offer.item].name)+'。');break;
    }
    case 'buy': {
      const item = ITEMS[payload.item]; const qty = payload.qty ?? 1;
      if(payload.item==='dew')throw new Error('凝露丹是青岚残卷丹方，只能自行炼制。');
      if(item?.grade===5)throw new Error('商店不出售传说级物品。');
      if (!item?.price || !Number.isSafeInteger(qty) || qty < 1) throw new Error('无法购买。');
      if (s.realm < (item.realm ?? 0)) throw new Error('境界不足，商品未解锁。');
      spend(s, item.price * qty); addItem(s, payload.item, qty); note(s, `购入${item.name} × ${qty}。`); break;
    }
    case 'sell': {
      const item = ITEMS[payload.item]; const qty = payload.qty ?? 1;
      if (!item?.sell || payload.item === 'supreme') throw new Error('商店不收购此物，极品洗髓丹无法交易。');
      if (!Number.isSafeInteger(qty) || qty < 1 || s.inventory[payload.item] < qty) throw new Error('库存数量不足。');
      s.inventory[payload.item] -= qty; s.cash += item.sell * qty; note(s, `出售${item.name} × ${qty}。`); break;
    }
    case 'furnace': {
      if(s.furnace>=5)throw new Error('丹炉已达到传说级。');
      const next=FURNACES[s.furnace+1];if(s.realm<next.realm)throw new Error('境界不足，尚未解锁该丹炉。');
      const furnace=FURNACES[s.furnace];if(materialCount(s,'ore')<furnace.ore)throw new Error('升级丹炉需要'+furnace.ore+'份赤铜矿。');spend(s,furnace.upgrade);let needed=furnace.ore;for(const key of materialKeys(s,'ore')){const take=Math.min(needed,s.inventory[key]);s.inventory[key]-=take;needed-=take;if(!needed)break;}s.furnace++;note(s,`丹炉升级为${next.name}，可炼制${PILL_GRADES[s.furnace]}及以下品质。`);break;
    }
    case 'brew': {
      const r = RECIPES[payload.item];
      if(r?.discovery&&!s.journey.dewRecipe)throw new Error('首次通关青岚竹海后发现凝露丹方。');
      if (!r || s.realm < r.realm || s.furnace < r.furnace) throw new Error('境界或丹炉等级不足。');
      const qty=payload.qty??1;
      if(!Number.isSafeInteger(qty)||qty<1)throw new Error('炼制数量须为正整数。');
      for (const [k,q] of Object.entries(r.materials)) if (materialCount(s,k) < q*qty) throw new Error(`${ITEMS[k].name}不足，本次需要${q*qty}份。`);
      const energyCost=s.furniture.table?12:18;
      if(s.energy<energyCost*qty)throw new Error(`精力不足，本次炼制${qty}枚需要${energyCost*qty}点精力。`);
      const inputCount=Object.values(r.materials).reduce((sum,n)=>sum+n*qty,0);
      if(inventoryCount(s)-inputCount+qty>capacity(s))throw new Error('背包空间不足，无法容纳本次可能炼成的丹药。');
      const chance=brewChance(s,ITEMS[payload.item].grade);
      expend(s,energyCost*qty);
      for (const [base,q]of Object.entries(r.materials)){let left=q*qty;for(const k of materialKeys(s,base)){const take=Math.min(left,s.inventory[k]);s.inventory[k]-=take;left-=take;if(!left)break;}}
      let successes=0;for(let i=0;i<qty;i++)if(random()*100<chance)successes++;
      const failures=qty-successes;
      s.alchemyXP=alchemyXP(s)+successes*10;
      if(successes){addItem(s,payload.item,successes);s.alchemy+=successes;}
      note(s,`炼制${ITEMS[payload.item].name}×${qty}：成功${successes}枚，失败${failures}枚${failures?'（失败材料作废）':''}，炼丹经验+${successes*10}（单枚成功率${chance}%）。`);
      s.lastBrew={item:payload.item,success:successes>0,successes,failures,qty,chance};break;
    }
    case 'consume': consume(s, payload.item); break;
    case 'cultivate': expend(s, 20); s.cultivation += 28 * (s.aptitude === 2 ? 2 : 1); advance(s); note(s, '静坐修炼一日，修为有所精进。'); break;
    case 'breakthrough': {
      if (s.realm >= REALMS.length-1 && s.level >= 10) throw new Error('已达到当前最高境界。');
      if(s.level<10)throw new Error('境界内等级会在修为达到对应经验门槛时自动提升，无需突破。');
      const required=cultivationRequired(s);
      if (s.cultivation < required) throw new Error(`修为不足，需要${required}修为。`);
      const breakthroughPill=BREAKTHROUGH_PILLS[s.realm];
      const needsBreakthroughPill=s.level>=10&&!!breakthroughPill;
      if(needsBreakthroughPill&&!s.inventory[breakthroughPill])throw new Error(`${REALMS[s.realm]}十级突破${REALMS[s.realm+1]}需要1颗${ITEMS[breakthroughPill].name}。`);
      s.cultivation -= required;
      if(needsBreakthroughPill)s.inventory[breakthroughPill]--;
      s.realm++; s.level = 1; s.lifeYears += 60; s.hp = maxHP(s); s.mana = maxMana(s); note(s, `${needsBreakthroughPill?'消耗1颗'+ITEMS[breakthroughPill].name+'，':''}踏入${REALMS[s.realm]}！寿元增加${60}年。${s.realm === 1 ? '御剑飞行、特殊仙草与催生术已解锁。' : ''}`);
      break;
    }
    case 'repay': {
      const amount = payload.amount;
      if (!Number.isSafeInteger(amount) || amount < 1 || amount > s.debt) throw new Error('请输入不超过欠款的正整数。');
      spend(s, amount); s.debt -= amount;
      if (!s.debt) s.nextCollection = null;
      note(s, `主动还款${amount}灵石。`); break;
    }
    case 'borrow': {
      const amount = payload.amount;
      if (!Number.isSafeInteger(amount) || amount < 1 || amount > availableCredit(s)) throw new Error('借款超过可用额度，或金额无效。');
      if (!s.debt) s.nextCollection = s.day + 30;
      s.debt += amount; s.cash += amount; note(s, `借入${amount}灵石，量力而行。`); break;
    }
    case 'ignore-order': {const o=s.orders.find(o=>o.id===payload.id);if(!o||o.done||o.ignored)throw new Error('该订单已处理。');o.ignored=true;note(s,'忽略'+o.owner+'的订单，下一批刷新时换新。');break;}
    case 'order': {
      const o = s.orders.find(o => o.id === payload.id);
      if (!o || o.done || o.ignored || s.inventory[o.item] < o.qty) throw new Error('订单已完成或物品不足。');
      s.inventory[o.item] -= o.qty; s.cash += o.reward; s.reputation += 5; o.done = true;
      note(s, `完成${o.owner}的订单，获得${o.reward}灵石。`); break;
    }
    case 'house': {
      if (s.house >= 3) throw new Error('住宅已达到本版最高级。');
      spend(s,[800,2200,6000][s.house]);s.house++;note(s,`住宅翻修完毕，储物空间增加，可扩建至${plotLimit(s)}块药田。`);break;
    }
    case 'furniture': {
      const prices = { cabinet: 350, bed: 450, table: 650 };
      if (!(payload.item in prices) || s.furniture[payload.item] || s.homeWarehouse.furniture.includes(payload.item)) throw new Error('家具已拥有或不存在，同类增益不叠加。');
      spend(s, prices[payload.item]); s.furniture[payload.item] = true; note(s, '新家具已安置在老屋中。'); break;
    }
    case 'store-home-material': case 'take-home-material': throw new Error('家园仓库仅收纳家具与摆件，药材和丹药请放在背包中。');
    case 'store-furniture': {
      if(!['cabinet','bed','table'].includes(payload.item)||!s.furniture[payload.item])throw new Error('这件家具当前没有安置。');
      s.furniture[payload.item]=false;if(!s.homeWarehouse.furniture.includes(payload.item))s.homeWarehouse.furniture.push(payload.item);note(s,'家具已收纳进家园仓库，增益暂停生效。');break;
    }
    case 'place-furniture': {
      if(!s.homeWarehouse.furniture.includes(payload.item)||s.furniture[payload.item])throw new Error('仓库中没有这件待安置家具。');
      s.homeWarehouse.furniture=s.homeWarehouse.furniture.filter(id=>id!==payload.item);s.furniture[payload.item]=true;note(s,'家具已从家园仓库取出并重新安置。');break;
    }
    case 'weapon': {
      const w = WEAPONS[payload.item];
      if (!w || s.realm < w.realm) throw new Error('境界不足。');
      if(!s.weapons.includes(payload.item))throw new Error('请先在商店购买该武器。');
      s.weapon = payload.item; note(s, `装备${w.name}。`); break;
    }
    case 'buy-weapon': {
      const w=WEAPONS[payload.item];if(w?.grade===5)throw new Error('商店不出售传说级武器。');if(!w||!w.price||s.realm<w.realm)throw new Error('该武器尚未解锁。');
      if(s.weapons.includes(payload.item))throw new Error('已拥有该武器。');spend(s,w.price);s.weapons.push(payload.item);note(s,`购入${w.name}，可在人物面板装备。`);break;
    }
    case 'buy-equipment': {
      const e=EQUIPMENT[payload.item];if(e?.grade===5&&action==='buy-equipment')throw new Error('商店不出售传说级装备。');if(!e||s.realm<e.realm)throw new Error('该装备尚未解锁。');
      if(s.ownedEquipment.includes(payload.item))throw new Error('已拥有该装备。');spend(s,e.price);s.ownedEquipment.push(payload.item);note(s,`购入${e.name}，可在人物面板穿戴。`);break;
    }
    case 'equip': {
      const e=EQUIPMENT[payload.item];if(!e||!s.ownedEquipment.includes(payload.item)||s.realm<e.realm)throw new Error('装备未拥有或境界不足。');
      s.equipped[e.slot]=payload.item;s.armor=!!s.equipped.body;s.hp=Math.min(s.hp,maxHP(s));s.mana=Math.min(s.mana,maxMana(s));note(s,`穿戴${e.name}。`);break;
    }
    case 'unequip': {
      if(!EQUIPMENT_SLOTS[payload.slot])throw new Error('装备部位不存在。');
      s.equipped[payload.slot]=null;s.armor=!!s.equipped.body;s.hp=Math.min(s.hp,maxHP(s));s.mana=Math.min(s.mana,maxMana(s));break;
    }
    case 'armor': if(s.armor)throw new Error('已装备护身衣袍。');spend(s,650);s.ownedEquipment.push('robe');s.equipped.body='robe';s.armor=true;note(s,'装备护身衣袍，气血上限与防御提升。');break;
    case 'use-skillbook': {const book=ITEMS[payload.item];if(!book?.skill||!s.inventory[payload.item])throw new Error('没有这本技能书。');const id=book.skill;if(s.learnedSkills.includes(id)&&(s.skillGrades[id]??0)>=book.grade)throw new Error('已掌握同等或更高品质技能。');s.inventory[payload.item]--;if(!s.learnedSkills.includes(id))s.learnedSkills.push(id);s.skillGrades[id]=book.grade;note(s,'研读'+book.name+'，学会'+SKILLS[id].name+'。');break;}
    case 'learn-skill': {const id=Object.keys(ITEMS).filter(k=>ITEMS[k].skill===payload.item&&s.inventory[k]>0).sort((a,b)=>ITEMS[b].grade-ITEMS[a].grade)[0];if(!id)throw new Error('请先在商店购买对应技能书。');return transition(s,'use-skillbook',{item:id});}
    case 'toggle-skill': {if(!s.learnedSkills.includes(payload.item))throw new Error('请先学习该技能。');if(s.skillLoadout.includes(payload.item))s.skillLoadout=s.skillLoadout.filter(k=>k!==payload.item);else{if(s.skillLoadout.length>=4)throw new Error('秘境最多携带四种技能，请先卸下一种。');s.skillLoadout.push(payload.item);}break;}
    case 'expedition': {
      if(!validLoadout(s))throw new Error('技能配置无效，最多携带四种已学技能。');
      const d = dungeonById(payload.dungeonId ?? s.selectedDungeon ?? DUNGEONS[0].id);
      if (!dungeonUnlocked(s,d)) throw new Error('境界等级不足，尚未解锁此秘境。');
      if (s.hp <= 0) throw new Error('请先休息恢复气血。');
      if(s.energy<30)throw new Error('精力不足，进入秘境需要30点精力。');
      s.selectedDungeon=d.id; advance(s);
      if(!s.failed){expend(s,30);note(s, `御剑前往${d.name}，出行消耗一日与30点精力。`);}
      break;
    }
    case 'sweep': {
      const d=dungeonById(payload.dungeonId??s.selectedDungeon);
      if(!d||(s.clearedDungeons??[]).includes(d.id)===false)throw new Error('通关该秘境后才能扫荡。');
      if(!sweepAvailable(s,d.id))throw new Error(`还需${sweepWait(s,d.id)}个游戏日恢复扫荡次数。`);
      expend(s,30);
      const loot=sweepLoot(d);
      for(const [item,qty]of Object.entries(loot))addItem(s,item,qty);
      s.sweepReadyDays??={};s.sweepReadyDays[d.id]=s.day+7;
      note(s,`消耗30点精力扫荡${d.name}，领取基础资源；第${s.day+7}日恢复1次。`);break;
    }
    case 'return': {
      // Combat data originates from this local prototype, and is settled once per outing.
      s.hp = maxHP(s); s.mana = Math.max(0, Math.min(maxMana(s), payload.mana));
      s.toxin=Math.max(0,Math.min(100,payload.toxin));
      if(payload.healingStock){
        for(const k of Object.keys(ITEMS).filter(k=>ITEMS[k].heal||ITEMS[k].manaRestore))s.inventory[k]=Math.min(s.inventory[k],Math.max(0,payload.healingStock[k]??s.inventory[k]));
      }else{const consumedHeal=ITEMS[payload.healItem]?.heal?payload.healItem:'heal';s.inventory[consumedHeal]=Math.max(0,payload.heal);}
      if (payload.doubleJump) s.doubleJump = true;
      if (payload.bossDefeated && !payload.defeated) {
        s.bossDefeated = true;
        s.clearedDungeons ??= [];
        const id = s.selectedDungeon ?? DUNGEONS[0].id;
        if (!s.clearedDungeons.includes(id)) s.clearedDungeons.push(id);
      }
      const loot = payload.loot ?? {};const brought={};const usedPills=Object.entries(ITEMS).filter(([,i])=>i.heal||i.manaRestore).map(([id])=>({id,qty:Math.max(0,(state.inventory[id]??0)-(s.inventory[id]??0))})).filter(i=>i.qty); 
      for (const [k,q] of Object.entries(loot)) {
        if (!ITEMS[k] || !Number.isSafeInteger(q) || q < 0) continue;
        const kept = payload.defeated ? Math.floor(q / 2) : q;
        const actual = Math.min(kept, Math.max(0, capacity(s) - inventoryCount(s)));
        s.inventory[k] += actual;brought[k]=actual;
        if (actual < kept) note(s, '背包已满，部分秘境资源无法带回。');
      }
      s.lastExpedition={dungeon:s.selectedDungeon,defeated:!!payload.defeated,cleared:!!payload.bossDefeated&&!payload.defeated,loot:brought,usedPills,sweepUnlocked:s.clearedDungeons.includes(s.selectedDungeon)};
      note(s, payload.defeated ? '重伤撤回住宅，本次战利品仅保留一半；已有资产不损失。' : '从秘境返回，战利品收入库存。');
      advance(s); break;
    }
    default: throw new Error('未知操作。');
  }
  if(!s.failed)advanceMinorRanks(s);
  if (!s.won && !s.debt && s.aptitude === 2) { s.won = true; note(s, '债务清零，洗髓重生。你终于拥有了自己的修仙人生。'); }
  return s;
}

export function transition(state,action,payload={},random=Math.random){const s=baseTransition(state,action,payload,random);trackChapter(s,state,action,payload);updateJourney(s);syncLayout(s);return s;}
