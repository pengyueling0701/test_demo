import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,transition as gameTransition,maxHP,restoreState} from '../src/game.js';
const transition=(s,a,p)=>gameTransition(s,a,p,()=>0);
import {EQUIPMENT,EQUIPMENT_SLOTS,itemCategory} from '../src/systems.js';
test('丹炉逐级付费升级，境界门槛与低品质兼容',()=>{
 let s=initialState();s.cash=20000;s.inventory.herb=10;s.inventory.ore=46;
 assert.throws(()=>transition(s,'brew',{item:'heal1'}));
 s=transition(s,'furnace');assert.equal(s.cash,19820);assert.equal(s.inventory.ore,44);s=transition(s,'furnace');
 assert.throws(()=>transition(s,'furnace'));s.realm=1;s=transition(s,'furnace');
 assert.throws(()=>transition(s,'furnace'));s.realm=2;s=transition(s,'furnace');s=transition(s,'furnace');
 assert.equal(s.furnace,5);assert.throws(()=>transition(s,'furnace'));assert.equal(transition(s,'brew',{item:'heal'}).inventory.heal,1);
});
test('八部位购买不自动穿戴，同槽替换不叠加，卸下限制当前气血',()=>{
 let s=initialState();s.cash=20000;s.realm=1;
 for(const slot of Object.keys(EQUIPMENT_SLOTS)){
  const id=Object.keys(EQUIPMENT).find(k=>EQUIPMENT[k].slot===slot&&EQUIPMENT[k].realm===0);
  s=transition(s,'buy-equipment',{item:id});assert.equal(s.equipped[slot],null);
  s=transition(s,'equip',{item:id});assert.equal(s.equipped[slot],id);
 }
 assert.equal(maxHP(s),210);assert.equal(s.hp,100);
 s=transition(s,'buy-equipment',{item:'head_spirit'});s=transition(s,'equip',{item:'head_spirit'});assert.equal(maxHP(s),220);
 s.hp=220;s=transition(s,'unequip',{slot:'head'});assert.equal(s.hp,200);
 assert.throws(()=>transition(s,'buy-equipment',{item:'head_spirit'}));
 assert.throws(()=>transition(initialState(),'equip',{item:'robe'}));
});
test('旧丹炉和衣袍迁移保留，仓库材料分类',()=>{
 const raw=initialState();delete raw.systemsVersion;delete raw.equipped;delete raw.ownedEquipment;raw.furnace=2;raw.armor=true;raw.inventory.herb=9;
 const s=restoreState(raw);assert.equal(s.furnace,3);assert.equal(s.equipped.body,'robe');assert.equal(s.inventory.herb,9);
 assert.deepEqual(['moonSeed','moon','ore','core','heal5'].map(itemCategory),['seed','herb','mineral','monster','pill']);
});

test('丹炉升级矿石或资金不足不扣资源，不同品质矿石可抵升级材料',()=>{const s=initialState();assert.throws(()=>transition(s,'furnace'));assert.equal(s.cash,500);s.inventory.ore=2;s.cash=100;assert.throws(()=>transition(s,'furnace'));assert.equal(s.inventory.ore,2);s.cash=500;s.inventory.ore=1;s.inventory.ore_q2=1;const n=transition(s,'furnace');assert.equal(n.furnace,1);assert.equal(n.cash,320);assert.equal(n.inventory.ore,0);assert.equal(n.inventory.ore_q2,0);assert.equal(n.debt,s.debt);});
