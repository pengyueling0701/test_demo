import {QUESTS} from './chapter.js';
export const STORIES={
 arrival:{speaker:'无名散修',title:'旧屋与破炉',text:'五灵根，百万灵石的债契。如今只剩这间老屋。旧箱里的丹方写着：洗髓天灵丹，可重塑资质。先种活第一批草，再想长生。',page:'farm'},
 harvest:{speaker:'云游药师',title:'田里有活路',text:'急用钱就卖草，想磨手艺就炼丹。我收购药材，也接道友委托。别把下一轮种子和所有仙草都卖光。',page:'orders'},
 furnace:{speaker:'云游药师',title:'炉火重燃',text:'有了青铜炉，可以炼聚气丹。手艺要自己磨：成丹增长经验，失败损失材料。灵石买矿升级炉子，仙草才是开炉的本钱。',page:'alchemy'},
 realm:{speaker:'山中剑修',title:'御剑出山',text:'筑基后，可去青岚竹海寻月华种子。带回春丹与回灵丹，携带金系技能克制木系妖兽。遇险就撤，田还等你回来。',page:'realm'},
 discovery:{speaker:'山中剑修',title:'青岚残卷',text:'兽王守着的残卷补全了凝露丹方：青灵草配月华仙草，可以炼出低丹毒的修炼丹。洗髓天灵丹还需要月华仙草与妖兽内丹。先在家中养起月华灵田。',page:'alchemy'},
 collection:{speaker:'云游药师',title:'债去一程，田还在',text:'债主收过钱，日子还得继续。有种子就再播一轮；没有种子，留下一些仙草，只卖一株换周转。别急着把家底都投入高阶炉子。',page:'farm'},
 chapter:{speaker:'无名散修',title:'第一章 · 草庐立足',text:'我仍背着债，却已有药田、有手艺，也能御剑归来。残卷指向洗髓天灵丹：继续经营月华仙草，积攒内丹，向金丹与传说丹炉迈进。命数，终于有了可改的地方。',page:'home'},
};
export const freshJourney=()=>({version:1,seen:[],available:['arrival'],dewRecipe:false,chapterComplete:false});
export function updateJourney(s){
 s.journey??=freshJourney();const j=s.journey;
 const conditions={harvest:s.farming>0,furnace:s.furnace>=1,realm:s.realm>=1,discovery:s.clearedDungeons.includes('qinglan'),collection:s.tutorial.completed.includes('collection')};
 for(const [id,done]of Object.entries(conditions))if(done&&!j.available.includes(id))j.available.push(id);
 j.dewRecipe=conditions.discovery;
 if(QUESTS.every(q=>s.tutorial.completed.includes(q.id))){j.chapterComplete=true;if(!j.available.includes('chapter'))j.available.push('chapter');}
 return j;
}
export const pendingStory=s=>s.journey.available.find(id=>!s.journey.seen.includes(id));
