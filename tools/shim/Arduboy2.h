#pragma once
#include <stdint.h>
#include <string.h>
#include <stdlib.h>
#include "avr/pgmspace.h"
#define A_BUTTON 8
#define B_BUTTON 4
#define UP_BUTTON 128
#define DOWN_BUTTON 16
#define LEFT_BUTTON 32
#define RIGHT_BUTTON 64
#define WHITE 1
#define BLACK 0
#define ARDUBOY_NO_USB
extern uint8_t HOST_BTN,HOST_PREV;
struct Arduboy2Base{static uint8_t sBuffer[1024];void begin(){}void boot(){}void display(){}void setFrameRate(int){}bool nextFrame(){return true;}void pollButtons(){}
 bool pressed(uint8_t m){return (HOST_BTN&m)==m;}bool justPressed(uint8_t m){return (HOST_BTN&m)&&!(HOST_PREV&m);}bool justReleased(uint8_t m){return !(HOST_BTN&m)&&(HOST_PREV&m);}
 static uint32_t generateRandomSeed(){return 1234;}};
