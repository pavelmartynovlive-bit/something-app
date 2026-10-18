import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 await page.goto(process.env.LEVEL_URL||'http://localhost:5173');await page.waitForSelector('canvas');
 await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;window.cfg=(await import('/src/settings.ts')).settings;window.art=(await import('/src/tanya-visual.ts')).tanyaArt});
 await page.waitForFunction(()=>game.scene.getScene('play')?.tanyaVisual?.sprite);
 const contract=await page.evaluate(()=>{
  game.loop.stop();let now=performance.now();window.tanyaTick=(n=1)=>{for(let i=0;i<n;i++)game.headlessStep(now+=1000/60,1000/60)};
  window.tanyaKey=d=>window.dispatchEvent(new KeyboardEvent(d?'keydown':'keyup',{key:' ',code:'Space',keyCode:32,bubbles:true}));
  window.tanyaRestart=()=>{tanyaKey(false);game.scene.start('play');tanyaTick(4);return game.scene.getScene('play')};
  const s=tanyaRestart(),b=s.tanya.body,v=s.tanyaVisual.sprite;
  const snap=()=>({body:{x:b.x,y:b.y,width:b.width,height:b.height,offset:[b.offset.x,b.offset.y],vx:b.velocity.x,vy:b.velocity.y,gravity:b.gravity.y,enabled:b.enable},energy:s.energy,camera:[s.cameras.main.scrollX,s.cameras.main.scrollY]});
  const before=snap();for(let i=0;i<100;i++)s.tanyaVisual.sync();const after=snap();
  const tex=s.textures.get(art.displayKey),ctx=tex.getContext(),frames=[];
  for(const name of tex.getFrameNames()){
   const f=tex.get(name),pixels=ctx.getImageData(f.cutX,f.cutY,art.frameSize,art.frameSize).data;
   let bottom=-1,top=art.frameSize;for(let y=0;y<art.frameSize;y++)for(let x=0;x<art.frameSize;x++)if(pixels[(y*art.frameSize+x)*4+3]>=128){bottom=Math.max(bottom,y+1);top=Math.min(top,y)}
   v.setFrame(name);frames.push({name,width:v.width,height:v.height,origin:[v.originX,v.originY],bottomError:(bottom-art.footY)*v.scaleY,opaqueHeight:(bottom-top)*v.scaleY});
  }
  v.setFrame('run-01');
  return {art,frames,debug:s.tanyaVisual.debugEnabled,animations:s.anims.getAnimsFromTexture(art.displayKey),carrier:{width:s.tanya.width,height:s.tanya.height,scale:s.tanya.scale,origin:[s.tanya.originX,s.tanya.originY],visible:s.tanya.visible},visual:{width:v.displayWidth,height:v.displayHeight,scale:v.scale,origin:[v.originX,v.originY],body:!!v.body,flipX:v.flipX,alpha:v.alpha,depth:v.depth},before,after};
 });
 assert.deepEqual(contract.carrier,{width:40,height:56,scale:1,origin:[.5,.5],visible:false});
 assert.deepEqual(contract.before,contract.after,'visual sync cannot mutate gameplay/camera');
 assert.equal(contract.before.body.width,24);assert.equal(contract.before.body.height,50);assert.deepEqual(contract.before.body.offset,[8,4]);
 assert.equal(contract.frames.length,20);assert.equal(contract.animations.length,6);assert.equal(contract.debug,false);
 assert.ok(Math.abs(contract.visual.scale-78.0208/133)<1e-9);assert.equal(contract.visual.body,false);
 for(const f of contract.frames){assert.equal(f.width,256);assert.equal(f.height,256);assert.deepEqual(f.origin,[.5,224/256]);assert.ok(Math.abs(f.bottomError)<.7,f.name+' foot baseline')}
 assert.ok(Math.abs(contract.frames.find(f=>f.name==='idle-01').opaqueHeight-78.0208)<.7,'preserve current apparent height');
 const states=await page.evaluate(()=>{
  const samples=[],probe=label=>{const s=game.scene.getScene('play'),v=s.tanyaVisual.sprite,b=s.tanya.body;samples.push({label,state:s.tanyaVisual.state,anim:v.anims.currentAnim.key,frame:v.frame.name,timeScale:v.anims.timeScale,visible:v.visible,origin:[v.originX,v.originY],size:[v.width,v.height],anchorError:Math.max(Math.abs(v.x-b.center.x),Math.abs(v.y-b.bottom)),body:[b.width,b.height,b.offset.x,b.offset.y],alpha:v.alpha,shadowVisible:s.tanyaVisual.footShadow.visible,contactVisible:s.tanyaVisual.contactShadow.visible})};
  let s=tanyaRestart();probe('run');let starts=0;const seen=new Set();s.tanyaVisual.sprite.on('animationstart',()=>starts++);
  for(let i=0;i<50;i++){tanyaTick();seen.add(s.tanyaVisual.sprite.frame.name)}
  const run={starts,frames:[...seen]};
  s=tanyaRestart();tanyaKey(true);tanyaTick();tanyaKey(false);probe('takeoff');tanyaTick(8);probe('rise');
  let i=0;while(s.tanya.body.velocity.y<=0&&i++<100)tanyaTick();probe('fall');
  while(!s.tanya.body.blocked.down&&i++<180)tanyaTick();probe('land');
  tanyaKey(true);tanyaTick();tanyaKey(false);probe('jump-immediately-after-land');
  s=tanyaRestart();s.changeEnergy(-100);tanyaTick();probe('tired');
  // The real bench trigger, not a synthetic animation context.
  s.checkpoint=7000;s.respawn();let frames=0;while(s.restRemaining===0&&frames++<300)tanyaTick();while(s.benchPhase!=='seated'&&frames++<350)tanyaTick();probe('bench');
  const bench={uses:s.benchUses,rest:s.restRemaining,energyBefore:s.energy};
  while(s.restRemaining>0&&frames++<600)tanyaTick();tanyaTick(8);probe('bench-exit');bench.energyAfter=s.energy;
  s=tanyaRestart();s.foodCount=17;s.changeEnergy(-50);const energy=s.energy;s.beginFall();tanyaTick();probe('pit');
  while(s.recoveries===0)tanyaTick();probe('respawn');
  const recovery={energy:s.energy,expectedEnergy:energy,food:s.foodCount,returns:s.recoveries,bodyBottom:s.tanya.body.bottom};
  // Walk off the actual high one-way platform: no fake takeoff animation.
  s=tanyaRestart();const b=s.tanya.body;b.reset(3285,179);b.position.set(3285-b.halfWidth,205-b.height);b.prev.copy(b.position);b.prevFrame.copy(b.position);b.updateCenter();b.blocked.down=true;b.velocity.set(240,0);s.tanyaVisual.initialized=false;tanyaTick(8);probe('high-platform-drop');
  // Ordinary frame-driven landing animation returns to autorun, never locks input.
  i=0;while(!b.blocked.down&&i++<180)tanyaTick();probe('platform-fall-land');tanyaTick(7);probe('land-exit');
  return {samples,run,bench,recovery};
 });
 writeFileSync('/tmp/tanya-animation-state-probes.json',JSON.stringify(states,null,2));
 const named=Object.fromEntries(states.samples.map(p=>[p.label,p]));
 for(const p of states.samples){assert.equal(p.anchorError,0,p.label+' foot anchor');assert.deepEqual(p.body,[24,50,8,4]);assert.deepEqual(p.size,[256,256]);assert.deepEqual(p.origin,[.5,224/256]);assert.equal(p.anim,'tanya-'+p.state);assert.equal(p.shadowVisible,p.contactVisible)}
 assert.equal(states.run.starts,0,'continuous run must not restart');assert.equal(states.run.frames.length,8,'eight-frame loop advances');
 assert.equal(named.takeoff.state,'jump-start');assert.equal(named.rise.state,'jump');assert.equal(named.fall.state,'fall');assert.equal(named.land.state,'land');assert.equal(named['jump-immediately-after-land'].state,'jump-start');
 assert.equal(named.tired.state,'run');assert.ok(Math.abs(named.tired.timeScale-85/240)<.001);assert.equal(named.tired.alpha,1);
 assert.equal(named.bench.state,'bench-idle');assert.ok(named.bench.visible);assert.equal(states.bench.uses,1);assert.ok(states.bench.energyAfter>states.bench.energyBefore+30);assert.equal(named['bench-exit'].state,'run');
 assert.equal(named.pit.state,'pit-fall');assert.equal(named.respawn.state,'run');assert.deepEqual(states.recovery,{energy:states.recovery.expectedEnergy,expectedEnergy:states.recovery.expectedEnergy,food:17,returns:1,bodyBottom:440});
 assert.equal(named['high-platform-drop'].state,'fall');assert.equal(named['platform-fall-land'].state,'land');assert.equal(named['land-exit'].state,'run');
 const replay=await page.evaluate(()=>{const rows=[];for(let i=0;i<8;i++){const s=tanyaRestart();rows.push({contacts:s.children.list.filter(o=>o.getData('tanyaContactShadow')).length,shadows:s.children.list.filter(o=>o.getData('tanyaFootShadow')).length,images:s.children.list.filter(o=>o.getData('tanyaVisual')).length,textures:s.textures.getTextureKeys().filter(k=>k==='tanya:animated-display').length,animations:s.anims.getAnimsFromTexture(art.displayKey).length,listeners:s.events.listenerCount('postupdate')})}return rows});
 assert.ok(replay.every(r=>r.images===1&&r.shadows===1&&r.contacts===1&&r.textures===1&&r.animations===6&&r.listeners===replay[0].listeners),'no replay image/event/texture/animation leaks');
 const debug=await page.evaluate(()=>{const s=game.scene.getScene('play'),v=s.tanyaVisual;v.setDebugEnabled(true);tanyaTick();const text=v.debugText.text,body=!!v.debugBody;v.setDebugEnabled(false);return{text,body,hidden:!v.debugBody.visible&&!v.debugText.visible}});
 assert.match(debug.text,/tanya-run/);assert.match(debug.text,/energy/);assert.match(debug.text,/vy/);assert.ok(debug.body&&debug.hidden);
 const resize=[];
 for(const [width,height] of [[375,667],[390,664],[430,932],[844,390],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);
  resize.push(await page.evaluate(()=>{tanyaTick(2);const s=game.scene.getScene('play'),v=s.tanyaVisual.sprite,b=s.tanya.body;return{visual:[v.width,v.height,v.scale],body:[b.width,b.height],anchorError:v.y-b.bottom}}));
 }
 assert.ok(resize.every(r=>r.visual[0]===256&&r.visual[1]===256&&Math.abs(r.visual[2]-78.0208/133)<1e-9&&r.body[0]===24&&r.body[1]===50&&r.anchorError===0));
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
 writeFileSync('docs/tanya/validation.json',JSON.stringify({contract,states,replay,debug,resize,errors,failed},null,2)+'\n');
 console.log('PASS: 20-frame atlas, physics independence, stable run loop, jump-start/rise/fall/land, tired cadence, bench idle, recovery, debug, resize and portrait captures');
}finally{await browser.close()}
