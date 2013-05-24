#!/usr/bin/env bash
#
# Run Jasmine tests headless using EnvJasmine
# (https://github.com/trevmex/EnvJasmine)

usage() {
    echo ""
    echo "Usage:"
    echo ""
    echo "Set FIVEUI_ROOT environment variable."
    echo "Run:"
    echo "> $0 specFileName"
    echo ""
    echo "where specFileName is an **absolute** file path"
    echo ""
}

[ -z "$FIVEUI_ROOT" ] && { echo "Need to set FIVEUI_ROOT"; exit 1; }
ENV_JASMINE_ROOT=$FIVEUI_ROOT/tools/EnvJasmine/

[ -z "$1" ] && { echo "No test spec specified"; usage; exit 1; }

CMD="java -Dfile.encoding=utf-8 -jar \"$ENV_JASMINE_ROOT/lib/rhino/js.jar\" \
    \"$ENV_JASMINE_ROOT/lib/envjasmine.js\" --environment=\"UNIX\" \
    --rootDir=\"$ENV_JASMINE_ROOT\" \
    --configFile=\"$FIVEUI_ROOT/contexts/data/tests/env_jasmine_deps.js\" "


for (( i=1 ; i < $#+1 ; i=$i+1 )) do
    CMD="$CMD \"${!i}\""
done

eval $CMD


