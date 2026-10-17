import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.LEVEL_URL||'http://localhost:5173');await page.waitForSelector('canvas');
 await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;window.cfg=(await import('/src/settings.ts')).settings;window.sections=(await import('/src/settings.ts')).levelSections;window.terrain=await import('/src/terrain.ts');window.foodGroups=(await import('/src/food-layout.ts')).foodClusters;});
 await page.waitForFunction(()=>game.scene.getScene('play')?.tanya?.body);
 const result=await page.evaluate(()=>{
  game.loop.stop();let now=performance.now();const tick=()=>game.headlessStep(now+=1000/60,1000/60);const key=d=>window.dispatchEvent(new KeyboardEvent(d?'keydown':'keyup',{key:' ',code:'Space',keyCode:32,bubbles:true}));
  const runs=[];
  for(const mode of ['normal','collector','low-energy','intentional-collision','pit-fall','platform-miss','bench']){
   key(false);game.scene.start('play');for(let i=0;i<4;i++)tick();const s=game.scene.getScene('play'),start=s.time.now; s.hit=Object.getPrototypeOf(s).hit; s.respawn=Object.getPrototypeOf(s).respawn;
   if(mode==='low-energy')s.changeEnergy(-100);
   let lastRecovery=0;const missed=new Set();let hits=0,resets=0,bench=0,prevRest=0,lastInput=0,longest=0,lastProgress=0,stuck=0,boostDue=null;const reveals=[],viewport=[],hitsAt=[],inputs=[],trajectory=[],landings=[],used=new Set(),seen=new Set(),stats=sections.map(z=>({name:z.name,seconds:0,food:0,collisions:0,boosts:0}));
   const origHit=s.hit;s.hit=function(d){const ok=origHit.call(this,d);if(ok){hits++;hitsAt.push({x:this.tanya.x,time:(this.time.now-start)/1000,damage:d});stats[Math.max(0,sections.findLastIndex(z=>this.tanya.x>=z.start))].collisions++}return ok};const origReset=s.respawn;s.respawn=function(){resets++;origReset.call(this)};
   for(let frame=0;frame<60*160&&!s.finished;frame++){
    if(s.recoveries!==lastRecovery){lastRecovery=s.recoveries;used.clear();boostDue=null;}
    const b=s.tanya.body,x=s.tanya.x,tired=s.exhausted,t=(s.time.now-start)/1000,grounded=b.blocked.down&&b.velocity.y>=0;
    const si=Math.max(0,sections.findLastIndex(z=>x>=z.start));stats[si].seconds+=1/60;stats[si].food=s.foodCount;stats[si].boosts=s.boostsUsed;
    let jump=false,boost=false;
    const targets=[
      {id:'gap1',x:tired?330:395,boost:tired}, {id:'rise1',x:tired?945:910},
      {id:'ledge',x:tired?1355:1320,boost:true},
      {id:'platform1',x:tired?2660:2620,optional:true,boost:true},
      {id:'platform2',x:tired?2990:2945,optional:true},
      {id:'platform3',x:tired?3130:3100,optional:true},
      {id:'upper-exit',x:3265,optional:true},
      {id:'longgap',x:tired?4255:4230,boost:true},
      {id:'road',x:tired?4795:4730},
      {id:'cascade',x:tired?5880:6005,boost:tired},
      {id:'skipbench',x:tired?7170:7100,optional:true},
      {id:'step1',x:tired?7505:7460}, {id:'step2',x:tired?7825:7810,boost:mode==='collector'||tired},
      {id:'step3',x:tired?8355:8320,boost:true},
      {id:'finalgap',x:tired?9450:9530,boost:tired},
      {id:'granny',x:tired?10180:10140},
    ];
    if(grounded&&!s.restRemaining&&!s.recoveryRemaining){
     for(const z of targets){if(used.has(z.id)||x<z.x)continue;
      if(mode==='pit-fall'&&['gap1','longgap','cascade','finalgap'].includes(z.id)&&!missed.has(z.id)){used.add(z.id);missed.add(z.id);continue}
      if(z.optional&&((z.id==='skipbench'&&['bench','low-energy'].includes(mode))||
        (mode==='platform-miss'&&((z.id.startsWith('platform')&&z.id!=='platform1')||z.id==='upper-exit')))){used.add(z.id);continue}
      if(x-z.x>200){used.add(z.id);continue}
      jump=true;used.add(z.id);if(z.boost)boostDue=s.time.now+150;break;
     }
     if(b.blocked.right&&!jump){jump=true;boostDue=s.time.now+150;}
     // Pigeons are timed from their visible, moving location, not a hidden timer.
     if(mode!=='intentional-collision') {
       const grannyNear=s.grannies.some(g=>Math.abs(g.sprite.body.bottom-b.bottom)<5&&g.sprite.x-x>0&&g.sprite.x-x<(tired?65:90));
       jump ||= grannyNear; if(tired&&grannyNear&&boostDue===null)boostDue=s.time.now+150;
       jump ||= s.scooters.some(g=>g.sprite.body.enable&&g.launched&&Math.abs(g.sprite.body.bottom-b.bottom)<5&&g.sprite.x-x>0&&g.sprite.x-x<85);
     }
     if(s.pigeons.some(p=>Math.abs(p.perchY-b.bottom)<5&&p.sprite.x-x>0&&p.sprite.x-x<(tired?70:85)&&p.sprite.y>p.perchY-100)&&!((mode==='intentional-collision'&&x<3340)||(mode==='pit-fall'&&x>8800&&s.falls<4)))jump=true;
    }
    if(!s.recoveryRemaining&&boostDue!==null&&s.time.now>=boostDue&&!grounded){jump=true;boost=true;boostDue=null;}
    if(jump){key(true);inputs.push({x,time:t,boost});longest=Math.max(longest,t-lastInput);lastInput=t;}
    const beforeX=x,wasGround=grounded;tick();key(false);
    if(frame%6===0){
      const c=s.cameras.main,left=c.scrollX,right=left+c.width/c.zoom,top=c.scrollY,bottom=top+c.height/c.zoom;
      const visible=(x,y)=>x>=left&&x<=right&&y>=top&&y<=bottom;
      const features=[]; const add=(id,x,y,decision=true)=>{if(visible(x,y)){features.push({id,x});if(decision&&!seen.has(id)){seen.add(id);reveals.push({time:t,x:s.tanya.x,id,targetX:x})}}};
      for(const tr of terrain.terrainTransitions)if(Math.abs(tr.rise)>=15)add('edge:'+tr.x,tr.x,tr.toY);
      for(const r of cfg.groundSpans.filter(z=>z.endY!==undefined)){add('ramp-start:'+r.start,r.start,r.y);add('ramp-end:'+r.end,r.end,r.endY);}
      for(const p of cfg.routePlatforms){add('platform:'+p.x,p.x,p.y);add('platform-end:'+p.x,p.x+p.width,p.y);}
      for(const [i,p] of s.pigeons.entries())if(p.sprite.active)add('birds:'+i,p.sprite.x,p.sprite.y);
      for(const [i,p] of s.scooters.entries())if(p.sprite.body.enable)add('scooter:'+i,p.sprite.x+34,p.sprite.y);
      for(const [i,p] of s.grannies.entries())if(p.sprite.active)add('granny:'+i,p.sprite.x,p.sprite.y);
      for(const x of cfg.benches)add('bench:'+x,x,terrain.groundYAt(x));
      const objects=s.physics.world.staticBodies.entries.filter(z=>z.enable&&['food','lipton'].includes(z.gameObject.texture?.key));
      for(const o of objects)add(o.gameObject.texture.key+':'+o.gameObject.x,o.gameObject.x,o.gameObject.y,o.gameObject.texture.key==='lipton');
      // Reading a NEW authored boost/route-choice trajectory can be a decision.
      // Only its first visible remaining packet triggers one event for the group;
      // auto-collecting food or revealing every packet never adds decision events.
      for(const [i,group] of foodGroups.entries())if(/boost notation|optional boost reward|long boost parabola|split points|optional boosted middle|final tall rise/.test(group.purpose)){
        const cue=group.points.find(p=>visible(p.x,p.y)&&objects.some(o=>o.gameObject.texture.key==='food'&&o.gameObject.x===p.x&&o.gameObject.y===p.y));
        if(cue&&!seen.has('trajectory-cue:'+i)){seen.add('trajectory-cue:'+i);reveals.push({time:t,x:s.tanya.x,id:'trajectory-cue:'+i,targetX:cue.x});}
      }
      add('cat',cfg.levelWidth-150,terrain.groundYAt(cfg.levelWidth-150));
      // Terrain currently underfoot is a movement situation only on an incline,
      // or while airborne; flat ground by itself is never an extra event.
      const active=cfg.groundSpans.find(z=>s.tanya.x>=z.start&&s.tanya.x<z.end);
      const movingTerrain=active?.endY!==undefined||!b.blocked.down;
      const visibleRamp=cfg.groundSpans.some(z=>z.endY!==undefined&&z.end>left&&z.start<right);
      const empty=features.filter(z=>!z.id.startsWith('sign:')).length===0&&!visibleRamp;
      const foodFeatures=features.filter(z=>z.id.startsWith('food:'));
      const meaningful=features.filter(z=>!z.id.startsWith('food:'));
      viewport.push({time:t,x:s.tanya.x,empty,features:meaningful.map(z=>z.id),foodVisible:foodFeatures.length,
        now:movingTerrain||features.some(z=>z.x>=s.tanya.x-24&&z.x<s.tanya.x+90),
        next:features.some(z=>z.x>=s.tanya.x+90&&z.x<s.tanya.x+190),
        after:features.some(z=>z.x>=s.tanya.x+190),
      });
    }
    if(s.restRemaining>0&&prevRest===0)bench++;prevRest=s.restRemaining;
    if(s.tanya.x-beforeX<.1&&!s.restRemaining&&!s.recoveryRemaining)stuck++;else stuck=0;
    if(stuck>90){trajectory.push({stuckAt:s.tanya.x,bottom:b.bottom});break}
    if(b.blocked.down&&!wasGround)landings.push({x:s.tanya.x,y:b.bottom,time:t});
    if(frame%6===0)trajectory.push({x:s.tanya.x,y:b.bottom,time:t,ground:b.blocked.down,food:s.foodCount,energy:s.energy,cameraX:s.cameras.main.scrollX,cameraY:s.cameras.main.scrollY,velocity:b.velocity.x,
      hazards:{pigeons:s.pigeons.map(a=>({x:a.sprite.x,y:a.sprite.y})),scooters:s.scooters.map(a=>({x:a.sprite.x,y:a.sprite.y})),grannies:s.grannies.map(a=>({x:a.sprite.x,y:a.sprite.y}))},
      remaining:s.physics.world.staticBodies.entries.filter(o=>o.enable&&['food','lipton'].includes(o.gameObject.texture?.key)).map(o=>({kind:o.gameObject.texture.key,x:o.gameObject.x,y:o.gameObject.y})),
    });
   }
   const time=(s.time.now-start)/1000;longest=Math.max(longest,time-lastInput);
   const events=[0,...inputs.map(i=>i.time),...reveals.map(i=>i.time),time].sort((a,b)=>a-b);
   let decisionGap=0,decisionInterval=null;for(let i=1;i<events.length;i++)if(events[i]-events[i-1]>decisionGap){decisionGap=events[i]-events[i-1];decisionInterval=[events[i-1],events[i]];}
   let emptyRun=0,longestEmpty=0;for(const v of viewport){emptyRun=v.empty?emptyRun+.1:0;longestEmpty=Math.max(longestEmpty,emptyRun)}
   runs.push({mode,finished:s.finished,time,food:s.foodCount,energy:s.energy,collisions:hits,hitsAt,bench,lipton:s.liptonUses,falls:s.falls,recoveries:s.recoveries,boosts:s.boostsUsed,resets,longestRawInputGap:longest,longestInputDecisionGap:decisionGap,decisionInterval,longestEmpty,threeLayersRatio:viewport.filter(v=>v.now&&v.next&&v.after).length/viewport.length,reveals,viewport,inputs,landings,trajectory,stats});
  }
  return runs;
 });
 writeFileSync('/tmp/tanya-v3-runs.json',JSON.stringify(result,null,2));
 assert.deepEqual(errors,[]);assert.ok(result.every(r=>r.finished),'all full runs finish');
 if(!process.env.PROBE_ONLY){
  for(const r of result.filter(r=>['normal','collector','low-energy','bench'].includes(r.mode))){assert.equal(r.collisions,0,r.mode+' clean collisions');assert.equal(r.falls,0,r.mode+' clean falls');}
  assert.ok(result[0].food>=80&&result[1].food>=103,'food budgets');
  const pit=result.find(r=>r.mode==='pit-fall');assert.equal(pit.falls,4,'miss every pit');assert.equal(pit.recoveries,4,'recover every pit');
  for(const r of result){assert.equal(r.longestEmpty,0,r.mode+' empty viewport');assert.equal(r.falls,r.recoveries,'no unresolved recovery');}
  const miss=result.find(r=>r.mode==='platform-miss');assert.equal(miss.falls,0,'platform miss falls safely to ground');
  assert.ok(result.find(r=>r.mode==='intentional-collision').collisions>=8);
  const normal=result.find(r=>r.mode==='normal'),low=result.find(r=>r.mode==='low-energy'),rest=result.find(r=>r.mode==='bench');
  assert.ok(normal.energy>0&&normal.energy<25,'limited clean-run energy');
  assert.ok(rest.energy>normal.energy+25&&rest.time>normal.time+2,'bench is stronger and costs time');
  assert.equal(normal.lipton,3,'distributed fast-route bottles');assert.equal(rest.lipton,3,'late bottle still works after resting');
  for(const route of [normal,low])for(const [x,width,y] of [[2860,120,317],[3040,80,261],[3190,100,205]])assert.ok(route.landings.some(p=>p.x>=x-12&&p.x<=x+width+12&&Math.abs(p.y-y)<1),'short chain reachable at both energies');
 }

 console.log(JSON.stringify({errors,runs:result.map(({trajectory,inputs,landings,stats,reveals,viewport,...r})=>({...r,last:trajectory.at(-1)}))},null,2));
}finally{await browser.close()}
