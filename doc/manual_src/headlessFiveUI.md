% Automated testing with FiveUI

# Introducing "Headless"

-------------

The FiveUI distribution comes with a Java application called `Headless` that is
designed to make automated testing with FiveUI easy.

Headless can take a collection of FiveUI rule sets and a target
(a single web page, an entire website, or a filtered part of one)
and automate running the rule sets on the target(s). Headless
will then output a text or HTML based report summarizing the run.

"Headless runs" are specified using text based run description files that are
written in JSON format. The exact form of these descriptions is given below.
Headless supports two modes for automating FiveUI. In the first mode,
Headless executes one FiveUI rule set per URL line in the run description and
outputs a report indicating which rule sets passed or failed (and how) for each
URL. In the second mode, Headless uses each URL line to specify a seed from
which a web crawl is started.  Parameters can be given to control the extent of
the crawl.


## Quickstart

-------------

### Get the FiveUI Source Distribution

Headless is contained in the FiveUI source distribution. You can download the
distribution from [github](http://github.com/galoisinc/FiveUI) at:

    https://github.com/GaloisInc/FiveUI/archive/master.zip

Alternatively, if you have `git` installed you can clone the repository:

    git clone https://github.com/GaloisInc/FiveUI.git

In what follows, `<FiveUI>` refers to the directory where you have installed the
FiveUI distribution.

### Install External dependencies

You will need the following dependencies installed on your system in order
to use Headless. All of the dependencies can be found and easily installed
on most major platforms (Linux, Mac OS X, Windows). The dependencies are:

 - [Java Development Kit](http://www.java.com)
 - [Firefox](http://www.mozilla.org/en-US/firefox/organizations/all.html) 24 (the
   E.S.R. release)
 - [Maven](http://maven.apache.org/download.cgi)
 - UNIX archive utility `tar` (and optionally `make`)

### Install Maven

Headless is a [maven](http://maven.apache.org/) managed Java project. The
project's top-level directory is `<FiveUI>/src/batchtools/headless`.  You'll need maven
installed on your system to continue.

 - On debian based linux systems: `sudo apt-get install maven`
 - On Mac OS X: Maven 3.x comes pre-installed (OS X 10.7 or later)

### Compile Headless

Once you have maven installed, you can compile the project. This will trigger
the dependencies to be downloaded and installed in your local maven repository.
(For a quick intro to using maven, see [Maven in Five
Minutes](http://maven.apache.org/guides/getting-started/maven-in-five-minutes.html).)

```
$ mvn compile package -DskipTests
```

### Get Firefox E.S.R.

In order to use Headless you also need a copy of Firefox 24 (the current
extended support release or E.S.R.). More recent versions of Firefox may also work, but
they are not supported for use with FiveUI. Download and install Firefox 24
[here](http://www.mozilla.org/en-US/firefox/organizations/all.html). Note that
Firefox 24 can be installed along side existing alternate versions of firefox on
your system or isolated to your user directory by simply moving it's
installation directory.

Now that you've installed Firefox 24, it's time to tell Headless where the
binary lives. For example, when I install Firefox 24 to `~/myapps/Firefox24` on a
Mac OS X system, the firefox binary lives at

```
~/myapps/Firefox24/Contents/MacOS/firefox
```

Locate your firefox binary and remember it for the next step.

### Edit the run script

Edit variables at the start of
`<FiveUI>/src/batchtools/headless/bin/runHeadless.sh` to reflect your
Firefox installation and FiveUI installation directory.

```
$ cd <FiveUI>/src/batchtools/headless/bin
$ cat runHeadless.sh
export FIVEUI_ROOT_PATH=$HOME/galois/FiveUI
export FIREFOX_BIN_PATH=/usr/bin/firefox
...
```

### Invoke the script

The `runHeadless.sh` script can be invoked from the command line with options.

```
$ cd <FiveUI>/src/batchtools/headless/bin
$ ./runHeadless.sh -h
usage: headless <input file 1> [<input file 2> ...]
 -h                      print this help message
 -o <outfile>            write output to file
 -r <report directory>   write HTML reports to given directory
 -v                      verbose output
 -vv                     VERY verbose output
```

### Try one of the included example runs

Here we execute the example headless run located in
`<FiveUI>/exampleData/headlessRuns/basicRun.json`.

First, create some directories for the reports to live in.

```
$ cd <FiveUI>/exampleData/headlessRuns
$ mkdir -p reports/basic
```

Now invoke the `runHeadless` script.

```
$ <FiveUI>/src/batchtools/headless/bin/runHeadless.sh basicRun.json -v -o reports/basic.out -r reports/basic
```

You should see the Firefox browser open and load `http://whitehouse.gov`. The FiveUI
extension is now running rule sets on the page and collecting information for its
report.

Linux users can hide the browser window from appearing at this point
by running the script inside an X virtual frame buffer. See the
following [description of Xvfb](http://en.wikipedia.org/wiki/Xvfb)
for more.

After the run is complete you should see a text log of the run in
`reports/basic.out` and an HTML summary report in
`reports/basic/summary.html`.

### Write your own run configuration.

A run configuration is a text file in JSON format that determines the behavior
of a Headless run, in particular:

 - the location of rule set files
 - web crawl parameters
 - URLs to test (seeds for the crawl)

The format of a run configuration is as follows:

```javascript
/*
 * Comments
 */
{
  'rulePath'  : '<path>',                         // path = the path where rule set files referenced below live.
                                                  // rulePath is relative to the run description file.
  'crawlType' : '<d> <n> <p> <pat>',              // d = crawl depth, n = max number of pages to retrieve.
                                                  // p = politeness delay (ms), pat = URL glob pattern
                                                  // (crawlType can also be 'none').
  'runs': [
  { 'url': '<url>', 'ruleSet': '<rule_file>' },   // Each line here corresponds to a separate webcrawl
  { 'url': '<url>', 'ruleSet': '<rule_file>' },   // and rule execution pass.
  ...                                             // Many URL lines may follow.
  ]
}
```

### Testing

To run the project's unit tests and verify that things are working as they should on
your installation and system, use the maven test target:

```
$ cd <FiveUI>/src/batchtools
$ mvn test
```
