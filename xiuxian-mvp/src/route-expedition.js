import {tameBlock,tameChance,capturePet,petSkillDamage,petIncoming,petTargetChance} from './pets.js';
import {applyBuff,buffValue} from './pill-buffs.js';
import {criticalRate,dodgeRate,rollCritical,rollDodge} from './combat-stats.js';
import {SKILLS,learnedSkillDamage,skillDamage,COUNTERS,ELEMENTS} from './elements.js';
export const ROUTE_STEPS=[{name:'竹林入口',choices:['herbs','hunt']},{name:'溪边岔路',choices:['mine','hunt']},{name:'竹海古碑',choices:['stele']},{name:'竹海深处',choices:['herbs','hunt']},{name:'兽王巢穴',choices:['boss']}];
export const ROUTE_CHOICES={herbs:'采药',mine:'采矿',hunt:'战斗寻宝',stele:'探查古碑',boss:'挑战兽王'};
const addLoot=(r,id,n)=>r.loot[id]=(r.loot[id]??0)+n;
const log=(r,text)=>{r.log.unshift(text);r.log=r.log.slice(0,8);};
export function startRoute(s,stats,supplies,items){
 if(s.routeRun)throw new Error('当前已有未结束的探索。');
 const stock={};for(const [id,n]of Object.entries(supplies??{})){if(!Number.isSafeInteger(n)||n<0||!items[id]||!(items[id].heal||items[id].manaRestore||items[id].buff||items[id].tame)||n>(s.inventory[id]??0))throw new Error('携带丹药数量无效或库存不足。');if(n)stock[id]=n;}
 s.routeRun={pet:structuredClone(s.expeditionPet??null),version:1,dungeon:'qinglan',depth:0,phase:'explore',hp:stats.hp,maxHP:stats.hp,mana:s.mana,maxMana:stats.mana,toxin:s.toxin,attack:stats.attack,defense:stats.defense,baseAttack:stats.attack-buffValue(s,'attack'),baseDefense:stats.defense-buffValue(s,'defense'),temporaryBuffs:structuredClone(s.temporaryBuffs??{}),criticalRate:stats.criticalRate??.05,dodgeRate:stats.dodgeRate??.05,skills:s.skillLoadout.map(id=>({id,...SKILLS[id],damage:learnedSkillDamage(s,id)})),stock,used:{},loot:{},log:['御剑落在青岚竹海入口。选择路线，也可随时带资源回家。'],completedStage:0,doubleJump:!!s.doubleJump,cleared:false,enemy:null,visited:[],turn:0};
}
function intent(enemy){const index=enemy.turn%4;if(index===0)return {kind:'attack',label:'扑击',damage:enemy.boss?20:12};if(index===1)return {kind:'charge',label:'蓄力，下回合重击',damage:0};if(index===2)return {kind:'heavy',label:'重击',damage:enemy.boss?34:22};return {kind:'heal',label:'回复生命',heal:enemy.boss?18:8,damage:0};}
function spawn(r,boss=false,ambush=false){r.phase='combat';r.enemy={name:boss?'青岚兽王':r.depth<2?'青竹獠鼠':'竹影妖狼',element:r.depth===1?'earth':'wood',hp:boss?220:55+r.depth*15,maxHP:boss?220:55+r.depth*15,boss,turn:0,sprite:boss?2:r.depth<2?0:1};r.enemy.intent=intent(r.enemy);log(r,(ambush?'采集惊动妖兽！':'前方出现')+r.enemy.name+'，请根据意图选择行动。');}
function advance(r){r.depth++;r.completedStage=Math.max(r.completedStage,r.depth>=4?2:r.depth>=2?1:0);r.phase='explore';r.enemy=null;}
function defeated(r){r.phase='finished';r.outcome='defeated';log(r,'受伤过重，被迫退出秘境，本次资源仅保留一半。');}
function enemyTurn(r,random){const e=r.enemy,i=e.intent;if(i.kind==='heal'){const amount=Math.min(i.heal,e.maxHP-e.hp);e.hp+=amount;log(r,e.name+'回复'+amount+'点生命。');}else if(i.kind==='charge')log(r,e.name+'正在蓄力，下回合将重击。');else if(r.pet?.hp>0&&random()<petTargetChance(r.pet)){const amount=petIncoming(r.pet,i.damage,e.element);log(r,e.name+'攻击灵兽，'+r.pet.name+'受到'+amount+'点伤害。'+(r.pet.hp<=0?'灵兽倒下，本趟停止协战。':''));}else if(rollDodge(r,random))log(r,'闪避！躲开了'+e.name+'的'+i.label+'。');else{const amount=Math.max(3,i.damage-r.defense);r.hp=Math.max(0,r.hp-amount);log(r,e.name+i.label+'造成'+amount+'点伤害。');}e.turn++;e.intent=intent(e);if(r.hp<=0)defeated(r);}
function win(r){const e=r.enemy;addLoot(r,'hide',e.boss?4:2);addLoot(r,'core',e.boss?2:1);addLoot(r,'herb',e.boss?5:2+r.depth);if(e.boss){addLoot(r,'moon',3);addLoot(r,'moonSeed',2);r.cleared=true;r.completedStage=3;r.phase='reward';r.enemy=null;log(r,'青岚兽王已败！获得内丹与月华种子，可带资源回家。');}else{log(r,'战胜'+e.name+'，获得兽皮和内丹。');advance(r);}}
function petTurn(r){if(r.pet?.hp>0&&r.pet.stance==='attack'&&r.enemy){const damage=petSkillDamage(r.pet,r.enemy.element);r.enemy.hp=Math.max(0,r.enemy.hp-damage);log(r,r.pet.name+'协战造成'+damage+'点'+ELEMENTS[r.pet.element]+'属性技能伤害。'+(COUNTERS[r.pet.element]===r.enemy.element?'五行克制 ×2':''));if(r.enemy.hp<=0){win(r);return true;}}return false;}
export function routeAction(s,payload,items,random=Math.random){
 if(s.npcEncounter)throw new Error('请先完成眼前的秘境奇遇。');const r=s.routeRun;if(!r||r.phase==='finished')throw new Error('当前没有进行中的历练。');
 if(payload.kind==='pet-stance'){if(!r.pet||r.pet.hp<=0)throw new Error('当前没有可行动的灵兽。');r.pet.stance=r.pet.stance==='attack'?'defend':'attack';log(r,'灵兽切换为'+(r.pet.stance==='attack'?'攻击':'防御')+'状态。');return;}
 if(payload.kind==='retreat'){r.phase='finished';r.outcome=r.cleared?'cleared':'retreat';log(r,'选择撤离，保存本趟资源。');return;}
 if(payload.kind==='choose'){
  if(r.phase!=='explore')throw new Error('请先结束当前战斗。');const node=ROUTE_STEPS[r.depth];if(!node?.choices.includes(payload.choice))throw new Error('当前不能选择这条路线。');r.visited.push({node:node.name,choice:payload.choice});
  if(payload.choice==='boss'){spawn(r,true);return;}if(payload.choice==='hunt'){spawn(r);return;}
  if(payload.choice==='stele'){s.exploredStele=true;log(r,'循古碑药香找到灵草，获得月华种子。');addLoot(r,'moonSeed',1);addLoot(r,'moon',1);advance(r);return;}
  if(payload.choice==='herbs'){addLoot(r,'herb',4+r.depth);addLoot(r,'moon',1+Math.floor(r.depth/2));log(r,'采集灵草收入临时行囊。');}else{addLoot(r,'ore',3+r.depth);log(r,'开采矿石收入临时行囊。');}
  if(random()<.25)spawn(r,false,true);else advance(r);return;
 }
 if(payload.kind==='tame'){if(r.phase!=='combat')throw new Error('当前没有可驯服的妖兽。');const id=payload.item,item=items[id];if(!item?.tame||!(r.stock[id]>0)||!(s.inventory[id]>0))throw new Error('没有携带御兽丹。');const block=tameBlock(s,r.enemy);if(block)throw new Error(block);r.stock[id]--;s.inventory[id]--;r.used[id]=(r.used[id]??0)+1;r.turn++;if(random()<tameChance(r.enemy,item)){const pet=capturePet(s,r.enemy);log(r,'驯服成功！'+pet.name+'入住灵兽小屋。');advance(r);}else{log(r,'驯服失败，御兽丹已消耗。');if(!petTurn(r))enemyTurn(r,random);}return;}
 const inCombat=r.phase==='combat';if(!inCombat&&payload.kind!=='pill')throw new Error('当前没有需要战斗的妖兽。');
 if(payload.kind==='pill'){
  const item=items[payload.item];if(!item||!(item.heal||item.manaRestore||item.buff)||!(r.stock[payload.item]>0)||(s.inventory[payload.item]??0)<=0)throw new Error('没有携带这颗丹药。');if(r.toxin>=100)throw new Error('丹毒已满，不能继续服丹。');if(item.heal&&r.hp>=r.maxHP||item.manaRestore&&r.mana>=r.maxMana)throw new Error('当前无需服用此丹药。');
  if(item.buff){r.baseAttack??=r.attack-buffValue(r,'attack');r.baseDefense??=r.defense-buffValue(r,'defense');applyBuff(r,item,r.toxin);r.attack=r.baseAttack+buffValue(r,'attack');r.defense=r.baseDefense+buffValue(r,'defense');}
  const efficacy=Math.max(.2,1-r.toxin/125);if(item.heal)r.hp=Math.min(r.maxHP,r.hp+Math.round(item.heal*efficacy));if(item.manaRestore)r.mana=Math.min(r.maxMana,r.mana+Math.round(item.manaRestore*efficacy));r.toxin=Math.min(100,r.toxin+item.toxin);r.stock[payload.item]--;s.inventory[payload.item]--;r.used[payload.item]=(r.used[payload.item]??0)+1;log(r,'服用'+item.name+'，丹毒+'+item.toxin+'。');if(inCombat){r.turn++;if(!petTurn(r))enemyTurn(r,random);}return;
 }
 let damage=r.attack,skill;
 if(payload.kind==='skill'){skill=r.skills.find(k=>k.id===payload.item);if(!skill)throw new Error('本次未携带该技能。');if(r.mana<skill.mana)throw new Error('法力不足，可服用携带的回灵丹。');r.mana-=skill.mana;damage=skillDamage(skill.damage,skill,r.enemy.element);}else if(payload.kind!=='attack')throw new Error('未知行动。');
 const hit=rollCritical(damage,r,random);damage=hit.damage;r.turn++;r.enemy.hp=Math.max(0,r.enemy.hp-damage);log(r,(hit.critical?'暴击！':'')+(skill?skill.name:'普通攻击')+'造成'+damage+'点伤害。'+(skill&&COUNTERS[skill.element]===r.enemy.element?ELEMENTS[skill.element]+'克'+ELEMENTS[r.enemy.element]+'！':''));if(r.enemy.hp===0)win(r);else if(!petTurn(r))enemyTurn(r,random);
}
export function routeResult(s,items){const r=s.routeRun;if(!r||r.phase!=='finished')throw new Error('探索尚未结束。');return {hp:r.hp,mana:r.mana,toxin:r.toxin,healingStock:Object.fromEntries(Object.entries(items).filter(([,i])=>i.heal||i.manaRestore||i.buff||i.tame).map(([id])=>[id,s.inventory[id]??0])),loot:{...r.loot},bossDefeated:r.cleared,doubleJump:r.doubleJump,completedStage:r.completedStage,defeated:r.outcome==='defeated'};}
