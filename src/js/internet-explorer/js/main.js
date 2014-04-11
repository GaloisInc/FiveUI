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

/*jshint devel:true, browser:true */
/*globals _:true, RSVP:true, Backbone:true, StorageWrapper:true, TabIds:true */
/*globals require, data */

_              = require('underscore');
RSVP           = require('rsvp');
Backbone       = require('backbone');
StorageWrapper = require('storage-wrapper').StorageWrapper;
TabIds         = require('tabIds').TabIds;

var fiveui = fiveui || {};

// fiveui.ajax = require('ajax');

(function() {

fiveui.firefox = fiveui.firefox || {};

var widgets = require("sdk/widget");
var tabs    = require("sdk/tabs");
var data    = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

fiveui.firefox.main = function() {
  var Settings = require('js/settings');
  var settings = new Settings(new StorageWrapper());
  var activeId = 0;

  // initialze the background functionality

  // // the FiveUI button:
  // var icon = widgets.Widget({
  //   id: "FiveUI-Icon",
  //   label: "FiveUI",
  //   contentURL: data.url('icons/fiveui-icon.html'),
  //   contentScriptFile: [
  //     data.url('jquery/jquery-1.8.3.js'),
  //     data.url('icons/fiveui-icon.js')
  //     ],
  //   onClick: function() {
  //     background.showUI(activeId);
  //   }
  // });

  var optionsButton = widgets.Widget(
    { id: "FiveUI-Options",
      label: "FiveUI",
      contentURL: data.url('icons/options-icon.html'),
      contentScriptFile: [
        data.url('jquery/jquery-1.8.3.js'),
        data.url('icons/options-icon.js')
      ]
    }
  );

  // /**
  //  * @param {?fiveui.TabState} tabState
  //  */
  // var updateWidget = function(tabState) {
  //   if(!tabState) {
  //     icon.port.emit('setDisabled');
  //     icon.width = 16;
  //   } else {
  //     var problems = getProblemCount(tabState);
  //     icon.port.emit('setEnabled', problems);
  //     if (!problems || problems == '0'){
  //       icon.width = 16;
  //     } else {
  //       icon.width = 24;
  //     }
  //   }
  // };

  /**
   * placeholder
   */
  var updateWidget = function() {};

  // store the contents of the injected css, so that we can inject it later
  var injectedCSS = [
    data.load('injected/injected.css'),
    data.load('css/ui.css') //,
    // data.load('jquery/bundled.css') //,
    // data.load('font-awesome/css/font-awesome.css')
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
    var firefoxScripts;

    if(inFrames) {
      firefoxScripts = [dataLoader('injected/platform-compute.js')];
    } else {
      firefoxScripts = [dataLoader('injected/platform-ui.js')];
    }

    // just scripts, css gets filtered out.
    var scripts = _.filter(_.flatten([firefoxScripts, inScripts]),
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

  var Background = require('js/background');
  var background = new Background(settings, updateWidget,
                                  loadScripts, dataLoader);

  var tabIds = new TabIds();

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
  _.each(tabs, handleNewTab);

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
    tabs.open(data.url('options.html'));
  };

  // set up a page-mod to be active on the options page, so that
  // page can communicate with the add-on:
  pageMod.PageMod(
    { include: data.url('options.html')
    , contentScriptWhen: 'end'
    , contentScriptFile:
        [ data.url('jquery/jquery-1.8.3.js')
        , data.url('jquery/jquery-ui-1.9.2.custom.js')
        , data.url('underscore.js')
        , data.url('rsvp.js')
        , data.url('backbone.js')
        , data.url('js/settings.js')
        , data.url('js/chan.js')
        , data.url('js/messenger.js')
        , data.url('js/options.js')
        , data.url('js/update-manager.js')
        , data.url('js/utils.js')
        , data.url('js/rules.js')
        , data.url('js/url-pat.js')
        , data.url('js/platform-ajax.js')
        , data.url('js/platform-options.js')
        ]
    , contentScript: 'fiveui.ie.options.init();'
    , onAttach: function (worker) {
        fiveui.Settings.manager(worker.port, settings);
      }
    });

  optionsButton.port.on('showOptions', showOptions);

  // // TODO: Line placed here for testing purposes.
  // function mkPort(/* flags... */) {
  //   var flags = arguments;
  //   var listeners = {};
  //   return {
  //     on: function on(eventType, fn) {
  //       var callbacks = listeners[eventType] || $.Callbacks.apply($, flags);
  //       callbacks.add(fn);
  //       listeners[eventType] = callbacks;
  //     },
  //     emit: function emit(eventType, data) {
  //       var callbacks = listeners[eventType];
  //       if (callbacks) {
  //         callbacks.fire(data);
  //       }
  //     }
  //   };
  // }
  // var port = mkPort();
  // fiveui.Settings.manager(port, settings);

  // // TODO: fake initialization for development purposes:
  // var rules = require('js/rules');
  // // var ruleSets  = new fiveui.RuleSets([], { url: msg });
  // // var ruleSet   = new rules.RuleSetModel({}, { url: msg });
  // // ruleSets.add(ruleSet);
  // rules.RuleSet.load(
  //   "http://10.0.2.2:8000/guidelines/wikipedia/wikipedia.json"
  // ).then(function success(obj) {
  //   console.log('got ruleset ', JSON.stringify(obj));
  //   obj.id = 1000;
  //   obj.patterns = ["http*://*.wikipedia.org/wiki/*"];
  //   settings.addRuleSet(obj);
  // }, function error(e) {
  //   console.log('error: ', e);
  // });

  // // TODO: hook up to a visible control
  // setTimeout(function() {
  //   console.log('showUI');
  //   background.showUI(activeId);
  // }, 1000);
};

exports.main = fiveui.firefox.main;

})();
