import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.LEVEL_URL||'http://localhost:5173');await page.waitForSelector('canvas');
 await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;});
 await page.waitForFunction(()=>game.scene.getScene('play')?.tanya?.body);
 const result=await page.evaluate(()=>{
  game.loop.stop();let now=performance.now();const tick=()=>game.headlessStep(now+=1000/60,1000/60);
  const key=down=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:' ',code:'Space',keyCode:32,bubbles:true}));
  const rows=[];
  for(const tired of [false,true])for(const delay of [null,20,50,100,150,200,250,270,300,450]){
   key(false);game.scene.start('play');for(let i=0;i<4;i++)tick();const s=game.scene.getScene('play');
   for(const a of [...s.pigeons,...s.scooters,...s.grannies])a.sprite.destroy();s.pigeons=[];s.scooters=[];s.grannies=[];
   for(const b of [...s.physics.world.staticBodies.entries])b.gameObject.destroy();
   const floor=s.add.rectangle(2500,550,5000,220,0x788c7b);s.physics.add.existing(floor,true);s.physics.add.collider(s.tanya,floor);
   s.tanya.body.reset(100,414);if(tired)s.changeEnergy(-100);for(let i=0;i<3;i++)tick();
   const start=s.time.now,x=s.tanya.x;let min=440,air=false,tapped=false,land=null;
   key(true);tick();key(false);const takeoffTime=s.time.now,takeoffX=s.tanya.x;
   // Exhausted boosted flights now take about four seconds at 85px/s.
   for(let f=0;f<420;f++){
    if(delay!==null&&!tapped&&f+1>=Math.round(delay/(1000/60))){key(true);tapped=true;}
    tick();key(false);min=Math.min(min,s.tanya.body.bottom);air||=s.tanya.body.bottom<439;
    if(air&&s.tanya.body.blocked.down){land={seconds:(s.time.now-takeoffTime)/1000,distance:s.tanya.x-takeoffX};break;}
   }
   rows.push({tired,delay,height:440-min,...land,boosts:s.boostsUsed});
  }
  return rows;
 });
 assert.deepEqual(errors,[]);for(const r of result){assert.equal(r.boosts,r.delay!==null&&r.delay>=40&&r.delay<=280?1:0);assert.ok(r.distance>0);}
 for(const tired of [false,true]){const boosted=result.filter(r=>r.tired===tired&&r.boosts);assert.ok(Math.max(...boosted.map(r=>r.height))-Math.min(...boosted.map(r=>r.height))<2);}
 writeFileSync('/tmp/tanya-v3-jump-metrics.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
} finally {await browser.close();}
