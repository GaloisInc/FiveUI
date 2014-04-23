/*
 * Module     : state.js
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
 * @param {!number} x The x-offset of the embedded dialog.
 * @param {!number} y The y-offset the dialog.
 * @param {!number} width The width of the dalog.
 * @param {!number} height The width of the dalog.
 * @param {!boolean} closed True if the window is closed, false if it is open.
 */
fiveui.WinState = function(x, y, width, height, closed) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.closed = closed;
};

/**
 * @constructor
 * @param {string} cfg The config object for the problem.  See
 *                     fiveui.Problem.sanitize
 */
fiveui.Problem = function(cfg) {
  _.defaults(this, fiveui.Problem.sanitize(cfg));
};

fiveui.Problem.sanitize = function(obj) {

  var defs = {
    name:     '',   // the name of the rule that this problem came from
    descr:    '',   // short description of the problem
    url:      '',   // url that the problem came from
    severity: 0,    // severity of the problem
    phash:    null, // hash for the combination of problem and element in context
    hash:     null, // hash for the element in context
    xpath:    '',   // path of the element in the document
    msg:      '',   // problem message
  };

  return _.defaults(_.pick(obj, _.keys(defs)), defs);

};

/**
 * @param {!Object} obj The JSON object to use as a template for a problem.
 * @return {!fiveui.Problem} The problem that the object represents.
 */
fiveui.Problem.fromJSON = function(obj) {
  return new fiveui.Problem(obj);
};

/**
 * @constructor
 * @param {fiveui.WinState} winState The location of the FiveUI windown in
 *                                   the injected page.  Null if the window
 *                                   is hidden.
 * @param {fiveui.ChromePort} uiPort The port used to communicate with
 *                                   the corresponding tab.
 */
fiveui.TabState = function(tabId, winState, uiPort) {
  this.tabId        = tabId;
  this.winState     = winState;
  this.uiPort       = uiPort;
  this.computePorts = [];
  this.problems     = [];
  this.seenProblems = new Set();
  this.stats        = {};
};

_.extend(fiveui.TabState.prototype, {

  /**
   * Returns true when the combination of element and problem has been seen
   * before, to avoid repeats.
   *
   * NOTE:  we use phash here, as it allows multiple distinct problems to target
   * the same element.
   */
  addProblem: function(prob) {
    if(this.seenProblems.contains(prob.phash)) {
      return false;
    } else {
      this.problems.push(prob);
      this.seenProblems.add(prob.phash);
      return true;
    }
  },

  addStats: function (stats) {
    this.stats = stats;
    return true;
  },

  clearProblems: function() {
    this.problems = [];
    this.seenProblems = new Set();
  },

  clearStats: function() {
    for (var p in fiveui.stats.zero) { this.stats[p] = fiveui.stats.zero[p]; }
  },

  /*
   * Returns a copy of only the attributes in a TabState that are needed for
   * interpage communication.
   */
  toEmit: function() {
    return { winState: this.winState, problems: this.problems, stats: this.stats };
  }

});

/**
 * @constructor
 * @param {!fiveui.Settings} settings The settings object to obtain
 *                                    defaults from.
 */
fiveui.State = function(settings) {
  this.tabs = {};
  this.settings = settings;
};

_.extend(fiveui.State.prototype, {

  /**
   * @param {!number} tabId The id of the tab to retrieve state for.
   *
   * @return {?fiveui.TabState} The stored state of the tab, or null, if
   *                            no state exists for the requested tab.
   */
  getTabState: function(tabId) {
    return this.tabs[tabId] || null;
  },

  /**
   * Like getTabState, but creates an initial tab state if none exists.
   *
   * @param {!number} tabId The id of the tab to retrieve state for.
   * @param {!fiveui.ChromePort} port The port to use for communication
   *                             with the corresponding tab.
   * @return {!fiveui.TabState} Either an initial state if none existed, or the
   *                            state that exists already.
   */
  acquireTabState: function(tabId, port) {
    var ts = this.getTabState(tabId);

    if (!ts) {
      var closed = ! this.settings.getDisplayDefault();

      // in the future, get these defaults from the settings instance.
      var ws = new fiveui.WinState(10, 10, 300, 300, closed);
      ts = new fiveui.TabState(tabId, ws, port);
      this.setTabState(ts);
    }

    return ts;
  },

  /**
   * @param {!fiveui.TabState} ts The state to store.
   * @return {void}
   */
  setTabState: function(ts) {
    this.tabs[ts.tabId] = ts;
  },

  /**
   * Update the state of a tab, if and only if the tabId exists in the state.
   *
   * @param {!number} tabId The id of the tab to store state for.
   * @param {function(fiveui.TabState): fiveui.TabState} fn A function
   *                                       that modifies the tab state.
   *
   * @return {void}
   */
  adjust: function(tabId, fn) {
    var tState = this.getTabState(tabId);
    if (tState) {
      this.tabs[tabId] = fn(tState);
    }
  },

  /**
   * Remove the state of a tab.
   *
   * @param {!number} tabId The id of the tab to remove the state of.
   * @return {void}
   */
  removeTabState: function(tabId) {
    delete this.tabs[tabId];
  }

});

if (typeof exports !== 'undefined') {
  for (var k in fiveui) {
    if (fiveui.hasOwnProperty(k)) {
      exports[k] = fiveui[k];
    }
  }
}

})();
