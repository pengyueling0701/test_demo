import {visibleObjects} from './interactables.js';
import { SOILS, CROPS, plotSoil } from './gardening.js';
import { art, drawHero, drawItem, drawSceneObject, objectIcon } from './art.js';
const palette = { '.':null, a:'#263934', b:'#d3c28f', c:'#7b623c', d:'#f0d3aa', e:'#5d9773', f:'#b8d5ad', g:'#d9bc69', h:'#f0e8c1', i:'#9a6648', j:'#507b67', k:'#c98860', l:'#749cb2' };
export const sprites = {
  hero:['....aaaa....','...aaaaaa...','...adddda...','...adddda...','....dddd....','...hhhhh....','..hhjjjhh...','..hhjjjhh...','..hjjjjjh...','..hjjjjjh...','..hhhhhhh...','..hhhhhhh...','...aa.aa....','...aa.aa....'],
  herb:['......e.....','.....eee....','..ee..e..ee.','.eeee.e.eeee','..eeeeeeeee.','....eeeee...','......e.....','....cecc....','...cccccc...'],
  tree:['.....aaaa.....','...aaeeeeaa...','..aeeeeeeeea..','.aeeffeeeeeea.','aeeeeeeffeeeea','aeeeeeeeeeeeea','.aeeeeeeeeeea.','..aaeeeeeeaa..','....aaccaa....','.....cccc.....','.....cccc.....','.....cccc.....'],
  sword:['.........h..','........hh..','.......hh...','......hh....','.....hh.....','....hh......','...hh.......','..hha.......','.gga........','..ag........','.c..........','c...........'],
  furnace:['....cccc....','...cggggc...','....cccc....','...iiiiii...','..iigggi ii..'.replace(' ',''),'..iggggggi..','..iggaaggi..','..iiggggii..','...iiiiii...','...cc..cc...'],
  shop:['..kkkkkkkk..','.kkkkkkkkkk.','kkkkhhhhkkkk','..c......c..','..c.gggg.c..','..c.gg.g.c..','..cccccccc..','..ciiiiiic..','..ciiiiiic..','..cccccccc..'],
  scroll:['..cccccccc..','.chhhhhhhhc.','.chggggghhc.','.chhhhhhhhc.','.chggggghhc.','.chhhhhhhhc.','.chggggghhc.','.chhhhhhhhc.','..cccccccc..'],
  house:['.....jj.....','....jjjj....','...jjjjjj...','..jjjjjjjj..','.jjjjjjjjjj.','jjjjjjjjjjjj','..bbbbbbbb..','..bbccbbbb..','..bbccbbll..','..bbccbbbb..','..cccccccc..'],
  coin:['....gggg....','...gbbbbg...','..gbggggbg..','..gbg..gbg..','..gbg..gbg..','..gbggggbg..','...gbbbbg...','....gggg....'],
  portal:['...llllll...','..laaaaaal..','.laallaaaal.','.laallllaal.','.laallllaal.','.laallllaal.','.laallllaal.','.laallllaal.','llaaaaaaaall'],
  pill:['....aaaa....','..aaagggaa..','.akggggggga.','akkkggggggga','akkkggggggga','akkkggggggga','.akkkkkkkka.','..aakkkkaa..','....aaaa....'],
  beast:['..aa......aa..','.akaa....aaka.','.akkkaaaakkka.','aakkkkkkkkkkaa','akkkhkkkkhkkka','akkkaakkkaakka','.akkkkkkkkkka.','..akkkkkkkka..','..aa......aa..'],
};
export function drawSprite(ctx,key,x,y,scale=1,colors={}) {
  const data=sprites[key]??sprites.herb;
  data.forEach((row,iy)=>[...row].forEach((v,ix)=>{if(v==='.')return;ctx.fillStyle=colors[v]??palette[v]??'#ded7a6';ctx.fillRect(Math.round(x+ix*scale),Math.round(y+iy*scale),Math.ceil(scale),Math.ceil(scale));}));
}
export function pixelIcon(key) {
  const cells={furnace:0,shop:1,scroll:2,portal:4};if(cells[key]!==undefined)return objectIcon(cells[key]);
  const data=sprites[key]??sprites.herb;
  return `<svg class="pixel-icon" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${data.map((row,y)=>[...row].map((v,x)=>v==='.'?'':`<rect x="${x+1}" y="${y+1}" width="1" height="1" fill="${palette[v]??'#ded7a6'}"/>`).join('')).join('')}</svg>`;
}
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
export const FIELD_LAYOUT = [[67,271],[187,271],[67,334],[187,334]];
export const FIELD_WIDTH=96, FIELD_HEIGHT=50;
function drawSoil(c,x,y,soil,index){
  const tones={normal:['#928363','#aa9974','#786e51'],spirit:['#778462','#9aa47a','#626f4e'],fire:['#9a7858','#b69973','#7e654b'],frost:['#80908c','#abb7a4','#6a7b73']};
  const [base,light,dark]=tones[soil];
  const noise=(a,b)=>(a*37+b*71+index*19)%101;
  c.save();c.beginPath();
  // A worn patch of cultivated earth, with uneven grassy margins.
  c.moveTo(x+10,y+5);c.lineTo(x+FIELD_WIDTH-14,y+2);c.lineTo(x+FIELD_WIDTH-5,y+10);
  c.lineTo(x+FIELD_WIDTH-8,y+FIELD_HEIGHT-9);c.lineTo(x+FIELD_WIDTH-17,y+FIELD_HEIGHT-3);
  c.lineTo(x+8,y+FIELD_HEIGHT-1);c.lineTo(x+2,y+FIELD_HEIGHT-11);c.lineTo(x+5,y+12);c.closePath();c.clip();
  c.globalAlpha=.78;rect(c,x,y,FIELD_WIDTH,FIELD_HEIGHT,base);c.globalAlpha=1;
  for(let py=3;py<FIELD_HEIGHT;py+=2)for(let px=3;px<FIELD_WIDTH;px+=3){
    const n=noise(px,py);c.globalAlpha=.12+n%4*.05;
    rect(c,x+px,y+py,2+n%3,1+n%2,n>52?light:dark);
  }
  // Short, broken furrows follow the ground, rather than forming UI stripes.
  for(let row=0;row<4;row++)for(let step=0;step<12;step++){
    const n=noise(step,row);if(n%5===0)continue;
    const px=x+8+step*6,py=y+10+row*8+Math.floor(step/4)-1;
    c.globalAlpha=.3;rect(c,px,py,4+n%3,1,dark);
    c.globalAlpha=.22;rect(c,px,py+2,3+n%3,1,light);
  }
  c.restore();
  // Grass and small earth crumbs soften the edge into the meadow.
  for(let step=0;step<23;step++){
    const px=x+4+step*4,n=noise(step,7),py=step%2?y+4+n%4:y+FIELD_HEIGHT-5+n%3;
    c.globalAlpha=.65;rect(c,px,py,2+n%3,2,n%3?'#94a35d':'#bdba78');
    if(n%4===0)rect(c,px+1,py-2,1,3,'#6f864e');
  }
  c.globalAlpha=1;
}
export function drawVillage(canvas,state,fieldPage=0,height=420) {
  canvas.width=384;canvas.height=height;const c=canvas.getContext('2d');c.imageSmoothingEnabled=true;
  if(art.village){c.drawImage(art.village,0,0,art.village.width,art.village.width*height/384,0,0,384,height);}
  else {rect(c,0,0,384,height,'#647e55');}
  FIELD_LAYOUT.forEach(([x,baseY],slot)=>{const y=baseY*height/420;
    const i=fieldPage*4+slot;if(i>=state.plots.length)return;
    drawSoil(c,x,y,plotSoil(state,i),i);
    const p=state.plots[i];if(p){for(let n=0;n<3;n++){
      const ready=p.buffer>0;
      if(!drawItem(c,CROPS[p.crop??'herb'].item,x+6+n*29,y+(ready?3:13),ready?26:18))drawSprite(c,'herb',x+9+n*28,y+9,ready?2:1,{e:ready?'#c1db8c':'#6b996a'});
    }}
  });
  for(const object of visibleObjects(state))drawSceneObject(c,{...object,y:object.y*height/420});
  if(!drawHero(c,291,285*height/420,71))drawSprite(c,'hero',290,305*height/420,3);
  if(state.house>0){rect(c,277,222*height/420,50,3,'#bca479');for(let i=0;i<5;i++)rect(c,277+i*12,217*height/420,3,14,'#d9bb87');}
  if(state.house>=1){rect(c,307,155*height/420,3,12,'#685234');rect(c,302,161*height/420,13,13,'#b8803d');rect(c,305,163*height/420,7,9,'#eed383');}
  if(state.house>=2){for(const x of [258,321]){rect(c,x,226*height/420,12,7,'#886146');drawSprite(c,'herb',x-1,210*height/420,1);}}
  if(state.house>=3){rect(c,244,189*height/420,3,38,'#735c39');rect(c,247,190*height/420,19,25,'#506d59');rect(c,252,195*height/420,8,12,'#dbc389');}
}
