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
the generated extensions in the repository root.

### Chrome signing key

Note that you will need to first place a Chrome key in:

    chrome\fiveui.pem

before the chrome extension will build successfully.


