import {assignElements} from './elements.js';
export const PILL_GRADES=['粗制','初级','中级','高级','稀有','传说'];
export const FURNACES=[
  {name:'破败丹炉',grade:0,upgrade:180,ore:2,realm:0},
  {name:'青铜丹炉',grade:1,upgrade:600,ore:4,realm:0},
  {name:'精铁丹炉',grade:2,upgrade:1200,ore:8,realm:0},
  {name:'灵纹丹炉',grade:3,upgrade:3000,ore:12,realm:1},
  {name:'紫霄丹炉',grade:4,upgrade:8000,ore:20,realm:2},
  {name:'太虚丹炉',grade:5,upgrade:0,ore:0,realm:2},
];
export const EQUIPMENT_SLOTS={head:'头部',body:'上衣',legs:'裤子',feet:'鞋子',back:'背饰',charm:'挂饰',neck:'项链',ring:'戒指'};
const gear=[
  ['head','布巾','青云冠',180,{hp:10,defense:1}],
  ['body','护身衣袍','青云道袍',650,{hp:30,defense:5}],
  ['legs','粗布长裤','云纹护裤',220,{hp:10,defense:2}],
  ['feet','布靴','踏云靴',200,{mana:5,defense:1}],
  ['back','蓑衣背饰','御风披风',300,{hp:10,attack:2}],
  ['charm','辟邪挂饰','灵玉挂饰',280,{attack:3,mana:5}],
  ['neck','木珠项链','聚灵项链',350,{hp:10,mana:15}],
  ['ring','铜戒指','灵纹戒指',400,{attack:3,mana:10}],
];
export const EQUIPMENT=Object.fromEntries(gear.flatMap(([slot,name,advanced,price,stats])=>[
  [slot==='body'?'robe':`${slot}_basic`,{name,slot,price,realm:0,stats}],
  [`${slot}_spirit`,{name:advanced,slot,price:price*3,realm:1,stats:Object.fromEntries(Object.entries(stats).map(([k,v])=>[k,v*2]))}],
]));
export const emptyEquipment=()=>Object.fromEntries(Object.keys(EQUIPMENT_SLOTS).map(k=>[k,null]));
export const equippedId=(s,slot)=>s.equipped?.[slot]??(slot==='body'&&s.armor?'robe':null);
export function equipmentStats(s){
  const total={hp:0,mana:0,attack:0,defense:0};
  for(const slot of Object.keys(EQUIPMENT_SLOTS))for(const [key,value]of Object.entries(EQUIPMENT[equippedId(s,slot)]?.stats??{}))total[key]+=value;
  return total;
}
export const equipmentText=gear=>Object.entries(gear.stats).map(([k,v])=>`${{hp:'气血',mana:'灵力',attack:'攻击',defense:'防御'}[k]} +${v}`).join(' · ');
export const WAREHOUSE_CATEGORIES={all:'全部材料',seed:'种子',herb:'灵药仙草',mineral:'矿物',monster:'妖兽材料',pill:'丹药',gear:'武器装备',book:'技能书'};
export function itemCategory(id){
  if(id.startsWith('book_'))return 'book';
  id=id.split('_q')[0];
  if(id==='seed'||id.endsWith('Seed'))return 'seed';
  if(['herb','moon','fireHerb','frostHerb'].includes(id))return 'herb';
  if(id==='ore')return 'mineral';
  if(id==='core')return 'monster';
  return 'pill';
}

assignElements(EQUIPMENT,{head_basic:'earth',head_spirit:'earth',robe:'wood',body_spirit:'wood',legs_basic:'earth',legs_spirit:'earth',feet_basic:'water',feet_spirit:'water',back_basic:'wood',back_spirit:'wood',charm_basic:'fire',charm_spirit:'fire',neck_basic:'water',neck_spirit:'water',ring_basic:'metal',ring_spirit:'metal'});assignElements(FURNACES,{},'fire');

for(const [id,e]of Object.entries(EQUIPMENT))e.grade=id.endsWith('_spirit')?1:0;
for(const [id,e]of Object.entries({...EQUIPMENT}).filter(([id])=>id.endsWith('_spirit')))for(let grade=2;grade<6;grade++)EQUIPMENT[id+'_q'+grade]={...e,grade,name:PILL_GRADES[grade]+e.name,price:e.price*Math.pow(2,grade-1),realm:grade>=4?2:1,stats:Object.fromEntries(Object.entries(e.stats).map(([k,v])=>[k,Math.round(v*(1+.4*(grade-1)))]))};
