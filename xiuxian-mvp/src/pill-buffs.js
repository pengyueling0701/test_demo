export const BUFF_NAMES={attack:'攻击',defense:'防御',critical:'暴击率',dodge:'闪避率'};
export const buffValue=(s,key)=>s.temporaryBuffs?.[key]?.value??0;
export function buffAmount(item,toxin=0){const v=item.buff.value*Math.max(.2,1-toxin/125);return ['critical','dodge'].includes(item.buff.stat)?Math.round(v*10000)/10000:Math.max(1,Math.round(v));}
export function applyBuff(s,item,toxin=0){const value=buffAmount(item,toxin),key=item.buff.stat;if(buffValue(s,key)>=value)throw new Error('同类增益已生效，较低或相同效果不能叠加。');s.temporaryBuffs??={};s.temporaryBuffs[key]={value,name:item.name};}
export function buffDescription(item){const b=item.buff;return BUFF_NAMES[b.stat]+'+'+(['critical','dodge'].includes(b.stat)?Math.round(b.value*100)+'个百分点':b.value)+' · 本趟秘境有效 · 同类取较高值 · 丹毒+'+item.toxin;}
export const buffSummary=s=>Object.entries(s.temporaryBuffs??{}).map(([k,b])=>BUFF_NAMES[k]+'+'+(['critical','dodge'].includes(k)?Math.round(b.value*10000)/100+'%':b.value)).join(' · ');
