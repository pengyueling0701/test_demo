import {preparePet,petCapacity} from './pets.js';
import {APTITUDE_STAGES,aptitudeLevel,beginNpcEncounter,advanceNpc} from './aptitude.js';
import {buffValue,applyBuff} from './pill-buffs.js';
import {criticalRate,dodgeRate} from './combat-stats.js';
export {criticalRate,dodgeRate} from './combat-stats.js';
import {startRoute,routeAction,routeResult} from './route-expedition.js';
import {bagCapacity,bagUpgrade,bagUsed,bagRoom,migrateBag} from './backpack.js';
import {beginManual,manualAction,finishManual} from './manual-alchemy.js';
import {GARDENS,migrateGarden} from './garden.js';
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
import {freshProduction,migrateProduction,settleProduction,claimProduction,cancelQueue,cropCycleMs,brewDurationMs,queueLimit,idleRate,dungeonProgress} from './idle.js';
export const REALMS = ['炼气', '筑基', '金丹', '元婴'];
export const BASE_CREDIT = [1000000, 2000000, 5000000, 10000000];
export const BREAKTHROUGH_PILLS = ['foundationPill','goldenPill','nascentPill'];
export const ITEMS = {
  hide:{name:'兽皮',sell:60,grade:1,realm:0},
  dew:{name:'初级凝露丹',price:1200,sell:900,grade:1,realm:1,cultivation:55,toxin:10},
  manaPill:{name:'粗制回灵丹',price:150,sell:110,grade:0,manaRestore:40,toxin:18},
  manaPill1:{name:'初级回灵丹',price:300,sell:225,grade:1,manaRestore:65,toxin:16},
  seed: { name: '青灵草种子', price: 30, sell: 0 },
  fruitSeed:{name:'饲灵果种子',price:30,sell:0,realm:0},
  fruit:{name:'饲灵果',price:120,sell:90,realm:0,collateral:true},
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
  foundationPill:{materials:{herb:4,core:1},realm:0,furnace:1},
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
assignElements(ITEMS,{seed:'wood',herb:'wood',moonSeed:'water',moon:'water',fireSeed:'fire',fireHerb:'fire',frostSeed:'water',frostHerb:'water',ore:'metal',core:'earth',hide:'earth',supreme:'earth',foundationPill:'earth',goldenPill:'metal',nascentPill:'water',manaPill:'water',manaPill1:'water'},'wood');
assignElements(WEAPONS,{},'metal');
// Material quality is separate from consumable effects.
for(const item of Object.values(ITEMS))item.pill=!!(item.heal||item.manaRestore||item.cultivation||item.breakthroughOnly||item===ITEMS.supreme);
for(const [id,item]of Object.entries(ITEMS))if(item.grade===undefined)item.grade=['herb','fruit','moon','fireHerb','frostHerb','core'].includes(id)?1:0;
for(const [id,skill]of Object.entries(SKILLS))ITEMS['book_'+id]={name:skill.name+'技能书',price:Math.max(150,skill.cost),sell:Math.max(75,Math.floor(skill.cost/2)),element:skill.element,grade:1,skill:id};
for(const [id,item]of Object.entries({...ITEMS})){
 if(item.pill&&!item.manaRestore)continue;
 const first=item.skill?1:['herb','fruit','moon','fireHerb','frostHerb','core'].includes(id)?1:0;
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
// Four temporary pill families, six quality grades each.
for(const [id,name,stat,element]of [['mightPill','强攻丹','attack','fire'],['guardPill','护体丹','defense','earth'],['keenPill','凝神丹','critical','metal'],['windPill','轻身丹','dodge','wood']])for(let grade=0;grade<6;grade++){
 const key=grade?id+'_q'+grade:id,value=stat==='attack'?8+grade*4:stat==='defense'?4+grade*2:.05+grade*.02;
 ITEMS[key]={name:PILL_GRADES[grade]+name,grade,baseItem:grade?id:undefined,element,realm:grade>=4?3:grade>=3?2:0,pill:true,buff:{stat,value},toxin:Math.max(8,12-grade),sell:150};
 RECIPES[key]={materials:{herb:2+grade,...(grade>=2?{moon:1}:{}),...(grade>=4?{core:1}:{})},realm:ITEMS[key].realm,furnace:grade};
}
for(let grade=0;grade<6;grade++){const id=grade?'tamePill_q'+grade:'tamePill';ITEMS[id]={name:PILL_GRADES[grade]+'御兽丹',grade,realm:grade>=4?3:grade>=3?2:0,element:'wood',pill:true,tame:true,toxin:0,sell:200};RECIPES[id]={materials:{fruit:3+grade,core:1,...(grade>=2?{moon:1}:{})},realm:ITEMS[id].realm,furnace:grade};}
for(const t of APTITUDE_STAGES){ITEMS[t.key]={name:t.keyName,grade:t.grade,element:t.element,storyMaterial:true,sell:0};ITEMS[t.pill]={name:'第'+t.level+'级洗髓丹',grade:t.grade,element:t.element,realm:t.realm,pill:true,aptitudeTier:t.level,sell:0,toxin:15+t.level};RECIPES[t.pill]={materials:{...t.materials,[t.key]:1},realm:t.realm,furnace:t.grade};}
// Processing compensates for risk; discount buying remains more expensive than resale.
for(const [id,r] of Object.entries(RECIPES)){
 if(ITEMS[id].aptitudeTier||id==='dew'||ITEMS[id].breakthroughOnly)continue;
 const direct=Object.entries(r.materials).reduce((n,[k,q])=>n+(ITEMS[k].sell??0)*q,0);
 ITEMS[id].sell=Math.max(ITEMS[id].sell??0,Math.ceil(direct*(1.45+ITEMS[id].grade*.12)/10)*10);
 ITEMS[id].price=Math.ceil(ITEMS[id].sell/.75/10)*10;
}
export const materialKeys=(s,base)=>Object.keys(ITEMS).filter(k=>(k===base||ITEMS[k].baseItem===base)&&s.inventory[k]>0).sort((a,b)=>ITEMS[a].grade-ITEMS[b].grade);
export const materialCount=(s,base)=>materialKeys(s,base).reduce((n,k)=>n+s.inventory[k],0);
export const marketCatalog=()=>[...Object.entries(ITEMS).filter(([id,i])=>i.price&&!i.legacyVariant&&id!=='supreme'&&id!=='dew').map(([item,i])=>({kind:'item',item,...i})),...Object.entries(WEAPONS).filter(([,i])=>i.price).map(([item,i])=>({kind:'weapon',item,...i})),...Object.entries(EQUIPMENT).map(([item,i])=>({kind:'equipment',item,...i}))];
export function initialState(now=Date.now()) {
  return {
    criticalRate:.05,dodgeRate:.05,temporaryBuffs:{},pets:[],petCapacity:5,petHouseUnlocked:false,selectedPet:null,
    roots:['metal','wood','water','fire','earth'],learnedSkills:[],skillLoadout:[],skillGrades:{},
    journey:freshJourney(),tutorial:freshTutorial(),economy:freshEconomy(),settings:{sound:true,battleHints:true},notices:[],remindedDays:[],
    marketCycle:0,marketOffers:makeMarket(0,marketCatalog()),
    gardenVersion:1,gardens:['normal'],version:1,systemsVersion:2,productionVersion:1,day:1,realm:0,level:5,cultivation:0,
    cash: 500, debt: 0, nextCollection: null,production:freshProduction(now),dungeonStages:{},
    ageDays: 0, lifeYears: 90, startAge: 30, aptitude: 0,aptitudeVersion:1,aptitudeLevel:0,npcStories:[],npcEncounter:null,
    energy: 100, hp: 100, mana: 60, toxin: 0,
    farming: 0, alchemy: 0, alchemyXP:0, reputation: 0,
    bagVersion:2,bagLegacyBonus:0,pendingLoot:{},lockedItems:[],bagLevel:0,house: 0, furnace: 0, furniture: { cabinet: false, bed: false, table: false },homeWarehouse:{furniture:[]},
    inventory:Object.fromEntries(Object.keys(ITEMS).map(k=>[k,k==='seed'?8:0])),
    plots: Array.from({ length: 9 }, () => null),
    plotSoils:Array.from({length:9},()=>'normal'),
    weapon: 'wood', weapons: ['wood'], armor: false,
    equipped:emptyEquipment(),ownedEquipment:[],
    doubleJump: false, bossDefeated: false, clearedDungeons: [],sweepReadyDays:{},selectedDungeon: DUNGEONS[0].id, failed: false, won: false,
    orders: makeOrders(0), orderCycle: 0,
    log:['带着500灵石回到乡下，开始重建自己的丹房。','药田播种收获，蒲团修行不停；旧箱中藏着改变资质的丹方。'],
  };
}
export function restoreState(raw,now=Date.now()) {
  if(!raw||raw.version!==1||!raw.inventory||!Array.isArray(raw.plots)||!Number.isFinite(raw.cash)||!Number.isFinite(raw.debt))return initialState(now);
  const defaults=initialState(now);if(raw.aptitudeVersion!==1){raw=structuredClone(raw);raw.aptitudeLevel=raw.aptitude===2?10:0;raw.aptitudeVersion=1;}

  const s={...defaults,...structuredClone(raw),inventory:{...defaults.inventory,...raw.inventory},furniture:{...defaults.furniture,...raw.furniture},homeWarehouse:{...defaults.homeWarehouse,...raw.homeWarehouse,furniture:[...(raw.homeWarehouse?.furniture??[])]}};
  const legacyMaterials=raw.homeWarehouse?.materials??{};let returnedMaterials=0;
  for(const [id,qty] of Object.entries(legacyMaterials))if(ITEMS[id]&&Number.isSafeInteger(qty)&&qty>0){s.inventory[id]=(s.inventory[id]??0)+qty;returnedMaterials+=qty;}
  if(returnedMaterials)note(s,`家园仓库调整：旧存药材与丹材已移入背包，共${returnedMaterials}份。`);
  delete s.homeWarehouse.materials;
  if(raw.gardenVersion!==1)delete s.gardenVersion;
  s.plotSoils=s.plots.map((_,i)=>Object.hasOwn(SOILS,raw.plotSoils?.[i])?raw.plotSoils[i]:'normal');
  s.clearedDungeons=raw.clearedDungeons??(raw.bossDefeated?[DUNGEONS[0].id]:[]);
  s.selectedDungeon=raw.selectedDungeon??DUNGEONS[0].id;
  s.sweepReadyDays={...raw.sweepReadyDays};
  s.equipped={...emptyEquipment(),...raw.equipped};s.ownedEquipment=[...(raw.ownedEquipment??[])];
  if(raw.armor&&!s.equipped.body){s.equipped.body='robe';if(!s.ownedEquipment.includes('robe'))s.ownedEquipment.push('robe');}
  if(raw.systemsVersion!==2){s.furnace=raw.furnace>=2?3:(raw.furnace??0);s.systemsVersion=2;}
  s.roots=[...defaults.roots];s.learnedSkills=raw.learnedSkills??raw.skillLoadout??[];s.skillLoadout=raw.skillLoadout??[];s.skillGrades={...raw.skillGrades};for(const id of s.learnedSkills)s.skillGrades[id]=Math.max(1,s.skillGrades[id]??1);
  const marketCycle=Math.floor((s.day-1)/7);s.marketCycle=raw.marketCycle??marketCycle;s.marketOffers=raw.marketOffers??makeMarket(marketCycle,marketCatalog());
  for(const [id,n] of Object.entries(s.inventory))if(/^book_.*_q[01]$/.test(id)){const base=id.replace(/_q[01]$/,'');s.inventory[base]=(s.inventory[base]??0)+n;delete s.inventory[id];}for(const o of s.marketOffers)if(o.kind==='item'&&/^book_.*_q[01]$/.test(o.item))o.item=o.item.replace(/_q[01]$/,'');
  s.marketOffers=s.marketOffers.filter(o=>o.kind!=='item'||o.item.split('_q')[0]!=='hide');
  migrateChapter(s,raw);
  s.journey=raw.journey?structuredClone(raw.journey):freshJourney();updateJourney(s);
  s.alchemyXP=raw.alchemyXP??(raw.alchemy??0)*10;
  if(!s.failed)advanceMinorRanks(s);
  if(raw.productionVersion!==1){for(const o of s.marketOffers){const catalog={item:ITEMS,weapon:WEAPONS,equipment:EQUIPMENT}[o.kind];if(catalog?.[o.item]?.price)o.price=Math.max(1,Math.floor(catalog[o.item].price*.8));}s.productionVersion=1;}

  migrateProduction(s,raw,now);s.debt=0;s.nextCollection=null;s.failed=false;s.notices=[];
  migrateBag(s,raw);settleProduction(s,now);advanceMinorRanks(s);updateJourney(s);migrateGarden(s);return s;
}
export function makeOrders(cycle,realm=0,dewUnlocked=false) {
  const trainingPill=realm>=3?'rare':realm>=2?'advanced':realm>=1?'mid':'spirit',third=realm>=1&&dewUnlocked&&cycle%2?'dew':trainingPill;
  return [
    { id: `${cycle}-herb`, item: 'herb', qty: 4 + cycle % 3, reward: 650 + (cycle % 3) * 130, done: false, owner: '云游药师' },
    { id: `${cycle}-heal`, item: cycle%2?'manaPill':'heal', qty: 2 + cycle % 2, reward: (2+cycle%2)*Math.round(ITEMS[cycle%2?'manaPill':'heal'].sell*1.4), done: false, owner: '山中剑修' },
    { id: `${cycle}-spirit`, item: third, qty: 2, reward: 2*Math.round(ITEMS[third].sell*1.4), done: false, owner: '清溪道人' },
  ];
}
export const lifeLeft = s => Math.max(0, s.lifeYears - s.startAge - s.ageDays / 360);
export const lifeFactor = s => Math.min(1.5, Math.max(0, lifeLeft(s) / 60));
export const credit = s => Math.floor(BASE_CREDIT[s.realm] * lifeFactor(s));
export const availableCredit = () => 0;
export const maxHP=s=>100+s.realm*40+equipmentStats(s).hp;
export const maxMana=s=>60+s.realm*30+equipmentStats(s).mana;
export const attack=s=>WEAPONS[s.weapon].attack+s.realm*8+equipmentStats(s).attack+buffValue(s,'attack');
export const defense=s=>s.realm*2+equipmentStats(s).defense+buffValue(s,'defense');
export const healingItem=s=>Object.keys(ITEMS).filter(k=>ITEMS[k].heal&&s.inventory[k]>0).sort((a,b)=>ITEMS[b].grade-ITEMS[a].grade)[0]??'heal';
export const capacity = bagCapacity;
export const inventoryCount = bagUsed;
export function note(s, message) { s.log.unshift(`第${s.day}日 · ${message}`); s.log = s.log.slice(0, 35); }
function advanceMinorRanks(s) {
  while(s.level<10&&s.cultivation>=cultivationRequired(s)){
    s.cultivation-=cultivationRequired(s);s.level++;
    note(s,`修为积满，自动提升至${REALMS[s.realm]}${s.level}级。${s.realm===0&&s.level===7?'领悟引露术，可在药田照料作物。':''}`);
  }
}
export function addItem(s, item, qty) {
  if (qty > bagRoom(s,item)) throw new Error('储物空间不足，请出售物品或扩容背包。');
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
export function collectDebt(s) { s.debt=0;s.nextCollection=null; }
export function advance(s, days = 1, resting = false, recoverEnergy = true) {
  for (let i = 0; i < days && !s.failed; i++) {
    s.day++; s.ageDays++;
    if(recoverEnergy)s.energy = Math.min(100, s.energy + (resting ? 70 + (s.furniture.bed ? 20 : 0) : 28));
    s.toxin = Math.max(0, s.toxin - (resting ? 18 : 6));
    if (resting) { s.hp = maxHP(s); s.mana = maxMana(s); }
    const cycle = Math.floor((s.day - 1) / 7);
    if(cycle!==s.marketCycle){s.marketCycle=cycle;s.marketOffers=makeMarket(cycle,marketCatalog());note(s,'集市已换上新一批货物。');}
    if (cycle !== s.orderCycle) {
      s.orderCycle = cycle; s.orders = makeOrders(cycle,s.realm,s.journey?.dewRecipe); note(s, '道友发布了新一批订单，旧订单已替换。');
    }
  }
}
export function consume(s, item) {
  const pill=ITEMS[item];
  if(pill?.tame)throw new Error('御兽丹只能在秘境中对低血量妖兽使用。');
  if(pill?.breakthroughOnly)throw new Error(pill.name+'用于境界突破，不能直接服用。');
  if(pill?.manaRestore&&s.mana>=maxMana(s))throw new Error('法力已满，无需服用回灵丹。');
  if(!pill?.pill)throw new Error('这件物品不能服用。');
  if (!s.inventory[item]) throw new Error('没有这颗丹药。');
  if (s.toxin >= 100) throw new Error('丹毒已满，休养后才能继续服丹。');
  if(pill.aptitudeTier&&pill.aptitudeTier!==aptitudeLevel(s)+1)throw new Error('需按顺序服用第'+(aptitudeLevel(s)+1)+'级洗髓丹。');
  if(pill.heal&&s.hp>=maxHP(s))throw new Error('气血已满，无需服用回春丹。');
  if(pill.buff)applyBuff(s,pill,s.toxin);
  s.inventory[item]--;
  const efficacy = Math.max(0.2, 1 - s.toxin / 125);
  if(pill.heal)s.hp=Math.min(maxHP(s),s.hp+Math.round(pill.heal*efficacy));
  if(pill.manaRestore)s.mana=Math.min(maxMana(s),s.mana+Math.round(pill.manaRestore*efficacy));
  if(pill.cultivation)s.cultivation+=Math.round(pill.cultivation*efficacy);
  if(pill.aptitudeTier){s.aptitudeLevel=pill.aptitudeTier;s.aptitude=s.aptitudeLevel===10?2:0;note(s,'洗髓成功，资质提升至'+s.aptitudeLevel+'级，修炼效率提高。');}
  s.toxin=Math.min(100,s.toxin+pill.toxin);
  note(s, `服下${ITEMS[item].name}，丹毒增加。`);
}
function baseTransition(state, action, payload = {}, random = Math.random,now=Date.now()) {
  const s = structuredClone(state);
  now=Math.max(now,s.production?.lastAt??now);
  settleProduction(s,now);
  if (s.failed) throw new Error('本局已结束，请重新开始。');
  switch (action) {
    case 'unlock-garden': {const garden=GARDENS.find(g=>g.id===payload.soil);if(!garden||garden.id==='normal')throw new Error('土地类型不存在。');if(s.gardens?.includes(garden.id))throw new Error('这片药田已经开放。');if(s.realm<garden.realm)throw new Error('修仙境界不足。');spend(s,garden.price);s.gardens.push(garden.id);for(let i=0;i<9;i++){s.plots.push(null);s.plotSoils.push(garden.id);}note(s,'已开放'+garden.name+'，新增九块药田。');break;}
    case 'upgrade-bag': {const upgrade=bagUpgrade(s);if(upgrade&&s.realm<upgrade.realm)throw new Error('需'+REALMS[upgrade.realm]+'境界才能扩容。');if(!upgrade)throw new Error('背包已升至最高等级。');if(materialCount(s,'hide')<upgrade.hide)throw new Error('兽皮不足。');spend(s,upgrade.cash);let left=upgrade.hide;for(const id of materialKeys(s,'hide')){const take=Math.min(left,s.inventory[id]);s.inventory[id]-=take;left-=take;if(!left)break;}s.bagLevel=(s.bagLevel??0)+1;note(s,'背包扩容至'+capacity(s)+'，消耗'+upgrade.cash+'灵石与'+upgrade.hide+'张兽皮。');break;}
    case 'plant-all': {
      const cropId=payload.crop??'herb',crop=CROPS[cropId];if(!crop||s.realm<crop.realm)throw new Error('草药尚未解锁。');
      const targets=s.plots.map((p,i)=>!p&&crop.soils.includes(s.plotSoils[i])?i:-1).filter(i=>i>=0).slice(0,materialCount(s,crop.seed));
      if(!targets.length)throw new Error('没有适合这类草药的空田，请先铲除作物。');
      if(materialCount(s,crop.seed)<targets.length)throw new Error(`批量启用${targets.length}块药田需要${targets.length}份种子。`);
      let result=s;for(const index of targets)result=baseTransition(result,'plant',{index,crop:cropId},random,now);return result;
    }
    case 'plant': {
      const i = payload.index;
      const cropId=payload.crop??'herb',block=plantingBlock(s,i,cropId);
      if(block)throw new Error(block);
      const crop=CROPS[cropId];
      const seed=payload.seed??materialKeys(s,crop.seed)[0];if(!materialKeys(s,crop.seed).includes(seed))throw new Error('没有所选品质的种子。');s.inventory[seed]--;s.plots[i]={crop:cropId,grade:Math.max(1,ITEMS[seed].grade),continuous:true,lastAt:now,firstReadyAt:now+(s.farming===0?60000:cropCycleMs(cropId)),buffer:0,cycleMs:cropCycleMs(cropId)};
      note(s,`播种${crop.name}；消耗一份种子，成熟收获后需重新播种。`);break;
    }
    case 'harvest': {
      if(!s.plots[payload.index]?.buffer)throw new Error('暂无成熟灵草，现实时间会持续生产。');const p=s.plots[payload.index],base=CROPS[p.crop??'herb'].item,id=(p.grade??1)===1?base:base+'_q'+p.grade;if(!bagRoom(s,id))throw new Error('背包已满，成熟仙草继续保留。');
      
      claimProduction(s,'farm',payload.index);break;
    }
    case 'claim-production': claimProduction(s,payload.kind??'all');break;
    case 'cancel-brew': cancelQueue(s);break;
    case 'stop-plot': {const p=s.plots[payload.index];if(!p)throw new Error('药田尚未启用。');if(p.buffer)throw new Error('请先领取已产出的灵草。');s.plots[payload.index]=null;note(s,'已铲除作物，可重新播种。');break;}
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
    case 'pet-select': {if(s.routeRun)throw new Error('探索中不能更换同行灵兽。');if(!s.pets.some(p=>p.id===payload.item))throw new Error('未拥有这只灵兽。');s.selectedPet=s.selectedPet===payload.item?null:payload.item;break;}
    case 'npc-next': advanceNpc(s);break;
    case 'read-story': {if(!s.journey.available.includes(payload.id))throw new Error('尚未发生这段故事。');if(!s.journey.seen.includes(payload.id))s.journey.seen.push(payload.id);break;}
    case 'farm-art': {
      const id=payload.item,a=FARM_ARTS[id];if(!a||!artUnlocked(s,id))throw new Error('境界不足，尚未领悟此仙术。');
      const targets=s.plots.filter(p=>p?.continuous&&!p[id]);if(!targets.length)throw new Error('没有可施术的药田，本轮已施术。');
      if(s.mana<a.mana)throw new Error('法力不足，可服回灵丹或休养。');expend(s,a.energy);s.mana-=a.mana;
      for(const p of targets){p[id]=true;if(id==='hasten'){if(p.firstReadyAt)p.firstReadyAt=Math.max(now,p.firstReadyAt-30000);else p.lastAt-=Math.floor(p.cycleMs/4);}}
      note(s,a.name+'施展成功，影响'+targets.length+'块药田。');break;
    }
    case 'rest': advance(s, 1, true); note(s, '休养一日，恢复气血与精力，丹毒渐消。'); break;
    case 'claim-quest': {const q=QUESTS.find(q=>q.id===payload.id);if(!q||!s.tutorial.completed.includes(q.id)||s.tutorial.claimed.includes(q.id))throw new Error('任务未完成或奖励已领取。');for(const [id,qty]of Object.entries(q.reward??{}))addItem(s,id,qty);s.cash+=q.cash??0;s.cultivation+=q.xp??0;recordEconomy(s,'reward',q.cash??0);s.tutorial.claimed.push(q.id);note(s,'领取任务奖励：'+q.title);break;}
    case 'toggle-guide': s.tutorial.hidden=!s.tutorial.hidden;break;
    case 'toggle-sound': s.settings.sound=!s.settings.sound;break;
    case 'toggle-battle-hints': s.settings.battleHints=!s.settings.battleHints;break;
    case 'dismiss-notice': s.notices=s.notices.filter(n=>n.day!==payload.day);break;
    case 'market-buy': {
      const offer=s.marketOffers.find(o=>o.id===payload.id);if(offer?.kind==='item'&&offer.item.split('_q')[0]==='hide')throw new Error('兽皮只能从秘境获取。');if(!offer||offer.sold)throw new Error('该摊位货物已售罄。');
      if(offer.kind==='weapon'&&s.weapons.includes(offer.item)||offer.kind==='equipment'&&s.ownedEquipment.includes(offer.item))throw new Error('已经拥有该装备。');
      spend(s,offer.price);if(offer.kind==='item')addItem(s,offer.item,1);else if(offer.kind==='weapon')s.weapons.push(offer.item);else s.ownedEquipment.push(offer.item);
      offer.sold=true;note(s,'从集市购入'+({item:ITEMS,weapon:WEAPONS,equipment:EQUIPMENT}[offer.kind][offer.item].name)+'。');break;
    }
    case 'buy': {
      const item = ITEMS[payload.item]; const qty = payload.qty ?? 1;
      if(payload.item==='ore'||item?.baseItem==='ore')throw new Error('商店不出售矿石，可通过秘境采矿或集市获取。');
      if(item?.pill)throw new Error('商店不再出售丹药，请自行炼制或前往集市。');
      if(payload.item==='dew')throw new Error('凝露丹是青岚残卷丹方，只能自行炼制。');
      if(item?.grade===5)throw new Error('商店不出售传说级物品。');
      if (!item?.price || !Number.isSafeInteger(qty) || qty < 1) throw new Error('无法购买。');
      if (s.realm < (item.realm ?? 0)) throw new Error('境界不足，商品未解锁。');
      spend(s, item.price * qty); addItem(s, payload.item, qty); note(s, `购入${item.name} × ${qty}。`); break;
    }
    case 'toggle-item-lock': {if(!ITEMS[payload.item])throw new Error('物品不存在。');s.lockedItems??=[];s.lockedItems=s.lockedItems.includes(payload.item)?s.lockedItems.filter(id=>id!==payload.item):[...s.lockedItems,payload.item];break;}
    case 'claim-loot': {for(const [id,n] of Object.entries(s.pendingLoot??{})){const qty=Math.min(n,bagRoom(s,id));if(qty){s.inventory[id]=(s.inventory[id]??0)+qty;s.pendingLoot[id]-=qty;}}note(s,'已领取秘境战利品，放不下的继续保留。');break;}
    case 'market-sell': case 'sell': {
      if(action==='market-sell'&&!ITEMS[payload.item]?.pill)throw new Error('此入口仅出售丹药。');
      if(s.lockedItems?.includes(payload.item))throw new Error('物品已锁定，请先解锁。');
      const item = ITEMS[payload.item]; const qty = payload.qty ?? 1;
      if (!item?.sell || payload.item === 'supreme') throw new Error('商店不收购此物，极品洗髓丹无法交易。');
      if (!Number.isSafeInteger(qty) || qty < 1 || s.inventory[payload.item] < qty) throw new Error('库存数量不足。');
      s.inventory[payload.item] -= qty; s.cash += item.sell * qty; note(s, `出售${item.name} × ${qty}。`); break;
    }
    case 'furnace': {
      if(s.manualBrew||s.production.queue)throw new Error('请先完成当前炼丹，再升级丹炉。');
      if(s.furnace>=5)throw new Error('丹炉已达到传说级。');
      const next=FURNACES[s.furnace+1];if(s.realm<next.realm)throw new Error('境界不足，尚未解锁该丹炉。');
      const furnace=FURNACES[s.furnace];if(materialCount(s,'ore')<furnace.ore)throw new Error('升级丹炉需要'+furnace.ore+'份赤铜矿。');spend(s,furnace.upgrade);let needed=furnace.ore;for(const key of materialKeys(s,'ore')){const take=Math.min(needed,s.inventory[key]);s.inventory[key]-=take;needed-=take;if(!needed)break;}s.furnace++;note(s,`丹炉升级为${next.name}，可炼制${PILL_GRADES[s.furnace]}及以下品质。`);break;
    }
    case 'prepare-manual': {const prepared=baseTransition(s,'brew',payload,random,now);prepared.log.shift();prepared.production.queue.grade=ITEMS[payload.item].grade;beginManual(prepared,prepared.production.queue);note(prepared,'本批材料已取出，请拖入丹炉、捣药并生火。');return prepared;}
    case 'load-material': case 'grind-material': case 'light-furnace': case 'cancel-manual': manualAction(s,action,payload);break;
    case 'finish-manual': {const result=finishManual(s);note(s,'炼丹完成：成功'+result.successes+'枚，失败'+result.failures+'枚；火候稳定度'+result.fireQuality+'%。');break;}
    case 'brew': {
      const r = RECIPES[payload.item];
      if(r?.discovery&&!s.journey.dewRecipe)throw new Error('首次通关青岚竹海后发现凝露丹方。');
      if (!r || s.realm < r.realm || s.furnace < r.furnace) throw new Error('境界或丹炉等级不足。');
      const qty=payload.qty??1;
      if(!Number.isSafeInteger(qty)||qty<1)throw new Error('炼制数量须为正整数。');
      if(s.production.queue||s.manualBrew)throw new Error('丹炉一次只能炼一种丹，请先完成当前批次。');
      if(qty>queueLimit(s))throw new Error(`丹炉最多安排${queueLimit(s)}枚，升级丹炉可扩充队列。`);
      for (const [k,q] of Object.entries(r.materials)) if (materialCount(s,k) < q*qty) throw new Error(`${ITEMS[k].name}不足，本次需要${q*qty}份。`);
      const chance=brewChance(s,ITEMS[payload.item].grade);
      const units=[];
      for(let i=0;i<qty;i++){const materials={};for(const [base,q]of Object.entries(r.materials)){let left=q;for(const k of materialKeys(s,base)){const take=Math.min(left,s.inventory[k]);s.inventory[k]-=take;materials[k]=(materials[k]??0)+take;left-=take;if(!left)break;}}const roll=random()*100;units.push({materials,roll,success:roll<chance});}
      s.production.queue={item:payload.item,units,done:0,failures:0,chance,startedAt:now,durationMs:brewDurationMs(ITEMS[payload.item].grade,s)};
      note(s,`安排${ITEMS[payload.item].name}×${qty}，材料已投入，离线继续炼制；成功率${chance}%。`);break;
    }
    case 'consume': {const qty=payload.qty??1;if(!Number.isSafeInteger(qty)||qty<1||qty>(s.inventory[payload.item]??0))throw new Error('数量无效或库存不足。');for(let i=0;i<qty;i++){const pill=ITEMS[payload.item];if(i&&(ITEMS[payload.item].buff||s.toxin>=100||pill.heal&&s.hp>=maxHP(s)||pill.manaRestore&&s.mana>=maxMana(s)||pill.aptitudeTier))break;consume(s,payload.item);}break;}
    case 'cultivate': claimProduction(s,'idle');break;
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
    case 'repay': case 'borrow': throw new Error('借贷与强制催收已取消。');
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
    case 'start-route': {if(s.routeRun)throw new Error('请先结束当前探索。');const prepared=baseTransition(s,'expedition',{dungeonId:'qinglan',petId:payload.petId},random,now);startRoute(prepared,{hp:maxHP(prepared),mana:maxMana(prepared),attack:attack(prepared),defense:defense(prepared),criticalRate:prepared.criticalRate,dodgeRate:prepared.dodgeRate},payload.supplies,ITEMS);return prepared;}
    case 'route-action': {routeAction(s,payload,ITEMS,random);if(s.routeRun.phase==='finished'){const run=structuredClone(s.routeRun),result=routeResult(s,ITEMS);s.routeRun=null;const returned=baseTransition(s,'return',result,random,now);returned.lastRoute={...run,loot:result.loot,usedPills:Object.entries(run.used).map(([id,qty])=>({id,qty}))};returned.lastExpedition.usedPills=returned.lastRoute.usedPills;return returned;}break;}
    case 'expedition': {
      if(s.routeRun)throw new Error('请先结束当前探索。');
      if(!validLoadout(s))throw new Error('技能配置无效，最多携带四种已学技能。');
      const d = dungeonById(payload.dungeonId ?? s.selectedDungeon ?? DUNGEONS[0].id);
      if (!dungeonUnlocked(s,d)) throw new Error('境界等级不足，尚未解锁此秘境。');
      if (s.hp <= 0) throw new Error('请先休息恢复气血。');
      if(s.energy<30)throw new Error('精力不足，进入秘境需要30点精力。');
      if(payload.petId!==undefined)s.selectedPet=payload.petId||null;s.expeditionPet=preparePet(s);s.selectedDungeon=d.id;beginNpcEncounter(s,d.id); advance(s,1,false,false);
      if(!s.failed){expend(s,30);note(s, `御剑前往${d.name}，出行消耗一日与30点精力。`);}
      break;
    }
    case 'sweep': {
      const d=dungeonById(payload.dungeonId??s.selectedDungeon);
      if(!d||(s.clearedDungeons??[]).includes(d.id)===false)throw new Error('通关该秘境后才能扫荡。');
      if(!sweepAvailable(s,d.id))throw new Error(`还需${sweepWait(s,d.id)}个游戏日恢复扫荡次数。`);
      expend(s,30);
      const loot=sweepLoot(d);
      for(const [item,qty]of Object.entries(loot)){const take=Math.min(qty,bagRoom(s,item));s.inventory[item]=(s.inventory[item]??0)+take;if(take<qty){s.pendingLoot??={};s.pendingLoot[item]=(s.pendingLoot[item]??0)+qty-take;}}
      s.sweepReadyDays??={};s.sweepReadyDays[d.id]=s.day+7;
      note(s,`消耗30点精力扫荡${d.name}，领取基础资源；第${s.day+7}日恢复1次。`);break;
    }
    case 'return': {
      s.temporaryBuffs={};
      // Combat data originates from this local prototype, and is settled once per outing.
      s.hp = maxHP(s); s.mana = maxMana(s);
      s.toxin=Math.max(0,Math.min(100,payload.toxin));
      if(payload.healingStock){
        for(const k of Object.keys(ITEMS).filter(k=>ITEMS[k].heal||ITEMS[k].manaRestore||ITEMS[k].buff||ITEMS[k].tame))s.inventory[k]=Math.min(s.inventory[k],Math.max(0,payload.healingStock[k]??s.inventory[k]));
      }else{const consumedHeal=ITEMS[payload.healItem]?.heal?payload.healItem:'heal';s.inventory[consumedHeal]=Math.max(0,payload.heal);}
      if(payload.exploredStele)s.exploredStele=true;
      if (payload.doubleJump) s.doubleJump = true;
      if (payload.bossDefeated && !payload.defeated) {
        s.bossDefeated = true;
        s.clearedDungeons ??= [];
        const id = s.selectedDungeon ?? DUNGEONS[0].id;
        if (!s.clearedDungeons.includes(id)) s.clearedDungeons.push(id);
      }
      const id=s.selectedDungeon;s.dungeonStages??={};
      const reached=payload.bossDefeated&&!payload.defeated?3:Math.min(2,Math.max(0,Math.floor(payload.completedStage??0)));
      s.dungeonStages[id]=Math.max(dungeonProgress(state,id),reached);
      s.lastEfficiency={before:idleRate(state),after:idleRate(s)};
      const loot = payload.loot ?? {};const brought={};const usedPills=Object.entries(ITEMS).filter(([,i])=>i.heal||i.manaRestore||i.buff||i.tame).map(([id])=>({id,qty:Math.max(0,(state.inventory[id]??0)-(s.inventory[id]??0))})).filter(i=>i.qty); 
      for (const [k,q] of Object.entries(loot)) {
        if (!ITEMS[k] || !Number.isSafeInteger(q) || q < 0) continue;
        const kept = payload.defeated ? Math.floor(q / 2) : q;
        const actual = Math.min(kept, bagRoom(s,k));
        s.inventory[k] += actual;brought[k]=actual;
        if(actual<kept){s.pendingLoot??={};s.pendingLoot[k]=(s.pendingLoot[k]??0)+kept-actual;note(s,'背包已满，剩余战利品保留在待领取区。');}
      }
      if(payload.usedTame)for(const [id,qty]of Object.entries(payload.usedTame)){const existing=usedPills.find(p=>p.id===id);if(existing)existing.qty=qty;else usedPills.push({id,qty});}
      s.lastExpedition={dungeon:s.selectedDungeon,stage:dungeonProgress(s,s.selectedDungeon),defeated:!!payload.defeated,cleared:!!payload.bossDefeated&&!payload.defeated,loot:brought,usedPills,sweepUnlocked:s.clearedDungeons.includes(s.selectedDungeon)};
      note(s, payload.defeated ? '重伤撤回住宅，本次战利品仅保留一半；已有资产不损失。' : '从秘境返回，战利品收入库存。');
      advance(s,1,false,false); break;
    }
    default: throw new Error('未知操作。');
  }
  if(!s.failed)advanceMinorRanks(s);
  if (!s.won && aptitudeLevel(s)===10) { s.won = true; note(s, '洗髓重生，完成逆天改命。家园生产与修行探索仍可继续。'); }
  return s;
}

export function transition(state,action,payload={},random=Math.random,now=Date.now()){const s=baseTransition(state,action,payload,random,now);trackChapter(s,state,action,payload);updateJourney(s);return s;}
export function tickProduction(s,now=Date.now()){settleProduction(s,now);updateJourney(s);return s;}


