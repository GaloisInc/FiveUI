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

fiveui = fiveui || {};

(function() {
/**
 * @constructor
 *
 * @param {!function(!string):!string} dataLoader
 */
fiveui.Background = function(settings, updateWidget, loadScripts, dataLoader) {
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
  this.state = new fiveui.State(settings);

  // how we communicate with the status widget
  this.updateWidget = updateWidget;

  // how we signal the browser to load a content script
  this.loadScripts = loadScripts;

  this.dataLoader = dataLoader;
};

fiveui.Background.prototype._registerComputeListeners = function(port, tabState){
    var bg = this;
    port.on('ReportProblem', function(request) {
      var problem = fiveui.Problem.fromJSON(request);
      if(tabState.addProblem(problem) && tabState.uiPort != null) {
        bg.updateWidget(tabState);
        tabState.uiPort.emit('ShowProblem', problem);
      }
    });
    port.on('ReportStats', function (stats) {
      if (tabState.addStats(stats) && tabState.uiPort != null) {
        bg.updateWidget(tabState);
        tabState.uiPort.emit('ShowStats', stats);
      }
    });
};

fiveui.Background.prototype._registerUiListeners = function(port, tabState){
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
fiveui.Background.prototype.connect = function(tabId, port, url, isUiPort) {

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
    var pat = this.settings.checkUrl(url);
    if (!pat) {
      console.err('could not find url pattern for tab.url, but one was strongly expected');
    } else {
      var ruleSet = this.settings.getRuleSet(pat.rule_id);

      port.emit('SetRules', ruleSet);
    }
  }
};

/**
 * @param {!number} tabId
 * @param {!string} url
 * @param {*} data
 */
fiveui.Background.prototype.pageLoad = function(tabId, url, data) {
  var pat = this.settings.checkUrl(url);

  if (null == pat) {
    this.updateWidget(null);
  } else {
    var tabState = this.state.acquireTabState(tabId);
    tabState.computePorts = [];

    this.updateWidget(tabState);

    var dependencies = [];
    var ruleSet = this.settings.getRuleSet(pat.rule_id);

    if (ruleSet && ruleSet.dependencies ) {
      dependencies = ruleSet.dependencies;
    }

    var computeScripts = _.flatten(
      [ [ this.dataLoader('lib/jquery/jquery.js')
        , this.dataLoader('fiveui/injected/prelude.js')
        , this.dataLoader('lib/jshash/md5.js')
        , this.dataLoader('fiveui/injected/jquery-plugins.js')
        ]
      , dependencies
      , [ this.dataLoader('fiveui/injected/fiveui-injected-compute.js')
        ]
      ]);
    this.loadScripts(tabId, computeScripts, true, data);

    var uiScripts = _.flatten(
        [ this.dataLoader('target/injected.css'),
          this.dataLoader('target/bundled.css'),
          this.dataLoader('lib/jquery/jquery.js'),
          this.dataLoader('lib/jquery/jquery-ui.js'),
          this.dataLoader('fiveui/injected/prelude.js'),
          this.dataLoader('fiveui/injected/fiveui-injected-ui.js'),
          this.dataLoader('fiveui/injected/jquery-plugins.js')
        ]);
    this.loadScripts(tabId, uiScripts, false, data);
  }
};

/**
 * Updates the widget according to the tab state of the specified tab.
 *
 * @param {!number} tabId Id of the tab that is currently active, and
 *                        thus, dictating the widget display.
 */
fiveui.Background.prototype.activate = function(tabId) {
  var tabState = this.state.getTabState(tabId);
  this.updateWidget(tabState);
};

/**
 * Stop tracking the state of a tab.
 *
 * @param {!number} tabId Id of the tab to free the state of.
 */
fiveui.Background.prototype.removeTab = function(tabId) {
  this.state.removeTabState(tabId);
};

/**
 * Request that the user interface be restored, if it is closed.
 */
fiveui.Background.prototype.showUI = function(tabId) {
  var tabState = this.state.getTabState(tabId);
  if(null == tabState) {
    return;
  }

  if(tabState.winState.closed) {
    tabState.winState.closed = false;
    tabState.uiPort.emit('ShowUI', null);
  }
};

})();
