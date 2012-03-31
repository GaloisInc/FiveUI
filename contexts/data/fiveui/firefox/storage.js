/*
 * Module     : firefox/storage.js
 * Copyright  : (c) 2011-2012, Galois, Inc.
 *
 * Maintainer :
 * Stability  : Provisional
 * Portability: Not Portable (Firefox only)
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
  goog.provide('fiveui.firefox.StorageWrapper');
} else {
  var fiveui = fiveui || {};
  fiveui.firefox = fiveui.firefox || {};
}

const ss = require('simple-storage');

/**
 * A wraper around the Firefox Simple-Storage API to match the w3c Storage interface:
 * http://dev.w3.org/html5/webstorage/#storage-0
 */
fiveui.firefox.StorageWrapper = function() {
  this.__defineGetter__('length',
    function(){
      return Object.keys(ss.storage).length;
    });
};

fiveui.firefox.StorageWrapper.prototype.key = function(idx) {
  return Object.keys(ss.storage)[idx];
};

fiveui.firefox.StorageWrapper.prototype.getItem = function(key) {
  return ss.storage[key];
};

fiveui.firefox.StorageWrapper.prototype.setItem = function(key, value) {
  ss.storage[key] = value;
};

fiveui.firefox.StorageWrapper.prototype.removeItem = function(key) {
  var keys = Object.keys(ss.storage);
  for(var i=0; i<keys.length; ++i) {
    if(keys[i] == key) {
      keys.splice(i,1);
      delete ss.storage[key];
      return;
    }
  }
};

fiveui.firefox.StorageWrapper.prototype.clear = function() {
  var keys = Object.keys(ss.storage);
  for(var i=0; i<keys.length; ++i) {
    delete ss.storage[keys[i]];
  }
};

exports.StorageWrapper = fiveui.firefox.StorageWrapper;
