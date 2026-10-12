export const cultivationRequired=s=>80+(s.realm*10+s.level-1)*20;
export const cultivationProgress=s=>Math.min(1,Math.max(0,s.cultivation)/cultivationRequired(s));
