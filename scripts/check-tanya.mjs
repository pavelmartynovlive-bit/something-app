import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 await page.goto('http://localhost:5173');await page.waitForSelector('canvas');
 await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;window.cfg=(await import('/src/settings.ts')).settings;window.art=(await import('/src/tanya-visual.ts')).tanyaArt});
 await page.waitForFunction(()=>game.scene.getScene('play')?.tanyaVisual?.sprite);
 const contract=await page.evaluate(()=>{
  game.loop.stop();let now=performance.now();window.tanyaTick=(n=1)=>{for(let i=0;i<n;i++)game.headlessStep(now+=1000/60,1000/60)};
  window.tanyaKey=d=>window.dispatchEvent(new KeyboardEvent(d?'keydown':'keyup',{key:' ',code:'Space',keyCode:32,bubbles:true}));
  window.tanyaRestart=()=>{tanyaKey(false);game.scene.start('play');tanyaTick(4);return game.scene.getScene('play')};
  const s=tanyaRestart(),b=s.tanya.body,v=s.tanyaVisual.sprite;
  const snap=()=>({body:{x:b.x,y:b.y,width:b.width,height:b.height,offset:[b.offset.x,b.offset.y],vx:b.velocity.x,vy:b.velocity.y,gravity:b.gravity.y,enabled:b.enable},energy:s.energy,camera:[s.cameras.main.scrollX,s.cameras.main.scrollY]});
  const before=snap();for(let i=0;i<100;i++)s.tanyaVisual.sync();const after=snap();
  const texture=s.textures.get(art.displayKey),pixels=texture.getContext().getImageData(0,0,art.rasterWidth,art.rasterHeight).data;
  let lastOpaqueRow=-1;for(let y=0;y<art.rasterHeight;y++)for(let x=0;x<art.rasterWidth;x++)if(pixels[(y*art.rasterWidth+x)*4+3]>=128)lastOpaqueRow=Math.max(lastOpaqueRow,y);
  const bitmap={lastOpaqueRow,bottomGap:(art.rasterHeight-1-lastOpaqueRow)*v.scaleY};
  return {art,bitmap,carrier:{width:s.tanya.width,height:s.tanya.height,scale:s.tanya.scale,origin:[s.tanya.originX,s.tanya.originY],visible:s.tanya.visible},visual:{width:v.displayWidth,height:v.displayHeight,scale:v.scale,origin:[v.originX,v.originY],body:!!v.body,flipX:v.flipX,alpha:v.alpha,depth:v.depth},before,after};
 });
 assert.ok(contract.bitmap.bottomGap<=.25,'opaque boot sole reaches the physical foot baseline');
 assert.deepEqual(contract.carrier,{width:40,height:56,scale:1,origin:[.5,.5],visible:false});
 assert.deepEqual(contract.before,contract.after,'visual sync cannot mutate gameplay/camera');
 assert.equal(contract.before.body.width,24);assert.equal(contract.before.body.height,50);assert.deepEqual(contract.before.body.offset,[8,4]);
 assert.deepEqual(contract.visual,{width:34.5,height:62,scale:.25,origin:[.5,1],body:false,flipX:false,alpha:1,depth:10});
 const states=await page.evaluate(()=>{
  const samples=[],probe=label=>{const s=game.scene.getScene('play'),v=s.tanyaVisual.sprite,b=s.tanya.body;samples.push({label,state:s.tanyaVisual.state,visible:v.visible,anchorError:Math.max(Math.abs(v.x-b.center.x),Math.abs(v.y-b.bottom)),width:b.width,height:b.height,offset:[b.offset.x,b.offset.y],alpha:v.alpha})};
  let s=tanyaRestart();probe('run');tanyaKey(true);tanyaTick();tanyaKey(false);probe('jump');
  let i=0;while(s.tanya.body.velocity.y<=0&&i++<80)tanyaTick();probe('fall');
  while(!s.tanya.body.blocked.down&&i++<120)tanyaTick();probe('land');
  s=tanyaRestart();s.changeEnergy(-100);tanyaTick();probe('tired');
  // Isolated bench fixture; full routes test ordinary approach separately.
  s.checkpoint=7000;s.respawn();let frames=0;while(s.restRemaining===0&&frames++<250)tanyaTick();probe('rest');
  while(s.restRemaining>0&&frames++<500)tanyaTick();tanyaTick(3);probe('rest-exit');
  s=tanyaRestart();s.foodCount=17;s.changeEnergy(-50);const energy=s.energy;s.beginFall();tanyaTick();probe('pit');
  while(s.recoveries===0)tanyaTick();probe('respawn');
  return {samples,recovery:{energy:s.energy,expectedEnergy:energy,food:s.foodCount,returns:s.recoveries,bodyBottom:s.tanya.body.bottom,ground:440}};
 });
 for(const p of states.samples){assert.equal(p.anchorError,0,p.label+' foot alignment');assert.equal(p.width,24);assert.equal(p.height,50);assert.deepEqual(p.offset,[8,4]);}
 assert.deepEqual(states.samples.map(s=>s.state),['run','jump','fall','run','tired','rest','run','fall','run']);
 assert.ok(!states.samples.find(s=>s.label==='rest').visible);assert.ok(states.samples.find(s=>s.label==='rest-exit').visible);
 assert.equal(states.samples.find(s=>s.label==='tired').alpha,1,'no fatigue opacity/filter');
 assert.equal(states.recovery.food,17);assert.equal(states.recovery.energy,states.recovery.expectedEnergy);assert.equal(states.recovery.returns,1);assert.equal(states.recovery.bodyBottom,440);
 const replay=await page.evaluate(()=>{const rows=[];for(let i=0;i<8;i++){const s=tanyaRestart();rows.push({images:s.children.list.filter(o=>o.getData('tanyaVisual')).length,textures:s.textures.getTextureKeys().filter(k=>k==='tanya:stand-display').length,listeners:s.events.listenerCount('postupdate')})}return rows});
 assert.ok(replay.every(r=>r.images===1&&r.textures===1&&r.listeners===replay[0].listeners),'no replay image/event/texture leaks');
 const resize=[];
 for(const [width,height] of [[375,667],[430,932],[844,390],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);
  resize.push(await page.evaluate(()=>{tanyaTick(2);const s=game.scene.getScene('play'),v=s.tanyaVisual.sprite,b=s.tanya.body;return{visual:[v.displayWidth,v.displayHeight],body:[b.width,b.height],anchorError:v.y-b.bottom}}));
 }
 assert.ok(resize.every(r=>r.visual[0]===34.5&&r.visual[1]===62&&r.body[0]===24&&r.body[1]===50&&r.anchorError===0));
 mkdirSync('docs/tanya',{recursive:true});
 // Real input replay: inspect current art alongside terrain/pickups/hazards.
 const runs=JSON.parse(readFileSync('/tmp/tanya-v3-runs.json','utf8')),run=runs.find(r=>r.mode==='natural');
 await page.evaluate(inputs=>{window.tanyaReplayScene=tanyaRestart();window.tanyaReplayStart=tanyaReplayScene.time.now;window.tanyaReplayInputs=inputs;window.tanyaReplayIndex=0;document.querySelector('#hint').hidden=true},run.inputs);
 for(const [label,x] of [['trees',105],['food',490],['houses',1350],['granny',1740],['light-sky',2200],['scooter',5230],['rest',7190],['lipton',8150]]){
  await page.evaluate(target=>{const s=tanyaReplayScene;let frame=0;while((s.tanya.x<target||(target===7190&&s.restRemaining===0))&&frame++<10000){const t=(s.time.now-tanyaReplayStart)/1000,p=tanyaReplayInputs[tanyaReplayIndex];if(p&&t>=p.time-1e-6){tanyaKey(true);tanyaReplayIndex++;}tanyaTick();tanyaKey(false)}if(frame>=10000)throw Error('Replay stalled');s.physics.pause();window.tanyaSceneUpdate=s.sys.sceneUpdate;s.sys.sceneUpdate=()=>{};document.querySelector('#toast').classList.remove('visible');s.game.renderer.preRender();s.game.scene.render(s.game.renderer);s.game.renderer.postRender()},x);
  await page.screenshot({path:`docs/tanya/${label}.png`});
  await page.evaluate(()=>{const s=tanyaReplayScene;s.sys.sceneUpdate=tanyaSceneUpdate;s.physics.resume()});
 }
 // The optional short-platform route is validated with its own real inputs.
 const collector=runs.find(r=>r.mode==='collector');
 await page.evaluate(inputs=>{
  const s=tanyaRestart(),start=s.time.now;let i=0,frames=0;
  while(s.tanya.x<2960&&frames++<6000){const t=(s.time.now-start)/1000,p=inputs[i];if(p&&t>=p.time-1e-6){tanyaKey(true);i++;}tanyaTick();tanyaKey(false)}
  s.physics.pause();window.tanyaSceneUpdate=s.sys.sceneUpdate;s.sys.sceneUpdate=()=>{};
  document.querySelector('#toast').classList.remove('visible');game.renderer.preRender();game.scene.render(game.renderer);game.renderer.postRender();
 },collector.inputs);
 await page.screenshot({path:'docs/tanya/short-platform.png'});
 await page.evaluate(()=>{const s=game.scene.getScene('play');s.sys.sceneUpdate=tanyaSceneUpdate;s.physics.resume()});
 await page.evaluate(()=>{
  const s=tanyaRestart();s.changeEnergy(-100);tanyaTick(2);s.physics.pause();s.sys.sceneUpdate=()=>{};
  document.querySelector('#toast').classList.remove('visible');game.renderer.preRender();game.scene.render(game.renderer);game.renderer.postRender();
 });
 await page.screenshot({path:'docs/tanya/tired.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 writeFileSync('docs/tanya/validation.json',JSON.stringify({contract,states,replay,resize,errors,failed},null,2)+'\n');
 console.log('PASS: independent visual/body, bottom anchor, run/jump/fall/tired/rest, recovery, resize, replay, readable portrait captures');
}finally{await browser.close()}
