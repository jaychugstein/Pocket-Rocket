const SCR=new Uint8Array(128*64),TMP=new Uint8Array(128*64);
let BCHU=0,BBL=0,BCDs=0,BST=[],BXX=64,BYY=58,BVX=0,BVY=0,BAA=0,BTH=false,PXO=0,PYO=0,HT=0,AUTOL=0,ALOCK=false;
function px(x,y,c=1){x=Math.round(x)+PXO;y=Math.round(y)+PYO;if(x<0||x>=128||y<0||y>=64)return;SCR[y*128+x]=c}
function hl(x,y,w,c=1){for(let i=0;i<w;i++)px(x+i,y,c)}
function vl(x,y,h,c=1){for(let i=0;i<h;i++)px(x,y+i,c)}
function fillR(x,y,w,h,c=1){for(let j=0;j<h;j++)hl(x,y+j,w,c)}
function fcirc(cx,cy,r,c=1){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r/2)px(cx+x,cy+y,c)}
function ocirc(cx,cy,r,c=1){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=x*x+y*y;if(d<=r*r+r/2&&d>(r-1)*(r-1)+(r-1)/2)px(cx+x,cy+y,c)}}
function line(x0,y0,x1,y1,c=1){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(;;){px(x0,y0,c);if(x0==x1&&y0==y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function h8(k){k&=255;k=(k*37+11)&255;k^=k>>3;k=(k*29+7)&255;return k}
const FT={'0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110',' ':'000000000000000','!':'010010010000010','?':'111001010000010','-':'000000111000000',':':'000010000010000','.':'000000000000010',',':'000000000010100',"'":'010010000000000','/':'001001010100100','+':'000010111010000',
A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101111011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111'};
function text(s,x,y){s=String(s);for(let i=0;i<s.length;i++){const g=FT[s[i]]||FT[' '];for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(g[r*3+c]=='1')px(x+i*4+c,y+r)}}
function ctext(s,y){text(s,Math.round(64-(String(s).length*4-1)/2),y)}
function star5(cx,cy,on){if(on){fillR(cx-1,cy-1,3,3);px(cx,cy-3);px(cx,cy+2);px(cx-3,cy-1);px(cx+3,cy-1);px(cx-2,cy+2);px(cx+2,cy+2)}else{px(cx,cy-2);px(cx-2,cy);px(cx+2,cy);px(cx-1,cy+2);px(cx+1,cy+2)}}
let LV_reset=0;let lives=3,gameOver=false,crashCnt=false,HI=0,HIL=0,titlePage=0;
try{HI=+localStorage.getItem('rcr_hi')||0;HIL=+localStorage.getItem('rcr_hl')||0}catch(e){}
function saveHi(){if(score>HI||(score==HI&&lv.i+1>HIL)){HI=score;HIL=lv.i+1;try{localStorage.setItem('rcr_hi',HI);localStorage.setItem('rcr_hl',HIL)}catch(e){}}}
let ft=0,mode='manual',autoWait=0,detail=false,shake=0;
const cur={},prev={},just={},down={};
function poll(){for(const k of['L','R','A','B']){const d=!!down[k];cur[k]=d;just[k]=d&&!prev[k];prev[k]=d}}
const rnd=Math.random;
let M={x:0,y:0,w:0,h:0};
function inM(x,y,g){return x>=M.x-g&&x<M.x+M.w+g&&y>=M.y-g&&y<M.y+M.h+g}
let REC=null;
function wideAt(x,y){for(const q of lv.S)if(q[2]>10&&q[3]<40&&x>=q[0]-1&&x<q[0]+q[2]+1&&y>=q[1]-1&&y<q[1]+q[3]+1&&q[1]<56)return true;for(const p of [tgt,pad])if(x>=p.x-2&&x<p.x+p.w+2&&y>=p.y-2)return true;return false}
function elem(f,mh=0,key){const o=REC;REC=[];f();const P=REC;REC=o;let ok;if(key&&lv.EC&&lv.EC[key]!==undefined)ok=lv.EC[key];else{let hit=0,n=P.length/2;for(let i=0;i<P.length;i+=2){const x=P[i],y=P[i+1];if(x<0||x>=128||y<0||y>=64){if(mh>0)hit++;continue}if(inM(x,y,2)||(lv.BM&&lv.BM[y*128+x]))hit++}ok=!(hit>mh*n);if(ok&&key&&/^(sk|py|syt)/.test(key)&&P.length){let my=0;for(let i=1;i<P.length;i+=2)if(P[i]>my)my=P[i];for(let i=0;i<P.length;i+=2){const x=P[i],y=P[i+1];if(y>=my-2&&x>=0&&x<128&&(inM(x,y,2)||wideAt(x,y))){ok=false;break}}}if(key){if(!lv.EC)lv.EC={};lv.EC[key]=ok}}if(!ok)return false;for(let i=0;i<P.length;i+=2)bpx(P[i],P[i+1]);return true}
function bpx(x,y){x=Math.round(x);y=Math.round(y);if(REC){REC.push(x,y);return}if(x<0||x>=128||y<0||y>=64)return;if(inM(x,y,2))return;if(lv.BM&&lv.BM[y*128+x])return;px(x,y)}
function stars(n,seed){for(let k=0;k<n;k++)bpx(h8(k*7+seed)%128,h8(k*13+seed+5)%46)}
function dith(x,y,w,h,m){for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(((x+i+y+j)&1)==0&&((i+j*2)%m==0))px(x+i,y+j)}
function dpx(x,y){if(((x+y)&1)==0)bpx(Math.round(x),Math.round(y))}
function dline(x0,y0,x1,y1){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy,n=0;for(;;){if((n++&1)==0)bpx(x0,y0);if(x0==x1&&y0==y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function dhl(x,y,w){for(let i=0;i<w;i++)dpx(x+i,y)}
function dvl(x,y,h){for(let i=0;i<h;i++)dpx(x,y+i)}
function twk(n,seed){const key=n+','+seed;if(!lv.TWC)lv.TWC={};let L=lv.TWC[key];
 if(!L){seed+=lv.si*37;const cols=11,rows=6,M=Math.min(cols*rows,Math.round((n*1.7+10)*0.5)),cells=[];for(let c=0;c<cols*rows;c++)cells.push([h8(c*31+seed*7)%997,c]);cells.sort((p,q)=>p[0]-q[0]);
  L=[];for(let i=0;i<M;i++){const c=cells[i][1],cx=c%cols,cy=(c/cols)|0,x=cx*11.6+3+h8(c*5+seed)%6,y=cy*8+2.5+h8(c*9+seed+3)%4;if(!(lv.TK&&lv.TK.some(k=>Math.abs(k.x-x)<10&&Math.abs(k.y-y)<9)))L.push([x,y,i])}lv.TWC[key]=L}
 for(const s of L)if((ft+s[2]*53)%840<660)bpx(s[0],s[1])}
function shoot(seed){const T=(ft+seed*97)%520;if(T<22){const x=20+h8(seed*13)%80+T*2,y=8+h8(seed*7)%14+T;for(let q=0;q<5;q++)bpx(x-q*2+q%2,y-q)}}
function seoulTower(cx){elem(()=>{
 for(let x=cx-15;x<=cx+15;x++){const u=(x-cx)/15;dpx(x,Math.round(51+u*u*6))}
 for(let y=29;y<=50;y++){const s=y<40?2:3;dpx(cx-s,y);dpx(cx+s,y)}
 dhl(cx-3,28,7);dhl(cx-4,22,9);for(let y=23;y<=25;y++){dpx(cx-5,y);dpx(cx+5,y)}dhl(cx-4,26,9);dhl(cx-2,20,5);
 for(let y=11;y<=19;y++)dpx(cx,y)},0.3);if(((ft>>5)&1)==0){bpx(cx,9)}}
function skyline(y0,seed,bw,sk){for(let i=-1;i<10;i++){const bx0=i*bw+(h8(seed+i)%4)-4;if(sk&&bx0<sk[1]&&bx0+bw-3>sk[0])continue;elem(()=>{const bx=i*bw+(h8(seed+i)%4)-4,b0=14+h8(i*3+seed)%16,tall=h8(i*7+seed*5)%3==0&&!(lv.TK&&lv.TK.some(k=>k.x>bx-6&&k.x<bx+bw+2&&k.y>y0-b0-24)),bh=b0+(tall?14:0),top=y0-bh;
  dhl(bx,top,bw-3);dvl(bx,top,bh);dvl(bx+bw-4,top,bh);if(tall){const ax=bx+((bw-4)>>1);dvl(ax,top-5,5)}
  for(let wy=top+3;wy<y0-1;wy+=4)for(let wx=bx+2;wx<bx+bw-5;wx+=3)if((h8(wx*3+wy+seed)+(ft>>8)*(h8(wx+wy)%2))%4==0)bpx(wx,wy)},0.3,'sk'+seed+'_'+i+'_'+y0)}}
let CLDS=[];
function cloud(x,y){if(elem(()=>cloud0(x,y)))CLDS.push([x,y])}
function cloudIn(x,y,cx,cy){if(y>cy)return false;for(const[ox,r]of[[5,4],[10,5],[15,3]]){const dx=x-cx-ox,dy=y-cy;if(dx*dx+dy*dy<=r*r)return true}return false}
function frontClouds(){for(const[cx,cy]of CLDS){for(let y=cy-5;y<=cy;y++)for(let x=cx;x<cx+19;x++)if(cloudIn(x,y,cx,cy)&&!inM(x,y,2)&&!(lv.BM&&lv.BM[y*128+x]))px(x,y,0);cloud0(cx,cy)}}
function cloud0(x,y){const arc=(cx,cy,r)=>{let n=0;for(let t=0;t<=r*8;t++){const an=3.1416+t/(r*8)*3.1416,X=Math.round(cx+Math.cos(an)*r),Y=Math.round(cy+Math.sin(an)*r);bpx(X,Y)}};for(let i=0;i<19;i++)bpx(x+i,y);arc(x+5,y,4);arc(x+10,y,5);arc(x+15,y,3)}
function ridge(y0,seed,amp,step){let py=null;for(let x=0;x<128;x++){const s=seed*1.7,h=(Math.sin(x*0.05+s)+Math.sin(x*0.11+s*2.3)*0.6+Math.sin(x*0.023+s*0.7)*0.8+2.4)/4.8,y=Math.round(y0-h*amp);dpx(x,y);if(py!=null)for(let q=Math.min(py,y);q<=Math.max(py,y);q++)dpx(x,q);py=y}}
function dome(cx,y,r){for(let a=0;a<=r*2;a++){const t=a/(r*2)*3.1416;dpx(Math.round(cx-r*Math.cos(t)),Math.round(y-r*Math.sin(t)))}dvl(cx,y-r-5,5);dhl(cx-1,y-r-5,3);dhl(cx-r-3,y,2*r+7)}
function deep(n){const I=lv.si,r=k=>h8(k*17+I*29+n*5);twk(24+(I%4)*5,I*3+1);
 if(I%3==1)shoot(I);
 }
function digloo(x,y){elem(()=>digloo0(x,y))}
function digloo0(x,y){for(let a=0;a<=16;a++){const t=a/16*3.1416;dpx(Math.round(x-8*Math.cos(t)),Math.round(y-6*Math.sin(t)))}dhl(x-9,y,19);dvl(x-4,y-3,3);dvl(x+4,y-3,3);dhl(x-4,y-3,9)}
function fwFx(I){const B=[[34,24,0],[68,17,47],[100,27,95],[52,31,140]],cyc=190;
   B.forEach((b,i)=>{const ft2=(ft+b[2]+I*31)%cyc,cx=b[0]+((I*7+i*11)%13)-6,cy=b[1]+((I*5+i*3)%7)-3;
    if(ft2<45){const t=ft2/45,y=Math.round(58+(cy-58)*(1-(1-t)*(1-t)));bpx(cx,y);if(ft2&1)bpx(cx,y+2);bpx(cx,y+4)}
    else if(ft2<135){const p=(ft2-45)/90,R=2+p*13,n=14;for(let k=0;k<n;k++){const an=k/n*6.283+i;if(p>0.6&&(k&1))continue;
      const X=Math.round(cx+Math.cos(an)*R),Y=Math.round(cy+Math.sin(an)*R+p*p*7);bpx(X,Y);if(p<0.45){const X2=Math.round(cx+Math.cos(an)*R*0.62),Y2=Math.round(cy+Math.sin(an)*R*0.62+p*p*4);bpx(X2,Y2)}}
     if(p<0.2){bpx(cx,cy);bpx(cx-1,cy);bpx(cx+1,cy);bpx(cx,cy-1);bpx(cx,cy+1)}}})}
const FWLV=[4,11,21,41,51,55];
function bg(w,v){bg0(w,v);if(!REC&&FWLV.indexOf(lv.si)>=0)fwFx(lv.si)}
function bg0(w,v){
 if(w==0){twk(16,3);
  if(v==0){cloud(10,16);cloud(88,10);skyline(58,2,15)}
  else if(v==1){if(lv.si==0){seoulTower(64);skyline(58,9,16,[54,76])}else skyline(58,9,16)}
  else{cloud(70,14);elem(()=>{dhl(14,14,12);dhl(16,12,6)});skyline(58,5,15)}}
 else if(w==1){twk(16,5);if(v!=1){elem(()=>{const m=v==0?100:60;for(let yy=-5;yy<=5;yy++)for(let xx=-5;xx<=5;xx++){const d1=xx*xx+yy*yy,d2=(xx-2)*(xx-2)+(yy+1)*(yy+1);if(d1<=27&&d2>16)bpx(m+xx,12+yy)}},0.2)}
  if(!lv.VEN){lv.VEN={};const tryP=(f,xs)=>{for(const x of xs){const o=REC;REC=[];f(x);const P=REC;REC=o;let hit=0;for(let i=0;i<P.length;i+=2){const X=P[i],Y=P[i+1];if(X<20&&Y<30||X>116&&Y<40||(lv.TK&&lv.TK.some(k=>Math.abs(k.x-X)<9&&Math.abs(k.y-Y)<9)))hit++;else if(X>=0&&X<128&&Y>=0&&Y<64&&(inM(X,Y,2)||(lv.BM&&lv.BM[Y*128+X])))hit++}if(!hit)return x}return null};
   lv.VEN.d=tryP(b=>{for(const[dx,r]of[[0,5],[13,6],[26,5]]){for(let a=0;a<=16;a++){const an=a/16*3.1416;bpx(b+dx+Math.round(Math.cos(an)*r),48-Math.round(Math.sin(an)*r))}}},[20,64,44,80,30]);
   lv.VEN.t=tryP(cx=>{for(let y=20;y<56;y++){bpx(cx-3,y);bpx(cx+3,y)}},[96,40,70,24,110,56,84,64,48,76,32,90,104])}
  if(lv.VEN.d!=null){const b=lv.VEN.d;elem(()=>{for(const[dx,r]of[[0,5],[13,6],[26,5]]){for(let a=0;a<=16;a++){const an=a/16*3.1416;dpx(b+dx+Math.round(Math.cos(an)*r),48-Math.round(Math.sin(an)*r))}dvl(b+dx,40-r,2)}dhl(b-6,48,40);dvl(b-6,48,8);dvl(b+32,48,8)},0.3)}
  if(lv.VEN.t!=null){const cx=lv.VEN.t;elem(()=>{dvl(cx-3,30,26);dvl(cx+3,30,26);dhl(cx-3,30,7);dhl(cx-3,26,7);dvl(cx-3,26,4);dvl(cx+3,26,4);dline(cx-3,26,cx,20);dline(cx+3,26,cx,20)},0.3)}}
 else if(w==2){let lastX=-99;twk(6,0);
  if(lv.si==22||lv.si==27){const sx=lv.si==22?100:26,sy=lv.si==22?22:24,R=lv.si==22?12:8;elem(()=>{for(let y=-R;y<=R;y++)for(let x=-R;x<=R;x++)if(x*x+y*y<=R*R&&!(y>-1&&((y+R)%3==0)))bpx(sx+x,sy+y)})}
  const pyr=(cx,h)=>elem(()=>{const w=Math.round(h*1.2);dline(cx,57-h,cx-w,57);dline(cx,57-h,cx+w,57)},0.5,'py'+cx+'_'+h);
  if(lv.si==20){const tk=lv.TK&&lv.TK[0],P=(x,y)=>{if(tk&&Math.abs(tk.x-x)<8&&Math.abs(tk.y-y)<8)return;if(x<20&&y<30)return;bpx(x,y)},DL=(x0,y0,x1,y1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k+=2)P(Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n))};
   for(const[cx,h]of[[72,30],[50,14],[94,12]]){const w=Math.round(h*1.15),top=58-h;for(let r=1;r<=h;r++){const y=top+r,hw=Math.round(w*r/h);for(let x=cx-hw+1;x<cx+hw;x++)px(x,y,0)}DL(cx,top,cx-w,58);DL(cx,top,cx+w,58);DL(cx,top,cx+Math.round(w*0.35),58)}}
  if(lv.si==20){}else if(lv.PYR){for(const c of lv.PYR)pyr(c[0],c[1])}else{const I=lv.si,C=[];lv.PYR=[];for(const h of [30,26,22,18,14,10])for(let cx=12;cx<=116;cx+=4)C.push([cx,h]);let n=0;const want=3;
   const sc=c=>{const h=c[1],w=Math.round(h*1.2),cx=c[0];let hit=0,tot=0;for(let t=0;t<=w;t++){const y=57-Math.round(h*(1-t/w));for(const x of [cx-t,cx+t]){tot++;if(inM(x,y,2)||lv.BM[y*128+x])hit++}}return hit/tot};
   const ok=C.filter(c=>c[0]-Math.round(c[1]*1.2)>=1&&c[0]+Math.round(c[1]*1.2)<=126&&sc(c)<=0.4&&!(lv.TK&&lv.TK.some(k=>{const w=c[1]*1.2,dy=57-k.y;if(dy<-4||dy>c[1]+6)return false;const hx=(c[1]-dy)/c[1]*w;return Math.abs(Math.abs(k.x-c[0])-hx)<7||Math.abs(k.x-c[0])<4})));ok.sort((a,b)=>b[1]-a[1]||((a[0]*7+I*13)%11)-((b[0]*7+I*13)%11));
   for(const c of ok){if(n>=want)break;if(lv.PYR.some(p=>Math.abs(p[0]-c[0])<(p[1]+c[1])*0.75))continue;if(pyr(c[0],c[1])){lv.PYR.push(c);n++}}}}
 else if(w==3){twk(70,6);elem(()=>{const ex=v==1?62:108;for(let a=0;a<24;a++){const an=a/24*6.283;bpx(ex+Math.cos(an)*4,10+Math.sin(an)*4)}bpx(ex-1,9);bpx(ex+1,11)},0.2);elem(()=>{const b=v==2?16:60;for(const[dx,r]of[[0,6],[16,4]]){for(let a=0;a<=14;a++){const an=a/14*3.1416;dpx(b+dx+Math.round(Math.cos(an)*r),58-Math.round(Math.sin(an)*r))}}dvl(b+16,46,8)},0.3)}
 else if(w==4){twk(14,2);
  if(v==0){cloud(14,14);cloud(84,20)}
  else if(v==1){cloud(60,12)}
  else{elem(()=>{dhl(14,14,14);dhl(17,12,7)});cloud(90,18)}}
 else if(w==5){const I=lv.si;twk(14,I+3);elem(()=>{const m=(I%2)?100:30;for(let yy=-5;yy<=5;yy++)for(let xx=-5;xx<=5;xx++){if(xx*xx+yy*yy<=27&&!((xx-2)*(xx-2)+(yy+1)*(yy+1)<=18))bpx(m+xx,11+yy)}},0.1,'mn');
  if(I!=59){skyline(56,I*3+1,14);const tx=[44,64,84,52,76][I%5];elem(()=>{for(let y=22;y<56;y+=2){bpx(tx-1,y);bpx(tx+1,y)}dhl(tx-4,15,9);dhl(tx-4,21,9);dvl(tx-4,15,7);dvl(tx+4,15,7);dhl(tx-2,13,5);dvl(tx,5,8)},0.35,'syt')}}
 else if(w==6){deep(2)}
 else if(w==7){twk(10,1);for(let k=0;k<26;k++){const sx=((h8(k*5+1)%128)+Math.round(Math.sin((ft+k*40)*0.02)*3)+128)%128,sy=Math.floor((h8(k*9+2)%60)+ft*(0.12+(k%3)*0.05))%60;bpx(sx,sy)}
  if(v==0){for(let x=0;x<128;x++)dpx(x,12+Math.round(Math.sin(x*0.06+ft*0.012)*4));digloo(70,56)}
  else if(v==1){digloo(30,56)}
  else{digloo(64,56)}}
else if(w==8){const I=lv.si;
  for(let k=0;k<34;k++){const bx=h8(k*7+I)%126,sy=Math.floor(h8(k*11+I*3)%64-ft*(0.05+(k%3)*0.03)+640)%64;if(sy>12)bpx(bx+Math.round(Math.sin((ft+k*20)*0.02)*2),sy)}
  for(let k=0;k<2;k++)elem(()=>{const rx=8+h8(k*17+I)%100;dhl(rx,57,10);dhl(rx+2,56,6);dhl(rx+3,55,3)})}
 else if(lv.W.k=='rio'){const I=lv.si;twk(16,I+9);if(I==96)elem(()=>{const cx=32,cy=12,CR=new Set(['-2,-2','-3,-1','-2,-1','2,1','3,1','2,2','-1,3','3,-3','4,-2']);for(let yy=-6;yy<=6;yy++)for(let xx=-6;xx<=6;xx++)if(xx*xx+yy*yy<=40&&!CR.has(xx+','+yy))bpx(cx+xx,cy+yy)},0.1);else if(I!=93&&I!=94)elem(()=>{const m=I==95?30:(I%2)?100:30;for(let yy=-5;yy<=5;yy++)for(let xx=-5;xx<=5;xx++){if(xx*xx+yy*yy<=27&&!((xx-2)*(xx-2)+(yy+1)*(yy+1)<=18))bpx(m+xx,11+yy)}},0.1);
  const bad=(x,y)=>x<0||x>127||y<0||y>63||inM(x,y,2)||lv.BM[y*128+x]||(x<20&&y<30)||(x>116&&y<40)||(lv.TK&&lv.TK.some(k=>Math.abs(k.x-x)<8&&Math.abs(k.y-y)<8));
  if(lv.RB===undefined){lv.RB=null;const kind=9;const shapes=[];
   if(kind==0){for(const hh of [30,26,22,18])for(let cx=26;cx<=102;cx+=3){if(shapes.length)break;const P=[];const hw=hh*1.3;for(let x=Math.round(cx-hw);x<=Math.round(cx+hw);x+=2){const u=(x-cx)/hw,y=Math.round(57-hh*(1-u*u)*(0.75+0.25*Math.cos(u*3.1)));P.push([x,y])}const ty=57-hh;const ST=[[0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[-1,-5],[-2,-5],[-3,-5],[1,-5],[2,-5],[3,-5],[0,-7],[-1,-1],[1,-1]];for(const[dx,dy]of ST)P.push([cx+dx,ty+dy]);let hit=0;for(const[x,y]of P)if(bad(x,y))hit++;if(hit<=P.length*0.25){shapes.push(P);break}}}
   else if(kind==1){for(const hh of [28,24,20,16])for(let cx=40;cx<=100;cx+=3){if(shapes.length)break;const P=[];for(const[ox,h2,r]of[[0,hh,hh*0.55],[-hh*1.1,hh*0.45,hh*0.4]]){const c2=Math.round(cx+ox);for(let a=0;a<=24;a++){const an=a/24*3.1416,x=Math.round(c2+Math.cos(an)*r),y=Math.round(57-Math.sin(an)*h2);if(a%1==0)P.push([x,y])}}let hit=0;for(const[x,y]of P)if(bad(x,y))hit++;if(hit<=P.length*0.1){shapes.push(P);break}}}
   if(shapes.length)lv.RB=shapes[0]}
  if(lv.RB)for(const[x,y]of lv.RB)bpx(x,y);
  for(const m of lv.MV)if(m.k=='cablecar'&&m.wa){const[ax,ay,bx,by]=m.wa;for(let x=ax;x<=bx;x+=2){const y=Math.round(ay+(x-ax)*(by-ay)/(bx-ax));px(x,y)}for(const[x,y]of[[ax,ay],[bx,by]]){let gy=y+1;while(gy<64&&!solidAt(x,gy))gy++;for(let q=y;q<gy;q++)px(x,q);hl(x-1,y,3)}}}
 else if(w==10){const I=lv.si;twk(16,I+5);if(lv.si!=109)elem(()=>{const m=(I%2)?98:34;for(let yy=-5;yy<=5;yy++)for(let xx=-5;xx<=5;xx++){if(xx*xx+yy*yy<=27&&!((xx-2)*(xx-2)+(yy+1)*(yy+1)<=18))bpx(m+xx,12+yy)}},0.1);
  const tow=(cx,top,base)=>{const H=base-top;for(let y=top;y<=base;y++){const u=(y-top)/H,hw=Math.round(0.5+Math.pow(u,2.3)*H*0.42);dpx(cx-hw,y);dpx(cx+hw,y)}const p1=top+Math.round(H*0.62),p2=top+Math.round(H*0.3);const w1=Math.round(0.5+Math.pow(0.62,2.3)*H*0.42)+2,w2=Math.round(0.5+Math.pow(0.3,2.3)*H*0.42)+1;dhl(cx-w1,p1,2*w1+1);dhl(cx-w2,p2,2*w2+1);for(let a=0;a<=10;a++){const an=a/10*3.1416,r=Math.round(Math.pow(0.85,2.3)*H*0.42);dpx(cx+Math.round(Math.cos(an)*r*0.7),base-Math.round(Math.sin(an)*H*0.12))}dvl(cx,top-4,4)};
  if(lv.PAR===undefined){lv.PAR=null;if(lv.si%2==0&&lv.si!=100&&lv.si!=109)for(const cx of [64,52,76,40,88,30,98]){const o=REC;REC=[];tow(cx,18,58);const P=REC;REC=o;let hit=0,bh=0;for(let i=0;i<P.length;i+=2){const X=P[i],Y=P[i+1];if(inM(X,Y,3)||lv.BM[Y*128+X]||(lv.TK&&lv.TK.some(k=>Math.abs(k.x-X)<7&&Math.abs(k.y-Y)<7))){hit++;if(Y>=55&&wideAt(X,Y))bh++}}if(bh==0&&hit<=24&&(lv.PAR==null||hit<lv.PH)){lv.PAR=cx;lv.PH=hit}}}
  if(lv.PAR!=null)tow(lv.PAR,18,58);}
}
function mkBM(){const B=new Uint8Array(8192),m=(x,y,w,h,g)=>{for(let j=Math.max(0,y-g);j<Math.min(64,y+h+g);j++)for(let i=Math.max(0,x-g);i<Math.min(128,x+w+g);i++)B[j*128+i]=1};
 lv.S.forEach((s,i)=>{if(!lv.K[i].startsWith('sp:'))m(s[0],s[1],s[2],s[3],1)});
 const t=tgt,fx=(t.px+t.pw+2<124&&(t.px+t.pw+8<121||t.gy-11>38))?t.px+t.pw+2:t.px-3;m(t.x,t.y-1,t.w,t.gy-t.y,1);m(pad.x,pad.y-1,pad.w,3,1);lv.BM=B}
function eRows(cx,cy,rx,ry,top,f){for(let y=Math.round(cy-ry);y<=Math.round(cy+ry);y++){if(top!=null&&y<top)continue;const q=1-((y-cy)/ry)**2;if(q<0)continue;f(y,rx*Math.sqrt(q))}}
function drawDisc(d){
 eRows(d.cx,d.cy,d.rx,d.ry,d.top,(y,hw)=>{const L=Math.round(d.cx-hw),Rr=Math.round(d.cx+hw);hl(L,y,Rr-L+1)});
 const k=d.kind,cx=Math.round(d.cx),cy=Math.round(d.cy);
 if(k=='planet'){const pv=lv.si%5;eRows(d.cx,d.cy,d.rx,d.ry,d.top,(y,hw)=>{const L0=Math.round(d.cx-hw)+2,R0=d.cx+hw-1;
   if(pv==0){const m=((y-cy)%6+6)%6;if(m==2)for(let x=L0;x<R0;x+=2)px(x,y,0)}
   else if(pv==1){const m=((y-cy)%8+8)%8;if(m<2)for(let x=L0;x<R0;x++)if(((x+y)&1)==0)px(x,y,0)}
   else if(pv==2){for(let x=L0;x<R0;x++)if(((x-cx)%6+6)%6==0&&((y+x)&1)==0)px(x,y,0)}
   else if(pv==3){const m=((y-cy)%5+5)%5;if(m==1||m==3)for(let x=L0+(m==3?1:0);x<R0;x+=4)px(x,y,0)}
   else{for(let x=L0;x<R0;x++)if((((x+y)%7)+7)%7==0)px(x,y,0)}});
  if(pv==0){ocirc(cx-5,cy+6,2,0);ocirc(cx+6,cy+9,1,0)}
  else if(pv==1){ocirc(cx+4,cy-3,2,0);ocirc(cx-6,cy+9,1,0)}
  else if(pv==2){ocirc(cx-7,cy+3,1,0);ocirc(cx+5,cy+7,2,0);ocirc(cx+2,cy-7,1,0)}
  else if(pv==3){ocirc(cx-3,cy+8,2,0);ocirc(cx+7,cy+4,1,0)}
  else{ocirc(cx+6,cy+8,2,0);ocirc(cx-5,cy+4,1,0);ocirc(cx-1,cy-6,1,0)}}
 else if(k=='moon'){ocirc(cx-1,cy+1,1,0)}
 else if(k=='ast'){ocirc(cx-1,cy,1,0);px(cx+d.rx-3,cy-1,0);px(cx-2,cy+d.ry-2,0)}
 else if(k=='mine'){const on=(ft>>4)&1;for(const a of [[-6,0],[6,0],[0,-6],[0,6],[-4,-4],[4,-4],[-4,4],[4,4]])px(cx+a[0],cy+a[1]);px(cx,cy,on?0:1);px(cx-1,cy,0);px(cx+1,cy,0)}
 else if(k=='hab'){hl(cx-d.rx+2,cy,2*d.rx-3,0);px(cx-2,cy+d.ry,1);px(cx+2,cy+d.ry,1)}
 else if(k=='wxb'){px(cx-1,cy-1,0);dline2(cx,cy+d.ry,cx,cy+d.ry+5)}
 else if(k=='balloon'){px(cx-2,cy-3,0);px(cx-3,cy-2,0);const by=Math.round(d.cy+d.ry);px(cx,by,1);px(cx-1,by+1,1);px(cx+1,by+1,1);const fl=lv.W&&lv.W.fl;const len=d.cy>30&&fl?(fl-by-3):4;for(let q=0;q<len;q+=2)px(cx+((q>>2)&1?1:0),by+2+q)}
}
function dline2(x0,y0,x1,y1){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i+=2)px(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n)}
const OB={frondL:1,kelp:1,cor:1,clam:1,spg:1,post:1,rockc:1,obe:1,ice:1,stk:1,pole:1,flag:1,cdl:1,bldg:1,mast:1,tank:1,leg:1,cac:1,mesa:1,tri:1,bld:1,trk:1,frond:1,mtn:0,fav:1,lmp:1,lmh:1,pier:1,mpl:1,brg:1,cmp:1,dm:1};
function ob(k,x,y,w,h){
 if(k=='frondL'){const P=['....#######....','..###.###.###..','.##...#.#...##.','##...#..#..#..#','#...#...#...#..','...#....#....#.'];for(let r=0;r<6;r++)for(let c=0;c<15;c++)if(P[r][c]=='#')px(x+c,y+r,1);return}
 if(k=='frond'){const P=['...#####...','.##.###.##.','###..#..###','##..###..##','#....#....#'];for(let r=0;r<5;r++)for(let c=0;c<11;c++)if(P[r][c]=='#'&&c<w)px(x+c,y+r,1);return}
 if(k.startsWith('sp:')){const kn=k.slice(3),S=SP[kn];if(S){const fr=(ft>>3)&1;spr(S[Math.min(S.length-1,fr)],x+(w>>1),y+(h>>1)+((kn=='ufo'||kn=='sat')?Math.round(Math.sin(ft*0.09+x)):0),((x*7)&1)==1)}return}
 fillR(x,y,w,h,1);
 if(k=='lmh'){fillR(x,y,w,h,0);const pi=lv.S.findIndex((s,q)=>lv.K[q]=='lmp'&&Math.abs(s[1]-(y+h))<=1&&s[0]>=x-1&&s[0]<=x+w),ps=pi>=0?lv.S[pi]:[x,0,2,0],L=ps[0]<=x+w/2;
  const px0=L?x:x+w-2,hx=L?x+w-4:x;fillR(px0,y,2,h);hl(x+(L?0:1),y,w-1);hl(hx,y+1,4);hl(hx+(L?1:0),y+2,3);
  const n=h8(((ft>>2)+x*13)&255)%13,on=n>1&&!(((ft+x*7)%170)<8&&((ft>>1)&1));if(on){hl(hx+(L?1:0),y+3,3);if(!solidAt(hx+(L?2:1),y+h))px(hx+(L?2:1),y+h)}return}
 if(k=='fav'){for(let wy=y+2;wy<y+h-1;wy+=4)for(let wx=x+2;wx<x+w-2;wx+=4)if(h8(wx*5+wy*3)%3)fillR(wx,wy,2,2,0);hl(x,y+1,w,0);hl(x,y+1,w);return}
 if(k=='pier'){fillR(x,y,w,h,0);hl(x,y,w);hl(x,y+1,w);for(let xx=x+1;xx<x+w;xx+=4){vl(xx,y+2,64-y-2)}for(let xx=x+2;xx<x+w-1;xx+=3)px(xx,y+1,0);return}
 if(k=='mpl'){for(let yy=y+2;yy<y+h;yy+=4){px(x+1,yy,0);px(x,yy+1,0);px(x+2,yy-1,0)}return}
 if(k=='brg'){if(h<=3){for(let xx=x+2;xx<x+w-2;xx+=2)px(xx,y+1,0);const fl=lv.W.fl||60,k2=Math.min(6,fl-y-5);if(k2>1)for(let xx=x+3;xx<x+w-3;xx++){const u=(xx-(x+w/2))/((w-6)/2);if((xx&1)==0)px(xx,y+3+Math.round(u*u*k2))}}else{vl(x+1,y+1,h-1,0)}return}
 if(k=='cmp'){fillR(x+2,y+2,3,4,0);px(x+3,y+1,0);vl(x+3,y+8,Math.max(0,h-9),0);return}
 if(k=='dm'){if(((y>>1)&1)==0&&w>6){for(let xx=x+2;xx<x+w-2;xx+=3)px(xx,y,0)}return}
 if(k=='mast'){for(let yy=y+1;yy<y+h-4;yy+=5){line(x+1,yy,x+w-2,yy+4,0);line(x+w-2,yy,x+1,yy+4,0)}}


 else if(k=='kelp'){fillR(x,y,w,h,0);for(let yy=y;yy<y+h;yy++){const rr=yy-y,s=x+1+(((rr>>3)+(ft>>5))&1);px(s,yy,1);px(s+1,yy,1);if(rr%4<2){const L=((rr>>2)&1);px(L?s-1:s+2,yy,1);if(rr%4==0)px(L?s-1:s+2,yy-1,1)}}}
 else if(k=='cor'){for(let xx=x;xx<x+w;xx+=2)px(xx,y,0);for(let q=0;q<Math.floor(w*h/9);q++)px(x+1+h8(x+q*7)%Math.max(1,w-2),y+1+h8(y+q*5)%Math.max(1,h-1),0)}
 else if(k=='clam'){if(LIT[curI]){fillR(x,y,w,Math.min(3,h),0);hl(x+1,y-2,w-2);hl(x+2,y-3,w-4);px(x+(w>>1),y+1);px(x+(w>>1)+1,y+1);if(((ft>>3)&1))px(x+(w>>1)-1,y-1)}else{for(let xx=x+2;xx<x+w-1;xx+=2)vl(xx,y+1,Math.min(3,h-1),0);hl(x,y+h-2,w,0)}}
 else if(k=='spg'){fillR(x+1,y,w-2,2,0);for(let yy=y+4;yy<y+h-1;yy+=3)for(let xx=x+1+((yy>>1)&1);xx<x+w-1;xx+=3)px(xx,yy,0)}
 else if(k=='pole'){}
 else if(k=='rockc'){if(w>6)px(x+2,y+1,0);if(h>3&&w<=4)for(let yy=y+2;yy<y+h;yy+=3)px(x+1,yy,0)}
 else if(k=='obe'){vl(x+(w>>1),y+2,Math.max(1,h-4),0)}
 else if(k=='ice'){for(let yy=y+2;yy<y+h-3;yy+=6)line(x+1,yy,x+w-2,yy+3,0)}
 else if(k=='stk'){px(x+1,y+1,0);px(x+w-2,y+h-2,0)}
 else if(k=='cst'){for(let xx=x+4;xx<x+w-4;xx+=2)px(xx,y,0);const c=x+(w>>1);fillR(c-1,y+h-3,3,3,0);px(c,y+h-4,0);if(h>7&&w>=11){px(x+2,y+2,0);px(x+w-3,y+2,0)}}
 else if(k=='cstt'){px(x+1,y,0)}
 else if(k=='flag'){for(let r=0;r<h;r++)if(((ft>>3)+r)&1)px(x+w-1,y+r,0);px(x+w-2,y+h-1,0)}
 else if(k=='cdl'&&lv.w==9){fillR(x-1,y-3,5,3,0);for(let j=0;j<3;j++)for(let i=0;i<5;i++)if(((i+j)&1)==0)px(x-1+i,y-3+j);px(x+1,y-2,LIT[curI]?1:0);if(LIT[curI]){const f=(ft>>2)&1;for(const o of [[-3,-2],[5,-2],[1,-6],[-2,-5],[4,-5]])px(x+o[0],y+o[1]+(f?0:1));hl(x-4,y-2,2);hl(x+4,y-2,2);}}
 else if(k=='cdl'){for(let yy=y+1;yy<y+h;yy+=3)px(x+(((yy-y)/3|0)&1?0:2),yy,0);if(LIT[curI]){const f=(ft>>2)%3;px(x+1,y-1);if(f!=1)px(x+1,y-2);if(f==2)px(x+1,y-3)}}
 else if(k=='bldg'){for(let wy=y+3;wy<y+h-2;wy+=4)for(let wx=x+2;wx<x+w-2;wx+=4)if(h8(wx*3+wy)%5)fillR(wx,wy,2,2,0)}
 else if(k=='chim'){for(let yy=y+2;yy<y+h;yy+=3){hl(x,yy,w,0);for(let xx=x+(((yy-y)/3|0)&1?1:3);xx<x+w;xx+=4)vl(xx,yy+1,2,0)}
  }
 else if(k=='tank'){hl(x,y+3,w,0)}
 else if(k=='cac'){if(w>=3)for(let yy=y+2;yy<y+h;yy+=4)px(x+1,yy,0)}
 else if(k=='mesa'){for(let yy=y+3;yy<y+h;yy+=4)hl(x,yy,w,0);px(x,y,0);px(x+w-1,y,0)}
 else if(k=='tri'){if(w>=4)px(x+((w*0.35)|0),y+(h>1?1:0),0)}
 else if(k=='bld'){px(x,y,0);px(x+w-1,y,0);px(x,y+h-1,0);px(x+w-1,y+h-1,0);for(let c=0;c<Math.max(1,w>>2);c++){const cx=x+2+h8(x+c*5)%Math.max(1,w-4),cy=y+2+h8(y+c*3)%Math.max(1,h-4);px(cx,cy,0);px(cx+1,cy,0)}}
 else if(k=='trk'){for(let yy=y+1;yy<y+h;yy+=3)px(x+1,yy,0)}
 else if(k=='frond'){for(let xx=x+2;xx<x+w-1;xx+=3)vl(xx,y+1,3,0);px(x,y+4,0);px(x+w-1,y+4,0)}
}
let curI=0;
function drawSolid(s,k,w){if(s[1]>=62&&k[0]=="s"&&k[1]=="p")return;
 const x=s[0],y=s[1],w2=s[2],h=s[3];if(k=='d'||k=='snow')return;
 if(k=='pipe'){fillR(x,y,w2,h,0);hl(x,y,w2);hl(x,y+2,w2);vl(x,y,3);vl(x+w2-1,y,3);vl(x+1,y+3,h-3);vl(x+w2-2,y+3,h-3);hl(x+1,y+6,w2-2);return}
 if(OB[k]||k.startsWith('sp:')){ob(k,x,y,w2,h);return}
 if(k=='jes'){fillR(x,y,w2,h);return}
 if(k=='hull'){fillR(x,y,w2,h);for(let xx=x+2;xx<x+w2-2;xx+=3)px(xx,y+1,0);return}
 if(k=='mst'||k=='sail'){fillR(x,y,w2,h);return}
 if(k=='pyl'){fillR(x,y,w2,h);for(let yy=y+4;yy<y+h;yy+=4)for(let xx=x+1;xx<x+w2-1;xx+=2)px(xx,yy,0);if(h>12){fillR(x+2,y+5,w2-4,6,0);px(x+2,y+5);px(x+w2-3,y+5)}hl(x-1,y,w2+2);return}
 if(k=='opb'){fillR(x,y,w2,h);for(const yy of [y+2,y+5,y+8])if(yy<y+h)hl(x+1,yy,w2-2,0);return}
 if(k=='opr'){px(x-1,y,0);fillR(x,y,w2,h);if(w2>=5)for(let xx=x+2;xx<x+w2-1;xx++)if(((xx-y*2)%6+6)%6==0)px(xx,y,0);return}
 if(k=='nam'){fillR(x,y,w2,h);if(w2>=9)for(let xx=x+1;xx<x+w2-1;xx+=2)px(xx,y,0);if(h>8)for(let yy=y+2;yy<y+h-1;yy+=3)px(x+(w2>>1),yy,0);return}
 if(k=='brd'){fillR(x,y,w2,h);for(let xx=x+1;xx<x+w2;xx+=4)px(xx,y+1,0);for(let xx=x+2;xx<x+w2;xx+=6){px(xx,y-2);if(((ft>>4)+xx)%3==0)px(xx,y-3)}return}
 if(k=='brp'){fillR(x,y,w2,h);vl(x+(w2>>1),y+2,h-4,0);return}
 if(k=='eif'){fillR(x,y,w2,h);if(w2>=7)for(let xx=x+2;xx<x+w2-2;xx++){const q=xx-64;if(((q+y)&3)==0||((q-y)&3)==0)px(xx,y,0)}return}
 if(k=='arcc'){fillR(x,y,w2,h);hl(x+1,y+1,w2-2,0);return}
 if(k=='arca'){fillR(x,y,w2,h);for(let xx=x+2;xx<x+w2-2;xx+=3)px(xx,y+2,0);hl(x+2,y+4,w2-4,0);return}
 if(k=='arcp'){fillR(x,y,w2,h);if(h>10){vl(x+2,y+3,h-6,0);vl(x+w2-3,y+3,h-6,0);hl(x+2,y+3,w2-4,0);hl(x+2,y+h-4,w2-4,0)}return}
 if(k=='mor'){fillR(x,y,w2,h);hl(x,y+1,w2,0);if(h>8){fillR(x+2,y+3,w2-4,h-6,0);for(let yy=y+4;yy<y+h-4;yy+=2)px(x+3,yy)}hl(x-1,y+h-2,w2+2);return}
 if(k=='morc'){px(x+2,y);hl(x+1,y+1,3);hl(x,y+2,5);hl(x-1,y+3,7);return}
 if(k=='gift'){fillR(x,y+3,w2,h-3);const c=x+(w2>>1);vl(c,y+3,h-3,0);hl(x,y+6,w2,0);for(const[dx,dy]of[[-3,0],[-2,0],[2,0],[3,0],[-4,1],[-1,1],[1,1],[4,1],[-3,2],[-2,2],[0,2],[2,2],[3,2]])px(c+dx,y+dy);return}
 if(k=='jesp'){fillR(x,y,w2,h);for(let yy=y+2;yy<y+h;yy++)for(let xx=x+2;xx<x+w2-1;xx+=3)px(xx,yy,0);return}
 if(k=='mtn'){fillR(x,y,w2,h,0);px(x,y);px(x+w2-1,y);px(x,y+1);px(x+w2-1,y+1);const above=lv.S.some((s,q)=>lv.K[q]=='mtn'&&s[1]==y-2&&x>=s[0]-1&&x+w2<=s[0]+s[2]+1);if(!above)hl(x,y,w2);else{const p=lv.S.find((s,q)=>lv.K[q]=='mtn'&&s[1]==y-2&&s[0]<x+w2&&s[0]+s[2]>x);if(p){hl(x,y,p[0]-x+1);hl(p[0]+p[2]-1,y,x+w2-(p[0]+p[2])+1)}}for(let xx=x+2;xx<x+w2-2;xx++)if(((xx+y)%4)==0&&h8(xx*3+y)%3)px(xx,y+1);return}
 fillR(x,y,w2,h,0);
 const bot=y+h>=64;
 if(k=='wat'){for(let xx=x;xx<x+w2;xx++){const ph=((xx+(ft>>3))>>1)&3;px(xx,y+(ph==0||ph==3?0:1));if(((xx+(ft>>3)+3)>>1&3)<2)px(xx,y+3)}for(let xx=x+2;xx<x+w2;xx+=6)px(xx,y+5);if(h>9)for(let yy=y+8;yy<y+h;yy+=3)for(let xx=x+((yy*5+(ft>>4))%7);xx<x+w2;xx+=7){px(xx,yy);px(xx+1,yy)}return}
 if(k=='sea'){hl(x,y,w2);for(let xx=x;xx<x+w2;xx++){const q=h8(xx*5+2)%8;if(q==0)px(xx,y-1);if(q==1&&(xx&1))px(xx,y-1)}for(let yy=y+2;yy<y+h;yy+=3)for(let xx=x+((yy>>1)&1)*3;xx<x+w2;xx+=6)px(xx,yy);return}
 if(k=='sand'){hl(x,y,w2);for(let xx=x;xx<x+w2;xx++){const q=h8(xx*7+1)%9;if(q==0)px(xx,y-1);}for(let yy=y+3;yy<y+h;yy+=3)for(let xx=x+((yy>>1)&1)*3;xx<x+w2;xx+=6)px(xx,yy);for(let xx=x+5;xx<x+w2-4;xx+=29){px(xx,y+2);px(xx+1,y+2);px(xx,y+3)}return}
 if(k=='lawn'){hl(x,y,w2);for(let xx=x;xx<x+w2;xx++){const hh2=h8(xx*5+3)%5;if(hh2==0){px(xx,y-1);px(xx+1,y-2)}else if(hh2==1)px(xx,y-1)}for(let yy=y+3;yy<y+h;yy+=3)for(let xx=x+((yy>>1)&1)*2;xx<x+w2;xx+=5)px(xx,yy);return}
 if(k=='pav'){hl(x,y,w2);for(let yy=y+2;yy<y+h;yy+=3){hl(x,yy,w2);for(let xx=x+(((yy-y)/3|0)&1?2:5);xx<x+w2;xx+=7)vl(xx,yy+1,2,0)}return}
 if(k=='st'){hl(x,y,w2);for(let xx=x+2;xx<x+w2;xx+=8)hl(xx,y+2,4);return}
 if(k=='tbl'){hl(x,y,w2);for(let yy=y+1;yy<y+h;yy++)for(let xx=x;xx<x+w2;xx++)if((((xx>>1)+(yy>>1))&1)==0&&yy<y+5)px(xx,yy);return}
 if(k=='ck1'||k=='ck2'){hl(x,y,w2);vl(x,y,h);vl(x+w2-1,y,h);if(k=='ck1'){fillR(x,y,w2,2);for(let xx=x+1;xx<x+w2-1;xx+=4){vl(xx,y+2,1+h8(xx*3)%3);}hl(x,y+h-1,w2)}
  else{for(let xx=x+1;xx<x+w2-1;xx+=3)px(xx,y+1+(xx&1));hl(x,y+3,w2);for(let yy=y+5;yy<y+h-1;yy++)for(let xx=x+2;xx<x+w2-2;xx++)if(h8(xx*7+yy*13)%17==0)px(xx,yy)}
  return}
 if(k=='cd'){const f=(ft>>2)%3;if(LIT[curI]){if(f!=1)px(x+1,y);if(f==2)px(x+1,y-1)}hl(x,y+1,3);px(x+1,y+2);
  for(let yy=y+3;yy<y+h;yy++){if(((yy-y)>>1)&1)hl(x,yy,3);else{px(x,yy);px(x+2,yy)}}return}
 if(k=='hl'){hl(x,y,w2);return}
 hl(x,y,w2);vl(x,y,h);vl(x+w2-1,y,h);if(!bot)hl(x,y+h-1,w2);
 if(k=='s'){px(x,y,0);px(x+w2-1,y,0);px(x,y+h-1,0);px(x+w2-1,y+h-1,0);
  if(w==9){for(let xx=x+6;xx<x+w2-2;xx+=6)vl(xx,y+1,h-2);hl(x+1,y+2,w2-2)}
  else if(w==6){dith(x+1,y+1,w2-2,h-2,4)}
  else{for(let c=0;c<Math.max(1,w2>>3);c++){const cx=x+3+h8(x+c*5)%Math.max(1,w2-6),cy=y+2+h8(y+c*3)%Math.max(1,h-4);px(cx,cy);px(cx+1,cy)}}
  return}
 if(w==5&&k=='g'){hl(x+1,y+2,w2-2);for(let wy=y+5;wy<y+h-2;wy+=5)for(let wx=x+3;wx<x+w2-3;wx+=4){const q=h8(wx*7+wy*3+lv.si)%5;if(q<3)fillR(wx,wy,2,2)}return}
 if(w==10&&k=='g'){hl(x+1,y+2,w2-2);for(let wx=x+4;wx<x+w2-3;wx+=7){px(wx,y+4);px(wx+1,y+4)}for(let wy=y+7;wy<y+h-4;wy+=7){for(let wx=x+3;wx<x+w2-3;wx+=5){vl(wx,wy,4);vl(wx+2,wy,4);px(wx+1,wy)}for(let xx=x+2;xx<x+w2-2;xx+=2)px(xx,wy+5)}return}
 if(w==1&&k=='g'){hl(x+1,y+2,w2-2);for(let wy=y+5;wy<y+h-4;wy+=8)for(let wx=x+3;wx<x+w2-4;wx+=6){px(wx+1,wy);px(wx,wy+1);px(wx+2,wy+1);vl(wx,wy+2,2);vl(wx+2,wy+2,2)}return}
 if(w==0){for(let wy=y+4;wy<y+h-2;wy+=5)for(let wx=x+3;wx<x+w2-3;wx+=5)if(h8(wx*3+wy)%3==0)fillR(wx,wy,2,2)}
 else if(w==7){for(let yy=y+1;yy<y+h-1;yy++)for(let xx=x+1;xx<x+w2-1;xx++)if((xx+yy)%5==0)px(xx,yy);hl(x,y+1,w2)}
 else if(w==8){for(let xx=x+1;xx<x+w2-1;xx++){if(h8(xx*5)%4==0)px(xx,y-1)}for(let yy=y+2;yy<y+h-1;yy+=3)for(let xx=x+2+((yy>>1)&1)*2;xx<x+w2-1;xx+=5)px(xx,yy)}
 else if(w==9&&lv.W.k=='rio'){if(k=='g'&&h>6){for(let wy=y+3;wy<y+h-2;wy+=6)for(let wx=x+2+((wy>>1)&2);wx<x+w2-5;wx+=6){hl(wx,wy,5);vl(wx,wy,5);vl(wx+4,wy,5);if(h8(wx*3+wy)%3)px(wx+2,wy+2)}}else dith(x+1,y+2,w2-2,h-2,5)}
 else if(w==9){if(k=='g'&&h>6){for(let wy=y+3;wy<y+h-2;wy+=5)for(let wx=x+2;wx<x+w2-3;wx+=5){const q=h8(wx*7+wy*3+lv.si)%7;if(q<4){hl(wx,wy,2);hl(wx,wy+1,2)}else if(q==4)px(wx,wy)}}else dith(x+1,y+2,w2-2,h-2,5)}
 else if(w==3){dith(x+1,y+2,w2-2,h-2,5);if(w2>16&&k=='g'){for(const o of [14,w2-12])if(o>3&&o<w2-6)ocirc(x+o,y+3,2)}}
 else dith(x+1,y+2,w2-2,h-2,5)}
function solidAt(x,y){for(const s of lv.S)if(x>=s[0]&&x<s[0]+s[2]&&y>=s[1]&&y<s[1]+s[3])return true;
 for(const p of [tgt,pad])if(x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+5)return true;return false}
// ---- movers ----
function spr(rows,cx,cy,flip){const h=rows.length,w=rows[0].length;for(let r=0;r<h;r++)for(let c=0;c<w;c++){const ch=rows[r][flip?w-1-c:c];if(ch=='#')px(cx-(w>>1)+c,cy-(h>>1)+r,1);else if(ch=='x')px(cx-(w>>1)+c,cy-(h>>1)+r,0)}}
const SP={
 ferry:[["......#####......","....#########....","...#.#.#.#.#.#...","..#############..","#################",".###############.","..#############.."],["......#####......","....#########....","...#.#.#.#.#.#...","..#############..","#################",".###############.","...###########..."]],
 gondola:[["..........#....",".........###...","..........#..#.","#.........#.#..","#........##....","###############",".#############."],["..........#....",".........###...","..........#.#..","#.........##...","#.........#....","###############",".#############."]],
 parrot:[["..#..#..","...###..","#######.","..####x#","........"],["........","...###..","#######.","..####x#","..#..#.."]],
 cablecar:[["....#....","....#....",".#######.","#.#.#.#.#","#########","#########",".#######."]],
 fish:[["..##....","#.####.#","######x.","#.####.#","..##...."],["..##....","..####.#","######x.","..####.#","..##...."]],
 shark:[["......##.......","....######.....","#.##########x##.","######.#########","..#...#########.","...........##..."],["......##.......","....######.....","..##########x##.","######.#########","#.#...#########.","...........##..."]],
 puffer:[["..###..",".#####.","##x####","#######","#.###.#",".#...#."],["..###..",".#####.","##x####","#######",".#####.","#.#.#.#"]],
 jelly:[["..###..",".#####.","#######","#.#.#.#",".#.#.#.","..#.#.."],["..###..",".#####.","#######",".#.#.#.","#.#.#.#",".#.#.#."]],
 bird:[["..#....",".###.#.","#######",".####.."],["....##.","#######",".#####.","..##..."]],
 gull:[["#.......#",".##...##.","..#####..","....#...."],["..#####..",".#######.","#...#...#","....#...."]],
 crow:[["#.....#",".#####.","..###..","..#.#.."],["..###..","#######",".#####.","..#.#.."]],
 vulture:[["#.......#",".##...##.","..#####..","...###...","....#...."],["..#####..",".#######.","#..###..#","...###...","....#...."]],
 bigshark:[["..................................",".##.............##................",".####...........####..............","...####........########...........",".....####......##########.........",".....#################x#x#x##x....",".......###############x#x#x#####..",".......###############x#x#x#####x#",".....########################xxx..",".....####.###################.....","...####........############.......",".####..............####...........",".##...............####............"],[".##...............................",".###............##................","...###..........####..............","....####.......########...........",".....#####.....##########.........","......################x#x#x##x....",".......###############x#x#x#####..","........##############x#x#x#####x#","......#######################xxx..",".....########################.....","....####.......############.......","...###.............####...........",".###..............####............"]],
 fork:[[".........######",".......###.....","###############",".......###.....",".........######","..............."],["...............",".........######",".......###.....","###############",".......###.....",".........######"]],
 plane:[["##..............","###.............",".##############.","##x#x#x#x#xxxx##",".##############.",".....#####......","......###......."],["##..............","###.............",".##############.","##x#x#x#x#xxxx##",".##############.",".....#####......","......###......."]],
 sat:[["......#......",".....###.....","####.###.####","#xx#######xx#","####.###.####",".....###.....","......#......"],["......#......",".....###.....","####.###.####","#xx###x###xx#","####.###.####",".....###.....","......#......"]],
 ufo:[["....###....","..#######..","###########",".#x#.#.#x#.","...#...#..."],["....###....","..#######..","###########",".#.#x#x#.#.","...#...#..."]],
};
function drawLife(){
 if(lv.W&&lv.W.fk=='wat'){const fl=lv.W.fl;
  for(let k=0;k<2;k++){const sp=[0.14,0.2][k],dir=k==0?1:-1,span=150;const x=Math.round(((ft*sp*dir+k*70)%span+span)%span-10),y=fl+2+k*3;
   const rows=['...##..','##.####','######x','##.####','...##..'];for(let r=0;r<5;r++)for(let c=0;c<7;c++){const ch=rows[r][dir>0?c:6-c];if(ch=='#')px(x+c,y+r,1);else if(ch=='x')px(x+c,y+r,0)}}
  if(lv.si%3==1&&lv.w!=1){const span=190,x=Math.round((ft*0.12+lv.si*37)%span-24);
   if(!solidAt(x+3,fl-2)){const f=['..#....','.###...','#####..','#######'];for(let r=0;r<4;r++)for(let c=0;c<7;c++)if(f[r][c]=='#')px(x+c,fl-3+r,1);px(x-2,fl,1);px(x-5,fl,1)}}}
 if(lv.crab){const cb=lv.crab,x=Math.round(cb.x+Math.sin(ft*0.03)*3),y=cb.y-4,fr=(ft>>3)&1;
  const rows=['#.....#','#######','.#xxx#.',fr?'.#.#.#.':'#..#..#'];for(let r=0;r<4;r++)for(let c=0;c<7;c++){const ch=rows[r][c];if(ch=='#')px(x-3+c,y+r,1);else if(ch=='x')px(x-3+c,y+r,0)}}
}

const STAR7=['...#...','..###..','#######','.#####.','..###..','.##.##.','.#...#.'];
function drawTokens(){if(!lv.TK)return;for(let i=0;i<lv.TK.length;i++){if(TKP[i])continue;const t=lv.TK[i],y=Math.round(t.y+Math.sin(tick*0.05+t.ph)*1.5),x=t.x;
  for(let r=0;r<7;r++)for(let c=0;c<7;c++)if(STAR7[r][c]=='#')for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)px(x-3+c+a,y-3+r+b,0);for(let r=0;r<7;r++)for(let c=0;c<7;c++)if(STAR7[r][c]=='#')px(x-3+c,y-3+r,1);
  const p=(ft+t.ph*3)%40;if(p<20){px(x-5,y,1);px(x+5,y,1);px(x,y-5,1);px(x,y+4,1)}else{px(x-5,y-4,1);px(x+5,y-4,1);px(x-4,y+4,1);px(x+4,y+4,1)}}}
function drawSnowmen(){if(!lv.SM)return;for(const g of lv.SM){const cut=g.top+g.melt*0.78*g.H,cx=Math.round(g.cx),n=g.r.length,base=g.top+g.H;
  for(let q=0;q<n;q++){const r=g.r[q],cy=g.cy[q];for(let y=Math.ceil(cy-r);y<=Math.floor(cy+r);y++){if(y<cut)continue;const dy=y-cy,hw=Math.sqrt(Math.max(0,r*r-dy*dy));hl(Math.round(cx-hw),y,Math.round(2*hw)+1,1)}}
  for(let q=0;q<n-1;q++){const y=Math.round(g.cy[q]-g.r[q]+1);if(y>=cut)hl(cx-Math.round(g.r[q+1]*0.5),y,Math.round(g.r[q+1])+1,0)}
  const hq=n-1,hy=Math.round(g.cy[hq]);
  if(hy-1>=cut+1){px(cx-1,hy-1,0);px(cx+2,hy-1,0);px(cx+1,hy+1,1);px(cx+2,hy+1,1);px(cx+3,hy+1,1);hl(cx-1,hy+2,3,0)}
  if(n==3){const my=Math.round(g.cy[1]);if(my>=cut+1){px(cx,my-1,0);px(cx,my+2,0)}
   for(let k=1;k<=5;k++){if((k&1)&&my-1-((k+1)>>1)>=cut){px(cx-g.r[1]-k,my-((k+1)>>1)-0);px(cx+g.r[1]+k,my-((k+1)>>1))}}}
  if(g.melt>0){const pw=Math.round(g.r[0]+g.melt*7);hl(cx-pw,Math.round(base)-1,2*pw+1,1);if(g.melt<1&&((ft>>3)&1))px(cx+Math.round(g.r[0]*0.5),Math.round(cut)+2,1)}}}
function drawPipe(){const P=lv.PIPE;if(!P)return;const fl=lv.W.fl;
 
 for(let k=Math.max(0,Math.floor((tick-BUBL-10)/BUBPER)+1);k<=Math.floor(tick/BUBPER);k++){if(BUBP[k])continue;const a0=tick-k*BUBPER;if(a0>=BUBL){if(a0<BUBL+8){const e=bubAt(k,k*BUBPER+BUBL-1),x=Math.round(e[0]),y=Math.round(e[1]),d=3+((a0-BUBL)>>1);px(x-d,y);px(x+d,y);px(x,y-d);px(x-d+1,y-d+1);px(x+d-1,y-d+1)}continue}const b=bubAt(k,tick);if(!b)continue;const x=Math.round(b[0]),y=Math.round(b[1]),a=tick-k*BUBPER,sq=Math.sin(a*0.2+k)*0.35,rx=b[2]+sq,ry=b[2]-sq;
  for(let q=0;q<28;q++){const an=q/28*6.283;px(Math.round(x+Math.cos(an)*rx),Math.round(y+Math.sin(an)*ry))}px(x-1,y-1);if(b[2]>2.6)px(x-1,y-2)}}
function drawBalloons(){
 for(let i=0;i<lv.BL.length;i++){if(PP[i])continue;const b=lv.BL[i],bx=Math.round(b.x),by=Math.round(b.y+Math.sin(tick*0.04+b.ph)*1.2);
  hl(bx-1,by-2,3);hl(bx-2,by-1,5);hl(bx-2,by,5);hl(bx-2,by+1,5);hl(bx-1,by+2,3);px(bx-1,by-1,0);px(bx,by+3);
  for(let q=0;q<9;q++)px(bx+Math.round(Math.sin(q*0.3+ft*0.03+b.ph)*q*0.12),by+4+q)}}
const CRASHK={ufo:1,plane:1,bigshark:1,cablecar:1};
function drawCrash(m,k,age){const mk=MK[m.k],hh=(mk.h>>1)+1,g=0.045,big=m.k!='bigshark',S=SP[m.k];
 const ai=k.gy<Infinity?Math.sqrt(Math.max(0,2*(k.gy-hh-k.y)/g)):1e9;
 if(age<ai){const x=k.x+k.vx*age*0.5+(m.k=='ufo'?Math.sin(age*0.4)*1.5:0),y=k.y+0.5*g*age*age;if(y>70)return;
  const sx=k.vx<0?1:-1;if(S&&(m.k!="plane"||age%4<3)&&(age%2==0||age<8))spr(S[0],Math.round(x),Math.round(y),m.k=='ufo'?((age>>2)&1)==1:k.vx<0);
  if(big)for(let q=1;q<6;q++){const ty=y-q*2-1;if(((age+q)&1)==0)px(Math.round(x+sx*q*1.5),Math.round(ty))}
  if(age<10)for(let q=0;q<3;q++)px(Math.round(k.x+Math.sin(age*1.7+q*2.1)*(2+age*0.6)),Math.round(k.y+Math.cos(age*1.3+q*2.5)*(2+age*0.5)));return}
 const a=age-ai,x0=Math.round(k.x+k.vx*ai*0.5),gy=Math.round(k.gy);
 if(big){
  if(a<18){const rd=a<8?2+a*0.9:9.2-(a-8)*0.85,cy=gy-Math.round(rd*0.6);for(let yy=-Math.ceil(rd);yy<=Math.ceil(rd);yy++)for(let xx=-Math.ceil(rd);xx<=Math.ceil(rd);xx++){if(xx*xx+yy*yy>rd*rd)continue;const X=x0+xx,Y=cy+yy;if(Y>gy)continue;if(a<4||((xx+yy+a)&1)==0)px(X,Y)}}
  if(a<34)for(let r=0;r<12;r++){const an=-3.14*(r+0.5)/12,d=3+a*(0.9+(r%3)*0.25);px(Math.round(x0+Math.cos(an)*d),Math.min(gy,Math.round(gy-2+Math.sin(an)*d*0.9+a*a*0.012)))}
  if(a>=6&&a<120)for(let q=0;q<4;q++){const ph=a*0.1+q*1.7,yy=gy-2-((a-6)*0.2+q*4)%20;if(((a>>2)+q)%4)px(Math.round(x0+Math.sin(ph)*2+(q-1.5)*3),Math.round(yy))}
 }else{
  if(a<10)for(let r=0;r<6;r++){px(x0-8+r*3,gy-((a*0.6+r)%3|0));}
  if(a<110)for(let q=0;q<9;q++){const yy=gy-2-((a*0.25+q*5)%34),xx=x0+Math.round(Math.sin(a*0.08+q*1.9)*3+(q-4)*2.5);if(yy>gy-34&&((a>>3)+q)%3)px(xx,Math.round(yy))}
 }}
function drawDead(m,k){const age=tick-k.t;if(CRASHK[m.k]){drawCrash(m,k,age);return}const x=k.x+k.vx*age*0.5+Math.sin(age*0.3)*1.5,y=k.y+0.5*0.045*age*age;if(y>70)return;const S=SP[m.k];if(S)spr(S[0],Math.round(x),Math.round(y),((age>>2)&1)==1);if(age<10)for(let q=0;q<3;q++)px(Math.round(k.x+Math.sin(age*1.7+q*2.1)*(2+age*0.6)),Math.round(k.y+Math.cos(age*1.3+q*2.5)*(2+age*0.5)))}
function drawMovers(F){
 for(let mi=0;mi<lv.MV.length;mi++){const m=lv.MV[mi];if(F&&!F(m,mi))continue;if(KILLED[mi]){drawDead(m,KILLED[mi]);continue}
  if(m.m=='laser'){const on=laserOn(m,tick),wn=laserWarn(m,tick),x=Math.round(m.x);
   if(on){const f=(ft>>1)&1;for(let y=m.y0+3;y<m.y1;y++){px(x,y);if((y+f)%3==0){px(x-1,y);px(x+1,y)}}}
   else if(wn&&((ft>>2)&1)){for(let y=m.y0+3;y<m.y1;y+=3)px(x,y)}
   continue}
  const p=mvAt(m,tick),cx=Math.round(p[0]),cy=Math.round(p[1]);
  if(m.m=='fall'){if(cy>(lv.W.fl||60)-3)continue;px(cx,cy-1);fillR(cx-1,cy,3,2);px(cx,cy+2);continue}
  const q=mvAt(m,tick+1),flip=q[0]<p[0]&&m.m!='diag';
  const fr=(ft>>3)&1;
  const S=SP[m.k];if(!S)continue;
  if(m.k=='parrot'||m.k=='sat'||m.k=='crow'||m.k=='bird'||m.k=='gull'||m.k=='bat'||m.k=='vulture'||m.k=='ufo'||m.k=='drone'||m.k=='heli'||m.k=='bee'||m.k=='bigshark'||m.k=='fork'||m.k=='paper'||m.k=='plane'||m.k=='fish'||m.k=='shark'||m.k=='puffer'||m.k=='jelly')spr(S[Math.min(S.length-1,fr)],cx,cy+((m.k=='ufo'||m.k=='sat')?Math.round(Math.sin(ft*0.09+cx)):0),flip);
  else spr(S[0],cx,cy,flip);
 }
}
const RSEG=[[-1,-1,-1,3],[1,-1,1,3],[0,-4,0,3],[-2,-1,0,-6],[2,-1,0,-6],[-2,-1,-2,3],[2,-1,2,3],[-2,1,-3.5,5],[2,1,3.5,5]];
const FX=[];
function handleEvents(){
 for(const e of EV){
  if(e.t=='blast'){shake=Math.max(shake,8);const c=Math.cos(e.a),s=Math.sin(e.a),nx=e.x-4*s,ny=e.y+4*c;for(let q=0;q<16;q++){const sp=1+rnd()*1.6,sd=(rnd()-.5)*1.2;FX.push({k:'ex',x:nx,y:ny,vx:-s*sp+c*sd,vy:c*sp+s*sd,t:0,l:10+rnd()*10})}FX.push({k:'ring',x:nx,y:ny,t:4})}
  if(e.t=='crash'){shake=18;FX.push({k:'fb',x:e.x,y:e.y,t:0});FX.push({k:'ring',x:e.x,y:e.y,t:0});
   for(let i=0;i<26;i++){const an=rnd()*6.283,sp=0.5+rnd()*2;FX.push({k:'sp',x:e.x,y:e.y,vx:Math.cos(an)*sp+e.vx*.5,vy:Math.sin(an)*sp-0.3+e.vy*.5,t:0,l:16+rnd()*30})}
   const c=Math.cos(e.a),s=Math.sin(e.a);
   for(const g of RSEG){const lx=(g[0]+g[2])/2,ly=(g[1]+g[3])/2,mx=e.x+lx*c-ly*s,my=e.y+lx*s+ly*c,dx=mx-e.x,dy=my-e.y,d=Math.hypot(dx,dy)||1,sp=0.7+rnd()*1.1;
    const ex=(g[2]-g[0])*c-(g[3]-g[1])*s,ey=(g[2]-g[0])*s+(g[3]-g[1])*c;
    FX.push({k:'db',x:mx,y:my,vx:dx/d*sp+e.vx*.4,vy:dy/d*sp-0.6+e.vy*.4,a:Math.atan2(ey,ex),va:(rnd()-.5)*.5,len:Math.hypot(ex,ey),t:0,fr:0})}
   for(let i=0;i<9;i++)FX.push({k:'sm',x:e.x+(rnd()-.5)*8,y:e.y+(rnd()-.5)*4,vx:(rnd()-.5)*.25,vy:-0.18-rnd()*.2,t:-6-i*4,l:60+rnd()*30})}
  if(e.t=='kill'){FX.push({k:'pp',x:e.x,y:e.y,t:0,l:9});FX.push({k:'tx',x:e.x,y:e.y-5,t:0,l:48,s:'+'+e.pts})}
  if(e.t=='bpop'){for(let q=0;q<8;q++){const an=q/8*6.283;FX.push({k:'ex',x:e.x+Math.cos(an)*e.r,y:e.y+Math.sin(an)*e.r,vx:Math.cos(an)*0.5,vy:Math.sin(an)*0.5,t:0,l:8})}FX.push({k:'tx',x:e.x,y:e.y-3,t:0,l:40,s:'+'+e.pts})}
  if(e.t=='pop'){FX.push({k:'pp',x:e.x,y:e.y,t:0,l:9});FX.push({k:'tx',x:e.x,y:e.y,t:0,l:48,s:'+'+e.pts})}
  if(e.t=='egg'){FX.push({k:'tx',x:e.x,y:e.y,t:0,l:70,s:e.s})}
  if(e.t=='arm'){FX.push({k:'tx',x:e.x,y:e.y,t:0,l:60,s:'ARM +'+e.pts})}
  if(e.t=='chl'){FX.push({k:'tx',x:e.x,y:e.y,t:0,l:60,s:'CHUTE +'+e.pts})}
  if(e.t=='flip'){FX.push({k:'tx',x:e.x,y:e.y,t:0,l:48,s:'360 +'+e.pts})}
  if(e.t=='tok'){FX.push({k:'pp',x:e.x,y:e.y,t:0,l:9});FX.push({k:'tx',x:e.x,y:e.y-4,t:0,l:48,s:'+'+e.pts})}
  if(e.t=='lit'){FX.push({k:'pp',x:e.x,y:e.y-2,t:0,l:9});FX.push({k:'tx',x:e.x,y:e.y-4,t:0,l:48,s:'+'+e.pts})}
  if(e.t=='puff'){for(let k=0;k<7;k++){const dir=k%2?1:-1;FX.push({k:'du',x:e.x+((k%3)-1)*2,y:e.y-1,vx:dir*(0.25+rnd()*0.5)*(0.5+e.s),vy:-0.08-rnd()*.15,t:0,l:10+rnd()*10})}}
 }
 EV.length=0}
function fxStep(){
 handleEvents();
 if(R.thr&&state=='fly'&&lv.w==8){const c=Math.cos(R.a),s=Math.sin(R.a),nx=R.x-4*s,ny=R.y+4*c;if(ft%6==0)FX.push({k:'bb',x:nx+(rnd()-.5)*2,y:ny+1,vx:-s*0.7+R.vx*.2+(rnd()-.5)*0.3,vy:c*0.7+R.vy*.2,r0:rnd()<.35?2:1,ph:rnd()*6.28,t:0,l:55+rnd()*45});
  if(ft%2==0){let hx=null,hy=null;for(let d=3;d<18;d+=1){const x=nx-s*d,y=ny+c*d;if(solidAt(x,y)){hx=x;hy=y;break}}if(hx!=null)for(let q=0;q<2;q++)FX.push({k:'du',x:hx,y:hy-1,vx:(q?1:-1)*(0.3+rnd()*0.5),vy:-0.1-rnd()*.15,t:0,l:12+rnd()*8})}}
 else if(R.thr&&state=='fly'){const c=Math.cos(R.a),s=Math.sin(R.a),nx=R.x-4*s,ny=R.y+4*c;
  for(let i=0;i<2;i++){const sp=0.7+rnd()*.6;FX.push({k:'ex',x:nx+(rnd()-.5)*1.4,y:ny+(rnd()-.5)*1.4,vx:-s*sp+R.vx*.3+(rnd()-.5)*.25,vy:c*sp+R.vy*.3+(rnd()-.5)*.25,t:0,l:6+rnd()*7})}
  if(ft%3==0)FX.push({k:'es',x:nx,y:ny+1,vx:-s*.35+(rnd()-.5)*.2,vy:c*.35,t:0,l:18+rnd()*10});
  if(ft%2==0){let hx=null,hy=null;for(let d=3;d<18;d+=1){const x=nx-s*d,y=ny+c*d;if(solidAt(x,y)){hx=x;hy=y;break}}
   if(lv.W&&lv.W.fk=='wat'&&hx==null){const fl=lv.W.fl;for(let d=3;d<18;d++){const x=nx-s*d,y=ny+c*d;if(y>=fl){for(let q=0;q<2;q++)FX.push({k:'sp',x:x,y:fl-1,vx:(q?1:-1)*(0.2+rnd()*0.6),vy:-0.5-rnd()*0.7,t:0,l:14+rnd()*8});break}}}
   if(hx!=null)for(let q=0;q<2;q++)FX.push({k:'du',x:hx,y:hy-1,vx:(q?1:-1)*(0.35+rnd()*0.6),vy:-0.05-rnd()*.12,t:0,l:12+rnd()*8})}}
 for(const p of FX){
  if(p.k=='fb'||p.k=='ring'||p.k=='pp'||p.k=='tx'){p.t++;continue}
  if(p.k=='bb'){p.t++;p.vy-=0.022;p.vx*=0.95;p.vy*=0.965;p.vx+=Math.sin(p.t*0.2+p.ph)*0.03;p.x+=p.vx;p.y+=p.vy;if(p.t>8&&p.t<p.l-6&&solidAt(Math.round(p.x),Math.round(p.y)-2))p.t=p.l-6;continue}
  if(p.k=='sp'||p.k=='du'||p.k=='ex'||p.k=='es'){p.t++;
   if(p.k=='sp'){p.vy+=0.03;p.vx*=0.985}
   if(p.k=='du'){p.vy+=0.008;p.vx*=0.95}
   const nx=p.x+p.vx,ny=p.y+p.vy;if(p.k=='sp'&&solidAt(nx,ny)){p.vx=0;p.vy=0;p.t+=2}else{p.x=nx;p.y=ny}continue}
  if(p.k=='sm'){p.t++;if(p.t>0){p.x+=p.vx;p.y+=p.vy;p.vx*=0.995}continue}
  if(p.k=='db'){p.t++;if(p.fr)continue;p.vy+=0.03;p.a+=p.va;const nx=p.x+p.vx,ny=p.y+p.vy;
   if(solidAt(nx,ny)){p.vy*=-0.35;p.vx*=0.6;p.va*=0.5;if(Math.abs(p.vy)<0.08){p.fr=1;p.vx=0;p.vy=0}}else{p.x=nx;p.y=ny}
   if(p.y>90)p.fr=1}}
 for(let i=FX.length-1;i>=0;i--){const p=FX[i];if(p.k=='fb'&&p.t>22||p.k=='ring'&&p.t>16||p.k!='fb'&&p.k!='ring'&&p.k!='db'&&p.t>=p.l)FX.splice(i,1)}
 if(shake>0)shake--}
function drawTxt(){const D=[];for(const p of FX){if(p.k!='tx')continue;const w=p.s.length*4;let y=Math.max(9,Math.round(p.y-8-p.t*0.2));if(y>58)y=58;let lo=1,hi=127-w;if(y<29)lo=22;if(y<41)hi=115-w;const x=Math.max(lo,Math.min(hi,Math.round(p.x-w/2)));let yy=y;for(let g=0;g<6&&D.some(r=>x<r[0]+r[2]+2&&x+w+2>r[0]&&yy<r[1]+8&&yy+8>r[1]);g++)yy+=8;if(yy>58)yy=y;D.push([x,yy,w]);textO(p.s,x,yy,1)}}
function drawFx(back){
 for(const p of FX){
  if(back&&p.k!='ex'&&p.k!='es')continue;if(!back&&(p.k=='ex'||p.k=='es'))continue;
  if(p.k=='fb'){const t=p.t;if(t<3)fcirc(p.x,p.y,10-t*2);else if(t<10)fcirc(p.x,p.y,Math.min(9,3+t));
   else if(t<20){const r=9-(t-10)*0.3;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r&&((x+y+t)&1)==0)px(p.x+x,p.y+y)}}
  else if(p.k=='ring'){const r=p.t*1.5+3;for(let a=0;a<48;a++){const an=a/48*6.283;if(((a+p.t)&1)==0||p.t<6)px(p.x+Math.cos(an)*r,p.y+Math.sin(an)*r*0.9)}}
  else if(p.k=='tx'){}
  else if(p.k=='pp'){for(let a=0;a<8;a++){const an=a/8*6.283,r=p.t*1.1+2;px(p.x+Math.cos(an)*r,p.y+Math.sin(an)*r);if(p.t<5)px(p.x+Math.cos(an)*(r+1.5),p.y+Math.sin(an)*(r+1.5))}}
  else if(p.k=='bb'){const X=Math.round(p.x),Y=Math.round(p.y),r=Math.min(3,p.r0+((p.t/22)|0));if(p.t>=p.l-6){const k=p.t-(p.l-6)+r;px(X-k,Y);px(X+k,Y);px(X,Y-k);px(X,Y+k)}else if(r==1){px(X-1,Y);px(X+1,Y);px(X,Y-1);px(X,Y+1)}else if(r==2){hl(X-1,Y-2,3);hl(X-1,Y+2,3);vl(X-2,Y-1,3);vl(X+2,Y-1,3);px(X-1,Y-1)}else{hl(X-1,Y-3,3);hl(X-1,Y+3,3);vl(X-3,Y-1,3);vl(X+3,Y-1,3);px(X-2,Y-2);px(X+2,Y-2);px(X-2,Y+2);px(X+2,Y+2);px(X-1,Y-1)}}
  else if(p.k=='sp'){px(p.x,p.y);if(p.t<p.l*0.5)px(p.x-p.vx,p.y-p.vy)}
  else if(p.k=='du'||p.k=='ex'){px(p.x,p.y)}
  else if(p.k=='es'){if((p.t>>1)&1||p.t<6)px(p.x,p.y)}
  else if(p.k=='sm'){if(p.t<0)continue;const r=1+Math.floor(p.t/18),f=p.t/p.l;for(let a=0;a<12;a++){const an=a/12*6.283+p.x;if(f<0.7||(a+p.t)%3==0)if((a&1)==0||f<0.4)px(p.x+Math.cos(an)*r,p.y+Math.sin(an)*r*0.8)}}
  else if(p.k=='db'){const dx=Math.cos(p.a)*p.len/2,dy=Math.sin(p.a)*p.len/2;line(p.x-dx,p.y-dy,p.x+dx,p.y+dy)}}}
function drawRocket(){
 if(state=='crashed')return;
 const c=Math.cos(R.a),s=Math.sin(R.a),P=(x,y)=>[R.x+x*c-y*s,R.y+x*s+y*c],L=(a,b)=>{const p=P(a[0],a[1]),q=P(b[0],b[1]);line(p[0],p[1],q[0],q[1])};
 if(BLT>0&&lv.w!=8){const n=5+(ft&1)*3+Math.round(BLT/4);L([-2,4],[0,4+n+4]);L([2,4],[0,4+n+4]);L([-1,4],[-1,4+n]);L([1,4],[1,4+n]);L([0,4],[0,4+n+6])}
 if(R.thr&&lv.w!=8){const n=2+(ft%3==0?2:ft&1);L([-1,4],[0,4+n+3]);L([1,4],[0,4+n+3]);L([0,4],[0,4+n+1]);L([-2,4],[-1,4]);L([1,4],[2,4])}
 L([0,-6],[-2,-3]);L([0,-6],[2,-3]);L([-2,-3],[-2,3]);L([2,-3],[2,3]);L([-2,-3],[2,-3]);L([-2,0],[2,0]);L([-2,3],[2,3]);
 {const bx=Math.round(R.x),by=Math.round(R.y);for(let Y=-8;Y<=8;Y++)for(let X=-7;X<=7;X++){const dx=bx+X-R.x,dy=by+Y-R.y,lx=dx*c+dy*s,ly=-dx*s+dy*c,ax=Math.abs(lx);let inn=false;if(ly>=-6&&ly<-3)inn=ax<=(ly+6)*2/3+0.35;else if(ly>=-3&&ly<=3.4)inn=ax<=2.4;if(!inn&&ly>=1&&ly<=5.4&&ax>=1.6)inn=ax<=2+(ly-1)/2+0.4;if(inn)px(bx+X,by+Y)}}{const w=P(0,-1);px(Math.round(w[0]),Math.round(w[1]),0)}
 L([-2,1],[-4,5]);L([2,1],[4,5]);L([-4,5],[-2,5]);L([2,5],[4,5]);
}
function drawChute(rx,ry,a,open){const c=Math.cos(a),s=Math.sin(a),P=(x,y)=>[rx+x*c-y*s,ry+x*s+y*c],cx=Math.round(rx+s*3),cy=Math.round(ry-17),w=Math.round(7*Math.min(1,open)),hh=Math.max(1,Math.round(5*Math.min(1,open)));
 for(let dx=-w;dx<=w;dx++){const t=dx/(w||1),y=cy-Math.round(Math.sqrt(Math.max(0,1-t*t))*hh);for(let yy=y;yy<=cy;yy++)px(cx+dx,yy,0);px(cx+dx,y);if(yy0(dx,w))px(cx+dx,cy)}
 for(let dx=-w+2;dx<=w-2;dx+=3)px(cx+dx,cy-1);
 const l=P(-2,-3),r=P(2,-3),n=P(0,-6);line(cx-w,cy,l[0],l[1]);line(cx+w,cy,r[0],r[1]);line(cx,cy,n[0],n[1])}
function yy0(dx,w){return (dx+w)%3!=1}
function drawRocketH(){if(state=='crashed')return;const x0=Math.round(R.x)-12,y0=Math.round(R.y)-14,W=25,H=29,sv=new Uint8Array(W*H);
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const x=x0+i,y=y0+j;if(x>=0&&x<128&&y>=0&&y<64){sv[j*W+i]=SCR[y*128+x];SCR[y*128+x]=0}}
 drawRocket();const mk=new Uint8Array(W*H);
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const x=x0+i,y=y0+j;if(x>=0&&x<128&&y>=0&&y<64){mk[j*W+i]=SCR[y*128+x];SCR[y*128+x]=sv[j*W+i]}}
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){if(!mk[j*W+i])continue;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=W||jj>=H||mk[jj*W+ii])continue;const x=x0+ii,y=y0+jj;if(x<0||x>=128||y<0||y>=64)continue;if(lv.BM&&lv.BM[y*128+x])continue;SCR[y*128+x]=0}}
 for(let j=0;j<H;j++)for(let i=0;i<W;i++)if(mk[j*W+i]){const x=x0+i,y=y0+j;if(x>=0&&x<128&&y>=0&&y<64)SCR[y*128+x]=1}
 {const c=Math.cos(R.a),s=Math.sin(R.a),wx=Math.round(R.x+s),wy=Math.round(R.y-c);if(wx>=0&&wx<128&&wy>=0&&wy<64)SCR[wy*128+wx]=0}}
function attitude(){
 const S=19,c=9,a=R.a;
 fillR(0,0,S,S,0);hl(0,0,S);hl(0,S-1,S);vl(0,0,S);vl(S-1,0,S);
 const hx=Math.cos(a),hy=Math.sin(a),ux=Math.sin(a),uy=-Math.cos(a),bad=Math.abs(a)>=0.198;
 for(let t=-11;t<=11;t+=0.5){if(bad&&Math.round(t*2)%2==0&&(ft>>2)&1)continue;const x=Math.round(c+hx*t),y=Math.round(c+hy*t);if(x>1&&x<S-2&&y>1&&y<S-2)px(x,y)}
 for(let t=1;t<=4;t++){const x=Math.round(c+ux*t*1.5),y=Math.round(c+uy*t*1.5);if(x>1&&x<S-2&&y>1&&y<S-2)px(x,y)}
 px(c,c,1);px(c-1,c,0);px(c+1,c,0);px(c,c-1,0);px(c,c+1,0);px(c,c,1);
 hl(2,S-3,3);hl(S-5,S-3,3);px(c,2);px(c,S-3,0);
}
function altM(){const x=Math.round(R.x);let y0=Math.round(R.y+5),y=y0;for(;y<64;y++)if(solidAt(x,y))break;return Math.max(0,y-y0)}
const LIFE=['..#..','.###.','.#x#.','.###.','#####','#.#.#'];
function drawLives(x,y){for(let k=0;k<3;k++){for(let r=0;r<6;r++)for(let c=0;c<5;c++)if(LIFE[r][c]!='.')for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)px(x+k*8+c+dx,y+r+dy,0)}
 for(let k=0;k<3;k++){const on=k<lives;for(let r=0;r<6;r++)for(let c=0;c<5;c++){const ch=LIFE[r][c];if(ch=='.')continue;const X=x+k*8+c,Y=y+r;if(on)px(X,Y,ch=='#'?1:0);else if(ch=='#'&&((c+r)&1)==0)px(X,Y,1)}}}
function fuelBar(){const x=123,y=9,w=5,h=28,fr=Math.max(0,Math.min(1,fuelL/lv.fuel));
 fillR(x-1,y-1,w+2,h+2,0);hl(x,y,w);hl(x,y+h-1,w);vl(x,y,h);vl(x+w-1,y,h);
 const fh=Math.round(fr*(h-4));if(!(fr<0.2&&(ft>>3)&1))fillR(x+2,y+h-2-fh,w-4,fh,1)}
function hud(){
 attitude();fuelBar();
 textO('L'+(lv.i+1),22,1,1);drawLives(44,1);
 const sc=String(score);textO(sc,128-sc.length*4,1,1);
 const at=altM()+'M';textO(at,1,20,1);
 if(state=='fly'){let t='';if(CH){const e=tick-CHT;if(e<90&&e%30<18)t='CHUTE OPEN'}else if(fuelL<=0&&R.y<0&&altM()>=100&&((ft>>3)&1))t='B:CHUTE';if(t)textO(t,Math.round(64-(t.length*4-1)/2),29,1)}

}



function render(){
 SCR.fill(0);CLDS=[];
 {const e=tick-CHT;if(CH&&e>=0&&e<16){const m=e<8?2:1;PXO=Math.round((tHash(e*5+1)-.5)*2*m);PYO=Math.round((tHash(e*9+2)-.5)*2*m)}}
 M={x:tgt.px-6,y:tgt.gy-18,w:tgt.pw+13,h:18};if(!lv.BM)mkBM();bg(lv.w,lv.bv);
 for(let i=0;i<lv.S.length;i++){curI=i;drawSolid(lv.S[i],lv.K[i],lv.w)}
 if(lv.w==3&&!REC)for(let i=0;i<lv.S.length;i++){const q=lv.S[i];if(lv.K[i]!='s'||q[1]+q[3]>=58)continue;const cx=q[0]+(q[2]>>1);for(let r=0;r<2;r++){const f=((ft+r*48)%96)/96,hw=Math.round(q[2]*(.2+.3*f)),yc=q[1]+q[3]+2+Math.round(f*8);if(yc>61)continue;for(let x=cx-hw;x<=cx+hw;x++){const u=(x-cx)/Math.max(1,hw),y=yc-Math.round(u*u*2)+2;if(f<.75?((x+y)&1)==0:((x+y)&3)==0)if(y<62&&(!solidAt||!solidAt(x,y)))px(x,y)}}}
 for(const d of lv.D)drawDisc(d);
 drawSnowmen();drawLife();drawMovers();drawPipe();drawBalloons();
 {const t=tgt;fillR(t.x,t.y,t.w,3);vl(t.x+1,t.y+3,t.gy-t.y-3);vl(t.x+t.w-2,t.y+3,t.gy-t.y-3);
  const cx=t.x+((t.w-1)>>1);px(cx,t.y,0);if(!(t.w&1))px(cx+1,t.y,0);{const c=ft%120,k=(c/30)|0;if(c%30<18)px([t.x,t.x+2,t.x+t.w-3,t.x+t.w-1][k],t.y-1)}}
 {const p=pad;fillR(p.x,p.y,p.w,2)}
 if(lv.si==5){const cx=tgt.px+(tgt.pw>>1),y=tgt.gy+4;vl(cx-2,y,5);vl(cx+2,y,5);hl(cx-2,y+2,5);fillR(cx-4,y-1,9,7,0);vl(cx-2,y,5);vl(cx+2,y,5);hl(cx-2,y+2,5);if((ft>>4)&1){px(tgt.px-3,tgt.gy-1);px(tgt.px+tgt.pw+2,tgt.gy-1)}}
 if(lv.i==0&&tick<600&&state!='landed'&&state!='crashed'){const cx=tgt.x+((tgt.w-1)>>1),bob=Math.round(Math.abs(Math.sin(tick*0.09))*4),ty=tgt.y-6-bob;const A=(c,o)=>{for(let i=0;i<4;i++)hl(cx-3+i-o,ty-3+i-o,7-2*i+2*o,c);vl(cx-o,ty-9-o,6+o,c);if(o){vl(cx-1,ty-10,7,c);vl(cx+1,ty-10,7,c)}};A(0,1);A(1,0)}
 drawFx(true);drawTokens();if(CH&&state=='fly')drawChute(R.x,R.y,R.a,Math.min(1,(tick-CHT)/12));drawRocketH();drawFx(false);frontClouds();hud();drawTxt();
 if(state=='ready'&&ft<180&&ft%60<45){const t=WORLDS[DWORLD[Math.floor(lv.i/10)]].n+' '+(lv.i%10+1);textO(t,Math.round(64-(t.length*4-1)/2),18,1)}
 if(state=='landed'||state=='crashed'){
  if(state=='landed'&&res.perf&&sT<=90&&sT%30<20){const t='PERFECT LANDING';textO(t,Math.round(64-(t.length*4-1)/2),24,1)}
   if(sT>(state=='crashed'?70:(res.perf||res.egg)?90:25)){const dt=state=='landed'&&detail,py=dt?2:12,ph=dt?60:40;fillR(24,py,80,ph,0);for(let x=24;x<104;x++){px(x,py);px(x,py+ph-1)}vl(24,py,ph);vl(103,py,ph);
   if(dt){const N=['LANDED','ACCURACY','SOFT LANDING','ANGLE','FUEL REMAINING','FLIGHT TIME','BONUS'];for(let k=0;k<7;k++){text(N[k],27,py+4+k*6);const s=String(res.parts[k]);text(s,98-s.length*4,py+4+k*6)}text('TOTAL',27,py+ph-8);const t=String(res.sc);text(t,98-t.length*4,py+ph-8)}
   else{if(!(state=='crashed'))ctext(state=='landed'&&lv.i==99?'YOU WIN!':res.msg,17);
    if(state=='landed'){for(let k=0;k<5;k++)star5(44+k*10,29,k<res.stars);ctext(lv.i==99?'SCORE '+score:'+'+res.sc,36);ctext(lv.i==99?'A: TITLE':'A:NEXT B:INFO',44)}
    else if(gameOver){ctext('GAME OVER',17);ctext('LEVEL '+(lv.i+1),26);ctext('SCORE '+score,34);ctext('A: TITLE',44)}
    else{const ml=res.msg.split('|');if(ml.length>1){ctext(ml[0],15);ctext(ml[1],22)}else ctext(res.msg,17);ctext(lives+(lives==1?' LIFE':' LIVES')+' LEFT',ml.length>1?30:27);ctext('A: RETRY',39)}}}}
 if(shake>0){const a=shake>10?2:1,sx=Math.round((rnd()-.5)*2*a),sy=Math.round((rnd()-.5)*2*a);TMP.set(SCR);SCR.fill(0);for(let y=0;y<64;y++)for(let x=0;x<128;x++){const xx=x-sx,yy=y-sy;if(xx>=0&&xx<128&&yy>=0&&yy<64&&TMP[yy*128+xx])SCR[y*128+x]=1}}
}



// ---- chunky title font ----
const CF={S:[".###","#...","#...",".##.","...#","...#","###."],L:["#...","#...","#...","#...","#...","#...","####"],H:["#..#","#..#","#..#","####","#..#","#..#","#..#"],D:["###.","#..#","#..#","#..#","#..#","#..#","###."],P:["###.","#..#","#..#","###.","#...","#...","#..."],O:[".##.","#..#","#..#","#..#","#..#","#..#",".##."],C:[".###","#...","#...","#...","#...","#...",".###"],K:["#..#","#.#.","##..","##..","#.#.","#..#","#..#"],E:["####","#...","#...","###.","#...","#...","####"],T:["####",".#..",".#..",".#..",".#..",".#..",".#.."],R:["###.","#..#","#..#","###.","##..","#.#.","#..#"],Y:["#..#","#..#","#..#",".##.",".#..",".#..",".#.."],U:["#..#","#..#","#..#","#..#","#..#","#..#",".##."],W:["#...#","#...#","#...#","#.#.#","#.#.#","##.##","#...#"],I:["###",".#.",".#.",".#.",".#.",".#.","###"],N:["#..#","##.#","##.#","#.##","#.##","#..#","#..#"],'!':["#","#","#","#","#",".","#"],G:[".###","#...","#...","#.##","#..#","#..#",".###"],A:[".##.","#..#","#..#","####","#..#","#..#","#..#"],M:["#...#","##.##","#.#.#","#.#.#","#...#","#...#","#...#"],V:["#..#","#..#","#..#","#..#","#..#",".##.",".##."],' ':["..","..","..","..","..","..",".."]};
function cfW(s,sc){let w=0;for(const ch of s)w+=(CF[ch][0].length*sc+sc);return w-sc+3}
function cfPix(s,x,y,sc,f){let cx=x;for(const ch of s){const g=CF[ch];for(let r=0;r<7;r++){const sh=Math.floor((6-r)/3)*(sc>>1||1);for(let q=0;q<g[r].length;q++)if(g[r][q]=='#')f(cx+q*sc+sh,y+r*sc,sc)}cx+=g[0].length*sc+sc}}
function cfText(s,x,y,sc){sc=sc||2;
 for(const o of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]])cfPix(s,x+o[0],y+o[1],sc,(X,Y,S)=>fillR(X,Y,S+1,S,0));
 cfPix(s,x,y,sc,(X,Y,S)=>fillR(X,Y,S+1,S,1))}
// ---- GAME OVER screen ----
let GOT=0;
function smoke(x0,y0,rise,k,t,n){for(let i=0;i<n;i++){const age=((t*0.55+i*(150/n)+k*23)%150)/150,y=y0-age*rise,x=x0+Math.sin(age*5+i+k)*3+age*10,r=1+age*3.4,keep=age<0.35?3:age<0.7?2:1;
  for(let yy=-4;yy<=4;yy++)for(let xx=-4;xx<=4;xx++){if(xx*xx+yy*yy>r*r)continue;const X=Math.round(x)+xx,Y=Math.round(y)+yy;if(((X+Y)&1)==0&&h8(X*131+Y*17+k+i)%4<keep)px(X,Y)}}}
function renderGameOver(){
 const t=GOT;SCR.fill(0);
 // sky: stars + low moon glow
 for(let k=0;k<28;k++){const x=h8(k*7+3)%128,y=17+h8(k*11+5)%22;if(((t+k*17)%70)<60)px(x,y)}
 // ground
 for(let x=0;x<128;x++){px(x,53);if((x&1)==0)px(x,54)}
 // three tombstones, one per lost rocket
 const stones=[24,64,104];
 stones.forEach((cx,i)=>{
  const top=29,r=9;
  // arch + body
  for(let y=top;y<=52;y++){let hw=9;if(y<top+r){const d=top+r-y;hw=Math.round(Math.sqrt(Math.max(0,r*r-d*d)))}hl(cx-hw,y,2*hw+1,1)}
  // inner engraving frame
  hl(cx-6,top+4,13,0);hl(cx-6,top+4+0,13,0);
  textS('RIP',cx-5,top+6,1,0);
  // little crashed rocket icon, black on stone, each slightly different
  const rows=['..#..','.###.','.#x#.','.###.','#####','#.#.#'];
  for(let rr=0;rr<6;rr++)for(let c=0;c<5;c++){const ch=rows[rr][c];if(ch=='#')px(cx-2+c+(i==1?0:(i==0?0:0)),top+14+rr,0)}
  px(cx,top+16,1);
  // cracks / damage per stone
  if(i==0){px(cx+5,top+8,0);px(cx+6,top+9,0);px(cx+5,top+10,0)}
  if(i==1){px(cx-6,top+11,0);px(cx-5,top+12,0);px(cx-6,top+13,0);px(cx-7,top+14,0)}
  if(i==2){px(cx+6,top+12,0);px(cx+5,top+13,0);px(cx+6,top+14,0)}
  // base plinth
  hl(cx-11,51,23,1);hl(cx-11,52,23,1);
  // flickering candle on the ground in front
  const fx=cx+(i==1?-14:14);vl(fx,48,5);hl(fx-1,52,3);const fl=(t>>2)+i*3,fh=(fl&3)==0?3:(fl&3)==1?2:(fl&3)==2?3:2;vl(fx,47-fh+1,fh);if(fh==3){px(fx+((fl>>2)&1?1:-1),46)}
  // wisps of smoke rising from each stone
  for(let k=0;k<5;k++){const age=((t*0.55+k*24+i*13)%120)/120,y=Math.round(top-2-age*10),x=Math.round(cx+Math.sin(age*7+k+i)*(2+age*4));
   if(y<19)continue;px(x,y);px(x+1,y);if(age<0.6){px(x,y+1);px(x+1,y-1)}}
 });
 // title + score
 cfText('GAME OVER',Math.round(64-cfW('GAME OVER',2)/2),1,2);
 const ln='LEVEL '+(lv.i+1)+'  SCORE '+score;textO(ln,Math.round(64-(ln.length*4-1)/2),18,1);
 if(t>20&&((t>>4)&1)==0){const pa='A: TITLE';text(pa,Math.round(64-(pa.length*4-1)/2),58)}
 if(t<4)for(let i=0;i<8192;i++)SCR[i]^=1;
}
let WINT=0;
function renderWin(){const t=WINT;SCR.fill(0);
 for(let k=0;k<30;k++){const x=h8(k*7+3)%128,y=h8(k*11+5)%60;if(((t+k*17)%60)<50)px(x,y)}
 // fireworks
 const FW=[[22,30,0],[106,26,40],[64,44,75],[14,52,110],[116,50,20]];
 for(const f of FW){const p=((t+f[2])%130)/130,age=p*1.6;if(age>1)continue;const R=3+age*17;
  for(let a=0;a<14;a++){const an=a/14*6.283+f[2];for(const rr of [R,R*0.82,R*0.64]){if(rr<R-5)continue;const X=Math.round(f[0]+Math.cos(an)*rr),Y=Math.round(f[1]+Math.sin(an)*rr+age*age*8);if(age<0.8||((a+X)&1)==0)px(X,Y)}}}
 // confetti
 for(let k=0;k<16;k++){const x=(h8(k*13+1)%128),y=Math.floor(h8(k*7+2)%64+t*(0.25+(k%3)*0.15))%64;px(x,y);if(k&1)px(x+1,y)}
 // text
 const m1='MISSION',m2='ACCOMPLISHED';cfText(m1,Math.round(64-cfW(m1,2)/2),1,2);cfText(m2,Math.round(64-cfW(m2,2)/2),17,2);
 {const sc=String(score),sw=sc.length*8-2,tot=19+5+sw,x0=Math.round(64-tot/2);textO('SCORE',x0,38,1);textO(sc,x0+24,35,2)}
 // podium + rocket
 fillR(54,56,20,2,1);fillR(58,54,12,2,1);hl(60,54,8,0);
 const by=Math.round(48-Math.abs(Math.sin(t*0.08))*2);miniRk(62,by);
 for(let q=0;q<2+(t&3);q++)px(64+(q&1),by+6+q);
 if(t>20&&((t>>4)&1)==0){const pa='A: TITLE';textO(pa,94,58,1)}
}
let TITLE=true,BLK=0,HOWSEEN=0;
function textS(s,x,y,sc,c){s=String(s);for(let i=0;i<s.length;i++){const g=FT[s[i]]||FT[' '];for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(g[r*3+q]=='1')fillR(x+i*4*sc+q*sc,y+r*sc,sc,sc,c)}}
function textO(s,x,y,sc){for(const o of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]])textS(s,x+o[0],y+o[1],sc,0);textS(s,x,y,sc,1)}
let TP=[];
function tHash(n){let x=(n*374761393)>>>0;x=Math.imul(x^(x>>>13),1274126177)>>>0;return ((x^(x>>>16))>>>0)/4294967296}
function titleFx(cx){
 if(ft%2==0||HT>0)for(let q=0;q<2+(HT>>3)+(HT>=195?8:0);q++){const sd=tHash(ft*7+q)<.5?-1:1;TP.push({k:'sp',x:cx+(tHash(ft*3+q)-.5)*5,y:53,vx:sd*(0.5+tHash(ft*5+q)*1.3),vy:-(0.2+tHash(ft*11+q)*1.0),t:0,l:18+tHash(ft*13+q)*18})}
 {const hp=Math.min(1,HT/195),every=HT>=195?1:HT>0?Math.max(1,Math.round(7-hp*6)):9;if(ft%every==0&&TP.length<(HT>=195?340:200)){const g=HT>0&&tHash(ft+11)<.6;TP.push({k:'sm',x:cx+(tHash(ft*3+1)<.5?-1:1)*(3+tHash(ft+5)*(g?10:5)),y:g?53:52,vx:g?(tHash(ft+9)-.5)*(0.5+hp):(tHash(ft+9)-.5)*0.25,vy:g?-0.04-tHash(ft+3)*.08:-0.16-tHash(ft+3)*0.12,t:0,l:g?150:110,id:ft*3+(g?1:0)})}}
 if(false)TP.push({k:'sm',x:cx+(tHash(ft)<.5?-1:1)*(3+tHash(ft+5)*5),y:52,vx:(tHash(ft+9)-.5)*0.25,vy:-0.16-tHash(ft+3)*0.12,t:0,l:110,id:ft});
 for(const p of TP){p.t++;p.x+=p.vx;p.y+=p.vy;if(p.k=='sp'){p.vy+=0.05;if(p.y>53&&p.vy>0){p.y=53;p.vy*=-0.35;p.vx*=0.8}}else{p.vx*=0.995}}
 TP=TP.filter(p=>p.t<p.l&&p.x>72&&p.x<128);
 for(const p of TP){
  if(p.k=='sp'){px(p.x,p.y);if(p.t<6)px(p.x-Math.sign(p.vx),p.y-Math.sign(p.vy))}
  else{const age=p.t/p.l,r=1+Math.floor(age*5),keep=age<0.35?3:age<0.65?2:1;for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){if(xx*xx+yy*yy>r*r+1)continue;const X=Math.round(p.x)+xx,Y=Math.round(p.y)+yy;if(tHash(X*131+Y*17+p.id)*3<keep*0.9&&(((X+Y)&1)==0||keep==3))px(X,Y)}}}
}
let INTRO=false,IT=0,IW=0;
const BIGM=['#...#','##.##','#.#.#','#...#','#...#'];
function bigW(s,sc){let w=0;for(const ch of s)w+=(ch=='M'?6:4)*sc;return w-sc}
function bigT(s,x,y,sc,c){let cx=x;for(const ch of s){if(ch=='M'){for(let r=0;r<5;r++)for(let q=0;q<5;q++)if(BIGM[r][q]=='#')fillR(cx+q*sc,y+r*sc,sc,sc,c);cx+=6*sc}else{textS(ch,cx,y,sc,c);cx+=4*sc}}}
function bigO(s,x,y,sc){for(const o of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]])bigT(s,x+o[0],y+o[1],sc,0);bigT(s,x,y,sc,1)}
function startIntro(i){if(typeof mode!=='undefined'&&mode!='manual')return;INTRO=true;IT=0;IW=Math.floor(i/10)}
function miniRk(x,y){for(let r=0;r<6;r++)for(let c=0;c<5;c++){const ch=LIFE[r][c];if(ch=='#')px(x+c,y+r,1);else if(ch=='x')px(x+c,y+r,0)}}
function renderIntro(){
 SCR.fill(0);const w=IW,t=IT;
 const stars=(n,maxY)=>{for(let k=0;k<n;k++){const x=h8(k*7+3)*128/256+(k*13)%11,y=(h8(k*11+5)*maxY/256);if(((t+k*17)%60)<50)px(x,y)}};
 const dith=(x,y,wd,ht)=>{for(let j=0;j<ht;j++)for(let i=0;i<wd;i++)if(((x+i+y+j)&1)==0)px(x+i,y+j)};
 if(w==0){stars(18,36);fcirc(114,14,6,1);fcirc(117,12,5,0);for(let k=0;k<9;k++){const bx=k*15+1,bh=10+h8(k*3)%14,rise=Math.max(0,Math.min(1,(t-k*3)/26)),cur=Math.round(bh*rise);fillR(bx,64-cur,12,cur,1);for(let wy=64-cur+3;wy<62;wy+=4)for(let wx=bx+2;wx<bx+10;wx+=3)if((h8(wx*3+wy)+(t>>4))%3==0)px(wx,wy,0)}}
 else if(w==1){stars(16,34);fcirc(16,11,5,1);fcirc(19,9,4,0);const wl=54;
  // water: ripples + moon shimmer
  for(let y=wl+2;y<64;y+=3){const o=((t>>3)+y*5)%12;for(let x=o;x<128;x+=12){px(x,y);px(x+1,y)}}
  for(let y=wl+1;y<64;y+=2){const w2=2+((y+(t>>3))%3);hl(15-(w2>>1)+(((t>>4)+y)&1),y,w2)}
  hl(0,wl,128);
  // palazzi on the left
  const pal=[[0,39,15],[15,43,13],[28,41,13]];
  for(const[x,y,w]of pal){fillR(x,y,w,wl-y,0);hl(x,y,w);vl(x,y,wl-y);vl(x+w-1,y,wl-y);for(let xx=x+1;xx<x+w-1;xx+=2)px(xx,y-1);
   for(let wy=y+3;wy<wl-4;wy+=6)for(let wx=x+2;wx<x+w-3;wx+=4){vl(wx,wy+1,3);vl(wx+2,wy+1,3);px(wx+1,wy);if(h8(wx*5+wy*3+((t>>6)&3))%3==0){px(wx+1,wy+2);px(wx+1,wy+3);px(wx+1,wl+2+((wy+(t>>3))&3))}}
   hl(x+1,wl-2,w-2)}
  // Rialto bridge
  {const cx=64,L=22;for(let x=-L;x<=L;x++){const u=x/L,top=wl-2-Math.round((1-u*u)*8);for(let y=top;y<top+3;y++)px(cx+x,y);const und=wl-Math.round((1-u*u)*6);if(Math.abs(x)<L-1)px(cx+x,und)}
   for(let x=-L;x<=L;x+=2){const u=x/L;px(cx+x,wl-3-Math.round((1-u*u)*8))}
   fillR(cx-8,wl-14,17,4,0);hl(cx-8,wl-14,17);vl(cx-8,wl-14,4);vl(cx+8,wl-14,4);for(let x=cx-6;x<=cx+5;x+=4){vl(x,wl-12,2);px(x+1,wl-13);vl(x+2,wl-12,2)}
   hl(cx-9,wl-15,19);hl(cx-6,wl-16,13)}
  // campanile
  {const cx=119,top=24;fillR(cx-4,top,9,wl-top,1);for(let y=top+4;y<wl-2;y+=5)px(cx,y,0);for(let y=top+2;y<wl;y+=7)hl(cx-4,y,9,0);
   fillR(cx-4,top-7,9,7,0);vl(cx-4,top-7,7);vl(cx+4,top-7,7);vl(cx-1,top-6,6);vl(cx+1,top-6,6);hl(cx-5,top-8,11);hl(cx-5,top-1,11);
   for(let r=0;r<7;r++)hl(cx-4+((r*4)>>3)+ (r>>1),top-9-r,9-2*((r*4>>3)+(r>>1)));px(cx,top-17);px(cx,top-18);px(cx-1,top-18);px(cx+1,top-18);
   for(let y=wl+2;y<62;y+=2)if(((y>>1)+(t>>3))&1)hl(cx-3,y,7)}
  // mooring poles
  for(const mx of [44,90,96]){for(let y=wl-9;y<wl+4;y++)if(y<wl||((y+(t>>3))&1))px(mx,y);px(mx,wl-10);for(let y=wl-8;y<wl;y+=3)px(mx+1,y)}
  // gondola with gondolier
  {const gx=Math.round(((t*0.35)%180)-30),gy=wl+5,g=['...............#','..........#....#','.........###...#','..........#...#.','..........#..#..','#.........#.#...','#.........##....','##############..','.############...'];
   for(let r=0;r<g.length;r++){for(let c=0;c<g[r].length;c++){const x=gx+c,y=gy-7+r;if(g[r][c]=='#')px(x,y);else if(r>=6)px(x,y,0)}}}}
 else if(w==2){stars(8,24);const cy=Math.round(70-Math.min(t,70)*0.3);fcirc(104,cy,9,1);for(let y=cy-1;y<cy+9;y+=3)hl(94,y,21,0);
  for(let x=0;x<128;x++){const y=57+Math.round(Math.sin(x*0.06+1)*2);for(let q=y;q<64;q++)if(((x+q)&1)==0)px(x,q);px(x,y)}
  fillR(22,44,3,15,1);fillR(17,48,3,2,1);fillR(17,45,2,4,1);fillR(27,46,3,2,1);fillR(28,43,2,4,1);for(const[pc,pw,ph]of[[48,16,8],[80,22,11],[63,30,15]]){for(let r=0;r<ph;r++){const hw=Math.round(pw/2*(r+1)/ph),y=58-ph+r;for(let x=pc-hw;x<=pc+hw;x++){px(x,y,0);if(((x+y)&1)==0||x==pc-hw||x==pc+hw)px(x,y)}}}}
 else if(w==3){stars(22,44);
  fcirc(16,12,6,1);fcirc(19,10,5,0);
  {const c=102,fl=59,R=[];const row=(y,a,b)=>R.push([y,c+a,c+b]);
   for(let y=4;y<9;y++)row(y,0,1);for(let y=9;y<18;y++){const u=(y-9)/9,hw=Math.round(1+u*u*2);row(y,-hw,hw)}row(18,-5,5);row(19,-5,5);
   for(let y=20;y<41;y++){const u=(y-20)/20,hw=Math.round(4+u*u*6);row(y,-hw,hw)}
   row(40,-16,-13);row(40,13,16);for(let y=41;y<44;y++)row(y,-16,16);
   for(let y=44;y<fl;y++){const u=(y-44)/(fl-45),oh=Math.round(13+Math.pow(u,1.7)*10),ap=47,ih=y<ap?0:Math.round(12*Math.sqrt(Math.max(0,1-Math.pow((fl-1-y)/(fl-1-ap),2))));if(ih<1)row(y,-oh,oh);else{row(y,-oh,-ih);row(y,ih,oh)}}
   for(const[y,a,b]of R){hl(a,y,b-a);if(b-a>=7)for(let x=a+2;x<b-2;x++){const q=x-c;if(((q+y)&3)==0||((q-y)&3)==0)px(x,y,0)}}
   for(let k=0;k<12;k++){const ph=(t+k*23)%70;if(ph<5){const rr=R[h8(k*31+((t+k*23)/70|0)*7)%(R.length-6)+3],x=rr[1]+h8(k*17+((t+k*23)/70|0)*3)%Math.max(1,rr[2]-rr[1]);px(x,rr[0],0);if(ph<3){px(x-1,rr[0]-1,0);px(x+1,rr[0]+1,0)}}}}
  {const roofs=[[0,42,20],[22,47,15],[39,45,15]];for(const[x,y,w]of roofs){fillR(x,y,w,58-y,0);vl(x,y+3,58-y-3);vl(x+w-1,y+3,58-y-3);line(x,y+3,x+3,y);line(x+w-1,y+3,x+w-4,y);hl(x+3,y,w-6);hl(x,y+3,w);fillR(x+5,y-3,2,3,1);fillR(x+w-7,y-2,2,2,1);for(let wx=x+4;wx<x+w-3;wx+=5)px(wx,y+1);for(let wy=y+6;wy<56;wy+=5){for(let xx=x+1;xx<x+w-1;xx+=2)px(xx,wy+3);for(let wx=x+3;wx<x+w-3;wx+=4){const on=h8(wx*3+wy+((t>>6)&7))%3!=0;if(on){px(wx,wy);px(wx,wy+1)}}}}}
  for(let x=0;x<128;x++){const ph=((x+(t>>2))>>2)&1;if(x>=60||true){px(x,58+ph)}if(((x+(t>>3))%7)==0)px(x,61);if(((x+3-(t>>3))%9)==0)px(x,63)}
  {const bx=Math.round(((t*0.35)%170)-30),y=55;hl(bx,y,14);hl(bx+1,y+1,12);hl(bx+3,y-1,8);for(let k=0;k<4;k++)px(bx+4+k*2,y-1,0)}}
 else if(w==4){stars(10,26);const sy=50,sx=104;fcirc(sx,sy,7,1);for(let y=sy+1;y<sy+8;y+=2)hl(sx-7,y,15,0);for(let a=0;a<12;a++){const an=a/12*6.283+t*0.02;if(Math.sin(an)<0.2)line(sx+Math.cos(an)*10,sy+Math.sin(an)*10,sx+Math.cos(an)*13,sy+Math.sin(an)*13)}
  for(let x=60;x<128;x++){px(x,52);if(((x+(t>>3))%5)==0)px(x,54);if(((x+2-(t>>3))%7)==0)px(x,56);if(((x+(t>>4))%9)==0)px(x,58)}
  for(let y=53;y<60;y+=2){const w2=10-((y-53)>>0);hl(sx-(w2>>1)+((((t>>3)+y)&1)?1:0),y,w2)}
  for(let x=0;x<70;x++){const y=52+Math.round(Math.max(0,x-48)*0.4);for(let q=y;q<64;q++)if(q==y||((x*3+q*5)%7==0))px(x,q)}
  const palm=(bx,h,ph)=>{for(let r=0;r<h;r++){const x=bx+Math.round(Math.sin(r*0.09+ph)*2);fillR(x,52-r,2,1,1);if(r%3==0)px(x,52-r,0)}const tx=bx+Math.round(Math.sin(h*0.09+ph)*2)+1,ty=52-h;const F=['....#######....','..###.###.###..','.##...#.#...##.','##...#..#..#..#','#...#...#...#..'];for(let r=0;r<5;r++)for(let c=0;c<15;c++)if(F[r][c]=='#')px(tx-7+c,ty+r)};
  palm(12,28,0.3);palm(38,13,1.2);
  {const S=SP.plane[0],px0=Math.round(150-((t*0.7)%200));spr(S,px0,40,true)}}
 else if(w==5){stars(12,30);const wl=54;
  // fireworks over the harbour
  for(const[fx,fy,ph]of[[12,12,0],[116,10,45],[106,22,90],[20,26,130]]){const c=(t+ph)%150;if(c<20){const y=Math.round(wl-(wl-fy)*c/20);px(fx,y);px(fx,y+1)}else if(c<95){const p=(c-20)/75,R=2+p*11;for(let a=0;a<12;a++){const an=a/12*6.283+ph;const X=Math.round(fx+Math.cos(an)*R),Y=Math.round(fy+Math.sin(an)*R+p*p*5);if(p<0.8||((a+X)&1))px(X,Y)}if(p<0.15){px(fx,fy);px(fx-1,fy);px(fx+1,fy);px(fx,fy-1);px(fx,fy+1)}}}
  // harbour bridge: arch + deck + pylons
  {const L=80,Rr=158,top=26,deck=46;for(let x=L;x<=Rr;x++){const u=(x-(L+Rr)/2)/((Rr-L)/2),ya=Math.round(top+(deck+4-top)*u*u),yb=Math.round(top+5+(deck+4-top-5)*u*u*1.0);px(x,ya);if(yb<deck)px(x,yb);if(x%4==0)line(x,ya,x+2,Math.min(yb,deck));if(x%4==0&&ya<deck)for(let y=Math.max(yb,ya)+1;y<deck;y+=2)px(x,y)}
   hl(52,deck,76);hl(52,deck+2,76);for(let x=52;x<128;x+=3)px(x,deck+1);
   fillR(72,36,8,wl-36,1);for(let y=39;y<wl;y+=4)hl(73,y,6,0);fillR(74,40,4,5,0);hl(71,35,10);fillR(52,44,4,wl-44,1)}
  // opera house on the left
  {const base=wl-2;fillR(0,base-3,44,4,1);hl(1,base-2,42,0);const sh=(ax,top,bl,br)=>{const h=base-3-top;for(let y=top;y<base-3;y++){const tt=(y-top)/h,l=Math.round(ax+(bl-ax)*tt),r=Math.round(ax+(br-ax)*(1-(1-tt)*(1-tt)));px(l-1,y,0);hl(l,y,r-l+1);for(let x=l+2;x<r;x++)if(((x-y*2)%6+6)%6==0)px(x,y,0)}};sh(4,40,6,18);sh(13,32,16,30);sh(25,37,28,40);sh(34,43,36,43)}
  // water
  hl(0,wl,128);for(let y=wl+2;y<64;y+=3){const o=((t>>3)+y*5)%11;for(let x=o;x<128;x+=11){px(x,y);px(x+1,y)}}
  for(let y=wl+2;y<64;y+=2)if(((y+(t>>3))&1))hl(10,y,10);
  {const fx2=Math.round(((t*0.3)%180)-30),S=SP.ferry[(t>>4)&1];spr(S,fx2,wl+4,false)}}
 else if(w==6){stars(26,60);const cx=100,cy=56,R=15;fcirc(cx,cy,R,1);for(let y=cy-14;y<=cy+14;y+=5){hl(cx-14,y,29,0)}fcirc(cx-5,cy+5,2,0);
  for(let a=0;a<60;a++){const an=a/60*6.283;const X=Math.round(cx+Math.cos(an)*26),Y=Math.round(cy+Math.sin(an)*6-1);if(Math.sin(an)>0||Math.abs(X-cx)>15)px(X,Y)}
  const ma=t*0.05;px(Math.round(cx+Math.cos(ma)*26),Math.round(cy+Math.sin(ma)*6-1)-1);}
 else if(w==7){
  // falling snow: big 5x5 flakes, medium plus flakes, small dots
  for(let k=0;k<20;k++){const kind=k%10<4?2:k%10<8?1:0,sp=kind==2?0.32+(k%3)*0.08:kind==1?0.5+(k%3)*0.1:0.8+(k%2)*0.2;
   const x=Math.round((h8(k*7+1)%128)+Math.sin((t+k*21)*0.045)*3),y=Math.round(((h8(k*11+5)*0.6+k*9+t*sp)%78)-7);
   if(x>16&&x<112&&y>5&&y<40)continue;
   if(kind==2){px(x,y);px(x-1,y);px(x+1,y);px(x-2,y);px(x+2,y);px(x,y-1);px(x,y+1);px(x,y-2);px(x,y+2);px(x-1,y-1);px(x+1,y-1);px(x-1,y+1);px(x+1,y+1)}
   else if(kind==1){px(x,y);px(x-1,y);px(x+1,y);px(x,y-1);px(x,y+1)}
   else px(x,y)}
  // snowman (cx=108), face turned toward the middle
  {const cx=114,wv=Math.sin(t*0.15);
   fcirc(cx,56,6,1);fcirc(cx,45,5,1);fcirc(cx,36,4,1);
   hl(cx-3,50,7,0);hl(cx-3,40,7,0);
   // hat
   hl(cx-5,31,11,1);fillR(cx-3,27,7,4,1);hl(cx-3,29,7,0);
   // eyes (blink) + nose + mouth
   if(t%110<4){hl(cx-3,35,2,0);hl(cx+1,35,2,0)}else{px(cx-2,35,0);px(cx+2,35,0)}
   px(cx-5,37,1);px(cx-6,37,1);px(cx-7,38,1);
   for(const m of [[-2,38],[-1,39],[0,39],[1,39],[2,38]])px(cx+m[0],m[1],0);
   // scarf with a tail that flaps in the wind
   hl(cx-4,40,9,1);hl(cx-4,41,9,0);for(let i=0;i<7;i++)px(cx+5+i,40+Math.round(Math.sin(t*0.25+i*0.8)*(1+i*0.15)),1);
   // buttons
   px(cx,45,0);px(cx,48,0);px(cx,55,0);px(cx,59,0);
   // both arms wave, opposite phases
   const la=Math.round(wv*3),ra=Math.round(-wv*3);
   line(cx-5,44,cx-12,40+la,1);px(cx-12,38+la,1);px(cx-14,39+la,1);px(cx-12,42+la,1);
   line(cx+5,44,cx+12,40+ra,1);px(cx+12,38+ra,1);px(cx+14,39+ra,1);px(cx+12,42+ra,1)}
  // snowy ground
  for(let x=0;x<128;x++){const y=62+(Math.sin(x*0.09)>0.5?-1:0);for(let q=y;q<64;q++)px(x,q)}}
 else if(w==8){for(let k=0;k<20;k++){const x=h8(k*7)%128+Math.round(Math.sin((t+k*14)*0.06)*2),y=((h8(k*11)-t*(0.5+(k%3)*0.3))%64+64)%64;if(k%4==0){px(x-1,y);px(x+1,y);px(x,y-1);px(x,y+1)}else px(x,y)}
  for(const bx of [14,30,100,118]){for(let q=0;q<16;q++){const s=Math.round(Math.sin(q*0.5+t*0.08+bx)*1.5);px(bx+s,60-q);px(bx+s+1,60-q)}}
  spr(SP.jelly[(t>>4)&1],64,Math.round(48+Math.sin(t*0.05)*3),false);spr(SP.shark[(t>>4)&1],Math.round(160-(t*0.35)%200),56,true);const fx=(t*0.9)%170-20;spr(SP.fish[(t>>3)&1],Math.round(fx),30,false);spr(SP.fish[(t>>3)&1],Math.round(150-(t*0.6)%170),48,true);
  for(let x=0;x<128;x++)for(let q=61;q<64;q++)if(((x+q)&1)==0)px(x,q)}
 else if(WORLDS[w].k=='rio'){stars(18,40);
  {const m=100;for(let yy=-5;yy<=5;yy++)for(let xx=-5;xx<=5;xx++)if(xx*xx+yy*yy<=27&&!((xx-2)*(xx-2)+(yy+1)*(yy+1)<=18))px(m+xx,9+yy)}
  const sea=55;
  const ridge=(x)=>{if(x<=17)return Math.round(25+Math.pow((17-x)/17,1.6)*14);const u=(x-17)/27;return Math.round(25+(u<0.25?u*4*5:5+Math.pow((u-0.25)/0.75,0.8)*25))};
  for(let x=0;x<=44;x++){const y=Math.min(sea,ridge(x));px(x,y);for(let q=y+2;q<sea;q++)if(((x+q)&1)==0&&((q-y)>2||(x&1)))px(x,q)}
  {const cx=17,ty=ridge(17),S=["......###......","......###......",".......#.......","###############","##...#####...##",".....#####.....","......###......","......###......",".....#####.....",".....#####.....","....#######....","...#########...","...#########..."];const oy=ty-S.length;fillR(cx-8,oy-1,17,S.length+1,0);for(let r=0;r<S.length;r++)for(let c=0;c<15;c++)if(S[r][c]=='#')px(cx-7+c,oy+r)}
  const loaf=(c,top,r,e)=>{for(let x=c-r;x<=c+r;x++){const u=(x-c)/r,y=Math.round(sea-(sea-top)*Math.pow(Math.max(0,1-Math.pow(Math.abs(u),2.4)),e));if(y<sea){px(x,y);for(let q=y+2;q<sea;q++)if(((x+q)&1)==0&&((q-y)>2||(x&1)))px(x,q)}}};
  loaf(86,44,10,0.6);loaf(114,24,12,0.35);
  {const ax=86,ay=44,bx=114,by=24;for(let x=ax;x<=bx;x+=2)px(x,Math.round(ay+(x-ax)*(by-ay)/(bx-ax)));const P=58,p=(t*0.2)%(2*P),q=(p<P?p:2*P-p)/P,x=Math.round(ax+(bx-ax)*q),y=Math.round(ay+(by-ay)*q);vl(x,y,2);fillR(x-2,y+2,5,4,1);px(x-1,y+3,0);px(x+1,y+3,0)}
  for(let x=0;x<128;x++){const ph=((x+(t>>2))>>2)&1;if(ph)px(x,sea+1);if(((x*7+(t>>3))%11)==0)px(x,sea+3);if(((x*5+3-(t>>3))%13)==0)px(x,sea+6)}
  {const P2=26,pp=(t*0.12)%(2*P2),bx=Math.round(48+(pp<P2?pp:2*P2-pp)),by=sea;hl(bx,by,7);hl(bx+1,by+1,5);vl(bx+3,by-6,6);for(let r=0;r<5;r++)hl(bx+4,by-6+r,Math.max(1,4-r))}
  for(let k=0;k<3;k++){const rx=100+k*3,ry=sea+2+k*2;if(((t>>4)+k)&1)hl(rx,ry,3-k)}}
 const nm=WORLDS[DWORLD[w]].n,e=Math.min(1,t/24),es=1-(1-e)*(1-e),wt='WORLD '+(w+1),lt='LEVELS '+(w*10+1)+'-'+(w*10+10);
 const cx0=(s,sc)=>Math.round(64-(s.length*4*sc-sc)/2);
 textO(wt,cx0(wt,1),4,1);
 const xt=Math.round(64-bigW(nm,3)/2),xs=-bigW(nm,3)-4;bigO(nm,Math.round(xs+(xt-xs)*es),13,3);
 if(t>34)textO(lt,cx0(lt,1),32,1);
 if(t>30&&((t>>4)&1)==0){const pa='PRESS A';textO(pa,cx0(pa,1),57,1)}
}
function renderTitle(){
 SCR.fill(0);
 const SH=HT>0?(HT>=195?3:Math.min(2,Math.ceil(HT/94))):0,SX=SH?Math.round((tHash(ft*5+1)-.5)*2*SH):0,SY=SH>1?Math.round((tHash(ft*9+2)-.5)*2):0;PXO=SX;PYO=SY;
 if(titlePage==1){
  text('SCORING',2,2);text('MAX',53,2);vl(66,2,58);
  const L=[['LANDED',100],['ACCURACY',100],['SOFT LANDING',50],['ANGLE',30],['FUEL REMAIN',100],['FLIGHT TIME',100]];
  for(let k=0;k<L.length;k++){text(L[k][0],2,10+k*8);const s=String(L[k][1]);text(s,65-s.length*4,10+k*8)}
  text('BONUS',70,2);
  const B=[['STAR',50],['360 SPIN',69],['BURN',25],['CHUTE',200]];
  for(let k=0;k<B.length;k++){text(B[k][0],70,10+k*7);const s=String(B[k][1]);text(s,125-s.length*4,10+k*7)}
  text('3 LIVES',70,45);text('FOR ALL 100',70,51);text('A: PLAY',70,58);text('B: BACK',2,58);
  return}
 for(let k=0;k<44;k++){const x=(h8(k*7+3)*3+k*11)%128,y=(h8(k*13+8)*2+k*5)%52,p=(ft+k*53)%420;if(x<90&&y<54)continue;if(p<330)px(x,y);else if(p<372){px(x,y);if(k%3==0){px(x-1,y);px(x+1,y);px(x,y-1);px(x,y+1)}}}
 const ss=ft%420;if(ss<26){const sx=96+ss,sy=2+(ss>>1);for(let q=0;q<6;q++)px(sx-q,sy-(q>>1))}
 for(let x=90;x<118;x++){const y=Math.round(54-(Math.sin(x*0.07+1)+Math.sin(x*0.15)*0.5+1.5)*3.2);if(((x+y)&1)==0)px(x,y)}
 for(let y=58;y<64;y++)for(let x=0;x<128;x++)if(((x+y)&1)==0||y>60)px(x,y);
 hl(0,58,128);
 for(const c of[[10,61,9],[34,62,6],[64,61,10],[120,62,7]]){for(let i=0;i<=c[2];i++){const d=Math.round(Math.sin(i/c[2]*3.14)*1.5);px(c[0]+i,c[1]+d,0)}}
 const gx=119;vl(gx,14,44);vl(gx+5,14,44);for(let y=14;y<54;y+=6){line(gx,y,gx+5,y+6);line(gx+5,y,gx,y+6)}hl(gx,14,6);hl(gx,56,6);hl(gx-8,22,8);hl(gx-8,23,8);vl(gx-8,20,4);
 fillR(gx-1,10,8,3,1);vl(gx+2,4,6);px(gx+3,4);px(gx+4,5);
 const cx=100;fillR(cx-14,54,28,4,1);for(let x=cx-12;x<cx+12;x+=6)vl(x,55,2,0);
 const hp=Math.min(1,HT/195),uu=Math.max(0,(HT-195)/45),OY=Math.round(uu*uu*130);
 titleFx(cx);
 if(HT>0){PXO=SX+Math.round((tHash(ft*3)-.5)*Math.min(3,1+HT/85));PYO=SY-OY+Math.round((tHash(ft*7)-.5)*Math.min(2,HT/102))}
 else if(false){}
 fillR(cx-7,19,15,22,1);
 for(let y=8;y<19;y++){const t=(y-8)/10,hw=Math.round(1+6*Math.sqrt(t));hl(cx-hw,y,2*hw+1)}
 hl(cx-6,15,13,0);hl(cx-7,19,15,0);hl(cx-7,20,15,1);hl(cx-7,38,15,0);hl(cx-7,35,15,0);
 fcirc(cx,27,4,0);fcirc(cx,27,3,1);fcirc(cx,27,2,0);px(cx-1,26,1);px(cx-1,27,1);
 for(let s=-1;s<=1;s+=2){for(let y=29;y<=47;y++){const ww=Math.round(10*Math.pow((y-29)/18,1.4));hl(s<0?cx-7-ww:cx+8,y,ww+1,1)}}
 fillR(cx-4,41,9,4,1);hl(cx-3,42,7,0);hl(cx-2,44,5,0);
 // fire
 const fl=7+((ft>>1)%4)+(ft%5==0?2:0)+Math.round(hp*3+uu*4);for(let r=0;r<fl;r++){const hw=Math.max(1,3+(hp>.3?1:0)-Math.floor(r*0.3)),y=45+r;if(y-OY>=54)break;const j=((ft+r)%3==0)?1:0;hl(cx-hw-j,y,2*hw+1+j,1);if(r>1&&r<fl-2&&hw>0)hl(cx-(hw>>1),y,1+(hw&1),0)}
PXO=SX;PYO=SY;
 textO('POCKET',5,4,2);
 cfText('ROCKET',4,18,2);
 text('HIGH SCORE '+HI,5,37);
 {const on=HT>0||((ft>>4)&1)==0;if(on)text('HOLD A TO LAUNCH',5,47);hl(5,54,64);hl(5,56,64);vl(5,54,3);vl(68,54,3);hl(6,55,Math.round(62*HT/240))}
 PXO=0;PYO=0;
}
let DATA=null,CACHE={};
function getLevel(i){if(CACHE[i])return CACHE[i];const si=ORD[i],d=DATA[si],w=Math.floor(si/10),j=si%10,l=genLevel(w,j,d[0],d[1],d[7]);l.ap=[d[2],d[3],d[4],d[6]||0];l.fuel=d[5];l.W=WORLDS[w];l.si=si;CACHE[i]=l;return l}
function goL(i){INTRO=false;if(LV_reset)LV_reset=0;i=((i%100)+100)%100;TITLE=false;load(i,getLevel(i));lv.hs=0;resetAI();FX.length=0;shake=0;ft=0;autoWait=0;detail=false;crashCnt=false}
function go(i){lives=3;gameOver=false;goL(i);if(lv.i%10==0)startIntro(lv.i)}
function newGame(){lives=3;gameOver=false;score=0;goL(0);startIntro(0)}
function nextLevel(d){if(gameOver||(state=='landed'&&lv.i==99)){TITLE=true;gameOver=false;lives=3;return}if(d==0&&state=='landed')score-=res.sc;goL(lv.i+d);if(d==1&&lv.i%10==0)startIntro(lv.i)}
function blkScene(t){
 const ctr=(s,cx,yy)=>text(s,Math.round(cx-(s.length*4-1)/2),yy);
 ctr('HOW TO FLY',64,1);hl(4,8,120);
 const btn=(ch,cx,cy)=>{fcirc(cx,cy,5,1);const g=FT[ch];for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(g[r*3+c]=='1')px(cx-1+c,cy-2+r,0)};
 btn('A',10,16);text('HOLD FOR THRUST',22,14);
 {const cx=10,cy=27;fillR(cx-1,cy-4,3,9,1);fillR(cx-4,cy-1,9,3,1);for(let i=0;i<3;i++){vl(cx-8+i,cy-i,1+2*i);vl(cx+8-i,cy-i,1+2*i)}}text('TILT LEFT / RIGHT',22,25);
 btn('B',10,38);text('PARACHUTE',22,34);text('NO FUEL + OVER 100M',22,40);
 hl(4,47,120);
 ctr('LAND SLOW + STRAIGHT ON PAD',64,50);
 if(t>20&&((t>>4)&1)==0)ctr('PRESS A',64,58);
}
function step(){
 poll();ft++;
 if(TITLE){if(BLK>0){BLK++;SCR.fill(0);blkScene(BLK);if(BLK>20&&(just.A||just.B)){BLK=0;HOWSEEN=1;newGame();AUTOL=0;ALOCK=true}return}HT=(cur.A||cur.B)?HT+2.7:Math.max(0,HT-8);if(HT>=239.9){HT=0;SCR.fill(0);if(HOWSEEN){newGame();AUTOL=0;ALOCK=true}else BLK=1;return}renderTitle();return}
 if(INTRO){IT++;renderIntro();if(IT>14&&(just.A||just.B)){INTRO=false;ALOCK=true}return}
 let inp;
 if(mode=='auto'){inp=aiInputs();if((state=='landed'||state=='crashed')&&sT>(state=='crashed'?90:30)){autoWait++;if(autoWait>60)nextLevel(state=='landed'?1:0)}}
 else{inp={L:!!cur.L,R:!!cur.R,A:!!cur.A,B:!!just.B};if(AUTOL>0){inp.A=true;AUTOL--;ALOCK=!!cur.A}else if(ALOCK){if(!cur.A)ALOCK=false;inp.A=false}}
 simStep(inp);fxStep();if(state=='crashed'&&!crashCnt){crashCnt=true;lives--;if(lives<=0){lives=0;gameOver=true;saveHi()}}if(state=='landed'&&!lv.hs){lv.hs=1;saveHi()}
 if(mode=='manual'&&(state=='landed'||state=='crashed')&&sT>(state=='crashed'?70:(res&&(res.perf||res.egg))?100:40)&&(just.A||just.B)){if(state=='landed'&&just.B&&!just.A)detail=!detail;else{nextLevel(state=='landed'?1:0);ALOCK=true}}
 if(gameOver&&state=='crashed'&&sT>70){GOT=sT-70;renderGameOver()}else if(state=='landed'&&lv.i==99&&sT>40){WINT=sT-40;renderWin()}else render();
}

{const _r=render;render=function(){_r();PXO=0;PYO=0}}
