import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--autoplay-policy=user-gesture-required']});
try {
 const context=await browser.newContext({...devices['iPhone 13']}), page=await context.newPage(), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.musicStarts=[];
  const create=AudioContext.prototype.createBufferSource;
  AudioContext.prototype.createBufferSource=function(...args){
   const source=create.apply(this,args),start=source.start.bind(source);
   source.start=(...args)=>{if(source.loop)window.musicStarts.push(source.buffer.duration);return start(...args);};return source;
  };
 });
 await page.goto('http://localhost:4173/');await page.waitForSelector('#loading',{state:'hidden'});
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const cached=await page.evaluate(async()=>{
  const urls=(await Promise.all((await caches.keys()).map(async k=>(await(await caches.open(k)).keys()).map(r=>r.url)))).flat();
  return urls.filter(u=>u.includes('/audio/music/'));
 });
 assert.equal(cached.length,6,'all three tracks and their fallback formats cached');
 await context.setOffline(true);await page.reload();await page.waitForSelector('#loading',{state:'hidden'});
 await page.tap('#music-open');await page.waitForFunction(()=>musicStarts.length>0);
 for(const[id,duration]of[['pixel-meadow-calm',48],['pixel-meadow',48],['bitcade-overworld',51.2]]){
  await page.selectOption('#music-track',id);
  await page.waitForFunction(duration=>Math.abs(musicStarts.at(-1)-duration)<.03,duration);
  await page.waitForFunction(()=>document.querySelector('#music-status').textContent.includes('Играет'));
 }
 const credits=await page.evaluate(async()=>{const r=await fetch('audio-credits.html');return r.ok&&(await r.text()).includes('CC BY 4.0');});
 assert.ok(credits,'required music attribution available offline');assert.deepEqual(errors,[]);
 console.log('PASS: production offline reload, all three looped tracks play from cache, MP3 fallbacks cached and required credits available.');
}finally{await browser.close();}
