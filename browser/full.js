const fs=require('fs');
const src=fs.readFileSync('core.js','utf8')+fs.readFileSync('view.js','utf8');
const data=fs.readFileSync('data.json','utf8');
module.exports=(body)=>new Function('DATAJSON',src+";DATA=JSON.parse(DATAJSON);"+body)(data);
