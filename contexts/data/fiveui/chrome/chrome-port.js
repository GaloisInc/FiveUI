/*
 * Module     : chrome/chrome-port.js
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

if (typeof goog != 'undefined') {
  goog.provide('fiveui.ChromePort');
} else {
  var fiveui = fiveui || {};
}

/**
 * @constructor
 * @param {!{onMessage:Object,postMessage:function(*):void}} port The connection to manage.
 */
fiveui.ChromePort = function(port) {
  var events = {};

  this._port = port;
  this._events = events;

  this._port.onMessage.addListener(function(obj) {
    var evt = obj.type;
    var cb = events[evt];
    if(null != evt && null != cb) {
      cb(obj.payload);
    }
  });
};

/**
 * Listen to incoming messages.
 *
 * @param {!string} evt The event to listen for.
 * @param {!function(*)} cb The callback to invoke.
 * @return {void}
 */
fiveui.ChromePort.prototype.on = function(evt, cb) {
  this._events[evt] = cb;
};

/**
 * Send a message to the background.
 *
 * @param {!string} evt The event to fire.
 * @param {?Object} obj The data to associate with the event.
 * @return {void}
 */
fiveui.ChromePort.prototype.emit = function(evt, obj) {
  // console.log('chromeport.emit: '+evt);
  // console.log(obj);
  this._port.postMessage({ type: evt, payload: obj });
  // console.log('chromeport.emit: '+evt+' done');
};
