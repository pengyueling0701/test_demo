// Preview uses the same low-quality-first material selection as actual brewing.
export function brewEconomics(s,id,items,recipes,chance){
 const recipe=recipes[id];let direct=0;const used=[];
 for(const [base,qty] of Object.entries(recipe.materials)){
  let left=qty;
  const keys=Object.keys(items).filter(k=>(k===base||items[k].baseItem===base)&&s.inventory[k]>0).sort((a,b)=>items[a].grade-items[b].grade);
  for(const key of keys){const n=Math.min(left,s.inventory[key]);direct+=n*(items[key].sell??0);used.push({key,qty:n});left-=n;if(!left)break;}
  direct+=left*(items[base].sell??0);
 }
 const sale=items[id].sell??0;
 return {direct,sale,expected:Math.round(sale*chance/100),margin:Math.round(sale*chance/100)-direct,used};
}
export const FARM_ARTS={
 tend:{name:'引露术',realm:0,level:7,mana:12,energy:8,text:'照料全部未成熟药田，本轮每块收获+1株；每轮仅一次。'},
 hasten:{name:'催生术',realm:1,level:1,mana:24,energy:12,text:'全部未成熟作物提前1日成熟；每轮仅一次，可与引露术配合。'},
};
export const artUnlocked=(s,id)=>s.realm>FARM_ARTS[id].realm||(s.realm===FARM_ARTS[id].realm&&s.level>=FARM_ARTS[id].level);
export const growthMilestones=s=>[
 ['炼气七级 · 引露术',s.realm>0||s.level>=7,'照料药田，提高本轮产量'],
 ['筑基 · 催生术与特殊仙草',s.realm>=1,'缩短生长时间，解锁秘境与特殊种子'],
 ['金丹 · 高级丹药',s.realm>=2,'解锁高级丹药与中阶丹炉'],
 ['元婴 · 稀有与传说丹药',s.realm>=3,'解锁稀有、传说丹药与高阶丹炉'],
];
