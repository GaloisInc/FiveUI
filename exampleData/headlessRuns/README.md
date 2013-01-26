# Example Headless Run Configurations #

Use the included script `runExamples.sh` to use the headless run system
included with FiveUI. You will probably need to change the values of the
environment variables at the top of the script to match your local
environment.

## Usage ##

usage: runExample.sh <input file 1> [<input file 2> ...]
 -h                      print this help message
 -o <outfile>            write output to file
 -r <report directory>   write HTML reports to given directory
 -v                      verbose output
 -vv                     VERY verbose output

## Notes ##

NB - The examples run configuration files in this directory require a
local websever to be running on port 8000 hosting the HTML files in
$FIVEUI_ROOT/exampleData/sites/.
