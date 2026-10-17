// Development artifact only; never imported by production.
import {chromium} from 'playwright';
import {writeFileSync, mkdirSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
 const page=await browser.newPage();await page.goto('http://localhost:5173');
 const svg=await page.evaluate(async()=>{
  const {settings:s,levelSections}=await import('/src/settings.ts');
  const {groundYAt}=await import('/src/terrain.ts');
  const ground=s.groundSpans.map(g=>`<path d="M${g.start},${g.y}L${g.end},${g.endY??g.y}V660H${g.start}Z" fill="#788c7b" stroke="#29483e"/>`).join('');
  const platforms=s.routePlatforms.map(p=>`<rect x="${p.x}" y="${p.y}" width="${p.width}" height="12" fill="#b99c70" stroke="#70512c"/><text x="${p.x}" y="${p.y-22}" font-size="35">${p.width}px</text>`).join('');
  const pits=s.interruptions.map(p=>`<rect x="${p.start}" y="${groundYAt(p.start)}" width="${p.width}" height="9" fill="#414d35"/><path d="M${p.start},${groundYAt(p.start-1)}h${p.width}" stroke="${p.width>200?'#c23654':'#e19126'}" stroke-width="8"/><text x="${p.start}" y="${groundYAt(p.start)+55}" font-size="33">${p.width>200?'boost':'pit'} ${p.width}</text>`).join('');
  const labels=levelSections.map((p,i)=>`<text x="${p.start}" y="${40+i%2*48}" font-size="36">${i+1}. ${p.name}</text><path d="M${p.start},110V660" stroke="#bbb" stroke-dasharray="6 10"/>`).join('');
  const dot=(x,y,c,r=9)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
  const grannies=s.grannies.map(g=>`<rect x="${g.left-18}" y="${groundYAt(g.left)-45}" width="36" height="45" fill="#c43c64"/>`).join('');
  const scooters=s.scooters.map(p=>`<path d="M${p.x-35},${groundYAt(p.x)-8}h70l-16,-34z" fill="#2170bc"/><path d="M${p.launchAt},${groundYAt(p.launchAt)-60}h${p.x-p.launchAt}" stroke="#2170bc" stroke-dasharray="12 10"/>`).join('');
  const birds=s.pigeons.map(p=>`<path d="M${p.x-26},${p.y-15}l26,-24 26,24 -26,8z" fill="#7750a4"/>`).join('');
  const anchors=s.recoveryAnchors.map(x=>`<path d="M${x},${groundYAt(x)}v-72l45,15 -45,15" fill="#167c6f" stroke="#167c6f" stroke-width="6"/>`).join('');
  const benches=s.benches.map(x=>`<rect x="${x-40}" y="${groundYAt(x)-20}" width="80" height="18" fill="#c87622"/>`).join('');
  const bottles=s.bottles.map(p=>`<rect x="${p.x-14}" y="${p.y-25}" width="28" height="50" fill="#e1a815" stroke="#446d32"/>`).join('');
  const legend='<text x="100" y="725" font-size="39">Pink square: granny · Blue triangle: scooter / approach · Purple diamond: pigeons · Orange: bench · Yellow: Lipton / food · Green flag: recovery anchor · Red: boost pit · Orange line: small pit · Dark green: sludge</text>';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2302" height="460" viewBox="0 0 ${s.levelWidth} 780" preserveAspectRatio="none"><rect width="100%" height="100%" fill="#eef3df"/>${ground}${pits}${platforms}${labels}${s.food.map(p=>dot(p.x,p.y,'#e5b83d',7)).join('')}${grannies}${scooters}${birds}${benches}${bottles}${anchors}${legend}</svg>`;
 });
 mkdirSync('docs',{recursive:true});writeFileSync('docs/level-v3-overview.svg',svg);writeFileSync('/tmp/tanya-v3-overview.svg',svg);
 await page.setViewportSize({width:2302,height:460});await page.setContent(svg);await page.screenshot({path:'/tmp/tanya-v3-overview.png'});console.log('/tmp/tanya-v3-overview.png');
}finally{await browser.close()}
