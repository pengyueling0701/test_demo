export const ELEMENTS={metal:'金',wood:'木',water:'水',fire:'火',earth:'土'};
export const SKILLS={
 metal:{name:'金锋剑气',element:'metal',mana:12,cost:0,range:190,power:1.8},
 wood:{name:'青藤破阵',element:'wood',mana:14,cost:250,range:220,power:1.6},
 water:{name:'寒潮灵波',element:'water',mana:16,cost:300,range:260,power:1.7},
 fire:{name:'赤焰焚击',element:'fire',mana:20,cost:400,range:180,power:2.6},
 earth:{name:'厚土震岳',element:'earth',mana:18,cost:350,range:140,power:2.3},
};
export function assignElements(catalog,overrides={},fallback='earth'){for(const [id,item]of Object.entries(catalog))item.element=overrides[id]??fallback;}
export const elementLabel=item=>ELEMENTS[item?.element]??'土';
export function validLoadout(s){return s.skillLoadout.length<=4&&new Set(s.skillLoadout).size===s.skillLoadout.length&&s.skillLoadout.every(k=>SKILLS[k]&&s.learnedSkills.includes(k));}

export const WORLD_ITEMS={spiritStone:{name:'灵石',element:'earth'},recipeBook:{name:'失传丹方',element:'wood'},oldHouse:{name:'破旧老屋',element:'earth'},woodHouse:{name:'整修木屋',element:'wood'},courtyard:{name:'乡间小院',element:'earth'},estate:{name:'修仙宅院',element:'earth'},cabinet:{name:'储物柜',element:'wood'},bed:{name:'竹榻',element:'wood'},table:{name:'炼丹工作台',element:'metal'}};

export const COUNTERS={earth:'water',water:'fire',fire:'metal',metal:'wood',wood:'earth'};
export const skillDamage=(base,skill,targetElement)=>base*skill.power*(COUNTERS[skill.element]===targetElement?2:1);
export const dungeonElement=d=>({forest:'wood',water:'water',flower:'fire',cave:'earth',snow:'water',ruin:'metal',lava:'fire',swamp:'wood',storm:'metal',palace:'earth'}[d.theme]??'earth');
