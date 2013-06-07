/*
 * Module     : selenium/selenium-injected-compute.js
 * Copyright  : (c) 2011-2012, Galois, Inc.
 *
 * Maintainer :
 * Stability  : Provisional
 * Portability: Not Portable (Selenium-specific)
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

// Init FiveUI, if necessary:
if (typeof fiveui == 'undefined') {
  fiveui = {};
}

/**
 * @return {{on: function(!string, function(*)), emit: function(!string, *)}}
 */
var obtainComputePort = function() {
  fiveui.selPort = new fiveui.SeleniumPort();
  return fiveui.selPort;
};

/**
 * @constructor
 */
fiveui.SeleniumPort = function() {
  this._events = {};
  this._messages = [];
};

/**
 * Listen to incoming messages.
 *
 * @param {!string} evt The event to listen for.
 * @param {!function(*)} cb The callback to invoke.
 * @return {void}
 */
fiveui.SeleniumPort.prototype.on = function(evt, cb) {
  this._events[evt] = cb;
};

/**
 * Send a message to the background.
 *
 * @param {!string} evt The event to fire.
 * @param {?Object} obj The data to associate with the event.
 * @return {void}
 */
fiveui.SeleniumPort.prototype.emit = function(evt, obj) {
  this._messages.push({ type: evt, payload: obj });
};

/**
 * Send a message to the injected script.
 *
 * @param {!string} evt The event to fire.
 * @param {?Object} obj The data to associate with the event.
 */
fiveui.SeleniumPort.prototype.send = function(evt, obj) {
  if (this._events[evt]) {
    this._events[evt](obj);
  }
};

/**
 * Check to see if any messages have been generated.
 *
 * @param {[String]} type Message type to filter for (default: no filter)
 * @return {!Array.<{string, Object}>}
 */
fiveui.SeleniumPort.prototype.query = function (type) {
  var msgs = [];
  var i;

  if (!type) {
    msgs = this._messages;
  }
  else {
    for (i=0; i < this._messages.length; i += 1) {
      console.log(this._messages);
      if (this._messages[i].type === type) {
        msgs.push(this._messages[i]);
      }
    }
  }

  // flush the read messages:
  this._messages = [];

  // return the new messages to the backend:
  return msgs;
};
