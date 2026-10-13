import {QUESTS} from './chapter.js';
export const STORIES={
 arrival:{speaker:'无名散修',title:'旧屋与破炉',text:'五灵根的底层散修，逃离困境后回到这间老屋。旧箱里的丹方写着：洗髓天灵丹，可重塑资质。先种活第一批草，再想长生。',page:'farm'},
 harvest:{speaker:'云游药师',title:'田里有活路',text:'急用钱就卖草，想磨手艺就炼丹。我收购药材，也接道友委托。安排灵田持续培育，让丹炉在离线时也继续运转。',page:'orders'},
 furnace:{speaker:'云游药师',title:'炉火重燃',text:'有了青铜炉，可以炼聚气丹。手艺要自己磨：成丹增长经验，失败损失材料。灵石买矿升级炉子，仙草才是开炉的本钱。',page:'alchemy'},
 realm:{speaker:'山中剑修',title:'御剑出山',text:'筑基后，可去青岚竹海寻月华种子。带回春丹与回灵丹，携带金系技能克制木系妖兽。遇险就撤，田还等你回来。',page:'realm'},
 discovery:{speaker:'山中剑修',title:'青岚残卷',text:'兽王守着的残卷补全了凝露丹方：青灵草配月华仙草，可以炼出低丹毒的修炼丹。洗髓天灵丹还需要月华仙草与妖兽内丹。先在家中养起月华灵田。',page:'alchemy'},
 idle:{speaker:'云游药师',title:'修行不息',text:'闭关时修为积累，外出时历练精进。药田和丹房持续生产；上线收获后，试着挑战下一关，收益也会提高。',page:'home'},
 chapter:{speaker:'无名散修',title:'第一章 · 草庐立足',text:'我已有持续产出的药田、有手艺，也能御剑归来。残卷指向洗髓天灵丹：继续经营月华仙草，积攒内丹，向元婴与传说丹炉迈进。命数，终于有了可改的地方。',page:'home'},
};
export const freshJourney=()=>({version:1,seen:[],available:['arrival'],dewRecipe:false,chapterComplete:false});
export function updateJourney(s){
 s.journey??=freshJourney();const j=s.journey;
 const conditions={harvest:s.farming>0,furnace:s.furnace>=1,realm:s.realm>=1,discovery:s.clearedDungeons.includes('qinglan'),idle:s.tutorial.completed.includes('idle')};
 for(const [id,done]of Object.entries(conditions))if(done&&!j.available.includes(id))j.available.push(id);
 j.dewRecipe=conditions.discovery;
 if(QUESTS.every(q=>s.tutorial.completed.includes(q.id))){j.chapterComplete=true;if(!j.available.includes('chapter'))j.available.push('chapter');}
 return j;
}
export const pendingStory=s=>s.journey.available.find(id=>!s.journey.seen.includes(id));
