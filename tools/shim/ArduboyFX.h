#pragma once
#include <stdint.h>
#include <string.h>
typedef uint32_t uint24_t;
extern uint8_t*HOST_FX;
struct FX;struct FX{static void begin(uint16_t){}static void begin(uint16_t,uint16_t){}static void readDataBytes(uint24_t a,uint8_t*b,size_t n){memcpy(b,HOST_FX+a,n);}static uint32_t P;static void seekData(uint24_t a){P=a;}static uint8_t readPendingUInt8(){return HOST_FX[P++];}static uint8_t readEnd(){return HOST_FX[P++];}static void display(){}static void display(bool){}};

inline uint32_t FX::P=0;
