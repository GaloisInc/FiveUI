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
 * Example:
 *
 *     $('div').hasText('to remove').remove();
 *
 * @param {!String} text Text to select for
 * @returns {!Object} A modified jQuery object
 */
fiveui.jquery.hasText = function (text) {
  return this.filter(":contains('" + text + "')");
};

/**
 * Filter for elements which lack of the given attribute. (see also
 * fiveui.jquery.attrFilter)
 *
 * Example:
 *
 * This object will be non-empty:
 *
 *     $('<table></table>').noAttr('summary')
 *
 * @param {!String} attribute name
 * @returns {!Object} a filtered jQuery object
 */
fiveui.jquery.noAttr = function (name) {
  return this.filter(function () {
    $attr = $.trim($(this).attr(name));
    return $attr == undefined || $attr == '';
  });
};


/**
 * Filter for elements having no sub-elements matching the given selector.
 *
 * Example: the following should contain no elements
 *
 *     $('<div><p>hello</p></div>').noSubElt('p')
 *
 * @param {!String} sel a jQuery selector
 * @param {!Object} A filtered jQuery object
 */
fiveui.jquery.noSubElt = function (sel) {
  return this.filter(function () {
    return $(this).find(sel).length == 0;
  });
};

/**
 * Color checker plugin: filters for elements whose CSS color property is
 * not in the given set.
 *
 * @description Note: This is a special case of fiveui.jquery.cssIsNot, i.e.
 * $(..).notColorSet(set) == $(..).cssIsNot("color", set, fiveui.color.colorToHex)
 * @see {fiveui.color.colorToHex}
 *
 * @param {String[]} cset An array of allowable color strings
 * @returns {!Object} A modified jQuery object
 */
fiveui.jquery.notColorSet = function (cset) {
  var allowable = {};
  // input array -> object
  for (var i = 0; i < cset.length; i += 1) {
    allowable[fiveui.color.colorToHex(cset[i])] = true;
  }
  return this.filter(function (index) {
    var color = fiveui.color.colorToHexWithDefault($(this).css("color")); // .css("color") returns rgb(...)
    return !(color in allowable);
  });
};


fiveui.jquery._makeCss = function (pos) {
  return function (prop, set, fn) {
    var allowable = {};
    fn = fn || function (x) { return x; }; // default is Id
    if (typeof set === "string") {
      allowable[fn(set)] = true;
    }
    else { // assume `set` is an array of strings
     // array -> object
     for (var i = 0; i < set.length; i += 1) {
       allowable[fn(set[i])] = true;
     }
    }
    return this.filter(function (index) {
      var cssProp = fn($(this).css(prop));
      return pos ? (cssProp in allowable) : !(cssProp in allowable);
    });
  };
};

/**
 * General CSS propetry checker plugin
 *
 * @description This plugin filters for elements whose CSS property `prop` is not a member
 * of the given array `cset`. The values checked are transformed using the
 * optional given function `fn`. This may be used to normalize values that the
 * browser returns so they can be compared to values in `cset`.
 *
 * @param {String} prop  CSS property selector
 * @param {String|String[]} set allowable values (either a string or an array
 *                          of strings)
 * @param {function(String):String} [fn] Function to apply to return values
 *                                       of $(this).css(prop), fn defaults to
 *                                       the identity function.
 * @returns {Object} jQuery object
 */
fiveui.jquery.cssIs = fiveui.jquery._makeCss(true);
fiveui.jquery.cssIsNot = fiveui.jquery._makeCss(false);

/**
 * General attribute filter
 *
 * @description This plugin filters for elements whose attribute `a` pass
 * the predicate `fn`, which should take a string and return true or false.
 * Elements that don't have the attribute are automatically filtered out.
 *
 * @param {String} a element attribute name
 * @param {Function} fn a predicate to run on the element attribute
 * @returns {Object} jQuery object
 */
fiveui.jquery.attrFilter = function (a, fn) {
  return this.filter(function () {
    var x = $(this).attr(a);
    return x != undefined && fn(x);
  });
}

/**
 * Filter out elements that do not contain the attribute
 * href=`href`.
 *
 * @param {String} href the href to look for
 * @returns {Object} jQuery object
 */
fiveui.jquery.linksTo = function (href) {
  return this.filter('[href=' + href + ']');
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
