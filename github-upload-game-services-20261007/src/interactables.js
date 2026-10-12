// Coordinates are shared by rendering and touch hit areas (384 x 420).
export const SCENE_OBJECTS=[
 {id:'furnace',cell:0,x:310,y:205,w:56,h:58,label:'丹炉',page:'alchemy'},
 {id:'market',cell:1,x:7,y:204,w:53,h:61,label:'小市',page:'shop'},
 {id:'orders',cell:2,x:15,y:140,w:42,h:56,label:'订单告示',page:'orders'},
 {id:'chest',cell:3,x:320,y:265,w:55,h:43,label:'储物箱',page:'warehouse'},
 {id:'portal',cell:4,x:17,y:68,w:51,h:64,label:'御剑秘境',page:'realm'},
 {id:'cushion',cell:5,x:322,y:355,w:51,h:46,label:'修炼蒲团',page:'cultivate'},
 {id:'tools',cell:6,x:10,y:352,w:46,h:49,label:'农具扩田',action:'expand-menu'},
 {id:'bed',cell:7,x:249,y:181,w:55,h:42,label:'竹榻休养',action:'rest',furniture:'bed'},
];
export const visibleObjects=s=>SCENE_OBJECTS.filter(o=>['furnace','bed'].includes(o.id)&&(!o.furniture||s.furniture[o.furniture]));
