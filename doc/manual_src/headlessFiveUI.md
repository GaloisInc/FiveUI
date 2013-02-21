% Automated testing with FiveUI

# Introducing "Headless"

-------------

The FiveUI distribution comes with a Java application called `Headless` that is
desiged to make automated testing with FiveUI easy.

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

You will need the following dependenies installed on your system in order
to use Headless. All of the dependencies can be found and easily installed
on most major platforms (Linux, Mac OS X, Windows). The dependencies are:

 - [Java Development Kit](http://www.java.com)
 - [Firefox](http://www.mozilla.org/en-US/firefox/organizations/all.html) 17 (the
   E.S.R. release)
 - [Maven](http://maven.apache.org/download.cgi)
 - UNIX archive utility `tar` (and optionally `make`)

### Download the FiveUI Firefox extension

The packaged Firefox extension is not included in the source distribution and
is needed so that Headless can driver your browser with FiveUI installed.

Download the extension from

    http://galoisinc.github.com/FiveUI/binaries/fiveui.xpi

and save it to `<FiveUI>/contexts`.

### Install the included webdrivers dependency

The following command will instruct Maven to install
the webdrivers Java library to your local Maven repository.

```
$ cd <FiveUI>/webdriver
$ mvn install
```

### Unpack the included Firefox profile

```
$ cd <FiveUI>/profiles
$ tar xf firefox.tar
```

Alternatively, if you have `make` installed you can run from `<FiveUI>/profiles`:

```
$ make
```

Alternatively, you can copy (or link) an [existing firefox profile
directory](http://support.mozilla.org/en-US/kb/profiles-where-firefox-stores-user-data)
that you have to `<FiveUI>/profiles/firefox`.

### Edit the run script

Edit variables at the start of `<FiveUI>/bin/runHeadless.sh` to
reflect your Firefox installation and FiveUI installation directory.

```
$ cd <FiveUI>
$ cat bin/runHeadless.sh
export FIVEUI_ROOT_PATH=$HOME/galois/FiveUI
export FIREFOX_BIN_PATH=$HOME/myapps/Firefox17/Contents/MacOS/firefox
...
```

### Invoke the script

The `runHeadless.sh` script can be invoked from the command line with options.

```
$ cd <FiveUI>
$ bin/runHeadless.sh -h
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
$ <FiveUI>/bin/runHeadless.sh basicRun.json -v -o reports/basic.out -r reports/basic
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
`reports/basic/summary.html`. Note that there are many errors
reported on this particular run because the rule sets used (particularly
the color guidelines) were not designed with `whitehouse.gov` in
mind.

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

## Building Headless From Source

----------------

### Install Maven

Headless is a [maven](http://maven.apache.org/) managed Java project. The
project's top-level directory is `<FiveUI>/headless`.  You'll need maven
installed on your system to continue.

 - On debian based linux systems: `sudo apt-get install maven`
 - On Mac OS X: Maven 3.x comes pre-installed (OS X 10.7 or later)

### Compile Headless

Once you have maven installed, you can compile the project. This will trigger
the dependencies to be downloaded and installed in your local maven repository
(for a quick intro to using maven, see [Maven in Five
Minutes](http://maven.apache.org/guides/getting-started/maven-in-five-minutes.html).

```
$ mvn compile
```

### Get Firefox E.S.R.

In order to use Headless you also need a copy of Firefox 17 (the current
extended support release or E.S.R.). More recent versions of Firefox may also work, but
they are not supported for use with FiveUI. Download and install Firefox 17
[here](http://www.mozilla.org/en-US/firefox/organizations/all.html). Note that
Firefox 17 can be installed along side existing alternate versions of firefox on
your system or isolated to your user directory by simply moving it's
installation directory.

Now that you've installed Firefox 17, it's time to tell Headless where the
binary lives. For example, when I install Firefox 17 to `~/myapps/Firefox17` on a
Mac OS X system, the firefox binary lives at

```
~/myapps/Firefox17/Contents/MacOS/firefox
```

Locate your firefox binary and remember it for the next step.

### Configuration

In the top-level `headless` directory, copy the configuration file
`programs.properties.example` to `programs.properties`

```
$ cp programs.properties.example programs.properties
```

Now, modify the first entry in `programs.properties`
to point to the location of your Firefox binary from step 3.

At this point, Headless is ready to run, see the Quickstart section above for
usage examples. The "batteries-included" JAR file has been built and lives at
`<FiveUI>/headless/target/HeadlessRunner-0.0.1-SNAPSHOT.one-jar.jar`. Use `java`
to execute the JAR file manually:

```
$ java -jar HeadlessRunner-0.0.1-SNAPSHOT.one-jar.jar ...
```

### Testing

To run the project's unit tests and verify that things are working as they should on
your installation and system, use the maven test target:

```
$ mvn test
```
