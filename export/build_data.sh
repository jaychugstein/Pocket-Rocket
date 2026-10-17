#!/bin/bash
# Regenerates all FX data from the browser game source (needs node + python3)
set -e; cd "$(dirname "$0")"
node export.js && node bgseq.js && node screens.js && node msgs.js && python3 fxpack.py
