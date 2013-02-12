% Automated testing with FiveUI

# Introducing "headless"

The FiveUI distribution comes with a Java application called `headless` that is
desiged to make automated testing with FiveUI easy.

The headless tool can take a collection of FiveUI rule sets and a target (a
single web page, an entire website, or a filtered part of one) and automate the
running of FiveUI rules. Headless can output a text or HTML based report
summarizing the run.

In what follows, `<FiveUI>` refers to the directory where you have installed the
FiveUI distribution.

## Quickstart

A "batteries included" jar file and helper script for using `headless` are
included in the `<FiveUI>/bin` directory. To start using headless, first
make sure you have Firefox 17 (the E.S.R. release, see step 3 below) installed.

0. Go to the `<FiveUI>/bin` directory

    $ cd <FiveUI>

1. Edit variables at the start of `runHeadless.sh` to reflect your Firefox
   installation and FiveUI installation directory.

    $ cat runHeadless.sh
    export FIVEUI_ROOT_PATH=$HOME/galois/FiveUI
    export FIREFOX_BIN_PATH=$HOME/myapps/Firefox17/Contents/MacOS/firefox
    ...

2. Invoke `runHeadless.sh` from the command line:

    $ runExample.sh -h
    usage: headless <input file 1> [<input file 2> ...]
     -h                      print this help message
     -o <outfile>            write output to file
     -r <report directory>   write HTML reports to given directory
     -v                      verbose output
     -vv                     VERY verbose output

3. Run `runHeadless.sh` one of the included run description files

## Installation

1. Install maven

Headless is a [maven](http://maven.apache.org/) managed Java project. The
projects top-level directory is `<FiveUI>/headless`, where `<FiveUI>` refers to
where you've installed FiveUI. You'll need maven installed on your system to
continue.

 * On debian based linux systems: `sudo apt-get install maven`
 * On Mac OS X: Maven 3.x comes pre-installed on OS X 10.7+

2. Compile the headless project

Once you have maven install you can try compiling the project which will trigger
the dependencies to be downloaded and installed in your local maven repository
(for a quick intro to using maven, see [Maven in Five
Minutes](http://maven.apache.org/guides/getting-started/maven-in-five-minutes.html).

    $ mvn compile

In order to use headless you also need a copy of Firefox 17 (the current
extended support release). More recent versions of Firefox may also work, but
they are not supported for use with FiveUI. Download and install Firefox 17
[here](http://www.mozilla.org/en-US/firefox/organizations/all.html). Note that
Firefox 17 can be installed along side existing alternate versions of firefox on
your system or isolated to your user directory by simply moving it's
installation directory.

Now that you've installed Firefox 17, it's time to tell headless where the
binary lives. For example, when I install Firefox 17 to `~/myapps/Firefox17` on a
Mac OS X system, the firefox binary lives at

    ~/myapps/Firefox17/Contents/MacOS/firefox

Locate your firefox binary and remember it for the next step.

In the top-level `headless` directory, copy the configuration file
`programs.properties.example` to `programs.properties`

    $ cp programs.properties.example programs.properties

Now, modify the first entry in `programs.properties`
to point to the location of your Firefox binary.

