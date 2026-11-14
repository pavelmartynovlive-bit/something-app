GINGER CAT — FINAL FEEDING ANIMATION

15 frames: idle 4, sniff 4, eating 4 (loop), satisfied 3.
Left-facing side view. Cat and bowl are included together in every frame.
No gameplay code has been changed.

FILES
cat-idle-strip-320.png — 4 frames, 1280x320.
cat-sniff-strip-320.png — 4 frames, 1280x320.
cat-eat-strip-320.png — 4 loopable frames, 1280x320.
cat-happy-strip-320.png — 3 frames, 960x320.
strip-sheets.json — equal-cell sheet metadata and recommended origins.
cat-feeding-atlas.png — original transparent RGBA generated artwork.
cat-feeding-atlas.json — TexturePacker-compatible trimmed atlas, including
  equal 320x320 logical frames, fixed 300px baseline and fixed 24px bowl left.
animations.json — ordered frame names, frame rates and looping recommendations.
preview.html — self-contained animated preview; works locally without a server.

IMPORTING THE STRIPS
Load each strip as a normal spritesheet with frameWidth=320, frameHeight=320.
The transparent canvas, bowl left and floor baseline are identical per cell.
No atlas JSON is necessary when using the strip PNGs.

IMPORTING THE PACKED ATLAS (alternative)
Import BOTH the PNG and atlas JSON. Do not divide the raw PNG into equal cells:
the generator's native 1254px image has a fractional four-column grid. The JSON
preserves the artwork without rescaling, provides equal 320x320 logical frames,
and compensates the small spacing offsets to keep bowl/ground registration stable.
The final unused atlas cell is transparent and is not an animation frame.

PHASER 3
scene.load.atlas('cat-feeding', 'cat-feeding-atlas.png', 'cat-feeding-atlas.json');
scene.anims.create({ key:'cat-eat',
  frames:['eat_00','eat_01','eat_02','eat_03'].map(frame=>({key:'cat-feeding',frame})),
  frameRate:5, repeat:-1 });
const cat = scene.add.sprite(x, groundY, 'cat-feeding', 'idle_00');
cat.setOrigin(0.5, 300/320).play('cat-eat');
Use the same sprite scale/origin for every state. Do not independently auto-trim
or normalize each pose by its height; the lowered head must remain lower.

TIMING
Idle: 4 fps loop. Sniff: 6 fps once. Eating: 5 fps loop.
Happy: 4 fps once, then hold the last frame. Suggested eating hold: 3.2 seconds.

Artwork generated with the image-generation tool using the existing cat/bowl references; strips exported by the included preview using the atlas registration metadata.
