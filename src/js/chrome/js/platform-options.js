/*
 * Module     : chrome/chrome-options.js
 * Copyright  : (c) 2011-2012, Galois, Inc.
 *
 * Maintainer :
 * Stability  : Provisional
 * Portability: Not Portable (Chrome Only)
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

fiveui.chrome         = fiveui.chrome         || {};
fiveui.chrome.options = fiveui.chrome.options || {};


_.extend(fiveui.chrome.options, {
  init: function() {
    var optionsChan = new fiveui.Chan();
    var storageChan = new fiveui.Chan();

    optionsChan.chan = storageChan;
    storageChan.chan = optionsChan;

    var settings = new fiveui.Settings(localStorage);

    fiveui.Settings.manager(storageChan, settings);
    fiveui.options.init(optionsChan);
  }
});

// run the init function when the page loads
jQuery(fiveui.chrome.options.init);

})();
