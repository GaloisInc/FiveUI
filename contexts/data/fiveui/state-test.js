/*
 * Module     : state-test.js
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

goog.require('goog.testing');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.TestCase.Test');
goog.require('goog.testing.TestRunner');
goog.require('goog.asserts');
goog.require('goog.testing.MockStorage');

goog.require('fiveui.State');
goog.require('fiveui.TabState');
goog.require('fiveui.WinState');

function runTests() {
  var gt = goog.testing;
  var ga = goog.asserts;

  var testTabStateEq = function(a, b) {
    if (null == a || null == b) {
      return false;
    }
    return testWinLocEq(a.winState, b.winState);
  };

  var testWinLocEq = function(a, b){
    return a.x == b.x &&
           a.y == b.y &&
           a.width == b.width &&
           a.height == b.height;
  };

  var test = new Test("Tab state tests");
  test.setUp(function() {
               this.mockStorage = new gt.MockStorage();
               this.state = new fiveui.State(this.mockStorage);
             })
    .add('retrieve tab that does not exist', function() {
           var testId = 42;
           ga.assert(!this.mockStorage[testId], 'Test id existed -- test is invalid.');
           var tabState = this.state.getTabState(testId);
           ga.assert( !tabState, 'getTabState('+testId+') returned: '+tabState);
         })
    .add('store/retrieve window location', function() {
           var testId = 42;
           var winState = new fiveui.WinState(0,1,10,15);
           var tabState = new fiveui.TabState(testId, winState, null);
           var oracle = new fiveui.TabState(testId, new fiveui.WinState(0,1,10,15));

           this.state.setTabState(tabState);
           var result = this.state.getTabState(testId);
           ga.assert(testTabStateEq(result, oracle),
                     'Wrong tab state was returned');
         })
    .run();
}
