import {plotStatus} from './idle-ui.js';
import {project,unproject,footprint,placementProblem,unlocked,WORLD_SIZE,GRID} from './home-layout.js';
import {drawHero} from './art.js';
const assets={},bounds={};let terrainCache=null;
const urls={buildings:'art/isometric-buildings-v1.png',terrain:'art/isometric-terrain-v1.png',landscape:'art/home-landscape-v2.png'};
export async function loadIsoArt(){await Promise.all(Object.entries(urls).map(([key,path])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{assets[key]=im;resolve();};im.onerror=resolve;im.src=new URL('../'+path,import.meta.url).href.replace('/src/../','/');})));}
function crop(key,index){
 const im=assets[key];if(!im)return null;const cache=key+index;if(bounds[cache])return bounds[cache];
 const w=im.width/2,h=im.height/2,sx=(index%2)*w,sy=Math.floor(index/2)*h;
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,sx,sy,w,h,0,0,w,h);const px=ctx.getImageData(0,0,w,h).data;let minX=w,minY=h,maxX=0,maxY=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(px[(y*w+x)*4+3]>30){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
 return bounds[cache]={sx:sx+minX,sy:sy+minY,w:maxX-minX+1,h:maxY-minY+1};
}
function atlas(ctx,key,index,x,y,w,h){const r=crop(key,index);if(r)ctx.drawImage(assets[key],r.sx,r.sy,r.w,r.h,x,y,w,h);}
function diamond(ctx,p,color,line=false){ctx.beginPath();ctx.moveTo(p.x,p.y-20);ctx.lineTo(p.x+40,p.y);ctx.lineTo(p.x,p.y+20);ctx.lineTo(p.x-40,p.y);ctx.closePath();ctx.fillStyle=color;ctx.fill();if(line){ctx.strokeStyle='#eee3b18a';ctx.lineWidth=1;ctx.stroke();}}
export function objectBox(o){const p=project(o.x+(o.size-1)/2,o.y+(o.size-1)/2);const w=o.kind==='plot'?86:o.kind==='willow'?105:178;const h=o.kind==='plot'?70:o.kind==='willow'?135:174;return {x:p.x-w/2,y:p.y+o.size*20-h,w,h,depth:o.x+o.y+o.size};}
export const objectName=(o,s)=>o.kind==='house'?['破旧老屋','整修木屋','乡间小院','修仙宅院'][s.house]:o.kind==='alchemy'?'炼丹洞':o.kind==='willow'?'柳树':('药田'+(o.index+1));
export function drawIsoHome(canvas,s,layout,edit,hero){
 const resolution=2;if(canvas.width!==WORLD_SIZE*resolution)canvas.width=WORLD_SIZE*resolution;if(canvas.height!==WORLD_SIZE*resolution)canvas.height=WORLD_SIZE*resolution;const output=canvas.getContext('2d');output.setTransform(resolution,0,0,resolution,0,0);output.imageSmoothingEnabled=true;output.imageSmoothingQuality='high';const key=JSON.stringify([s.house,!!edit,layout.roads,!!assets.terrain,!!assets.landscape]);let c;
 if(!terrainCache||terrainCache.key!==key){const bg=document.createElement('canvas');bg.width=WORLD_SIZE*resolution;bg.height=WORLD_SIZE*resolution;c=bg.getContext('2d');c.scale(resolution,resolution);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 c.fillStyle='#b0c3a7';c.fillRect(0,0,WORLD_SIZE,WORLD_SIZE);if(assets.landscape)c.drawImage(assets.landscape,0,0,WORLD_SIZE,WORLD_SIZE);
 for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){
  if(x===0||y===0||x===13||y===13)continue;const p=project(x,y),water=false;const road=layout.roads.some(q=>q.x===x&&q.y===y);c.save();c.globalAlpha=road?1:0;diamond(c,p,road?'#aeac8b':'#819671');c.beginPath();c.moveTo(p.x,p.y-20);c.lineTo(p.x+40,p.y);c.lineTo(p.x,p.y+20);c.lineTo(p.x-40,p.y);c.closePath();c.clip();atlas(c,'terrain',water?1:road?3:0,p.x-40,p.y-20,80,40);c.restore();
  if(edit&&!water&&!unlocked(s,x,y))diamond(c,p,'#42594566');if(edit)diamond(c,p,'#00000000',true);
 }
 terrainCache={key,canvas:bg};}output.drawImage(terrainCache.canvas,0,0,WORLD_SIZE,WORLD_SIZE);c=output;
 const things=layout.objects.filter(o=>!o.stored).sort((a,b)=>objectBox(a).depth-objectBox(b).depth);
 for(const o of things){const b=objectBox(o);atlas(c,'buildings',{house:0,alchemy:1,plot:2,willow:3}[o.kind],b.x,b.y,b.w,b.h);
  if(o.kind==='plot'){
   const soil=s.plotSoils[o.index],p=s.plots[o.index],q=project(o.x,o.y);if(soil!=='normal'){c.fillStyle={spirit:'#77b6a8',fire:'#c47c55',frost:'#9cceef'}[soil];c.fillRect(q.x-15,q.y+6,30,3);}
   if(p){c.fillStyle=p.buffer>0?'#f1d383':'#afdb88';for(let i=0;i<3;i++){c.fillRect(q.x-20+i*18,q.y-15,3,15);c.fillRect(q.x-25+i*18,q.y-10,13,3);}}else{c.fillStyle='#574e38b0';c.fillRect(q.x-26,q.y-18,52,20);}
  }
  if(o.kind==='house'&&s.house>0){c.fillStyle='#ffe3a0';c.fillRect(b.x+70,b.y+105,5,7);}
  if(edit?.selected===o.id){for(const p of footprint(o))diamond(c,project(p.x,p.y),'#e7d78355',true);}
 }
 if(hero){const p=project(hero.x,hero.y);drawHero(c,p.x-17,p.y-46,38);}
}
export function isoMarkup(s,layout,edit){return '<div class="iso-viewport"><div class="iso-layer"><canvas class="iso-canvas" aria-label="斜俯视清溪小院"></canvas>'+layout.objects.filter(o=>!o.stored).map(o=>{const b=objectBox(o);const p=o.kind==='plot'?s.plots[o.index]:null;return '<button class="iso-object '+(o.kind==='plot'?'plot-object ':'')+(edit?.selected===o.id?'selected':'')+'" style="left:'+b.x+'px;top:'+b.y+'px;width:'+b.w+'px;height:'+b.h+'px;z-index:'+Math.floor(b.depth*10)+'" data-action="iso-object" data-object="'+o.id+'" aria-label="'+objectName(o,s)+'">'+(o.kind==='plot'?'<i class="plot-hit-target" aria-hidden="true"></i>':'')+'<span>'+objectName(o,s)+(p?' · <b data-live="plot-'+o.index+'">'+plotStatus(s,o.index)+'</b>':'')+'</span></button>';}).join('')+'<button class="iso-outbound-hotspot" style="left:980px;top:1185px;width:390px;height:250px" data-action="navigate" data-page="travel" aria-label="石桥 · 外出"><span>外出</span></button></div></div>';}
export function attachIsoCamera(view,camera,handlers){
 const layer=view.querySelector('.iso-layer'),points=new Map();let previous=null,dragged=false,suppress=0,longTimer=null;
 const local=e=>{const b=view.getBoundingClientRect();return {x:e.clientX-b.left,y:e.clientY-b.top};};
 const shape=()=>{const p=[...points.values()];return p.length>1?{center:{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2},distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}:{center:p[0],distance:0};};
 const paint=()=>{const min=Math.max(view.clientWidth/WORLD_SIZE,view.clientHeight/WORLD_SIZE);camera.scale=Math.max(min,Math.min(1.8,camera.scale));camera.x=Math.min(0,Math.max(view.clientWidth-WORLD_SIZE*camera.scale,camera.x));camera.y=Math.min(0,Math.max(view.clientHeight-WORLD_SIZE*camera.scale,camera.y));layer.style.transform=`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;};
 if(!camera.initialized){camera.scale=Math.max(.55,view.clientHeight/WORLD_SIZE);camera.x=view.clientWidth/2-900*camera.scale;camera.y=view.clientHeight/2-880*camera.scale;camera.initialized=true;}paint();
 view.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;points.set(e.pointerId,local(e));previous=shape();dragged=points.size>1;clearTimeout(longTimer);const id=e.target.closest('[data-object]')?.dataset.object;if(id&&points.size===1)longTimer=setTimeout(()=>{dragged=true;handlers.longPress(id);},500);});
 view.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;const p=local(e),old=points.get(e.pointerId);if(!dragged&&Math.hypot(p.x-old.x,p.y-old.y)<7)return;clearTimeout(longTimer);dragged=true;view.setPointerCapture(e.pointerId);points.set(e.pointerId,p);const now=shape();if(now.distance&&previous.distance){const scale=Math.max(Math.max(view.clientWidth,view.clientHeight)/WORLD_SIZE,Math.min(1.8,camera.scale*now.distance/previous.distance)),ratio=scale/camera.scale;camera.x=previous.center.x-(previous.center.x-camera.x)*ratio;camera.y=previous.center.y-(previous.center.y-camera.y)*ratio;camera.scale=scale;}camera.x+=now.center.x-previous.center.x;camera.y+=now.center.y-previous.center.y;previous=now;paint();e.preventDefault();});
 const finish=e=>{clearTimeout(longTimer);if(!points.has(e.pointerId))return;if(dragged)suppress=performance.now()+400;points.delete(e.pointerId);previous=points.size?shape():null;};view.addEventListener('pointerup',finish);view.addEventListener('pointercancel',finish);
 view.addEventListener('click',e=>{if(performance.now()<suppress){e.stopImmediatePropagation();e.preventDefault();return;}const pos=local(e),tile=unproject((pos.x-camera.x)/camera.scale,(pos.y-camera.y)/camera.scale);if(handlers.isEditing()){e.stopImmediatePropagation();e.preventDefault();handlers.editTile(tile,e.target.closest('[data-object]')?.dataset.object);}else if(!e.target.closest('[data-object]')&&!e.target.closest('[data-action="navigate"]'))handlers.walk(tile);},true);
 view.addEventListener('wheel',e=>{e.preventDefault();const p=local(e),scale=Math.max(Math.max(view.clientWidth,view.clientHeight)/WORLD_SIZE,Math.min(1.8,camera.scale*Math.exp(-e.deltaY*.002))),ratio=scale/camera.scale;camera.x=p.x-(p.x-camera.x)*ratio;camera.y=p.y-(p.y-camera.y)*ratio;camera.scale=scale;paint();},{passive:false});
 const observer=new ResizeObserver(paint);observer.observe(view);return ()=>{observer.disconnect();clearTimeout(longTimer);};
}
