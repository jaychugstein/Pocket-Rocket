// loads the browser game with optional source patches
const fs=require('fs');
module.exports=(body,patch)=>{let src=fs.readFileSync(__dirname+'/../browser/core.js','utf8')+fs.readFileSync(__dirname+'/../browser/view.js','utf8');
 if(patch)src=patch(src);const data=fs.readFileSync(__dirname+'/../browser/data.json','utf8');
 return new Function('DATAJSON',src+";DATA=JSON.parse(DATAJSON);"+body)(data)};
