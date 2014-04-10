/*
 * Module     : settings.js
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
 * Create a new instance of the Settings object
 *
 * @constructor
 * @param {!Storage} store The Storage instance to use.
 */
var Settings = fiveui.Settings = function(store) {
  this.store = store;
};

_.extend(fiveui.Settings.prototype, {

  /**
   * Retrieve an object associated with the key.
   *
   * @param {!string} key The key to look up.
   * @return {?Object} The returned JavaScript object.
   */
  get: function(key) {
    var value = this.store.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  /**
   * Store an object with the given key.
   *
   * @param {string} key the key.
   * @param {Object} value the value.
   * @return {void}
   */
  set: function(key, value) {
    this.store.setItem(key, JSON.stringify(value));
  },

  /**
   * @param {string} key The local storage entry to remove.
   * @return {void}
   */
  remove: function(key) {
    this.store.removeItem(key);
  },

  /**
   * @param {!number} id The nuber of the element to retrieve.
   * @param {!string} listName The name of the portion of the localstorage hierarchy to search for id.
   * @param {!function(number, !Object): *} fromJSON A deserialization function.
   *
   * @return {*} Either null, or the result of fromJSON.
   */
  getById: function(id, listName, fromJSON) {
    var obj = this.get(listName + '.' + id);
    if (!obj) {
      return null;
    }

    return fromJSON(id, obj);
  },

  /**
   * @param {!number} id The nuber of the element to retrieve.
   * @param {!string} listName The name of the portion of the
   * localstorage hierarchy to search for id.
   */
  remById: function(id, listName) {
    // remove it from the list of ids:
    var ids = this.get(listName) || [];

    for (var i = 0; i < ids.length; ++i) {
      if (ids[i] == id) {
        ids.splice(i, 1);
        this.set(listName, ids);
        this.remove(listName + '.' + id);
        break;
      }
    }
  },

  /** General Config **********************************************************/

  /**
   * Set the display default.
   *
   * @param {!boolean} def Whether or not to display the FiveUI Window
   * when problems are reported.
   */
  setDisplayDefault: function(def) {
    this.set('displayDefault', def);
  },

  /**
   * Get the display default.
   *
   * @return {!boolean} true to show the window as soon as problems are
   * reported, false otherwise.
   */
  getDisplayDefault: function() {
    var def = this.get('displayDefault');

    // double negation to normalize funny things like null
    return !!def;
  },


  /** Rule Sets ***************************************************************/

  /**
   * Retrieve the list of rule set ids.
   *
   * @return {!Array.<number>} An ordered list of the configured rule sets.
   */
  getRuleSetIds: function() {
    return (/** @type {!Array.<number>} */ this.get('ruleSet')) || [];
  },

  /**
   * Retrieve all rule set ids.
   */
  getRuleSets:function() {
    return _.map(this.getRuleSetIds(), _.bind(this.getRuleSet, this));
  },

  /**
   * @param {!Object} ruleSet The new rule set, as an anonymous JSON object.
   * @return {!fiveui.RuleSet} The id of the new rule set.
   */
  addRuleSet: function(ruleSet) {
    var ids = this.getRuleSetIds();
    var id  = fiveui.utils.getNewId(ids);

    this.updateRuleSet(id, ruleSet);

    ids.push(id);
    this.set('ruleSet', ids);

    return id;
  },

  /**
   * Change a rule set without generating a new id.
   *
   * @param {!number} ruleSetId The id of the ruleset that is being modified.
   * @param {!Object} ruleSet The rule set, as an anonymous JSON object.
   */
  updateRuleSet: function(ruleSetId, ruleSet) {
    var newRS = fiveui.RuleSet.fromJSON(ruleSetId, ruleSet);
    this.set('ruleSet.'+ruleSetId, newRS);
  },

  /**
   * @param {!number} id The id of the RuleSet to retrieve.
   * @return {?fiveui.RuleSet} The RuleSet, or null, if no RuleSet was found.
   */
  getRuleSet: function(id) {
    return this.getById(id, 'ruleSet', fiveui.RuleSet.fromJSON);
  },

  /**
   * @param {!number} id The id of the rule set to remove.
   */
  remRuleSet: function(id) {
    this.remById(id, 'ruleSet');
  },

  /** URL Pattern Management **************************************************/

  /**
   * Test a url agains the rule set database.  Return the first rule set that
   * matches, or null if none do.
   */
  checkUrl: function(url) {
    return _.find(this.getRuleSets(), function(rs) {

      if(!rs.enabled) {
        return false;
      }

      return _.some(rs.patterns, function(pat) {
        var regex = fiveui.utils.compilePattern(pat);
        return regex.test(url);
      });

    });
  },

});


/**
 * @param {!fiveui.Chan} chan
 * @param {!fiveui.Settings} settings
 * @return {void}
 */
fiveui.Settings.manager = function(chan, settings) {

  var Messenger = require('js/messenger');
  var msg = new Messenger(chan);

  // create a new rule set, and call the response continuation with the created
  // object.
  msg.register('addRuleSet', function(ruleSet,respond){
    var id = settings.addRuleSet(ruleSet);
    respond(settings.getRuleSet(id));
  });

  // update a rule set, and call the response continuation with the updated
  // object.
  msg.register('updateRuleSet', function(updatedRS,respond){
    settings.updateRuleSet(updatedRS.id, updatedRS);
    respond(settings.getRuleSet(updatedRS.id));
  });

  // remove a rule set by id.  the response continuation is called with no
  // argument.
  msg.register('remRuleSet', function(ruleSetId, respond) {
    settings.remRuleSet(ruleSetId);
    respond();
  });

  // Retrieve the manifest, and return the object to the caller.  Invokes the
  // response continuation with an error object when rule set fails to load.
  msg.register('loadRuleSet', function(url, respond) {
    fiveui.RuleSet.load(url).then(respond, function error(msg) {
      respond({ error : msg });
    });
  });

  // get a rule set structure by id.  invoke the respond continuation with the
  // rule set, if it exists, and null if it does not.
  msg.register('getRuleSet', function(ruleSetId, respond){
    respond(settings.getRuleSet(ruleSetId));
  });

  // Retrieve the list of all rule sets.  invoke the respond continuation with
  // the list of rule sets.
  msg.register('getRuleSets', function(unused, respond) {
    respond(settings.getRuleSets());
  });

  // sets the value of the 'display default' config option.  invokes the respond
  // callback with no argument.
  msg.register('setDisplayDefault', function(def, respond) {
    settings.setDisplayDefault(def);
    respond();
  });

  // get the value of the 'display default' config option.  invokes the respond
  // callback with the value.
  msg.register('getDisplayDefault', function(ignored, respond) {
    respond(settings.getDisplayDefault());
  });

};

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = Settings;
  }
  exports.Settings = Settings;
}

})();
