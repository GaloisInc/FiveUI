/*
 * Module     : test-wrapper.js
 * Copyright  : (c) 2011-2012, Galois, Inc.
 *
 * Maintainer :
 * Stability  : Provisional
 * Portability: Portable
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.require('goog.asserts');
goog.require('goog.testing');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.TestRunner');
goog.require('goog.dom');

(function() {
   
  /**
   * Create a group of tests.
   *
   * @constructor
   * @param {string} name The name of this group of tests.
   */
  var Test = this.Test = function(name) {
    this.testCase = new goog.testing.TestCase(name);
    this.fixRecording();
  };

  /**
   * Add a named test to the group of tests.
   *
   * @param {string} name The name of the test.
   * @param {function()} fn The body of the test.
   * @param {object=} scope The optional scope to run the test within.
   * @returns {!Test} The test object, to allow for chaining.
   */
  Test.prototype.add = function(name, fn, scope) {
    var scope = scope || this.testCase;
    this.testCase.add(new goog.testing.TestCase.Test(name, fn, scope));
    return this;
  };

  /**
   * Add a collection of tests for a specific function.
   *
   * @param {function} fn The function to test.
   * @param {Array.<Array<String, *, *>>} tests A list of tripples:
   * test description, input, and oracle.
   */
  Test.prototype.addTestSet = function(fn, tests) {
    var invoke = function (spec) {
      var descr = spec[0];
      var input = spec[1];
      var oracle = spec[2];

      this.add(descr, function() {
                 goog.asserts.assert(fn(input) == oracle,
                                     'Wrong return val for: '+descr);
               });
    }.bind(this);
    goog.structs.forEach(tests, invoke);

    return this;
  };

  /**
   * Add a function to set up context for a group of tests.
   *
   * @param {function()} fn The function to set up context.
   * @return {!Test} The test group, to allow for chaining.
   */
  Test.prototype.setUp = function(fn) {
    this.testCase.setUp = fn;
    return this;
  };

  /**
   * Add a function to tear down context for this group of tests.
   *
   * @param {function()} fn The function to cleanup context.
   * @return {!Test} The test group, to allow for chaining.
   */
  Test.prototype.tearDown = function(fn) {
    this.testCase.tearDown = fn;
    return this;
  };
   
  Test.prototype.fixRecording = function () {
    var report = this.report = [];
    var tcproto = goog.testing.TestCase.prototype;
    var oldSucc = tcproto.doSuccess;
    tcproto.doSuccess = function(test) {
      report.push({'name': test.name, 'result': 'PASSED'});
      oldSucc.call(this, test);
    };
    
    var oldErr = tcproto.doError;
    tcproto.doError = function(test, opt_e) {
      report.push({'name': test.name, 'result': 'FAILED', 'err': opt_e});
      oldErr.call(this, test, opt_e);
    };
  };


  /**
   * Run the group of tests.
   *
   * @returns {*} Void, the tests will be run, and rendered to the screen.
   */
  Test.prototype.run = function() {
    var runner = new goog.testing.TestRunner();
    runner.initialize(this.testCase);
    runner.execute();

    var dom = goog.dom.getDocument();
    dom.report = this.getReport();
  };

  Test.prototype.getReport = function() {
    return this.report;
  };

})();
