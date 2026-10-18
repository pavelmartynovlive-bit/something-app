import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 for(const [width,height] of [[320,568],[390,844],[430,932]]) {
  const page=await browser.newPage({viewport:{width,height},hasTouch:true});
  await page.goto('http://localhost:5173');await page.waitForSelector('canvas');
  await page.evaluate(async()=>{window.game=(await import('/src/main.ts')).game;window.cfg=(await import('/src/settings.ts')).settings;});
  await page.waitForFunction(()=>game.scene.getScene('play').tanyaVisual?.sprite);
  const result=await page.evaluate(()=>{
   game.loop.stop();let now=performance.now();const tick=()=>game.headlessStep(now+=1000/60,1000/60);
   const s=game.scene.getScene('play'),c=s.cameras.main,v=s.tanyaVisual,b=s.tanya.body;
   const metadata=[s.cache.json.get('tanya:animation-data'),s.cache.json.get('tanya:context-data')];
   const left=()=>{const f=metadata.flatMap(d=>d.frames).find(f=>f.name===v.sprite.frame.name);return b.center.x-f.rootX*f.normalize*v.sprite.scaleX-c.scrollX};
      // Real pigeon danger overlap, not a direct call to the animation API.
   const bird=s.pigeons[0];bird.sprite.body.reset(s.tanya.x,s.tanya.y);bird.flying=true;bird.lowFlightRemaining=1;bird.sprite.body.setAllowGravity(false);bird.sprite.body.setVelocity(0,0);
   bird.sprite.body.position.set(b.x+bird.sprite.body.offset.x-10,b.y+bird.sprite.body.offset.y);bird.sprite.body.updateCenter();
   const old=s.energy;tick();const reaction={state:v.state,loss:old-s.energy,blocked:s.hit(10,'scooter'),alpha:v.sprite.alpha};
   bird.sprite.body.enable=false;
   const samples=[];
   for(const mode of ['normal','scooter','zero']){
    // Confirm the camera remains safe even with the OLD, initially cropped framing.
    s.checkpoint=150;s.respawn();s.hitUntil=0;
    if(mode==='zero')s.changeEnergy(-100);else {s.changeEnergy(100);if(mode==='scooter'){s.hit(12,'scooter');s.slowUntil=s.time.now+650;}}
    c.scrollX=b.center.x-c.width/c.zoom*.05;
    for(let i=0;i<30;i++){tick();samples.push({mode,left:left(),state:v.state,body:[b.width,b.height]});}
   }
   s.checkpoint=240;s.respawn();const respawnLeft=left();
   return {reaction,samples,respawnLeft,inset:v.cameraLeftInset};
  });
  assert.equal(result.reaction.state,'hit-granny');assert.ok(Math.abs(result.reaction.loss-6)<.2);assert.equal(result.reaction.blocked,false);assert.equal(result.reaction.alpha,1);
  for(const r of result.samples){assert.ok(r.left>=7,`${width} ${r.mode} clipped: ${r.left}`);assert.deepEqual(r.body,[24,50]);}
  assert.ok(result.respawnLeft>=7);console.log(`PASS ${width}x${height}: real pigeon reaction/cooldown, normal/slow/tired opaque art inside viewport, safe respawn (${result.inset.toFixed(1)}px inset)`);
  await page.close();
 }
} finally {await browser.close();}
