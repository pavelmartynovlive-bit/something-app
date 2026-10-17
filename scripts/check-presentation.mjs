// Presentation-only checks. Isolated screenshots are composed at the same world pose;
// full-run physics/visibility measurements live in audit-level.mjs.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { existsSync, writeFileSync } from 'node:fs';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
const base=process.env.LEVEL_URL||'http://localhost:5173/';
const results=[];
try {
 for(const [view,width,height,mobile] of [['a',667,375,true],['b',667,375,true],['c',390,844,true],['c',375,667,true],['c',1280,720,false]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:mobile});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=new URL(base);url.searchParams.set('view',view);await page.goto(url.href);await page.waitForSelector('canvas');
  await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game;});
  await page.waitForFunction(()=>game.isRunning&&game.scene.getScene('play')?.tanya?.body);
  const state=await page.evaluate(()=>{
   const s=game.scene.getScene('play'),c=s.cameras.main,b=s.tanya.body,r=document.querySelector('#game').getBoundingClientRect();
   const hud=[...document.querySelectorAll('#hud .energy-card,#hud .goal,#install')].map(e=>{const b=e.getBoundingClientRect();return{left:b.left,right:b.right,top:b.top,bottom:b.bottom};});
   return{variant:document.body.dataset.view,selected:document.querySelector('#presentation-nav [aria-current]').dataset.view,frame:{width:r.width,height:r.height,left:r.left,right:r.right},zoom:c.zoom,framing:s.framing,body:{width:b.width,height:b.height,scaleX:s.tanya.scaleX,scaleY:s.tanya.scaleY},hud,manifest:document.querySelector('link[rel="manifest"]').getAttribute('href')};
  });
  assert.equal(state.variant,view);assert.equal(state.selected,view);assert.deepEqual(state.body,{width:24,height:50,scaleX:1,scaleY:1});
  assert.ok(state.hud.every(b=>b.left>=state.frame.left-.1&&b.right<=state.frame.right+.1&&b.top>=0&&b.bottom<height));
  const expected=view==='a'?height/490:view==='b'?height/490*1.4:state.frame.width/340;assert.ok(Math.abs(state.zoom-expected)<.01);
  if(view==='c')assert.match(state.manifest,/manifest-portrait/);
  const box=await page.locator('canvas').boundingBox();if(mobile)await page.touchscreen.tap(box.x+box.width*.65,box.y+box.height*.55);else await page.keyboard.press('Space');
  if(mobile){await page.waitForFunction(()=>document.querySelector('#hint').hidden);}
  await page.evaluate(()=>{window.stepCallback=game.loop.callback;game.loop.stop();});
  for(const [name,x,y] of [['street',500,390],['awning',5120,344],['terraces',10800,486]]){
   await page.evaluate(({x,y})=>{
    const s=game.scene.getScene('play'),c=s.cameras.main,f=s.framing;s.physics.pause();s.tanya.body.reset(x,y);
    c.scrollX=Math.max(0,x-c.width/c.zoom*f.anchorX-(f.followX===12?25:63));c.scrollY=f.baseY+Math.max(-40,Math.min(0,(y-416)*.22));
    document.querySelector('#hint').hidden=true;game.step(performance.now(),1000/60);
   },{x,y});
   if(width===667||width===390)await page.screenshot({path:`/tmp/tanya-view-${view}-${name}.png`});
  }
  if(view==='c'&&mobile&&width===390){
   await page.setViewportSize({width:844,height:390});await page.waitForTimeout(100);
   await page.evaluate(()=>{game.loop.start(stepCallback);});
   await page.waitForFunction(()=>game.scene.getScene('play').physics.world.isPaused&&game.scene.getScene('play').wasPortrait);
   assert.equal(await page.locator('#portrait').evaluate(e=>getComputedStyle(e).display),'flex');
   await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>!game.scene.getScene('play').physics.world.isPaused);
   assert.equal(await page.locator('#portrait').evaluate(e=>getComputedStyle(e).display),'none');
  }
  assert.deepEqual(errors,[]);results.push({...state,viewport:{width,height},errors});await page.close();
 }
 for(const view of ['a','b']){
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});await page.goto(`${base}?view=${view}`);await page.waitForSelector('canvas');
  assert.equal(await page.locator('#portrait').evaluate(e=>getComputedStyle(e).display),'flex');await page.close();
 }
 // Links select a new presentation and explicitly start a fresh run.
 const page=await browser.newPage({viewport:{width:667,height:375}});await page.goto(base);await page.locator('#presentation-nav a[data-view="b"]').click();await page.waitForURL('**view=b');assert.equal(await page.locator('body').getAttribute('data-view'),'b');await page.close();
 writeFileSync('/tmp/tanya-presentation-ui.json',JSON.stringify(results,null,2));console.log('PASS: A/B/C framing, HUD bounds, unscaled collision bodies, touch, orientation guards/rotation, query navigation, portrait manifest');
}finally{await browser.close();}
