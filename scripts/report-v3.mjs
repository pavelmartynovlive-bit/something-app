// Derive a compact reviewable report from real full-run/contact traces.
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const load=name=>JSON.parse(readFileSync('/tmp/tanya-v3-'+name+'.json','utf8'));
const runs=load('runs'),contacts=load('collisions'),recovery=load('recovery'),jumps=load('jump-metrics');
const clean=runs[0];
function reaction(kind,index,from,to){
 const jump=clean.inputs.find(i=>i.x>from&&i.x<to);
 let visibility=null;
 for(let i=1;i<clean.trajectory.length;i++){
  const a=clean.trajectory[i-1],b=clean.trajectory[i];if(b.x<from-400)continue;
  const clearance=q=>q.cameraX+340-q.hazards[kind][index].x-34;
  if(clearance(a)<0&&clearance(b)>=0){visibility=a.time+(b.time-a.time)*(-clearance(a))/(clearance(b)-clearance(a));break}
 }
 return {kind,index,visibleToTap:jump.time-visibility,tapX:jump.x};
}
const hazards=[reaction('grannies',0,1600,1810),reaction('grannies',1,6120,6300),reaction('grannies',2,10000,10230),reaction('scooters',0,5300,5500),reaction('scooters',1,9100,9400)];
assert.ok(hazards.every(h=>h.visibleToTap>=.49),'portrait full-body visibility before avoidance tap');
const out={runs:runs.map(({trajectory,inputs,landings,stats,reveals,viewport,...r})=>r),hazards,normalSections:clean.stats,jumps,contactProbeCounts:{terrainTransitions:contacts.transitions.length,smallGaps:contacts.shortGaps.length,longGap:contacts.longGap.length,automaticRecovery:contacts.escapes.length,anchors:recovery.anchors.length,rampsByFrameRate:recovery.ground.length,solidDrops:recovery.drops.length},minFootMargin:{smallNormal:Math.min(...contacts.shortGaps.filter(a=>!a.tired).map(a=>a.footMargin)),smallTired:Math.min(...contacts.shortGaps.filter(a=>a.tired).map(a=>a.footMargin)),boostNormal:Math.min(...contacts.longGap.filter(a=>!a.tired&&a.delay).map(a=>a.footMargin)),boostTired:Math.min(...contacts.longGap.filter(a=>a.tired&&a.delay).map(a=>a.footMargin))}};
writeFileSync('docs/level-v3-validation.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(hazards));
