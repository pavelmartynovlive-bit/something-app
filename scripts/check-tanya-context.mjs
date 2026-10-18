import {chromium} from 'playwright';import assert from 'node:assert/strict';import {mkdirSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5173');await page.waitForSelector('canvas');await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;window.cfg=(await import('/src/settings.ts')).settings;window.ground=(await import('/src/terrain.ts')).groundYAt});await page.waitForFunction(()=>game.scene.getScene('play').tanyaVisual?.sprite);
const data=await page.evaluate(()=>{
 game.loop.stop();let now=performance.now();window.ctxTick=(delta=1000/60)=>game.headlessStep(now+=delta,delta);window.ctxKey=d=>window.dispatchEvent(new KeyboardEvent(d?'keydown':'keyup',{key:' ',code:'Space',keyCode:32,bubbles:true}));
 window.ctxRestart=()=>{ctxKey(false);game.scene.start('play');for(let i=0;i<4;i++)ctxTick();document.querySelector('#hint').hidden=true;return game.scene.getScene('play')};
 window.ctxPlace=(s,x,y)=>{const b=s.tanya.body;s.tanya.setPosition(x,y-26);b.position.set(x-b.halfWidth,y-b.height);b.prev.copy(b.position);b.prevFrame.copy(b.position);b.updateCenter();b.velocity.set(0,0);b.blocked.down=b.touching.down=true};
 const pits=[];
 for(const index of [0,1,3])for(const tired of [false,true]){
  const s=ctxRestart(),p=cfg.interruptions[index];if(tired)s.changeEnergy(-100);s.checkpoint=cfg.recoveryAnchors.filter(x=>x<p.start).at(-1);s.foodCount=23;ctxPlace(s,p.start-25,ground(p.start-1));const rows=[];let waitingAt=null,waitEnd=null,energyStart=null,foodStart=null;
  for(let i=0;i<250&&!s.recoveries;i++){ctxTick();const b=s.tanya.body;if(s.pitFalling){if(energyStart===null){energyStart=s.energy;foodStart=s.foodCount;}rows.push({y:b.bottom,vy:b.velocity.y,enabled:b.enable,alpha:s.tanyaVisual.sprite.alpha,visible:s.tanyaVisual.sprite.visible,state:s.tanyaVisual.state,wait:s.recoveryRemaining,kill:s.fallZone.killY,maskBottom:s.fallZone.maskBottom,visualTop:b.bottom-224*(78.0208/133),energy:s.energy});if(s.recoveryRemaining>0&&waitingAt===null)waitingAt=s.time.now}else if(s.recoveries)waitEnd=s.time.now;}
  pits.push({index,tired,rows,returns:s.recoveries,falls:s.falls,food:s.foodCount,foodStart,energyPreserved:rows.every(r=>r.energy===energyStart),waitMs:waitEnd-waitingAt,x:s.tanya.x,anchor:s.checkpoint,vy:s.tanya.body.velocity.y,body:[s.tanya.body.width,s.tanya.body.height]});
 }
 const benches=[];
 for(const fps of [30,60,120]){
  const s=ctxRestart();s.changeEnergy(-90);s.checkpoint=7000;s.respawn();let i=0;while(!s.restRemaining&&i++<500)ctxTick(1000/fps);const start=s.time.now,energy=s.energy,rows=[];let x=s.tanya.body.center.x,y=s.tanya.body.bottom;
  while(s.restRemaining>0&&i++<1000){const old=s.energy,phaseBefore=s.benchPhase;ctxTick(1000/fps);rows.push({phase:s.benchPhase,phaseBefore,state:s.tanyaVisual.state,x:s.tanya.body.center.x,y:s.tanya.body.bottom,energy:s.energy,gain:s.energy-old,remaining:s.restRemaining,body:[s.tanya.body.width,s.tanya.body.height]})}
  ctxTick(1000/fps);benches.push({fps,rows,seconds:(s.time.now-start)/1000,energyGain:s.energy-energy,uses:s.benchUses,anchor:[x,y],exitState:s.tanyaVisual.state,vx:s.tanya.body.velocity.x});
 }
 const hits=[];
 for(const kind of ['granny','scooter']){
  const s=ctxRestart(),b=s.tanya.body;const hazard=kind==='granny'?s.grannies[0].sprite:s.scooters[0].sprite;
  if(kind==='scooter'){s.scooters[0].launched=true;s.scooters[0].left=-100;s.scooters[0].right=1000;}
  // Place the REAL danger rectangles into the current player's torso.
  hazard.body.reset(s.tanya.x,s.tanya.y);hazard.body.position.set(b.x+hazard.body.offset.x-15,b.y+hazard.body.offset.y);hazard.body.updateCenter();
  const energy=s.energy;ctxTick();const state=s.tanyaVisual.state,loss=energy-s.energy;hazard.body.enable=false;hazard.setVisible(false);
  const history=[];ctxKey(true);ctxTick();ctxKey(false);
  for(let i=0;i<25;i++){history.push({state:s.tanyaVisual.state,alpha:s.tanyaVisual.sprite.alpha,vy:b.velocity.y,vx:b.velocity.x});ctxTick()}
  const duringCooldown=s.hit(15,kind==='granny'?'scooter':'granny');while(s.time.now<s.hitUntil+1){ctxTick();if(s.tanya.x>300)ctxPlace(s,100,440);}const after=s.hit(15,kind);ctxTick();
  hits.push({kind,state,loss,history,duringCooldown,after,afterState:s.tanyaVisual.state,body:[b.width,b.height],cooldown:cfg.hitCooldownMs});
 }
 const s=ctxRestart();s.hit(15,'granny');s.beginFall();ctxTick();const priority={state:s.tanyaVisual.state,alpha:s.tanyaVisual.sprite.alpha};
 const replay=[];for(let i=0;i<8;i++){const s=ctxRestart();replay.push({anims:s.anims.getAnimsFromTexture('tanya:context-display').length,frames:s.textures.get('tanya:context-display').getFrameNames().length,images:s.children.list.filter(o=>o.getData('tanyaVisual')).length,listeners:s.events.listenerCount('postupdate')})}
 return {pits,benches,hits,priority,replay};
});
mkdirSync('docs/tanya',{recursive:true});writeFileSync('docs/tanya/context-validation.json',JSON.stringify(data,null,2)+'\n');
for(const p of data.pits){assert.equal(p.returns,1,'pit return '+p.index);assert.equal(p.falls,1);assert.equal(p.food,p.foodStart);assert.ok(p.energyPreserved);assert.deepEqual(p.body,[24,50]);assert.ok(p.waitMs>=cfgDelay()-1&&p.waitMs<=cfgDelay()+35);const falling=p.rows.filter(r=>r.wait===0);assert.ok(falling.length>=5);for(let i=1;i<falling.length;i++){assert.ok(falling[i].y>falling[i-1].y,'continuous downward movement');assert.ok(falling[i].vy>0&&falling[i].enabled);assert.equal(falling[i].alpha,1);assert.equal(falling[i].state,'pit-fall')}for(const r of p.rows.filter(r=>r.wait>0)){assert.equal(r.visible,false);assert.ok(r.visualTop>=r.maskBottom);assert.ok(!r.enabled)}assert.equal(p.x,p.anchor);assert.equal(p.vy,0)}
function cfgDelay(){return 220}
for(const b of data.benches){assert.equal(b.uses,1);assert.ok(b.seconds>2.4&&b.seconds<2.6);assert.ok(b.energyGain>35&&b.energyGain<36.1);assert.equal(b.exitState,'run');assert.ok(b.vx>0);for(const r of b.rows){assert.deepEqual(r.body,[24,50]);if(r.remaining>0){assert.equal(r.x,b.anchor[0]);assert.equal(r.y,b.anchor[1]);assert.equal(r.state,'bench-'+(r.phase==='seated'?'idle':r.phase))}if(r.phaseBefore==='sit'&&r.phase==='sit'||r.phaseBefore==='stand')assert.ok(Math.abs(r.gain)<1e-9,'energy only while seated')}assert.ok(b.rows.some(r=>r.phase==='seated'&&r.gain>0));assert.ok(b.rows.some(r=>r.phase==='stand'))}
for(const h of data.hits){assert.equal(h.state,'hit-'+h.kind);assert.ok(Math.abs(h.loss-(h.kind==='granny'?15:12))<.2);assert.equal(h.duringCooldown,false);assert.equal(h.after,true);assert.equal(h.afterState,'hit-'+h.kind);assert.ok(h.history.slice(0,5).every(r=>r.state==='hit-'+h.kind));assert.ok(h.history.every(r=>r.alpha===1));assert.ok(h.history.some(r=>r.vy<0),'jump input works during reaction');assert.deepEqual(h.body,[24,50]);if(h.kind==='scooter')assert.ok(h.history.every(r=>r.vx<=100))}
assert.equal(data.priority.state,'pit-fall');assert.equal(data.priority.alpha,1);assert.ok(data.replay.every(r=>r.anims===6&&r.frames===20&&r.images===1&&r.listeners===data.replay[0].listeners));assert.deepEqual(errors,[]);
// Actual mobile screenshots use the live renderer and real interaction states.
async function capture(name,code){await page.evaluate(code);await page.screenshot({path:'docs/tanya/context-'+name+'.png'})}
await capture('bench',()=>{const s=ctxRestart();s.changeEnergy(-90);s.checkpoint=7000;s.respawn();let i=0;while((s.benchPhase!=='seated'||s.tanyaVisual.sprite.frame.name!=='bench-idle-02')&&i++<500)ctxTick();s.physics.pause();document.querySelector('#toast').style.opacity='0';game.renderer.preRender();game.scene.render(game.renderer);game.renderer.postRender()});
await capture('pit',()=>{const s=ctxRestart();s.checkpoint=240;ctxPlace(s,410,440);let i=0;while((!s.pitFalling||s.tanya.body.bottom<472)&&i++<120)ctxTick();s.physics.pause();document.querySelector('#toast').style.opacity='0';game.renderer.preRender();game.scene.render(game.renderer);game.renderer.postRender()});
await capture('hit',()=>{const s=ctxRestart();s.hit(12,'scooter');ctxTick();ctxTick();s.physics.pause();document.querySelector('#toast').style.opacity='0';game.renderer.preRender();game.scene.render(game.renderer);game.renderer.postRender()});
console.log('PASS: six real pit falls, 30/60/120fps seated recovery, actual granny/scooter contacts, protected reactions, no blink, priority, replay, portrait captures');
}finally{await browser.close()}
