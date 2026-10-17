import {chromium} from 'playwright';import {readFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});await page.goto('http://localhost:5173');await page.waitForSelector('canvas');await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.ts"]').src)).game});await page.waitForFunction(()=>game.scene.getScene('play')?.tanya?.body);
const run=JSON.parse(readFileSync('/tmp/tanya-v3-runs.json'))[0];let shots=[];
for(const [i,x] of [480,1400,2180,3240,4440,5320,6230,7050,8410,9450].entries()){
const p=run.trajectory.reduce((best,q)=>Math.abs(q.x-x)<Math.abs(best.x-x)?q:best);
await page.evaluate(({p})=>{game.loop.stop();game.scene.start('play');for(let i=0;i<4;i++)game.headlessStep(performance.now()+i*17,1000/60);const s=game.scene.getScene('play');s.physics.pause();
for(const kind of ['pigeons','scooters','grannies'])for(const [i,a] of s[kind].entries())if(p.hazards?.[kind][i]){const q=p.hazards[kind][i];a.sprite.body.reset(q.x,q.y)}
for(const body of [...s.physics.world.staticBodies.entries])if(['food','lipton'].includes(body.gameObject.texture?.key)&&!p.remaining.some(q=>q.kind===body.gameObject.texture.key&&q.x===body.gameObject.x&&q.y===body.gameObject.y))body.gameObject.destroy();
s.energy=p.energy;s.foodCount=p.food;s.updateHud();document.querySelector('#distance').textContent=Math.round(p.x/10580*100)+'% пути';s.tanya.body.reset(p.x,p.y-26);s.cameras.main.scrollX=p.cameraX;s.cameras.main.scrollY=p.cameraY;document.querySelector('#hint').hidden=true;game.renderer.preRender();game.scene.render(game.renderer);game.renderer.postRender();},{p});
const path=`/tmp/tanya-v3-phrase-${i+1}.png`;await page.screenshot({path});shots.push(path);
}
console.log(shots.join('\n'));
}finally{await browser.close()}
