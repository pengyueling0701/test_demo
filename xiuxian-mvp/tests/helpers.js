import {transition as rawTransition,tickProduction} from '../src/game.js';
// Broader rule tests advance the real queue clock instead of assuming instant brewing.
export function completedTransition(s,action,payload={},random=()=>0){
 let n=rawTransition(s,action,payload,random,s.production.lastAt);
 if(action==='brew'){
  const q=n.production.queue,at=q.startedAt+q.units.length*q.durationMs;
  tickProduction(n,at);n=rawTransition(n,'claim-production',{kind:'alchemy'},random,at);
 }
 return n;
}
export function harvestReady(s,index=0){return rawTransition(s,'harvest',{index},()=>0,s.plots[index].firstReadyAt??s.plots[index].lastAt+s.plots[index].cycleMs);}
