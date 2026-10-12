export const alchemyXP=s=>s.alchemyXP??(s.alchemy??0)*10;
export const alchemyLevel=s=>Math.min(10,1+Math.floor(alchemyXP(s)/100));
export const alchemyProgress=s=>alchemyLevel(s)>=10?'已满级':alchemyXP(s)%100+'/100';
export const cultivationStrength=s=>s.realm*10+s.level-1+Math.min(1,Math.max(0,s.cultivation)/80);
export function brewChance(s,grade){return Math.max(10,Math.min(100,Math.round(70+cultivationStrength(s)*2+(alchemyLevel(s)-1)*5-grade*12)));}
