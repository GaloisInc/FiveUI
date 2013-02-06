/*
 * Module     : injected/jquery-plugins.js
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
  goog.provide('fiveui.jquery');
}

/**
 * This module provides several useful jQuery plugins related to checking and reporting
 * UI consistency issues.
 *
 * @namespace
 */
fiveui.jquery = fiveui.jquery || {};


/**
 * Wrapper for the :contains('text') selector
 *
 * @param {!String} text Text to select for
 * @returns {!Object} A modified jQuery object
 */
fiveui.jquery.hasText = function (text) {
  return this.filter(":contains('" + text + "')")
}

/**
 * Color checker plugin: filters for elements whose CSS color property is
 * not in the given set.
 *
 * @description Note: This is a special case of fiveui.jquery.cssIsNot, i.e.
 * $(..).notColorSet(set) == $(..).cssIsNot("color", set, fiveui.color.colorToHex)
 * @see {fiveui.color.colorToHex}
 *
 * @param {String[]} cset A set of allowable color strings
 * @returns {!Object} A modified jQuery object
 */
fiveui.jquery.notColorSet = function (cset) {
  var allowable = {};
  for (var i = 0; i < cset.length; i += 1) { allowable[cset[i]] = true; } // array -> object
  return this.filter(function (index) {
    var color = fiveui.color.colorToHex($(this).css("color")); // .css("color") returns rgb(...)
    return !(color in allowable);
  });
}

/**
 * General CSS propetry checker plugin
 *
 * @description This plugin filters for elements whose CSS property `prop` is not a member
 * of the given array `cset`. The values checked are transformed using the
 * optional given function `fn`. This may be used to normalize values that the
 * browser returns so they can be compared to values in `cset`.
 *
 * @param {String} prop  CSS property selector
 * @param {String|String[]} set allowable values (either a string or an array of strings)
 * @param {function(String):String} [fn] Function to apply to return values of $(this).css(prop), fn defaults to the identity function.
 * @returns {Object} jQuery object
 */
fiveui.jquery.cssIsNot = function (prop, set, fn) {
  var allowable = {};
  fn = fn || function (x) { return x; }; // default is Id
  if (typeof set === "string") {
    allowable[fn(set)] = true;
  }
  else { // assume `set` is an array of strings
   for (var i = 0; i < set.length; i += 1) { allowable[fn(set[i])] = true; } // array -> object
  }
  return this.filter(function (index) {
    var cssProp = fn($(this).css(prop));
    return !(cssProp in allowable);
  });
}

fiveui.jquery.linksTo = function (href) {
  return this.filter(function (index) {
    var addr = $(this).attr("href");
    return (addr == href);
  });
}

/**
 * Visually highlight elements in the jQuery object.
 *
 * @description This plugin is useful mostly in the process of writing
 * guidelines, for example the guideline developer can load a page,
 * click the "Break" button on the FiveUI window, enter the browser's
 * Javascript console, and run:
 *
 * @example > $5("p").hasText("foo").highlight();
 *
 * @param {String} [hint] Highlighted border color, defaults to "red"
 * @returns {!Object} A modified jQuery object
 */
fiveui.jquery.highlight = function (hint) {
  hint = hint || "red"; // Default is "red"
  return this.css("background-color", "rgba(255, 0, 0, 0.3)")
             .css("border-style", "solid")
             .css("border-color", hint);
}

/**
 * Returns a list of css properties that element in the jQuery
 * object have.
 *
 * @description This plugin is useful for analysis of a given page when
 * writing guielines. For example if the guideline developer wants to
 * know what font sizes are used on a loaded page, they can run from the
 * Javascript console:
 *
 * @example > $5("*").propDist("font-size", true);
 *
 * @param {String} prop CSS property to be inspected
 * @param {boolean} [log] Boolean which enables console logging of the result; default is `false`.
 * @returns {Object} A frequence map { "property": frequency }
 */
fiveui.jquery.propDist = function (prop, log) {
  var res = {};
  log = log || false;
  this.each(function (i, elt) {
    var p = $(elt).css(prop);
    if (p in res) {
      res[p] += 1;
    }
    else {
      res[p] = 1;
    }
  });
  if (log) {
    console.log("Property distribution:");
    for (var p in res) {
      console.log("  " + p + ": " + res[p]);
    }
  }
  return res;
}

/**
 * Register the plugins. This adds methods to the jQuery.fn namespace.
 */
fiveui.jquery.init = function () {
  for (fn in fiveui.jquery) {
    f = fiveui.jquery[fn];
    if (jQuery.isFunction(f) && fn != "init") {
      jQuery.fn[fn] = fiveui.jquery[fn];
    }
  }
}
fiveui.jquery.init();
