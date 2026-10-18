// Post-run checks + screenshots from an actual input replay (no teleports).
// Run audit-v3.mjs first. The natural policy uses only visible features.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const runs=JSON.parse(readFileSync('/tmp/tanya-v3-runs.json','utf8'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173');await page.waitForSelector('canvas');
 await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;window.cfg=(await import('/src/settings.ts')).settings;window.groups=(await import('/src/food-layout.ts')).foodClusters});
 await page.waitForFunction(()=>game.scene.getScene('play')?.tanya?.body);
 const layout=await page.evaluate(()=>({food:cfg.food,platforms:cfg.routePlatforms,groups,minimum:cfg.requiredFood,bonus:cfg.bonusFood,bench:cfg.benches[0]}));
 const natural=runs.find(r=>r.mode==='natural'),safe=runs.find(r=>r.mode==='safe'),collector=runs.find(r=>r.mode==='collector'),low=runs.find(r=>r.mode==='low-energy');
 const pointKey=p=>`${p.x}:${p.y}`;const union=new Set([natural,safe,collector,low].flatMap(r=>r.collectedFood.map(pointKey)));
 const neverCollected=layout.food.filter(p=>!union.has(pointKey(p)));
 for(const r of [natural,safe,collector,low]){assert.ok(r.finished);assert.equal(r.falls,0);assert.equal(r.collisions,0);assert.ok(r.food>=layout.minimum+8,r.mode+' feeding margin');assert.equal(r.food,r.collectedFood.length);}
 assert.equal(new Set(layout.food.map(pointKey)).size,layout.food.length,'no duplicate food');
 assert.ok(natural.food/layout.food.length>=.75&&natural.food/layout.food.length<=.88,'approximately 80% on the natural route');
 assert.ok(collector.food>=layout.bonus&&collector.food>=natural.food+8,'reward for optional execution');
 assert.equal(low.bench,1,'low-energy recovery choice');assert.equal(natural.bench,1,'natural grounded breadcrumb reaches the bench');
 assert.deepEqual(neverCollected,[],'every packet reached in a coherent tested route');
 for(const p of layout.platforms){assert.ok(p.role);assert.ok(collector.landings.some(l=>l.x>=p.x-12&&l.x<=p.x+p.width+12&&Math.abs(l.y-p.y)<1),'each remaining platform has a used landing');}
 const visible=(p,v)=>p.x-18>=v.left&&p.x+18<=v.right&&p.y-20>=v.top&&p.y+20<=v.bottom;
 const entry=collector.inputs.find(i=>!i.boost&&i.x>2600&&i.x<2800);
 assert.ok(entry?.view,'actual pre-takeoff camera');
 const branches={lower:layout.groups.find(g=>g.purpose.startsWith('4 lower: route split')).points.filter(p=>visible(p,entry.view)),upper:layout.groups.find(g=>g.purpose.startsWith('4 upper: route split')).points.filter(p=>visible(p,entry.view))};
 assert.ok(branches.lower.length>=2&&branches.upper.length>=2,'both food branches visible before takeoff');
 const first=layout.platforms[0],platformVisibleWidth=Math.max(0,Math.min(first.x+first.width,entry.view.right)-Math.max(first.x,entry.view.left));
 assert.ok(platformVisibleWidth>=60,'first landing surface readable before boost entry');
 const approach=natural.trajectory.find(p=>p.x>=7000);
 const view={left:approach.cameraX,right:approach.cameraX+340,top:approach.cameraY,bottom:approach.cameraY+844/(390/340)};
 assert.ok(layout.bench-45>=view.left&&layout.bench+45<=view.right,'full bench visible on common grounded approach');
 for(const prefix of ['8 rest:','8 fast:'])assert.ok(layout.groups.find(g=>g.purpose.startsWith(prefix)).points.filter(p=>visible(p,view)).length>=2,'both bench options visible before commitment');
 const perch=layout.platforms.find(p=>p.x===8130),perchInput=collector.inputs.find(i=>!i.boost&&i.x>8000&&i.x<8100);
 assert.ok(perchInput&&perch.x>=perchInput.view.left&&perch.x+perch.width<=perchInput.view.right,'Lipton landing perch visible before its jump');
 const summary={perchInput,minimum:layout.minimum,bonus:layout.bonus,placed:layout.food.length,naturalRatio:natural.food/layout.food.length,neverCollected,platformVisibleWidth,entry:{x:entry.x,view:entry.view,branches},benchReveal:{x:approach.x,view},runs:[natural,safe,collector,low].map(r=>({mode:r.mode,time:r.time,food:r.food,energy:r.energy,collisions:r.collisions,bench:r.bench,lipton:r.lipton,boosts:r.boosts,falls:r.falls})),platforms:layout.platforms};
 mkdirSync('docs/collectible-trust',{recursive:true});
 // Replay the tested collector inputs through ordinary Phaser physics, rendering
 // at inspection points. Never reposition Tanya, geometry or the camera.
 await page.evaluate(inputs=>{
  game.loop.stop();window.trustNow=performance.now();window.trustTick=()=>game.headlessStep(trustNow+=1000/60,1000/60);
  window.trustKey=d=>window.dispatchEvent(new KeyboardEvent(d?'keydown':'keyup',{key:' ',code:'Space',keyCode:32,bubbles:true}));
  game.scene.start('play');for(let i=0;i<4;i++)trustTick();window.trustStart=game.scene.getScene('play').time.now;window.trustInputs=inputs;window.trustIndex=0;
  document.querySelector('#hint').hidden=true;
 },collector.inputs);
 for(const [name,x] of [['platform-choice',2600],['first-landing',2960],['high-reward',3270],['return-to-ground',3550],['bench-reveal',7010],['bench-choice',7140],['lipton-perch',8040]]){
  await page.evaluate(target=>{
   const s=game.scene.getScene('play');let frames=0;
   while(s.tanya.x<target&&frames++<6000){
    const t=(s.time.now-trustStart)/1000,request=trustInputs[trustIndex];
    if(request&&t>=request.time-1e-6){trustKey(true);trustIndex++;}
    trustTick();trustKey(false);
   }
   if(frames>=6000)throw new Error('Replay did not reach '+target);
   s.physics.pause();window.trustSceneUpdate=s.sys.sceneUpdate;s.sys.sceneUpdate=()=>{};document.querySelector('#toast').classList.remove('visible');game.step(trustNow,0);
  },x);
  await page.screenshot({path:`docs/collectible-trust/${name}.png`});
  await page.evaluate(()=>{const s=game.scene.getScene('play');s.sys.sceneUpdate=trustSceneUpdate;s.physics.resume()});
 }
 const perchContact=await page.evaluate(()=>{
  const rows=[];
  for(const bottleY of [270,278]){
   trustKey(false);game.scene.start('play');for(let i=0;i<4;i++)trustTick();
   const s=game.scene.getScene('play'),p=cfg.routePlatforms.find(p=>p.x===8130),body=s.tanya.body;
   const bottle=s.physics.world.staticBodies.entries.find(b=>b.gameObject.texture?.key==='lipton'&&b.gameObject.x===8190).gameObject;
   bottle.setY(bottleY).refreshBody();s.changeEnergy(50-s.energy);
   body.reset(p.x+25,p.y-26);body.position.set(p.x+25-body.halfWidth,p.y-body.height);
   body.prev.copy(body.position);body.prevFrame.copy(body.position);body.updateCenter();body.setVelocity(0,0);body.blocked.down=true;
   for(let i=0;i<15;i++)trustTick();rows.push({bottleY,lipton:s.liptonUses,boosts:s.boostsUsed});
  }
  return rows;
 });
 assert.deepEqual(perchContact,[{bottleY:270,lipton:0,boosts:0},{bottleY:278,lipton:1,boosts:0}],'standing perch pickup: negative control and fixed placement');
 summary.perchContact=perchContact;
 assert.deepEqual(errors,[]);writeFileSync('docs/collectible-trust/validation.json',JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify(summary,null,2));
} finally {await browser.close()}
