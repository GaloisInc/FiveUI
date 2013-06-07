/*
 * Module     : firefox/test/test-main.js
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

const stWrapper = require("fiveui/firefox/storage");

var setup = function(fn){
  return function(test) {
    var storage = new stWrapper.StorageWrapper();
    storage.clear();
    fn(test);
  };
};

exports.test_newStorageWrapper = setup(function(test) {
  var storage = new stWrapper.StorageWrapper();
  var key = 'key';
  var val = 'val';
  storage.setItem(key, val);
  test.assertEqual(val, storage.getItem(key), 'wrong value');
});

exports.test_keys = setup(function(test) {
  var storage = new stWrapper.StorageWrapper();
  var key = 'key';
  var val = 'val';
  storage.setItem(key, val);
  test.assertEqual(key, storage.key(0), 'wrong key returned');
});

exports.test_length = setup(function(test) {
  var storage = new stWrapper.StorageWrapper();
  var x = 10;
  for (var i=0; i < x; ++i) {
    storage.setItem(i, i*i);
  }
  test.assertEqual(x,  storage.length, 'unexpected length');
});