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
  const url=new URL('assets/characters/tanya/tanya-stand.png',document.baseURI).href;
  const cached=await caches.match(url),blob=await cached.blob(),image=await createImageBitmap(blob);
  return {cached:!!cached,bytes:blob.size,width:image.width,height:image.height};
 });
 assert.ok(asset.cached&&asset.bytes>0);assert.equal(asset.width,1024);assert.equal(asset.height,1536);
 await context.setOffline(true);await page.reload();await page.waitForSelector('canvas');
 const offline=await page.evaluate(async()=>{const r=await fetch(new URL('assets/characters/tanya/tanya-stand.png',document.baseURI));const im=await createImageBitmap(await r.blob());return {ok:r.ok,width:im.width,height:im.height}});
 assert.deepEqual(offline,{ok:true,width:1024,height:1536});assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 writeFileSync('docs/tanya/production-check.json',JSON.stringify({asset,offline,errors,failed},null,2)+'\n');console.log('PASS: production portrait canvas, hero PNG decoded, PWA precache and offline reload');
}finally{await browser.close()}
