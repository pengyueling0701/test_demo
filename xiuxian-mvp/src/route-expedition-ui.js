import {buffDescription,buffSummary} from './pill-buffs.js';
import {criticalRate,dodgeRate} from './combat-stats.js';
import {ITEMS,WEAPONS,attack,defense,maxHP,maxMana} from './game.js';
import {SKILLS,learnedSkillDamage,ELEMENTS} from './elements.js';
import {artUrl,itemIcon} from './art.js';
import {ROUTE_STEPS,ROUTE_CHOICES} from './route-expedition.js';
const btn=(label,kind,data='',disabled=false)=>'<button class="btn" data-action="route-action" data-kind="'+kind+'" '+data+' '+(disabled?'disabled':'')+'>'+label+'</button>';
const lootText=loot=>Object.entries(loot).filter(([,n])=>n>0).map(([id,n])=>ITEMS[id].name+' ×'+n).join('、')||'暂无';
export {routePreparation} from './expedition-preparation.js';

function meter(label,value,max){return '<div class="route-meter"><span>'+label+'</span><i><b style="width:'+Math.max(0,value/max*100)+'%"></b></i><strong>'+Math.ceil(value)+'/'+max+'</strong></div>';}
function monsterArt(index){const crops=[[0,270,550,450],[560,150,700,560],[1250,0,920,724]],[x,y,w,h]=crops[index];return '<div class="route-monster" role="img" aria-label="'+['青竹獠鼠','竹影妖狼','青岚兽王'][index]+'" style="background-image:url('+artUrl('qinglan-monsters-v1.png')+');background-size:'+2172/w*100+'% '+724/h*100+'%;background-position:'+(x/(2172-w)*100)+'% '+(h===724?0:y/(724-h)*100)+'%"></div>';}
export {routeView} from './route-view.js';
export function routeSummary(s){const r=s.lastRoute,e=s.lastExpedition;return '<h3>'+(r.outcome==='defeated'?'负伤归来':r.cleared?'青岚通关':'平安归来')+'</h3><p>探索 '+r.visited.length+'个节点 · 完成 '+r.completedStage+'/3段 · 精力消耗30</p><p>已入背包：'+lootText(e.loot)+'</p><p>本趟消耗：'+(r.usedPills.map(i=>ITEMS[i.id].name+' ×'+i.qty).join('、')||'未服丹')+'</p><p>归来后生命、法力已回满；当前法力 '+Math.ceil(s.mana)+'，丹毒 '+s.toxin+'。</p><p>挂机修为效率 '+s.lastEfficiency.before.xp+' → '+s.lastEfficiency.after.xp+'/小时</p><p>'+(Object.values(s.pendingLoot??{}).some(n=>n>0)?'背包未装下的战利品保存在待领区，可整理后领取。':'')+(r.outcome==='defeated'?'战败仅保留一半本趟资源。':'')+(e.sweepUnlocked?'已解锁该秘境扫荡。':'尚未通关，可重新准备后再来。')+'</p><button class="btn" data-action="navigate" data-page="homestead">回到家园</button>';}

