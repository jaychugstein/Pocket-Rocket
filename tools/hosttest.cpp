#include <cstdint>
#include <algorithm>
#include <cstdio>
#include <cmath>
#include <vector>
#include <string>
#include <fstream>
#include <sstream>
uint8_t HOST_BTN=0,HOST_PREV=0;uint8_t*HOST_FX;uint8_t Arduboy2Base_sb[1024];
#include "Arduboy2.h"
uint8_t Arduboy2Base::sBuffer[1024];
#define setup game_setup
#define loop game_loop
#include "../PocketRocket/game.cpp"
#undef setup
#undef loop
struct AI{double AK,AV,GL;int AD;double crz;std::vector<std::pair<double,double>> wp;};
std::vector<AI> ais;
static double fx(int32_t v){return v/4096.0;}
// port of JS aiInputs (no movers)
static int brake=0;static double MGX=8;
static bool danger(){if(!nmv)return false;Mv save[NMV];memcpy(save,mv,sizeof(mv));bool d=false;double Rx=fx(RX),Ry=fx(RY),Rvx=fx(VX),Rvy=fx(VY);
 for(int k=0;k<=80&&!d;k+=5){if(k)for(int q=0;q<5;q++)stepMovers();double x=Rx+Rvx*k,y=Ry+Rvy*k;for(int i=0;i<nmv;i++){Mv&m=mv[i];if(m.dead)continue;double l=m.x-m.w/2.0,t=m.y-m.h/2.0;const double mg=MGX;if(x>l-mg&&x<l+m.w+mg&&y>t-mg&&y<t+m.h+mg){d=true;break;}}}
 memcpy(mv,save,sizeof(mv));return d;}
static uint8_t aiInputs(AI&a,int&wpI,int tick){
 if(state!=ST_FLY&&state!=ST_READY)return 0;
 double Rx=fx(RX),Ry=fx(RY),Rvx=fx(VX),Rvy=fx(VY),Ra=RA*2*M_PI/NA;double g=L.g/65536.0,TH=0.026;
 double tx0=L.tx+L.tw/2.0,tx,ty,vmax=1.0;bool land=false;
 if(wpI<(int)a.wp.size()){tx=a.wp[wpI].first;ty=a.wp[wpI].second;if(hypot(tx-Rx,ty-Ry)<6&&state==ST_FLY)wpI++;vmax=a.AV;}
 if(wpI>=(int)a.wp.size()){tx=tx0;ty=L.ty-5;land=true;}
 double dvx,dvy;auto sgn=[](double v){return v>0?1.0:v<0?-1.0:0.0;};
 if(land){double dx=tx-Rx;dvx=sgn(dx)*std::min({0.3,fabs(dx*a.GL),sqrt(2*0.003*std::max(0.0,fabs(dx)-1))+0.03});
  bool near=fabs(dx)<2.5&&fabs(Rvx)<0.12;double h=ty-Ry;
  dvy=near?std::max(0.08,std::min(0.3,h*0.04)):std::max(-0.3,std::min(0.3,(std::max(a.crz?a.crz:14.0,(double)L.ty-20)-Ry)*0.06));
  if(near&&h<3)dvy=0.1;}
 else{auto cap=[&](double d){return std::min(vmax,sqrt(2*0.003*std::max(0.0,fabs(d)-3))+0.06);};dvx=sgn(tx-Rx)*cap(tx-Rx);dvy=sgn(ty-Ry)*cap(ty-Ry);}
 if(state==ST_FLY&&danger()&&brake<150){brake++;dvx=0;dvy=0;}else if(state==ST_FLY&&brake>0&&!danger())brake=std::max(0,brake-2);
 double adx=(dvx-Rvx)*a.AK,ady=(dvy-Rvy)*a.AK;double up=g-ady;double want=up>0.002?atan2(adx,up):0;want=std::max(-0.5,std::min(0.5,want));
 if(land&&fabs(tx-Rx)<6)want=std::max(-0.12,std::min(0.12,want));
 double err=want-Ra;uint8_t b=0;if(err>0.02)b|=RIGHT_BUTTON;else if(err<-0.02)b|=LEFT_BUTTON;
 bool A=up>0&&hypot(adx,up)>TH*0.5&&fabs(err)<0.35;if(state==ST_READY)A=tick>=a.AD;if(A)b|=A_BUTTON;return b;}
void dumpHit(){loadRocket();for(uint8_t x=0;x<15;x++){uint32_t col=rcol(x);for(uint8_t y=0;y<17;y++)if(col&(1UL<<y)){if(maskAt(rx0+x,ry0+y)&&!inPad(rx0+x,ry0+y))printf(" hit(%d,%d)",rx0+x,ry0+y);}}printf(" pad=%d,%d,%d tgt=%d,%d,%d\n",L.px_,L.py,L.pw,L.tx,L.ty,L.tw);}
int main(int argc,char**argv){std::ifstream f("../PocketRocket/fxdata/fxdata.bin",std::ios::binary);std::vector<char> d((std::istreambuf_iterator<char>(f)),{});HOST_FX=(uint8_t*)d.data();
 std::ifstream af("aidata.txt");std::string line;while(std::getline(af,line)){std::istringstream ss(line);AI a;int n;ss>>a.AK>>a.AV>>a.GL>>a.AD>>a.crz>>n;for(int i=0;i<n;i++){double x,y;ss>>x>>y;a.wp.push_back({x,y});}ais.push_back(a);}
 if(argc>2&&std::string(argv[1])=="search"){for(int ai=2;ai<argc;ai++){int i=atoi(argv[ai])-1;AI b=ais[i];bool found=false;
   for(double k:{0.25,0.1,0.15,0.2,0.3,0.4,0.6,0.9})for(double v:{0.45,0.2,0.3,0.6})for(double g:{0.008,0.012,0.015})for(int dd:{0,10,50,100,180,300})for(int wy:{0,-3,-6,3,-10})for(int wx:{0,-6,6}){if(found)break;AI a=b;a.AK=k;a.AV=v;a.GL=g;a.AD=dd;for(auto&p:a.wp){p.second+=wy;p.first+=wx;}lvl=i;resetLevel();brake=0;int wpI=0;for(int t=0;t<9000&&state!=ST_LANDED&&state!=ST_CRASHED;t++){HOST_PREV=HOST_BTN;HOST_BTN=aiInputs(a,wpI,t);simStep();}
    if(state==ST_LANDED&&fuel*10>(int32_t)L.fuel*4){found=true;printf("%d %g %g %g %d wy%d\n",i+1,k,v,g,dd,wy);ais[i]=a;}}
   if(!found)printf("%d NONE\n",i+1);}
   FILE*o=fopen("aidata.txt","w");for(auto&a:ais){fprintf(o,"%g %g %g %d %g %d",a.AK,a.AV,a.GL,a.AD,a.crz,(int)a.wp.size());for(auto&p:a.wp)fprintf(o," %g %g",p.first,p.second);fprintf(o,"\n");}fclose(o);return 0;}
 if(argc>2&&std::string(argv[1])=="shots"){ // shots out.pgm L1 L2 ... : render each level after autopilot N frames
   std::vector<int> Ls;int fr=atoi(argv[2]);for(int ai=3;ai<argc;ai++)Ls.push_back(atoi(argv[ai])-1);
   FILE*f=fopen("shots.pgm","wb");int cols=std::min((int)Ls.size(),4),rows=(Ls.size()+3)/4;fprintf(f,"P5 %d %d 255\n",cols*132,rows*68);std::vector<uint8_t> img(cols*132*rows*68,60);
   for(size_t n=0;n<Ls.size();n++){int i=Ls[n];lvl=i;resetLevel();int wpI=0;for(int t=0;t<fr;t++){HOST_PREV=HOST_BTN;HOST_BTN=aiInputs(ais[i],wpI,t);ft++;simStep();fxStep();}render();
     int ox=(n%4)*132,oy=(n/4)*68;for(int y=0;y<64;y++)for(int x=0;x<128;x++)img[(oy+y)*cols*132+ox+x]=(SB[(y>>3)*128+x]>>(y&7))&1?255:0;}
   fwrite(img.data(),1,img.size(),f);fclose(f);return 0;}
 if(argc>2&&std::string(argv[1])=="mvp"){for(int ai=2;ai<argc;ai++){int i=atoi(argv[ai])-1;lvl=i;resetLevel();printf("%d",i+1);for(int t=1;t<=1234;t++){tick++;stepMovers();if(t==1||t==100||t==500||t==1234)for(int k=0;k<nmv;k++)printf(" k%d@%d:%d,%d",mv[k].kind,t,mv[k].x,mv[k].y);}printf("\n");}return 0;}
 if(getenv("MG"))MGX=atof(getenv("MG"));
 if(argc>2&&std::string(argv[1])=="try"){int i=atoi(argv[2])-1;AI a=ais[i];int wy=atoi(argv[3]);for(auto&p:a.wp)p.second+=wy;lvl=i;resetLevel();brake=0;int wpI=0;int t=0;for(;t<9000&&state!=ST_LANDED&&state!=ST_CRASHED;t++){HOST_PREV=HOST_BTN;HOST_BTN=aiInputs(a,wpI,t);ft++;simStep();fxStep();}
   for(int q=0;q<2;q++){ft++;simStep();fxStep();}render();{FILE*f=fopen("try.pgm","wb");fprintf(f,"P5 128 64 255\n");for(int y=0;y<64;y++)for(int x=0;x<128;x++)fputc((SB[(y>>3)*128+x]>>(y&7))&1?255:0,f);fclose(f);}
   dumpHit();printf("wy=%d state=%d t=%d x=%.1f y=%.1f wpI=%d\n",wy,state,t,fx(RX),fx(RY),wpI);return 0;}
 int ok=0;std::string bad;
 int from=0,to=100;if(argc>1){from=atoi(argv[1]);to=from+1;}
 for(int i=from;i<to;i++){lvl=i;resetLevel();brake=0;int wpI=0;int t=0;for(;t<9000&&state!=ST_LANDED&&state!=ST_CRASHED;t++){HOST_PREV=HOST_BTN;HOST_BTN=aiInputs(ais[i],wpI,t);ft++;simStep();fxStep();}
  if(state==ST_LANDED)ok++;else{bad+=std::to_string(i+1)+(state==ST_CRASHED?"c":"t")+" ";}
  if(argc>1){dumpHit();}if(argc>1)printf("L%d state=%d t=%d x=%.1f y=%.1f vx=%.2f vy=%.2f a=%d fuel=%ld score=%d\n",i+1,state,t,fx(RX),fx(RY),fx(VX),fx(VY),RA,(long)fuel,resSc);}
 printf("%d/100 bad: %s\n",ok,bad.c_str());}
