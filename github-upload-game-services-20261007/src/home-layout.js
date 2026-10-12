export const GRID=14, TILE_W=80,TILE_H=40,WORLD_SIZE=1800;
export const project=(x,y)=>({x:900+(x-y)*40,y:620+(x+y)*20});
export const unproject=(x,y)=>({x:Math.floor((x-900)/80+(y-620)/40+.5),y:Math.floor((y-620)/40-(x-900)/80+.5)});
export const footprint=o=>o.stored?[]:Array.from({length:o.size*o.size},(_,i)=>({x:o.x+i%o.size,y:o.y+Math.floor(i/o.size)}));
export const unlocked=(s,x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=Math.max(1,2-s.house)&&y>=Math.max(1,2-s.house)&&x<=Math.min(12,11+s.house)&&y<=Math.min(12,11+s.house);
export function defaultLayout(s){
 const objects=[{id:'house',kind:'house',size:2,x:3,y:3},{id:'alchemy',kind:'alchemy',size:2,x:8,y:3},...s.plots.map((_,i)=>({id:'plot-'+i,kind:'plot',index:i,size:1,x:3+i%4,y:7+Math.floor(i/4)}))];
 const roads=[...Array.from({length:7},(_,i)=>({x:3+i,y:6})),...Array.from({length:5},(_,i)=>({x:7,y:5+i})),{x:4,y:5},{x:9,y:5}];
 return {version:1,objects,roads:roads.filter((p,i,a)=>a.findIndex(q=>q.x===p.x&&q.y===p.y)===i)};
}
export function placementProblem(s,layout,id,x,y){
 const o=layout.objects.find(o=>o.id===id);if(!o)return '物件不存在';const tiles=footprint({...o,x,y,stored:false});
 if(tiles.some(p=>!unlocked(s,p.x,p.y)))return '这里尚未开放，请升级住宅后扩建范围';
 if(tiles.some(p=>layout.objects.some(other=>other.id!==id&&footprint(other).some(q=>q.x===p.x&&q.y===p.y))))return '位置被其他建筑或药田占用';
 return '';
}
export function validateLayout(s,layout){
 if(!layout||!Array.isArray(layout.objects)||!Array.isArray(layout.roads))throw new Error('布局数据无效');
 const expected=defaultLayout(s).objects;
 if(layout.objects.length!==expected.length||layout.objects.some((o,i)=>expected.filter(e=>e.id===o.id&&e.kind===o.kind&&e.size===o.size&&e.index===o.index).length!==1||layout.objects.findIndex(q=>q.id===o.id)!==i))throw new Error('布局物件与当前家园不一致');
 for(const o of layout.objects){if(o.stored){if(['house','alchemy'].includes(o.kind))throw new Error('住宅和炼丹房不可回收');continue;}const problem=placementProblem(s,layout,o.id,o.x,o.y);if(problem)throw new Error(problem);}
 if(layout.roads.length>GRID*GRID||layout.roads.some((p,i)=>!unlocked(s,p.x,p.y)||layout.roads.findIndex(q=>q.x===p.x&&q.y===p.y)!==i||layout.objects.some(o=>footprint(o).some(q=>q.x===p.x&&q.y===p.y))))throw new Error('道路不能重叠建筑或越过开放范围');
 return true;
}
export function syncLayout(s){
 if(!s.homeLayout){s.homeLayout=defaultLayout(s);return;}
 s.homeLayout.objects=s.homeLayout.objects.filter(o=>o.kind!=='willow');
 for(const item of defaultLayout(s).objects)if(!s.homeLayout.objects.some(o=>o.id===item.id)){
  let found=null;for(let y=2;y<=11&&!found;y++)for(let x=2;x<=11&&!found;x++)if(!s.homeLayout.objects.some(o=>footprint(o).some(p=>p.x===x&&p.y===y)))found={...item,x,y};
  if(found)s.homeLayout.objects.push(found);
 }
 s.homeLayout.roads=s.homeLayout.roads.filter(p=>!s.homeLayout.objects.some(o=>footprint(o).some(q=>q.x===p.x&&q.y===p.y)));
}
export function walkingPath(s,layout,start,end){
 const blocked=(x,y)=>!unlocked(s,x,y)||layout.objects.some(o=>footprint(o).some(p=>p.x===x&&p.y===y));
 if(blocked(end.x,end.y))return [];
 const queue=[{x:Math.round(start.x),y:Math.round(start.y),path:[]}],seen=new Set();
 while(queue.length){const p=queue.shift(),key=p.x+','+p.y;if(seen.has(key))continue;seen.add(key);if(p.x===end.x&&p.y===end.y)return p.path;
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const q={x:p.x+dx,y:p.y+dy};if(!blocked(q.x,q.y)&&!seen.has(q.x+','+q.y))queue.push({...q,path:[...p.path,q]});}
 }return [];
}
