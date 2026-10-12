// A shared source of truth for UI gates, game rules and combat configuration.
export const DUNGEONS = [
  { id:'qinglan', name:'青岚竹海', realm:1, level:1, boss:'青岚兽王', theme:'forest', desc:'竹影摇曳，在古碑领悟御风步。', sky:'#294d42', mist:'#537c57', floor:'#534d34', accent:'#aec779', enemy:'#a68455' },
  { id:'creek', name:'清溪石窟', realm:1, level:4, boss:'碧水灵蟒', theme:'water', desc:'溪水穿过石窟，月华草藏在石台之上。', sky:'#243e50', mist:'#537c8a', floor:'#384954', accent:'#8dd2c2', enemy:'#6695a1' },
  { id:'valley', name:'落霞药谷', realm:1, level:7, boss:'赤尾狐王', theme:'flower', desc:'红叶与灵药交错，跃过高台采集药材。', sky:'#5c3d4b', mist:'#ae796c', floor:'#634338', accent:'#e9bf82', enemy:'#bd7751' },
  { id:'mine', name:'赤铜古矿', realm:1, level:10, boss:'玄甲石傀', theme:'cave', desc:'矿脉深入山腹，石傀守着赤铜灵矿。', sky:'#282936', mist:'#565061', floor:'#554438', accent:'#d7a277', enemy:'#a79482' },
  { id:'frost', name:'霜月寒潭', realm:2, level:1, boss:'霜月狼王', theme:'snow', desc:'残雪映着寒月，冷风中寻得稀有仙草。', sky:'#2c4055', mist:'#8296a4', floor:'#485970', accent:'#d8e5e5', enemy:'#a2bac6' },
  { id:'ruin', name:'古剑遗冢', realm:2, level:5, boss:'守冢剑魁', theme:'ruin', desc:'残剑遍地的古老遗迹，守卫尚未沉眠。', sky:'#343647', mist:'#78788a', floor:'#57505a', accent:'#c8b3a2', enemy:'#9990a4' },
  { id:'fire', name:'焚风火山', realm:2, level:10, boss:'焚风火蜥', theme:'lava', desc:'火山石阶炽热，深处潜伏着火蜥。', sky:'#462c33', mist:'#9a5142', floor:'#51352f', accent:'#eeae65', enemy:'#d37a4b' },
  { id:'swamp', name:'幽萤毒泽', realm:3, level:1, boss:'幽泽蛛母', theme:'swamp', desc:'萤光与藤蔓交织，谨慎接近巨蛛巢穴。', sky:'#252e39', mist:'#536259', floor:'#3f4936', accent:'#b1c68a', enemy:'#8c8eae' },
  { id:'thunder', name:'雷鸣天阶', realm:3, level:5, boss:'紫电雷鹏', theme:'storm', desc:'天阶漂浮于云海，雷鹏巡视高处的灵药。', sky:'#302e51', mist:'#71698f', floor:'#514c6c', accent:'#dfcbf5', enemy:'#b59cc8' },
  { id:'palace', name:'太虚仙宫', realm:3, level:10, boss:'太虚守门人', theme:'palace', desc:'九境之后的仙宫，古老守门人等待来者。', sky:'#384451', mist:'#8c9c94', floor:'#6c6a5c', accent:'#f2d694', enemy:'#bfaa7a' },
];
export const dungeonLabel = d => `${['炼气','筑基','金丹','元婴'][d.realm]}${d.level}级`;
export const dungeonUnlocked = (s,d) => !!d && (s.realm>d.realm || s.realm===d.realm && s.level>=d.level);
export const dungeonById = id => DUNGEONS.find(d=>d.id===id);
export const sweepWait = (s,id) => Math.max(0,(s.sweepReadyDays?.[id]??0)-s.day);
export const sweepAvailable = (s,id) => (s.clearedDungeons??[]).includes(id)&&sweepWait(s,id)===0;
export function sweepLoot(dungeon) {
  const tier=DUNGEONS.indexOf(dungeon);
  const loot={herb:4+Math.floor(tier/2),moon:2+Math.floor(tier/3),ore:2+Math.floor(tier/2),core:1+Math.floor(tier/3)};return Object.fromEntries(Object.entries(loot).map(([id,qty])=>[['herb','moon','core'].includes(id)&&tier>=2?id+'_q'+Math.min(5,1+Math.floor(tier/2)):id,qty]));
}
export function dungeonLayout(index) {
  const shift = index % 3 * 12;
  return [
    {x:0,y:410,w:2700,h:90},
    {x:230+index*7,y:330,w:170,h:18},
    {x:450+index*9,y:250+shift,w:160,h:18},
    {x:740-index*5,y:325-shift,w:190,h:18},
    {x:1050+index*4,y:320+shift,w:170,h:18},
    {x:1320-index*6,y:285-shift,w:140,h:18},
    {x:1510+index*8,y:160+shift,w:250,h:18},
    {x:1880-index*7,y:330,w:170,h:18},
    {x:2220+index*4,y:285-shift,w:170,h:18},
  ];
}
