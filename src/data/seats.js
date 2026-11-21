// Legacy seat coordinates in room.webp pixels. Replaced by per-chair seats in Phase 5.
export const TABLES=[{c:[426,560],base:626},{c:[630,525],base:588},{c:[906,508],base:566}];
export const CHAIRS=[[363,553],[477,547],[373,607],[480,600],[580,520],[687,513],[583,560],[680,563],[849,501],[960,511],[860,545],[956,545]];
function chairs(t,list){const[cx0,cy0]=TABLES[t].c;return list.map(([x,y,dir])=>{const back=y<cy0+10;return{n:['the window table','the middle table','the corner table'][t],c:[x,y],f:back?[x+(dir==='se'?6:-6),y+50]:[x,y-2],front:!back,dir,a:back?[x+(x<cx0?-36:36),y+8]:[x+(x<cx0?-6:6),y+44],mug:[cx0+(x-cx0)*.4,cy0-6+(back?-4:6)]}})}
export const SEATS=[
 {n:'the reading armchair',c:[214,440],f:[224,477],dir:'se',a:[262,500],mug:[300,458]},
 {n:'the window armchair',c:[390,420],f:[386,459],dir:'sw',a:[352,486],mug:[328,455]},
 ...chairs(0,[[363,553,'se'],[477,547,'sw'],[373,607,'ne'],[480,600,'nw']]),
 ...chairs(1,[[580,520,'se'],[687,513,'sw'],[583,560,'ne'],[680,563,'nw']]),
 ...chairs(2,[[849,501,'se'],[960,511,'sw'],[860,545,'ne'],[956,545,'nw']])];
export const COUNTER={a:[650,470],hit:[590,300,800,460]};
export const DOOR=[690,712];
