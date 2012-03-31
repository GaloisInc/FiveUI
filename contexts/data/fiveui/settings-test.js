/*
 * Module     : settings-test.js
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

goog.require('fiveui.utils.getNewId');
goog.require('fiveui.RuleSet');
goog.require('fiveui.Settings');
goog.require('fiveui.UrlPat');


var runTests = function() {
    var gt = goog.testing;
    var ga = goog.asserts;
    var test = new Test("Settings Management");
    test.setUp(function() {
          console.log("setting up");
          this.mockStorage = new gt.MockStorage();
          this.settings = new fiveui.Settings(this.mockStorage);
       })
    .add('getNewId - []',  function() {
           ga.assert(fiveui.utils.getNewId([]) >= 0, 'getNewId returned < 0');
         })
    .add('getNewId - [0]',  function() {
           ga.assert(fiveui.utils.getNewId([0]) >= 0, 'getNewId returned < 0');
         })
    .add('getNewId - [2, 1]',  function() {
           ga.assert(fiveui.utils.getNewId([2, 1]) >= 0, 'getNewId returned < 0');
         })
    .add('remove - key',  function() {
           var key = 'key';
           var oracle = 'value';
           this.settings.set(key, oracle);

           this.settings.remUrlPat(key);
           var result = this.settings.get(key);
           ga.assert( !(result == null || result == undefined),
                      'url was not removed.');

           ga.assert( !(null == this.mockStorage[key] || undefined == this.mockStorage[key]),
                      'Raw storage still contains the key/value mapping');
         })
    .add('set/get round-trip',  function() {

           var key = 'key';
           var oracle = 'value';
           this.settings.set(key, oracle);

           var result = this.settings.get(key);
           ga.assert(result === oracle, 'did not retrieve expected value');
         })
    .add('addUrl round-trips', function() {
           // get a random rule id:
           var ruleId = Math.floor(Math.random()*101);

           var urlPat = 'http://.*';
           var urlId = this.settings.addUrl(urlPat, ruleId);
           var result = this.settings.getUrlPat(urlId);
           ga.assert(result.regex === urlPat,
                     'Wrong url regex was returned,  expected: "%s", got "%s"',
                     urlPat, result.regex);
           ga.assert(result.id === urlId,
                     'Wrong url id was returned,  expected: "%s", got "%s"',
                     urlId, result.id);
         })
    .add('checkUrl matches', function() {
           var newId = 13;
           this.settings.addUrl('http://.*', newId);
           ga.assert(this.settings.checkUrl('http://foo'),
                     'Any http:// url should match pattern.');
         })
    .add('checkUrl fails', function() {
           var newId = 13;
           this.settings.addUrl('http://.*', newId);
           ga.assert(! this.settings.checkUrl('file:///bar'),
                     'http:// pattern should not match file:/// urls..');
         })
    .add('remRuleSet basic test', function() {
           var jsonRS = goog.json.parse(
             '{"id":17,"name":"rs","description":"","rules":[]}');

           var rs = this.settings.addRuleSet(jsonRS);
           ga.assert(null != rs, 'adding a rule set failed');

           var rsCount1 = this.settings.getRuleSets().length;
           this.settings.remRuleSet(rs.id);
           var rsCount2 = this.settings.getRuleSets().length;

           ga.assert(rsCount1 == rsCount2 + 1,
                     'Rule set counts don\'t agree with add/rem operations');
           rs = this.settings.getRuleSet(rs.id);
           ga.assert(null == rs, 'removing rule set failed');

         })
    .add('remRuleSet - rules in use', function() {
           var jsonRS = goog.json.parse(
             '{"id":17,"name":"rs","description":"","rules":[]}');

           var rs = this.settings.addRuleSet(jsonRS);
           ga.assert(null != rs, 'adding a rule set failed');

           var urlPatId = this.settings.addUrl('*', rs.id);

           this.settings.remRuleSet(rs.id);
           rs = this.settings.getRuleSet(rs.id);
           ga.assert(null != rs,
                     'Should not be able to remove a rule set that is in use');
         })
    .tearDown(function() {
          console.log("tearing down");
        })
    .run();
};
