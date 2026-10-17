// V3 movement notation, placed after the geometry-only silhouette/contact pass.
// Every group is authored; there is no reusable arc/section generator.
type Point = {x:number;y:number};
export const foodClusters: {purpose:string;points:Point[]}[] = [
 {purpose:'1: normal gap arc',points:[{x:380,y:365},{x:416,y:318},{x:452,y:306},{x:488,y:318},{x:524,y:365}]},
 {purpose:'1: landing cue rises over the granny before the second ascent',points:[{x:660,y:370},{x:710,y:320},{x:770,y:360}]},
 {purpose:'1→2: second ascent points toward the tall ledge',points:[{x:940,y:340},{x:970,y:310},{x:1000,y:310},{x:1040,y:340}]},
 {purpose:'2: near-vertical boost notation',points:[{x:1320,y:340},{x:1380,y:270},{x:1420,y:220},{x:1460,y:185},{x:1500,y:175},{x:1580,y:205},{x:1640,y:254}]},
 {purpose:'3: downhill diagonal stops before the delayed bird jump',points:[{x:1830,y:155},{x:2020,y:298},{x:2100,y:328},{x:2180,y:357},{x:2260,y:387}]},
 {purpose:'3: reward after delayed bird jump, into next ascent',points:[{x:2550,y:315},{x:2580,y:335},{x:2610,y:370},{x:2640,y:407}]},
 {purpose:'4: first low landing, not three identical arcs',points:[{x:2790,y:355},{x:2830,y:310},{x:2870,y:300},{x:2920,y:339}]},
 {purpose:'4: zig-zag toward narrow second surface',points:[{x:2990,y:285},{x:3040,y:232},{x:3080,y:238},{x:3120,y:270}]},
 {purpose:'4: lower continuation through the third surface',points:[{x:3170,y:220},{x:3220,y:197},{x:3270,y:240},{x:3330,y:330}]},
 {purpose:'4: optional boost reward above the third surface',points:[{x:3280,y:105},{x:3310,y:95},{x:3340,y:95},{x:3370,y:105},{x:3400,y:120}]},
 {purpose:'4 lower: safe ramp remains a viable route',points:[{x:2940,y:395},{x:2980,y:394},{x:3020,y:393}]},
 {purpose:'4→5: return downhill directly into long-gap takeoff',points:[{x:3630,y:320},{x:3700,y:285},{x:3770,y:335},{x:4000,y:383}]},
 {purpose:'5: long boost parabola, distinct from the vertical lesson',points:[{x:4280,y:300},{x:4330,y:235},{x:4390,y:185},{x:4450,y:195},{x:4510,y:250},{x:4570,y:325},{x:4630,y:399}]},
 {purpose:'6: sparse timing markers across the live scooter lane',points:[{x:5060,y:375},{x:5180,y:375},{x:5280,y:290},{x:5360,y:305},{x:5470,y:439}]},
 {purpose:'7: downward ground cascade, then landing after short hop',points:[{x:5765,y:450},{x:5800,y:479},{x:6120,y:420},{x:6160,y:457},{x:6300,y:360},{x:6460,y:499}]},
 {purpose:'8: continue over the bench OR stay low for a stronger rest',points:[{x:6880,y:519},{x:6940,y:519},{x:7100,y:470},{x:7140,y:435},{x:7200,y:435},{x:7240,y:519},{x:7300,y:519}]},
 {purpose:'9: unequal staircase ascent',points:[{x:7490,y:430},{x:7520,y:410},{x:7550,y:404},{x:7610,y:445},{x:7840,y:390},{x:7870,y:360},{x:7910,y:350},{x:7950,y:390}]},
 {purpose:'9: optional boosted middle-step reward',points:[{x:7980,y:265},{x:8010,y:260},{x:8040,y:265},{x:8070,y:280},{x:8100,y:300}]},
 {purpose:'9: final tall rise and high landing',points:[{x:8360,y:335},{x:8400,y:265},{x:8440,y:225},{x:8480,y:205},{x:8520,y:215},{x:8650,y:284}]},
 {purpose:'10: high drop, wait low, then cross birds and interruption',points:[{x:8910,y:310},{x:8950,y:380},{x:8990,y:444},{x:9260,y:360},{x:9400,y:430},{x:9660,y:380},{x:9690,y:420},{x:9720,y:444}]},
 {purpose:'10: final rising approach leads directly to granny',points:[{x:9800,y:444},{x:9900,y:438},{x:9980,y:431}]},
 {purpose:'10: reward after granny, visible cat resolution',points:[{x:10280,y:340},{x:10320,y:390},{x:10360,y:424},{x:10440,y:436}]},
];
export const food: Point[] = foodClusters.flatMap(group=>group.points);
