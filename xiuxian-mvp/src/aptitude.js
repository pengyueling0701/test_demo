import {bagRoom} from './backpack.js';
export const APTITUDE_STAGES=[
 ['qinglan','云游药师','青竹灵露','wood',{herb:4,core:1}],
 ['creek','守泉老者','净泉灵髓','water',{herb:6,moon:2}],
 ['valley','采霞女修','霞光花心','fire',{moon:3,fireHerb:1}],
 ['mine','铸炉散人','地脉晶髓','earth',{herb:8,core:2}],
 ['frost','寒潭医修','寒月玉液','water',{moon:4,frostHerb:2}],
 ['ruin','守剑残魂','古剑灵魄','metal',{fireHerb:3,core:2}],
 ['fire','避火道人','焚心火莲','fire',{fireHerb:5,moon:3}],
 ['swamp','幽泽药婆','幽萤净蕊','wood',{frostHerb:4,core:3}],
 ['thunder','渡雷剑客','雷劫灵晶','metal',{moon:6,fireHerb:4,core:3}],
 ['palace','太虚守卷人','太虚道种','earth',{moon:8,frostHerb:6,core:5}],
].map(([dungeon,npc,keyName,element,materials],i)=>({level:i+1,dungeon,npc,key:'relic_'+(i+1),keyName,element,materials,pill:i===9?'supreme':'wash_'+(i+1),grade:Math.floor(i*5/9),realm:[0,1,1,1,2,2,2,3,3,3][i],lines:[["竹海瘴气渐重，我正收拾药箱离山。见你背着旧丹炉，倒像我年轻时。","泉眼将涸，我守了半生的灵髓，也该交给愿意救活它的人。","落霞只开一季。师门已散，留下的花心不应与这座空谷一同沉寂。","矿脉里的炉火已经熄了，我答应故人的最后一炉丹，或许要托付给你。","寒潭能封住伤口，却封不住岁月。我以余下的玉液，换你记住医者本心。","守剑百年，我的残魂将散。剑可斩敌，丹亦可为一个凡人续上前路。","火山将醒，我必须带弟子离开。焚心火莲留给能驾驭炉火的人。","幽萤见毒而生，也能净毒。我不愿这枚净蕊只成为商贾账上的一个数字。","雷劫之后，我已不能再握剑。愿这颗灵晶助你走过我没能走完的路。","仙宫的卷宗记着无数天才，却很少写下散修的名字。今日，这枚道种为你而留。"][i],`这份${keyName}可炼第${i+1}级洗髓丹。普通药材需你亲自种植与历练，丹方中已经记下用量。`,`信物交给你，我也该离开了。若炉火失手，信物会保留下来；莫因一炉成败放弃。`]}));
export const aptitudeLevel=s=>Math.min(10,Math.max(0,Math.floor(s.aptitudeLevel??(s.aptitude===2?10:0))));
export const aptitudeLabel=s=>'资质 '+aptitudeLevel(s)+'/10级';
export function beginNpcEncounter(s,dungeon){const stage=APTITUDE_STAGES.find(t=>t.dungeon===dungeon);if(stage&&!(s.npcStories??[]).includes(dungeon))s.npcEncounter={dungeon,index:0};}
export function advanceNpc(s){const e=s.npcEncounter,t=APTITUDE_STAGES.find(t=>t.dungeon===e?.dungeon);if(!t||(s.npcStories??[]).includes(t.dungeon))throw new Error('这段剧情已经结束。');if(e.index<t.lines.length-1){e.index++;return;}s.npcStories??=[];s.npcStories.push(t.dungeon);const n=Math.min(1,bagRoom(s,t.key));s.inventory[t.key]=(s.inventory[t.key]??0)+n;if(!n){s.pendingLoot??={};s.pendingLoot[t.key]=(s.pendingLoot[t.key]??0)+1;}s.npcEncounter=null;s.log.unshift('获赠'+t.keyName+'，'+t.npc+'已离开此秘境。');}
export function refundStoryMaterials(s,unit){for(const [id,n]of Object.entries(unit.materials??{}))if(id.startsWith('relic_')){const take=Math.min(n,bagRoom(s,id));s.inventory[id]=(s.inventory[id]??0)+take;if(take<n){s.pendingLoot??={};s.pendingLoot[id]=(s.pendingLoot[id]??0)+n-take;}}}
