import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 await page.goto('http://localhost:5173');await page.waitForSelector('canvas');
 await page.evaluate(async()=>{window.game=(await import('/src/main.ts')).game;window.cfg=(await import('/src/settings.ts')).settings});await page.waitForFunction(()=>game.scene.getScene('play')?.tanya?.body);
 await page.evaluate(()=>{game.loop.stop();const s=game.scene.getScene('play');s.physics.pause();s.sys.sceneUpdate=()=>{};document.querySelector('#hint').hidden=true});
 const samples=[];
 for(const [width,height] of [[390,844],[375,667],[393,852],[430,932],[375,896],[844,390],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);
  const result=await page.evaluate(()=>{
   const s=game.scene.getScene('play'),c=s.cameras.main,V=c.width/c.zoom,H=c.height/c.zoom,T=cfg.levelWidth-V;
   const original={x:s.tanya.x,y:s.tanya.y,width:s.tanya.body.width,height:s.tanya.body.height,gravity:s.physics.world.gravity.y};
   const images=s.children.list.filter(o=>o.texture?.key.startsWith('winter:'));
   const poses=[];
   for(const fraction of [0,.1,.25,.5,.75,.9,1]){
    c.scrollX=T*fraction;
    poses.push({fraction,layers:images.map(o=>({key:o.texture.key,type:o.type,depth:o.depth,body:!!o.body,width:o.displayWidth,height:o.displayHeight,scaleX:o.scaleX,scaleY:o.scaleY,sourceWidth:o.frame.realWidth,sourceHeight:o.frame.realHeight,factorX:o.scrollFactorX,factorY:o.scrollFactorY,left:o.x-c.scrollX*o.scrollFactorX,right:o.x+o.displayWidth-c.scrollX*o.scrollFactorX,top:o.y,bottom:o.y+o.displayHeight,alpha:o.alpha}))});
   }
   const y=images.map(o=>o.y);c.scrollY+=40;
   const verticalStable=images.every((o,i)=>o.y-c.scrollY*o.scrollFactorY===y[i]);c.scrollY-=40;
   const after={x:s.tanya.x,y:s.tanya.y,width:s.tanya.body.width,height:s.tanya.body.height,gravity:s.physics.world.gravity.y};
   const gameplayMinDepth=Math.min(...s.children.list.filter(o=>!images.includes(o)).map(o=>o.depth));
   return {canvas:{width:c.width,height:c.height,zoom:c.zoom},viewport:{width:V,height:H},travel:T,original,after,verticalStable,gameplayMinDepth,poses};
  });
  assert.deepEqual(result.original,result.after);assert.equal(result.verticalStable,true);
  for(const pose of result.poses){assert.equal(pose.layers.length,5);assert.equal(new Set(pose.layers.map(l=>l.factorX)).size,5);for(const l of pose.layers){assert.equal(l.type,'Image');assert.equal(l.body,false);assert.equal(l.factorY,0);assert.equal(l.scaleX,l.scaleY);assert.ok(l.depth<result.gameplayMinDepth);assert.ok(l.left<=1e-6&&l.right>=result.viewport.width-1e-6,'horizontal coverage '+l.key);}
   const sky=pose.layers[0];assert.ok(sky.top<=0&&sky.bottom>=result.viewport.height-1e-6,'opaque sky fills viewport');}
  samples.push(result);
 }
 assert.deepEqual(samples[0].poses,samples.at(-1).poses,'same composition after rotate/return');
 // Replaying must keep exactly five backgrounds and avoid destroyed references.
 const replay=await page.evaluate(()=>{game.scene.start('play');let now=performance.now();for(let i=0;i<5;i++)game.headlessStep(now+=1000/60,1000/60);const s=game.scene.getScene('play');s.physics.pause();s.sys.sceneUpdate=()=>{};return s.children.list.filter(o=>o.texture?.key.startsWith('winter:')).length});assert.equal(replay,5);
 // Draw actual renderer at representative start/middle/end positions.
 for(const fraction of [0,.25,.5,.75,1]){
  await page.evaluate(fraction=>{const s=game.scene.getScene('play'),c=s.cameras.main;c.scrollX=(cfg.levelWidth-c.width/c.zoom)*fraction;c.scrollY=s.framing.baseY;game.renderer.preRender();game.scene.render(game.renderer);game.renderer.postRender()},fraction);
  await page.screenshot({path:`/tmp/winter-background-${Math.round(fraction*100)}.png`});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);writeFileSync('/tmp/winter-background-check.json',JSON.stringify({samples,errors,failed,replay},null,2));console.log('PASS: five non-physics Images, full horizontal/sky coverage 0–100%, no wrapping, separate factors, fixed vertical parallax, proportional scale, seven resize states and replay');
}finally{await browser.close()}
