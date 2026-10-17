import {chromium} from 'playwright';import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:5173');await page.waitForSelector('canvas');
 await page.evaluate(async()=>{window.game=(await import('/src/main.ts')).game;window.cfg=(await import('/src/settings.ts')).settings;window.groundYAt=(await import('/src/terrain.ts')).groundYAt});await page.waitForFunction(()=>game.scene.getScene('play')?.tanya?.body);
 const result=await page.evaluate(()=>{
  game.loop.stop();let now=performance.now();const tick=dt=>game.headlessStep(now+=dt,dt),rows=[];
  for(const fps of [15,30,60])for(let index=0;index<cfg.scooters.length;index++){
   game.scene.start('play');tick(1000/60);const s=game.scene.getScene('play'),r=cfg.scooters[index],actor=s.scooters[index],b=actor.sprite.body;
   // Isolated enemy lifecycle probe: player stays at the launch position.
   s.tanya.body.reset(r.launchAt,groundYAt(r.launchAt)-26);s.tanya.body.enable=false;
   let wall=false,stalls=0,penetration=0,retired=null,launched=false;
   for(let i=0;i<fps*5;i++){
    const before=b.center.x;tick(1000/fps);launched ||= actor.launched;
    if(actor.launched&&b.enable){wall ||= b.blocked.left||b.blocked.right;stalls+=Number(Math.abs(b.center.x-before)<.1);penetration=Math.max(penetration,Math.abs(b.bottom-groundYAt(b.center.x)));}
    if(actor.launched&&!b.enable){retired=b.center.x;break}
   }
   const span=cfg.groundSpans.find(g=>g.start<=r.left-34&&g.end>=r.right+34&&g.endY===undefined);
   rows.push({index,fps,spawn:r.x,left:r.left,right:r.right,flat:!!span,spawnInside:r.x>=r.left&&r.x<=r.right,wall,stalls,penetration,launched,retired,visible:actor.sprite.visible,disabled:!b.enable});
  }
  return rows;
 });
 writeFileSync('/tmp/tanya-v3-scooter-lanes.json',JSON.stringify(result,null,2));assert.deepEqual(errors,[]);
 for(const r of result){assert.ok(r.flat&&r.spawnInside&&r.launched);assert.ok(!r.wall&&r.stalls<=1&&r.penetration<1,'moving throughout flat lane');assert.ok(r.disabled&&!r.visible&&r.retired<=r.left,'retired before wall/pit');}
 console.log(JSON.stringify(result));
}finally{await browser.close()}
