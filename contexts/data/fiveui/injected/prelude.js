/*
 * Module     : injected/prelude.js
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

if (typeof goog != 'undefined') {
  goog.provide('fiveui.prelude.string');
  goog.provide('fiveui.prelude.word');
  goog.provide('fiveui.prelude.color');
  goog.provide('fiveui.prelude.font');

  goog.require('goog.json');
}

/**
 * The FiveUI Prelude.
 *
 * The prelude provides a collection of utilities to ease the
 * conversion from human-readable guideline documents (such as the Web
 * Accessibilty Guidelines, or Apple Human Interface Guidelines) to
 * executable Rules.
 *
 * @namespace
 */
fiveui = fiveui || {};

/** DOM Traversal ************************************************************/

/**
 * fiveui.query is a wrapper around the jQuery $() function.
 *
 * fiveui.query recurses into iframes and frames, whereas $(...) stops
 * when it encounters internal frames.
 *
 * Generally, rules written for FiveUI will want to cover the entire
 * visible page, and as such, should use fiveui.query; however, $(...)
 * is available if recursing into frames is not necessary.
 *
 * @param {string} sel The jQuery selector string.
 * @param {?Object} context Optional: The context to run the query within.  This is often a DOM object/tree.
 * @return {Object} A jQuery object, suitable for chaining.
 */
fiveui.query = function (sel, context) {
  var ctx = context || document;
  var $results = jQuery(sel, ctx);

  jQuery('iframe, frame', ctx).each(
    function(idx, elt) {
      if (elt.contentDocument) {
        $results = $results.add(fiveui.query(sel, elt.contentDocument));
      }
    }
  );

  return $results.not('#uic-top').filter(':visible');
};

/** Utilities ****************************************************************/

/**
 * Determine if a given value is a string or not.
 *
 * @param {?*} o A value of some type that may or may not be defined.
 * @returns {!boolean} true if the object is a defined, non-null string, false
 * otherwise.
 */
fiveui.isString = function(o) {
  return typeof o == 'string';
};


/**
 * String-specific utilities.
 *
 * @namespace
 */
fiveui.string = {};

/**
 * Non-destructively removes whitespace from the start and end of a
 * string.
 *
 * @param {?string} s The string to trim of whitespace.
 * @return {?string} The input string, without leading or trailing
 * whitespace. Returns null if you gave it null.
 */
fiveui.string.trim = function(s) {
  if (s) {
    return s.replace(/^\s+|\s+$/g,"");
  }
  return s;
};

/**
 * Tokenize a string on whitespace.
 *
 * @param {!string} s The string to tokenize.
 * @return {!Array.<!string>} An array of substrings.
 */
fiveui.string.tokens = function (s) {
  var posLength = function(ar) {
    return 1 <= ar.length;
  };

  return s.split(/\s/).filter(posLength);
};


/**
 * A simple heuristic check to see if a string is in Title Case.
 *
 * This does not perform an exhaustive gramatical analysis, and as
 * such, it is prone to generating false-positives in some cases.  In
 * particular, it only has a short 'white list' of articles,
 * conjections, and prepositions that are allowed to be in lower case.
 *
 * @param {!string} str The string to check.
 * @returns {!boolean} true if the string is in title case, false if
 * it is not.
 */
fiveui.string.isTitleCase = function(str) {
  var exception = function(str) {
    var exceptions = [ 'a', 'an', 'the' // articles
                     , 'and', 'but', 'for', 'not', 'or' // conjuctions
                     , 'in', 'on' // short prepositions
                     , 'to' ];
    return exceptions.indexOf(str.toLowerCase()) != -1;
  };

  if ( !fiveui.word.capitalized(str[0]) ) {
    return false;
  }

  var tokens = fiveui.string.tokens(str);
  for (var i=1; i < tokens.length; ++i) {
    if (!exception(tokens[i]) && !fiveui.word.capitalized(tokens[i])) {
      return false;
    }
  }
  return true;
};

/**
 * Utilities for word-specific processing.
 *
 * The fiveui.word namespace focuses on tools for working directly
 * with words in the sense of natural languages, rather than general
 * strings (as is the case for the fiveui.string namespace).
 *
 * @namespace
 */
fiveui.word = {};

/**
 * Check to see if a sting begins with a capital letter.
 *
 * @param {!string} word The string to check for capitalization.
 * @returns {!boolean}
 */
fiveui.word.capitalized = function(word) {
  return fiveui.isString(word) && word.search(/^[A-Z]/, word) >= 0;
};

/**
 * Check to see if a sting consists entirely of capital letters.
 * @param {!string} word The string to check for capitalization.
 * @returns {!boolean}
 */
fiveui.word.allCaps = function(word) {
  return fiveui.isString(word)
    && word.search(/^\w/, word) >= 0
    && (word == word.toUpperCase());
};


/**
 * Utilities for dealing with color.
 *
 * @namespace
 */
fiveui.color = {};

/* Color check compiler.
 * @param {!string} selector The HTML element selector to check.
 * @param {!array}  colorSet An array of strings containing the HEX values of
 *                           colors in the desired color set.
 * @returns {!function}      A function which checks the rule
 */
fiveui.color.colorCheck = function (selector, colorSet) {
  var allowable, i, fnStr, forEachFuncStr;
  allowable = {};
  for (i = 0; i < colorSet.length; i += 1) { allowable[colorSet[i]] = true; }
  forEachFuncStr  = 'function (j, elt) {\n'
                  + '  var allowable = ' + goog.json.serialize(allowable) + ';\n'
                  + '  var color = fiveui.color.colorToHex($(elt).css("color"));\n'
                  + '  if (!(color in allowable)) {\n'
                  + '    report("Disallowed color " + color + " in element matching " + ' + goog.json.serialize(selector) + ', $(elt));\n'
                  + '  }\n'
                  + '}\n';
  fnStr = 'function () { fiveui.query("' + selector + '").each(' + forEachFuncStr + '); }';
  return eval('false||'+fnStr); // the `false||` trick is required for eval to parse a
                                // function expression ?!?
};

/* covert rgb(a) colors to hex */
fiveui.color.colorToHex = function(color) {
    var have, need;
    if (color.substr(0, 1) === '#') {
      if (color.length === 7) {
        return color;
      }
      else { // deal with #0 or #F7 cases
        var have = color.length - 1;
        var haveDigits = color.substr(1, color.length);
        var need = 6 - have;
        var reps = Math.ceil(need / have);
        for (i = 0, stdColor = color; i < reps; i += 1) { stdColor += haveDigits; }
        return stdColor.substr(0, 7);
      }
    }

    var digits = /rgb(a)?\((\d+), (\d+), (\d+)/.exec(color);

    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);

    var rgb = blue | (green << 8) | (red << 16);
    if (rgb === 0) {
      return '#000000'; // normalized form
    }
    else {
      return '#' + rgb.toString(16).toUpperCase();
    }
};


/**
 * Utilities for dealing with font.
 *
 * @namespace
 */
fiveui.font = {};


