import test from 'node:test';
import assert from 'node:assert/strict';
import {constrainCamera,zoomCamera,attachHomeCamera} from '../src/home-camera.js';
test('家园镜头限制缩放和拖动边界，不露出地图外空白',()=>{
 const c=constrainCamera({scale:1,x:100,y:-1000},390,782);assert.equal(c.x,0);assert.equal(c.y,-391);constrainCamera(Object.assign(c,{scale:.1}),390,782);assert.equal(c.scale,2/3);assert.equal(c.x,0);assert.equal(c.y,0);
});
test('双指缩放以手势中心为锚点，缩放后仍保持边界',()=>{
 const c={scale:1,x:-97.5,y:-195.5};zoomCamera(c,1.5,{x:195,y:391},390,782);assert.equal((195-c.x)/c.scale,292.5);assert.equal((391-c.y)/c.scale,586.5);zoomCamera(c,2/3,{x:195,y:391},390,782);assert.equal(c.x,0);assert.equal(c.y,0);
});
test('拖动和双指手势不会误触按钮，取消手势后清理指针',()=>{
 const original=globalThis.ResizeObserver;let disconnected=false;globalThis.ResizeObserver=class{observe(){}disconnect(){disconnected=true;}};
 try{
 const listeners={},layer={style:{}},view={clientWidth:390,clientHeight:782,querySelector:()=>layer,getBoundingClientRect:()=>({left:0,top:0}),addEventListener:(type,f)=>listeners[type]=f,setPointerCapture:()=>{}};
 const camera={initialized:false};const dispose=attachHomeCamera(view,camera);const event=(id,x,y)=>({pointerId:id,pointerType:'touch',clientX:x,clientY:y,preventDefault(){}});
 listeners.pointerdown(event(1,100,300));listeners.pointermove(event(1,150,300));assert.equal(camera.x,-47.5);listeners.pointerup(event(1,150,300));let blocked=false;listeners.click({preventDefault(){},stopImmediatePropagation(){blocked=true;}});assert.ok(blocked);
 listeners.pointerdown(event(1,100,300));listeners.pointerdown(event(2,200,300));listeners.pointermove(event(2,250,300));assert.equal(camera.scale,1.5);listeners.pointercancel(event(1,100,300));listeners.pointercancel(event(2,250,300));const before=layer.style.transform;listeners.pointermove(event(1,150,300));assert.equal(layer.style.transform,before);dispose();assert.ok(disconnected);
 }finally{globalThis.ResizeObserver=original;}
});
