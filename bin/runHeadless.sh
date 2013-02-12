#!/usr/bin/env bash
export FIVEUI_ROOT_PATH=$HOME/FiveUI
export FIREFOX_BIN_PATH=/usr/bin/firefox

java -DFIVEUI_ROOT_PATH=$FIVEUI_ROOT_PATH \
     -DFIREFOX_BIN_PATH=$FIREFOX_BIN_PATH \
     -jar $FIVEUI_ROOT_PATH/bin/HeadlessRunner-0.0.1-SNAPSHOT.one-jar.jar \
     $*
