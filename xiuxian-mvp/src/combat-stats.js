import {buffValue} from './pill-buffs.js';
const rate=(value,fallback=.05)=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):fallback;
export const criticalRate=s=>Math.min(1,rate(s.criticalRate)+buffValue(s,'critical'));
export const dodgeRate=s=>Math.min(1,rate(s.dodgeRate)+buffValue(s,'dodge'));
export const CRITICAL_MULTIPLIER=1.5;
export function rollCritical(amount,s,random=Math.random){const critical=random()<criticalRate(s);return {damage:Math.round(amount*(critical?CRITICAL_MULTIPLIER:1)),critical};}
export const rollDodge=(s,random=Math.random)=>random()<dodgeRate(s);
