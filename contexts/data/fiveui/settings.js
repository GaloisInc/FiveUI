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
fiveui.Settings = function(store) {
  this.store = store;
};

_.extend(fiveui.Settings.prototype, Backbone.Events);
_.extend(fiveui.Settings.prototype, {

  /**
   * Retrieve an object associated with the key.
   *
   * @param {!string} key The key to look up.
   * @return {?Object} The returned JavaScript object.
   */
  get: function(key) {
    var value = this.store.getItem(key);
    if (value == null) {
      return null;
    } else {
      return jQuery.parseJSON(value);
    }
  },

  /**
   * Store an object with the given key.
   *
   * @param {string} key the key.
   * @param {Object} value the value.
   * @return {void}
   */
  set: function(key, value) {
    this.store.setItem(key, jQuery.toJSON(value));
  },

  /**
   * @param {string} key The local storage entry to remove.
   * @return {void}
   */
  remove: function(key) {
    this.store.removeItem(key);
  },

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

  /**
   * Add a mapping from url patterns to RuleSets (via rule set ids)
   *
   * @param {!string} url_pat A regular expression (actually, a glob) to match URLs against.
   * @param {!number} rule_id The id of the RuleSet to use with any matching URL.
   * @return {!number} The id of the new url pattern.
   */
  addUrl: function(url_pat, rule_id) {
    var pats = this.getUrls();

    var new_id = fiveui.utils.getNewId(pats);

    this.updateUrl(new_id, url_pat, rule_id);

    // add it to the patterns list
    pats.push(new_id);
    this.set('urls', pats);

    return new_id;
  },

  updateUrl: function(id, url_pat, rule_id) {
    this.set('urls.' + id, new fiveui.UrlPat(id, url_pat, rule_id));
    return id;
  },

  /**
   * Retrieve the list of url patterns.
   *
   * @return {Array.<number>} An ordered list of the currently active
   *                          url patterns.
   */
  getUrls: function() {
    return (/** @type {Array.<number>} */ this.get('urls')) || [];
  },

  /**
   * Retrieve a specific url pattern.
   *
   * @param {!number} url_id The id of the url pattern to retrieve.
   * @return {?fiveui.UrlPat} The matching UrlPat or null,
   * if no pattern exists for url_id.
   */
  getUrlPat: function(url_id) {
    return /** @type {?fiveui.UrlPat} */ this.getById(url_id, 'urls', fiveui.UrlPat.fromJSON);
  },

  /**
   * Remove a UrlPat from the persistent storage.
   *
   * @param {!number} pat_id The id of the UrlPat to remove.
   * @return {void}
   */
  remUrlPat: function(pat_id) {
    this.remById(pat_id, 'urls');
  },

  /**
   * @param {!string} url A url to compare against the list of ordered
   *                     url patterns in local storage.
   * @return {?fiveui.UrlPat} The matching pattern, or null, if no
   *                          mapping was found.
   */
  checkUrl: function(url) {
    var pats = this.getUrls();

    // check for a possible match
    for (var i = 0; i < pats.length; ++i) {
      var pat = this.getUrlPat(pats[i]);
      if (pat.match(url)) {
        return pat;
      }
    }

    return null;
  },

  /**
   * Retrieve the list of rule sets.
   *
   * @return {!Array.<number>} An ordered list of the configured rule sets.
   */
  getRuleSets: function() {
    return (/** @type {!Array.<number>} */ this.get('ruleSet')) || [];
  },


  /**
   * @param {!Object} ruleSet The new rule set, as an anonymous JSON object.
   * @return {!fiveui.RuleSet} The new RuleSet object.
   */
  addRuleSet: function(ruleSet) {
    var ids = this.getRuleSets();
    var id = fiveui.utils.getNewId(ids);

    var newRS = this.updateRuleSet(id, ruleSet);
    ids.push(id);
    this.set('ruleSet', ids);

    return newRS;
  },

  /**
   * Change a rule set without generating a new id.
   *
   * @param {!number} ruleSetId The id of the ruleset that is being modified.
   * @param {!Object} ruleSet The rule set, as an anonymous JSON object.
   * @return {!fiveui.RuleSet} The new RuleSet object.
   */
  updateRuleSet: function(ruleSetId, ruleSet) {
    var newRS = fiveui.RuleSet.fromJSON(ruleSetId, ruleSet);
    this.set('ruleSet.'+ruleSetId, newRS);
    return newRS;
  },

  /**
   * @param {!number} id The id of the RuleSet to retrieve.
   * @return {?fiveui.RuleSet} The RuleSet, or null, if no RuleSet was found.
   */
  getRuleSet: function(id) {
    return /** @type {?fiveui.RuleSet} */ this.getById(id, 'ruleSet', fiveui.RuleSet.fromJSON);
  },

  /**
   * @param {!number} id The id of the rule set to remove.
   * @return {!Array.<fiveui.UrlPat>} null if the remove succeeded, otherwise,
   *                                  returns the list of UrlPats that use this
   *                                  rule set, if any.
   */
  remRuleSet: function(id) {
    var matches = _.map(this.getRuleSetUrlPats(id), function(id) {
      return this.getUrlPat(id);
    }, this);

    if (0 == matches.length) {
      this.remById(id, 'ruleSet');
    }

    return matches;
  },

  /**
   * @param {!number} ruleSetId The rule set to retrieve url patterns for.
   * @return {Array.<number>} Url pattern ids associated with this rule set.
   */
  getRuleSetUrlPats: function(ruleSetId) {
    var urls = this.getUrls();
    var patIds = [];

    _.each(urls, function(patId) {
      var pat = this.getUrlPat(patId);
      if(pat.rule_id == ruleSetId) {
        patIds.push(patId);
      }
    }, this);

    return patIds;
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
  }
});


/**
 * @param {!fiveui.Chan} chan
 * @param {!fiveui.Settings} settings
 * @return {void}
 */
fiveui.Settings.manager = function(chan, settings) {

  var msg = new fiveui.Messenger(chan);

  msg.register('addRuleSet', function(ruleSet,respond){
    var newRS = settings.addRuleSet(ruleSet);
    respond(newRS);
  });

  msg.register('updateRuleSet', function(updatedRS,respond){
    var newRS = settings.updateRuleSet(updatedRS.id, updatedRS);
    respond(newRS);
  });

  msg.register('remRuleSet', function(ruleSetId, respond) {
    var pats = settings.remRuleSet(ruleSetId);
    respond({
      id: ruleSetId,
      pats: pats,
      removed: pats.length == 0
    });
  });

  msg.register('getRuleSetUrlPats', function(ruleSetId, respond) {
    var pats = settings.getUrls();
    var patIds = [];

    _.each(pats, function(patId) {
      var pat = settings.getUrlPat(patId);
      if(pat.rule_id == ruleSetId) {
        patIds.push(patId);
      }
    });

    respond(patIds);
  });
  msg.register('getRuleSet', function(ruleSetId, respond){
            respond(settings.getRuleSet(ruleSetId));
          });
  msg.register('getRuleSets', function(unused, respond) {
            var ruleSets = _.map(settings.getRuleSets(),
                             _.bind(settings.getRuleSet, settings));
            respond(ruleSets);
          });

  msg.register('getUrlPats', function(unused, respond){
    respond(_.map(settings.getUrls(), _.bind(settings.getUrlPat, settings)));
  });

  msg.register('addUrlPat', function(url, respond){
    var urlId = settings.addUrl(url.regex, url.rule_id);
    respond(settings.getUrlPat(urlId));
  });

  msg.register('updateUrlPat', function(pat, respond) {
    var obj = settings.getUrlPat(pat.id);
    settings.updateUrl(pat.id, pat.regex, pat.rule_id);
    respond(pat);
  });

  msg.register('getUrlPat', function(urlPatId, respond){
    respond(settings.getUrlPat(urlPatId));
  });

  msg.register('remUrlPat', function(urlPatId, respond){
    settings.remUrlPat(urlPatId);
    respond(true);
  });

  msg.register('setDisplayDefault', function(def) {
    settings.setDisplayDefault(def);
  });

  msg.register('getDisplayDefault', function(ignored, respond) {
    respond(settings.getDisplayDefault());
  });

};

})();
