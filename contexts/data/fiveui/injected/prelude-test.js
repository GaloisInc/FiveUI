/*
 * Module     : injected/prelude-test.js
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

goog.require('fiveui.prelude.string');

goog.require('goog.asserts');
goog.require('goog.testing');
goog.require('goog.testing.MockStorage');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.TestCase.Test');
goog.require('goog.testing.TestRunner');


var runTests = function() {
  var gt = goog.testing;
  var ga = goog.asserts;




  var test = new Test('Prelude tests');
  test.setUp(function() { });

  var isStringTests = [
    ['isString: undefined', undefined, false],
    ['isString: null'     , null, false],
    ['isString: a string' , 'str', true]
  ];
  test.addTestSet(fiveui.isString, isStringTests);

  var trimTests = [
    //   name                     ,  input , oracle
    ['string.trim leading space'  , '  str', 'str'],
    ['string.trim on null'        , null, null],
    ['string.trim trailing space' , 'str   ', 'str'],
    ['string.trim trailing tab'   , 'str \t  ', 'str'],
    ['string.trim mixed & interior', '  this is a str \t  ', 'this is a str']
  ];
  test.addTestSet(fiveui.string.trim, trimTests);

  var capitalizeTests = [
    ['capitalize: empty string'               , '', false],
    ['capitalize: a space'                    , ' ', false],
    ['capitalize: whitespace'                 , '\t   ', false],
    ['capitalize: lowercase'                  , 'test', false],
    ['capitalize: N-token'                    , 'a test', false],
    ['capitalize: leading space'              , '  test', false],
    ['capitalize: 1-token - leading cap'      , 'Test', true],
    ['capitalize: N-token - leading cap'      , 'A test', true],
    ['capitalize: N-token - one cap'          , 'this is a Test', false],
    ['capitalize: N-token - one cap, punc'    , 'this, is a Test.', false],
    ['capitalize: N-token - all leading caps' , 'This Test', true],
    ['capitalize: all caps'                   , 'TEST', true],
    ['capitalize: N-token - all caps'         , 'A TEST', true]
  ];
  test.addTestSet(fiveui.word.capitalized, capitalizeTests);

  var allCapsTests = [
    ['allCaps: empty string'          , '', false],
    ['allCaps: a space'               , ' ', false],
    ['allCaps: whitespace'            , '\t   ', false],
    ['allCaps: lowercase'             , 'test', false],
    ['allCaps: N-token'               , 'a test', false],
    ['allCaps: leading space'         , '  test', false],
    ['allCaps: all caps'              , 'TEST', true],
    ['allCaps: N-token - all caps'    , 'A TEST', true],
    ['allCaps: 1-token - leading cap' , 'Test', false],
    ['allCaps: N-token - leading cap' , 'A test', false],
    ['allCaps: N-token - one cap      , punc'    , 'this, is a Test.', false],
    ['allCaps: N-token - all caps     , punc' , 'THIS, IS A TEST.', true]
  ];
  test.addTestSet(fiveui.word.allCaps, allCapsTests);

  var tokenizeTests = [
    ['tokenize: empty string'   , '', []],
    ['tokenize: a space'        , ' ', []],
    ['tokenize: whitespace'     , '\t   ', []],
    ['tokenize: lowercase'      , 'test', ['test']],
    ['tokenize: N-token'        , 'a test', ['a', 'test']],
    ['tokenize: N-token - more spaces', 'a   test', ['a', 'test']],
    ['tokenize: leading spaces' , '  test', ['test']],
    ['tokenize: trailing spaces', 'test  ', ['test']],
    ['tokenize: N-token'        , 'this is a test', ['this', 'is', 'a', 'test']],
    ['tokenize: N-token - punc' , 'this, is a test.', ['this,', 'is', 'a', 'test.']]
  ];

  //test.addTestSet(fiveui.string.tokens, tokenizeTests);
  goog.structs.forEach(tokenizeTests, function(spec) {
    var descr = spec[0];
    test.add(descr, function() {
      var result = fiveui.string.tokens(spec[1]);
      var oracle = spec[2];

      if(result.length != oracle.length) {
        goog.asserts.fail('Wrong length for: ' + descr);
      }

      for(var i=0; i<result.length; ++i) {
        goog.asserts.assert(result[i] == oracle[i],
          'Wrong value for: ' + descr);
      }
    });
  });

  test.run();
};
