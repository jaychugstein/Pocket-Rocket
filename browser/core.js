const ORD=[0,1,2,3,5,4,6,8,7,9,11,10,14,12,13,16,15,17,19,18,20,21,22,23,24,26,25,29,28,27,100,101,102,104,106,103,105,107,108,109,40,41,42,43,46,44,45,47,49,48,50,51,52,53,54,55,56,58,57,59,33,60,34,37,63,36,64,66,39,67,70,71,72,77,78,73,76,74,75,79,80,82,83,81,84,85,86,88,89,87,90,91,92,95,93,96,98,99,97,94];
const TH=0.026,ROT=0.02,BURN=0.06;
function RNG(seed){let s=(seed>>>0)||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
// movers: w,h hitbox; m motion mode; v speed range; ay bob amplitude
const MK={
 bird:{w:7,h:4,m:'wrap',v:[.30,.45],ay:2,nm:'BIRD'}, vulture:{w:9,h:5,m:'osc',nm:'VULTURE'},plane:{w:12,h:4,m:'wrap',v:[.45,.60],nm:'PLANE'},gull:{w:9,h:4,m:'wrap',v:[.20,.30],ay:4,nm:'GULL'},crow:{w:7,h:4,m:'wrap',v:[.25,.40],ay:2,nm:'CROW'},
 bigshark:{w:26,h:7,m:'wrap',v:[.22,.30],ay:3,nm:'GREAT SHARK'},fork:{w:13,h:4,m:'wrap',v:[.28,.40],ay:3,nm:'FORK'},sat:{w:13,h:7,m:'wrap',v:[.25,.35],nm:'SATELLITE'},
 ufo:{w:11,h:5,m:'bounce',v:[.30,.45],ay:3,nm:'UFO'}, fish:{w:7,h:4,m:'wrap',v:[.25,.40],ay:2,nm:'FISH'},shark:{w:15,h:6,m:'wrap',v:[.32,.45],ay:1,nm:'SHARK'},puffer:{w:7,h:7,m:'osc',nm:'PUFFERFISH'},jelly:{w:7,h:7,m:'osc',nm:'JELLYFISH'},
 parrot:{w:8,h:5,m:'wrap',v:[.30,.42],ay:3,nm:'PARROT'},cablecar:{w:9,h:7,m:'wire',v:[.10,.15],nm:'CABLE CAR'}, gondola:{w:15,h:7,m:'bounce',v:[.10,.16],nm:'GONDOLA'},ferry:{w:17,h:7,m:'bounce',v:[.12,.18],nm:'FERRY'},laser:{m:'laser',nm:'LASER'}};
const WORLDS=[
{n:'SEOUL',g:.012,fl:61,fk:'st',low:['bldg','mast','tank','pole'],up:['ufo'],mv:['bird','crow','plane']},
{n:'VENEZIA',g:.012,fl:56,fk:'wat',k:'venice',low:['mpole','mpole','bridge','campan'],up:[],mv:['bird','gull','gondola']},
{n:'GIZA',g:.012,fl:59,fk:'g',wind:1,low:['cactus','cactus','mesa','pole','hoodoo'],up:['ufo'],mv:['vulture','bird','plane']},
{n:'MOONBASE',g:.007,fl:59,fk:'g',k:'mbase',low:['boulder','mast','dome','obelisk','dome'],up:['sat','ufo'],mv:['sat','ufo']},
{n:'LISBOA',g:.012,fl:54,fk:'sand',k:'lisboa',low:['palm','palm','stackr','palm','stackr'],up:[],mv:['plane']},
{n:'SYDNEY',g:.012,fl:56,fk:'wat',k:'sydney',low:['yacht','pylon','yacht'],up:[],mv:['gull','plane','gull']},
{n:'STAR BASE',g:.010,fl:0,k:'planet',low:['sat','ufo'],up:['sat','ufo'],mv:['sat','ufo']},
{n:'SIBERIA',g:.011,fl:59,fk:'g',wind:1,low:['snowman','snowman','pole','icewall','spike'],up:['ufo'],mv:['gull','crow','plane']},
{n:'MARIANA',g:.010,fl:59,fk:'sea',k:'sea',low:['seaweed','seaweed','coral','clam','clam','anchor','sponge'],up:[],mv:['fish','fish','puffer','jelly','shark']},
{n:'RIO',g:.012,fl:59,fk:'g',k:'rio',low:['palm','favela','palm'],up:[],mv:['parrot','parrot','gull']},
{n:'PARIS',g:.012,fl:59,fk:'pav',k:'paris',low:['lamp','morris','lamp','morris'],up:[],mv:['bird','crow','plane']}];
const DWORLD=[0,1,2,10,4,5,6,7,8,9];
const ATT_UP={hook:1,stalc:1,crysc:1};
const FLX={6:55};const LOWX={};const MIRX={59:0,9:0,6:0,109:0,0:0,39:0,70:0,90:1,91:1,94:0,95:0};
function genLevel(w,j,seed,ease,mvc){
 ease=ease||0;if(mvc==null)mvc=-1;
 const W=WORLDS[w],rnd=RNG(seed*2654435761+w*1013+j*7919+3),ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
 const rm=RNG(seed*40503+w*977+j*131+11),rmi=(a,b)=>a+Math.floor(rm()*(b-a+1)),pick=a=>a[Math.floor(rm()*a.length)];
 const mr=rnd()<.5,mir=((w*10+j) in MIRX)?!!MIRX[w*10+j]:mr,planet=W.k=='planet',cake=W.k=='cake',cave=W.k=='cave',fl=((w*10+j) in FLX)?FLX[w*10+j]:W.fl,void_=!fl;
 const bv=ri(0,2),LOW=LOWX[w*10+j]||W.low;
 const sea=W.k=='sea';const na=sea?[0,1,1,2,2,2,2,3,3,3][j]:void_?[0,1,1,2,2,2,2,3,3,3][j]:(j<2?0:j<5?1:j<8?(rnd()<.5?1:2):2);
 let airLeft=na;
 const twMax=planet?22:28,tw=Math.round(twMax-(twMax-14)*j/9);
 let nG=Math.min(3,(j+1)>>1);if(void_)nG=Math.min(nG,Math.max(0,na-(na>=2?1:0)));const gap=Math.round(34-(34-22)*j/9)+ease;
 const S=[],K=[],D=[];
 const add=(x,y,w2,h,k)=>{S.push([Math.round(x),Math.round(y),Math.round(w2),Math.round(h)]);K.push(k)};
 const disc=(cx,cy,rx,ry,kind,top)=>{D.push({cx,cy,rx,ry,kind,top});for(let y=Math.round(cy-ry);y<cy+ry;y+=2){if(top!=null&&y<top)continue;const yc=y+1,q=1-((yc-cy)/ry)**2;if(q<=0)continue;const hw=rx*Math.sqrt(q);if(hw<1)continue;add(Math.round(cx-hw),y,Math.round(2*hw),2,'d')}};
 // triangle by strips: up=true apex on top (y0), else apex at the bottom
 const tri=(cx,y0,H,wb,k,up)=>{for(let r=0;r<H;r+=2){const hh=Math.min(2,H-r),f=up?(r+hh)/H:(H-r)/H,ww=Math.max(2,Math.round(wb*f));add(cx-(ww>>1),y0+r,ww,hh,k)}};
 // obstacle builder. side 'low': edge=top y; side 'up': edge=bottom y. returns approx bbox
 const placed=[],SM=[];
 const ovl=(b,m)=>placed.some(p=>b[0]<p[0]+p[2]+m&&b[0]+b[2]>p[0]-m&&b[1]<p[1]+p[3]+m&&b[1]+b[3]>p[1]-m);
 const h8c=v=>{v=(v*2654435761)>>>0;return (v>>>13)&255};const B=(kind,side,cx,edge,gw)=>{
  let H=side=='low'?(fl?fl-edge:20):edge;let bb=[cx-8,edge,16,12];
  switch(kind){
   case 'bldg':{const bw=gw+2;add(cx-(bw>>1),edge,bw,H,'bldg');bb=[cx-(bw>>1),edge,bw,H];break}
   case 'hoodoo':{const cw=gw+4;add(cx-2,edge+4,4,Math.max(2,H-4),'rockc');add(cx-(cw>>1),edge,cw,4,'rockc');bb=[cx-(cw>>1),edge,cw,H];break}
   case 'obelisk':add(cx-3,edge,7,H,'obe');bb=[cx-3,edge,7,H];break;
   case 'icewall':{const iw=gw;add(cx-(iw>>1),edge,iw,H,'ice');bb=[cx-(iw>>1),edge,iw,H];break}
   case 'stackr':{if(W.k=='lisboa'&&H<18){const e3=Math.max(16,fl-18);H=fl-e3;edge=e3}if(H>=7&&cx%2==0){const cw=gw+4,x0=cx-(cw>>1),tt=3;add(x0,edge+tt,cw,H-tt,'cst');add(x0,edge,3,tt,'cstt');add(x0+cw-3,edge,3,tt,'cstt');if(cw>=11)add(cx-1,edge+1,3,tt-1,'cstt');bb=[x0,edge,cw,H];break}const t1=Math.max(2,Math.floor(H/3)),t2=t1,t3=H-t1-t2;add(cx-((gw-2)>>1),edge,gw-2,t1,'stk');add(cx-(gw>>1),edge+t1,gw,t2,'stk');add(cx-((gw+2)>>1),edge+t1+t2,gw+2,Math.max(1,t3),'stk');bb=[cx-((gw+2)>>1),edge,gw+2,H];break}
   case 'pole':add(cx-1,edge,2,H,'pole');add(cx+1,edge,6,4,'flag');bb=[cx-1,edge,8,H];break;
   case 'gift':{const gwid=Math.max(9,Math.min(15,gw+5)),gh=Math.min(H,ri(9,14));add(cx-(gwid>>1),fl-gh,gwid,gh,'gift');bb=[cx-(gwid>>1),fl-gh,gwid,gh];break}
   case 'yacht':{const mh=Math.min(H,ri(16,24)),top=fl-mh;add(cx-6,fl-3,13,3,'hull');add(cx,top,2,mh-3,'mst');for(let r=0;r<mh-6;r+=2){const w2=Math.max(1,Math.round((r+2)*0.45));add(cx-w2,top+2+r,w2,2,'sail')}bb=[cx-7,top,14,mh];break}
   case 'pylon':{const ph=Math.min(H,ri(18,26)),top=fl-ph,pw=Math.max(9,gw+1);add(cx-(pw>>1),top,pw,ph,'pyl');bb=[cx-(pw>>1),top,pw,ph];break}
   case 'cdl':add(cx-1,edge,3,H,'cdl');bb=[cx-1,edge-3,3,H+3];break;
   case 'snowman':{const n3=H>=18,r1=Math.max(3,n3?(H+4)/4.6:(H+2)/3.4),rs=n3?[r1,r1*.75,r1*.55]:[r1,r1*.7];const cys=[];let cy=edge+H-rs[0];cys.push(cy);for(let q=1;q<rs.length;q++){cy=cy-rs[q-1]-rs[q]+2;cys.push(cy)}
    const top=Math.min(...cys.map((y,q)=>y-rs[q])),i0=S.length;
    for(let y=Math.floor(top);y<edge+H;y+=2){let ww=0;for(let q=0;q<rs.length;q++){const dy=(y+1)-cys[q];if(Math.abs(dy)<rs[q])ww=Math.max(ww,2*Math.sqrt(rs[q]*rs[q]-dy*dy)+1)}ww=Math.round(ww);if(ww>=2)add(cx-(ww>>1),y,ww,Math.min(2,edge+H-y),'snow')}
    SM.push({idx:Array.from({length:S.length-i0},(_,q)=>i0+q),cx,r:rs,cy:cys,top,H:edge+H-top});bb=[cx-Math.round(rs[0]),Math.floor(top),Math.round(2*rs[0])+1,Math.ceil(edge+H-top)];break}
   case 'seaweed':add(cx-2,edge,4,H,'kelp');bb=[cx-2,edge,4,H];break;
   case 'coral':{if(H>6)add(cx-1,edge+5,3,H-5,'cor');add(cx-6,edge,13,Math.min(6,H),'cor');bb=[cx-6,edge,13,H];break}
   case 'clam':{if(H>7)add(cx-3,edge+6,7,H-6,'rockc');add(cx-5,edge,11,Math.min(6,H),'clam');bb=[cx-5,edge-2,11,H+2];break}
   case 'anchor':{add(cx-1,edge+2,3,Math.max(2,H-2),'post');add(cx-5,edge+3,11,2,'post');add(cx-2,edge,5,2,'post');bb=[cx-5,edge,11,H];break}
   case 'sponge':{const sw=gw>8?7:5;add(cx-(sw>>1),edge,sw,H,'spg');bb=[cx-(sw>>1),edge,sw,H];break}
   case 'mast':add(cx-3,edge,6,H,'mast');bb=[cx-3,edge,6,H];break;
   case 'morris':{const mh=Math.min(H,ri(14,18)),e2=fl-mh;add(cx-3,e2+4,7,mh-4,'mor');add(cx-2,e2,5,4,'morc');bb=[cx-4,e2,9,mh];break}
   case 'lamp':{add(cx-1,edge+4,2,Math.max(1,H-4),'lmp');add(cx-1,edge,10,4,'lmh');bb=[cx-1,edge,10,H+0];break}
   case 'favela':{const h3=Math.max(3,Math.floor(H*0.3)),h2=Math.max(3,Math.floor(H*0.33)),h1=Math.max(1,H-h2-h3),w1=gw+10,w2=gw+6,w3=gw+2;add(cx-(w3>>1)-2,edge,w3,h3,'fav');add(cx-(w2>>1)+2,edge+h3,w2,h2,'fav');add(cx-(w1>>1),edge+h3+h2,w1,h1,'fav');bb=[cx-(w1>>1),edge,w1,H];break}
   case 'mpole':add(cx-1,edge,3,H,'mpl');bb=[cx-1,edge,3,H];break;
   case 'bridge':{const bw=gw+14;add(cx-(bw>>1),edge,bw,3,'brg');if(H>3){add(cx-(bw>>1),edge+3,3,H-3,'brg');add(cx+(bw>>1)-3,edge+3,3,H-3,'brg')}bb=[cx-(bw>>1),edge,bw,H];break}
   case 'campan':{if(H>6)add(cx-3,edge+5,7,H-5,'cmp');tri(cx,edge,Math.min(5,H),7,'tri',true);bb=[cx-3,edge,7,H];break}
   case 'dome':{const rx=Math.min(9,Math.max(5,gw)),hh=Math.min(H,rx+1);for(let r=0;r<hh;r+=2){const t=1-(r+1)/hh,ww=Math.max(2,Math.round(2*rx*Math.sqrt(Math.max(0,1-t*t))));add(cx-(ww>>1),fl-hh+r,ww,Math.min(2,hh-r),'dm')}if(H>hh)add(cx-1,edge,3,H-hh,'post');bb=[cx-rx,edge,2*rx,H];break}
   case 'tank':{const tw2=gw+4;add(cx-(tw2>>1),edge,tw2,7,'tank');if(H>8){add(cx-(tw2>>1)+1,edge+7,2,H-7,'leg');add(cx+(tw2>>1)-2,edge+7,2,H-7,'leg')}bb=[cx-(tw2>>1),edge,tw2,H];break}
   case 'cactus':{add(cx-2,edge,4,H,'cac');add(cx-6,edge+5,4,2,'cac');add(cx-6,edge+2,2,5,'cac');if(H>14){add(cx+2,edge+9,4,2,'cac');add(cx+4,edge+6,2,5,'cac')}bb=[cx-6,edge,12,H];break}
   case 'mesa':{const mw=gw+6;add(cx-(mw>>1),edge,mw,H,'mesa');bb=[cx-(mw>>1),edge,mw,H];break}
   case 'boulder':{const bw=gw+4;add(cx-(bw>>1),edge,bw,H,'bld');bb=[cx-(bw>>1),edge,bw,H];break}
   case 'palm':{if(W.k=='lisboa'){const e2=Math.max(28,edge-12),H2=H+(edge-e2);add(cx-1,e2+5,3,Math.max(2,H2-5),'trk');add(cx-7,e2,15,6,'frondL');bb=[cx-7,e2,15,H2];break}const e2=Math.max(12,edge-7),H2=H+(edge-e2);add(cx-1,e2+4,3,Math.max(2,H2-4),'trk');add(cx-5,e2,11,5,'frond');bb=[cx-5,e2,11,H2];break}
   case 'spike':{const sw=Math.max(5,gw-2);tri(cx,edge,H,sw,'tri',true);bb=[cx-(sw>>1),edge,sw,H];break}
   default:{const mk=MK[kind];if(mk){const y=side=='low'?edge:edge-mk.h;add(cx-(mk.w>>1),y,mk.w,mk.h,'sp:'+kind);bb=[cx-(mk.w>>1),y,mk.w,mk.h]}}
  }
  placed.push(bb);return bb};
 const mb=W.k=='mbase',FS=mb&&(j%3==1||j==9),FT=mb&&(j%3==2||j==9),MTN=W.k=='rio'&&(j==3||j==4||j==7||j==9),EIF=W.k=='paris'&&j==9,OPR=W.k=='sydney'&&j==9,NAM=w==0&&j==9,HAN=w==0&&j==6,HELI=w==0&&j==5;if(MTN||EIF||NAM||HAN||OPR)nG=0;
 const V=MTN?j:-1;const xs=OPR?ri(14,17):NAM?ri(14,17):HAN?ri(14,16):EIF?ri(14,17):V==4?ri(16,19):V==5?ri(36,40):V==9?ri(41,43):MTN?ri(46,58):ri(14,22),yS=OPR?ri(42,45):NAM?ri(46,49):HAN?ri(44,47):EIF?ri(48,50):MTN?fl-6:FS?ri(30,40):fl?ri(38,Math.min(52,fl-8)):ri(38,54);
 const xtHi=cake?Math.min(108,128-Math.ceil(tw/2)-16):Math.min(108,123-Math.ceil(tw/2));
 const xt=OPR?ri(110,113):NAM?ri(108,112):HAN?ri(80,84):EIF?ri(111,113):V==4?ri(107,109):V==9?ri(79,81):ri(Math.max(94,xtHi-10),xtHi)+(V==3?2:0),yT=OPR?ri(44,47):NAM?ri(46,49):HAN?fl-4:HELI?ri(22,26):EIF?ri(48,50):V==4?ri(46,48):V==7?ri(43,46):V==9?ri(34,38):MTN?ri(28,38):FT?ri(28,40):ri(30,fl?Math.min(50,fl-8):50);
 const L=[xs-11,yS,22],T=[xt-Math.floor(tw/2),yT,tw];const xA=V==9?ri(12,13):V==5?ri(13,15):V==3?ri(13,19)-2:MTN?ri(13,19):0,yA=V==7?ri(40,44):V==9?ri(38,44):MTN?ri(28,36):0,xM=V==5?ri(62,64):V==9?ri(107,108):0,yM=V==5?ri(30,36):V==9?ri(38,44):0;
 const mtn=(cx,top,hw0,g=1)=>{for(let y=top;y<fl;y+=2){const u=(y-top)/(fl-top),hw=Math.round(hw0+g*(4*Math.sqrt(u)+5*u));add(cx-hw,y,2*hw,Math.min(2,fl-y),'mtn')}};
 if(V==4){add(xs-12,yS,24,fl-yS,'pier');mtn(64,43,7,1.1);const ox=46,RW=[[0,16,19],[1,15,20],[2,15,20],[3,16,19],[4,17,18],[5,2,33],[6,0,35],[7,1,34],[8,8,27],[9,11,24],[10,13,22]];for(let y=11;y<22;y++)RW.push([y,14,21]);for(let y=22;y<28;y++)RW.push([y,13,22]);RW.push([28,14,21]);for(const[y,a,b]of RW)add(ox+a,y+8,b-a+1,1,'jes');add(ox+11,37,14,1,'jes');add(ox+12,38,12,5,'jesp')}else if(MTN){mtn(xA,yA,V==5||V==9?1:5,V==9?0.5:1);if(xM)mtn(xM,yM,1,V==9?0.5:1);add(xs-12,yS,24,fl-yS,'pier')}else if(fl&&!FS)add(0,yS,xs+14,64-yS,'g');else add(xs-14,yS,28,9,'s');
 if(planet){const r=16,cy=yT+r-5;disc(xt,cy,r,r,'planet',yT)}
 else if(cake){add(T[0]-5,yT,tw+10,8,'ck1');add(T[0]-14,yT+8,tw+28,64-yT-8,'ck2')}
 else if(V==4||NAM)add(T[0]-6,yT,128-(T[0]-6),64-yT,'g');else if(HAN)add(T[0]-2,yT,tw+4,fl-yT,'pier');else if(HELI)add(T[0]-3,yT,tw+6,64-yT,'g');else if(MTN)mtn(xt,yT,Math.ceil(tw/2)+(V==9?2:5));
 else if(fl&&!FT)add(T[0]-6,yT,128-(T[0]-6),64-yT,'g');
 else add(T[0]-5,yT,tw+10,9,'s');
 if(fl)add(0,fl,128,64-fl,MTN||HAN?'wat':W.fk);
 if(OPR){add(36,46,62,fl-46,'opb');const sh=(ax,top,bl,br)=>{const h=46-top;for(let y=top;y<46;y++){const t=(y-top)/h,l=Math.round(ax+(bl-ax)*t),r=Math.round(ax+(br-ax)*(1-(1-t)*(1-t)));if(r>=l)add(l,y,r-l+1,1,'opr')}};sh(42,30,44,62);sh(54,19,58,80);sh(70,26,73,92);sh(83,34,85,96)}
 if(NAM){mtn(64,47,9,1.2);const c=64,rw=(y,a,b,h=1)=>add(c+a,y,b-a,h,'nam');rw(42,-4,4,5);rw(28,-1,2,14);for(const[y,h]of[[21,2],[22,4],[23,6],[24,6],[25,5],[26,3],[27,2]])rw(y,-h,h+1);rw(15,-1,2,6);rw(9,0,1,6)}
 if(HAN){add(0,16,128,3,'brd');add(104,19,5,fl-19,'brp');add(116,yS,12,64-yS,'g')}
 if(EIF){const c=72,row=(y,a,b)=>add(c+a,y,b-a,1,'eif');for(let y=4;y<9;y++)row(y,0,1);for(let y=9;y<18;y++){const u=(y-9)/9,hw=Math.round(1+u*u*2);row(y,-hw,hw)}row(18,-5,5);row(19,-5,5);for(let y=20;y<41;y++){const u=(y-20)/20,hw=Math.round(4+u*u*6);row(y,-hw,hw)}row(40,-16,-13);row(40,13,16);for(let y=41;y<44;y++)row(y,-16,16);for(let y=44;y<fl;y++){const u=(y-44)/(fl-45),oh=Math.round(13+Math.pow(u,1.7)*10),ap=47,ih=y<ap?0:Math.round(12*Math.sqrt(Math.max(0,1-Math.pow((fl-1-y)/(fl-1-ap),2))));if(ih<1)row(y,-oh,oh);else{row(y,-oh,-ih);row(y,ih,oh)}}}
 if(cave)add(0,0,128,5,'rk');
 const lo=xs+14+9,hi=T[0]-16;
 if(hi-lo<22*(nG-1))nG=Math.max(0,Math.floor((hi-lo)/22)+1);
 const route=[[xs,yS-18]],gates=[];
 let prev=yS-16;
 for(let i=0;i<nG;i++){
  const gx=Math.round(nG>1?lo+(hi-lo)*i/(nG-1)+ri(-2,2):(lo+hi)/2),gw=ri(6,9);
  const loC=gap/2+9,hiC=fl?Math.min(46,fl-gap/2-8):46;
  const cg=Math.round(cl(prev+ri(-12,12),loC,hiC));prev=cg;
  const up=cg-gap/2,lw=cg+gap/2;route.push([gx,W.k=='lisboa'?Math.max(22,cg-12):cg]);gates.push([gx,cg,gw]);
  const ku=W.up.length?W.up[ri(0,W.up.length-1)]:null,kl=LOW[ri(0,LOW.length-1)],useUp=void_||rnd()<.7;
  if(fl){if(ku&&(ATT_UP[ku]?up>6:(airLeft>0&&rnd()<.45&&up>14))){B(ku,'up',gx,Math.round(up),gw);if(!ATT_UP[ku])airLeft--}if(fl-lw>=6)B(kl,'low',gx,Math.round(lw),gw)}
  else{const upSide=rnd()<.5,kk=upSide?ku:kl;if(airLeft>0){B(kk,upSide?'up':'low',gx,Math.round(upSide?up:lw),gw);airLeft--}}
 }
 route.push([xt,Math.max(12,yT-20)]);
 const poly=[...route,[xt,Math.max(12,yT-26)],[xt,yT-6]],samples=[];
 for(let i=0;i<poly.length-1;i++){const a=poly[i],b=poly[i+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2);for(let q=0;q<=n;q++)samples.push([a[0]+(b[0]-a[0])*q/n,a[1]+(b[1]-a[1])*q/n])}
 const clear=(x,y,w2,h,c)=>!samples.some(p=>p[0]>x-c&&p[0]<x+w2+c&&p[1]>y-c&&p[1]<y+h+c);
 // decoy obstacles clear of the route
 const nd=(j>=3&&!void_)?ri(1,Math.min(3,1+(j>>2))):0,ndR=W.k=='rio'||EIF||NAM||HAN||OPR?0:nd;
 for(let d=0;d<ndR;d++)for(let tries=0;tries<24;tries++){
  const cx=ri(xs+24,T[0]-18);if(cx<xs+22||cx>T[0]-12)continue;
  const all=LOW.concat(W.up.filter(k=>!MK[k])),kind=all[ri(0,all.length-1)],isUp=W.up.includes(kind)&&!LOW.includes(kind)||(LOW.includes(kind)&&W.up.includes(kind)&&rnd()<.5);
  const gw=ri(6,10);
  let side,edge;
  if(fl){if(isUp){side='up';edge=ATT_UP[kind]?ri(8,24):ri(18,42)}else{side='low';edge=fl-ri(8,26)}}
  else{side=isUp?'up':'low';edge=ri(14,50)}
  const S0=S.length,K0=K.length,D0=D.length,SM0=SM.length;
  const bb=B(kind,side,cx,edge,gw);
  if(clear(bb[0],bb[1],bb[2],bb[3],11)&&!placed.slice(0,-1).some(p=>bb[0]<p[0]+p[2]+5&&bb[0]+bb[2]>p[0]-5&&bb[1]<p[1]+p[3]+5&&bb[1]+bb[3]>p[1]-5)){if((seed*7+w*5+j*3+d)%4==0){placed.pop();S.length=S0;K.length=K0;D.length=D0;SM.length=SM0}break}
  placed.pop();S.length=S0;K.length=K0;D.length=D0;SM.length=SM0;
 }
 if(cake&&j>=3){for(const sd of (j>=7?[-1]:j>=6?[-1,1]:[ (rnd()<.5?-1:1) ])){const h=ri(10,14),cx=xt+sd*(Math.floor(tw/2)+1);add(cx-1,yT-h,3,h,'cd')}}
 if(cake){add(T[0]-11,yT,3,8,'cd')}
 // low hills for ground worlds (scenery with collision)
 if(fl&&j>=1&&!cake&&W.k!='rio'&&W.k!='paris'&&!NAM&&!HAN&&W.k!='sydney'){const nh=ri(0,2);for(let q=0;q<nh;q++){const hw=ri(14,24),hh=ri(4,8),hx=ri(xs+26,T[0]-hw-4);if(hx>xs+26&&hx<T[0]-hw-4&&route.slice(1,-1).every(p=>Math.abs(p[0]-hx-hw/2)>hw/2+10)){if(!ovl([hx,fl-hh,hw,hh],4)&&(seed+w+j+q)%3!=0){tri(hx+(hw>>1),fl-hh,hh,hw,'hl',true);placed.push([hx,fl-hh,hw,hh])}}}}
 let crab=null;
 if(w==4&&j==4){for(const dx of [0,-10,10,-18,18]){const hw=20,hh=7,hx=Math.round((lo+hi)/2-hw/2+dx);if(hx>lo&&hx+hw<hi+6&&!ovl([hx,fl-hh,hw,hh],4)){tri(hx+(hw>>1),fl-hh,hh,hw,'hl',true);placed.push([hx,fl-hh,hw,hh]);crab={x:hx+hw/2,y:fl-hh};break}}}
 // ---------- movers ----------
 const MV=[];
 let nm=airLeft;
 if(mvc>=0)nm=Math.min(nm,mvc);if(MTN||EIF||NAM||HAN||OPR)nm=0;
 const lanes=[];
 {const bands=[[yS-22,yS+6],[yT-26,yT+6]];
  for(let y=12;y<=56;y+=1){if(bands.some(b=>y>b[0]&&y<b[1]))continue;lanes.push(y)}}
 const TER={sea:1,sand:1,g:1,s:1,ck1:1,ck2:1,st:1,wat:1,tbl:1,rk:1,hl:1,lawn:1,pav:1};
 const hitsT=(x,y,w2,h)=>S.some((s,i)=>TER[K[i]]&&x<s[0]+s[2]&&x+w2>s[0]&&y<s[1]+s[3]&&y+h>s[1]);
const bandsUsed=[];
 const hitsO=(x,y,w2,h)=>S.some((s,i)=>K[i]!='cd'&&x-3<s[0]+s[2]&&x+w2+3>s[0]&&y-3<s[1]+s[3]&&y+h+3>s[1])||bandsUsed.some(b=>y<b[1]+3&&y+h>b[0]-3);
 const OBS=()=>S.map((s,i)=>({s,k:K[i]})).filter(o=>!TER[o.k]&&o.k!='cd');
 const lanePick=(x0,x1,hh)=>{const obs=OBS();let best=null,cands=[];
  for(const y of lanes){if(hitsT(x0,y-hh,x1-x0,2*hh)||S.some((s,i)=>K[i].startsWith('sp:')&&x0<s[0]+s[2]+2&&x1>s[0]-2&&y-hh<s[1]+s[3]+1&&y+hh>s[1]-1)||bandsUsed.some(b=>y-hh<b[1]+4&&y+hh>b[0]-4))continue;
   let ov=0;for(const o of obs){const r=o.s;if(r[1]<y+hh+1&&r[1]+r[3]>y-hh-1){const a=Math.max(x0,r[0]),b=Math.min(x1,r[0]+r[2]);if(b>a)ov+=b-a}}
   cands.push([y,ov])}
  if(!cands.length)return null;const mn=Math.min(...cands.map(c=>c[1]));const ok=cands.filter(c=>c[1]<=mn+3);return ok[Math.floor(rm()*ok.length)][0]};
 const hitsS=(x,y,w2,h)=>S.some((s,i)=>K[i]!='cd'&&x<s[0]+s[2]&&x+w2>s[0]&&y<s[1]+s[3]&&y+h>s[1]);
 for(let q=0;q<nm;q++){
  const kn=pick(W.mv),mk=MK[kn];let m=null;
  for(let tries=0;tries<40&&!m;tries++){
   const dir=rm()<.5?-1:1;
   if(kn=='gondola'){if(!fl)continue;const L0=xs+14,R0=T[0]-6;let best=null;for(let x=L0;x<R0;){if(S.some(s=>x>=s[0]&&x<s[0]+s[2]&&s[1]<fl&&s[1]+s[3]>fl-9)){x++;continue}let e=x;while(e<R0&&!S.some(s=>e>=s[0]&&e<s[0]+s[2]&&s[1]<fl&&s[1]+s[3]>fl-9))e++;if(!best||e-x>best[1]-best[0])best=[x,e];x=e+1}
    if(!best||best[1]-best[0]<34)continue;const gx0=best[0]+9,gx1=best[1]-9;m={k:kn,m:'bounce',w:mk.w,h:mk.h,y0:fl-4,ay:0,wy:0,ph:0,vx:mk.v[0]+rm()*(mk.v[1]-mk.v[0]),x0:gx0,x1:gx1,off:rm()*(gx1-gx0)*2}}
   else if(mk.m=='wrap'){const ay=mk.ay||0,y=lanePick(0,128,mk.h/2+ay+1);if(y==null)continue;
    m={k:kn,m:'wrap',w:mk.w,h:mk.h,y0:y,ay,wy:0.02+rm()*0.03,ph:rm()*6.28,vx:dir*(mk.v[0]+rm()*(mk.v[1]-mk.v[0])),x0:rm()*(128+2*mk.w),mg:mk.w}}
   else if(mk.m=='bounce'){const x0=lo-6,x1=hi+6,ay=mk.ay||0,y=lanePick(x0-6,x1+6,mk.h/2+ay+1);if(y==null)continue;
    m={k:kn,m:'bounce',w:mk.w,h:mk.h,y0:y,ay,wy:0.04,ph:rm()*6.28,vx:mk.v[0]+rm()*(mk.v[1]-mk.v[0]),x0,x1,off:rm()*(x1-x0)*2}}
   else if(mk.m=='osc'){const ax=kn=='drone'?0:rmi(10,16),ay=kn=='drone'?rmi(9,15):rmi(5,8),cx=rmi(lo,hi),cy=lanePick(cx-ax-6,cx+ax+6,ay+4);if(cy==null)continue;
    m={k:kn,m:'osc',w:mk.w,h:mk.h,x0:cx,y0:cy,ax,ay,wx:(kn=='drone'?0:0.022+rm()*0.012),wy:0.022+rm()*0.014,ph:rm()*6.28}}
   else if(mk.m=='diag'){m={k:kn,m:'diag',w:mk.w,h:mk.h,x0:rm()*152,y0:rm()*88,vx:dir*(mk.v[0]+rm()*(mk.v[1]-mk.v[0])),vy:(rm()<.5?-1:1)*(0.15+rm()*0.2)}}
   else if(mk.m=='fall'){const cx=rmi(lo,hi);if(hitsS(cx-3,5,6,fl-6))continue;const vy=0.5;m={k:kn,m:'fall',w:2,h:3,x0:cx,y0:7,vy,per:Math.ceil((fl-8)/vy)+40+rmi(0,40),off:rmi(0,120)}}
   else if(mk.m=='laser'){const cx=rmi(lo,hi),y0=6,y1=fl?fl-4:56;if(hitsS(cx-4,y0,8,y1-y0))continue;
    add(cx-2,y0,5,3,'em');add(cx-2,y1,5,3,'em');
    m={k:kn,m:'laser',x:cx,y0,y1,per:rmi(150,190),on:rmi(55,75),off:rmi(0,150)}}
  }
  if(m){MV.push(m);if(m.y0!=null&&m.m!='fall'){const ex=(m.ay||0)+m.h/2;bandsUsed.push([m.y0-ex,m.y0+ex])}}
 }
 if((W.k=='venice'&&!MV.some(m=>m.k=='gondola'))||(W.k=='sydney'&&j%3!=0&&j!=9)){const FK=W.k=='sydney'?'ferry':'gondola',mk=MK[FK],L0=xs+14,R0=T[0]-6;let best=null;for(let x=L0;x<R0;){if(S.some(s=>x>=s[0]&&x<s[0]+s[2]&&s[1]<fl&&s[1]+s[3]>fl-9)){x++;continue}let e=x;while(e<R0&&!S.some(s=>e>=s[0]&&e<s[0]+s[2]&&s[1]<fl&&s[1]+s[3]>fl-9))e++;if(!best||e-x>best[1]-best[0])best=[x,e];x=e+1}
  const gm=FK=='ferry'?Math.ceil(mk.w/2)+1:8;if(best&&best[1]-best[0]>=(FK=='ferry'?2*gm+2:24)){const gx0=best[0]+gm,gx1=best[1]-gm;MV.push({k:FK,m:'bounce',w:mk.w,h:mk.h,y0:fl-4,ay:0,wy:0,ph:0,vx:mk.v[0]+rm()*(mk.v[1]-mk.v[0]),x0:gx0,x1:gx1,off:rm()*(gx1-gx0)*2})}}
 if(MTN&&V!=4){const cw=(ax,ay,bx,by,x0,x1,vx,off)=>MV.push({k:'cablecar',m:'wire',w:9,h:7,x0,x1,ya:ay+(x0-ax)*(by-ay)/(bx-ax),yb:ay+(x1-ax)*(by-ay)/(bx-ax),wa:[ax,ay,bx,by],vx,off,y0:null});const sp=0.10+rm()*0.05,o0=rm();
  if(V==5){const ay=Math.max(18,yA-12),my=yM-12,by=Math.max(17,yT-15),bx=xt+8;cw(xA,ay,xM,my,xA+6,xM-6,sp,o0*(xM-xA)*2);cw(xM,my,bx,by,xM+6,bx-6,sp*1.15,(1-o0)*(bx-xM)*2)}
  else if(V==7){const ay=yA-11,bx=xt+8,by=yT-16;cw(xA,ay,bx,by,xA+6,T[0]-6,sp,o0*(bx-xA)*2)}
  else if(V==9){const wy=yT-19,ay=wy+ri(-1,1),by=wy+ri(-1,1);cw(xA,ay,xM,by,xA+6,xM-6,sp,o0*(xM-xA)*2)}
  else{const ax=xA,ay=Math.max(17,yA-12),bx=xt+8,by=Math.max(17,yT-15),L2=bx-ax-12;cw(ax,ay,bx,by,ax+6,bx-6,sp,o0*L2*2);if(V==3)cw(ax,ay+9,bx,by+9,ax+6,bx-6,sp,o0*L2*2+L2)}}
 // harmless pop balloons
 const rb=RNG(seed*7919+w*31+j*17+5),rbi=(a,b)=>a+Math.floor(rb()*(b-a+1));
 const BL=[];{const nb=0;
  for(let q=0;q<nb;q++)for(let t=0;t<40;t++){const bx=rbi(14,114),by=rbi(10,44),bb=[bx-5,by-5,10,19];
   if(ovl(bb,4)||hitsT(bb[0],bb[1],bb[2],bb[3])||(Math.abs(bx-xt)<14&&by>yT-40)||(Math.abs(bx-xs)<14&&by>yS-34))continue;
   if(BL.some(o=>Math.abs(o.x-bx)<14&&Math.abs(o.y-by)<22))continue;
   BL.push({x:bx,y:by,ph:rb()*6.28});placed.push(bb);break}}
 if(W.k=='lisboa'){let q=0;for(const m of MV)if(m.k=='plane'){m.y0=6+q*0;m.ay=0;m.wy=0;q++}if(MV.filter(m=>m.k=='plane').length>1)MV.splice(MV.findIndex((m,i)=>m.k=='plane'&&i>MV.findIndex(n=>n.k=='plane')),1)}
 if(W.k=='sydney'&&[2,4,6,7].includes(j))for(const m of MV)if(m.k=='gull'){m.k='plane';m.w=12;m.h=4;m.ay=0;m.wy=0;m.y0=8;m.vx=Math.sign(m.vx||1)*0.5}
 if(W.k=='rio'&&j==2){const m=MV.find(m=>m.k=='parrot'||m.k=='gull');if(m){m.k='plane';m.w=12;m.h=4;m.ay=0;m.wy=0;m.vx=Math.sign(m.vx||1)*0.5}}
 if(w==8&&j==7){MV.length=0;MV.push({k:'bigshark',m:'wrap',w:26,h:7,y0:19,ay:2,wy:0.03,ph:0.6,vx:-0.26,x0:60,mg:34})}
 const lvl={w,j,n:W.n,g:W.g,L,T,S,K,D,MV,BL,bv,crab,SM,route:route.slice(),mir:0};
 if(W.wind)rnd();
 lvl.wp=route.map(p=>[p[0],p[1]]);
 if(mir){
  const fx=x=>128-x;lvl.mir=1;
  lvl.S=S.map(s=>[128-(s[0]+s[2]),s[1],s[2],s[3]]);lvl.L=[128-(L[0]+L[2]),L[1],L[2]];lvl.T=[128-(T[0]+T[2]),T[1],T[2]];
  lvl.D=D.map(d=>({...d,cx:fx(d.cx)}));lvl.SM=SM.map(g=>({...g,cx:fx(g.cx)}));lvl.BL=BL.map(b=>({...b,x:fx(b.x)}));if(crab)lvl.crab={x:fx(crab.x),y:crab.y};lvl.wp=lvl.wp.map(p=>[fx(p[0]),p[1]]);
  lvl.MV=MV.map(m=>{const n={...m};if('x0' in n&&m.m!='fall'){n.x0=fx(m.x0)}if(m.m=='fall')n.x0=fx(m.x0);if('vx' in n)n.vx=-n.vx;if(m.m=='bounce'){n.x0=fx(m.x1);n.x1=fx(m.x0)}if(m.m=='wire'){n.x0=fx(m.x1);n.x1=fx(m.x0);n.ya=m.yb;n.yb=m.ya;if(m.wa)n.wa=[fx(m.wa[2]),m.wa[3],fx(m.wa[0]),m.wa[1]]}if(m.m=='laser')n.x=fx(m.x);if(m.m=='diag'){n.x0=fx(m.x0)}return n});
 }
 lvl.fuel=300;
 return lvl}
let lv,pad,tgt,R,state,sT,fuelL,res,flyT=0,score=0,EV=[],LV=null,tick=0,PP={},LIT={},TKP={},bonus=0,BUBP={},SPIN=0,BLT=0,BCD=0,BLAST=1.1,CH=0,CHT=0,ARMB=0,FLIPS=0,F3=0,LSB=0,KILLED={};const BIRDK={sat:1,cablecar:1,parrot:1,bird:1,crow:1,gull:1,vulture:1,ufo:1,plane:1,bigshark:1};
const BUBPER=240,BUBEM=60,BUBL=390;function bubAt(k,t){const P=lv.PIPE,a=t-k*BUBPER;if(a<0||a>=BUBL)return null;if(a<BUBEM){const r=0.8+1.2*a/BUBEM;return [P.x,P.y-1-r,r]}const a2=a-BUBEM,f=a2/(BUBL-BUBEM);return [P.x+Math.sin(a2*0.045+k*1.7)*2.5*Math.min(1,a2/40),P.y-3-Math.pow(f,1.15)*(P.y-14),2+f*1.5]}
function rocketPix(r){const x0=Math.round(r.x)-12,y0=Math.round(r.y)-14,W=25,H=29,sv=new Uint8Array(W*H),o=[];
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const x=x0+i,y=y0+j;if(x>=0&&x<128&&y>=0&&y<64){sv[j*W+i]=SCR[y*128+x];SCR[y*128+x]=0}}
 const RS=R,TS=r.thr,ST=state;R=r;r.thr=false;state='fly';const bl=BLT;BLT=0;drawRocket();R=RS;r.thr=TS;state=ST;BLT=bl;
 const c=Math.cos(r.a),s=Math.sin(r.a),wx=Math.round(r.x+s),wy=Math.round(r.y-c);
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const x=x0+i,y=y0+j;if(x>=0&&x<128&&y>=0&&y<64){if(SCR[y*128+x]||(x==wx&&y==wy))o.push([x,y]);SCR[y*128+x]=sv[j*W+i]}}
 return o}
function moverHit(RP){if(!lv.MV.length)return null;let ax=999,ay=999,bx=-999,by=-999;const K=new Set();for(const p of RP){K.add(p[0]+p[1]*128);ax=Math.min(ax,p[0]);ay=Math.min(ay,p[1]);bx=Math.max(bx,p[0]);by=Math.max(by,p[1])}
 for(let mi=0;mi<lv.MV.length;mi++){const m=lv.MV[mi];if(KILLED[mi])continue;const r=mvRect(m,tick);if(!r)continue;
  if(m.m=='laser'){for(const p of RP)if(inR(p,r))return m;continue}
  const e=4,x0=Math.floor(r[0])-e,y0=Math.floor(r[1])-e,x1=Math.ceil(r[0]+r[2])+e,y1=Math.ceil(r[1]+r[3])+e;if(x1<ax||x0>bx||y1<ay||y0>by)continue;
  const W=x1-x0+1,H=y1-y0+1,sv=new Uint8Array(W*H);for(let j=0;j<H;j++)for(let i=0;i<W;i++){const x=x0+i,y=y0+j;if(x>=0&&x<128&&y>=0&&y<64){sv[j*W+i]=SCR[y*128+x];SCR[y*128+x]=0}}
  drawMovers((q,k)=>k==mi);let hit=false;
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){const x=x0+i,y=y0+j;if(x>=0&&x<128&&y>=0&&y<64){if(SCR[y*128+x]&&K.has(x+y*128))hit=true;SCR[y*128+x]=sv[j*W+i]}}
  if(hit)return m}
 return null}
const RECTK={opr:1,opb:1,pyl:1,hull:1,mst:1,sail:1,nam:1,brd:1,brp:1,arcc:1,arca:1,arcp:1,eif:1,mor:1,morc:1,gift:1,jes:1,jesp:1,mtn:1,pier:1,sea:1,sand:1,g:1,s:1,ck1:1,ck2:1,st:1,wat:1,tbl:1,rk:1,hl:1,lawn:1,pav:1,d:1,snow:1,mesa:1,ice:1};
function shapeHit(si,RP){const s=lv.S[si];if(s[3]<=0)return false;const e=3,x0=s[0]-e,y0=s[1]-e,x1=s[0]+s[2]+e,y1=s[1]+s[3]+e;
 let near=false;for(const p of RP)if(p[0]>=x0&&p[0]<x1&&p[1]>=y0&&p[1]<y1){near=true;break}if(!near)return false;
 const W=x1-x0,H=y1-y0,sv=new Uint8Array(W*H);for(let j=0;j<H;j++)for(let i=0;i<W;i++){const x=x0+i,y=y0+j;if(x>=0&&x<128&&y>=0&&y<64){sv[j*W+i]=SCR[y*128+x];SCR[y*128+x]=0}}
 const ci=curI;curI=si;const BMs=lv.BM;drawSolid(s,lv.K[si],lv.w);curI=ci;
 const kk=lv.K[si],ex=(kk=='cd'||kk=='cdl'||kk=='grill')?0:1;const K=new Set();for(const p of RP)K.add(p[0]+p[1]*128);let hit=false;
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){const x=x0+i,y=y0+j;if(x>=0&&x<128&&y>=0&&y<64){if(SCR[y*128+x]&&K.has(x+y*128)&&x>=s[0]-ex&&x<s[0]+s[2]+ex&&y>=s[1]-ex&&y<s[1]+s[3]+ex)hit=true;SCR[y*128+x]=sv[j*W+i]}}
 return hit}
function addArc(){const S=lv.S,K=lv.K,fy=59,c=67;S.push([c-16,fy-31,32,3]);K.push('arcc');S.push([c-15,fy-28,30,6]);K.push('arca');S.push([c-15,fy-22,9,22]);K.push('arcp');S.push([c+6,fy-22,9,22]);K.push('arcp');S.push([c-6,fy-22,2,2]);K.push('arcp');S.push([c+4,fy-22,2,2]);K.push('arcp')}
function fixLamps(){const S=lv.S,K=lv.K,I=lv.si,fl=59,pairs=[];for(let i=0;i<S.length;i++)if(K[i]=='lmp'){const j=K.findIndex((k,q)=>k=='lmh'&&Math.abs(S[q][1]+4-S[i][1])<=1&&S[i][0]>=S[q][0]-1&&S[i][0]<=S[q][0]+S[q][2]);if(j>=0)pairs.push([i,j])}
 const sh=(p,dx)=>{S[p[0]][0]+=dx;S[p[1]][0]+=dx},ht=(p,top)=>{S[p[1]][1]=top;S[p[0]][1]=top+4;S[p[0]][3]=fl-top-4},rm=p=>{for(const q of p){S[q]=[-99,-99,0,0];K[q]='d'}};
 if(I==104||I==107)lv.wp=[[pad.x+pad.w/2,22],[64,18],[tgt.x+tgt.w/2+(tgt.x>64?-8:8),18]];
 if(I==104)for(const p of pairs)ht(p,36);
 if(I==106)for(const p of pairs)sh(p,-6);
 if(I==103)for(const p of pairs)sh(p,4);
 if(I==107){pairs.sort((a,b)=>S[a[0]][0]-S[b[0]][0]);if(pairs[0])ht(pairs[0],32);if(pairs[1])rm(pairs[1])}}
function addSea(){const S=lv.S,K=lv.K,fi=K.indexOf('sand');if(fi<0)return;const fy=S[fi][1];
 const blocked=x=>x<2||x>125||S.some((s,k)=>k!=fi&&K[k]!='pole'&&K[k]!='flag'&&x>=s[0]-2&&x<s[0]+s[2]+2&&s[1]<fy&&s[1]+s[3]>=fy);let best=null;
 for(let x=0;x<128;){if(blocked(x)){x++;continue}let e=x;while(e<128&&!blocked(e))e++;if(!best||e-x>best[1]-best[0])best=[x,e];x=e+1}
 if(!best||best[1]-best[0]<14)return;const a=best[0]+1,b=best[1]-1;S[fi]=[0,fy,a,64-fy];S.push([a,fy+2,b-a,62-fy]);K.push('wat');S.push([b,fy,128-b,64-fy]);K.push('sand')}
function load(i,lvl){lv=lvl;lv.i=i;pad={x:lv.L[0],y:lv.L[1],w:lv.L[2]};{const sh=Math.max(4,Math.round(lv.T[2]*0.3));tgt={x:lv.T[0]+(sh>>1),y:lv.T[1]-5,w:lv.T[2]-sh,px:lv.T[0],pw:lv.T[2],gy:lv.T[1]};if(tgt.w<11)tgt.w=11}if(lv.si==51&&!lv.XP){lv.XP=1;lv.S.forEach((q,i)=>{if(lv.K[i]=='pyl'){lv.S[i]=[-99,-99,0,0];lv.K[i]='d'}});const g=lv.S.filter((q,i)=>lv.K[i]=='g').sort((a,b)=>a[0]-b[0]),f=lv.MV.find(m=>m.k=='ferry');if(f&&g.length>=2){const L=g[0][0]+g[0][2],R2=g[1][0],gm=Math.ceil(f.w/2)+1;f.x0=L+gm;f.x1=R2-gm;f.off=0}}if(lv.si==39&&!lv.XS){lv.XS=1;const m=lv.MV.find(m=>m.k=='sat');if(m){m.y0=21;m.wy=0.03}}if(lv.w==10&&!lv.XL){lv.XL=1;fixLamps()}if(lv.si==100&&!lv.XA){lv.XA=1;addArc()}if(lv.w==4&&!lv.XW&&[2,4,6,8].includes(lv.si%10)){lv.XW=1;addSea()}if(lv.UF){for(const u of lv.UF){lv.S[u.i]=u.s;lv.K[u.i]=u.k}if(lv.MVN!=null)lv.MV.length=lv.MVN}lv.UF=[];if(lv.MVN==null)lv.MVN=lv.MV.length;flyT=0;tick=0;PP={};LIT={};TKP={};KILLED={};bonus=0;SPIN=0;BLT=0;BCD=0;CH=0;ARMB=0;FLIPS=0;F3=0;LSB=0;BUBP={};if(lv.si==94&&!lv.WPF){lv.WPF=1;lv.wp=[[30,-6],[110,-6]]}if(lv.si==100&&!lv.WPF){lv.WPF=1;lv.wp=[[pad.x+pad.w/2,14],[86,12],[48,12],[tgt.x+tgt.w/2,16]]}if(lv.si==6&&!lv.WPF){lv.WPF=1;lv.CRZ=30;lv.wp=[[pad.x+pad.w/2,28],[40,30],[tgt.x+tgt.w/2,30]]}if(lv.si==9&&!lv.WPF){lv.WPF=1;lv.wp=[[pad.x+pad.w/2,18],[44,1],[86,1],[tgt.x+tgt.w/2,28]]}if(lv.si==59&&!lv.WPF){lv.WPF=1;lv.wp=[[pad.x+pad.w/2,24],[40,10],[96,10],[tgt.x+tgt.w/2,28]]}if(lv.si==109&&!lv.WPF){lv.WPF=1;lv.wp=[[16,10],[40,-8],[104,-8],[110,30]]}if(lv.si==83&&!lv.PIPE){lv.PIPE={x:53,y:50};lv.S.push([50,50,7,9]);lv.K.push('pipe')}lv.TK=genTokens();for(const g of lv.SM||[]){if(!g.orig)g.orig=g.idx.map(i=>lv.S[i].slice());else g.idx.forEach((i,q)=>{lv.S[i]=g.orig[q].slice()});g.melt=0;g.done=0}lv.CD=[];lv.S.forEach((r,i)=>{if(lv.K[i]=='cd'||lv.K[i]=='cdl'||lv.K[i]=='grill'||lv.K[i]=='clam')lv.CD.push(i)});
 R={x:pad.x+pad.w/2,y:pad.y-5,vx:0,vy:0,a:0,thr:false,rest:true};state='ready';fuelL=lv.fuel;res=null;sT=0;EV=[];const a=lv.ap||[.25,.45,.015,0];setAI(a[0],a[1],a[2],a[3]||0)}

function genTokens(){const I=lv.si,hh=(a,b)=>{let x=(I*7919+a*104729+b*1299709)>>>0;x=Math.imul(x^(x>>>15),2246822519)>>>0;x=Math.imul(x^(x>>>13),3266489917)>>>0;return (x^(x>>>16))>>>0};
 const SOV={100:[67,20],103:[66,20],95:[88,20],55:[48,20],78:[68,32],45:[58,26],46:[70,24],47:[58,26],6:[50,32],3:[64,18],86:[84,30],94:[102,26],37:[60,24],84:[60,28],83:[74,26],15:[96,30],13:[74,26],20:[50,22]};if(SOV[I])return [{x:SOV[I][0],y:SOV[I][1],ph:hh(SOV[I][0],SOV[I][1])%100}];
 const TERK={g:1,s:1,ck1:1,ck2:1,st:1,wat:1,tbl:1,rk:1,hl:1,lawn:1,pav:1};
 const wp=(lv.wp||[]),samp=[];for(let i=0;i<wp.length-1;i++){const a=wp[i],b=wp[i+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2)||1;for(let q=0;q<=n;q++)samp.push([a[0]+(b[0]-a[0])*q/n,a[1]+(b[1]-a[1])*q/n])}
 const rd=(x,y,s)=>{const dx=Math.max(s[0]-x,0,x-(s[0]+s[2])),dy=Math.max(s[1]-y,0,y-(s[1]+s[3]));return Math.max(dx,dy)};
 let best=null,bs=-1;
 for(const lvx of [[9,1],[7,1],[6,0],[4,0]]){
 const SKY=(lv.i%10)%2==1;for(let x=10;x<=118;x+=2)for(let y=SKY?16:30;y<=(SKY?26:50);y+=2){
  let dAll=99,dObs=99;for(let i=0;i<lv.S.length;i++){const d=rd(x,y,lv.S[i]);if(d<dAll)dAll=d;if(!TERK[lv.K[i]]&&d<dObs)dObs=d}
  for(const d of lv.D){const dd=Math.max(Math.abs(x-d.cx)-d.rx,Math.abs(y-d.cy)-d.ry);if(dd<dAll)dAll=dd;if(dd<dObs)dObs=dd}
  if(x<36&&y<32)continue;if(x>110&&y<44)continue;
  if(dAll<lvx[0])continue;
  if(lvx[1]){let blk=false;for(let i=0;i<lv.S.length&&!blk;i++){const s=lv.S[i];if(s[0]<x+6&&s[0]+s[2]>x-6&&s[1]<y&&s[1]+s[3]>10)blk=true}if(blk)continue}
  if(x>pad.x-8&&x<pad.x+pad.w+8&&y>pad.y-20)continue;if(x>tgt.px-10&&x<tgt.px+tgt.pw+10&&y>tgt.gy-24)continue;
  let dr=99;for(const p of samp){const d=Math.hypot(p[0]-x,p[1]-y);if(d<dr)dr=d}
  if(dr<9)continue;
  const sc=(dObs<=15?(16-dObs)*2:0)+Math.min(dr,22)+(hh(x,y)%7);
  if(sc>bs){bs=sc;best={x,y,ph:hh(x,y)%100}}}
 if(best)break}
 if(!best){const p=wp[1]||[64,30];best={x:Math.round(p[0]+14),y:Math.max(22,Math.round(p[1])),ph:0}}
 return [best]}
function AUTOP(){return typeof mode!=='undefined'&&mode==='auto'}
function pts(r){const c=Math.cos(r.a),s=Math.sin(r.a),P=(x,y)=>[r.x+x*c-y*s,r.y+x*s+y*c];
 return {body:[P(0,-6),P(-2,-1),P(2,-1),P(-2,3),P(2,3)],mid:[P(0,-3),P(0,1),P(0,4)],legs:[P(-3.5,5),P(3.5,5)]}}
const inR=(p,r)=>p[0]>=r[0]&&p[0]<r[0]+r[2]&&p[1]>r[1]&&p[1]<r[1]+r[3];
function mvAt(m,t){let x,y;
 if(m.m=='wrap'){const sp=128+2*m.mg;x=((m.x0+m.vx*t)%sp+sp)%sp-m.mg;y=m.y0+(m.ay?Math.sin(t*m.wy+m.ph)*m.ay:0)}
 else if(m.m=='bounce'){const L=m.x1-m.x0,p=((m.vx*t+m.off)%(2*L)+2*L)%(2*L);x=m.x0+(p<L?p:2*L-p);y=m.y0+(m.ay?Math.sin(t*m.wy+m.ph)*m.ay:0)}
 else if(m.m=='wire'){const L=m.x1-m.x0,p=((m.vx*t+m.off)%(2*L)+2*L)%(2*L);x=m.x0+(p<L?p:2*L-p);y=m.ya+(x-m.x0)*(m.yb-m.ya)/L+4}
 else if(m.m=='osc'){x=m.x0+Math.sin(t*m.wx+m.ph)*m.ax;y=m.y0+Math.cos(t*m.wy+m.ph)*m.ay}
 else if(m.m=='diag'){const sx=152,sy=88;x=((m.x0+m.vx*t)%sx+sx)%sx-12;y=((m.y0+m.vy*t)%sy+sy)%sy-12}
 else if(m.m=='fall'){x=m.x0;y=m.y0+(((t+m.off)%m.per)*m.vy)}
 else{x=m.x;y=m.y0}
 return [x,y]}
function laserOn(m,t){return ((t+m.off)%m.per)<m.on}
function laserWarn(m,t){const p=(t+m.off)%m.per;return p>=m.per-24&&p<m.per}
function mvRect(m,t){if(m.m=='laser')return laserOn(m,t)?[m.x-1,m.y0+3,3,m.y1-m.y0-3]:null;const p=mvAt(m,t);return [p[0]-m.w/2,p[1]-m.h/2,m.w,m.h]}
function simStep(inp){
 tick++;
 if(state=='crashed'||state=='landed'){sT++;return}
 R.thr=!!inp.A&&fuelL>0&&!CH;
 if(BLT>0)BLT--;
 if(state=='ready'){if(fuelL<=0&&R.rest){end('crashed','OUT OF FUEL');return}if(R.thr){state='fly';R.rest=false}else return}
 flyT++;
 if(inp.B&&!CH&&fuelL<=0&&R.y<0&&altM()>=100){CH=1;CHT=tick;{const sd=Math.random()<0.5?-1:1;R.vx+=sd*(0.5+Math.random()*0.5);R.a=Math.max(-0.5,Math.min(0.5,sd*(0.3+Math.random()*0.2)));}EV.push({t:'chute',x:R.x,y:R.y})}
 if(CH){if(inp.L)R.a-=ROT;if(inp.R)R.a+=ROT;R.a=Math.max(-0.5,Math.min(0.5,R.a))}else{if(inp.L)R.a-=ROT;if(inp.R)R.a+=ROT;}if(!CH){const da=(inp.R?ROT:0)-(inp.L?ROT:0);if(da){SPIN+=da;if(Math.abs(SPIN)>=6.2831853-1e-6){SPIN-=Math.sign(SPIN)*6.2831853;bonus+=69;EV.push({t:'flip',x:R.x,y:R.y-6,pts:69});FLIPS++;if(FLIPS>=3&&!F3){F3=1;bonus+=1080;EV.push({t:'egg',x:Math.max(22,Math.min(98,R.x)),y:R.y-14,s:'1080 +1080'})}}if(R.a>Math.PI)R.a-=2*Math.PI;else if(R.a<-Math.PI)R.a+=2*Math.PI}}
 let ax=lv.wind||0,ay=lv.g;
 if(R.thr){ax+=TH*Math.sin(R.a);ay-=TH*Math.cos(R.a);fuelL=Math.max(0,fuelL-BURN)}
 if(CH){ax+=Math.sin(R.a)*0.03}
 R.vx+=ax;R.vy+=ay;if(lv.w==8){R.vx*=0.985;R.vy*=0.985}if(CH){R.vx*=0.96;if(R.vy<0)R.vy*=0.9;if(R.vy>0.32)R.vy=Math.max(0.32,R.vy-0.06)}{const dive=R.thr&&Math.cos(R.a)<0,cap=dive?1.6+3.4*Math.min(1,-Math.cos(R.a)*1.5):1.6;if(R.vy>cap)R.vy=dive?cap:Math.max(1.6,R.vy-0.04);}if(R.vy<-2)R.vy=-2;if(R.vx>4)R.vx=4;else if(R.vx<-4)R.vx=-4;if(!LSB&&R.vy>=4){LSB=1;bonus+=88;EV.push({t:'egg',x:64,y:28,s:'LIGHT SPEED +88'})}
 R.x+=R.vx;R.y+=R.vy;if(lv.si==94||lv.si==109||lv.si==9||lv.si==6||lv.si==59){if(R.x<3){R.x=3;if(R.vx<0)R.vx=0}else if(R.x>124){R.x=124;if(R.vx>0)R.vx=0}}else if(!AUTOP()){if(R.x<-7)R.x+=142;else if(R.x>=135)R.x-=142}
 if(R.y>74){end('crashed','LOST IN SPACE');return}
 const q=pts(R),qa=q.body.concat(q.legs),RP=rocketPix(R);
 {const hm=moverHit(RP);if(hm){end('crashed','HIT '+MK[hm.k].nm);return}}
 for(let i=0;i<lv.BL.length;i++){if(PP[i])continue;const b=lv.BL[i],by=b.y+Math.sin(tick*0.04+b.ph)*1.2;let hit=false;for(const p of qa)if(Math.hypot(p[0]-b.x,p[1]-by)<4.6){hit=true;break}
  if(!hit&&R.thr){const sn=Math.sin(R.a),cs=Math.cos(R.a);for(let d=4;d<=12&&!hit;d+=2)if(Math.hypot(R.x-d*sn-b.x,R.y+d*cs-by)<4.2)hit=true}
  if(hit){PP[i]=1;bonus+=25;EV.push({t:'pop',x:b.x,y:by,pts:25})}}
 if(lv.PIPE){for(let k=Math.max(0,Math.floor((tick-BUBL)/BUBPER)+1);k<=Math.floor(tick/BUBPER);k++){if(BUBP[k])continue;const b=bubAt(k,tick);if(!b)continue;let hit=false;for(const p of qa)if(Math.hypot(p[0]-b[0],p[1]-b[1])<b[2]+1.5){hit=true;break}
  if(!hit&&R.thr){const sn=Math.sin(R.a),cs=Math.cos(R.a);for(let d=4;d<=12&&!hit;d+=2)if(Math.hypot(R.x-d*sn-b[0],R.y+d*cs-b[1])<b[2]+1.5)hit=true}
  if(hit){BUBP[k]=tick;bonus+=10;EV.push({t:'bpop',x:b[0],y:b[1],r:b[2],pts:10})}}}
 for(let i=0;i<lv.TK.length;i++){if(TKP[i])continue;const t=lv.TK[i],ty=t.y+Math.sin(tick*0.05+t.ph)*1.5;let hit=false;for(const p of qa)if(Math.hypot(p[0]-t.x,p[1]-ty)<5){hit=true;break}if(hit){TKP[i]=1;bonus+=50;EV.push({t:'tok',x:t.x,y:ty,pts:50})}}
 if(R.thr&&lv.MV.length){const sn=Math.sin(R.a),cs=Math.cos(R.a);for(let mi=0;mi<lv.MV.length;mi++){const m=lv.MV[mi];if(KILLED[mi]||!BIRDK[m.k])continue;const r=mvRect(m,tick);if(!r)continue;let hit=false;for(let d=3;d<=16&&!hit;d++){const ex=R.x-d*sn,ey=R.y+d*cs;if(ex>=r[0]-2&&ex<=r[0]+r[2]+2&&ey>=r[1]-2&&ey<=r[1]+r[3]+2)hit=true}if(hit){const p=mvAt(m,tick),q=mvAt(m,tick+1);{let gy=((lv.W&&lv.W.fl)||0)||Infinity;for(const s of lv.S)if(p[0]>=s[0]&&p[0]<=s[0]+s[2]&&s[1]>p[1]&&s[1]<gy)gy=s[1];KILLED[mi]={t:tick,x:p[0],y:p[1],vx:q[0]-p[0],gy}}bonus+=25;EV.push({t:'kill',x:p[0],y:p[1],pts:25})}}}
 if(R.thr){const sn=Math.sin(R.a),cs=Math.cos(R.a);for(let si=0;si<lv.S.length;si++){if(lv.K[si]!='sp:ufo'&&lv.K[si]!='sp:sat')continue;const r=lv.S[si];let hit=false;for(let d=3;d<=16&&!hit;d++){const ex=R.x-d*sn,ey=R.y+d*cs;if(ex>=r[0]-2&&ex<=r[0]+r[2]+2&&ey>=r[1]-2&&ey<=r[1]+r[3]+2)hit=true}
  if(hit){const cx=r[0]+r[2]/2,cy=r[1]+r[3]/2;lv.UF.push({i:si,s:r.slice(),k:lv.K[si]});lv.S[si]=[-99,-99,0,0];lv.K[si]='d';let gy=((lv.W&&lv.W.fl)||0)||Infinity;for(const q of lv.S)if(cx>=q[0]&&cx<=q[0]+q[2]&&q[1]>cy&&q[1]<gy)gy=q[1];lv.MV.push({k:lv.UF[lv.UF.length-1].k.slice(3),m:'bounce',w:r[2],h:r[3],x0:cx-1,x1:cx+1,y0:cy,ay:0,wy:0,ph:0,vx:0.1,off:0});KILLED[lv.MV.length-1]={t:tick,x:cx,y:cy,vx:0,gy};bonus+=25;EV.push({t:'kill',x:cx,y:cy,pts:25})}}}
 if(false&&R.thr&&lv.SM&&lv.SM.length){const sn=Math.sin(R.a),cs=Math.cos(R.a);for(const g of lv.SM){const cut=g.top+g.melt*0.78*g.H;let hit=false;for(let d=3;d<=16&&!hit;d++){const ex=R.x-d*sn,ey=R.y+d*cs;if(Math.abs(ex-g.cx)<=g.r[0]+2&&ey>=cut-3&&ey<=g.top+g.H)hit=true}
   if(hit&&g.melt<1){g.melt=Math.min(1,g.melt+0.014);const ct=g.top+g.melt*0.78*g.H;g.idx.forEach((i,q)=>{const o=g.orig[q];if(o[1]+o[3]<=ct)lv.S[i]=[o[0],o[1],o[2],0];else if(o[1]<ct)lv.S[i]=[o[0],Math.round(ct),o[2],o[1]+o[3]-Math.round(ct)];else lv.S[i]=o.slice()});if(g.melt>=1&&!g.done){g.done=1;bonus+=30;EV.push({t:'lit',x:g.cx,y:Math.round(ct),pts:30})}}}}
 if(R.thr&&lv.CD.length){const sn=Math.sin(R.a),cs=Math.cos(R.a);for(const i of lv.CD){if(LIT[i])continue;const r=lv.S[i],tx=r[0],ty=r[1];let hit=false;for(let d=3;d<=14&&!hit;d++){const ex=R.x-d*sn,ey=R.y+d*cs;if(ex>=tx-2&&ex<=tx+r[2]+1&&ey>=ty-5&&ey<=ty+3)hit=true}if(hit){LIT[i]=1;bonus+=40;EV.push({t:'lit',x:tx+1,y:ty,pts:40})}}}
 for(const [pd,isT] of [[tgt,1],[pad,0]]){const rect=[pd.x,pd.y,pd.w,5];
  if(R.vy>0||isT)for(const b of q.body)if(inR(b,rect)){end('crashed','CRASH');return}
  let hit=R.vy>0&&(q.legs.some(l=>inR(l,rect))||RP.some(b=>b[1]==pd.y&&b[0]>=pd.x&&b[0]<pd.x+pd.w));
  if(hit){const ok=Math.abs(R.a)<0.198&&R.vy<0.405&&Math.abs(R.vx)<0.225&&q.legs.every(l=>l[0]>=pd.x&&l[0]<=pd.x+pd.w);
   if(!ok){end('crashed',R.vy>=0.405?'TOO FAST':Math.abs(R.a)>=0.198?'TOO TILTED':Math.abs(R.vx)>=0.225?'TOO SIDEWAYS':'MISSED PAD');return}
   const R0={vy:R.vy,vx:R.vx,a:R.a};R.a=0;R.vx=0;R.vy=0;R.y=pd.y-5;
   EV.push({t:'puff',x:R.x,y:pd.y,s:Math.min(1,R0.vy/0.4)});
   if(isT){if(CH){bonus+=200;EV.push({t:'chl',x:Math.max(22,Math.min(98,R.x)),y:R.y-8,pts:200})}const d=Math.abs(R.x-(pd.x+(pd.w-1)/2));const st=d<=1?5:d<=2?4:d<=3?3:d<=4.5?2:1;const cl2=(v,a,b)=>Math.max(a,Math.min(b,v));
    const tr=(v,t,p)=>{for(let q=0;q<t.length;q++)if(v<=t[q])return p[q];return p[p.length-1]};
    const secs=flyT/60,fp=fuelL/lv.fuel*100;
    const pf=d<=1&&R0.vy<=0.15&&Math.abs(R0.a)<=0.06,f69=Math.floor(Math.max(0,Math.min(100,fp)))==69;if(pf)bonus+=69;if(f69){bonus+=69;EV.push({t:'egg',x:Math.max(22,Math.min(98,R.x)),y:pd.y-12,s:'NICE +69'})}
    const parts=[100,tr(d,[1,3,5],[100,60,30,10]),tr(R0.vy,[0.15,0.30],[50,30,10]),tr(Math.abs(R0.a),[0.06,0.14],[30,20,10]),Math.floor(Math.max(0,Math.min(100,fp))),tr(secs,[12,20,30,45],[100,70,40,20,0]),bonus];
    const sc=parts.reduce((a,b)=>a+b,0);score+=sc;end('landed',pf?'PERFECT LANDING':'LANDED',st,d,sc);res.parts=parts;res.perf=pf;res.egg=f69}else{state='ready';R.rest=true;flyT=0;FLIPS=0}
   return}}
 if(R.vy>0){const FLAT={arcc:1,mtn:1,pier:1,g:1,s:1,st:1,sand:1,sea:1,ck1:1,ck2:1,tbl:1,pav:1,lawn:1,rk:1,hl:1,mesa:1,ice:1};const on=l=>{for(let si=0;si<lv.S.length;si++){const s=lv.S[si];const arm=lv.K[si]=='jes'&&s[2]>=30&&!RP.some(p=>lv.K.some((k,i)=>k=='jes'&&lv.S[i][1]<s[1]&&p[0]>=lv.S[i][0]&&p[0]<lv.S[i][0]+lv.S[i][2]&&p[1]>=lv.S[i][1]&&p[1]<lv.S[i][1]+lv.S[i][3]));if((!FLAT[lv.K[si]]&&!arm)||s[3]<=0)continue;if(l[0]>=s[0]&&l[0]<s[0]+s[2]&&l[1]>s[1]&&l[1]<s[1]+4)return s[1]}return null};
  const t0=on(q.legs[0]),t1=on(q.legs[1]);if(t0!=null||t1!=null){if(t0!=null&&t1!=null&&t0==t1&&Math.abs(R.a)<0.198&&R.vy<0.405&&Math.abs(R.vx)<0.225){R.a=0;R.vx=0;R.vy=0;R.y=t0-5;state='ready';R.rest=true;FLIPS=0;EV.push({t:'puff',x:R.x,y:t0,s:0.5});if(!ARMB&&lv.K.some((k,i)=>k=='jes'&&lv.S[i][1]==t0&&lv.S[i][2]>=30&&q.legs[0][0]>=lv.S[i][0]&&q.legs[1][0]<lv.S[i][0]+lv.S[i][2])){ARMB=1;bonus+=316;EV.push({t:'arm',x:R.x<64?36:92,y:30,pts:316})}return}end('crashed','CRASH');return}}
 const qs=qa.concat(q.mid);for(let si=0;si<lv.S.length;si++){const s0=lv.S[si];if(!RECTK[lv.K[si]]){if(shapeHit(si,RP)){end('crashed','CRASH');return}continue}const x0=s0[0]<=0?-10:s0[0],x1=s0[0]+s0[2]>=128?138:s0[0]+s0[2],s=[x0,s0[1]+1,x1-x0,s0[3]-1],jk=(lv.K[si]=='jes'&&s0[2]<30)||lv.K[si]=='jesp'||lv.K[si]=='eif'||lv.K[si]=='nam'||lv.K[si]=='opr',sp=[x0,s0[1]-(jk?1:0),x1-x0,s0[3]+(jk?1:0)];for(const b of qs)if(inR(b,s)){end('crashed','CRASH');return}for(const b of RP)if(inR(b,sp)){end('crashed','CRASH');return}}
 {const tp=[tgt.x,tgt.y,tgt.w,3];for(const b of RP)if(inR(b,tp)){end('crashed','CRASH');return}}
}
const CMSG=["KISSED THE GROUND", "LANDED LIKE PIANO", "LEANING TOWER", "BAD DAY AT WORK", "PARKED IT. BADLY", "CLOSE-ISH", "THAT WAS FAST", "GRAVITY SAYS HI", "HOUSTON, PROBLEM", "SO MUCH FOR THAT", "THE FLOOR IS HARD", "WELL THAT HAPPENED", "TAKE THE BUS NEXT", "THIS IS FINE", "BLAME THE WIND", "OOPSIE DAISY", "MAJOR OUCH", "THE PAD MOVED", "SORT OF A LANDING", "ALMOST A HERO", "ROCKET GO BOOM", "SPARE PARTS GALORE", "TASTY CRASH", "DON'T TRY THIS", "BEEP BOOP. BOOM.", "YOU HAD ONE JOB", "SMOOTH. NOT.", "THE ROCKET WAS NEW", "GRAVITY WORKS", "IT'LL BUFF OUT", "ZERO STARS. NICE", "OH THE HUMANITY", "YOU KILLED HIM!", "GROUND CONTROL TO|MAJOR MORON", "BODY PARTS|EVERYWHERE", "NASA IS PISSED", "SO MANY DEAD CHIMPS", "DON'T TELL THE|RUSSIANS", "HOUSTON HATES YOU", "NASA WANTS A REFUND", "SEND THE NEXT CHIMP", "SPACE CAMP DROPOUT", "T-MINUS NEVER", "NICE CRATER, GENIUS", "BLACK BOX SAYS LOL", "ONE SMALL SPLAT|FOR MANKIND", "MISSION CONTROL|IS CRYING", "TAXPAYERS PAID|FOR THAT", "CLOSED CASKET|FUNERAL", "THE MOON IS SAFE|FROM YOU", "ABORT! ABORT!|TOO LATE.", "WORST ASTRONAUT|EVER", "SPACEX IS HIRING", "ELON'S GUNNA|BE PISSED", "NEIL, YOU OK?", "FEATHER IT BUD"];let cmI=-1,cmOrd=[];
function crashMsg(){if(!cmOrd.length||cmI>=cmOrd.length-1){const last=cmOrd.length?cmOrd[cmOrd.length-1]:-1;cmOrd=CMSG.map((_,i)=>i);for(let i=cmOrd.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cmOrd[i],cmOrd[j]]=[cmOrd[j],cmOrd[i]]}if(cmOrd[0]==last){[cmOrd[0],cmOrd[1]]=[cmOrd[1],cmOrd[0]]}cmI=-1}return CMSG[cmOrd[++cmI]]}
function end(st,msg,stars,d,sc){if(st=='crashed')msg=crashMsg();state=st;sT=0;res={msg,stars:stars||0,d,sc:sc||0,fuel:Math.round(fuelL)};R.thr=false;if(st=='crashed')EV.push({t:'crash',x:R.x,y:R.y,vx:R.vx,vy:R.vy,a:R.a})}
// ---- autopilot ----
let MGV=8,WPY=0,wpI=0,AK=0.15,AV=0.6,AD=0,brake=0;let GL=0.12;function setAI(k,v,g,d){AK=k;AV=v;GL=g||0.12;AD=d||0}
function danger(){
 if(!lv.MV.length)return false;
 for(let k=0;k<=80;k+=5){const x=R.x+R.vx*k,y=R.y+R.vy*k;
  for(let mi=0;mi<lv.MV.length;mi++){const m=lv.MV[mi];if(KILLED[mi])continue;const r=mvRect(m,tick+k);if(!r)continue;const mg=m.m=='laser'?7:MGV;if(x>r[0]-mg&&x<r[0]+r[2]+mg&&y>r[1]-mg&&y<r[1]+r[3]+mg)return true}}
 return false}
function aiInputs(){
 const inp={L:false,R:false,A:false};
 if(state!='fly'&&state!='ready'){return inp}
 const tx0=tgt.x+tgt.w/2;let tx,ty,vmax=1.0,land=false;
 if(wpI<lv.wp.length){[tx,ty]=lv.wp[wpI];ty+=WPY;if(Math.hypot(tx-R.x,ty-R.y)<6&&state=='fly')wpI++;vmax=AV}
 if(wpI>=lv.wp.length){tx=tx0;ty=tgt.y-5;land=true}
 let dvx,dvy;
 if(land){const dx=tx-R.x;dvx=Math.sign(dx)*Math.min(0.3,Math.abs(dx*GL),Math.sqrt(2*0.003*Math.max(0,Math.abs(dx)-1))+0.03);
  const near=Math.abs(dx)<2.5&&Math.abs(R.vx)<0.12;
  const h=ty-R.y;
  dvy=near?Math.max(0.08,Math.min(0.3,h*0.04)):Math.max(-0.3,Math.min(0.3,(Math.max(lv.CRZ||14,tgt.y-20)-R.y)*0.06));
  if(near&&h<3)dvy=0.1}
 else{const cap=d=>Math.min(vmax,Math.sqrt(2*0.003*Math.max(0,Math.abs(d)-3))+0.06);dvx=Math.sign(tx-R.x)*cap(tx-R.x);dvy=Math.sign(ty-R.y)*cap(ty-R.y)}
 if(state=='fly'&&danger()&&brake<150){brake++;dvx=0;dvy=0}else if(state=='fly'&&brake>0&&!danger())brake=Math.max(0,brake-2);
 const k=AK;let adx=(dvx-R.vx)*k-(lv.wind||0),ady=(dvy-R.vy)*k;
 const up=lv.g-ady;
 let want=up>0.002?Math.atan2(adx,up):0;
 want=Math.max(-0.5,Math.min(0.5,want));
 if(land&&Math.abs(tx-R.x)<6)want=Math.max(-0.12,Math.min(0.12,want));
 const err=want-R.a;
 if(err>0.02)inp.R=true;else if(err<-0.02)inp.L=true;
 inp.A=up>0&&Math.hypot(adx,up)>TH*0.5&&Math.abs(err)<0.35;
 if(state=='ready')inp.A=tick>=AD;
 return inp}
function resetAI(){wpI=0;brake=0}
