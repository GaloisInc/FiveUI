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
the generated extensions in the top-level directory.

### Chrome signing key

In order to build the Google Chrome extension, you will need to first place a
signing key in the top level directory with the name `fiveui.pem`. It isn't
necessary to do this in order to build and use the Chrome extension locally
(see `Using the Chrome Extension Unpacked` below).

### Using the Chrome Extension Unpacked

See the
[Chrome Extentions FAQ](http://developer.chrome.com/extensions/faq.html#faq-dev-01)
on how to load an unpacked extension using "Developer mode". You should use the
`build/chrome/` directory for this.

## Running the tests

The `make test` target depends on:

 - a virtual framebuffer (xvfb-run)
 - Mozilla Firefox
 - a Java runtime
 - Apache Maven
 - PhanomJS

If those are installed, then you should be able to run the test target
from the top-level directory with:

    $ make test

If this fails to work on your system, please let us know so we
can make the testing process more robust.

### Testing without xvfb

Getting a virtual framebuffer (xvfb) working on OS X is tough. You can still
run the Maven tests manually by going to `src/batchtools` and running:

    $ mvn test

Beware that multiple browser instances will spawn in the process. The maven test
reports are by default written to the various
`*/target/surefire-reports/` directories.

# Repository layout

This is the repository for the FiveUI project.

    binaries    : A directory holding the latest extension binaries
    doc         : FiveUI Documentation
    exampleData : Sample web pages and rule sets for testing.
    mk          : Build system utilities
    profiles    : Sample user profiles for web browsers.  Used for testing.
    src         : Project source code
    tools       : Third-party build tools
