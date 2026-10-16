import {skillDamage} from './elements.js';
export const PET_CAPACITY=5;
export const petCapacity=s=>s.petCapacity??PET_CAPACITY;
export function preparePet(s,id=s.selectedPet){if(!id)return null;const p=s.pets?.find(p=>p.id===id);if(!p)throw new Error('未拥有这只灵兽。');return {...structuredClone(p),hp:p.maxHP,stance:'attack'};}
export function tameChance(enemy,item){return Math.min(.9,.35+(.3-enemy.hp/(enemy.maxHP??enemy.max))+(item.grade??0)*.07);}
export function tameBlock(s,enemy){if(!enemy||enemy.hp<=0)return '没有可驯服的妖兽。';if(enemy.boss)return '妖王不可驯服。';if(enemy.hp/(enemy.maxHP??enemy.max)>.3)return '妖兽血量需降到30%以下。';if((s.pets?.length??0)>=petCapacity(s))return '灵兽小屋已满。';return '';}
export function capturePet(s,enemy,tier=0){s.pets??=[];const seq=Math.max(0,...s.pets.map(p=>Number(p.id.split('-')[1])||0))+1;const p={id:'pet-'+seq,name:enemy.name??['青竹灵鼠','碧水妖狼','赤尾灵狐','玄甲灵兽','霜月灵狼','剑冢灵兽','焚风火蜥','幽泽灵蛛','雷鸣灵禽','太虚灵兽'][tier],element:enemy.element,maxHP:Math.max(60,enemy.maxHP??enemy.max),skillDamage:18+tier*4,defense:3+Math.floor(tier/2),sprite:enemy.sprite??(tier===0?0:1)};s.pets.push(p);s.petHouseUnlocked=true;return p;}
export const petSkillDamage=(p,target)=>skillDamage(p.skillDamage,{element:p.element},target);
export function petIncoming(p,amount,element){const damage=Math.max(1,Math.round(skillDamage(amount,{element},p.element)*(p.stance==='defend'?.5:1)-p.defense));p.hp=Math.max(0,p.hp-damage);return damage;}
export const petTargetChance=p=>p.stance==='defend'?.7:.4;
