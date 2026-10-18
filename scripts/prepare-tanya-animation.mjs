// Metadata preparation only. The approved PNG is never repainted or regenerated.
import {chromium} from 'playwright';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='art-assets/tanya/animations/',png=readFileSync(root+'tanya-animation-sheet.png');
const atlas=JSON.parse(readFileSync(root+'tanya-animation-atlas.json','utf8'));
const states=JSON.parse(readFileSync(root+'tanya-animation-states.json','utf8')).animations;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const page=await browser.newPage();
 const frames=await page.evaluate(async({url,frames})=>{
  const image=new Image();image.src=url;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,image.width,image.height).data;
  return Object.entries(frames).map(([name,{frame:r}])=>{
   let faceTop=Infinity,faceBottom=-Infinity,pinkBottom=-Infinity,opaqueBottom=-Infinity;
   for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){
    const i=(y*image.width+x)*4,[red,green,blue,alpha]=pixels.subarray(i,i+4);if(alpha<128)continue;
    opaqueBottom=Math.max(opaqueBottom,y);
    if(red>200&&green>120&&green<240&&blue>90&&red>green*1.08){faceTop=Math.min(faceTop,y);faceBottom=Math.max(faceBottom,y)}
    if(red>180&&green<110&&blue>70)pinkBottom=Math.max(pinkBottom,y);
   }
   const waist=[];
   for(let y=pinkBottom-4;y<=pinkBottom;y++)for(let x=r.x;x<r.x+r.w;x++){
    const i=(y*image.width+x)*4;
    if(pixels[i+3]>=128&&pixels[i]>180&&pixels[i+1]<110&&pixels[i+2]>70)waist.push(x);
   }
   waist.sort((a,b)=>a-b);
   const faceHeight=faceBottom-faceTop+1,rootX=waist[Math.floor(waist.length/2)]-r.x,footY=opaqueBottom+1-r.y;
   return{name,rect:r,normalize:37/faceHeight,rootX,footY,measuredFaceHeight:faceHeight};
  });
 },{url:'data:image/png;base64,'+png.toString('base64'),frames:atlas.frames});
 assert.equal(frames.length,20);
 for(const f of frames){assert.ok(f.normalize>.8&&f.normalize<1.2);assert.ok(f.rootX>=0&&f.rootX<=f.rect.w);const left=128-f.rootX*f.normalize,right=left+f.rect.w*f.normalize,top=224-f.footY*f.normalize;assert.ok(left>=0&&right<=256&&top>=0&&top+f.rect.h*f.normalize<=256,f.name+' fits common frame')}
 const animations=states.map(s=>({...s,key:'tanya-'+(s.key==='landing'?'land':s.key),frameRate:s.key==='idle'?5:['jump-start','landing'].includes(s.key)?24:s.frameRate}));
 const data={source:{width:1536,height:1024,sha256:createHash('sha256').update(png).digest('hex')},frameSize:256,footX:128,footY:224,referenceHeight:133,referenceFaceHeight:37,frames,animations};
 writeFileSync('public/assets/characters/tanya/animations/tanya-animation-data.json',JSON.stringify(data,null,2)+'\n');
 console.log('PASS: 20 approved frame crops fit uniform256×256 cells; common foot anchor; reference idle133px, face37px');
}finally{await browser.close()}
