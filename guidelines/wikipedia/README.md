# Wikipedia Manual of Style Guidelines

## Developer Guide

The build and testing infrastructure for these guidelines is managed
by [Grunt](http://gruntjs.com), a build system based on Node.js.

### Installing & Using Grunt

Install grunt via npm (you can run this from anywhere):

    $ npm install -g grunt-cli

Install the project's dependencies with npm (from FiveUI/guidelines/wikipedia):

    $ npm install

Run the grunt tasks with `grunt`:

    $ grunt
    Running "jshint:gruntfile" (jshint) task
    >> 1 file lint free.
    
    Running "jshint:src_specs" (jshint) task
    >> 16 files lint free.
    
    Running "connect:server" (connect) task
    Started connect web server on http://localhost:9867
    
    Running "jasmine:guidelines" (jasmine) task
    Testing jasmine specs via phantom
    ..............
    14 specs in 0.004s.
    >> 0 failures
    
    Done, without errors.


