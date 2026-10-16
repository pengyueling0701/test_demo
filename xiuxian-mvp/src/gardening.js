import {assignElements} from './elements.js';
export const PLOT_LIMITS = [4,6,8,12];
export const EXPANSION_PRICES = [0,400,800,1200];
export const SOILS = {
  normal: {name:'普通土地',price:0,house:0,color:'#7d6344',ridge:'#aa8757'},
  spirit: {name:'灵土',price:800,house:1,color:'#476651',ridge:'#87ad83'},
  fire: {name:'赤炎土',price:1400,house:2,color:'#84513b',ridge:'#cd8b5b'},
  frost: {name:'寒霜土',price:1800,house:2,color:'#4c6376',ridge:'#a1c6d5'},
};
export const CROPS = {
  herb: {name:'青灵草',seed:'seed',item:'herb',minutes:20,yield:2,realm:0,soils:['normal','spirit','fire','frost']},
  fruit: {name:'饲灵果',unit:'颗',seed:'fruitSeed',item:'fruit',minutes:20,yield:2,realm:0,soils:['normal','spirit','fire','frost']},
  moon: {name:'月华仙草',seed:'moonSeed',item:'moon',minutes:30,yield:2,realm:1,soils:['spirit']},
  fireHerb: {name:'焰心草',seed:'fireSeed',item:'fireHerb',minutes:40,yield:2,realm:1,soils:['fire']},
  frostHerb: {name:'霜露仙草',seed:'frostSeed',item:'frostHerb',minutes:40,yield:2,realm:1,soils:['frost']},
};
export const plotLimit = s => PLOT_LIMITS[s.house];
export const expansionPrice = s => EXPANSION_PRICES[s.house];
export const plotSoil = (s,index) => s.plotSoils?.[index] ?? 'normal';
export const harvestYield = (s,p) => (CROPS[p?.crop??'herb']?.yield??2)+Math.floor(Math.sqrt(Math.max(0,s.farming??0)/12))+(p?.tend?1:0);
export function plantingBlock(s,index,cropId) {
  const crop=CROPS[cropId];
  if(!crop)return '未知种子';
  if(!Number.isInteger(index)||index<0||index>=s.plots.length)return '药田不存在';
  if(s.plots[index])return '药田已有作物';
  if(s.realm<crop.realm)return '筑基后解锁';
  if(!crop.soils.includes(plotSoil(s,index)))return `需要${crop.soils.map(k=>SOILS[k].name).join('或')}`;
  if(!seedCount(s,crop.seed))return '种子不足';

  return '';
}

assignElements(SOILS,{spirit:'wood',fire:'fire',frost:'water'});assignElements(CROPS,{herb:'wood',fruit:'wood',moon:'water',fireHerb:'fire',frostHerb:'water'});

export const seedCount=(s,seed)=>Object.entries(s.inventory).filter(([id])=>id===seed||id.startsWith(seed+'_q')).reduce((n,[,qty])=>n+qty,0);
