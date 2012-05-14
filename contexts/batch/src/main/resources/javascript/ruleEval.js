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
var evaluate = function(ruleName, description, ruleStr) {
  var theRule = null;
  var results = [];

//  return [{ 'name': 'some rule',
//	       'descr': 'some description',
//	       'url': 'http:\/\/localhost:8000',
//	       'severity': '1'
//  }];
//};

  var report = function(name, node) {
    var prob = {
       'name': name,
       'descr': description,
       'url': window.location.href,
       'severity': 1
    };

    results.push(prob);
  };

  try {
    eval('var theRule = '+ruleStr);
    return theRule.toString();
  } catch (x) {
//    console.log('could not load rule: '+ruleStr);
//    console.log(x);
    return "Error: "+x;
  }

  var scope = {
    name : ruleName,
    description : description
  };

  if (theRule) {
    try {
      theRule.apply(scope);
    } catch (x) {
//      console.log('exception running rule: '+theRule.name);
//      console.log(x);
      return "Error: "+x;
    }
  }
  return results;
};
