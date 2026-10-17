import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const output='docs/winter-environment';mkdirSync(output,{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 await page.goto('http://localhost:5173');
 await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;window.cfg=(await import('/src/settings.ts')).settings;window.terrain=await import('/src/terrain.ts')});
 await page.waitForFunction(()=>game.scene.getScene('play')?.tanya?.body);await page.evaluate(()=>{game.loop.stop();const s=game.scene.getScene('play');s.physics.pause();s.sys.sceneUpdate=()=>{}});
 const contract=await page.evaluate(()=>{
  const s=game.scene.getScene('play'),visuals=s.children.list.filter(o=>o.getData('environmentVisual'));
  const bodies=s.physics.world.staticBodies.entries;
  const rects=bodies.filter(b=>b.gameObject.type==='Rectangle').map(b=>[b.x,b.y,b.width,b.height]);
  const expected=[...cfg.groundSpans.filter(g=>g.endY===undefined).map(g=>[g.start,g.y,g.end-g.start,660-g.y]),...cfg.routePlatforms.map(p=>[p.x,p.y,p.width,cfg.platformThickness])];
  const topSamples=[];
  for(const span of cfg.groundSpans){
   const minY=Math.min(span.y,span.endY??span.y),src=s.textures.get('winter-art:ground:'+span.start).getSourceImage();
   const ctx=src.getContext('2d'),pix=ctx.getImageData(0,0,src.width,src.height).data;let holes=0,overhang=0,maxError=0;
   for(let x=0;x<src.width;x++){
    const surface=((span.y+((span.endY??span.y)-span.y)*(x+.5)/src.width)-minY)*2;
    let first=0;while(first<src.height&&pix[(first*src.width+x)*4+3]<128)first++;
    maxError=Math.max(maxError,Math.abs(first-surface)/2);
    if(first<surface-1)overhang++;
    const y=Math.min(src.height-1,Math.ceil(surface)+2);if(pix[(y*src.width+x)*4+3]<128)holes++;
   }
   topSamples.push({start:span.start,samples:src.width,holes,overhang,maxError});
  }
  const platforms=cfg.routePlatforms.map(p=>{const image=visuals.find(o=>o.texture.key==='winter-art:platform:'+p.x);return {x:image.x,y:image.y,width:image.displayWidth,height:image.displayHeight,body:!!image.body}});
  const bench=s.benchSprites[0],b=bench.body;
  return {visualCount:visuals.length,visualsWithBodies:visuals.filter(o=>!!o.body).length,rects,expected,topSamples,platforms,
   bench:{x:bench.x,y:bench.y,texture:bench.texture.key,textureWidth:bench.width,textureHeight:bench.height,width:b.width,height:b.height,offset:[b.offset.x,b.offset.y],enable:b.enable,visible:bench.visible},
   depth:{tanya:s.tanya.depth,enemies:[...s.grannies,...s.scooters,...s.pigeons].map(a=>a.sprite.depth),food:bodies.filter(b=>b.gameObject.texture?.key==='food').map(b=>b.gameObject.depth)},
   geometry:JSON.stringify({ground:cfg.groundSpans,platforms:cfg.routePlatforms,pits:cfg.interruptions,anchors:cfg.recoveryAnchors}),
   generated:s.textures.getTextureKeys().filter(k=>k.startsWith('winter-art:')).length,
   textures:s.textures.getTextureKeys().filter(k=>k.startsWith('environment:'))};
 });
 assert.equal(contract.visualsWithBodies,0);assert.deepEqual(contract.rects,contract.expected);
 assert.ok(contract.topSamples.every(t=>t.holes===0&&t.overhang===0&&t.maxError<=.51),'snow matches analytic ground to half a world pixel');
 assert.deepEqual(contract.bench,{x:7200,y:523,texture:'bench',textureWidth:90,textureHeight:44,width:24,height:32,offset:[33,12],enable:true,visible:false});
 assert.ok(contract.depth.enemies.every(d=>d<contract.depth.tanya));assert.ok(contract.depth.food.every(d=>d<Math.min(...contract.depth.enemies)));
 for(const [i,p] of contract.platforms.entries()){const raw=contract.expected.at(-contract.platforms.length+i);assert.deepEqual([p.x,p.y,p.width,p.height],raw)}
 const resize=[];
 for(const [width,height] of [[375,667],[390,844],[430,932],[844,390],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(70);
  resize.push(await page.evaluate(()=>{const s=game.scene.getScene('play');return s.children.list.filter(o=>o.getData('environmentVisual')).map(o=>[o.x,o.y,o.displayWidth,o.displayHeight])}));
 }
 assert.ok(resize.every(r=>JSON.stringify(r)===JSON.stringify(resize[0])),'world art stays fixed across resize');
 const run=JSON.parse(readFileSync('/tmp/tanya-v3-runs.json'))[0];
 // Actual full-run poses, not a staged alternate level or new input policy.
 for(const percent of [10,30,50,70,90]){
  const x=(10730-150)*percent/100,p=run.trajectory.reduce((best,q)=>Math.abs(q.x-x)<Math.abs(best.x-x)?q:best);
  await page.evaluate(({p})=>{
   game.scene.start('play');game.scene.getScene('play').sys.sceneUpdate=Object.getPrototypeOf(game.scene.getScene('play')).update;let now=performance.now();for(let i=0;i<4;i++)game.headlessStep(now+=1000/60,1000/60);
   const s=game.scene.getScene('play');s.physics.pause();s.sys.sceneUpdate=()=>{};game.loop.stop();
   for(const kind of ['pigeons','scooters','grannies'])for(const [i,a] of s[kind].entries())if(p.hazards?.[kind][i]){const q=p.hazards[kind][i];a.sprite.body.reset(q.x,q.y)}
   for(const body of [...s.physics.world.staticBodies.entries])if(['food','lipton'].includes(body.gameObject.texture?.key)&&!p.remaining.some(q=>q.kind===body.gameObject.texture.key&&q.x===body.gameObject.x&&q.y===body.gameObject.y))body.gameObject.destroy();
   s.energy=p.energy;s.foodCount=p.food;s.updateHud();document.querySelector('#distance').textContent=Math.round(p.x/10580*100)+'% пути';document.querySelector('#hint').hidden=true;
   s.tanya.body.reset(p.x,p.y-26);s.cameras.main.scrollX=p.cameraX;s.cameras.main.scrollY=p.cameraY;
   game.renderer.preRender();game.scene.render(game.renderer);game.renderer.postRender();
  },{p});
  assert.match(await page.locator('#distance').innerText(),new RegExp('^'+percent+'%'));
  await page.screenshot({path:`${output}/${percent}.png`});
 }
 const replay=await page.evaluate(()=>{const s=game.scene.getScene('play');return {images:s.children.list.filter(o=>o.getData('environmentVisual')).length,generated:s.textures.getTextureKeys().filter(k=>k.startsWith('winter-art:')).length}});
 assert.deepEqual(replay,{images:contract.visualCount,generated:contract.generated});
 await page.goto('http://localhost:5173/?debugEnvironment=1');await page.waitForSelector('canvas');
 await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game});await page.waitForFunction(()=>game.scene.getScene('play')?.tanya?.body);
 assert.equal(await page.evaluate(()=>game.scene.getScene('play').children.list.filter(o=>o.getData('environmentDebug')).length),1);
 await page.evaluate(()=>{game.loop.stop();const s=game.scene.getScene('play');s.physics.pause();s.sys.sceneUpdate=()=>{};s.cameras.main.scrollX=4100;game.renderer.preRender();game.scene.render(game.renderer);game.renderer.postRender()});
 await page.screenshot({path:`${output}/debug.png`});
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 writeFileSync(`${output}/visual-contract.json`,JSON.stringify({contract,resizeStates:resize.length,replay,errors,failed},null,2));
 console.log('PASS: unchanged collision rectangles and bench trigger; no physics on art; all terrain top pixels match, five portrait snapshots, resize, replay and dev debug overlay');
}finally{await browser.close()}
