export const MAP_SIZE=1.5;
export function constrainCamera(camera,w,h){
 camera.scale=Math.max(1/MAP_SIZE,Math.min(2.5,camera.scale));
 camera.x=Math.min(0,Math.max(w-w*MAP_SIZE*camera.scale,camera.x));
 camera.y=Math.min(0,Math.max(h-h*MAP_SIZE*camera.scale,camera.y));
 return camera;
}
export function zoomCamera(camera,scale,anchor,w,h){
 const ratio=scale/camera.scale;
 camera.x=anchor.x-(anchor.x-camera.x)*ratio;
 camera.y=anchor.y-(anchor.y-camera.y)*ratio;
 camera.scale=scale;return constrainCamera(camera,w,h);
}
export function attachHomeCamera(view,camera){
 const layer=view.querySelector('.home-map-layer'),points=new Map();
 let last=null,moved=false,suppressUntil=0;
 const local=e=>{const r=view.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
 const geometry=()=>{const p=[...points.values()];if(p.length<2)return {center:p[0],distance:0};return {center:{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2},distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)};};
 const paint=()=>{constrainCamera(camera,view.clientWidth,view.clientHeight);layer.style.transform=`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;};
 if(!camera.initialized){camera.scale=1;camera.x=-view.clientWidth*.25;camera.y=-view.clientHeight*.25;camera.initialized=true;}paint();
 view.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;points.set(e.pointerId,local(e));last=geometry();if(points.size===1)moved=false;if(points.size>1){moved=true;view.setPointerCapture(e.pointerId);}});
 view.addEventListener('pointermove',e=>{
  if(!points.has(e.pointerId))return;const p=local(e),old=points.get(e.pointerId);
  if(!moved&&Math.hypot(p.x-old.x,p.y-old.y)<7)return;
  moved=true;view.setPointerCapture(e.pointerId);points.set(e.pointerId,p);const current=geometry();
  if(current.distance&&last.distance){const scale=Math.max(1/MAP_SIZE,Math.min(2.5,camera.scale*current.distance/last.distance));zoomCamera(camera,scale,last.center,view.clientWidth,view.clientHeight);}
  camera.x+=current.center.x-last.center.x;camera.y+=current.center.y-last.center.y;last=current;paint();e.preventDefault();
 });
 const finish=e=>{if(!points.has(e.pointerId))return;if(moved)suppressUntil=performance.now()+400;points.delete(e.pointerId);last=points.size?geometry():null;};
 view.addEventListener('pointerup',finish);view.addEventListener('pointercancel',finish);
 view.addEventListener('lostpointercapture',finish);
 view.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 view.addEventListener('wheel',e=>{e.preventDefault();zoomCamera(camera,Math.max(1/MAP_SIZE,Math.min(2.5,camera.scale*Math.exp(-e.deltaY*.002))),local(e),view.clientWidth,view.clientHeight);paint();},{passive:false});
 const resize=new ResizeObserver(paint);resize.observe(view);return ()=>resize.disconnect();
}
