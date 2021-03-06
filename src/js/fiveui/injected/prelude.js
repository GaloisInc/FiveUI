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

/*global $5: true, JSON: true */

/**
 * <p>The FiveUI Prelude.</p>
 *
 * @description
 * <p>The prelude provides a collection of utilities to ease the
 * conversion from human-readable guideline documents (such as the Web
 * Accessibilty Guidelines, or Apple Human Interface Guidelines) to
 * executable Rules.</p>
 *
 * @namespace
 */
var fiveui = fiveui || {};

/**
 * A global namespace for statistics collection.
 *
 * @namespace
 */
fiveui.stats = fiveui.stats || {};
/** @global */
fiveui.stats.numElts = 0;
/** @const */
fiveui.stats.zero = { numRules: 0, start: 0, end: 0, numElts: 0 };

/** DOM Traversal ************************************************************/

/**
 * <p>fiveui.query is a wrapper around the jQuery $() function.</p>
 *
 * @description
 * <p>In most respects fiveui.query behaves just like jQuery. But it
 * recurses into iframes and frames, whereas $(...) stops
 * when it encounters internal frames. fiveui.query also skips over
 * page elements that are added by FiveUI.</p>
 *
 * <p>Generally, rules written for FiveUI will want to cover the entire
 * visible page, and as such, should use fiveui.query; however, $(...)
 * is available if recursing into frames is not necessary.</p>
 *
 * <p>$5() is an alias for fiveui.query.</p>
 *
 * @alias $5
 *
 * @param {string} sel The jQuery selector string.
 * @param {Object} [context] The context to run the query within. This is often a DOM object/tree.
 * @returns {Object} A jQuery object, suitable for chaining.
 */
fiveui.query = function (sel, context) {
  var ctx = context || document;
  var $results = jQuery(sel, ctx);

  jQuery('iframe, frame', ctx)
  .filter(function(idx, frame) { return sameOrigin(frame); })
  .each(
    function(idx, elt) {
      var $tempResults;
      if (elt.contentDocument) {
        try {
          $tempResults = fiveui.query(sel, elt.contentDocument);
        } catch (e) {
          console.log("encoutered a non-cooperative iframe/frame at " + $(elt).attr("src"));
          console.log(e.toString());
          $tempResults = [];
        }

        $results = $results.add($tempResults);
      }
    }
  );

  $filteredResults = $results.not('.fiveui')
                             .not('.fiveui *')
                             .filter(':visible');

  // update global stats
  fiveui.stats.numElts += $filteredResults.length;

  return $filteredResults;

  // Frames are considered to be from the same origin if their location
  // hosts, ports, and schemes are the same.
  function sameOrigin(frame) {
    var src    = frame.src;
    var origin = window.location.origin;
    return src.indexOf(origin) === 0 && src.charAt(origin.length) !== ':';
  }
};

/**
 * <p>Provide a short alias for fiveui.query along the lines of the
 * jQuery $ alias.</p>
 *
 * @example $5("p").hasText("foo") -> jQuery object containing paragraph elements
 * containing the text "foo"
 *
 * @function
 * @const
 *
 */
var $5 = fiveui.query;

/** Utilities ****************************************************************/

/**
 * <p>Determine if a given value is a string or not.</p>
 *
 * @param {*} [o] A value of some type that may or may not be defined.
 * @returns {!boolean} true if the object is a defined, non-null string, false
 * otherwise.
 */
fiveui.isString = function(o) {
  return typeof o == 'string';
};


/**
 * <p>String-specific utilities.</p>
 *
 * @namespace
 */
fiveui.string = {};

/**
 * <p>Non-destructively removes whitespace from the start and end of a
 * string.</p>
 *
 * @param {string} [s] The string to trim of whitespace.
 * @returns {string} The input string, without leading or trailing
 * whitespace. Returns null if you gave it null.
 */
fiveui.string.trim = function(s) {
  if (s) {
    return s.replace(/^\s+|\s+$/g,"");
  }
  return s;
};

/**
 * <p>Tokenize a string on whitespace.</p>
 *
 * @example
 * var tokens = fiveui.string.tokens('Under the Olive Tree');
 * tokens //> [ 'Under', 'the', 'Olive', 'Tree' ]
 *
 * @param {!string} s The string to tokenize.
 * @returns {string[]>} An array of substrings.
 */
fiveui.string.tokens = function (s) {
  var posLength = function(ar) {
    return 1 <= ar.length;
  };

  return s.split(/\s/).filter(posLength);
};


/**
 * <p>A simple heuristic check to see if a string is in Title Case.</p>
 *
 * @description
 * <p>This does not perform an exhaustive grammatical analysis, and as
 * such, it is prone to generating false-positives in some cases.  In
 * particular, it only has a short 'white list' of articles,
 * conjections, and prepositions that are allowed to be in lower
 * case.</p>
 *
 * @example
 * fiveui.string.isTitleCase('Under the Olive Tree') === true
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
 * <p>Utilities for word-specific processing.</p>
 *
 * @description
 * <p>The fiveui.word namespace focuses on tools for working directly
 * with words in the sense of natural languages, rather than general
 * strings (as is the case for the fiveui.string namespace).</p>
 *
 * @namespace
 */
fiveui.word = {};

/**
 * <p>Check to see if a sting begins with a capital letter.</p>
 *
 * @param {!string} word The string to check for capitalization.
 * @returns {!boolean}
 */
fiveui.word.capitalized = function(word) {
  return fiveui.isString(word) && word.search(/^[A-Z]/, word) >= 0;
};

/**
 * <p>Check to see if a sting consists entirely of capital letters.</p>
 *
 * @param {!string} word The string to check for capitalization.
 * @returns {!boolean}
 */
fiveui.word.allCaps = function(word) {
  return fiveui.isString(word)
    && word.search(/^\w/, word) >= 0
    && (word == word.toUpperCase());
};


/**
 * <p>Utilities for dealing with color.</p>
 *
 * @namespace
 */
fiveui.color = {};

/**
 * <p>Color check compiler. It is recommended to use the jQuery plugin
 * fiveui.jquery.cssIsNot instead.</p>
 *
 * @param {!string} selector The HTML element selector to check.
 * @param {string[]}  colorSet An array of strings containing the HEX values of
 *                           colors in the desired color set.
 * @returns {!function()}      A function which checks the rule
 * @see fiveui.jquery.cssIsNot
 */
fiveui.color.colorCheck = function (selector, colorSet) {
  var allowable, i, fnStr, forEachFuncStr;
  allowable = {};
  for (i = 0; i < colorSet.length; i += 1) { allowable[colorSet[i]] = true; }

  return function colorCheck() {
    fiveui.query(selector).each(function(j, elt) {
      var $elt  = $(elt);
      var color = fiveui.color.colorToHex($elt.css("color"));
      if (!(color in allowable)) {
        report("Disallowed color " + color + " in element matching " + selector, $elt);
      }
    });
  };
};

/**
 * @private
 */
componentToHex = function (c) {
  var hex = c.toString(16).toUpperCase();
  return hex.length == 1 ? "0" + hex : hex;
};

/**
 * @description
 * <p>Given a hexadecimal color in short form, returns the corresponding
 * long form.</p>
 *
 * @example
 * shortHexToHex('#fff') === '#ffffff'
 *
 * @private
 */
shortHexToHex = function (color) {
  var have = color.length - 1;
  var haveDigits = color.substr(1, color.length);
  var need = 6 - have;
  var reps = Math.ceil(need / have);
  var i, stdColor;
  for (i = 0, stdColor = color; i < reps; i += 1) { stdColor += haveDigits; }
  return stdColor.substr(0, 7);
};

/**
 * @private
 */
equalRGBA = function (c1, c2) {
  return (c1.r == c2.r &&
          c1.g == c2.g &&
          c1.b == c2.b &&
          c1.a == c2.a);
};

/**
 * <p>Convert RGB values to Hex.</p>
 *
 * @description
 * <p>Accepts three arguments representing red, green, and blue color
 * components.  Returns a hexadecimal representation of the
 * corresponding color.</p>
 *
 * @example
 * fiveui.color.rgbToHex(255, 255, 255) === '#FFFFFF'
 *
 * @param {!number} red
 * @param {!number} green
 * @param {!number} blue
 * @return {!string}
 */
fiveui.color.rgbToHex = function (r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

/**
 * <p>Convert a 3-byte hex value to base-10 RGB</p>
 *
 * @description
 * <p>Given a hexadecimal color code as a string, returns an object with
 * `r`, `g`, and `b` properties that give the red, green, and blue
 * components of the color.</p>
 *
 * @example
 * fiveui.color.hexToRGB('#ffffff') //> { r: 255, g: 255, b: 255 }
 * fiveui.color.hexToRGB('ffffff') //> { r: 255, g: 255, b: 255 }
 *
 * @param {!string} color
 * @return {color}
 */
fiveui.color.hexToRGB = function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * <p>Covert rgb colors to hex and abreviated hex colors to their full 3 byte
 * and uppercase normal form.</p>
 *
 * @description
 * <p>Throws an error if the given color cannot be parsed.</p>
 *
 * @example
 * fiveui.color.colorToHex('#ffffff') === "#FFFFFF"
 * fiveui.color.colorToHex('#fff') === "#FFFFFF"
 * fiveui.color.colorToHex('rgb(255, 255, 255)') === "#FFFFFF"
 * fiveui.color.colorToHex('rgba(255, 255, 255)') === "#FFFFFF"
 *
 * @param {!string} color The color string to convert. This should be either of the form rgb(...) or #...
 * @returns {!string} The color string in #XXXXXX form
 * @throws {ParseError} if the rgb color string cannot be parsed
 */
fiveui.color.colorToHex = function(color) {
    if (color.substr(0, 1) === '#') {
      if (color.length === 7) {
        return color.toUpperCase();
      }
      else { // deal with #0 or #F7 cases
        return shortHexToHex(color).toUpperCase();
      }
    }
    else if (color.substr(0,3) === 'rgb') {
      var c = fiveui.color.colorToRGB(color);
      return fiveui.color.rgbToHex(c.r, c.g, c.b);
    }
    else {
      throw new Error('could not convert color string "' + color + '"');
    }
};

/**
 * <p>Attemps to convert a given string to a hexadecimal color code.</p>
 *
 * @description
 * <p>Behaves like fiveui.color.colorToHex - except that in case there
 * are parse errors during the conversion, i.e. color values that are
 * not understood, the input is returned unchanged.</p>
 *
 * @param {!string} color The color string to convert. This should be either of the form rgb(...) or #...
 * @returns {!string} The color string in #XXXXXX form
 */
fiveui.color.colorToHexWithDefault = function (color) {
  try {
    return fiveui.color.colorToHex(color);
  }
  catch (e) {
    console.log(e);
    return color;
  }
};

/**
 * <p>Covert color to RGB color object.</p>
 *
 * @example
 * fiveui.color.colorToRGB('#ffffff') //> { r: 255, g: 255, b: 255 }
 * fiveui.color.colorToRGB('#fff') //> { r: 255, g: 255, b: 255 }
 * fiveui.color.colorToRGB('rgb(255, 255, 255)') //> { r: 255, g: 255, b: 255 }
 * fiveui.color.colorToRGB('rgba(255, 255, 255)') //> { r: 255, g: 255, b: 255 }
 *
 * @param {!string} color The color string to convert. This should be either of the form rgb(...) or #...
 * @returns {!Object} An RGB color object with attributes: r, g, b, a
 * @throws {ParseError} if the rgb color string cannot be parsed
 */
fiveui.color.colorToRGB = function(color) {

  if (color.substr(0, 1) === '#') {
    return fiveui.color.hexToRGB(fiveui.color.colorToHex(color));
  }

  var digits = /rgba?\((\d+), (\d+), (\d+)(, ([-+]?[0-9]*\.?[0-9]+))?/.exec(color);
  if (!digits) {
    throw new Error('could not parse color string: "' + color + '"');
  }

  var alpha = 1;
  if (digits[5]) {
    alpha = parseFloat(digits[5]);
  }

  return { r: parseInt(digits[1]),
           g: parseInt(digits[2]),
           b: parseInt(digits[3]),
           a: alpha };
};


/**
 * <p>Calculate the relative {@link
 * http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
 * luminance} of an sRGB color.</p>
 *
 * @description
 * <p>This function does not account for alpha values that are not 1.
 * That is, it assumes that the incomming color is fully opaque, or
 * displayed on a white background.</p>
 *
 * @example
 * fiveui.color.luminance({ r: 255, g: 255, b: 255 }) === 1
 *
 * @param {!Object} An RGB color object with attributes: r, g, b, a
 * @returns {!doubl} A measure of the relative luminance according to
 * the WCAG 2.0 specification.
 *
 */
fiveui.color.luminance = function(color) {
  var toSRGB = function(c) {
    return c/255;
  };

  var toLumComponent = function(c) {
    if (c <= 0.03928) {
      return c / 12.92;
    } else {
      return Math.pow((c + 0.055) / 1.055, 2.4);
    }
  };

  return 0.2126 * toLumComponent(toSRGB(color.r))
       + 0.7152 * toLumComponent(toSRGB(color.g))
       + 0.0722 * toLumComponent(toSRGB(color.b));
};

/**
 * <p>Compute the contrast ratio, according to {@link
 * http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
 * WCAG 2.0}</p>
 *
 * @example
 * var color_a = fiveui.color.colorToRGB('#98BC4B');
 * var color_b = fiveui.color.colorToRGB('#88E2CA');
 *
 * var contrast = fiveui.color.contrast(
 *     fiveui.color.luminance(color_a),
 *     fiveui.color.luminance(color_b)
 * );
 *
 * contrast === 1.4307674054056414
 *
 * @param {!double} lum1 The relative luminance of the first color.
 * @param {!double} lum2 The relative luminance of the second color.
 * @returns {!double} The contrast ratio.
 */
fiveui.color.contrast = function(lum1, lum2) {
  if (lum1 > lum2) {
    return (lum1 + 0.05) / (lum2 + 0.05);
  } else {
    return (lum2 + 0.05) / (lum1 + 0.05);
  }
};

/**
 * <p>Computationally determine the actual displayed background color for
 * an object.  This accounts for parent colors that may appear when
 * a bg color is unspecified, or fully transparent.</p>
 *
 * @description
 * <p>It does not account for elements that are shifted out of their
 * parent containers.</p>
 *
 * @example
 * var sidebar = $('div.sidebar');
 * fiveui.color.findBGColor(sidebar) //> { r: 136, g: 226, b: 202 }
 *
 * @param {!Object} A jquery object.
 * @returns {color} an RGB color object. (no alpha - this does not
 * return transparent colors)
 */
fiveui.color.findBGColor = function(obj) {
  var fc = fiveui.color;
  var real = fc.colorToRGB(obj.css('background-color'));
  var none = fc.colorToRGB('rgba(0, 0, 0, 0)');
  var i;

  if (real.a != 1) {

    // find parents with a non-default bg color:
    var parents = obj.parents().filter(
      function() {
        var color = fc.colorToRGB($(this).css('background-color'));
        return !equalRGBA(color, none);
      }).map(
        function(i) {
          return fc.colorToRGB($(this).css('background-color'));
        });

    // push a white element onto the end of parents
    parents.push({ r: 255, g: 255, b: 255, a: 1});

    // takeWhile alpha != 1
    var colors = [];
    for (i=0; i < parents.length; i++) {
      colors.push(parents[i]);
      if (parents[i].a == 1) {
        break;
      }
    }

    // Compose the colors and return. Note that fc.alphaCombine is
    // neither commutative, nor associative, so we need to be carefull
    // of the order in which parent colors are combined.
    var res = real;
    for (i=0; i < colors.length; i++) {
      res = fc.alphaCombine(res, colors[i]);
    }
    return res;
  }
  else {
    return real;
  }
};

/**
 * <p>Combines two colors, accounting for alpha values less than 1.</p>
 *
 * @description
 * <p>Both colors must specify an alpha value in addition to red, green,
 * and blue components.  Colors are given as objects with `r`, `g`, `b`,
 * and `a` properties.</p>
 *
 * @example
 * var combined = fiveui.color.alphaCombine(
 *     { r: 152, g: 188, b: 75,  a: 0.8 },
 *     { r: 136, g: 226, b: 202, a: 0.8 }
 * );
 *
 * combined //> { r: 143, g: 186, b: 92, a: 0.96 }
 *
 * @param {color} top The color "on top"
 * @param {color} bot The color "on bottom"
 * @return {color} the composite RGBA color.
 */
fiveui.color.alphaCombine = function(top, bot) {
  var result = {  };
  result.r = Math.floor(top.r * top.a + bot.r * bot.a * (1 - top.a));
  result.g = Math.floor(top.g * top.a + bot.g * bot.a * (1 - top.a));
  result.b = Math.floor(top.b * top.a + bot.b * bot.a * (1 - top.a));

  result.a = top.a + bot.a * (1 - top.a);

  return result;
};

/**
 * <p>Utilities for dealing with fonts.</p>
 *
 * @namespace
 */
fiveui.font = {};

/**
 * <p>Extracts the font-family, font-size (in px, as an int), and font-weight
 * from a jQuery object.</p>
 *
 * @param {!Object} jElt A jQuery object to extract font info from
 * @returns {!Object} An object with properties: 'family', 'size', and 'weight'
 * @throws {ParseError} if the font size cannot be parsed
 */
fiveui.font.getFont = function (jElt) {
  var res   = {};
  var size  = jElt.css('font-size');
  if(size.length > 0) {
    var psize = /(\d+)/.exec(size);
    if(!psize) {
      throw {
        name: 'ParseError',
        message: 'Could not parse font size: ' + jElt.css('font-size')
      };
    }
    else {
      res.size = psize;
    }
  } else {
    res.size = '';
  }
  res.family =  jElt.css('font-family');
  res.weight =  jElt.css('font-weight').toString();
  // normalize reporting of the following two synonyms
  if (res.weight === '400') { res.weight = 'normal'; }
  if (res.weight === '700') { res.weight = 'bold'; }
  return res;
};

/**
 * <p>Validate a font property object extracted using fiveui.font.getFont().</p>
 *
 * @description
 * <p>The `allow` parameter should be an object whose top level property names are
 * (partial) font family names (e.g. 'Verdana'). For each font family name
 * there should be an object whose properties are font weights (e.g. 'bold'),
 * and for each font weight there should be an array of allowable sizes
 * (e.g. [10, 11, 12]).</p>
 *
 * <p>The `font` parameter should be an object containing 'family', 'weight', and
 * 'size' properties. These are returned by @see
 * fiveui.font.getFont().</p>
 *
 * @example > allow = { 'Verdana': { 'bold': [10, 12], 'normal': [10, 12]}};
 * > font = { family: 'Verdana Arial sans-serif', size: "10", weight: "normal" };
 * > fiveui.font.validate(allow, font) -> true
 *
 * @param {!Object} allow Object containing allowable font sets (see description and examples)
 * @param {!Object} font object to check
 * @param font.family A partial font family name (e.g. 'Verdana')
 * @param font.weight A font weight (e.g. 'bold')
 * @param font.size   A font size string (e.g. "10")
 * @returns {!boolean}
 */
fiveui.font.validate = function (allow, font) {
  var x;
  for (x in allow) { // loop over allowed font family keywords
    if (font.family.indexOf(x) !== -1) { break; }
    else { return false; }
  }
  return (font.weight in allow[x] &&  allow[x][font.weight].indexOf(parseInt(font.size)) != -1);
};

/**
 * Functions outside the fiveui namespace that can be called during rule
 * evaluation.
 */

/**
 * <p>Report a problem to FiveUI.</p>
 *
 * @description
 * <p>report is used to indicate that a guideline has been violated.
 * Invocations should provide a short (1-line) string description of
 * the problem, as well as a reference to the element of the DOM that
 * violated the guideline.</p>
 *
 * <p>The second parameter is not strictly required, but we strongly
 * suggest providing a node if at all possible, as that is used to
 * visually highlight the problematic areas of the DOM at runtime.
 * Debugging a guideline violation becomes much more difficult without
 * the visual indicator.</p>
 *
 * @function
 * @param {!string} desc The description of the problem to report.
 * @param {?Node} node The node in the DOM that caused the problem.
 * @name report
 */
