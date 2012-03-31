/*
 * Module     : firefox/icon-script.js
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

(function() {
   var updateBadgeText = function(text) {
     $('#badge-text').text(text);
     $('#badge-text').show();
   };

   self.port.on('setEnabled', function(text) {
                  $('#disabled-img').hide();
                  $('#enabled-img').show();
                  if (text.length != 0) {
                    updateBadgeText(text);
                  } else {
                    $('#badge-text').hide();
                  }
                });
   self.port.on('setDisabled', function() {
                  $('#disabled-img').show();
                  $('#enabled-img').hide();
                  $('#badge-text').hide();
                });
 })();
