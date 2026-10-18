// Derive registrations only. Approved contextual PNG pixels remain untouched.
import {chromium} from 'playwright';import {readFileSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const root='art-assets/tanya/contextual/',png=readFileSync(root+'tanya-context-sheet.png'),atlas=JSON.parse(readFileSync(root+'tanya-context-atlas.json'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{const page=await browser.newPage();const frames=await page.evaluate(async({url,frames})=>{
 const image=new Image();image.src=url;await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const p=ctx.getImageData(0,0,c.width,c.height).data;
 return Object.entries(frames).map(([name,{frame:r}])=>{
  let faceTop=Infinity,faceBottom=-Infinity,pinkBottom=-Infinity,opaqueBottom=-Infinity,greenLeft=Infinity,greenRight=-Infinity;
  const skin=(i)=>p[i+3]>=128&&p[i]>190&&p[i+1]>110&&p[i+1]<240&&p[i+2]>85&&p[i]>p[i+1]*1.08;
  const pink=(i)=>p[i+3]>=128&&p[i]>180&&p[i+1]<110&&p[i+2]>70;
  const olive=(i)=>p[i+3]>=128&&p[i]>65&&p[i]<185&&p[i+1]>70&&p[i+1]<190&&p[i+2]>30&&p[i+2]<150&&p[i+1]>p[i]*.95&&p[i+1]>p[i+2]*1.12;
  for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){const i=(y*c.width+x)*4;if(p[i+3]<128)continue;opaqueBottom=Math.max(opaqueBottom,y);if(skin(i)){faceTop=Math.min(faceTop,y);faceBottom=Math.max(faceBottom,y)}if(pink(i))pinkBottom=Math.max(pinkBottom,y);if(olive(i)){greenLeft=Math.min(greenLeft,x);greenRight=Math.max(greenRight,x)}}
  const waist=[];for(let y=pinkBottom-4;y<=pinkBottom;y++)for(let x=r.x;x<r.x+r.w;x++)if(pink((y*c.width+x)*4))waist.push(x);waist.sort((a,b)=>a-b);
  const faceHeight=faceBottom-faceTop+1,normalize=37/faceHeight,seat=name.startsWith('bench-idle')||name==='bench-sit-02';let rootX=waist[Math.floor(waist.length/2)]-r.x,footY=opaqueBottom+1-r.y;
  if(seat){const back=greenLeft+(greenRight-greenLeft)*.25;let bottom=-Infinity;for(let y=r.y;y<r.y+r.h-10;y++)for(let x=greenLeft;x<=back;x++)if(olive((y*c.width+x)*4))bottom=Math.max(bottom,y);rootX=(greenLeft+back)/2-r.x;footY=bottom+1-r.y;}
  return{name,rect:r,normalize,rootX,footY,seat,measuredFaceHeight:faceHeight};
 });
 },{url:'data:image/png;base64,'+png.toString('base64'),frames:atlas.frames});
 assert.equal(frames.length,20);for(const f of frames){assert.ok(f.normalize>.7&&f.normalize<1.6,f.name+' scale');const x=128-f.rootX*f.normalize,y=224-(f.seat?22/(78.0208/133):0)-f.footY*f.normalize;assert.ok(x>=0&&x+f.rect.w*f.normalize<=256&&y>=0&&y+f.rect.h*f.normalize<=256,f.name+' fits256 cell');}
 const groups=[['bench-sit',2,10,0],['bench-idle',4,4,-1],['bench-stand',2,10,0],['pit-fall',4,10,0],['hit-granny',3,16,0],['hit-scooter',5,18,0]];
 const animations=groups.map(([name,count,frameRate,repeat])=>({key:'tanya-'+name,frames:Array.from({length:count},(_,i)=>name+'-'+String(i+1).padStart(2,'0')),frameRate,repeat}));
 const data={source:{width:1536,height:1024,sha256:createHash('sha256').update(png).digest('hex')},frameSize:256,footX:128,footY:224,referenceHeight:133,frames,animations};writeFileSync('public/assets/characters/tanya/animations/tanya-context-data.json',JSON.stringify(data,null,2)+'\n');console.log(frames.map(f=>[f.name,f.measuredFaceHeight,f.normalize,f.seat]));
}finally{await browser.close()}
