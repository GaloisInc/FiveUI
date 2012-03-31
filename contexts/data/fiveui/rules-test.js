/*
 * Module     : rules-test.js
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

goog.require('fiveui.Rule');
goog.require('fiveui.RuleSet');

goog.require('goog.asserts');
goog.require('goog.testing');
goog.require('goog.testing.MockStorage');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.TestCase.Test');
goog.require('goog.testing.TestRunner');

var runTests = function() {
  var gt = goog.testing;
  var ga = goog.asserts;

  var test = new Test('Rules and RuleSets');
  test.setUp(function() { })
    .add('Rule json round-trips', function() {
             var id = 42;
             var rName = 'testRule';
             var rDesc = 'see: http://test.description/';
             var rRule = 'function() { console.log("fail"); }';

             var ruleIn = new fiveui.Rule(id, rName, rDesc, rRule);

             var jsonRule = goog.json.serialize(ruleIn);

             var ruleOut = fiveui.Rule.fromJSON(goog.json.parse(jsonRule));
             ga.assert(ruleIn.id == ruleOut.id,
                       'wrong id');
             ga.assert(ruleIn.name == ruleOut.name,
                       'wrong name');
             ga.assert(ruleIn.description == ruleOut.description,
                       'wrong description');
             ga.assert(ruleIn.ruleStr == ruleOut.ruleStr,
                       'wrong rule text');
         })
    .add('RuleSet json round-trips, no deps', function() {
           var id = 42;
           var name = 'Rule Set';
           var desc = 'rule set description';

           var rule1 = new fiveui.Rule(42, 'r1', 'desc1', 'rule txt1');
           var rule2 = new fiveui.Rule(43, 'r2', 'desc2', 'rule txt2');

           var ruleSet = new fiveui.RuleSet(id, name, desc, [rule1, rule2]);

           var jsonSet = goog.json.serialize(ruleSet);

           var restoredSet = fiveui.RuleSet.fromJSON(id,
             goog.json.parse(jsonSet));
           ga.assert(ruleSet.id == restoredSet.id,
                    'wrong id');
           ga.assert(ruleSet.name == restoredSet.name,
                    'wrong name');
           ga.assert(ruleSet.description == restoredSet.description,
                    'wrong description');
           ga.assert(ruleSet.rules.length == restoredSet.rules.length,
                    'Wrong number of rules.');
         })
    .add('RuleSet json round-trips, with deps', function() {
           var id = 42;
           var name = 'Rule Set';
           var desc = 'rule set description';

           var rule1 = new fiveui.Rule(42, 'r1', 'desc1', 'rule txt1');
           var rule2 = new fiveui.Rule(43, 'r2', 'desc2', 'rule txt2');

           var deps = ['dep1.js', 'dep2.js'];
           var ruleSet = new fiveui.RuleSet(id, name, desc,
                                            [rule1, rule2], deps);

           var jsonSet = goog.json.serialize(ruleSet);

           var restoredSet = fiveui.RuleSet.fromJSON(id,
             goog.json.parse(jsonSet));
           ga.assert(ruleSet.id == restoredSet.id,
                     'wrong id');
           ga.assert(ruleSet.name == restoredSet.name,
                     'wrong name');
           ga.assert(ruleSet.description == restoredSet.description,
                     'wrong description');
           ga.assert(ruleSet.rules.length == restoredSet.rules.length,
                     'Wrong number of rules.');
           ga.assert(ruleSet.deps == restoredSet.deps,
                     'Dependencies were not restored properly.');
         })
    .run();
};
