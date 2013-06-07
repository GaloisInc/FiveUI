Running Tests
=============

The Javascript unit tests for FiveUI can be run in one of two ways, manually in
your browser, or in a headless context (better for automation/continuous
integration).

In Browser
----------

Start a local webserver at the FiveUI project root ($FIVEUI_ROOT) and load
`contexts/data/tests/SpecRunner.html`.

Headless
--------

Install [phantomjs](http://phantomjs.org/) on your system.

  - Debian/Ubuntu: apt-get install phantomjs
  - Fedora: yum install phantomjs
  - Mac OSX: brew install phantomjs

Run:

  $ cd contexts/data
  $ phantomjs lib/phantomjs_jasmine/phantomjs_jasminexml_runner.js \
  tests/PhantomJSJasmineRunner.html tests/reports/

XML test reports will be generated in
`$FIVEUI_ROOT/contexts/data/tests/reports/`.
