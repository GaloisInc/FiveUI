/*
 * Module     : messenger-test.js
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

goog.require('fiveui.Messenger');
goog.require('fiveui.Rule');
goog.require('fiveui.Chan');

var runTests = function() {
    var gt = goog.testing;
    var ga = goog.asserts;
    var test = new Test("Messenger Tests");
    test.setUp(function() {
         var chan1 = new fiveui.Chan();
         var chan2 = new fiveui.Chan();
         chan2.chan = chan1;
         chan1.chan = chan2;

         this.m1 = new fiveui.Messenger(chan1);
         this.m2 = new fiveui.Messenger(chan2);
       })
    .add('register/send simple',  function() {
           var got = [];
           this.m1.register('count', function(n){
                              got.push(n);
                            });
           this.m2.send('count', 1);
           this.m2.send('count', 2);

           ga.assert(got[0] == 1 && got[1] == 2, 'wrong values sent/received');
         })
    .add('test send callback', function() {
           var m1got = [];
           var m2got = [];
           this.m1.register('count', function(n, respond){
                              m1got.push(n);
                              respond(n);
                            });
           this.m2.send('count', 1, function(n) {
                          m2got.push(n);
                        } );
           ga.assert(m1got.length == m2got.length, 'Results should correspond.');
         })
    .add('Send with null data', function() {
           var m1got = [];
           this.m1.register('count', function(n, respond){
                              m1got.push(n);
                            });
           this.m2.send('count', null);
           ga.assert(m1got[0] === null, 'Null value was not recorded.');
         })
    .add('messenger can send rules', function() {
           var id = 42;
           var rName = 'testRule';
           var rDesc = 'see: http://test.description/';
           var rRule = 'function() { console.log("fail"); }';

           var ruleIn = new fiveui.Rule(id, rName, rDesc, rRule);

           var got = [];
           this.m1.register('rule', function(r){
                              got.push(r);
                            });
           this.m2.send('rule', ruleIn);
           ga.assert(got.length == 1, 'wrong number of things received');
           var ruleOut = got[0];

           ga.assert(ruleIn.id == ruleOut.id,
                     'wrong id');
           ga.assert(ruleIn.name == ruleOut.name,
                     'wrong name');
           ga.assert(ruleIn.description == ruleOut.description,
                     'wrong description');
           ga.assert(ruleIn.ruleStr == ruleOut.ruleStr,
                     'wrong rule text');
         })
    .tearDown(function() {
          console.log("tearing down");
        })
    .run();
};

