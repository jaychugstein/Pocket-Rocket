// Exports Pocket Rocket level data from the browser JS into FX binary
const fs=require('fs');const path=require('path');process.chdir(path.join(__dirname,'../browser'));
const run=require('../browser/full.js');
const OUT=path.join(__dirname,'../PocketRocket/fxdata');fs.mkdirSync(OUT,{recursive:true});
const res=JSON.parse(run(`
function bgOnly(){SCR.fill(0);CLDS=[];PXO=0;PYO=0;
 M={x:tgt.px-6,y:tgt.gy-18,w:tgt.pw+13,h:18};if(!lv.BM)mkBM();bg(lv.w,lv.bv);
 for(let i=0;i<lv.S.length;i++){curI=i;drawSolid(lv.S[i],lv.K[i],lv.w)}
 for(const d of lv.D)drawDisc(d);drawSnowmen();drawLife();drawPipe();drawBalloons();
 {const t=tgt;fillR(t.x,t.y,t.w,3);vl(t.x+1,t.y+3,t.gy-t.y-3);vl(t.x+t.w-2,t.y+3,t.gy-t.y-3);const cx=t.x+((t.w-1)>>1);px(cx,t.y,0);if(!(t.w&1))px(cx+1,t.y,0)}
 {const p=pad;fillR(p.x,p.y,p.w,2)}}
const FLATK={arcc:1,mtn:1,pier:1,g:1,s:1,st:1,sand:1,sea:1,ck1:1,ck2:1,tbl:1,pav:1,lawn:1,rk:1,hl:1,mesa:1,ice:1};
const L=[];
for(let li=0;li<100;li++){go(li);INTRO=false;state='ready';ft=0;tick=0;
 bgOnly();const bgp=Array.from(SCR);
 // hazard mask, JS collision semantics for rocket pixels
 const mask=new Array(8192).fill(0);
 for(let si=0;si<lv.S.length;si++){const s0=lv.S[si],k=lv.K[si];if(s0[3]<=0||k=='d')continue;if(k=='sp:ufo'||k=='sp:sat')continue;
  if(RECTK[k]){const jk=(k=='jes'&&s0[2]<30)||k=='jesp'||k=='eif'||k=='nam'||k=='opr';const y0=s0[1]+(jk?0:1),y1=s0[1]+s0[3];
   for(let y=Math.max(0,y0);y<Math.min(64,y1);y++)for(let x=Math.max(0,s0[0]);x<Math.min(128,s0[0]+s0[2]);x++)mask[y*128+x]=1}
  else{SCR.fill(0);curI=si;drawSolid(s0,k,lv.w);const ex=(k=='cd'||k=='cdl'||k=='grill')?0:1;
   for(let y=0;y<64;y++)for(let x=0;x<128;x++)if(SCR[y*128+x]&&x>=s0[0]-ex&&x<s0[0]+s0[2]+ex&&y>=s0[1]-ex&&y<s0[1]+s0[3]+ex)mask[y*128+x]=1}}
 {const t=tgt;for(let y=t.y+1;y<t.y+3;y++)for(let x=t.x;x<t.x+t.w;x++)if(x>=0&&x<128&&y>=0&&y<64)mask[y*128+x]=1}
 const flats=[];for(let si=0;si<lv.S.length;si++){const s=lv.S[si],k=lv.K[si];if(s[3]<=0)continue;if(FLATK[k])flats.push([s[0],s[1],s[2],0]);else if(k=='jes'&&s[2]>=30)flats.push([s[0],s[1],s[2],1])}
 const tk=lv.TK&&lv.TK[0];
 const mv=lv.MV.map(m=>Object.assign({},m));lv.S.forEach((r,q)=>{const k=lv.K[q];if(k=='sp:ufo'||k=='sp:sat')mv.push({k:k.slice(3),m:'static',x:r[0]+(r[2]>>1),y0:r[1]+(r[3]>>1),rx:r[0]});});
 L.push({w:Math.floor(lv.i/10),si:lv.si,g:lv.g,fuel:lv.fuel,water:lv.w==8?1:0,nowrap:[94,109,9,6,59].includes(lv.si)?1:0,
  pad,tgt:{x:tgt.x,y:tgt.y,w:tgt.w,px:tgt.px,pw:tgt.pw,gy:tgt.gy},star:tk?[tk.x,tk.y,tk.ph]:null,flats,mv,bg:bgp,mask})}
const SPX={};for(const k in SP)SPX[k]=SP[k];
// rocket sprites: 314 angles, drawn at integer position (7,8) in a 15x17 box
const NA=320,U=2*Math.PI/NA,RS=[];
for(let k=0;k<NA;k++){const a=(k<=NA/2?k:k-NA)*U;SCR.fill(0);const sv=R;R={x:7,y:8,vx:0,vy:0,a,thr:false};const st=state;state='fly';lv={w:0,...lv};drawRocket();R=sv;state=st;
 const c=Math.cos(a),s=Math.sin(a),wx=Math.round(7+s),wy=Math.round(8-c);
 const p=[];for(let y=0;y<17;y++)for(let x=0;x<15;x++)p.push(SCR[y*128+x]?1:0);RS.push({p,win:[wx,wy]})}
return JSON.stringify({L,RS,SP:SPX,MK})`));
// pack
const toPages=(px,W,H)=>{const P=Math.ceil(H/8),b=Buffer.alloc(W*P);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(px[y*W+x])b[(y>>3)*W+x]|=1<<(y&7);return b};
const REC=512+1024+1024,lev=Buffer.alloc(REC*100);
const KINDS=['bird','crow','gull','plane','sat','ufo','fish','puffer','bigshark','cablecar','gondola','ferry'];
const NA=320,AU=r=>Math.round(((r*NA/(2*Math.PI))%NA+NA)%NA);
function packMovers(h,o,mv){if(mv.length>3)throw 'too many movers';h[o+19]=mv.length;mv.forEach((m,q)=>{const p=o+20+q*20;const ki=KINDS.indexOf(m.k);if(ki<0)throw 'kind '+m.k;h[p]=ki;
 const W=(off,v)=>h.writeInt16LE(Math.max(-32768,Math.min(32767,Math.round(v))),p+off);const U16=(off,v)=>h.writeUInt16LE(Math.round(v)&65535,p+off);
 const M={wrap:0,bounce:1,wire:2,osc:3,static:4}[m.m];h[p+1]=M;
 if(M==0){W(2,m.x0*16);W(4,(m.mg||0)*16);W(6,m.vx*4096);W(8,0);W(10,m.y0*16);W(12,(m.ay||0)*16);U16(14,(m.wy||0)/(2*Math.PI)*65536);U16(16,(((m.ph||0)/(2*Math.PI))%1+1)%1*65536)}
 else if(M==1||M==2){W(2,m.x0*16);W(4,m.x1*16);W(6,m.vx*4096);W(8,(m.off||0)*16);if(M==1){W(10,m.y0*16);W(12,(m.ay||0)*16);U16(14,(m.wy||0)/(2*Math.PI)*65536);U16(16,(((m.ph||0)/(2*Math.PI))%1+1)%1*65536)}else{W(10,m.ya*16);W(12,m.yb*16)}}
 else if(M==3){W(2,m.x0*16);W(4,m.ax*16);U16(6,m.wx/(2*Math.PI)*65536);U16(8,(((m.ph||0)/(2*Math.PI))%1+1)%1*65536);W(10,m.y0*16);W(12,m.ay*16);U16(14,m.wy/(2*Math.PI)*65536)}
 else{W(2,m.x*16);W(4,m.rx*16);W(10,m.y0*16)}
 h[p+18]=(res.MK[m.k]&&res.MK[m.k].w)||0;h[p+19]=(res.MK[m.k]&&res.MK[m.k].h)||0;})}
res.L.forEach((l,i)=>{const o=i*REC,h=lev;h[o]=l.w;h[o+1]=(l.nowrap?1:0)|(l.water?2:0);h.writeUInt16LE(Math.round(l.g*65536),o+2);h.writeUInt16LE(Math.round(l.fuel*100),o+4);
 h[o+6]=l.pad.x&255;h[o+7]=l.pad.y&255;h[o+8]=l.pad.w;const t=l.tgt;h[o+9]=t.x&255;h[o+10]=t.y&255;h[o+11]=t.w;h[o+12]=t.px&255;h[o+13]=t.pw;h[o+14]=t.gy;
 if(l.star){h[o+15]=l.star[0];h[o+16]=l.star[1]&255;h[o+17]=Math.round(l.star[2]*40)&255}else h[o+15]=255;
 const fl=l.flats.slice(0,80);h[o+18]=fl.length;fl.forEach((f,q)=>{const p=o+192+q*4;h[p]=f[0]<0?0:Math.min(255,f[0]);h[p+1]=f[1]&255;h[p+2]=Math.min(255,f[0]<0?f[2]+f[0]:f[2]);h[p+3]=f[3]});
 if(l.flats.length>80)console.error('level',i+1,'flats',l.flats.length);
 h[o+1]|=0; toPages(l.bg,128,64).copy(h,o+512);toPages(l.mask,128,64).copy(h,o+512+1024);
 packMovers(h,o,l.mv);});
// sprites: per kind 2 frames, slot 160 bytes: w,h, white planes, black planes
const SPR=Buffer.alloc(KINDS.length*2*160);KINDS.forEach((k,ki)=>{const fr=res.SP[k];for(let f=0;f<2;f++){const rows=fr[Math.min(f,fr.length-1)],h=rows.length,w=rows[0].length,P=Math.ceil(h/8),o=(ki*2+f)*160;
 if(w*P*2+2>160)throw 'sprite too big '+k;SPR[o]=w;SPR[o+1]=h;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=rows[y][x];if(c=='#')SPR[o+2+(y>>3)*w+x]|=1<<(y&7);if(c=='x')SPR[o+2+w*P+(y>>3)*w+x]|=1<<(y&7)}}});
fs.writeFileSync(OUT+'/sprites.bin',SPR);
const rk=Buffer.alloc(320*48);res.RS.forEach((r,k)=>{toPages(r.p,15,17).copy(rk,k*48);rk[k*48+45]=r.win[0];rk[k*48+46]=r.win[1]});
fs.writeFileSync(OUT+'/levels.bin',lev);fs.writeFileSync(OUT+'/rocket.bin',rk);
console.log('levels',lev.length,'rocket',rk.length,'max flats',Math.max(...res.L.map(l=>l.flats.length)));
