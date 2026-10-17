# pack fx data parts into fxdata.bin + fxdata.h
import os,sys
H=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','PocketRocket');D=os.path.join(H,'fxdata')
parts=[('FX_ROCKET','rocket.bin'),('FX_SPRITES','sprites.bin'),('FX_MSGS','msgs.bin'),('FX_LEVELS','levels.bin'),('FX_SCREENS','screens.bin'),('FX_BG','bgseq.bin')]
data=b'';hdr=[]
for name,f in parts:
    while len(data)%256: data+=b'\0'
    hdr.append('constexpr uint24_t %s = 0x%06X;'%(name,len(data)))
    data+=open(os.path.join(D,f),'rb').read()
pages=(len(data)+255)//256; data+=b'\0'*(pages*256-len(data))
open(os.path.join(D,'fxdata.bin'),'wb').write(data)
h='#pragma once\n#include <ArduboyFX.h>\nconstexpr uint16_t FX_DATA_PAGE = 0x%04X;\nconstexpr uint24_t FX_DATA_BYTES = %d;\n'%(65536-pages,len(data))+'\n'.join(hdr)+'\n'
open(os.path.join(H,'fxdata.h'),'w').write(h);print(h)
