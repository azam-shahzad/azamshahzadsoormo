const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900},deviceScaleFactor:2});
await pg.goto('file://'+__dirname+'/palettes.html');await pg.waitForTimeout(1500);
for(let i=1;i<=5;i++) await (await pg.$('#p'+i)).screenshot({path:__dirname+`/palette-${i}.png`});
await b.close();})();
