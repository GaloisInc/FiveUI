/*
 * Module     : background.js
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

var State = fiveui.State || require('js/state').State;

/**
 * @constructor
 *
 * @param {!function(!string):!string} dataLoader
 */
var Background = fiveui.Background = function(settings, updateWidget, loadScripts, dataLoader) {
  // Initialize a storage mechanism for FiveUI.
  // Chrome utilizes HTML5's localStorage API as a backend, but other
  // contexts (such as Firefox) would supply a different backend
  // storage to the settings constructor.
  //
  // The data in settings is persisted across executions of the
  // context and the plugin.  It is used for long-term storage of user
  // preferences, rule sets, and similarly long-lived FiveUI settings.
  this.settings = settings;

  // the state of all managed tabs
  this.state = new State(settings);

  // how we communicate with the status widget
  this.updateWidget = updateWidget;

  // how we signal the browser to load a content script
  this.loadScripts = loadScripts;

  this.dataLoader = dataLoader;
};

/**
 * NOTE: As compute nodes get injected first, there's a chance that if send
 * ReportProblem or ReportStats too early, the uiPort element of the tabState
 * might not be setup yet.  This will cause some strange problems, and we should
 * consider reversing the order that the injection happens in.
 */
Background.prototype._registerComputeListeners = function(port, tabState){
    var bg = this;
    port.on('ReportProblem', function(request) {
      var problem = fiveui.Problem.fromJSON(request);
      if(tabState.addProblem(problem) && tabState.uiPort) {
        bg.updateWidget(tabState);
        tabState.uiPort.emit('ShowProblem', problem);
      }
    });
    port.on('ReportStats', function (stats) {
      if (tabState.addStats(stats) && tabState.uiPort) {
        bg.updateWidget(tabState);
        tabState.uiPort.emit('ShowStats', stats);
      }
    });
};

Background.prototype._registerUiListeners = function(port, tabState){
    var bg = this;
    port.on('Position', function(request) {
      tabState.winState.x = request.left;
      tabState.winState.y = request.top;
    });
    port.on('Size', function(request) {
      tabState.winState.width = request.width;
      tabState.winState.height = request.height;
    });
    port.on('CloseUI', function(request) {
      tabState.winState.closed = true;
    });
    port.on('ClearProblems', function(request) {
      tabState.clearProblems();
      bg.updateWidget(tabState);
    });
    port.on('MaskRules', function(request) {
      _.each(tabState.computePorts, function(cp) {
        cp.emit('MaskRules', null);
      });
    });
    port.on('UnmaskRules', function(request) {
      _.each(tabState.computePorts, function(cp) {
        cp.emit('UnmaskRules', null);
      });
    });
};

/**
 * Accept a new connection from a content script.
 */
Background.prototype.connect = function(tabId, port, url, isUiPort) {

  var tabState = this.state.acquireTabState(tabId);

  if (isUiPort) {
    tabState.uiPort = port;
    this._registerUiListeners(port, tabState);
    port.emit('RestoreUI', tabState.toEmit());
    this.updateWidget(tabState);
  } else {
    tabState.computePorts.push(port);
    this._registerComputeListeners(port, tabState);

    // get the rule set and send it down to the injected page:
    var ruleSet = this.settings.checkUrl(url);
    if (!ruleSet) {
      console.err('could not find url pattern for tab.url, but one was strongly expected');
    } else {
      port.emit('SetRules', _.pick(ruleSet, ["dependencies", "rules"]));
    }
  }
};

/**
 * @param {!number} tabId
 * @param {!string} url
 * @param {*} data
 */
Background.prototype.pageLoad = function(tabId, url, data) {
  var ruleSet = this.settings.checkUrl(url);

  if (!ruleSet) {
    this.updateWidget(null);
  } else {
    var tabState = this.state.acquireTabState(tabId);

    // clear out old ports
    tabState.uiPort       = null;
    tabState.computePorts = [];

    this.updateWidget(tabState);

    var computeScripts =
      [ this.dataLoader('underscore.js')
      , this.dataLoader('jquery/jquery-1.8.3.js')
      , this.dataLoader('md5.js')
      , this.dataLoader('injected/prelude.js')
      , this.dataLoader('injected/jquery-plugins.js')
      , this.dataLoader('injected/compute.js')
      ];

    this.loadScripts(tabId, computeScripts, true, data);

    var uiScripts =
        [ this.dataLoader('underscore.js')
        , this.dataLoader('font-awesome/css/font-awesome.css')
        , this.dataLoader('css/ui.css')
        , this.dataLoader('jquery/bundled.css')
        , this.dataLoader('jquery/jquery-1.8.3.js')
        , this.dataLoader('jquery/jquery-ui-1.9.2.custom.js')
        , this.dataLoader('injected/injected.css')
        , this.dataLoader('injected/prelude.js')
        , this.dataLoader('injected/ui.js')
        , this.dataLoader('injected/jquery-plugins.js')
        ];
    this.loadScripts(tabId, uiScripts, false, data);
  }
};

/**
 * Updates the widget according to the tab state of the specified tab.
 *
 * @param {!number} tabId Id of the tab that is currently active, and
 *                        thus, dictating the widget display.
 */
Background.prototype.activate = function(tabId) {
  var tabState = this.state.getTabState(tabId);
  this.updateWidget(tabState);
};

/**
 * Stop tracking the state of a tab.
 *
 * @param {!number} tabId Id of the tab to free the state of.
 */
Background.prototype.removeTab = function(tabId) {
  this.state.removeTabState(tabId);
};

/**
 * Request that the user interface be restored, if it is closed.
 */
Background.prototype.showUI = function(tabId) {
  var tabState = this.state.getTabState(tabId);
  if(!tabState) {
    return;
  }

  if(tabState.winState.closed) {
    tabState.winState.closed = false;
    tabState.uiPort.emit('ShowUI', null);
  }
};

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = Background;
  }
  exports.Background = Background;
}

})();
