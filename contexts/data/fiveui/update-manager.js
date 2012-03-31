/*
 * Module     : update-manager.js
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

goog.provide('fiveui.UpdateManager');

goog.require('fiveui.Messenger');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.structs');

fiveui.UpdateManager = function(msg) {
  var manager = this;

  goog.events.EventTarget.call(this);

  // fired when the rule set gets updated
  msg.register('updateRuleSet', function(newRuleSet) {
    goog.events.fireListeners(manager, 'updateRuleSet.' + newRuleSet.id,
        false, newRuleSet);

    // update the associated url patterns
    msg.send('getRuleSetPatIds', function(patIds) {
      goog.structs.forEach(patIds, function(patId) {
        goog.events.dispatchEvent(manager, 'updateUrlPat.' + patId);
      });
    });
  });

  // fired when the url pat gets removed
  msg.register('remUrlPat', function(id) {
    var evt = 'remUrlPat.' + id;
    goog.events.dispatchEvent(manager, evt);
    goog.events.removeAll(manager, evt);
  });
};
goog.inherits(fiveui.UpdateManager, goog.events.EventTarget);
