/*
 * Module     : chan.js
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

/**
 * @constructor
 */
fiveui.Chan = function() {
  this.fns = {};
};

_.extend(fiveui.Chan.prototype, {

  /**
   * @param {!string} type
   * @param {!function(*)} fn
   */
  on: function(type, fn) {
    this.fns[type] = fn;
  },

  /**
   * @param {!string} type
   * @param {*} data
   */
  emit: function(type, data) {
    this.chan.fns[type](data);
  }

});

})();
