// V3 movement notation, placed after the geometry-only silhouette/contact pass.
// Every group is authored; there is no reusable arc/section generator.
type Point = {x:number;y:number};
export const foodClusters: {purpose:string;points:Point[]}[] = [
 {purpose:'1: normal gap arc',points:[{x:375,y:390},{x:456,y:318},{x:492,y:306},{x:528,y:318},{x:564,y:365}]},
 {purpose:'1: landing cue rises over the granny before the second ascent',points:[{x:660,y:370},{x:710,y:320},{x:770,y:360}]},
 {purpose:'1→2: second ascent points toward the tall ledge',points:[{x:940,y:340},{x:970,y:310},{x:1000,y:310},{x:1040,y:340}]},
 {purpose:'2: near-vertical boost notation',points:[{x:1320,y:340},{x:1380,y:270},{x:1420,y:220},{x:1460,y:185},{x:1500,y:175},{x:1580,y:205},{x:1640,y:254}]},
 {purpose:'3: downhill diagonal stops before the delayed bird jump',points:[{x:1830,y:155},{x:2020,y:298},{x:2100,y:328},{x:2180,y:357},{x:2260,y:387}]},
 // Bird jump ENDS here. The next two branches are visible before the boost.
 {purpose:'3: bird landing group, then common route-choice breadcrumb',points:[{x:2550,y:315},{x:2580,y:360},{x:2610,y:405},{x:2640,y:405}]},
 {purpose:'4 lower: route split — stay on the safe ramp',points:[{x:2680,y:403},{x:2720,y:402},{x:2760,y:401},{x:2820,y:399}]},
 {purpose:'4 upper: route split — rising boost notation toward first landing',points:[{x:2680,y:310},{x:2730,y:245},{x:2830,y:185},{x:2890,y:215},{x:2950,y:288}]},
 {purpose:'4: narrow second surface — short sweep and landing',points:[{x:2995,y:240},{x:3050,y:190},{x:3105,y:220}]},
 {purpose:'4: third surface — apex then high landing group',points:[{x:3170,y:155},{x:3220,y:130},{x:3270,y:165}]},
 {purpose:'4: skill reward from the final surface, not an unrelated boost arc',points:[{x:3300,y:125},{x:3370,y:75},{x:3420,y:100},{x:3470,y:155}]},
 {purpose:'4: descending trail reconnects to the common ground before granny',points:[{x:3510,y:260},{x:3550,y:375}]},
 {purpose:'4 lower: small safe-route reward group',points:[{x:2940,y:395},{x:2980,y:394},{x:3020,y:393}]},
 {purpose:'4→5: return downhill directly into long-gap takeoff',points:[{x:3630,y:320},{x:3700,y:285},{x:3770,y:335},{x:4000,y:383}]},
 {purpose:'5: long boost parabola, distinct from the vertical lesson',points:[{x:4280,y:300},{x:4330,y:235},{x:4390,y:185},{x:4450,y:195},{x:4510,y:250},{x:4570,y:325},{x:4630,y:399}]},
 {purpose:'6: sparse timing markers across the live scooter lane',points:[{x:5060,y:375},{x:5180,y:375},{x:5280,y:290},{x:5360,y:305},{x:5470,y:439}]},
 {purpose:'7: downward ground cascade, then landing after short hop',points:[{x:5765,y:450},{x:5800,y:479},{x:6120,y:420},{x:6160,y:457},{x:6300,y:360},{x:6460,y:499}]},
 // Common grounded approach reveals the bench BEFORE either route commits.
 {purpose:'8: common grounded breadcrumb into the visible bench decision',points:[{x:6880,y:519},{x:6940,y:519},{x:7010,y:519}]},
 {purpose:'8 rest: route split — grounded seat approach',points:[{x:7130,y:519},{x:7170,y:519}]},
 {purpose:'8 fast: route split — optional late seat hop preserves tempo',points:[{x:7170,y:435},{x:7210,y:415},{x:7260,y:450}]},
 {purpose:'8: common landing after the bench choice',points:[{x:7350,y:519},{x:7390,y:519}]},
 {purpose:'9: unequal staircase ascent',points:[{x:7490,y:430},{x:7520,y:410},{x:7550,y:404},{x:7610,y:445},{x:7840,y:390},{x:7870,y:360},{x:7910,y:350},{x:7950,y:390}]},
 {purpose:'9: low timing markers before the scooter jump',points:[{x:8020,y:419},{x:8060,y:419}]},
 {purpose:'9 upper: local skill reward leads to a Lipton landing perch',points:[{x:8080,y:340},{x:8140,y:315},{x:8190,y:326}]},
 {purpose:'9: final tall rise and high landing',points:[{x:8360,y:335},{x:8400,y:265},{x:8440,y:225},{x:8480,y:205},{x:8520,y:215},{x:8650,y:284}]},
 {purpose:'10: high drop, wait low, then cross birds and interruption',points:[{x:8910,y:310},{x:8950,y:380},{x:8990,y:444},{x:9260,y:360},{x:9400,y:430},{x:9660,y:380},{x:9690,y:420},{x:9720,y:444}]},
 {purpose:'10: final rising approach leads directly to granny',points:[{x:9800,y:444},{x:9900,y:438},{x:9980,y:431}]},
 {purpose:'10: reward after granny, visible cat resolution',points:[{x:10280,y:340},{x:10320,y:390},{x:10360,y:424},{x:10440,y:436}]},
];
export const food: Point[] = foodClusters.flatMap(group=>group.points);
