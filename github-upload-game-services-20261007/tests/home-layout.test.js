import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,transition,restoreState} from '../src/game.js';
import {defaultLayout,validateLayout,placementProblem,project,unproject,syncLayout,walkingPath,footprint} from '../src/home-layout.js';
test('布局投影、碰撞与范围限制',()=>{
 const s=initialState(),layout=defaultLayout(s);assert.ok(validateLayout(s,layout));
 for(let x=0;x<14;x++)for(let y=0;y<14;y++){const p=project(x,y);assert.deepEqual(unproject(p.x,p.y),{x,y});}
 assert.ok(placementProblem(s,layout,'willow',3,3));assert.ok(placementProblem(s,layout,'willow',0,0));assert.equal(placementProblem(s,layout,'willow',10,10),'');
 layout.roads.push({x:3,y:3});assert.throws(()=>validateLayout(s,layout));
});
test('保存布置与读档保留生产和资产，扩田自动分配位置',()=>{
 const s=initialState(),layout=defaultLayout(s);layout.objects.find(o=>o.id==='willow').y=10;
 const after=transition(s,'save-home-layout',{layout});assert.equal(after.day,s.day);assert.equal(after.cash,s.cash);assert.equal(after.debt,s.debt);assert.deepEqual(after.plots,s.plots);
 assert.deepEqual(restoreState(after).homeLayout,layout);
 after.plots.push({...after.plots[0]});syncLayout(after);assert.ok(validateLayout(after,after.homeLayout));assert.equal(after.homeLayout.objects.filter(o=>o.kind==='plot').length,after.plots.length);
});
test('步行路线绕开建筑，建筑内部不可到达',()=>{
 const s=initialState(),layout=defaultLayout(s),path=walkingPath(s,layout,{x:7,y:6},{x:2,y:3});assert.ok(path.length);
 assert.ok(path.every(p=>!layout.objects.some(o=>footprint(o).some(q=>p.x===q.x&&p.y===q.y))));assert.deepEqual(walkingPath(s,layout,{x:7,y:6},{x:3,y:3}),[]);
});
