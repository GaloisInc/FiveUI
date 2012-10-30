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
goog.require('fiveui.prelude.word');
goog.require('fiveui.prelude.color');

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
    //   name             ,  input   , oracle
    ['isString: undefined', undefined, false],
    ['isString: null'     , null,      false],
    ['isString: a string' , 'str',     true]
  ];
  test.addTestSet(fiveui.isString, isStringTests);

  var trimTests = [
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

  // custom assertions for rule compiler
  goog.asserts.assert(typeof fiveui.color.colorCheck('', ['']) === 'function',
      'Wrong type for: fiveui.color.colorCheck( ... )');

  var colorToHexTests = [
    ['colorToHex: full white'         , '#000000', '#000000'],
    ['colorToHex: abreviated white 1' , '#0', '#000000'],
    ['colorToHex: abreviated white 2' , '#00', '#000000'],
    ['colorToHex: black'              , '#FFFFFF', '#FFFFFF'],
    ['colorToHex: abreviated black'   , '#FF', '#FFFFFF'],
    ['colorToHex: abreviated C7 grey' , '#C7', '#C7C7C7'],
    ['colorToHex: rgb(0, 0, 0)'       , 'rgb(0, 0, 0)', '#000000'],
    ['colorToHex: rgb(255, 255, 255)' , 'rgb(255, 255, 255)', '#FFFFFF'],
    ['colorToHex: rgb(222, 173, 190)' , 'rgb(222, 173, 190)', '#DEADBE'],
    ['colorToHex: rgba(255, 255, 255, 100)', 'rgba(255, 255, 255, 100)', '#FFFFFF'] // alpha is ignored
  ];
  test.addTestSet(fiveui.color.colorToHex, colorToHexTests);

  // fiveui.font API tests
  var getFontTests = [
    // CSS ID,        Family,  Weight,   Size
    ['#getFontTest1', 'Arial', 'normal', '12'],
    ['#getFontTest2', 'Arial sans-serif', 'normal', '12'],
    ['#getFontTest3', 'Arial', 'bold', '12'],
    ['#getFontTest4', 'Verdana', 'bold', '12']
  ];
  goog.structs.forEach(getFontTests, function (spec) {
    var desc = spec[0];
    test.add(desc, function() {
      var jElt = $5(spec[0]);
      var font = fiveui.font.getFont(jElt);
      if (font.family.indexOf(spec[1]) === -1) {
        goog.asserts.fail(spec[0]+': got wrong family: ' + font.family +
                          ' expected: ' + spec[1]);
      }
      if (font.weight.indexOf(spec[2]) === -1) {
        goog.asserts.fail(spec[0]+': got wrong weight: ' + font.weight);
      }
      if (font.size.indexOf(spec[3]) === -1) {
        goog.asserts.fail(spec[0]+': got wrong size: ' + font.size);
      }
    });
  });

  // fiveui.font.validate API tests
  var validateTests =
    // name, allow, font, oracle
    [ ['a:verdana-bold-10 f:verdana+sans-bold-10', {'Verdana':{'bold':[10]}},
        {'family':'Verdana sans-serif', 'weight':'bold', 'size':'10'},
        true ]
    , ['a:verdana-normal-12 f:verdana+sans-bold-10', {'Verdana':{'normal':[12]}},
        {'family':'Verdana sans-serif', 'weight':'bold', 'size':'10'},
        false ]
    , ['a:arial-normal-12 f:verdana+sans-bold-10', {'Arial':{'normal':[12]}},
        {'family':'Verdana sans-serif', 'weight':'bold', 'size':'10'},
        false ]
    , ['a:verdana-normal-10,12,14 f:verdana-normal-14', {'Verdana':{'normal':[10, 12, 14]}},
        {'family':'Verdana', 'weight':'normal', 'size':'14'},
        true ]
    , ['a:verdana-normal,bold-12 f:verdana-bold-12', {'Verdana':{'normal':[12], 'bold':[12]}},
        {'family':'Verdana', 'weight':'bold', 'size':'12'},
        true ]
    , ['a:verdana,arial-normal-12 f:arial-normal-12', {'Verdana':{'normal':[12]}, 'Arial':{'normal':[12]}},
        {'family':'Arial', 'weight':'normal', 'size':'12'},
        false ]
    ];
  goog.structs.forEach(validateTests, function (spec) {
    var desc = spec[0];
    test.add(desc, function () {
      if (fiveui.font.validate(spec[1], spec[2]) !== spec[3]) {
        goog.asserts.fail(spec[0] + 'Font did not validate');
      }
    });
  });

  test.run();
};
