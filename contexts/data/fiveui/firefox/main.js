/*
 * Module     : firefox/main.js
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

goog.provide('fiveui.firefox.main');

goog.require('fiveui.firefox.TabIds');
goog.require('fiveui.firefox.StorageWrapper');
goog.require('fiveui.Settings');
goog.require('fiveui.TabState');
goog.require('fiveui.Background');

goog.require('goog.structs');

const widgets = require("widget");
const tabs = require("tabs");
const data = require("self").data;
const pageMod = require("page-mod");

fiveui.firefox.main = function() {
  var settings = new fiveui.Settings(new fiveui.firefox.StorageWrapper());
  var activeId = 0;

  // initialze the background functionality

  // the FiveUI button:
  var icon = widgets.Widget({
    id: "FiveUI-Icon",
    label: "FiveUI",
    contentURL: data.url('fiveui/firefox/icon-content.html'),
    contentScriptFile: [
      data.url('lib/jquery/jquery.js'),
      data.url('fiveui/firefox/icon-script.js')
      ],
    onClick: function() {
      background.showUI(activeId);
    }
  });

  var optionsButton = widgets.Widget(
    { id: "FiveUI-Options",
      label: "FiveUI",
      contentURL: data.url('fiveui/firefox/options-icon.html'),
      contentScriptFile: [
        data.url('lib/jquery/jquery.js'),
        data.url('fiveui/firefox/options-script.js')
      ]
    }
  );

  /**
   * @param {?fiveui.TabState} tabState
   */
  var updateWidget = function(tabState) {
    if(null == tabState) {
      icon.port.emit('setDisabled');
      icon.width = 16;
    } else {
      var problems = getProblemCount(tabState);
      icon.port.emit('setEnabled', problems);
      if (problems == 0){
        icon.width = 16;
      } else {
        icon.width = 24;
      }
    }
  };

  // store the contents of the injected css, so that we can inject it later
  var injectedCSS = [
    data.load('target/injected.css'),
    data.load('target/bundled.css')
  ].join('\n');

  /**
   * Inject code and resources into the specified tab's web page.
   *
   * @param {!number} tabid The id of the tab to load scripts into.
   * @param {!Array.<string>} inScripts The list of scripts to load in
   *                                  order.
   * @param {!boolean} inFrames Whether or not to inject into iFrames.
   * @return {void}
   */
  var loadScripts = function(tabId, inScripts, inFrames, tab) {
    var firefoxScripts = [dataLoader('fiveui/firefox/bootstrap.js')];

    if(inFrames) {
      firefoxScripts.push(dataLoader('fiveui/firefox/firefox-injected-compute.js'));
    } else {
      firefoxScripts.push(dataLoader('fiveui/firefox/firefox-injected-ui.js'));
    }

    // just scripts, css gets filtered out.
    var scripts = goog.array.concat(firefoxScripts, inScripts).filter(
      function(script) {
        return script.search(/\.css$/i) == -1;
      });

    if (tab) {
      var worker = tab.attach({
        contentScriptFile: scripts
      });

      background.connect(tabId, worker.port, tab.url, !inFrames);
      worker.port.emit('injectCSS', injectedCSS);
    }
  };

  var dataLoader = function(path) {
    return data.url(path);
  };

  var background = new fiveui.Background(settings, updateWidget,
                                         loadScripts, dataLoader);

  var tabIds = new fiveui.firefox.TabIds();

  var handleNewTab = function(tab) {
    var tabId = tabIds.allocate();

    tab.on('activate', function() {
      background.activate(tabId);
      activeId = tabId;
    });

    tab.on('ready', function() {
      background.pageLoad(tabId, tab.url, tab);
    });

    tab.on('close', function() {
      tabIds.free(tabId);
      background.removeTab(tabId);
    });
  };

  // handle existing tabs
  goog.structs.forEach(tabs, handleNewTab);

  // manage new tab creation
  tabs.on('open', handleNewTab);

  /**
   * @param {!fiveui.TabState} tabstate
   * @return {void}
   */
  var getProblemCount = function(tabState){
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
    return text;
  };

  var showOptions = function() {
    // TODO does not make use of existing options tabs, if any are open:
    tabs.open(data.url('fiveui/options.html'));
  };

  // set up a page-mod to be active on the options page, so that
  // page can communicate with the add-on:
  pageMod.PageMod(
    { include: data.url('fiveui/options.html'),
      contentScriptWhen: 'end',
      contentScriptFile: [
        data.url("lib/codemirror/codemirror-compressed.js"),
        data.url("target/firefox-options.js")
      ],
      contentScript: "fiveui.firefox.options.init()",
      onAttach: function (worker) {
        fiveui.Settings.manager(worker.port, settings);
      }
    });

  optionsButton.port.on('showOptions', showOptions);
};

exports.main = fiveui.firefox.main;
