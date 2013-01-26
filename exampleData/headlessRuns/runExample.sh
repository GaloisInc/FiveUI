#!/usr/bin/env bash
export FIVEUI_ROOT_PATH=../../
export FIREFOX_BIN_PATH=$HOME/myapps/Firefox\ 17\ esr.app/Contents/MacOS/firefox

java -DFIVEUI_ROOT_PATH=$FIVEUI_ROOT_PATH \
     -DFIREFOX_BIN_PATH="$FIREFOX_BIN_PATH" \
     -jar $FIVEUI_ROOT_PATH/headless/target/HeadlessRunner-0.0.1-SNAPSHOT.one-jar.jar \
     $*
