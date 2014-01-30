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

var fiveui = fiveui || {};

/**
 * <p>This module provides several useful jQuery plugins related to checking and reporting
 * UI consistency issues.</p>
 *
 * @namespace
 */
fiveui.jquery = fiveui.jquery || {};


/**
 * <p>Wrapper for the :contains('text') selector</p>
 *
 * @example
 * $('div').hasText('to remove').remove();
 *
 * @param {!string} text Text to select for
 * @returns {!Object} A modified jQuery object
 */
fiveui.jquery.hasText = function (text) {
  return this.filter(":contains('" + text + "')");
};

/**
 * <p>Filter for elements which lack of the given attribute. (see also
 * fiveui.jquery.attrFilter)</p>
 *
 * @example
 * $('&lt;table&gt;&lt;/table&gt;').noAttr('summary').each(function(idx, table) {
 *   // `table` is a table element that does not have a "summary"
 *   // attribute or that has a "summary" attribute that is empty.
 * });
 *
 * @param {!string} attribute name
 * @returns {!Object} a filtered jQuery object
 */
fiveui.jquery.noAttr = function (name) {
  return this.filter(function () {
    $attr = $.trim($(this).attr(name));
    return $attr == undefined || $attr == '';
  });
};


/**
 * <p>Filter for elements having no sub-elements matching the given selector.</p>
 *
 * Example: the following should contain no elements
 *
 * @example
 * // Returns an empty result because the &lt;div&gt; contains a &lt;p&gt; element.
 * $('&lt;div&gt;&lt;p&gt;hello&lt;/p&gt;&lt;/div&gt;').noSubElt('p')
 *
 * @param {!string} sel a jQuery selector
 * @param {!Object} A filtered jQuery object
 */
fiveui.jquery.noSubElt = function (sel) {
  return this.filter(function () {
    return $(this).find(sel).length == 0;
  });
};

/**
 * <p>Color checker plugin: filters for elements whose CSS color property is
 * not in the given set.</p>
 *
 * @description
 * <p>Note: This is a special case of fiveui.jquery.cssIsNot, i.e.
 * $(..).notColorSet(set) == $(..).cssIsNot("color", set, fiveui.color.colorToHex)
 * @see {fiveui.color.colorToHex}</p>
 *
 * @param {string[]} cset An array of allowable color strings
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
 * <p>General CSS property checker plugin</p>
 *
 * @description
 * <p>This plugin filters elements, keeping only elements whose CSS
 * property `prop` is a member of the given array `cset`. The names in
 * `cset` and the CSS values that are checked are transformed using the
 * optional given function `fn`. This may be used to normalize values
 * that the browser returns so they can be compared to values in
 * `cset`.</p>
 *
 * @example
 * var div = $('&lt;div style="visibility:hidden"&gt;&lt;/div&gt;')
 * div.cssIs('visibility', ['hidden', 'visible'])  // returns the same div
 *
 * @function
 *
 * @param {string} prop  CSS property selector
 * @param {string|string[]} set allowable values (either a string or an array
 *                          of strings)
 * @param {function(string):string} [fn] Function to apply to return values
 *                                       of $(this).css(prop), fn defaults to
 *                                       the identity function.
 * @returns {Object} jQuery object
 */
fiveui.jquery.cssIs = fiveui.jquery._makeCss(true);

/**
 * <p>Negated version of fiveui.jquery.cssIs</p>
 *
 * @description
 * <p>Behaves exactly like fiveui.jquery.cssIs - except that this
 * version excludes elements that have CSS properties and values that
 * match.</p>
 *
 * @example
 * var div = $('&lt;div style="visibility:hidden"&gt;&lt;/div&gt;')
 * div.cssIsNot('visibility', ['hidden', 'visible'])  // returns empty result
 *
 * @function
 *
 * @param {string} prop  CSS property selector
 * @param {string|string[]} set allowable values (either a string or an array
 *                          of strings)
 * @param {function(string):string} [fn] Function to apply to return values
 *                                       of $(this).css(prop), fn defaults to
 *                                       the identity function.
 * @returns {Object} jQuery object
 */
fiveui.jquery.cssIsNot = fiveui.jquery._makeCss(false);

/**
 * <p>General attribute filter</p>
 *
 * @description
 * <p>This plugin filters for elements whose attribute `a` pass the
 * predicate `fn`, which should take a string and return true or false.
 * Elements that don't have the attribute are automatically filtered
 * out.</p>
 *
 * @example
 * $('input').attrFilter('type', function(t) { return t === 'checkbox'; });
 *
 * @param {string} a element attribute name
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
 * <p>Filter out elements that do not contain the attribute
 * href=`href`.</p>
 *
 * @param {string} href the href to look for
 * @returns {Object} jQuery object
 */
fiveui.jquery.linksTo = function (href) {
  return this.filter('[href=' + href + ']');
}

/**
 * <p>Visually highlight elements in the jQuery object.</p>
 *
 * @description
 * <p>This plugin is useful mostly in the process of writing
 * guidelines, for example the guideline developer can load a page,
 * click the "Break" button on the FiveUI window, enter the browser's
 * Javascript console, and run:</p>
 *
 * @example > $5("p").hasText("foo").highlight();
 *
 * @param {string} [hint] Highlighted border color, defaults to "red"
 * @returns {!Object} A modified jQuery object
 */
fiveui.jquery.highlight = function (hint) {
  hint = hint || "red"; // Default is "red"
  return this.css("background-color", "rgba(255, 0, 0, 0.3)")
             .css("border-style", "solid")
             .css("border-color", hint);
}

/**
 * <p>Returns a list of css properties that element in the jQuery
 * object have.</p>
 *
 * @description
 * <p>This plugin is useful for analysis of a given page when
 * writing guielines. For example if the guideline developer wants to
 * know what font sizes are used on a loaded page, they can run from the
 * Javascript console:</p>
 *
 * @example > $5("*").propDist("font-size", true);
 *
 * @param {string} prop CSS property to be inspected
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
 *
 * @private
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
