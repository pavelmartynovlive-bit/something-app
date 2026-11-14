import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--no-sandbox'] });
try {
 const context = await browser.newContext({...devices['iPhone 13']});
 const page = await context.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173/');await page.waitForSelector('#loading',{state:'hidden'});
 await page.evaluate(async()=>{
  window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;
  window.cfg=(await import('/src/settings.ts')).settings;
  window.floorAt=(await import('/src/settings.ts')).groundYAt;
  window.audio=(await import('/src/audio-manager.ts')).audioManager;
  game.loop.stop();window.now=performance.now();window.tick=(n=1)=>{for(let i=0;i<n;i++)game.step(now+=1000/60,1000/60);};
 });
 const cases=await page.evaluate(()=>{
  const counts={feed:0,meow:0};audio.playCatFeed=()=>counts.feed++;audio.playCatMeow=()=>counts.meow++;
  const result=[];
  for(const food of [cfg.requiredFood-1,cfg.requiredFood,cfg.bonusFood]){
   game.scene.start('play');tick(4);counts.feed=counts.meow=0;
   const scene=game.scene.getScene('play'),body=scene.tanya.body,x=cfg.levelWidth-150-79,floor=floorAt(x);
   // Cross the original finish in midair, with pending movement and a hit pose.
   body.reset(x,floor-120);body.position.set(x-body.halfWidth,floor-150);body.updateCenter();body.setVelocity(240,-250);
   scene.tanyaVisual.react('scooter');scene.foodCount=food;
   scene.cameras.main.scrollX=cfg.levelWidth-480;
   tick();const entryEnergy=scene.energy,entryFood=scene.foodCount;
   const states=[scene.catFinale.state],frames=new Map();
   const xAtEntry=scene.tanya.x,initiallyHidden=document.querySelector('#ending').hidden;
   for(let i=0;i<300;i++){
    window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',keyCode:32,bubbles:true}));
    scene.feedCat(); // duplicate contacts must not restart the scene or sound.
    tick();window.dispatchEvent(new KeyboardEvent('keyup',{key:' ',code:'Space',keyCode:32,bubbles:true}));
    if(states.at(-1)!==scene.catFinale.state)states.push(scene.catFinale.state);
    const key=scene.catFinale.state;if(!frames.has(key))frames.set(key,new Set());frames.get(key).add(scene.catFinale.sprite.frame.name);
   }
   result.push({food,states,frames:[...frames].map(([k,v])=>[k,[...v]]),finished:scene.finished,
    stable:scene.tanya.x===xAtEntry&&body.velocity.x===0&&body.velocity.y===0&&scene.energy===entryEnergy&&scene.foodCount===entryFood,
    counts:{...counts},initiallyHidden,endingVisible:!document.querySelector('#ending').hidden,
    state:scene.tanyaVisual.state,collider:[body.width,body.height],catBody:!!scene.catFinale.sprite.body,
    title:document.querySelector('#end-title').textContent,objects:scene.children.list.filter(o=>o.getData('catFinale')).length});
  }
  const restarts=[];for(let i=0;i<4;i++){game.scene.start('play');tick(4);const s=game.scene.getScene('play');restarts.push({state:s.catFinale.state,hidden:document.querySelector('#ending').hidden,catCount:s.children.list.filter(o=>o.getData('catFinale')).length,textures:s.textures.getTextureKeys().length});}
  return {result,restarts};
 });
 for(const r of cases.result){
  assert.ok(r.finished&&r.stable&&r.initiallyHidden&&r.endingVisible);assert.deepEqual(r.collider,[24,50]);assert.equal(r.catBody,false);assert.equal(r.objects,1);
  if(r.food<80){assert.deepEqual(r.states,['waiting']);assert.deepEqual(r.counts,{feed:0,meow:1});assert.equal(r.title,'Котику не хватило корма');}
  else {assert.deepEqual(r.states,['finale-enter','finale-sniff','finale-eat','finale-happy','finale-complete']);assert.deepEqual(r.counts,{feed:1,meow:1});assert.equal(r.state,'idle');
   for(const phase of ['finale-sniff','finale-eat'])assert.equal(r.frames.find(([key])=>key===phase)[1].length,4);
   assert.equal(r.frames.find(([key])=>key==='finale-happy')[1].length,3);
  }
 }
 assert.ok(cases.restarts.every(r=>r.state==='waiting'&&r.hidden&&r.catCount===1&&r.textures===cases.restarts[0].textures));
 // Check framing and separation over three portrait sizes while feeding.
 const views=[];
 for(const[width,height]of[[320,568],[390,844],[430,932]]){
  await page.setViewportSize({width,height});
  views.push(await page.evaluate(()=>{
   game.scene.start('play');tick(5);const s=game.scene.getScene('play'),b=s.tanya.body,x=cfg.levelWidth-150-79,f=floorAt(x);
   b.reset(x,f-26);b.position.set(x-b.halfWidth,f-b.height);b.updateCenter();b.blocked.down=true;
   s.foodCount=cfg.requiredFood;s.cameras.main.scrollX=cfg.levelWidth-480;tick(120);
   const c=s.cameras.main,t=s.tanyaVisual.sprite.getBounds(),cat=s.catFinale.sprite.getBounds();
   // Tanya frames have transparent padding: use conservative opaque extents.
   const left=s.tanya.x-s.tanyaVisual.cameraLeftInset,right=cat.right;
   return {visible:left>=c.scrollX&&right<=c.scrollX+c.width/c.zoom,
    floorVisible:s.tanya.body.bottom>=c.scrollY&&s.tanya.body.bottom<c.scrollY+c.height/c.zoom,
    bowlLeft:s.catFinale.sprite.x+(24-160)*.24,tanyaRight:s.tanya.x+33,
    state:s.catFinale.state,endingHidden:document.querySelector('#ending').hidden};
  }));
 }
 assert.ok(views.every(v=>v.visible&&v.floorVisible&&v.bowlLeft>v.tanyaRight&&v.state==='finale-eat'&&v.endingHidden));
 await page.evaluate(async()=>{ for(let i=0;i<3;i++){await new Promise(requestAnimationFrame);tick();} });
 await page.screenshot({path:'work/cat-finale-portrait.png'});
 // Rotation must freeze the reward clock, then resume to completion.
 const pausedAt=await page.evaluate(()=>game.scene.getScene('play').catFinale.elapsed);
 await page.setViewportSize({width:932,height:430});
 await page.evaluate(()=>tick(180));
 assert.equal(await page.evaluate(()=>game.scene.getScene('play').catFinale.elapsed),pausedAt);
 await page.setViewportSize({width:430,height:932});
 await page.evaluate(()=>tick(240));
 assert.ok(await page.evaluate(()=>game.scene.getScene('play').catFinale.state==='finale-complete'&&!document.querySelector('#ending').hidden));
 assert.deepEqual(errors,[]);console.log('PASS: success/fail/feast, complete ordered animation sequence, single feed/meow, grounded idle Tanya, blocked jumps, 3 portrait framings, stable restart objects/textures.');
}finally{await browser.close();}
