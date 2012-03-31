/**
 * Module     : ruleEval.js
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
/* Evaluate a rule.
 *
 * @param {!string} ruleStr The string representation of the rule (as
 * a JavaScript Object literal).
 * @return {?Array<Problem>} Empty if no problems were found or a string
 * with an error if an exception occurred.
 */
var evaluate = function(ruleStr) {
  var theRule = null;
  var results = [];

  var report = function(name, node) {
    var prob = {
       name: name,
       descr: rule.description,
       url: window.location.href,
       severity: 1
    };

    results.push(prob);
  };

  try {
    theRule = eval('('+ruleStr+')');
  } catch (x) {
    console.log('could not load rule: '+ruleStr);
    console.log(x);
    return "Error: "+x;
  }

  var scope = {
    name : theRule.name,
    description : theRule.description
  };

  if (theRule.rule) {
    try {
      theRule.rule.apply(scope);
    } catch (x) {
      console.log('exception running rule: '+theRule.name);
      console.log(x);
      return "Error: "+x;
    }
  }
  return results;
};
