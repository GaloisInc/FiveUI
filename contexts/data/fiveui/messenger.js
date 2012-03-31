/*
 * Module     : messenger.js
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

goog.provide('fiveui.Messenger');
goog.provide('fiveui.Messenger.type');

goog.require('fiveui.utils.getNewId');
goog.require('goog.json');
goog.require('goog.structs');

/**
 * @constructor
 * @param {{on: function(!string, function(*)), emit: function(!string, *)}} channel The object containing on and emit.
 */
fiveui.Messenger = function(channel) {
  this.callbacks = {};
  this.handlers = {};

  this.channel = channel;
  this.channel.on(fiveui.Messenger.type, goog.bind(this._handler, this));
};

fiveui.Messenger.type = "fiveui_messaging_type";

/**
 * @param {!string} type The message type to send.
 * @param {?Object} data The payload (which can be null).
 * @param {?function(?Object)} callback An optional callback to be
 * invoked in response.
 */
fiveui.Messenger.prototype.send = function(type, data, callback){
  var id = null;
  if (callback) {
    id = this._newId();
    this.callbacks[id] = callback;
  }

  var payload = new fiveui.Messenger.Payload(false, type, data, id);
  this.channel.emit(fiveui.Messenger.type, payload);
};

/**
 * Register a handler for the specified message type.
 *
 * @param {!string} type The message type.
 * @param {!function(*)} callback The function to call when a message
 * of the specified type is received.
 */
fiveui.Messenger.prototype.register = function(type, callback) {
  if(null == this.handlers[type]) {
    this.handlers[type] = [];
  }
  this.handlers[type].push(callback);
};

fiveui.Messenger.prototype._handler = function(payload) {
  if (payload.isCallback && payload.id != null) {
    // this is a callback invocation, lookup the callback and invoke it:
    this.callbacks[payload.id](payload.data);

    // remove the callback:
    this._remove(payload.id);
  } else {
    // look up a handler and invoke it, passing in the response fn:
    var hs = this.handlers[payload.type];
    if (hs && hs.length > 0) {

      // this is a new incomming message.
      // create a response function:
      var respond = function(respData) {
        this.channel.emit(fiveui.Messenger.type,
               new fiveui.Messenger.Payload(true, payload.type, respData, payload.id));
      };

      // iterate over the handlers, invoking them with the response callback.
      goog.structs.forEach(hs, function(h) {
        h(payload.data, goog.bind(respond, this));
      }, this);
    }
  }
};

/**
 * Remove a callback from the map of callbacks.
 *
 * @param {!number} callbackId The id of the callback to remove.
 */
fiveui.Messenger.prototype._remove = function(callbackId) {
  delete this.callbacks[callbackId];
};

/**
 * @return {!number} The next unique id for a callback.
 */
fiveui.Messenger.prototype._newId = function() {
  var list = Object.keys(this.callbacks);
  return fiveui.utils.getNewId(list);
};

/**
 * @constructor
 * @param {!boolean} isCallback True if this is in response to a
 * message, false if this is requesting a callback.
 * @param {!string} type
 * @param {?Object} data
 * @param {!number} id Callback id to invoke, or in which this is a response.
 */
fiveui.Messenger.Payload = function(isCallback, type, data, id) {
  this.isCallback = isCallback;
  this.type = type;
  this.id = id;
  this.__defineGetter__('data', function() {
                          return goog.json.parse(this.rawData);
                        });
  this.__defineSetter__('data', function(obj){
                          this.rawData = goog.json.serialize(obj);
                        });
  this.data = data;
};
