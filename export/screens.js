// Export title/howto/intro/gameover/win screens as compressed frame sequences
const path=require('path');process.chdir(path.join(__dirname,'../browser'));const fs=require('fs');const run=require('../browser/full.js');
const out=JSON.parse(run(`
const _t=text,_tO=textO;let HIDE=null;
text=function(s,x,y){if(HIDE&&HIDE(String(s)))return;return _t(s,x,y)};
textO=function(s,x,y,sc){if(HIDE&&HIDE(String(s)))return;return _tO(s,x,y,sc)};
const grab=()=>Array.from(SCR);const RR={};
// title idle + hold
HIDE=s=>s.startsWith('HIGH SCORE');TITLE=true;titlePage=0;HT=0;TP=[];RR.idle=[];for(let f=0;f<64;f++){ft=f;renderTitle();RR.idle.push(grab())}
RR.hold=[];for(let f=0;f<120&&HT<240;f++){HT=Math.min(240,HT+2.7);ft=64+f;renderTitle();RR.hold.push(grab())}
// how to
HIDE=null;RR.howto=[];for(const t of [10,40]){SCR.fill(0);blkScene(t);RR.howto.push(grab())}
// intros
RR.intro=[];for(let w=0;w<10;w++){go(w*10);const fr=[];for(let t=0;t<180;t+=2){INTRO=true;IT=t;IW=w;ft=t;renderIntro();fr.push(grab())}RR.intro.push(fr)}
// game over (score line hidden) and win (score hidden)
go(5);score=0;HIDE=s=>s.startsWith('LEVEL ');RR.over=[];for(let t=0;t<240;t+=2){GOT=t;ft=t;renderGameOver();RR.over.push(grab())}
go(99);HIDE=s=>s=='SCORE'||/^[0-9]+$/.test(s);RR.win=[];for(let t=0;t<240;t+=2){WINT=t;ft=t;renderWin();RR.win.push(grab())}
return JSON.stringify(RR)`));
const pages=px=>{const b=Buffer.alloc(1024);for(let y=0;y<64;y++)for(let x=0;x<128;x++)if(px[y*128+x])b[(y>>3)*128+x]|=1<<(y&7);return b};
function pack(buf){const o=[];let i=0;while(i<buf.length){let j=i;while(j<buf.length&&buf[j]==buf[i]&&j-i<129)j++;if(j-i>=3){o.push(256-(j-i)+1,buf[i]);i=j;continue}
 let k=i;while(k<buf.length&&k-i<128){if(k+2<buf.length&&buf[k]==buf[k+1]&&buf[k]==buf[k+2])break;k++}o.push(k-i-1,...buf.slice(i,k));i=k}return Buffer.from(o)}
// sequence table: [count u16][offsets u24 * count], frames packed
const seqs=[['IDLE',out.idle],['HOLD',out.hold],['HOWTO',out.howto],...out.intro.map((f,w)=>['INTRO'+w,f]),['OVER',out.over],['WIN',out.win]];
let data=[],hdr=[],tot=0,raw=0;for(const [nm,frames] of seqs){const start=tot;const idx=Buffer.alloc(2+3*frames.length);idx.writeUInt16LE(frames.length,0);let off=idx.length;const parts=[];
 frames.forEach((f,i)=>{const p=pack(pages(f));raw+=1024;idx.writeUIntLE(start+off,2+3*i,3);parts.push(p);off+=p.length});data.push(idx,...parts);hdr.push([nm,start,frames.length]);tot+=off}
const all=Buffer.concat(data);fs.writeFileSync(path.join(__dirname,'../PocketRocket/fxdata/screens.bin'),all);
fs.writeFileSync(path.join(__dirname,'../PocketRocket/screens.h'),'#pragma once\n'+hdr.map(h=>`#define SQ_${h[0]} 0x${h[1].toString(16)}UL // ${h[2]} frames`).join('\n')+'\n');
console.log('screens',all.length,'raw',raw,'seqs',hdr.map(h=>h[0]+':'+h[2]).join(' '));
