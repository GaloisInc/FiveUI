# FiveUI

FiveUI is an extensible tool for evaluating HTML user interfaces
against sets of codified UI Guidelines.

## Installation and getting started

FiveUI is a basic browser extension with support for Firefox and
Google Chrome. If you're familiar with browser extensions, you can
quickly install FiveUI from the binaries:

 - Chrome: [fiveui.crx](http://galoisinc.github.com/FiveUI/binaries/fiveui.crx)
 - FireFox: [fiveui.xpi](http://galoisinc.github.com/FiveUI/binaries/fiveui.xpi)

The [Installation Guide](doc/manual_src/install.md) describes the
installation process for Firefox and Google Chrome.

After you've installed FiveUI, take a look at the [Getting Started
Guide](doc/manual_src/gettingStarted.md) to learn about Rule Sets and
setting URL Patterns to match web sites to codified guidelines.

## Building FiveUI

Most (if not all) the FiveUI dependencies are included in the
repository, so building FiveUI should be as simple as running:

    $ make

In the top-level FiveUI repository root.  On success, this will put
the generated extensions in the `contexts` directory.

### Chrome signing key

Note that you will need to first place a Chrome key in:

    contexts\chrome\fiveui.pem

before the chrome extension will build successfully.

## Running the tests

The testing target relies on:

 - a virtual framebuffer (xvfb)
 - Mozilla Firefox
 - Google Chrome
 - a recent Java runtime.
 - Apache Maven

If those are installed, then you should be able to run the test target
from the top-level repository root as well:

    $ make test

If that fails to work on your system, then please let us know so we
can make the testing process more robust.

### Testing a Mac OS X Installation ###

Getting a virtual framebuffer (xvfb) working on OS X is tough. You can still
run the tests manually by going to any of the maven project directories
(e.g. testrunner, rsTester, headless) and running:

    $ mvn test

# Repository layout

This is the repository for the FiveUI project.

```
binaries    : A directory holding the latest extension binaries
build       : Helper scripts for building and packaging FiveUI
contexts    : Implementation details for supported contexts (Firefox, Chrome, etc.)
doc         : FiveUI Documentation
exampleData : Sample web pages and rule sets for testing.
headless    : A headless run system for large scale automated ruleset testing.
profiles    : Sample user profiles for web browsers.  Used for testing.
ruleSets    : A growing collection of codified Guidelines
testrunner  : Browser-automation tests and testing infrastructure
tools       : Third-party build tools
```
