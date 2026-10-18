# Alpha-component analysis only. Does not modify image pixels.
from PIL import Image
from collections import deque
from pathlib import Path
import json
im=Image.open('art-assets/tanya/contextual/tanya-context-sheet.png');w,h=im.size;a=bytearray(x>=128 for x in im.getchannel('A').get_flattened_data());parts=[]
for i in range(w*h):
 if not a[i]:continue
 a[i]=0;q=deque([i]);xs=[];ys=[]
 while q:
  p=q.popleft();x=p%w;y=p//w;xs.append(x);ys.append(y)
  for j in (p-1 if x else -1,p+1 if x<w-1 else -1,p-w if y else -1,p+w if y<h-1 else -1):
   if j>=0 and a[j]:a[j]=0;q.append(j)
 if len(xs)>500:parts.append([min(xs),min(ys),max(xs)+1,max(ys)+1])
assert len(parts)==20,len(parts)
parts.sort(key=lambda b:(int(((b[1]+b[3])/2)/h*5),int(((b[0]+b[2])/2)/w*4)))
names=[f'bench-sit-{i:02}' for i in range(1,3)]+[f'bench-idle-{i:02}' for i in range(1,5)]+[f'bench-stand-{i:02}' for i in range(1,3)]+[f'pit-fall-{i:02}' for i in range(1,5)]+[f'hit-granny-{i:02}' for i in range(1,4)]+[f'hit-scooter-{i:02}' for i in range(1,6)]
frames={n:{'frame':{'x':b[0]-2,'y':b[1]-2,'w':b[2]-b[0]+4,'h':b[3]-b[1]+4}} for n,b in zip(names,parts)}
Path('art-assets/tanya/contextual/tanya-context-atlas.json').write_text(json.dumps({'frames':frames,'meta':{'image':'tanya-context-sheet.png','size':{'w':w,'h':h}}},indent=2)+'\n')
print('PASS: 20 separated opaque components; source PNG unchanged')
