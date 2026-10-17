// crash messages: CMSG list from the browser game, 40-byte zero-padded slots ('|' = line break)
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../browser/core.js'),'utf8');
const list=JSON.parse(src.match(/CMSG=(\[[^\]]*\])/)[1]);
const b=Buffer.alloc(list.length*40);list.forEach((m,i)=>b.write(m.slice(0,39),i*40,'latin1'));
fs.writeFileSync(path.join(__dirname,'../PocketRocket/fxdata/msgs.bin'),b);console.log(list.length+' messages');
