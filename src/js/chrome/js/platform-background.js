/*
 * Module     : chrome/background.js
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

fiveui.chrome = fiveui.chrome || {};

/**
 * The primary entry point for the FiveUI Chrome background page.
 */
fiveui.chrome.background = function() {

  /**
   * Inject code and resources into the specified tab's web page.
   *
   * @param {!number} tabid The id of the tab to load scripts into.
   * @param {!Array.<string>} inScripts The list of scripts to load in
   *                                  order.
   * @param {!boolean} inFrames Whether or not to inject into iFrames.
   * @return {void}
   */
  var loadScripts = function(tabid, inScripts, inFrames) {
    var chromeScripts = [dataLoader('js/platform-port.js')];
    if(inFrames) {
      chromeScripts.push(dataLoader('injected/platform-compute.js'));
    } else {
      chromeScripts.push(dataLoader('injected/platform-ui.js'));
    }
    var scripts = _.flatten([chromeScripts, inScripts]);

    var end = function() {};

    var loop = function() {
      var next = loop;
      if (scripts.length == 1) {
        next = end;
      }

      var script = scripts.shift();

      if (/css$/.test(script)) {
        chrome.tabs.insertCSS(tabid, { 'file' : script }, next);
      } else {
        chrome.tabs.executeScript(tabid, { 'file' : script }, next);
      }
    };

    loop();
  };

  /**
   * Set the current widget icon.
   *
   * @param {!string} iconPath The local path to the icon to use.
   * @return {void}
   */
  var setIcon = function(iconPath) {
    chrome.tabs.getSelected(null,
      function(tab) {
        chrome.browserAction.setIcon({
          path: iconPath,
          tabId: tab.id
        });
      });
  };

  /**
   * Change the text undearneath the fiveui icon.
   *
   * @param {!fiveui.TabState} tabState The tab state object to update.
   * @return {void}
   */
  var updateIconText = function(tabState) {
    var tabId = tabState.tabId;
    var probs = tabState.problems.length;
    var text = '';
    if (probs > 0) {
      if (probs > 99) {
        text = '99+';
      } else {
        text = probs.toString();
      }
    }
    chrome.browserAction.setBadgeText({ text: text, tabId: tabId });
  };

  var updateWidget = function(tabState) {
    if(null == tabState) {
      setIcon('images/fiveui-icon-disabled.png');
    } else {
      setIcon('images/fiveui-icon-enabled.png');
      updateIconText(tabState);
    }
  };

  // launch the generic background script
  var dataLoader = function (path) {
    return "data/"+path;
  };
  var settings = new fiveui.Settings(localStorage);
  background = new fiveui.Background(settings, updateWidget,
                                     loadScripts, dataLoader);

  // notify the generic background about a new content script connection.
  chrome.extension.onConnect.addListener(
    function(chPort) {
      var port = new fiveui.ChromePort(chPort);
      var tabId = chPort.sender.tab.id;
      var url = chPort.sender.tab.url;

      background.connect(tabId, port, url, chPort.name == 'ui');
    });

  // check page load events against the generic background
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
      background.pageLoad(tabId, tab.url);
    }
  });

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    background.removeTab(tabId);
  });

  // show the browser widget when the fiveui button is clicked.
  chrome.browserAction.onClicked.addListener(function(tab) {
    background.showUI(tab.id);
  });
};

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
fiveui.chrome.background();

})();
