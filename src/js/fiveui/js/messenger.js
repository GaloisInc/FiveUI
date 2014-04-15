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

var fiveui = fiveui || {};

(function() {

/**
 * @constructor
 * @param {{on: function(!string, function(*)), emit: function(!string, *)}}
 *    channel The object containing on and emit.
 */
fiveui.Messenger = function(channel) {
  this.callbacks = {};
  this.handlers = {};
  this.lastId = Math.floor(Math.random() * 10000000);

  this.channel = channel;
  this.channel.on(fiveui.Messenger.type, _.bind(this._handler, this));
};

fiveui.Messenger.type = "fiveui_messaging_type";

_.extend(fiveui.Messenger.prototype, {

  /**
   * @param {!string} type The message type to send.
   * @param {?Object} data The payload (which can be null).
   * @param {?function(?Object)} callback An optional callback to be
   * invoked in response.
   */
  send: function(type, data, callback){
    var id = null;
    if (callback) {
      id = this._newId();
      this.callbacks[id] = callback;
    }

    var payload = new fiveui.Messenger.Payload(false, type, data, id);
    this.channel.emit(fiveui.Messenger.type, payload);
  },

  /**
   * Register a handler for the specified message type.
   *
   * @param {!string} type The message type.
   * @param {!function(*)} callback The function to call when a message
   * of the specified type is received.
   */
  register: function(type, callback) {
    if(!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(callback);
  },

  _handler: function(payload) {
    var id = payload.id;
    if (payload.isCallback && (id || id === 0) && this.callbacks[id]) {
      // this is a callback invocation, lookup the callback and invoke it:
      this.callbacks[id](payload.data);

      // remove the callback:
      this._remove(id);
    } else if (!payload.isCallback || !id || id === 0) {
      // look up a handler and invoke it, passing in the response fn:
      var hs = this.handlers[payload.type];
      if (hs && hs.length > 0) {

        // this is a new incomming message.
        // create a response function:
        var respond = function(respData) {
          this.channel.emit(fiveui.Messenger.type,
                 new fiveui.Messenger.Payload(true, payload.type, respData, id));
        };

        // iterate over the handlers, invoking them with the response callback.
        _.each(hs, function(h) {
          h(payload.data, _.bind(respond, this));
        }, this);
      }
    }
  },

  /**
   * Remove a callback from the map of callbacks.
   *
   * @param {!number} callbackId The id of the callback to remove.
   */
  _remove: function(callbackId) {
    delete this.callbacks[callbackId];
  },

  /**
   * @return {!number} The next unique id for a callback.
   */
  _newId: function() {
    this.lastId += 1;
    return this.lastId;
  }

});

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
  this.type       = type;
  this.id         = id;
  this.rawData    = null;

  this.__defineGetter__('data', function() {
    if(_.isNull(this.rawData)) {
      return null;
    } else {
      return JSON.parse(this.rawData);
    }
  });

  this.__defineSetter__('data', function(obj) {
    if(_.isUndefined(obj) || _.isNull(obj)) {
      this.rawData = null;
    } else {
      this.rawData = JSON.stringify(obj);
    }
  });


  // use the setter defined above
  this.data = data;
};

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = fiveui.Messenger;
  }
  exports.Messenger = fiveui.Messenger;
}

})();
