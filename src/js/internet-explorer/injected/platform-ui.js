/*
 * Module     : internet-explorer/injected/platform-ui.js
 * Copyright  : (c) 2011-2014, Galois, Inc.
 *
 * Maintainer :
 * Stability  : Provisional
 * Portability: Not Portable (Internet Explorer only)
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
 * @return {{on: function(!string, function(*)), emit: function(!string, *)}}
 */
var obtainPort = function() {
  // TODO: This is a stub.
  return {
    on: function(eventName) {
      console.log('compute port handler: ', eventName);
    },
    emit: function() {
      console.log.apply(console, ['compute port: '].concat(arguments));
    }
  };
};


