import { attack, defense, maxHP, maxMana, ITEMS, healingItem } from './game.js';
import { DUNGEONS, dungeonLayout } from './dungeons.js';
import { drawSprite } from './pixel.js';
import { art, drawHero, drawItem } from './art.js';

import {SKILLS,skillDamage,dungeonElement,ELEMENTS,COUNTERS} from './elements.js';
const W = 2700, GROUND = 410, VIEW_WIDTH = 420;
export function startBattle(canvas, state, onReturn, onHUD, dungeon = DUNGEONS[0], onFeedback = ()=>{}) {
  const tier = DUNGEONS.findIndex(d=>d.id===dungeon.id);
  const platforms = dungeonLayout(tier);
  const effects=[],guideDone=new Set();let hints=state.settings?.battleHints!==false;const colors={metal:'#ffe39a',wood:'#a4de78',water:'#93d8ec',fire:'#ef9867',earth:'#d3b38a'};
  const feedback=e=>{onFeedback(e);effects.push({...e,time:e.type==='damage'?.6:.25});};
  const hitMob=(m,amount,skill)=>{const dealt=Math.min(m.hp,amount);m.flash=.12;feedback({type:'damage',x:m.x+m.w/2,y:m.y-25,amount:dealt,counter:skill&&COUNTERS[skill.element]===m.element,element:skill?.element});return Math.max(0,m.hp-amount);};
  const ctx = canvas.getContext('2d');
  const bounds=canvas.getBoundingClientRect?.();
  let viewHeight=bounds?.width?Math.max(480,Math.min(760,Math.round(VIEW_WIDTH*bounds.height/bounds.width))):640;
  canvas.width=210;canvas.height=Math.round(viewHeight/2);ctx.imageSmoothingEnabled=true;
  let paused=false;
  const syncPause=()=>{paused=(typeof document!=='undefined'&&document.hidden)|| (!!window.innerWidth && window.innerWidth>window.innerHeight && window.innerHeight<550);if(paused)keys.clear();};
  const keys = new Set();
  const initialHeal=healingItem(state),healingStock=Object.fromEntries(Object.keys(ITEMS).filter(k=>(ITEMS[k].heal||ITEMS[k].manaRestore)).map(k=>[k,state.inventory[k]??0]));
  const p = { x: 70, y: 350, w: 28, h: 48, vx: 0, vy: 0, face: 1, jumps: 0, hp: state.hp, mana: state.mana, toxin: state.toxin, healItem:initialHeal,heal:healingStock[initialHeal], invincible: 0, swing: 0, cooldown: 0 };
  const refreshHeal=()=>{p.healItem=Object.keys(healingStock).filter(k=>ITEMS[k].heal&&healingStock[k]>0).sort((a,b)=>ITEMS[b].grade-ITEMS[a].grade)[0]??initialHeal;p.heal=healingStock[p.healItem];};
  const mobs = [350, 670, 1130, 1450, 1870, 2370].map((x,i) => ({ x, y: GROUND - 36, hp: 45 + i * 6 + tier * 10, max: 45 + i * 6 + tier * 10, w: 38, h: 36, windup: 0, cooldown: 0, element:dungeonElement(dungeon),boss: false }));
  mobs.push({ x: 2110, y: GROUND - 80, hp: 240 + tier * 30, max: 240 + tier * 30, w: 76, h: 80, windup: 0, cooldown: 0, element:dungeonElement(dungeon),boss: true });
  const pickups = [
    { x: platforms[2].x+85, y: platforms[2].y-25, item: 'moon', qty: 2+Math.floor(tier/3) },
    { x: platforms[3].x+95, y: platforms[3].y-25, item: 'ore', qty: dungeon.theme==='cave'?8:3+Math.floor(tier/2) },
    { x: platforms[6].x+120, y: platforms[6].y-25, item: 'moon', qty: 4+Math.floor(tier/2) },
    { x: platforms[8].x+80, y: platforms[8].y-25, item: 'core', qty: 1+Math.floor(tier/4) },
  ];
  if(tier===0)pickups.push({x:platforms[6].x+120,y:platforms[6].y-25,item:'moonSeed',qty:2});
  let doubleJump = state.doubleJump, bossDefeated = false, camera = 0, frame = 0, ended = false, hudTick = 0, message = `${dungeon.name} · 向右探索古碑与高处资源`;
  const loot = { moonSeed:0, herb: 0, moon: 0, ore: 0, core: 0 };
  const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  const damage = amount => { if (p.invincible > 0) return; p.hp = Math.max(0, p.hp - Math.max(3, amount - defense(state))); p.invincible = 1; p.vy = -160;feedback({type:'hit',x:p.x,y:p.y,amount:Math.max(3,amount-defense(state))}); };
  const finish = defeated => {
    if (ended) return;
    ended = true; cancelAnimationFrame(frame); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); window.removeEventListener('resize',syncPause); window.removeEventListener('focus',syncPause); if(typeof document!=='undefined')document.removeEventListener('visibilitychange',syncPause);
    onReturn({ hp: p.hp, mana: p.mana, toxin: p.toxin, heal:p.heal,healItem:p.healItem,healingStock:{...healingStock},loot:Object.fromEntries(Object.entries(loot).map(([id,qty])=>[['herb','moon','core'].includes(id)&&tier>=2?id+'_q'+Math.min(5,1+Math.floor(tier/2)):id,qty])), doubleJump, bossDefeated, defeated });
  };
  const trigger = key => {
    if (ended || paused) return;
    if(['left','right','jump','attack'].includes(key))guideDone.add(key==='left'?'right':key);if(key==='skill'||key.startsWith('skill-'))guideDone.add('skill');
    if (key === 'jump' && p.jumps < (doubleJump ? 2 : 1)) { p.vy = -460; p.jumps++; }
    if (key === 'attack' && p.cooldown <= 0) {
      p.swing = .18; p.cooldown = .3;feedback({type:'attack',x:p.x,y:p.y,face:p.face});
      const hit = { x: p.face > 0 ? p.x + p.w : p.x - 70, y: p.y - 8, w: 70, h: 65 };
      mobs.forEach(m => { if (m.hp > 0 && overlap(hit,m)) { m.hp = hitMob(m,attack(state)); if (!m.hp) { loot.herb += m.boss ? 4+tier : 1+Math.floor(tier/4); loot.core += m.boss ? 2+Math.floor(tier/3) : 0; if (m.boss) { bossDefeated = true; message = `${dungeon.boss}已败！内丹收入行囊。`; } } } });
    }
    if (key === 'dodge' && p.cooldown <= 0) { p.x = Math.max(0, Math.min(W - p.w, p.x + p.face * 90)); p.invincible = .35; p.cooldown = .6; }
    const skillId=key==='skill'?state.skillLoadout?.[0]:key.startsWith('skill-')?key.slice(6):null;const skill=SKILLS[skillId];
    if(skill&&state.skillLoadout.includes(skillId)&&p.mana>=skill.mana&&p.cooldown<=0){
      p.mana -= skill.mana;feedback({type:'skill',element:skill.element,x:p.x,y:p.y,face:p.face,range:skill.range}); p.swing = .35; p.cooldown = .6;
      const hit = { x: p.face > 0 ? p.x : p.x - (skill.range-30), y: p.y - 15, w: skill.range, h: 85 };
      mobs.forEach(m => { if (m.hp > 0 && overlap(hit,m)) { m.hp = hitMob(m,skillDamage(attack(state),skill,m.element)*(1+.15*(state.skillGrades?.[skillId]??0)),skill);if(COUNTERS[skill.element]===m.element)message=ELEMENTS[skill.element]+'克'+ELEMENTS[m.element]+' · 伤害×2'; if (!m.hp) { loot.herb += m.boss ? 4 : 1; if (m.boss) { loot.core += 2+Math.floor(tier/3); bossDefeated = true; message = '兽王已败，获得妖兽内丹！'; } } } });
    }
    if(key==='mana'){
      const id=Object.keys(healingStock).filter(k=>ITEMS[k].manaRestore&&healingStock[k]>0).sort((a,b)=>ITEMS[b].grade-ITEMS[a].grade)[0];
      if(!id){message='回灵丹已用尽。';return;}if(p.toxin>=100){message='丹毒已满，无法服丹。';return;}if(p.mana>=maxMana(state)){message='法力已满。';return;}
      const pill=ITEMS[id];healingStock[id]--;p.mana=Math.min(maxMana(state),p.mana+Math.round(pill.manaRestore*Math.max(.2,1-p.toxin/125)));p.toxin=Math.min(100,p.toxin+pill.toxin);message='服下'+pill.name;
    }
    if (key === 'heal') {
      refreshHeal();
      if (!p.heal) { message = '回春丹已用尽。'; return; }
      if (p.toxin >= 100) { message = '丹毒已满，无法继续服丹！'; return; }
      if (p.hp >= maxHP(state)) { message = '气血已满。'; return; }
      const pill=ITEMS[p.healItem];healingStock[p.healItem]--;p.hp=Math.min(maxHP(state),p.hp+Math.round(pill.heal*Math.max(.2,1-p.toxin/125)));p.toxin=Math.min(100,p.toxin+pill.toxin);message='服下'+pill.name+' · 丹毒+'+pill.toxin;refreshHeal();
    }
  };
  const map = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', KeyW: 'jump', KeyJ: 'attack', KeyK: 'dodge', KeyL: 'skill', KeyH: 'heal' };
  function down(e) { if (!map[e.code]) return; e.preventDefault(); if (!e.repeat) trigger(map[e.code]); keys.add(map[e.code]); }
  function up(e) { if (map[e.code]) { e.preventDefault(); keys.delete(map[e.code]); } }
  function blur() { keys.clear(); }
  window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur);window.addEventListener('resize',syncPause);window.addEventListener('focus',syncPause);if(typeof document!=='undefined')document.addEventListener('visibilitychange',syncPause);syncPause();
  const render = () => {
    ctx.setTransform(1/2,0,0,1/2,0,0);
    ctx.fillStyle=dungeon.sky;ctx.fillRect(0,0,VIEW_WIDTH,viewHeight);
    if(art.forest){ctx.drawImage(art.forest,0,0,VIEW_WIDTH,viewHeight);ctx.globalAlpha=.18;ctx.fillStyle=dungeon.sky;ctx.fillRect(0,0,VIEW_WIDTH,viewHeight);ctx.globalAlpha=1;}
    ctx.save();ctx.translate(0,viewHeight-500);
    if(!art.forest){ctx.fillStyle=dungeon.accent;ctx.fillRect(314,45,36,36);ctx.fillRect(308,51,48,24);}
    if(!art.forest)for(let layer=0;layer<3;layer++){
      ctx.fillStyle=layer===0?dungeon.mist:layer===1?dungeon.floor:'#243f34';
      for(let x=0;x<VIEW_WIDTH;x+=12){const y=195+layer*55+Math.floor((Math.sin((x+camera*(.12+layer*.12))/100)*42+Math.cos(x/170)*30)/12)*12;ctx.fillRect(x,y,12,500-y);}
    }
    ctx.save();ctx.translate(-Math.round(camera/3)*3,0);
    if(!art.forest)for(let i=0;i<14;i++){
      const x=i*210+40;
      if(['forest','flower','swamp'].includes(dungeon.theme))drawSprite(ctx,'tree',x,190,15,{e:dungeon.theme==='flower'?'#aa7959':dungeon.mist,f:dungeon.accent,a:dungeon.sky});
      else {ctx.fillStyle=dungeon.floor;ctx.fillRect(x,230,42,180);ctx.fillStyle=dungeon.mist;ctx.fillRect(x-12,218,66,18);ctx.fillRect(x+6,230,9,180);}
    }
    platforms.forEach(t=>{
      ctx.fillStyle=dungeon.floor;ctx.fillRect(t.x,t.y,t.w,t.h);ctx.fillStyle=dungeon.accent;ctx.fillRect(t.x,t.y,t.w,6);
      ctx.fillStyle=dungeon.mist;for(let x=t.x+12;x<t.x+t.w-6;x+=30)ctx.fillRect(x,t.y+12,15,6);
    });
    if(dungeon.theme==='lava'){ctx.fillStyle='#d97848';ctx.fillRect(0,474,2700,27);for(let x=0;x<2700;x+=60){ctx.fillStyle='#edb268';ctx.fillRect(x,480,24,6);}}
    if(dungeon.theme==='snow'){ctx.fillStyle='#d5e0d5';for(let i=0;i<60;i++)ctx.fillRect((i*157)%2700,((i*61)+Math.floor(performance.now()/100))%410,3,3);}
    ctx.fillStyle=doubleJump?'#709670':'#b39b60';ctx.fillRect(930,GROUND-72,36,72);ctx.fillStyle='#d9cf93';ctx.fillRect(942,GROUND-60,12,39);
    ctx.font='15px monospace';ctx.textAlign='center';ctx.fillStyle='#f0dfb1';ctx.fillText(doubleJump?'御风已悟':'御风碑',948,320);
    pickups.forEach(t=>{if(t.taken)return;if(!drawItem(ctx,t.item,t.x-16,t.y-16,32))drawSprite(ctx,t.item==='moon'?'herb':t.item==='ore'?'coin':'pill',t.x-15,t.y-12,3);});
    mobs.forEach(m=>{
      if(m.hp<=0)return;
      drawSprite(ctx,'beast',Math.round(m.x/3)*3,m.y,m.boss?6:3,{k:m.flash>0?'#fff2cd':m.windup>0?'#e9be83':dungeon.enemy,h:dungeon.accent,a:'#1e2c29'});
      ctx.fillStyle='#1b2922';ctx.fillRect(m.x,m.y-20,m.w,6);ctx.fillStyle='#d28f6d';ctx.fillRect(m.x,m.y-20,m.w*m.hp/m.max,6);
      ctx.fillStyle='#eed4ab';ctx.fillText(ELEMENTS[m.element]+'属性',m.x+m.w/2,m.y-8);
      if(m.boss){ctx.fillStyle='#eed4ab';ctx.fillText(dungeon.boss,m.x+m.w/2,m.y-30);}
      if(m.windup>0){ctx.fillStyle='#e59c6266';const range=m.boss?125:65;ctx.fillRect(m.facing<0?m.x-range:m.x+m.w/2,m.y,range,m.h);ctx.fillStyle='#ffd899';ctx.fillText('!',m.x+m.w/2,m.y-45);}
    });
    ctx.globalAlpha=p.invincible>0&&Math.floor(performance.now()/80)%2?.45:1;
    if(!drawHero(ctx,p.x-6+(p.swing>0?p.face*4:0),p.y-8-(p.swing>0?2:0),60,p.face)){drawSprite(ctx,'hero',Math.round(p.x/3)*3-3,Math.round(p.y/3)*3,3);drawSprite(ctx,'sword',p.x+(p.face>0?20:-25),p.y+5,3);}
    if(p.swing>0){ctx.fillStyle='#f6df95';const x=p.face>0?p.x+24:p.x-60;ctx.fillRect(x,p.y+8,60,6);ctx.fillRect(x+6,p.y+2,36,6);ctx.fillRect(x+6,p.y+14,36,6);}
    ctx.globalAlpha=1;
    for(const e of effects){if(e.type==='damage'){ctx.fillStyle=e.counter?'#ffdd79':'#f6ebcd';ctx.font='bold 14px monospace';ctx.fillText(Math.round(e.amount)+(e.counter?' ×2':''),e.x,e.y-(.6-e.time)*30);}if(e.type==='skill'){ctx.globalAlpha=Math.min(1,e.time*4);ctx.fillStyle=colors[e.element];const x=e.face>0?e.x:e.x-e.range;if(art['battle-fx']){const col=['metal','wood','water','fire','earth'].indexOf(e.element);ctx.drawImage(art['battle-fx'],col*64,0,64,64,x,e.y-6,e.range,66);}for(let i=0;i<5;i++)ctx.fillRect(x+i*e.range/5,e.y+10+i%2*8,e.range/7,4);ctx.globalAlpha=1;}}
    ctx.restore();
    ctx.fillStyle='#e0dcb3';ctx.font='12px monospace';ctx.textAlign='left';ctx.fillText('入口',35-camera,390);ctx.fillText('上层药谷 · 二段跳',platforms[6].x-camera,platforms[6].y-45);ctx.restore();
    ctx.fillStyle='#172e25';ctx.fillRect(8,8,VIEW_WIDTH-16,37);ctx.fillStyle='#e7e4c9';ctx.textAlign='left';ctx.font='15px monospace';ctx.fillText(message,16,33,VIEW_WIDTH-32);
  };
  let previous = performance.now();
  const tick = now => {
    if(ended) return;
    const dt=Math.min(.032,(now-previous)/1000);previous=now;
    if(paused){render();frame=requestAnimationFrame(tick);return;}
    for(let i=effects.length-1;i>=0;i--){effects[i].time-=dt;if(effects[i].time<=0)effects.splice(i,1);}
    p.cooldown=Math.max(0,p.cooldown-dt);p.swing=Math.max(0,p.swing-dt);p.invincible=Math.max(0,p.invincible-dt);
    p.vx=(keys.has('right')?210:0)-(keys.has('left')?210:0);if(p.vx)p.face=Math.sign(p.vx);
    p.x=Math.max(0,Math.min(W-p.w,p.x+p.vx*dt));
    const oldY=p.y;p.vy+=980*dt;p.y+=p.vy*dt;
    platforms.forEach(t=>{if(p.vy>=0 && oldY+p.h<=t.y+3 && p.y+p.h>=t.y && p.x+p.w>t.x && p.x<t.x+t.w){p.y=t.y-p.h;p.vy=0;p.jumps=0;}});
    if(Math.abs(p.x-940)<60 && !doubleJump){doubleJump=true;message='领悟御风步！按两次跳跃可抵达上层药谷，回访高处资源。';}
    pickups.forEach(t=>{if(!t.taken && Math.abs(p.x+14-t.x)<30 && Math.abs(p.y+25-t.y)<48){t.taken=true;loot[t.item]+=t.qty;message=`采得${t.item==='moonSeed'?'月华种子':t.item==='moon'?'月华仙草':t.item==='ore'?'赤铜矿':'内丹'} × ${t.qty}`;}});
    mobs.forEach(m=>{
      if(m.hp<=0||tier===0&&p.x<200)return;
      m.flash=Math.max(0,(m.flash??0)-dt);m.cooldown=Math.max(0,m.cooldown-dt);
      const distance=p.x-m.x;
      if(m.windup>0){m.windup-=dt;if(m.windup<=0){if((tier!==0||Math.sign(distance)===m.facing)&&Math.abs(distance)<(m.boss?125:65) && p.y+p.h>m.y+15)damage(tier===0?(m.boss?22:12):(m.boss?30+tier*3:15+tier*2));m.cooldown=tier===0?(m.boss?1.8:1.4):(m.boss?1.2:1);}}
      else if(Math.abs(distance)<(m.boss?105:48) && m.cooldown<=0 && p.y+p.h>m.y+15){m.windup=tier===0?(m.boss?1:.8):(m.boss?.65:.5);m.facing=Math.sign(distance)||1;}
      else if(Math.abs(distance)<240 && m.cooldown<=0)m.x+=Math.sign(distance)*(m.boss?42:58)*dt;
    });
    camera=Math.max(0,Math.min(W-VIEW_WIDTH,p.x-VIEW_WIDTH*.4));render();
    hudTick+=dt;if(hudTick>.1){onHUD({hp:p.hp,maxHP:maxHP(state),mana:p.mana,maxMana:maxMana(state),toxin:p.toxin,heal:p.heal,healItem:p.healItem,loot,doubleJump,hint:hints&&tier===0?(!guideDone.has('right')?'按住左右移动，入口区域安全':!guideDone.has('jump')?'点击跳跃，越过石台':!guideDone.has('attack')?'点击攻击，近身挥剑':!guideDone.has('skill')?'点击技能释放，金克木伤害×2':'向右寻御风碑，二段跳后回访高处药谷'):''});hudTick=0;}
    if(p.hp<=0){finish(true);return;}frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return {
    setHints(value){hints=value;},
    press(key){keys.add(key);trigger(key);}, release(key){keys.delete(key);}, retreat(){finish(false);},
    snapshot(){return {x:p.x,y:p.y,hp:p.hp,doubleJump,camera,viewWidth:VIEW_WIDTH,viewHeight,paused,dungeonId:dungeon.id,enemyHP:mobs.map(m=>m.hp),enemyElements:mobs.map(m=>m.element),enemies:mobs.map(m=>({x:m.x,hp:m.hp,boss:m.boss})),platforms:platforms.map(t=>({...t}))};},
    dispose(){if(!ended){ended=true;cancelAnimationFrame(frame);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);window.removeEventListener('resize',syncPause);window.removeEventListener('focus',syncPause);if(typeof document!=='undefined')document.removeEventListener('visibilitychange',syncPause);}}
  };
}
