export const GARDENS=[{id:'normal',name:'普通药田',realm:0,price:0},{id:'spirit',name:'灵土药田',realm:1,price:800},{id:'fire',name:'赤炎药田',realm:2,price:1400},{id:'frost',name:'寒霜药田',realm:3,price:1800}];
export function gardenIndexes(s,id){return s.plotSoils.map((soil,i)=>soil===id?i:-1).filter(i=>i>=0);}
export function migrateGarden(s){if(s.gardenVersion===1)return s;s.gardens=['normal'];for(const g of GARDENS){const indexes=gardenIndexes(s,g.id);if(g.id==='normal'||indexes.length){if(!s.gardens.includes(g.id))s.gardens.push(g.id);for(let i=indexes.length;i<9;i++){s.plots.push(null);s.plotSoils.push(g.id);}}}for(const id of s.homeWarehouse?.furniture??[])s.furniture[id]=true;s.homeWarehouse={furniture:[]};delete s.homeLayout;s.gardenVersion=1;return s;}

export const GROWTH_STAGES=['种子','幼苗','植株','成熟'];
export function cropStage(p,now=Date.now()){if(!p)return null;if(p.buffer>0)return 3;const duration=p.firstReadyAt!=null?Math.max(1,p.firstReadyAt-p.lastAt):p.cycleMs;const progress=Math.max(0,Math.min(1,(now-p.lastAt)/Math.max(1,duration)));return progress<.25?0:progress<.6?1:progress<1?2:3;}
