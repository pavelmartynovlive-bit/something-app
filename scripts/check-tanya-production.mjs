import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
 const page=await context.newPage(),errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 const base=process.env.PRODUCTION_URL||'http://localhost:4173/';
 await page.goto(base);await page.waitForSelector('canvas');
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const asset=await page.evaluate(async()=>{
  const root='assets/characters/tanya/animations/';
  const cached=await caches.match(new URL(root+'tanya-animation-sheet.png',document.baseURI).href),blob=await cached.blob(),image=await createImageBitmap(blob);
  const contextImage=await caches.match(new URL(root+'tanya-context-sheet.png',document.baseURI).href);const contextBitmap=await createImageBitmap(await contextImage.blob());
  const contextData=await(await caches.match(new URL(root+'tanya-context-data.json',document.baseURI).href)).json();
  const metadata=await caches.match(new URL(root+'tanya-animation-data.json',document.baseURI).href),data=await metadata.json();
  return {cached:!!cached,bytes:blob.size,width:image.width,height:image.height,frames:data.frames.length,animations:data.animations.length,context:{width:contextBitmap.width,height:contextBitmap.height,frames:contextData.frames.length,animations:contextData.animations.length}};
 });
 assert.ok(asset.cached&&asset.bytes>0);assert.equal(asset.width,1536);assert.equal(asset.height,1024);assert.equal(asset.frames,20);assert.equal(asset.animations,6);assert.deepEqual(asset.context,{width:1536,height:1024,frames:20,animations:6});
 await context.setOffline(true);await page.reload();await page.waitForSelector('canvas');
 const offline=await page.evaluate(async()=>{
  const root=new URL('assets/characters/tanya/animations/',document.baseURI);
  const r=await fetch(new URL('tanya-animation-sheet.png',root));const im=await createImageBitmap(await r.blob());
  const d=await(await fetch(new URL('tanya-animation-data.json',root))).json();
  const context=await(await fetch(new URL('tanya-context-data.json',root))).json();const contextImage=await createImageBitmap(await(await fetch(new URL('tanya-context-sheet.png',root))).blob());
  return {ok:r.ok,width:im.width,height:im.height,frames:d.frames.length,contextFrames:context.frames.length,contextWidth:contextImage.width};
 });
 assert.deepEqual(offline,{ok:true,width:1536,height:1024,frames:20,contextFrames:20,contextWidth:1536});assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 writeFileSync('docs/tanya/production-check.json',JSON.stringify({asset,offline,errors,failed},null,2)+'\n');console.log('PASS: production portrait canvas, 40-frame base/context PNG/metadata precache and offline reload');
}finally{await browser.close()}
