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
  goog.provide('fiveui.jqueryPlugins');
}

/**
 * FiveUI jQuery plugins
 *
 * This module provides several useful jQuery plugins related to checking and reporting
 * UI consistency issues.
 *
 * @namespace
 */
fiveui.jqueryPlugins = fiveui.jqueryPlugins || {};

/**
 * Provide a short alias for fiveui.query along the lines of the jQuery $ alias
 */
var $5 = fiveui.query;

/**
 * Simple proof of concept plugin
 */
fiveui.jqueryPlugins.myPlugin = function () {
  return this.css("border-style", "solid").css("border-color", "red");
}

/**
 * Wrapper for the :contains('text') selector
 */
fiveui.jqueryPlugins.hasText = function (text) {
  return this.filter(":contains('" + text + "')")
}

/**
 * Color checker plugin
 *
 * Note: This is a special case of fiveui.jqueryPlugins.cssIsNot, i.e.
 *       $(..).notColorSet(set) == $(..).cssIsNot("color", set, fiveui.color.colorToHex)
 */
fiveui.jqueryPlugins.notColorSet = function (cset) {
  var allowable = {};
  for (i = 0; i < cset.length; i += 1) { allowable[cset[i]] = true; } // array -> object
  return this.filter(function (index) {
    var color = fiveui.color.colorToHex($(this).css("color")); // .css("color") returns rgb(...)
    return !(color in allowable);
  });
}

/*
 * General CSS propetry checker plugin
 *
 * @param{string}         prop  CSS property selector
 * @param{string, array}  set   allowable values (either a string or an array of strings)
 * @param{function}       fn    (optional) Function to apply to return values of $(this).css(prop)
 *                              fn defaults to the identity function.
 *
 * @return{jQuery}              jQuery object
 */
fiveui.jqueryPlugins.cssIsNot = function (prop, set, fn) {
  var allowable = {};
  fn = fn || function (x) { return x; }; // default is Id

  if (typeof set == "string") {
    allowable[fn(set)] = true;
  }
  else { // assume `set` is an array of strings
    for (i = 0; i < set.length; i += 1) { allowable[fn(set[i])] = true; } // array -> object
  }
  return this.filter(function (index) {
    var cssProp = fn($(this).css(prop));
    return !(cssProp in allowable);
  });
}

/*
 * Send a report to FiveUI reporting a problem with each element in the
 * jQuery object.
 *
 * @param{string} msg Message to report
 */
fiveui.jqueryPlugins.report = function (msg) {
  this.each(function (i, elt) {
    report(msg, elt); // NOTE: this doesn't work. report() is not in scope here!
  });
}

/*
 * Visually highlight elements in the jQuery object (mostly for debugging purposes).
 *
 * @param{string} borderHint Highlighted border color, defaults to "red"
 */
fiveui.jqueryPlugins.highlight = function (borderHint) {
  borderHint = borderHint || "red"; // Default is "red"
  return this.css("background-color", "rgba(255, 0, 0, 0.3)")
             .css("border-style", "solid")
             .css("border-color", borderHint);
}

/*
 * Returns a list of css properties that element in the jQuery
 * object have. This is useful for analysis of a given page when
 * writing guielines.
 *
 * @param{string} prop CSS property to be inspected
 *
 * @return{object} A frequence map { "property": frequency }
 */
fiveui.jqueryPlugins.propDist = function (prop) {
  res = {};
  this.each(function (i, elt) {
    p = $(elt).css(prop)
    if (p in res) {
      res[p] += 1;
    }
    else {
      res[p] = 1;
    }
  });
  console.log("Distribution of property: " + prop);
  for (p in res) {
    console.log("  " + p + ": " + res[p]);
  }
  return null;
}


// register the plugins
fiveui.jqueryPlugins.init = function () {
  for (fn in fiveui.jqueryPlugins) {
    f = fiveui.jqueryPlugins[fn];
    if (jQuery.isFunction(f) && fn != "init") {
      jQuery.fn[fn] = fiveui.jqueryPlugins[fn];
    }
  }
}
fiveui.jqueryPlugins.init();

/* :vim makecmd="make -C ../../../" */
