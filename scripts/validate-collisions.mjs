// V3 regression probes: actual Arcade contacts, controls and visible hazard masks.
import {chromium} from 'playwright';import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.LEVEL_URL||'http://localhost:5173');await page.waitForSelector('canvas');
 await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;window.cfg=(await import('/src/settings.ts')).settings;window.terrain=await import('/src/terrain.ts');window.haz=await import('/src/hazard-shapes.ts')});await page.waitForFunction(()=>game.scene.getScene('play')?.tanya?.body);
 await page.evaluate(()=>{game.loop.stop();let now=performance.now();window.tick=(n=1)=>{for(let i=0;i<n;i++)game.headlessStep(now+=1000/60,1000/60)};window.key=d=>window.dispatchEvent(new KeyboardEvent(d?'keydown':'keyup',{key:' ',code:'Space',keyCode:32,bubbles:true}));window.restart=(quiet=true)=>{key(false);game.scene.start('play');tick(4);const s=game.scene.getScene('play');if(quiet){for(const a of [...s.pigeons,...s.scooters,...s.grannies])a.sprite.destroy();s.pigeons=[];s.scooters=[];s.grannies=[];}return s};window.place=(s,x,y)=>{s.tanya.body.reset(x,y-26);s.tanya.setVelocity(0,0);tick(2)}});
 const result=await page.evaluate(()=>{
  const transitions=[];
  for(const tr of terrain.terrainTransitions.filter(t=>t.rise>0&&!cfg.interruptions.some(g=>g.start+g.width===t.x)))for(const tired of [false,true])for(const offset of [-10,0,10]){
   const boosted=tr.rise>100;const lead=(boosted?(tired?110:130):(tired?(tr.rise>45?65:45):80))+offset;
   const s=restart();place(s,tr.x-lead-(tired?6:8),tr.fromY);if(tired)s.changeEnergy(-100);tick(2);
   const launch=s.tanya.x,start=s.time.now;key(true);tick();key(false);let sent=false,landing=null,blocked=0;
   for(let i=0;i<100;i++){
    if(boosted&&!sent&&s.time.now-start>=150){key(true);sent=true;}tick();key(false);blocked+=Number(s.tanya.body.blocked.right);
    if(s.tanya.body.blocked.down&&s.tanya.x>tr.x+12&&Math.abs(s.tanya.body.bottom-tr.toY)<1){landing=s.tanya.x;break}
   }
   transitions.push({x:tr.x,rise:tr.rise,tired,offset,lead:tr.x-launch,boosted,landing,blocked,footMargin:landing===null?null:landing-tr.x-12});
  }
  const shortGaps=[];
  for(const gap of cfg.interruptions.filter(g=>g.width<100))for(const tired of [false,true])for(const offset of [-10,0,10]){
   const lead=(tired?25:60)+offset,from=terrain.groundYAt(gap.start-1),target=terrain.groundYAt(gap.start+gap.width+1);
   const s=restart();place(s,gap.start-lead-(tired?6:8),from);if(tired)s.changeEnergy(-100);tick(2);key(true);tick();key(false);let land=null,blocked=0,deepest=from;
   for(let i=0;i<75;i++){tick();blocked+=Number(s.tanya.body.blocked.right);deepest=Math.max(deepest,s.tanya.body.bottom);if(s.tanya.body.blocked.down&&s.tanya.x>gap.start+gap.width+12&&Math.abs(s.tanya.body.bottom-target)<2){land=s.tanya.x;break}}
   shortGaps.push({start:gap.start,tired,offset,land,blocked,deepest,footMargin:land===null?null:land-gap.start-gap.width-12});
  }
  const longGap=[];
  for(const tired of [false,true])for(const delay of [null,100,150,220]){
   const s=restart(),lead=tired?25:50;place(s,4280-lead-(tired?6:8),425);if(tired)s.changeEnergy(-100);tick(2);const start=s.time.now;
   key(true);tick();key(false);let sent=false,land=null,deepest=0;
   for(let i=0;i<100;i++){
    if(delay!==null&&!sent&&s.time.now-start>=delay){key(true);sent=true;}tick();key(false);deepest=Math.max(deepest,s.tanya.body.bottom);
    if(s.tanya.body.blocked.down&&s.tanya.x>4562&&Math.abs(s.tanya.body.bottom-425)<1){land=s.tanya.x;break}
   }
   longGap.push({tired,delay,land,deepest,footMargin:land===null?null:land-4550-12});
  }
  const boostControls=[];
  for(const mode of ['hold','third-tap','late','arrow']){
   const s=restart();place(s,100,440);
   if(mode==='arrow'){window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',code:'ArrowUp',keyCode:38,bubbles:true}));tick();window.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowUp',code:'ArrowUp',keyCode:38,bubbles:true}));}
   else {key(true);tick();if(mode!=='hold')key(false);}
   const initialVy=s.tanya.body.velocity.y;
   for(let f=1;f<=32;f++){
    if(mode==='hold'&&f===8)window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',keyCode:32,repeat:true,bubbles:true}));
    if(mode==='third-tap'&&(f===9||f===14))key(true);
    if(mode==='late'&&f===20)key(true);
    tick();if(mode!=='hold')key(false);
   }
   key(false);boostControls.push({mode,boosts:s.boostsUsed,initialVy});
  }
  const ramps=[];
  for(const ramp of cfg.groundSpans.filter(g=>g.endY!==undefined))for(const tired of [false,true]){
   const s=restart();place(s,ramp.start+20,terrain.groundYAt(ramp.start+20));if(tired)s.changeEnergy(-100);tick(2);let error=0,air=0,blocked=0;
   for(let i=0;i<600&&s.tanya.x<ramp.end-20;i++){tick();const b=s.tanya.body;error=Math.max(error,Math.abs(b.bottom-terrain.groundYAt(b.center.x)));air+=Number(!b.blocked.down);blocked+=Number(b.blocked.right)}
   ramps.push({start:ramp.start,tired,error,air,blocked});
  }
  const escapes=[];
  for(const gap of cfg.interruptions)for(const tired of [false,true]){
   const s=restart();const floor=terrain.groundYAt(gap.start+2);place(s,gap.start+gap.width-22,floor);if(tired)s.changeEnergy(-100);tick(2);const start=s.time.now;key(true);tick();key(false);let sent=false;
   for(let i=0;i<140;i++){if(gap.depth>100&&!sent&&s.time.now-start>=150){key(true);sent=true}tick();key(false);if(s.tanya.body.blocked.down&&s.tanya.x>gap.start+gap.width+30)break}
   escapes.push({start:gap.start,tired,x:s.tanya.x,escaped:s.tanya.x>gap.start+gap.width+30&&s.tanya.body.blocked.down});
  }
  const oneWay=[];
  for(const p of cfg.routePlatforms){const s=restart();place(s,p.x-20,terrain.groundYAt(p.x-20));key(true);tick();key(false);let hitHead=false,landed=false;for(let i=0;i<65;i++){tick();hitHead||=s.tanya.body.blocked.up;landed||=s.tanya.body.blocked.down&&Math.abs(s.tanya.body.bottom-p.y)<1}oneWay.push({x:p.x,hitHead,landed})}
  const coyote=[];for(const frames of [4,12]){const s=restart(),p=cfg.routePlatforms[0];place(s,p.x+p.width-20,p.y);let i=0;while(s.tanya.body.blocked.down&&i++<30)tick();tick(frames-1);key(true);tick();key(false);coyote.push({frames,vy:s.tanya.body.velocity.y})}
  const buffer=(()=>{const s=restart();place(s,100,330);while(s.tanya.body.bottom<410)tick();key(true);tick();key(false);let fired=false;for(let i=0;i<12;i++){tick();fired||=s.tanya.body.velocity.y<0}return fired})();
  const scooters=[];
  for(const tired of [false,true])for(const lead of [null,20,10,0]){
   const s=restart(false);place(s,5020,401);if(tired)s.changeEnergy(-100);tick(2);s.cameras.main.scrollX=s.tanya.x-42;
   const hits=[];s.hit=function(d){const ok=Object.getPrototypeOf(s).hit.call(this,d);if(ok)hits.push(d);return ok};let visible=null,tap=null,land=null;
   for(let i=0;i<450&&s.tanya.x<5710;i++){
    const sc=s.scooters[0].sprite,c=s.cameras.main;if(visible===null&&sc.x+34<c.scrollX+c.width/c.zoom)visible=s.time.now;
    if(lead!==null&&tap===null&&s.tanya.x>=5420-lead){key(true);tap=s.time.now}tick();key(false);
    if(tap!==null&&s.tanya.body.blocked.down&&s.tanya.x>5500)land??=s.tanya.x;
   }
   scooters.push({tired,lead,hits,reaction:tap===null?null:(tap-visible)/1000,landing:land});
  }
  const benches=[];for(const jump of [false,true]){const s=restart();place(s,6930,545);s.changeEnergy(-100);tick(2);let once=false,rest=false;for(let i=0;i<230;i++){if(jump&&!once&&s.tanya.x>=cfg.benches[0]-85){key(true);once=true}tick();key(false);rest||=s.restRemaining>0}benches.push({jump,rest,energy:s.energy})}
  const masks=[];const s=restart();for(const kind of ['scooter','pigeons','granny']){const source=s.textures.get(kind).getSourceImage(),c=document.createElement('canvas');c.width=source.width;c.height=source.height;const ctx=c.getContext('2d');ctx.drawImage(source,0,0);const pixels=ctx.getImageData(0,0,c.width,c.height).data;let outside=0;for(const r of haz.hazardShapes[kind])for(let y=r.y;y<r.y+r.height;y++)for(let x=r.x;x<r.x+r.width;x++)if(!pixels[(y*c.width+x)*4+3])outside++;masks.push({kind,outside})}
  const endings=[];for(const food of [cfg.requiredFood-1,cfg.requiredFood,cfg.bonusFood]){const s=restart();s.foodCount=food;s.feedCat();tick(100);endings.push({food,title:document.querySelector('#end-title').textContent,description:document.querySelector('#end-description').textContent,visible:!document.querySelector('#ending').hidden})}
  return {boostControls,transitions,shortGaps,longGap,ramps,escapes,oneWay,coyote,buffer,scooters,benches,masks,endings};
 });
 writeFileSync('/tmp/tanya-v3-collisions.json',JSON.stringify(result,null,2));
 assert.deepEqual(errors,[]);assert.ok(result.boostControls.every(r=>r.boosts===(r.mode==='third-tap'?1:0)&&r.initialVy<0),'hold/repeat/third/late/ArrowUp');assert.ok(result.transitions.every(t=>t.landing!==null&&t.blocked===0),'mandatory terrain transitions');
 assert.ok(result.shortGaps.every(g=>g.land!==null&&g.blocked===0&&g.footMargin>10),'short gaps at both energies');
 assert.ok(result.longGap.filter(g=>g.delay!==null).every(g=>g.land!==null&&g.deepest<426&&g.footMargin>20),'boosted long gap');assert.ok(result.longGap.filter(g=>g.delay===null).every(g=>g.deepest>450),'standard jump cannot clear the long gap');
 assert.ok(result.ramps.every(r=>r.error<1&&r.air===0&&r.blocked===0),'analytic ramp contacts');assert.ok(result.escapes.every(e=>e.escaped),'safe gap escape');
 assert.ok(result.oneWay.every(p=>!p.hitHead&&p.landed),'readable one-way platforms');assert.ok(result.coyote[0].vy<0&&result.coyote[1].vy>=0);assert.ok(result.buffer);
 assert.ok(result.scooters.filter(s=>s.lead!==null).every(s=>!s.hits.length&&s.reaction>=.49),'scooter timing window');assert.ok(result.scooters.filter(s=>s.lead===null).every(s=>s.hits.includes(12)));
 assert.ok(result.benches[0].rest&&!result.benches[1].rest);assert.ok(result.masks.every(m=>m.outside===0));assert.match(result.endings[0].description,/Не хватило 1/);assert.match(result.endings[1].title,/накормлен/);assert.match(result.endings[2].title,/пир/);
 await page.evaluate(()=>restart());await page.touchscreen.tap(230,500);assert.ok(await page.evaluate(()=>{tick(2);return game.scene.getScene('play').tanya.body.velocity.y<0}));
 await page.evaluate(()=>tick(7));await page.touchscreen.tap(230,500);assert.equal(await page.evaluate(()=>{tick(2);return game.scene.getScene('play').boostsUsed}),1);
 console.log('PASS: V3 terrain at both energies, boost margins, ramps, safe floors, one-way contacts, coyote/buffer, scooter, bench, masks, endings, touch boost');
}finally{await browser.close()}
