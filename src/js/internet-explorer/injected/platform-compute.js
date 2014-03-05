/*
 * Module     : internet-explorer/injected/platform-compute.js
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
 * TODO: This is the Firefox version - need to convert for IE
 *
 * @param {!string} css The css to inject.
 */
var addGlobalStyle = function(css) {
  var head = document.getElementsByTagName('head')[0]; // find head element, which should exist
  if (!head) {
    head = document.createElement('head');

    // XXX this is perhaps not reliable?
    document.body.appendChild(head);
  }

  var style = document.createElement('style');         // create <style> element
  style.type = 'text/css';

  if (style.styleSheet) {                              // for some cross-browser problem
    style.styleSheet.cssText = css;                    // attach CSS text to style elt
  } else {
    style.appendChild(document.createTextNode(css));   // attach CSS text to style elt
  }
  head.appendChild(style);                             // attach style element to head
};

/**
 * @return {{on: function(!string, function(*)), emit: function(!string, *)}}
 */
var obtainComputePort = function() {
  var port = window.port;
  var myPort = {
    on: function(eventType, callback) {
      port.on(eventType, function(json) {
        callback(JSON.parse(json));
      });
    },
    emit: function(eventType, data) {
      port.emit(eventType, JSON.stringify(data));
    }
  };
  myPort.on('injectCSS', addGlobalStyle);
  return myPort;
};
