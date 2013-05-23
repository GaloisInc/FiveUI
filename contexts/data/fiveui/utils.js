/*
 * Module     : utils.js
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

(function() {

fiveui.utils = fiveui.utils || {};

/**
 * Chooses a function based on the current browser.
 */
fiveui.utils.pick = function (mozFn, chrFn) {
  if (typeof chrome != 'undefined' ) {
    return chrFn;
  } else {
    return mozFn;
  }
};

/**
 * Create a browser-independent settings object.  This uses different
 * backing storage depending on the browser:
 *
 *  - Firefox: simple-storage
 *  - Chrome: localStorage
 *
 * @return {!fiveui.Settings} A settings object that will persist data
 * between browser invocations.
 */
// fiveui.utils.getSettings = fiveui.utils.pick(
//   function() {
// //    var ss = require('simple-storage');
//     var ss = {storage: {}}; // XXX hack, obviously.

//     var storageWrapper = new fiveui.utils.StorageWrapper(ss.storage);
//     return new fiveui.Settings(storageWrapper);
//   },
//   function() {
//     return new fiveui.Settings(localStorage);
//   });

/**
 * Get an ID by adding one to the max id in current use.
 *
 * @param {Array.<number>} list the list of ids that the new id must
 *                              not conflict with.
 * @return {!number} A unique id for UrlPats.
 */
fiveui.utils.getNewId = function(list) {
  // make sure we have a non-null, non-empty list:
  if (list === null || list.length == 0) {
    return 0;
  } else {
    return 1 + Math.max.apply(Math, list);
  }
};


/**
 * Remove c-style comments
 *
 * There's probably a faster way to do this.
 */
var removeComments = function(data) {

  var state     = 0;
  var toEOL     = 1;
  var toEOC     = 2;

  var sanitized = '';
  var len       = data.length;
  var s = 0, e = 0;

  for(; e < len; ++e) {
    switch(state) {
      case toEOL:
        if(data[e] == '\n') {
          state = 0;
        }
        break;

      case toEOC:
        if(data[e] == '*' && data[e+1] == '/') {
          state = 0;
          s     = e + 2;
          e     = e + 1;
        }
        break;

      default:
        if(data[e] == '/') {
          if(data[e+1] == '/') {
            sanitized = sanitized + data.substring(s,e);
            state     = toEOL;
            e         = e + 1;
          } else if(data[e+1] == '*') {
            sanitized = sanitized + data.substring(s,e);
            state     = toEOC;
            e         = e + 1;
          }
        }
        break;
    }
  }

  if(state == 0 && s < e) {
    sanitized = sanitized + data.substring(s,e);
  }

  return sanitized;
};


/**
 * Filter out comments, and other things that aren't appropriate in JSON.
 */
fiveui.utils.filterJSON = function(data, type) {
  if(type == 'json') {
    return removeComments(data);
  } else {
    return data;
  }
};

})();
