import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), headless: true, args: ['--no-sandbox'] });
try {
 const page = await browser.newPage({ viewport: { width: 667, height: 375 }, hasTouch: true });
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.LEVEL_URL || 'http://localhost:5173'); await page.waitForFunction(()=>!!document.querySelector('canvas'));
 await page.evaluate(async()=>{
  window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;
  const c=await import('/src/settings.ts');window.cfg=c.settings;window.choices=c.routeChoices;window.floorAt=c.groundYAt;
  window.haz=await import('/src/hazard-shapes.ts');
 });
 await page.waitForFunction(()=>game.isRunning&&game.scene.getScene('play')?.tanya?.body);
 await page.evaluate(()=>{
  game.loop.stop();window.simTime=performance.now();window.tick=(n=1)=>{for(let i=0;i<n;i++){simTime+=1000/60;game.headlessStep(simTime,1000/60);}};
  window.key=d=>window.dispatchEvent(new KeyboardEvent(d?'keydown':'keyup',{key:' ',code:'Space',keyCode:32,bubbles:true}));
  window.restart=()=>{key(false);game.scene.start('play');tick(4);const s=game.scene.getScene('play');s.hit=Object.getPrototypeOf(s).hit;s.respawn=Object.getPrototypeOf(s).respawn;return s;};
  window.place=(s,x,y=floorAt(x)-26)=>{s.tanya.body.reset(x,y);s.tanya.setVelocity(0,0);tick(2);};
 });
 const result=await page.evaluate(()=>{
  const scooters=[];
  for(const tired of [false,true])for(const lead of tired?[65,75,85,105,130,155,180,205,230]:[100,130,145,160,175,190,220,250]){
   const s=restart();place(s,cfg.scooters[0]-900);if(tired)s.changeEnergy(-100);tick(2);
   const hits=[];const base=Object.getPrototypeOf(s).hit;s.hit=function(d){const ok=base.call(this,d);if(ok)hits.push(d);return ok;};
   let jumped=false,visibleAt=null,jumpedAt=null,visibleDistance=null;
   for(let f=0;f<190;f++){
    const sc=s.scooters[0].sprite,b=sc.body,c=s.cameras.main;
    if(visibleAt===null&&b.left<c.scrollX+c.width/c.zoom){visibleAt=s.time.now;visibleDistance=sc.x-s.tanya.x;}
    if(!jumped&&sc.x-s.tanya.x<lead){key(true);jumped=true;jumpedAt=s.time.now;}
    tick();key(false);
   }
   scooters.push({tired,lead,hits,visibleDistance,reactionSeconds:(jumpedAt-visibleAt)/1000});
  }
  const benches=[];
  for(const jump of [false,true]){
   const s=restart();place(s,cfg.benches[0]-190);s.changeEnergy(-100);tick(2);let once=false,paused=false;
   const count=()=>s.physics.world.staticBodies.entries.filter(b=>b.gameObject.texture?.key==='lipton').length;const before=count();
   for(let f=0;f<210;f++){if(jump&&!once&&cfg.benches[0]-s.tanya.x<100){key(true);once=true;}tick();key(false);paused ||= s.restRemaining>0;}
   benches.push({jump,paused,energy:s.energy,bottles:before-count()});
  }
  const misses=[];
  for(const choice of choices){
   const s=restart();place(s,choice.entrance-310);let attempted=false,resets=0,maxBottom=0;
   s.respawn=()=>{resets++;};
   for(let f=0;f<170;f++){if(!attempted&&s.tanya.x>=choice.entrance-280){key(true);attempted=true;}tick();key(false);maxBottom=Math.max(maxBottom,s.tanya.body.bottom);}
   misses.push({kind:'early upper miss',entrance:choice.entrance,x:s.tanya.x,bottom:s.tanya.body.bottom,grounded:s.tanya.body.blocked.down,resets,maxBottom});
  }
  for(const pocket of cfg.interruptions){
   const s=restart();place(s,pocket.start-100);let recovered=false,resets=0,maxBottom=0,contactTime=null;
   s.respawn=()=>{resets++;};
   for(let f=0;f<180;f++){
    const b=s.tanya.body;if(!recovered&&b.blocked.down&&b.bottom>cfg.floorY+20){key(true);recovered=true;contactTime=s.time.now;}
    tick();key(false);maxBottom=Math.max(maxBottom,b.bottom);
   }
   misses.push({kind:'missed shallow interruption',entrance:pocket.start,x:s.tanya.x,bottom:s.tanya.body.bottom,grounded:s.tanya.body.blocked.down,resets,maxBottom,recovered,contactTime});
  }
  const upperMistakes=[];
  for(const index of [0,1]){
   const s=restart(),p=cfg.routePlatforms[index];const hits=[];const base=Object.getPrototypeOf(s).hit;
   s.hit=function(d){const ok=base.call(this,d);if(ok)hits.push(d);return ok;};
   place(s,p.x+110,p.y-26);let resets=0;s.respawn=()=>{resets++;};
   for(let f=0;f<160;f++)tick();
   upperMistakes.push({index,hits,resets,x:s.tanya.x,bottom:s.tanya.body.bottom,grounded:s.tanya.body.blocked.down});
  }
  const edgeReward=[];
  for(const secondTap of [false,true]){
   const s=restart(),p=cfg.routePlatforms[1];place(s,p.x-110);key(true);tick();key(false);let jumped=false;
   for(let f=0;f<150;f++){if(secondTap&&!jumped&&s.tanya.body.blocked.down&&Math.abs(s.tanya.body.bottom-p.y)<2&&s.tanya.x>=p.x+p.width-80){key(true);jumped=true;}tick();key(false);}
   edgeReward.push({secondTap,food:s.foodCount,bottom:s.tanya.body.bottom});
  }
  const passUnder=[];
  for(const p of cfg.routePlatforms){
   const s=restart();place(s,p.x-80);let blocked=0;for(let f=0;f<140&&s.tanya.x<p.x+p.width+80;f++){tick();blocked+=Number(s.tanya.body.blocked.right);}
   passUnder.push({x:p.x,blocked,bottom:s.tanya.body.bottom,upperBirdsFlew:s.pigeons.some(g=>g.perchY===p.y&&Math.abs(g.sprite.x-p.x)<p.width&&g.flying)});
  }
  const solidTerraces=cfg.groundSpans.filter(p=>p.start>=17300&&p.start<18870).map(p=>{
   const s=restart();const body=s.physics.world.staticBodies.entries.find(b=>b.gameObject.type==='Rectangle'&&Math.abs(b.left-p.start)<.01&&Math.abs(b.top-p.y)<.01);
   return{start:p.start,top:p.y,filledTo:body?.bottom};
  });
  const oneWay=(()=>{const s=restart(),p=cfg.routePlatforms[0];place(s,p.x+100);key(true);tick();key(false);let hitHead=false,landed=false;for(let f=0;f<60;f++){tick();hitHead ||= s.tanya.body.blocked.up;landed ||= s.tanya.body.blocked.down&&Math.abs(s.tanya.body.bottom-p.y)<2;}return{hitHead,landed};})();
  const coyote=[];for(const frames of [5,12]){
   const s=restart(),p=cfg.routePlatforms[1];place(s,p.x+p.width-20,p.y-26);let guard=0;while(s.tanya.body.blocked.down&&guard++<30)tick();tick(frames-1);key(true);tick();key(false);coyote.push({frames,velocity:s.tanya.body.velocity.y});
  }
  const buffer=(()=>{const s=restart();place(s,100,cfg.floorY-130);while(s.tanya.body.bottom<cfg.floorY-30)tick();key(true);tick();key(false);let fired=false;for(let f=0;f<12;f++){tick();fired ||= s.tanya.body.velocity.y<0;}return fired;})();
  const fatigueTransition=(()=>{const s=restart();key(true);tick();key(false);tick(10);s.changeEnergy(-100);tick(6);const air=s.tanya.body.velocity.x;while(!s.tanya.body.blocked.down)tick();tick(2);return{air,ground:s.tanya.body.velocity.x};})();
  const silhouette=[];const scene=restart();
  for(const kind of ['scooter','pigeons','granny']){
   const source=scene.textures.get(kind).getSourceImage(),c=document.createElement('canvas');c.width=source.width;c.height=source.height;const ctx=c.getContext('2d');ctx.drawImage(source,0,0);const pixels=ctx.getImageData(0,0,c.width,c.height).data;let outside=0;
   for(const r of haz.hazardShapes[kind])for(let y=r.y;y<r.y+r.height;y++)for(let x=r.x;x<r.x+r.width;x++)if(!pixels[(y*c.width+x)*4+3])outside++;
   silhouette.push({kind,outside});
  }
  return{scooters,benches,misses,upperMistakes,edgeReward,passUnder,solidTerraces,oneWay,coyote,buffer,fatigueTransition,silhouette};
 });
 fs.writeFileSync('/tmp/tanya-ground-collision-audit.json',JSON.stringify(result,null,2));
 assert.equal(errors.length,0);
 for(const m of result.misses){assert.equal(m.resets,0);assert.ok(m.grounded);assert.ok(m.x>m.entrance+400);assert.ok(m.maxBottom<=464);if(m.kind==='missed shallow interruption')assert.ok(m.recovered&&m.maxBottom===464);}
 assert.ok(result.upperMistakes.every(m=>m.resets===0&&m.grounded&&m.bottom===440));assert.ok(result.upperMistakes[0].hits.includes(6));assert.ok(result.edgeReward[1].food>result.edgeReward[0].food);
 assert.ok(result.passUnder.every(p=>p.blocked===0&&p.bottom===440&&!p.upperBirdsFlew));
 assert.ok(result.solidTerraces.every(p=>p.filledTo===660));assert.ok(result.oneWay.landed&&!result.oneWay.hitHead);
 assert.equal(result.fatigueTransition.air,330);assert.equal(result.fatigueTransition.ground,190);
 assert.ok(!result.benches.find(b=>b.jump).paused);assert.ok(result.benches.find(b=>!b.jump).paused);assert.equal(result.benches.find(b=>b.jump).bottles,1);assert.equal(result.benches.find(b=>!b.jump).bottles,0);
 assert.ok(result.scooters.filter(s=>s.tired&&!s.hits.length).length>=3);assert.ok(result.scooters.filter(s=>!s.tired&&!s.hits.length).length>=3);
 assert.ok(result.silhouette.every(s=>s.outside===0));assert.ok(result.coyote[0].velocity<0&&result.coyote[1].velocity>=0);assert.ok(result.buffer);
 await page.evaluate(()=>restart());await page.touchscreen.tap(340,180);assert.ok(await page.evaluate(()=>{tick(2);return game.scene.getScene('play').tanya.body.velocity.y;})<0);
 await page.evaluate(()=>{restart();window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',code:'ArrowUp',keyCode:38,bubbles:true}));tick(2);});assert.ok(await page.evaluate(()=>game.scene.getScene('play').tanya.body.velocity.y)<0);
 const endings=await page.evaluate(()=>{
  const results=[];for(const food of [cfg.requiredFood-1,cfg.requiredFood,cfg.bonusFood]){const s=restart();s.foodCount=food;s.feedCat();tick(100);results.push({food,title:document.querySelector('#end-title').textContent,description:document.querySelector('#end-description').textContent,icon:document.querySelector('.cat-icon').textContent,visible:!document.querySelector('#ending').hidden});}
  document.querySelector('#replay').click();tick(4);return{results,replay:game.scene.getScene('play').foodCount,hud:document.querySelector('#food-count').textContent,hidden:document.querySelector('#ending').hidden};
 });
 assert.ok(endings.results.every(e=>e.visible));assert.match(endings.results[0].description,/Не хватило 1/);assert.match(endings.results[1].title,/накормлен/);assert.match(endings.results[2].title,/пир/);assert.notEqual(endings.results[1].icon,endings.results[2].icon);assert.equal(endings.replay,0);assert.equal(endings.hud,'Корм: 0');assert.ok(endings.hidden);
 assert.ok(await page.evaluate(()=>[...document.querySelectorAll('#hud button, #hud .goal, #hud .energy-card')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0;})));
 await page.screenshot({path:'/tmp/tanya-mobile-hud.png'});
 console.log(JSON.stringify(result,null,2));console.log('PASS: solid terraces, safe missed gaps/detours, visible hazard masks, bench tradeoff, one-way/pass-under, coyote/buffer, touch/ArrowUp, endings, mobile HUD');
} finally {await browser.close();}
