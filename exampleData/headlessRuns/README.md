# Example Headless Run Configurations #

Use the included script `<FiveUI>/bin/runHeadless.sh` to use the headless run system
included with FiveUI. You will probably need to change the values of the
environment variables at the top of the script to match your local
environment.

## Usage ##

To use the headless application, invoke `runHeadless.sh` from the command line:

    usage: runHeadless.sh <input file 1> [<input file 2> ...]
     -h                      print this help message
     -o <outfile>            write output to file
     -r <report directory>   write HTML reports to given directory
     -v                      verbose output
     -vv                     VERY verbose output

## Notes ##

Some of the example run configuration files in this directory require a
local web server to be running on port 8000 hosting the HTML files in
$FIVEUI_ROOT/exampleData/sites/.

If you have Python installed on your system, an easy way to get a local web server
running for testing purposes is:

    cd $FIVEUI_ROOT/exampleData/sites/
    python -m SimpleHTTPServer
