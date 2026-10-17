import {chromium} from 'playwright';import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5173');await page.waitForSelector('canvas');await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;window.cfg=(await import('/src/settings.ts')).settings;window.terrain=await import('/src/terrain.ts');window.haz=await import('/src/hazard-shapes.ts')});await page.waitForFunction(()=>game.scene.getScene('play')?.tanya?.body);
const result=await page.evaluate(()=>{
 game.loop.stop();let now=performance.now();const tick=(delta=1000/60)=>game.headlessStep(now+=delta,delta);
 const restart=()=>{const old=game.scene.getScene('play');old.update=Object.getPrototypeOf(old).update;game.scene.start('play');for(let i=0;i<4;i++)tick();return game.scene.getScene('play')};
 const quiet=s=>{for(const a of [...s.grannies,...s.pigeons,...s.scooters])a.sprite.destroy();s.grannies=[];s.pigeons=[];s.scooters=[]};
 const anchors=[];
 for(const x of cfg.recoveryAnchors)for(const tired of [false,true]){
  const s=restart();if(tired)s.changeEnergy(-100);s.checkpoint=x;s.foodCount=23;
  const energy=s.energy;s.beginFall();let frames=0;while(!s.recoveries&&frames++<50)tick();
  const b=s.tanya.body,c=s.cameras.main,expected=Math.max(0,Math.min(cfg.levelWidth-c.width/c.zoom,x-c.width/c.zoom*s.framing.anchorX));
  const danger=[...s.grannies.map(g=>[g.sprite,'granny']),...s.scooters.map(g=>[g.sprite,'scooter']),...s.pigeons.map(g=>[g.sprite,'pigeons'])].some(([sprite,kind])=>haz.touchesDanger(b,sprite,kind));
  const cameraErrorAtRestore=Math.abs(c.scrollX-expected),vyAtRestore=b.velocity.y,foodAtRestore=s.foodCount,footErrorAtRestore=Math.abs(b.bottom-terrain.groundYAt(x));
  const before=s.tanya.x;for(let i=0;i<10;i++)tick();
  anchors.push({x,tired,frames,food:foodAtRestore,energyPreserved:Math.abs(Math.max(0,energy-10*cfg.energyDrainPerSecond/60)-s.energy)<.01,vyAtRestore,footErrorAtRestore,cameraErrorAtRestore,bodyEnabled:b.enable,cameraError:Math.abs(c.scrollX-expected),initialCameraError:Math.abs(expected-(x-c.width/c.zoom*s.framing.anchorX)),danger,progress:s.tanya.x-before,pit:cfg.interruptions.some(p=>x>=p.start&&x<p.start+p.width),surface:terrain.groundYAt(x)});
 }
 const ground=[];
 // High downward velocity and multiple fixed steps per render reproduce the old
 // once-per-render ramp failure. The restored top must match the drawn surface.
 for(const fps of [15,20,30,60,120])for(const span of cfg.groundSpans.filter(g=>g.endY!==undefined))for(const tired of [false,true]){
  const s=restart();quiet(s);const x=span.start+Math.min(80,(span.end-span.start)/4),floor=terrain.groundYAt(x);s.tanya.body.reset(x,floor-27-55);s.tanya.setVelocity(tired?170:240,900);s.tanya.body.maxVelocity.y=900;if(tired)s.changeEnergy(-100);
  let penetration=0,landed=false;for(let i=0;i<Math.ceil(fps*.9);i++){tick(1000/fps);const b=s.tanya.body;const y=terrain.groundYAt(b.center.x);penetration=Math.max(penetration,b.bottom-y);landed ||= b.blocked.down;}
  ground.push({fps,start:span.start,tired,penetration,landed,falls:s.falls});
 }
 const oldContact=[];
 for(const fps of [15,20,30]){
  const s=restart();quiet(s);s.physics.world.off('worldstep',s.resolveTerrainContacts,s);
  const update=s.update;s.update=function(t,delta){const b=this.tanya.body,r=cfg.groundSpans.find(g=>g.endY!==undefined&&b.center.x>=g.start&&b.center.x<g.end);if(r&&b.velocity.y>=0){const y=terrain.groundYAt(b.center.x),prev=terrain.groundYAt(b.prev.x+b.halfWidth),pb=b.prev.y+b.height;if(pb<=prev+4&&(b.bottom>=y||Math.abs(pb-prev)<4)){b.y=y-b.height;b.velocity.y=0;b.blocked.down=true}}update.call(this,t,delta)};
  s.tanya.body.reset(1980,terrain.groundYAt(1980)-27-55);s.tanya.setVelocity(240,900);s.tanya.body.maxVelocity.y=900;let penetration=0;
  for(let i=0;i<fps*.6;i++){tick(1000/fps);penetration=Math.max(penetration,s.tanya.body.bottom-terrain.groundYAt(s.tanya.body.center.x))}
  oldContact.push({fps,penetration});
 }
 const drops=[];
 // Sweep all solid span joins with a fall from above; pits intentionally recover.
 for(const fps of [20,60])for(const span of cfg.groundSpans){if(cfg.interruptions.some(p=>p.start===span.start))continue;const s=restart();quiet(s);const x=span.start+30;s.tanya.body.reset(x,terrain.groundYAt(x)-27-100);s.tanya.setVelocity(240,900);s.tanya.body.maxVelocity.y=900;let penetration=0;
  for(let i=0;i<fps*.3;i++){tick(1000/fps);const b=s.tanya.body;if(!cfg.interruptions.some(p=>b.center.x>=p.start&&b.center.x<p.start+p.width))penetration=Math.max(penetration,b.bottom-terrain.groundYAt(b.center.x))}
  drops.push({fps,x,penetration,falls:s.falls});
 }
 const pocket=[];
 for(const route of ['fast','rest','skip']){
  const s=restart();quiet(s);s.tanya.body.reset(6800,545-27);s.changeEnergy(-65);let jumped=false;
  for(let i=0;i<420&&s.tanya.x<7500;i++){
   const x=s.tanya.x,launch=route==='fast'?6910:7100;
   if(route!=='rest'&&!jumped&&x>=launch){window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',keyCode:32,bubbles:true}));jumped=true}
   tick();window.dispatchEvent(new KeyboardEvent('keyup',{key:' ',code:'Space',keyCode:32,bubbles:true}));
  }
  pocket.push({route,lipton:s.liptonUses,bench:s.benchUses,choice:s.recoveryChoice,x:s.tanya.x});
 }
 return {anchors,ground,oldContact,drops,pocket};
});
writeFileSync('/tmp/tanya-v3-recovery.json',JSON.stringify(result,null,2));
assert.deepEqual(errors,[]);assert.ok(result.anchors.every(a=>!a.pit&&!a.danger&&a.bodyEnabled&&a.progress>20&&a.food===23&&a.energyPreserved&&a.cameraErrorAtRestore<.01&&a.footErrorAtRestore<.01&&a.vyAtRestore===0),'every anchor safe and resumes');
assert.ok(result.ground.every(g=>g.penetration<1&&g.landed&&g.falls===0),'ground at 15–120fps');assert.ok(result.drops.every(g=>g.penetration<1),'solid surface landing sweep');
assert.ok(result.oldContact.some(g=>g.penetration>20),'old ramp bug reproduction');assert.ok(result.pocket.every(p=>p.x>7400),'pocket flow');assert.deepEqual(result.pocket.map(p=>[p.lipton,p.bench]),[[1,0],[0,1],[0,0]],'exclusive recovery trajectories');
console.log(JSON.stringify({oldContact:result.oldContact,anchors:result.anchors.length,ground:result.ground.length,drops:result.drops.length,pocket:result.pocket}));
}finally{await browser.close()}
