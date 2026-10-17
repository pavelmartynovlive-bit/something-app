// Development artifact only; never loaded by the production game.
import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const page=await browser.newPage();await page.goto('http://localhost:5173');
 const svg=await page.evaluate(async()=>{
  const {settings:s,levelSections}=await import('/src/settings.ts');
  const shapes=s.groundSpans.map(g=>`<path d="M${g.start},${g.y} L${g.end},${g.endY??g.y} V660 H${g.start}Z" fill="#788c7b" stroke="#29483e"/>`).join('');
  const platforms=s.routePlatforms.map(p=>`<rect x="${p.x}" y="${p.y}" width="${p.width}" height="12" fill="#b99c70"/>`).join('');
  const labels=levelSections.map((p,i)=>`<text x="${p.start}" y="${40+i%2*55}" font-size="42">${i+1}. ${p.name}</text><path d="M${p.start},110V660" stroke="#bbb" stroke-dasharray="6 10"/>`).join('');
  const dots=(points,color,r=10)=>points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${color}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2302" height="410" viewBox="0 0 ${s.levelWidth} 700" preserveAspectRatio="none"><rect width="100%" height="100%" fill="#eef3df"/>${shapes}${platforms}${labels}${dots(s.food,'#e5b83d',7)}${dots(s.pigeons,'#7355a4',20)}${dots(s.bottles,'#e6aa00',20)}${dots(s.benches.map(x=>({x,y:550})),'#d87526',20)}${dots(s.grannies.map(g=>({x:g.left,y:450})),'#e24e68',20)}${dots(s.scooters.map(x=>({x,y:410})),'#227ac4',20)}</svg>`;
 });
 writeFileSync('/tmp/tanya-v3-overview.svg',svg);await page.setViewportSize({width:2302,height:410});await page.setContent(svg);await page.screenshot({path:'/tmp/tanya-v3-overview.png'});console.log('/tmp/tanya-v3-overview.png');
}finally{await browser.close()}
