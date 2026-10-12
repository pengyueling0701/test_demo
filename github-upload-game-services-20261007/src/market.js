export function makeMarket(cycle,catalog,random=Math.random){
 const ordinary=catalog.filter(p=>p.grade<5),legendary=catalog.filter(p=>p.grade===5),used=new Set();
 return Array.from({length:6},(_,index)=>{const pool=index===5&&random()<.05&&legendary.length?legendary:ordinary;const available=pool.filter(p=>!used.has(p.kind+':'+p.item));const p=available[Math.floor(random()*available.length)];used.add(p.kind+':'+p.item);return {id:cycle+'-'+index,kind:p.kind,item:p.item,price:Math.max(1,Math.floor(p.price*.8)),sold:false};});
}
