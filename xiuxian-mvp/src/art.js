// Generated PNGs remain intact. Sprite bounds are selected only at render time.
const base = import.meta.env?.BASE_URL ?? './';
export const artUrl = file => `${base}art/${file}`;
export const art = {};
export async function initArt() {
  if (typeof Image === 'undefined') return;
  await Promise.all(['village','hero','items','forest','interactables','alchemy-cave','battle-fx'].map(key=>new Promise(resolve=>{
    const image=new Image();
    image.onload=()=>{
      art[key]=image;
      if(key==='hero'){
        const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
        const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
        const pixels=ctx.getImageData(0,0,c.width,c.height).data;
        let minX=c.width,minY=c.height,maxX=0,maxY=0;
        for(let y=0;y<c.height;y+=2)for(let x=0;x<c.width;x+=2)if(pixels[(y*c.width+x)*4+3]>24){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
        art.heroBounds={x:minX,y:minY,w:maxX-minX+2,h:maxY-minY+2};
      }
      resolve();
    };
    image.onerror=()=>resolve();image.src=artUrl(`${key}.${key==='battle-fx'?'svg':'png'}`);
  })));
}
export function drawHero(ctx,x,y,height=56,face=1) {
  if(!art.hero)return false;
  const b=art.heroBounds??{x:0,y:0,w:art.hero.width,h:art.hero.height};
  const width=height*b.w/b.h;
  ctx.save();ctx.translate(Math.round(x+width/2),Math.round(y));if(face<0)ctx.scale(-1,1);
  ctx.drawImage(art.hero,b.x,b.y,b.w,b.h,-width/2,0,width,height);ctx.restore();return true;
}
export const itemCells={foundationPill:[1,0],goldenPill:[2,0],nascentPill:[3,0],dew:[1,0],manaPill:[1,0],manaPill1:[1,0],heal:[0,0],spirit:[1,0],advanced:[2,0],supreme:[3,0],seed:[0,1],moonSeed:[0,1],fireSeed:[0,1],frostSeed:[0,1],herb:[1,1],moon:[1,1],fireHerb:[1,1],frostHerb:[1,1],ore:[2,1],core:[3,1]};
export function itemIcon(key) {
  if(key.startsWith('book_'))return `<span class="pixel-icon generated-icon skillbook-icon" aria-hidden="true" style="background-image:url('${artUrl('skillbook-v1.png')}')"></span>`;
  key=key.split('_q')[0];
  const [col,row]=itemCells[key]??(key.startsWith('heal')?[0,0]:['mid','rare'].includes(key)?[2,0]:[1,1]);
  return `<span class="pixel-icon generated-icon" aria-hidden="true" style="background-image:url('${artUrl('items.png')}');background-position:${col*100/3}% ${row*100}%"></span>`;
}
export function drawItem(ctx,key,x,y,size=24) {
  if(!art.items)return false;
  const [col,row]=itemCells[key]??(key.startsWith('heal')?[0,0]:['mid','rare'].includes(key)?[2,0]:[1,1]),w=art.items.width/4,h=art.items.height/2;
  ctx.drawImage(art.items,col*w,row*h,w,h,x,y,size,size);return true;
}

export function drawSceneObject(ctx,object){
 const atlas=art.interactables;if(!atlas)return;
 const cw=atlas.width/4,ch=atlas.height/2,col=object.cell%4,row=Math.floor(object.cell/4);
 ctx.drawImage(atlas,col*cw,row*ch,cw,ch,object.x,object.y,object.w,object.h);
}

export function objectIcon(cell){return '<span class="pixel-icon generated-icon" aria-hidden="true" style="background-image:url('+artUrl('interactables.png')+');background-position:'+(cell%4*100/3)+'% '+Math.floor(cell/4)*100+'%"></span>'; }
