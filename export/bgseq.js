// per-level animated background: 64 frames (stride 8), frame0 full + XOR deltas; plus clouds and drift particles
const path=require('path');const FXD=path.join(__dirname,'../PocketRocket/fxdata');
const L=require('./loader.js');const fs=require('fs');
const patch=s=>s.replace("for(let k=0;k<26;k++){const sx=((h8(k*5+1)","if(!NOPART)for(let k=0;k<26;k++){const sx=((h8(k*5+1)").replace("for(let k=0;k<34;k++){const bx=h8(k*7+I)%126","if(!NOPART)for(let k=0;k<34;k++){const bx=h8(k*7+I)%126").replace("let TITLE=true","var NOPART=1;let TITLE=true");
const res=JSON.parse(L(`
function bgOnly(){SCR.fill(0);CLDS=[];PXO=0;PYO=0;M={x:tgt.px-6,y:tgt.gy-18,w:tgt.pw+13,h:18};if(!lv.BM)mkBM();bg(lv.w,lv.bv);
 for(let i=0;i<lv.S.length;i++){curI=i;drawSolid(lv.S[i],lv.K[i],lv.w)}for(const d of lv.D)drawDisc(d);drawSnowmen();drawLife();drawPipe();drawBalloons();
 {const t=tgt;fillR(t.x,t.y,t.w,3);vl(t.x+1,t.y+3,t.gy-t.y-3);vl(t.x+t.w-2,t.y+3,t.gy-t.y-3);const cx=t.x+((t.w-1)>>1);px(cx,t.y,0);if(!(t.w&1))px(cx+1,t.y,0)}{const p=pad;fillR(p.x,p.y,p.w,2)}}
const out=[];for(let L=0;L<100;L++){go(L);INTRO=false;state='ready';const F=[];let clouds=[];for(let f=0;f<512;f+=8){ft=f;tick=f;bgOnly();if(f==0)clouds=CLDS.slice();F.push(Array.from(SCR))}
 let part=null;if(lv.w==7)part={m:1,p:[...Array(26)].map((_,k)=>[h8(k*5+1)%128,h8(k*9+2)%60])};if(lv.w==8){const I=lv.si;part={m:2,p:[...Array(34)].map((_,k)=>[h8(k*7+I)%126,h8(k*11+I*3)%64])}}
 out.push({F,clouds,part})}
// cloud sprite
SCR.fill(0);CLDS=[];const cx=0,cy=5;cloud0(cx,cy);const cw=[],cb=[];for(let y=0;y<6;y++)for(let x=0;x<19;x++){cw.push(SCR[y*128+x]);cb.push(cloudIn(x,y,cx,cy)?1:0)}
return JSON.stringify({out,cw,cb})`,patch));
const pages=(px,W=128,H=64)=>{const b=Buffer.alloc(W*Math.ceil(H/8));for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(px[y*W+x])b[(y>>3)*W+x]|=1<<(y&7);return b};
function pack(buf){const o=[];let i=0;while(i<buf.length){let j=i;while(j<buf.length&&buf[j]==buf[i]&&j-i<129)j++;if(j-i>=3){o.push(256-(j-i)+1,buf[i]);i=j;continue}
 let k=i;while(k<buf.length&&k-i<128){if(k+2<buf.length&&buf[k]==buf[k+1]&&buf[k]==buf[k+2])break;k++}o.push(k-i-1,...buf.slice(i,k));i=k}return Buffer.from(o)}
const parts=[];let tot=0;const table=Buffer.alloc(100*4);let ptr=table.length;const blobs=[];
res.out.forEach((l,i)=>{const base=pages(l.F[0]);const frames=[base];let nz=0;for(let k=1;k<l.F.length;k++){const b=pages(l.F[k]);for(let q=0;q<1024;q++)b[q]^=base[q];if(b.some(v=>v))nz++;frames.push(pack(b))}
 const n=nz?l.F.length:1;const idx=Buffer.alloc(2+3*n);idx.writeUInt16LE(n,0);let off=ptr+idx.length;const fb=[];for(let k=0;k<n;k++){idx.writeUIntLE(off,2+3*k,3);fb.push(frames[k]);off+=frames[k].length}
 table.writeUInt32LE(ptr,i*4);blobs.push(idx,...fb);ptr=off});
const all=Buffer.concat([table,...blobs]);fs.writeFileSync(FXD+'/bgseq.bin',all);
// patch level headers: clouds at 180 (count) 181.. pairs; particles at 320 (mode), 321 count, then pairs
const lv=fs.readFileSync(FXD+'/levels.bin');
res.out.forEach((l,i)=>{const o=i*2560;lv.fill(0,o+180,o+192);lv.fill(0,o+320,o+512);const cl=l.clouds.slice(0,5);lv[o+180]=cl.length;cl.forEach((c,q)=>{lv[o+181+q*2]=c[0]&255;lv[o+182+q*2]=c[1]&255});
 if(l.part){lv[o+320]=l.part.m;lv[o+321]=l.part.p.length;l.part.p.forEach((p,q)=>{lv[o+322+q*2]=p[0];lv[o+323+q*2]=p[1]})}});
fs.writeFileSync(FXD+'/levels.bin',lv);
// cloud sprite appended to sprites.bin as kind 12
const spr=fs.readFileSync(FXD+'/sprites.bin');const cs=Buffer.alloc(320);for(let f=0;f<2;f++){const o=f*160;cs[o]=19;cs[o+1]=6;pages(res.cw,19,6).copy(cs,o+2);const blk=res.cb.map((v,q)=>v&&!res.cw[q]?1:0);pages(blk,19,6).copy(cs,o+2+19)}
fs.writeFileSync(FXD+'/sprites.bin',Buffer.concat([spr.slice(0,12*320),cs]));
console.log('bgseq',all.length,'max clouds',Math.max(...res.out.map(l=>l.clouds.length)));
// clams + pipe
const extra=JSON.parse(L(`const o=[];for(let i=0;i<100;i++){go(i);o.push({c:lv.CD.map(q=>lv.S[q]),p:lv.PIPE||null})}return JSON.stringify(o)`,patch));
const lv2=fs.readFileSync(FXD+'/levels.bin');
extra.forEach((e,i)=>{const o=i*2560;lv2.fill(0,o+450,o+480);lv2[o+450]=e.c.length;e.c.slice(0,3).forEach((c,q)=>{lv2[o+451+q*4]=c[0];lv2[o+452+q*4]=c[1];lv2[o+453+q*4]=c[2];lv2[o+454+q*4]=c[3]});if(e.p){lv2[o+470]=e.p.x;lv2[o+471]=e.p.y}});
fs.writeFileSync(FXD+'/levels.bin',lv2);console.log('clams/pipe ok');
