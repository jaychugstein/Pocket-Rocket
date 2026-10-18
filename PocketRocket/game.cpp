// Pocket Rocket - Arduboy FX
#pragma GCC optimize("no-tree-loop-optimize","no-inline-small-functions","no-split-wide-types")
#include <Arduino.h>
#include <Arduboy2.h>
#include <ArduboyFX.h>
#include "fxdata.h"
#include "tables.h"
#include "screens.h"

Arduboy2Base ab;
ARDUBOY_NO_USB
#define SB (ab.sBuffer)

// ---------- math: Q16 positions/velocities, angle 320 units/circle ----------
#define NA 320
#define FP(x) ((int32_t)((x)*4096.0))
static int16_t isin(int16_t a){if((uint16_t)a>=NA){a%=NA;if(a<0)a+=NA;}int16_t s=1;if(a>=160){a-=160;s=-1;}if(a>80)a=160-a;return s*(int16_t)pgm_read_word(&SINQ[a]);}
static inline int16_t icos(int16_t a){return isin(a+80);}
static inline int16_t rnd16(int32_t v){return (int16_t)((v+2048)>>12);}
static inline int16_t psin(uint16_t p){return isin((int16_t)(((uint32_t)p*NA)>>16));}
static uint16_t rs=0xACE1;static uint8_t rnd8(){rs^=rs<<7;rs^=rs>>9;rs^=rs<<8;return rs;}
static int8_t rndS(uint8_t m){return (int8_t)(rnd8()%(2*m+1))-(int8_t)m;}

// ---------- drawing ----------
static void px(int16_t x,int16_t y,uint8_t c){if((uint16_t)x>127||(uint16_t)y>63)return;uint8_t*p=&SB[(y>>3)*128+x];uint8_t m=1<<(y&7);if(c)*p|=m;else *p&=~m;}
// write a column of up to 24 bits starting at row y (bit0 = row y)
static void colBits(int16_t X,int16_t y,uint32_t b,uint8_t c){if((uint16_t)X>127||!b)return;if(y<0){if(y<-24)return;b>>=-y;y=0;}if(y>63)return;uint8_t p=y>>3;b<<=(y&7);
 for(;p<8&&b;p++,b>>=8){uint8_t v=b;if(c)SB[p*128+X]|=v;else SB[p*128+X]&=~v;}}
static void fillR(int16_t x,int16_t y,int16_t w,int16_t h,uint8_t c){if(h<=0)return;if(y<0){h+=y;y=0;if(h<=0)return;}while(h>24){fillR(x,y,w,24,c);y+=24;h-=24;}uint32_t b=(1UL<<h)-1;for(int16_t i=0;i<w;i++)colBits(x+i,y,b,c);}
static void hl(int16_t x,int16_t y,int16_t w,uint8_t c){fillR(x,y,w,1,c);}
static void vl(int16_t x,int16_t y,int16_t h,uint8_t c){fillR(x,y,1,h,c);}
static uint32_t dil(uint32_t b){return b|(b<<1)|(b>>1);}
static void box(int16_t x,int16_t y,int16_t w,int16_t h){fillR(x,y,w,h,0);hl(x,y,w,1);hl(x,y+h-1,w,1);vl(x,y,h,1);vl(x+w-1,y,h,1);}
static uint8_t gcol(char ch,int8_t c){if(c<0||c>2)return 0;if(ch<32||ch>90)ch=32;return pgm_read_byte(&FONTC[(ch-32)*3+c]);}
static void textC(const char*s,int16_t x,int16_t y,bool o,uint8_t c){for(;*s;s++,x+=4){if(o)for(int8_t k=-1;k<=3;k++)colBits(x+k,y-1,dil(((uint32_t)(gcol(*s,k-1)|gcol(*s,k)|gcol(*s,k+1)))<<1),0);for(int8_t k=0;k<3;k++)colBits(x+k,y,gcol(*s,k),c);}}
static void text(const char*s,int16_t x,int16_t y,uint8_t c=1){textC(s,x,y,false,c);}
static void textO(const char*s,int16_t x,int16_t y){textC(s,x,y,true,1);}
static uint8_t slen(const char*s){uint8_t n=0;while(s[n])n++;return n;}
static int16_t cx_(const char*s){return 64-((slen(s)*4-1)>>1);}
static char tb[24];static uint8_t tl;
static void tbs(){tl=0;tb[0]=0;}
static void tbc(char c){tb[tl++]=c;tb[tl]=0;}
static void tbp(const char*s){while(*s)tbc(*s++);}
static void tbP(const char*s){char c;while((c=pgm_read_byte(s++)))tbc(c);}
static void tbn(int32_t v){char b[8];char*p=b+7;*p=0;bool ng=v<0;if(ng)v=-v;do{*--p='0'+v%10;v/=10;}while(v);if(ng)*--p='-';tbp(p);}
static void ctP(const char*p,int16_t y,bool o){tbs();tbP(p);if(o)textO(tb,cx_(tb),y);else text(tb,cx_(tb),y);}
static void ctb(int16_t y,bool o){if(o)textO(tb,cx_(tb),y);else text(tb,cx_(tb),y);}

static const char WN0[] PROGMEM="SEOUL";static const char WN1[] PROGMEM="VENEZIA";static const char WN2[] PROGMEM="GIZA";static const char WN3[] PROGMEM="PARIS";static const char WN4[] PROGMEM="LISBOA";
static const char WN5[] PROGMEM="SYDNEY";static const char WN6[] PROGMEM="STAR BASE";static const char WN7[] PROGMEM="SIBERIA";static const char WN8[] PROGMEM="MARIANA";static const char WN9[] PROGMEM="RIO";
static const char*const WNAME[] PROGMEM={WN0,WN1,WN2,WN3,WN4,WN5,WN6,WN7,WN8,WN9};
// ---------- level ----------
#define REC 2560
struct Lv{uint8_t w,flags;uint16_t g,fuel;uint8_t px_,py,pw,tx,ty,tw,tpx,tpw,tgy,sx,sy,sph,nflat,nmv;};
static Lv L;static uint8_t lvl=0;static uint24_t LA;
static void loadLevel(uint8_t i){lvl=i;LA=FX_LEVELS+(uint24_t)i*REC;FX::readDataBytes(LA,(uint8_t*)&L,sizeof(L));}
static bool maskAt(int16_t x,int16_t y){if((uint16_t)x>127||(uint16_t)y>63)return false;uint8_t b;FX::readDataBytes(LA+1536+(y>>3)*128+x,&b,1);return b&(1<<(y&7));}
static bool inPad(int16_t x,int16_t y){return (x>=L.px_&&x<L.px_+L.pw&&y>=L.py&&y<L.py+5)||(x>=L.tx&&x<L.tx+L.tw&&y>=L.ty&&y<L.ty+5);}
static bool solidAt(int16_t x,int16_t y){return inPad(x,y)||maskAt(x,y);}

// ---------- game state ----------
enum{ST_READY,ST_FLY,ST_LANDED,ST_CRASHED};
static uint8_t state,lives=3,sT,shake;static int32_t RX,RY;static int16_t VX,VY;static int16_t RA,S_,C_;static void sc_(){S_=isin(RA);C_=icos(RA);}static bool thr;static int32_t fuel;static uint16_t flyT,ft,tick;static int32_t score,bonus;
static uint8_t stars,resParts[6];static int16_t resSc;static bool starGot;static int16_t spin;static int16_t crX,crY;
static uint8_t rspr[48];static bool aLock;
static bool CH,F3,LSB,ARMB,perf,egg69,detail;static uint8_t litM;static uint32_t bubP;static uint16_t CHT;static uint8_t flips,cmI=0;

// ---------- popups ----------
struct Pop{int16_t x,y;uint8_t t,l;uint8_t id;int16_t n;};
#define NPOP 4
static Pop pops[NPOP];
static const char PS0[] PROGMEM="+";static const char PS1[] PROGMEM="360 +";static const char PS2[] PROGMEM="1080 +";static const char PS3[] PROGMEM="NICE +";
static const char PS4[] PROGMEM="LIGHT SPEED +";static const char PS5[] PROGMEM="CHUTE +";static const char PS6[] PROGMEM="ARM +";
static const char*const PSTR_[] PROGMEM={PS0,PS1,PS2,PS3,PS4,PS5,PS6};
static void popup(int16_t x,int16_t y,uint8_t id,int16_t n,uint8_t life){uint8_t k=0;for(uint8_t i=0;i<NPOP;i++)if(pops[i].l==0){k=i;break;}pops[k]={x,y,0,life,id,n};}
static void popText(Pop&p){tbs();tbP((const char*)pgm_read_word(&PSTR_[p.id]));tbn(p.n);}
static void drawPops(){int16_t D[NPOP][2];uint8_t nd=0;for(uint8_t i=0;i<NPOP;i++){Pop&p=pops[i];if(!p.l)continue;popText(p);int16_t w=tl*4;int16_t y=p.y-8-p.t/5;if(y<9)y=9;if(y>58)y=58;
  int16_t lo=1,hi=127-w;if(y<29)lo=22;if(y<41)hi=115-w;int16_t x=p.x-w/2;if(x>hi)x=hi;if(x<lo)x=lo;
  for(uint8_t g=0;g<6;g++){bool ov=false;for(uint8_t j=0;j<nd;j++)if(y<D[j][1]+8&&y+8>D[j][1]&&x<D[j][0]+w+2)ov=true;if(!ov)break;y+=8;}if(y>58)y=58;D[nd][0]=x;D[nd][1]=y;nd++;textO(tb,x,y);}}

// ---------- particles ----------
enum{P_EX=1,P_ES,P_SP,P_DU,P_SM,P_BB,P_PP,P_FB,P_RING};
struct Pt{int16_t x,y;int8_t vx,vy;uint8_t t,l,k;};
#define NPT 30
static Pt pt[NPT];
static Pt* addPt(uint8_t k,int16_t x,int16_t y,int8_t vx,int8_t vy,uint8_t l){for(uint8_t i=0;i<NPT;i++)if(!pt[i].k){pt[i]={x,y,vx,vy,0,l,k};return &pt[i];}return 0;}
// coordinates in Q4 (1/16 px), velocities Q5 (1/32 px per frame)
static void stepPts(){for(uint8_t i=0;i<NPT;i++){Pt&p=pt[i];if(!p.k)continue;p.t++;
  if(p.k==P_SP){if(p.t&1)p.vy++;}else if(p.k==P_DU){if((p.t&3)==0)p.vy++;}else if(p.k==P_BB){if(p.t&1)p.vy--;if(p.vy<-12)p.vy=-12;}
  if(p.k==P_SM&&p.t<8){}else if(p.k<P_PP){int16_t nx=p.x+(p.vx>>1),ny=p.y+(p.vy>>1);if(p.k==P_SP&&solidAt(nx>>4,ny>>4)){p.vx=p.vy=0;p.t+=2;}else{p.x=nx;p.y=ny;}}
  if(p.t>=p.l)p.k=0;}}
static void disc(int16_t x,int16_t y,int8_t r,uint8_t pat){for(int8_t a=-r;a<=r;a++)for(int8_t b=-r;b<=r;b++)if(a*a+b*b<=r*r&&(!pat||((x+a+y+b+pat)&1)))px(x+a,y+b,1);}
static void ring(int16_t x,int16_t y,int16_t r,uint8_t n,uint8_t skip){for(uint8_t a=0;a<n;a++){if(skip&&((a+skip)&1))continue;int16_t an=a*(NA/n);px(x+((icos(an)*r)>>8),y+((isin(an)*r)>>8),1);}}
static void drawPts(bool back){for(uint8_t i=0;i<NPT;i++){Pt&p=pt[i];if(!p.k)continue;int16_t x=p.x>>4,y=p.y>>4;uint8_t t=p.t;bool isBack=(p.k==P_EX||p.k==P_ES);if(isBack!=back)continue;
  switch(p.k){case P_ES:if(!((t>>1)&1)&&t>=6)break;case P_EX:case P_DU:case P_SP:px(x,y,1);break;
   case P_SM:if(t>=8)disc(x,y,1+t/30,t/4|1);break;
   case P_BB:if(t>=p.l-6)ring(x,y,t-(p.l-6)+2,4,0);else ring(x,y,t<20?1:2,t<20?4:8,0);break;
   case P_PP:ring(x,y,t+2,8,0);break;
   case P_RING:ring(x,y,(t*3)/2+3,32,t>=6?t+1:0);break;
   case P_FB:disc(x,y,t<3?10-t*2:t<10?(t+3>9?9:t+3):9-(t-10)/3,t<10?0:t|1);break;}}}

// ---------- movers ----------
struct Mv{uint8_t kind,mode;int16_t a,b,v,off,y0,ay;uint16_t wy,ph;uint8_t w,h; // from FX (20 bytes)
 int32_t acc;uint16_t p1,p2;int16_t x,y,px_;uint8_t dead;int16_t dx,dy;int8_t dvx;uint8_t gy,age;};
#define NMV 3
static Mv mv[NMV];static uint8_t nmv;
static const uint8_t BIRDK=0b111111; // kinds 0..5 (bird,crow,gull,plane,sat,ufo) + bigshark(8),cablecar(9)
static bool killable(uint8_t k){return k<6||k==8||k==9;}
static void loadMovers(){nmv=L.nmv;for(uint8_t i=0;i<nmv;i++){Mv&m=mv[i];FX::readDataBytes(LA+20+i*20,(uint8_t*)&m,20);m.dead=0;m.age=0;
  int32_t span;if(m.mode==0){span=(int32_t)(128*16+2*m.b)<<8;m.acc=((int32_t)m.a<<8)%span;if(m.acc<0)m.acc+=span;}else if(m.mode<=2){m.acc=(int32_t)m.off<<8;}
  if(m.mode==3){m.p1=m.p2=m.off;}else{m.p1=m.ph;}}}
// update mover position for current tick (positions Q4 internally -> px)
static void stepMovers(){for(uint8_t i=0;i<nmv;i++){Mv&m=mv[i];if(m.dead){m.age++;continue;}int16_t ox=m.x;
  switch(m.mode){
   case 0:{int32_t span=(int32_t)(128*16+2*m.b)<<8;m.acc+=m.v;if(m.acc>=span)m.acc-=span;if(m.acc<0)m.acc+=span;m.x=((m.acc>>8)-m.b+8)>>4;m.p1+=m.wy;m.y=(m.y0+(((int32_t)psin(m.p1)*m.ay)>>8)+8)>>4;m.dvx=m.v>>8;}break;
   case 1:case 2:{int32_t L2=(int32_t)(m.b-m.a)<<9;m.acc+=m.v;if(m.acc>=L2)m.acc-=L2;if(m.acc<0)m.acc+=L2;int32_t p=m.acc>>8,Lq=(m.b-m.a);int16_t xq=m.a+(p<Lq?p:2*Lq-p);m.x=(xq+8)>>4;m.dvx=(p<Lq)?(m.v>>8):-(m.v>>8);
     if(m.mode==1){m.p1+=m.wy;m.y=(m.y0+(((int32_t)psin(m.p1)*m.ay)>>8)+8)>>4;}else{m.y=(m.y0+(int32_t)(xq-m.a)*(m.ay-m.y0)/Lq+64+8)>>4;}}break;
   case 3:{m.p1+=m.v;m.p2+=m.wy;m.x=(m.a+(((int32_t)psin(m.p1)*m.b)>>8)+8)>>4;m.y=(m.y0+(((int32_t)psin(m.p2+16384)*m.ay)>>8)+8)>>4;m.dvx=0;}break;
   default:m.x=(m.a+8)>>4;m.y=(m.y0+8)>>4;m.dvx=0;}
  (void)ox;}}
static uint8_t sbuf[140];
static void loadSpr(uint8_t kind,uint8_t fr){FX::readDataBytes(FX_SPRITES+(uint24_t)(kind*2+fr)*160,sbuf,140);}
// draw loaded sprite centered at cx,cy; returns nothing
static uint32_t sCol(uint8_t sx,uint8_t pl){uint8_t w=sbuf[0],P=(sbuf[1]+7)>>3;uint32_t b=0;for(uint8_t p=0;p<P;p++)b|=(uint32_t)sbuf[2+pl*w*P+p*w+sx]<<(8*p);return b;}
static void drawSpr(int16_t cx,int16_t cy,bool flip){uint8_t w=sbuf[0];int16_t x0=cx-(w>>1),y0=cy-(sbuf[1]>>1);
 for(uint8_t x=0;x<w;x++){uint8_t sx=flip?w-1-x:x;colBits(x0+x,y0,sCol(sx,1),0);colBits(x0+x,y0,sCol(sx,0),1);}}
static bool rocketPixAt(int16_t X,int16_t Y);
static bool sprHitsRocket(int16_t cx,int16_t cy,bool flip){uint8_t w=sbuf[0],h=sbuf[1];int16_t x0=cx-(w>>1),y0=cy-(h>>1);
 for(uint8_t x=0;x<w;x++){uint8_t sx=flip?w-1-x:x;uint32_t b=sCol(sx,0);for(uint8_t y=0;b;y++,b>>=1)if((b&1)&&rocketPixAt(x0+x,y0+y))return true;}return false;}
static int8_t bob(int16_t cx){int16_t s=psin(ft*938+cx*10431);return s>128?1:s<-128?-1:0;}
static bool mvFlip(Mv&m){if(m.mode==4)return ((m.b>>4)*7)&1;if(m.mode==3)return false;return m.dvx<0;}
static uint8_t mvFrame(Mv&m){if(m.kind>=9)return 0;return (ft>>3)&1;}
static int16_t mvY(Mv&m){if(m.kind==4||m.kind==5)return m.y+bob(m.mode==4?(m.b>>4):m.x);return m.y;}
static void drawMovers(){for(uint8_t i=0;i<nmv;i++){Mv&m=mv[i];if(m.dead){if(m.dead==2)continue;
   int32_t age=m.age;int16_t y=m.dy+(int16_t)((age*age*23)>>10);int16_t x=m.dx+(int16_t)(((int32_t)m.dvx*age)>>5);if(y>70){m.dead=2;continue;}
   if(y>=m.gy-(m.h>>1)){m.dead=2;addPt(P_RING,x<<4,m.gy<<4,0,0,16);for(uint8_t q=0;q<10;q++)addPt(P_SP,x<<4,(m.gy-1)<<4,rndS(30),-(int8_t)(rnd8()%40),20+rnd8()%20);for(uint8_t q=0;q<3;q++)addPt(P_SM,(x+rndS(4))<<4,(m.gy-2)<<4,rndS(4),-6,60);continue;}
   loadSpr(m.kind,0);if((age&1)==0||age<8)drawSpr(x,y,(age>>2)&1);continue;}
  loadSpr(m.kind,mvFrame(m));drawSpr(m.x,mvY(m),mvFlip(m));}}

static void rpt(int8_t lx2,int8_t ly2,int32_t&ox,int32_t&oy){int16_t c=C_,s=S_;ox=RX+(((int32_t)lx2*c-(int32_t)ly2*s)<<3);oy=RY+(((int32_t)lx2*s+(int32_t)ly2*c)<<3);}
static void line(int16_t x0,int16_t y0,int16_t x1,int16_t y1){int16_t dx=abs(x1-x0),dy=-abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,e=dx+dy;for(;;){px(x0,y0,1);if(x0==x1&&y0==y1)break;int16_t e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
static void drawChute(){uint16_t e=tick-CHT;uint8_t o=e>=12?12:e;sc_();int16_t c=C_,s=S_;int16_t cx=rnd16(RX+(int32_t)s*48),cy=rnd16(RY)-17;int8_t w=(7*o+6)/12,hh=(5*o+6)/12;if(hh<1)hh=1;
 for(int8_t dx=-w;dx<=w;dx++){int16_t r=w?(int16_t)(w*w-dx*dx)*256/(w*w):256;int16_t q=0;while((q+1)*(q+1)<=r)q++;int16_t y=cy-(q*hh+8)/16;for(int16_t yy=y;yy<=cy;yy++)px(cx+dx,yy,0);px(cx+dx,y,1);if((dx+w)%3!=1)px(cx+dx,cy,1);}
 for(int8_t dx=-w+2;dx<=w-2;dx+=3)px(cx+dx,cy-1,1);
 int32_t lx,ly;rpt(-4,-6,lx,ly);line(cx-w,cy,rnd16(lx),rnd16(ly));rpt(4,-6,lx,ly);line(cx+w,cy,rnd16(lx),rnd16(ly));rpt(0,-12,lx,ly);line(cx,cy,rnd16(lx),rnd16(ly));}
// ---------- rocket ----------
static uint16_t angIdx(){int16_t a=RA;while(a<0)a+=NA;while(a>=NA)a-=NA;return a;}
static int16_t rx0,ry0;
static uint8_t mc[4][15];static int16_t mcx,mcp;
static void loadRocket(){FX::readDataBytes(FX_ROCKET+(uint24_t)angIdx()*48,rspr,48);rx0=rnd16(RX)-7;ry0=rnd16(RY)-8;
 mcx=rx0;mcp=ry0>>3;for(uint8_t p=0;p<4;p++){int16_t pg=mcp+p;memset(mc[p],0,15);if(pg<0||pg>7)continue;int16_t xa=rx0<0?0:rx0,xb=rx0+15>128?128:rx0+15;if(xb>xa)FX::readDataBytes(LA+1536+pg*128+xa,&mc[p][xa-rx0],xb-xa);}}
static bool mAt(int16_t x,int16_t y){if((uint16_t)x>127||(uint16_t)y>63)return false;int16_t i=x-mcx,p=(y>>3)-mcp;if(i>=0&&i<15&&p>=0&&p<4)return mc[p][i]&(1<<(y&7));return maskAt(x,y);}
static uint32_t rcol(uint8_t x){return (uint32_t)rspr[x]|((uint32_t)rspr[15+x]<<8)|((uint32_t)rspr[30+x]<<16)|(rspr[45]==x?(1UL<<rspr[46]):0);}
static bool rocketPixAt(int16_t X,int16_t Y){if((uint16_t)X>127||(uint16_t)Y>63)return false;int16_t x=X-rx0,y=Y-ry0;if(x<0||x>14||y<0||y>16)return false;return rcol(x)&(1UL<<y);}
static uint32_t mCol(uint8_t i){uint32_t b=(uint32_t)mc[0][i]|((uint32_t)mc[1][i]<<8)|((uint32_t)mc[2][i]<<16)|((uint32_t)mc[3][i]<<24);int16_t sh=ry0-mcp*8;return b>>sh;}
static uint32_t band(int16_t y){int16_t d=y-ry0;return d>=0?(d>24?0:31UL<<d):(d<-5?0:31UL>>-d);}
static void blitRocket(){for(int8_t x=-1;x<=15;x++){uint32_t c=dil((x>0?rcol(x-1):0)|(x>=0&&x<15?rcol(x):0)|(x<14?rcol(x+1):0));if(x>=0&&x<15)c&=~mCol(x);int16_t X=rx0+x;if(X>=L.px_&&X<L.px_+L.pw)c&=~band(L.py);if(X>=L.tx&&X<L.tx+L.tw)c&=~band(L.ty);colBits(rx0+x,ry0,c,0);}
 for(uint8_t x=0;x<15;x++)colBits(rx0+x,ry0,rcol(x),1);px(rx0+rspr[45],ry0+rspr[46],0);}
static bool rocketHitsMask(int16_t maxY){for(uint8_t x=0;x<15;x++){int16_t X=rx0+x;if((uint16_t)X>127)continue;uint32_t col=rcol(x);if(!col)continue;
  for(uint8_t y=0;y<17;y++)if(col&(1UL<<y)){int16_t Y=ry0+y;if(Y<=maxY&&!inPad(X,Y)&&mAt(X,Y))return true;}}return false;}
static bool rocketRowTouch(int16_t row,int16_t xa,int16_t xb){int16_t y=row-ry0;if(y<0||y>16)return false;for(uint8_t x=0;x<15;x++){int16_t X=rx0+x;if(X<xa||X>=xb)continue;if(rcol(x)&(1UL<<y))return true;}return false;}
static int16_t altM(){int16_t x=rnd16(RX),y0=rnd16(RY+FP(5)),y=y0;for(;y<64;y++){if(y>=0&&solidAt(x,y))break;}return y-y0<0?0:y-y0;}

static void crash(){state=ST_CRASHED;sT=0;shake=18;cmI=(cmI+23+(rnd8()&1)*0)%56;crX=rnd16(RX);crY=rnd16(RY);int16_t x=crX<<4,y=crY<<4;
 addPt(P_FB,x,y,0,0,22);addPt(P_RING,x,y,0,0,16);
 for(uint8_t i=0;i<20;i++){int16_t an=rnd8()*5/4;uint8_t sp=16+rnd8()%48;addPt(P_SP,x,y,(icos(an)*sp>>8)+(int8_t)(VX>>8),(isin(an)*sp>>8)-10+(int8_t)(VY>>8),16+rnd8()%30);}
 for(uint8_t i=0;i<6;i++){Pt*p=addPt(P_SM,x+rndS(64),y+rndS(32),rndS(4),-6-(rnd8()&3),70+rnd8()%30);if(p)p->t=0;}}

static uint8_t tr3(int32_t v,int32_t a,int32_t b,int32_t c,uint8_t p0,uint8_t p1,uint8_t p2,uint8_t p3){return v<=a?p0:v<=b?p1:v<=c?p2:p3;}
static void land(bool isT,uint8_t pdy,int16_t pdx,int16_t pdw){int16_t vy0=VY;int16_t aa=RA<0?-RA:RA;RA=0;VX=VY=0;RY=(int32_t)(pdy-5)<<12;int16_t rx=rnd16(RX);
 for(uint8_t k=0;k<7;k++)addPt(P_DU,(rx+((k%3)-1)*2)<<4,(pdy-1)<<4,(k&1?1:-1)*(8+rnd8()%16),-3-(rnd8()&3),10+rnd8()%10);
 flips=0;if(!isT){state=ST_READY;if(pdw)flyT=0;return;}
 if(CH){bonus+=200;popup(rx,pdy-13,5,200,60);}
 int32_t d=RX-(((int32_t)pdx<<12)+((int32_t)(pdw-1)<<11));if(d<0)d=-d;
 stars=6-tr3(d,FP(1),FP(2),FP(3),1,2,3,d<=FP(4.5)?4:5);
 uint8_t fp=fuel>=(int32_t)L.fuel?100:(uint8_t)(fuel*100/L.fuel);
 resParts[0]=100;resParts[1]=tr3(d,FP(1),FP(3),FP(5),100,60,30,10);resParts[2]=tr3(vy0,FP(0.15),FP(0.30),FP(0.30),50,30,10,10);resParts[3]=tr3(aa,3,7,7,30,20,10,10);resParts[4]=fp;
 resParts[5]=tr3(flyT/60,12,20,30,100,70,40,flyT/60<=45?20:0);
 perf=d<=FP(1)&&vy0<=FP(0.15)&&aa<=3;egg69=fp==69;if(perf)bonus+=69;if(egg69){bonus+=69;popup(rx,pdy-12,3,69,70);}
 resSc=bonus;for(uint8_t i=0;i<6;i++)resSc+=resParts[i];score+=resSc;state=ST_LANDED;sT=0;}

// pipe bubbles (Mariana): returns false if none at this phase. x,y,r in Q4
#define BUBPER 240
#define BUBL 390
static uint8_t PPX,PPY;
static bool bubAt(uint16_t k,uint16_t t,int16_t&x,int16_t&y,uint8_t&r){if(!PPY)return false;int16_t a=t-k*BUBPER;if(a<0||a>=BUBL)return false;x=PPX<<4;
 if(a<60){r=13+a/3;y=((PPY-1)<<4)-r;return true;}a-=60;r=32+a/14;x+=(psin(a*469+k*17733)*(a>40?40:a))>>8;y=((PPY-3)<<4)-(int16_t)(((int32_t)a*((PPY-14)<<4)*199)>>16);return true;}
static void exPoint(uint8_t d,int16_t&ex,int16_t&ey){ex=rnd16(RX-(int32_t)d*S_*16);ey=rnd16(RY+(int32_t)d*C_*16);}
static void simStep(){
 tick++;stepMovers();
 if(state==ST_LANDED||state==ST_CRASHED){if(sT<255)sT++;return;}
 bool A=ab.pressed(A_BUTTON)&&!aLock,Lb=ab.pressed(LEFT_BUTTON),Rb=ab.pressed(RIGHT_BUTTON);
 thr=A&&fuel>0&&!CH;
 if(state==ST_READY){if(fuel<=0){crash();return;}if(thr)state=ST_FLY;else return;}
 flyT++;
 if(ab.justPressed(B_BUTTON)&&!CH&&fuel<=0&&RY<0&&altM()>=100){CH=1;CHT=tick;int8_t sd=(rnd8()&1)?1:-1;VX+=sd*(int16_t)(FP(0.5)+((int16_t)rnd8()<<3));RA=sd*(15+rnd8()%11);}
 if(Lb)RA--;if(Rb)RA++;
 if(CH){if(RA>25)RA=25;if(RA<-25)RA=-25;}
 else{ int8_t da=(Rb?1:0)-(Lb?1:0);if(da){spin+=da;if(spin>=NA||spin<=-NA){spin=0;bonus+=69;popup(rnd16(RX),rnd16(RY)-6,1,69,48);if(++flips>=3&&!F3){F3=1;bonus+=1080;popup(rnd16(RX),rnd16(RY)-14,2,1080,70);}}}if(RA>NA/2)RA-=NA;else if(RA<-NA/2)RA+=NA;}
 int16_t ax=0,ay=L.g>>4;
 sc_();int16_t s=S_,c=C_;
 if(thr){ax+=(213L*s)>>9;ay-=(213L*c)>>9;fuel-=6;if(fuel<0)fuel=0;}
 if(CH)ax+=(123L*s)>>8;
 VX+=ax;VY+=ay;
 if(L.flags&2){VX=((int32_t)VX*252)>>8;VY=((int32_t)VY*252)>>8;}
 if(CH){VX=((int32_t)VX*246)>>8;if(VY<0)VY=((int32_t)VY*230)>>8;if(VY>FP(0.32)){VY-=FP(0.06);if(VY<FP(0.32))VY=FP(0.32);}}
 { bool dive=thr&&c<0;int16_t cap=FP(1.6);if(dive){int16_t k=(-c)*3/2;if(k>256)k=256;cap=FP(1.6)+(int16_t)(((int32_t)FP(3.4)*k)>>8);}
   if(VY>cap)VY=dive?cap:(VY-FP(0.04)<FP(1.6)?FP(1.6):VY-FP(0.04)); }
 if(VY<FP(-2))VY=FP(-2);if(VX>FP(4))VX=FP(4);else if(VX<FP(-4))VX=FP(-4);
 if(!LSB&&VY>=FP(4)){LSB=1;bonus+=88;popup(64,28,4,88,70);}
 RX+=VX;RY+=VY;
 if(L.flags&1){if(RX<FP(3)){RX=FP(3);if(VX<0)VX=0;}else if(RX>FP(124)){RX=FP(124);if(VX>0)VX=0;}}
 else{if(RX<FP(-7))RX+=FP(142);else if(RX>=FP(135))RX-=FP(142);}
 if(RY>FP(74)){crash();return;}
 loadRocket();
 // movers: collision and exhaust kills
 for(uint8_t i=0;i<nmv;i++){Mv&m=mv[i];if(m.dead)continue;int16_t my=mvY(m);
  if(m.x+(m.w>>1)+1>=rx0&&m.x-(m.w>>1)-1<=rx0+15&&my+(m.h>>1)+1>=ry0&&my-(m.h>>1)-1<=ry0+17){loadSpr(m.kind,mvFrame(m));if(sprHitsRocket(m.x,my,mvFlip(m))){crash();return;}}
  if(thr&&killable(m.kind)){int16_t l=m.x-(m.w>>1)-2,r=m.x+(m.w>>1)+2,t=m.y-(m.h>>1)-2,b=m.y+(m.h>>1)+2;bool hit=false;
   for(uint8_t d=3;d<=16&&!hit;d++){int16_t ex=rnd16(RX-(int32_t)d*s*256),ey=rnd16(RY+(int32_t)d*c*256);if(ex>=l&&ex<=r&&ey>=t&&ey<=b)hit=true;}
   if(hit){m.dead=1;m.age=0;m.dx=m.x;m.dy=m.y;int16_t g=m.y+1;while(g<64&&!solidAt(m.x,g))g++;m.gy=g>70?70:g;bonus+=25;addPt(P_PP,m.x<<4,m.y<<4,0,0,9);popup(m.x,m.y-5,0,25,48);}}}
 {uint8_t cl[13];FX::readDataBytes(LA+450,cl,13);for(uint8_t i=0;i<cl[0];i++){if(litM&(1<<i)||!thr)continue;uint8_t*c=cl+1+i*4;bool hit=false;for(uint8_t d=3;d<=14&&!hit;d++){int16_t ex,ey;exPoint(d,ex,ey);if(ex>=c[0]-2&&ex<=c[0]+c[2]+1&&ey>=c[1]-5&&ey<=c[1]+3)hit=true;}
   if(hit){litM|=1<<i;bonus+=40;addPt(P_PP,(c[0]+1)<<4,(c[1]-2)<<4,0,0,9);popup(c[0]+1,c[1]-4,0,40,48);}}}
 {uint16_t k0=tick>=BUBL?(tick-BUBL)/BUBPER+1:0;for(uint16_t k=k0;k<=tick/BUBPER;k++){if(bubP&(1UL<<(k&31)))continue;int16_t x,y;uint8_t r;if(!bubAt(k,tick,x,y,r))continue;bool hit=false;
   for(uint8_t d=0;d<16&&!hit;d++){int16_t px_,py_;if(d<4){int32_t a_,b_;static const int8_t P4[8]={0,-12,-4,6,4,6,0,0};rpt(P4[d*2],P4[d*2+1],a_,b_);px_=(int16_t)(a_>>8);py_=(int16_t)(b_>>8);}else if(thr&&d>=4){exPoint(d,px_,py_);px_<<=4;py_<<=4;}else continue;int16_t dx=(px_-x)>>2,dy=(py_-y)>>2;int16_t rr=(r+24)>>2;if(dx*dx+dy*dy<rr*rr)hit=true;}
   if(hit){bubP|=1UL<<(k&31);bonus+=10;addPt(P_PP,x,y,0,0,8);popup(x>>4,(y>>4)-3,0,10,40);}}}
 int32_t bx[5],by[5];static const int8_t BP[10]={0,-12,-4,-2,4,-2,-4,6,4,6};for(uint8_t i=0;i<5;i++)rpt(BP[i*2],BP[i*2+1],bx[i],by[i]);
 int32_t lx0,ly0,lx1,ly1;rpt(-7,10,lx0,ly0);rpt(7,10,lx1,ly1);
 // star
 if(L.sx!=255&&!starGot){int32_t ty=((int32_t)L.sy<<12)+(int32_t)isin((tick*4)/5+L.sph)*24;bool hit=false;for(uint8_t i=0;i<7&&!hit;i++){int32_t px_=i<5?bx[i]:i==5?lx0:lx1,py_=i<5?by[i]:i==5?ly0:ly1;
   int32_t dx=(px_-((int32_t)L.sx<<12))>>4,dy=(py_-ty)>>4;if(dx*dx+dy*dy<(int32_t)25*65536)hit=true;}if(hit){starGot=true;bonus+=50;addPt(P_PP,L.sx<<4,L.sy<<4,0,0,9);popup(L.sx,L.sy-4,0,50,48);}}
 // pads: target then start
 for(uint8_t p=0;p<2;p++){bool isT=p==0;int16_t X=isT?L.tx:L.px_,Y=isT?L.ty:L.py,W=isT?L.tw:L.pw;
  int32_t rx=(int32_t)X<<12,ry=(int32_t)Y<<12,rw=(int32_t)W<<12,rh=FP(5);
  #define INR(px_,py_) ((px_)>=rx&&(px_)<rx+rw&&(py_)>ry&&(py_)<ry+rh)
  if(VY>0||isT)for(uint8_t i=0;i<5;i++)if(INR(bx[i],by[i])){crash();return;}
  bool hit=VY>0&&(INR(lx0,ly0)||INR(lx1,ly1)||rocketRowTouch(Y,X,X+W));
  if(hit){int16_t aa=RA<0?-RA:RA;bool ok=aa<=10&&VY<FP(0.405)&&VX<FP(0.225)&&VX>FP(-0.225)&&lx0>=rx&&lx0<=rx+rw&&lx1>=rx&&lx1<=rx+rw;
   if(!ok){crash();return;}land(isT,Y,X,W);return;}
 }
 // flat surfaces
 if(VY>0){int16_t t0=-1,t1=-1;bool armHit=false;uint8_t nf=L.nflat;for(uint8_t i=0;i<nf;i++){uint8_t f[4];FX::readDataBytes(LA+192+i*4,f,4);int32_t fx0=(int32_t)f[0]<<12,fx1=(int32_t)(f[0]+f[2])<<12,fy=(int32_t)f[1]<<12;
   if(f[3]&&rocketHitsMask(f[1]-1))continue;
   if(t0<0&&lx0>=fx0&&lx0<fx1&&ly0>fy&&ly0<fy+FP(4))t0=f[1];
   if(t1<0&&lx1>=fx0&&lx1<fx1&&ly1>fy&&ly1<fy+FP(4))t1=f[1];
   if(f[3]&&t0==f[1]&&t1==f[1])armHit=true;}
  if(t0>=0||t1>=0){int16_t aa=RA<0?-RA:RA;if(t0>=0&&t0==t1&&aa<=10&&VY<FP(0.405)&&VX<FP(0.225)&&VX>FP(-0.225)){land(false,t0,0,0);if(armHit&&!ARMB){ARMB=1;bonus+=316;popup(RX<FP(64)?36:92,30,6,316,60);}return;}crash();return;}
 }
 if(rocketHitsMask(63)){crash();return;}
}

// exhaust particles
static void fxStep(){
 if(thr&&state==ST_FLY){int16_t s=S_,c=C_;int16_t nx=(int16_t)((RX-(int32_t)s*64)>>8),ny=(int16_t)((RY+(int32_t)c*64)>>8);
  if(L.flags&2){if(ft%6==0)addPt(P_BB,nx+rndS(16),ny+16,(int8_t)((-s*22)>>8)+rndS(5),(int8_t)((c*22)>>8),55+rnd8()%45);}
  else{for(uint8_t i=0;i<2;i++){uint8_t sp=22+rnd8()%20;addPt(P_EX,nx+rndS(11),ny+rndS(11),(int8_t)((-s*sp)>>8)+(int8_t)(VX>>9)+rndS(4),(int8_t)((c*sp)>>8)+(int8_t)(VY>>9)+rndS(4),6+rnd8()%7);}
   if(ft%3==0)addPt(P_ES,nx,ny+16,(int8_t)((-s*11)>>8)+rndS(3),(int8_t)((c*11)>>8),18+rnd8()%10);}
  if(ft%2==0){for(uint8_t d=3;d<18;d++){int16_t x=(nx>>4)-((s*d)>>8),y=(ny>>4)+((c*d)>>8);if(solidAt(x,y)){for(uint8_t q=0;q<2;q++)addPt(P_DU,x<<4,(y-1)<<4,(q?1:-1)*(11+rnd8()%19),-1-(rnd8()&3),12+rnd8()%8);break;}}}}
 stepPts();for(uint8_t i=0;i<NPOP;i++)if(pops[i].l){pops[i].t++;if(pops[i].t>=pops[i].l)pops[i].l=0;}
 if(shake)shake--;}

// ---------- HUD ----------
static const uint8_t LIFE[6] PROGMEM={0x04,0x0E,0x0A,0x0E,0x1F,0x15};
static void attitude(){const int16_t S=19,C=9;box(0,0,S,S);
 sc_();int16_t c=C_,s=S_;int16_t aa=RA<0?-RA:RA;bool bad=aa>=11;
 for(int8_t t=-22;t<=22;t++){if(bad&&!(t&1)&&((ft>>2)&1))continue;int16_t x=C+(((int32_t)c*t+256)>>9),y=C+(((int32_t)s*t+256)>>9);if(x>1&&x<S-2&&y>1&&y<S-2)px(x,y,1);}
 for(int8_t t=1;t<=4;t++){int16_t x=C+(((int32_t)s*t*3+256)>>9),y=C-(((int32_t)c*t*3+256)>>9);if(x>1&&x<S-2&&y>1&&y<S-2)px(x,y,1);}}
static void fuelBar(){const int16_t x=123,y=9,w=5,h=28;fillR(x-1,y-1,w+2,h+2,0);hl(x,y,w,1);hl(x,y+h-1,w,1);vl(x,y,h,1);vl(x+w-1,y,h,1);
 int32_t fh=(fuel*(h-4)+L.fuel/2)/L.fuel;bool low=fuel*5<L.fuel;if(!(low&&((ft>>3)&1)))fillR(x+2,y+h-2-fh,w-4,fh,1);}
static const uint8_t LW[5] PROGMEM={0x60,0x3C,0x7E,0x3C,0x60};static const uint8_t LO[5] PROGMEM={0x20,0x14,0x22,0x14,0x20};
static void drawLivesF(){for(uint8_t k=0;k<3;k++){for(int8_t c=-1;c<=5;c++){uint8_t m=0;for(int8_t d=-1;d<=1;d++){int8_t cc=c+d;if(cc>=0&&cc<5)m|=pgm_read_byte(&LW[cc]);}m|=m<<1|m>>1;uint8_t*b=&SB[44+k*8+c];*b&=~m;}
  for(uint8_t c=0;c<5;c++){uint8_t w=pgm_read_byte(&LW[c]);SB[44+k*8+c]|=k<lives?(c==2?w&~0x08:w):(pgm_read_byte(&LO[c]));}}}
static void drawLives(int16_t x,int16_t y){for(uint8_t k=0;k<3;k++)for(uint8_t r=0;r<6;r++){uint8_t row=pgm_read_byte(&LIFE[r]);for(uint8_t c=0;c<5;c++)if(row&(1<<c))for(int8_t dy=-1;dy<=1;dy++)for(int8_t dx=-1;dx<=1;dx++)px(x+k*8+c+dx,y+r+dy,0);}
 for(uint8_t k=0;k<3;k++)for(uint8_t r=0;r<6;r++){uint8_t row=pgm_read_byte(&LIFE[r]);for(uint8_t c=0;c<5;c++)if(row&(1<<c)){bool win=(r==2&&c==2);if(k<lives)px(x+k*8+c,y+r,win?0:1);else if(!win&&!((c+r)&1))px(x+k*8+c,y+r,1);}}}
static void hud(){attitude();fuelBar();tbs();tbc('L');tbn(lvl+1);textO(tb,22,1);drawLivesF();
 tbs();tbn(score);textO(tb,128-tl*4,1);tbs();tbn(altM());tbc('M');textO(tb,1,20);
 if(state==ST_FLY){tbs();if(CH){uint16_t e=tick-CHT;if(e<90&&e%30<18)tbP(PSTR("CHUTE OPEN"));}else if(fuel<=0&&RY<0&&((ft>>3)&1)&&altM()>=100)tbP(PSTR("B:CHUTE"));if(tl)ctb(29,1);}}

static const uint8_t STARC[7] PROGMEM={0x04,0x6C,0x3E,0x1F,0x3E,0x6C,0x04};
static void drawStar(){if(L.sx==255||starGot)return;int16_t y=L.sy+((isin((tick*4)/5+L.sph)*3+256)>>9);int16_t x=L.sx;
 for(int8_t c=-1;c<=7;c++){uint32_t m=0;for(int8_t d=-1;d<=1;d++){int8_t cc=c+d;if(cc>=0&&cc<7)m|=pgm_read_byte(&STARC[cc]);}colBits(x-3+c,y-4,dil(m<<1),0);}
 for(int8_t c=0;c<7;c++)colBits(x-3+c,y-3,pgm_read_byte(&STARC[c]),1);
 uint8_t p=(ft+L.sph)%40;if(p<20){px(x-5,y,1);px(x+5,y,1);px(x,y-5,1);px(x,y+4,1);}else{px(x-5,y-4,1);px(x+5,y-4,1);px(x-4,y+4,1);px(x+4,y+4,1);}}

static void star5(int16_t cx,int16_t cy,bool on){if(on){fillR(cx-1,cy-1,3,3,1);px(cx,cy-3,1);px(cx,cy+2,1);px(cx-3,cy-1,1);px(cx+3,cy-1,1);px(cx-2,cy+2,1);px(cx+2,cy+2,1);}else{px(cx,cy-2,1);px(cx-2,cy,1);px(cx+2,cy,1);px(cx-1,cy+2,1);px(cx+1,cy+2,1);}}
static void drawFlame(){if(!thr||(L.flags&2)||state!=ST_FLY)return;sc_();int16_t c=C_,s=S_;uint8_t n=2+((ft%3==0)?2:(ft&1));
 for(int8_t lx=-1;lx<=1;lx++){uint8_t len=(lx==0)?n+5:n+3;for(uint8_t t=0;t<len*2;t++){int32_t ly=8+t;
   int32_t fx=RX+((((int32_t)lx*c-ly*s))<<3),fy=RY+((((int32_t)lx*s+ly*c))<<3);px(rnd16(fx),rnd16(fy),1);}}}

static void decode(uint24_t a,bool x){FX::seekData(a);uint16_t o=0;while(o<1024){uint8_t c=FX::readPendingUInt8();if(c<128){for(uint8_t k=0;k<=c&&o<1024;k++){uint8_t v=FX::readPendingUInt8();if(x)SB[o++]^=v;else SB[o++]=v;}}else{uint8_t v=FX::readPendingUInt8();for(uint16_t k=0;k<(uint16_t)(257-c)&&o<1024;k++){if(x)SB[o++]^=v;else SB[o++]=v;}}}FX::readEnd();}
static uint24_t frameAddr(uint24_t seq,uint16_t idx){uint8_t b[3];FX::readDataBytes(seq,b,2);uint16_t n=b[0]|(b[1]<<8);if(idx>=n)idx=n-1;FX::readDataBytes(seq+2+3*idx,b,3);return (uint24_t)b[0]|((uint24_t)b[1]<<8)|((uint24_t)b[2]<<16);}
static void drawFrame(uint24_t base,uint16_t idx){decode(FX_SCREENS+frameAddr(FX_SCREENS+base,idx),false);}
static void drawBg(){uint8_t b[4];FX::readDataBytes(FX_BG+lvl*4,b,4);uint24_t seq=FX_BG+((uint24_t)b[0]|((uint24_t)b[1]<<8)|((uint24_t)b[2]<<16));FX::readDataBytes(FX_BG+frameAddr(seq,0),SB,1024);
 FX::readDataBytes(seq,b,2);if(b[0]>1){uint8_t k=(ft>>3)&63;if(k)decode(FX_BG+frameAddr(seq,k),true);}
 uint8_t pm[2];FX::readDataBytes(LA+320,pm,2);for(uint8_t k=0;k<pm[1];k++){uint8_t p[2];FX::readDataBytes(LA+322+k*2,p,2);uint8_t k3=k%3;
  uint16_t sp=(uint16_t)(((uint32_t)ft*(pm[0]==1?31+13*k3:13+8*k3))>>8);
  if(pm[0]==1){px((p[0]+((psin((ft+k*40)*209)*3+128)>>8))&127,(uint16_t)(p[1]+sp)%60,1);}
  else{uint8_t y=(uint8_t)(p[1]+640-sp%64)&63;if(y>12)px(p[0]+((psin((ft+k*20)*209)*2+128)>>8),y,1);}}}
static void frontClouds(){uint8_t c[11];FX::readDataBytes(LA+180,c,11);if(!c[0])return;loadSpr(12,0);for(uint8_t i=0;i<c[0];i++)drawSpr(c[1+i*2]+9,c[2+i*2]-2,false);}
static void shakeBuf(int8_t sx,int8_t sy);
static void render(){drawBg();
 {uint8_t cc=ft%120,k=cc/30;if(cc%30<18){int16_t xs[4]={L.tx,(int16_t)(L.tx+2),(int16_t)(L.tx+L.tw-3),(int16_t)(L.tx+L.tw-1)};px(xs[k],L.ty-1,1);}}
 {uint8_t cl[13];FX::readDataBytes(LA+450,cl,13);for(uint8_t i=0;i<cl[0];i++)if(litM&(1<<i)){uint8_t*c=cl+1+i*4;uint8_t x=c[0],y=c[1],w=c[2],h=c[3];fillR(x,y,w,h,1);fillR(x,y,w,h<3?h:3,0);hl(x+1,y-2,w-2,1);hl(x+2,y-3,w-4,1);px(x+w/2,y+1,1);px(x+w/2+1,y+1,1);if((ft>>3)&1)px(x+w/2-1,y-1,1);}}
 {uint16_t k0=tick>=BUBL+10?(tick-BUBL-10)/BUBPER+1:0;for(uint16_t k=k0;k<=tick/BUBPER;k++){if(bubP&(1UL<<(k&31)))continue;int16_t x,y;uint8_t r;uint16_t a0=tick-k*BUBPER;
   if(a0>=BUBL){if(a0<BUBL+8&&bubAt(k,k*BUBPER+BUBL-1,x,y,r)){x>>=4;y>>=4;ring(x,y,3+((a0-BUBL)>>1),6,0);}continue;}
   if(!bubAt(k,tick,x,y,r))continue;x>>=4;y>>=4;ring(x,y,(r+8)>>4,16,0);px(x-1,y-1,1);}}
 drawMovers();
 drawPts(true);drawStar();
 if(CH&&state==ST_FLY)drawChute();
 if(state!=ST_CRASHED){loadRocket();drawFlame();blitRocket();}
 drawPts(false);frontClouds();
 hud();drawPops();
 if(state==ST_READY&&ft<180&&ft%60<45){tbs();tbP((const char*)pgm_read_word(&WNAME[L.w]));tbc(' ');tbn(lvl%10+1);ctb(18,1);}
 if(state==ST_LANDED&&perf&&sT<=90&&sT%30<20)ctP(PSTR("PERFECT LANDING"),24,1);
 if((state==ST_CRASHED&&sT>70)||(state==ST_LANDED&&sT>((perf||egg69)?90:25))){bool dt=state==ST_LANDED&&detail;int16_t py=dt?2:12,ph=dt?60:40;box(24,py,80,ph);
  if(dt){static const char N0[] PROGMEM="LANDED";static const char N1[] PROGMEM="ACCURACY";static const char N2[] PROGMEM="SOFT LANDING";static const char N3[] PROGMEM="ANGLE";static const char N4[] PROGMEM="FUEL REMAINING";static const char N5[] PROGMEM="FLIGHT TIME";static const char N6[] PROGMEM="BONUS";
   static const char*const NN[] PROGMEM={N0,N1,N2,N3,N4,N5,N6};for(uint8_t k=0;k<7;k++){tbs();tbP((const char*)pgm_read_word(&NN[k]));text(tb,27,py+4+k*6);tbs();tbn(k<6?resParts[k]:bonus);text(tb,98-tl*4,py+4+k*6);}
   tbs();tbP(PSTR("TOTAL"));text(tb,27,py+ph-8);tbs();tbn(resSc);text(tb,98-tl*4,py+ph-8);}
  else if(state==ST_LANDED){ctP(lvl==99?PSTR("YOU WIN!"):perf?PSTR("PERFECT LANDING"):PSTR("LANDED"),17,0);for(uint8_t k=0;k<5;k++)star5(44+k*10,29,k<stars);tbs();tbc('+');tbn(resSc);ctb(36,0);ctP(PSTR("A:NEXT B:INFO"),44,0);}
  else{char m[40];FX::readDataBytes(FX_MSGS+cmI*40,(uint8_t*)m,40);char*l2=0;for(uint8_t i=0;m[i];i++)if(m[i]=='|'){m[i]=0;l2=m+i+1;}
   if(l2){text(m,cx_(m),15);text(l2,cx_(l2),22);}else text(m,cx_(m),17);tbs();tbn(lives);tbP(lives==1?PSTR(" LIFE LEFT"):PSTR(" LIVES LEFT"));ctb(l2?30:27,0);ctP(PSTR("A: RETRY"),39,0);}}
 {uint16_t e=tick-CHT;if(CH&&e<16&&!shake){int8_t a=e<8?2:1;int8_t sx=rndS(a),sy=rndS(a);shakeBuf(sx,sy);}}
 if(shake){int8_t a=shake>10?2:1;int8_t sx=rndS(a),sy=rndS(a);
   shakeBuf(sx,sy);}
}
static void shakeBuf(int8_t sx,int8_t sy){{
   if(sx)for(uint8_t p=0;p<8;p++){uint8_t*r=SB+p*128;if(sx>0){memmove(r+sx,r,128-sx);memset(r,0,sx);}else{memmove(r,r-sx,128+sx);memset(r+128+sx,0,-sx);}}
   if(sy>0)for(uint8_t x=0;x<128;x++){uint8_t cr=0;for(uint8_t p=0;p<8;p++){uint8_t*b=&SB[p*128+x];uint8_t v=*b;*b=(v<<sy)|cr;cr=v>>(8-sy);}}
   else if(sy<0)for(uint8_t x=0;x<128;x++){uint8_t cr=0;for(int8_t p=7;p>=0;p--){uint8_t*b=&SB[p*128+x];uint8_t v=*b;*b=(v>>-sy)|cr;cr=v<<(8+sy);}}}
}

static void resetLevel(){loadLevel(lvl);RX=((int32_t)L.px_<<12)+((int32_t)L.pw<<11);RY=(int32_t)(L.py-5)<<12;VX=VY=0;RA=0;state=ST_READY;fuel=L.fuel;flyT=0;sT=0;bonus=0;starGot=false;spin=0;litM=0;bubP=0;{uint8_t pp[2];FX::readDataBytes(LA+470,pp,2);PPX=pp[0];PPY=pp[1];}CH=F3=LSB=ARMB=perf=egg69=detail=false;flips=0;ft=0;tick=0;shake=0;thr=false;
 memset(pt,0,sizeof(pt));memset(pops,0,sizeof(pops));loadMovers();stepMovers();tick=0;}

// ---------- screens ----------
#include <avr/eeprom.h>
enum{M_TITLE,M_HOWTO,M_INTRO,M_PLAY,M_OVER,M_WIN};
static uint8_t mode=M_TITLE;static uint16_t mt,HT;static bool howSeen;static int32_t hi;
#define EE_ADDR ((uint32_t*)32)
static void saveHi(){if(score>hi){hi=score;eeprom_update_dword(EE_ADDR,hi^0x5A5A0000UL);}}
static const uint24_t INTROS[10]={SQ_INTRO0,SQ_INTRO1,SQ_INTRO2,SQ_INTRO3,SQ_INTRO4,SQ_INTRO5,SQ_INTRO6,SQ_INTRO7,SQ_INTRO8,SQ_INTRO9};
static void startLevel(uint8_t i){lvl=i;resetLevel();if(i%10==0){mode=M_INTRO;mt=0;}else mode=M_PLAY;aLock=true;}
static uint32_t sp2(uint8_t b){uint32_t r=0;for(uint8_t i=0;i<5;i++)if(b&(1<<i))r|=3UL<<(2*i);return r;}
static void textS2(const char*s,int16_t x,int16_t y){for(;*s;s++,x+=8){for(int8_t k=-1;k<=6;k++){uint32_t m=0;for(int8_t d=-1;d<=1;d++){int8_t kk=k+d;if(kk>=0&&kk<6)m|=sp2(gcol(*s,kk>>1));}colBits(x+k,y-1,dil(m<<1),0);}for(int8_t k=0;k<6;k++)colBits(x+k,y,sp2(gcol(*s,k>>1)),1);}}
void setup(){ab.boot();ab.display();FX::begin(FX_DATA_PAGE);ab.setFrameRate(60);uint32_t v=eeprom_read_dword(EE_ADDR)^0x5A5A0000UL;hi=(v<100000000UL)?(int32_t)v:0;}
void loop(){if(!ab.nextFrame())return;ab.pollButtons();ft++;mt++;
 bool anyA=ab.pressed(A_BUTTON)||ab.pressed(B_BUTTON),jA=ab.justPressed(A_BUTTON)||ab.justPressed(B_BUTTON);
 switch(mode){
  case M_TITLE:if(anyA)HT+=27;else HT=HT>80?HT-80:0;
   if(HT>=2400){HT=0;lives=3;score=0;if(!howSeen){mode=M_HOWTO;mt=0;}else startLevel(0);}
   if(HT)drawFrame(SQ_HOLD,HT/27);else drawFrame(SQ_IDLE,ft&63);
   tbs();tbP(PSTR("HIGH SCORE "));tbn(hi);text(tb,5,37);break;
  case M_HOWTO:drawFrame(SQ_HOWTO,(mt>20&&!((mt>>4)&1))?1:0);if(mt>20&&jA){howSeen=true;startLevel(0);}break;
  case M_INTRO:drawFrame(INTROS[lvl/10],mt<60?mt/2:30+((mt-60)/2)%60);if(mt>14&&jA){mode=M_PLAY;aLock=true;ft=0;}break;
  case M_PLAY:
   if(aLock){if(!ab.pressed(A_BUTTON))aLock=false;}
#ifdef DBG
   if(state==ST_READY&&flyT==0){if(ab.justPressed(UP_BUTTON))startLevel((lvl+1)%100),mode=M_PLAY;if(ab.justPressed(DOWN_BUTTON))startLevel((lvl+99)%100),mode=M_PLAY;}
#endif
   simStep();fxStep();
   if(state==ST_CRASHED&&sT==1){if(lives)lives--;if(!lives)saveHi();}
   if(state==ST_LANDED&&sT==1)saveHi();
   if(state==ST_CRASHED&&!lives&&sT>70){mode=M_OVER;mt=0;}
   else if(state==ST_LANDED&&lvl==99&&sT>40){mode=M_WIN;mt=0;}
   else if((state==ST_CRASHED&&sT>70)||(state==ST_LANDED&&sT>40)){if(state==ST_LANDED&&ab.justPressed(B_BUTTON))detail=!detail;else if(ab.justPressed(A_BUTTON)){if(state==ST_LANDED)startLevel(lvl+1);else{resetLevel();aLock=true;}}}
   if(mode==M_PLAY)render();else render();break;
  case M_OVER:drawFrame(SQ_OVER,mt<240?mt/2:60+((mt-240)/2)%60);tbs();tbP(PSTR("LEVEL "));tbn(lvl+1);tbP(PSTR("  SCORE "));tbn(score);ctb(18,1);if(mt>30&&ab.justPressed(A_BUTTON)){mode=M_TITLE;HT=0;}break;
  case M_WIN:drawFrame(SQ_WIN,mt<240?mt/2:60+((mt-240)/2)%60);{tbs();tbn(score);int16_t sw=tl*8-2,x0=64-(19+5+sw)/2;char sc[12];memcpy(sc,tb,tl+1);tbs();tbP(PSTR("SCORE"));textO(tb,x0,38);textS2(sc,x0+24,35);}if(mt>30&&ab.justPressed(A_BUTTON)){mode=M_TITLE;HT=0;}break;
 }
 FX::display();}
