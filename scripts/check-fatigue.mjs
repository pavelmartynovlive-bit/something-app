// Actual Phaser input/physics regression for fatigue and mid-flight transitions.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173');await page.waitForSelector('canvas');
 await page.evaluate(async()=>window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game);
 await page.waitForFunction(()=>game.scene.getScene('play')?.tanya?.body);
 const result=await page.evaluate(()=>{
  game.loop.stop();let time=performance.now();const tick=(n=1)=>{for(let i=0;i<n;i++)game.headlessStep(time+=1000/60,1000/60)};
  const key=down=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:' ',code:'Space',keyCode:32,bubbles:true}));
  const reset=()=>{key(false);game.scene.start('play');tick(4);const s=game.scene.getScene('play');for(const a of [...s.pigeons,...s.scooters,...s.grannies])a.sprite.destroy();s.pigeons=[];s.scooters=[];s.grannies=[];for(const b of [...s.physics.world.staticBodies.entries])b.gameObject.destroy();const floor=s.add.rectangle(2500,550,5000,220,0x788c7b);s.physics.add.existing(floor,true);s.physics.add.collider(s.tanya,floor);return s};
  const tap=()=>{key(true);tick();key(false)};
  const states=[];
  for(const energy of [100,20.1,20,10,0]) {
   const s=reset();s.changeEnergy(energy-s.energy);s.updateHud();s.update(s.time.now,0);
   states.push({energy,speed:s.tanya.body.velocity.x,color:document.querySelector('#energy-fill').style.background,warning:document.querySelector('#energy-warning').textContent,hidden:document.querySelector('#energy-warning').hidden});
  }
  const flights=[];
  for(const transition of ['zero','to-low','to-zero','recovery']) {
   const s=reset();if(['zero','recovery'].includes(transition))s.changeEnergy(-100);
   tap();tick(7);tap();
   const before=s.tanya.body.velocity.x;
   if(transition==='to-low')s.changeEnergy(19-s.energy);
   if(transition==='to-zero')s.changeEnergy(-100);
   if(transition==='recovery')s.changeEnergy(36);
   tick();let maxSpeed=0,landed=false;
   for(let i=0;i<420;i++) {if(s.tanya.body.blocked.down){landed=true;break}maxSpeed=Math.max(maxSpeed,s.tanya.body.velocity.x);tick();}
   const landingSpeed=s.tanya.body.velocity.x;tick(2);
   flights.push({transition,before,maxSpeed,landed,landingSpeed,groundSpeed:s.tanya.body.velocity.x,gravity:s.tanya.body.gravity.y,boosts:s.boostsUsed});
  }
  const s=reset();s.changeEnergy(-81);s.updateHud();s.changeEnergy(12);s.updateHud();const recovered={hidden:document.querySelector('#energy-warning').hidden,color:document.querySelector('#energy-fill').style.background};
  s.changeEnergy(-100);tap();tick(7);tap();s.checkpoint=240;s.respawn();const respawn={gravity:s.tanya.body.gravity.y,speed:s.tanya.body.velocity.x};
  game.scene.start('play');tick(4);const replay={hidden:document.querySelector('#energy-warning').hidden,speed:game.scene.getScene('play').tanya.body.velocity.x};
  return {states,flights,recovered,respawn,replay};
 });
 writeFileSync('/tmp/tanya-fatigue.json',JSON.stringify(result,null,2));
 assert.deepEqual(errors,[]);
 assert.deepEqual(result.states.map(s=>s.speed),[240,240,204,204,85]);
 assert.match(result.states[2].color,/217, 172, 50/);assert.match(result.states[2].warning,/Скоро Таня устанет/);assert.equal(result.states[2].hidden,false);
 for(const f of result.flights){assert.ok(f.landed,f.transition+' lands');assert.equal(f.boosts,1);assert.equal(f.gravity,0);assert.ok(f.maxSpeed<=(f.transition==='to-low'?297.5:85),f.transition+' no speed bypass');}
 assert.ok(result.recovered.hidden);assert.equal(result.respawn.gravity,0);assert.equal(result.respawn.speed,85);assert.ok(result.replay.hidden);assert.equal(result.replay.speed,240);
 console.log('PASS: energy boundaries, yellow warning, zero-energy boost, mid-flight fatigue/recovery, respawn and replay');
} finally {await browser.close()}
