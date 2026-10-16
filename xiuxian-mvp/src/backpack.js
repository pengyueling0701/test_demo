export const BAG_MAX_LEVEL=5,STACK_LIMIT=999;
export const bagLevel=s=>s.bagLevel??0;
export const bagUsed=s=>Object.values(s.inventory).reduce((n,q)=>n+Math.ceil(Math.max(0,q)/STACK_LIMIT),0);
export const bagCapacity=s=>10+s.house*30+(s.furniture.cabinet?40:0)+bagLevel(s)*10+(s.bagLegacyBonus??0);
export const bagUpgrade=s=>bagLevel(s)>=BAG_MAX_LEVEL?null:{cash:300*2**bagLevel(s),hide:2*(bagLevel(s)+1),increase:10,realm:[1,1,2,2,3][bagLevel(s)]};
export function bagRoom(s,id){const q=s.inventory[id]??0,slack=q?Math.ceil(q/STACK_LIMIT)*STACK_LIMIT-q:0;return Math.max(0,bagCapacity(s)-bagUsed(s))*STACK_LIMIT+slack;}
export function migrateBag(s,raw){s.pendingLoot={...raw.pendingLoot};s.lockedItems=[...(raw.lockedItems??[])];if(raw.bagVersion!==2){s.bagLegacyBonus=(raw.bagLevel??0)*10;s.bagLegacyBonus+=Math.max(0,bagUsed(s)-bagCapacity(s));}s.bagVersion=2;}
