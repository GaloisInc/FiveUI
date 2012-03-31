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

goog.provide('fiveui.Settings');
goog.provide('fiveui.UrlPat');

goog.require('fiveui.Messenger');
goog.require('fiveui.Rule');
goog.require('fiveui.RuleSet');
goog.require('fiveui.utils.getNewId');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.structs');



/**
 * Create a new Url Pattern to map urls to Rule Sets.
 *
 * @constructor
 * @param {!number} id New id for this UrlPat.
 * @param {!string} regex The pattern that is used to match Urls.
 * @param {!number} rule_id Unique id of the RuleSet to use for matching URLs.
 */
fiveui.UrlPat = function(id, regex, rule_id) {
  this.id = id;
  this.regex = regex;
  this.rule_id = rule_id;
};

/**
 * Create a Url Pattern from a JSON object.
 *
 * @param {!number} id The id to use for the restored object.
 * @param {!Object} obj The object to take settings from.
 * @return {!fiveui.UrlPat} A populated UrlPat object.
 */
fiveui.UrlPat.fromJSON = function(id, obj) {
  return new fiveui.UrlPat(id, obj.regex, obj.rule_id);
};

/**
 * Create a regular expression from a globbed pattern.
 *
 * @param {!string} str The globbed url.
 * @return {!RegExp} A compiled regular expression.
 */
fiveui.UrlPat.compile = function(str) {
  var regex = str.replace(/\./g, '\.')
                 .replace(/\*/g, '.*');
  return new RegExp(regex);
};

/**
 * Test a string Url against the regular expression held in a Url Pattern.
 *
 * @param {!string} url The Url the string to test.
 * @return {!boolean} If the Url matched the regular expression.
 */
fiveui.UrlPat.prototype.match = function(url) {
  var pat = fiveui.UrlPat.compile(this.regex);
  return pat.test(url);
};

/**
 * Create a new instance of the Settings object
 *
 * @constructor
 * @param {!Storage} store The Storage instance to use.
 */
fiveui.Settings = function(store) {
  this.store = store;

  this.events = new goog.events.EventTarget();
};

/**
 * Retrieve an object associated with the key.
 *
 * @param {!string} key The key to look up.
 * @return {?Object} The returned JavaScript object.
 */
fiveui.Settings.prototype.get = function(key) {
  var value = this.store.getItem(key);
  if (value == null) {
    return null;
  } else {
    return goog.json.parse(value);
  }
};

/**
 * Store an object with the given key.
 *
 * @param {string} key the key.
 * @param {Object} value the value.
 * @return {void}
 */
fiveui.Settings.prototype.set = function(key, value) {
  this.store.setItem(key, goog.json.serialize(value));
};

/**
 * @param {string} key The local storage entry to remove.
 * @return {void}
 */
fiveui.Settings.prototype.remove = function(key) {
  this.store.removeItem(key);
};

/**
 * Set the display default.
 *
 * @param {!boolean} def Whether or not to display the FiveUI Window
 * when problems are reported.
 */
fiveui.Settings.prototype.setDisplayDefault = function(def) {
  this.set('displayDefault', def);
};

/**
 * Get the display default.
 *
 * @return {!boolean} true to show the window as soon as problems are
 * reported, false otherwise.
 */
fiveui.Settings.prototype.getDisplayDefault = function() {
  var def = this.get('displayDefault');

  if ( def == null ) {
    return false;
  }
  return def;
};

/**
 * Add a mapping from url patterns to RuleSets (via rule set ids)
 *
 * @param {!string} url_pat A regular expression (actually, a glob) to match URLs against.
 * @param {!number} rule_id The id of the RuleSet to use with any matching URL.
 * @return {!number} The id of the new url pattern.
 */
fiveui.Settings.prototype.addUrl = function(url_pat, rule_id) {
  var pats = this.getUrls();

  var new_id = fiveui.utils.getNewId(pats);
  this.set('urls.' + new_id,
      new fiveui.UrlPat(new_id, url_pat, rule_id));

  // add it to the patterns list
  pats.push(new_id);
  this.set('urls', pats);

  return new_id;
};

/**
 * Retrieve the list of url patterns.
 *
 * @return {Array.<number>} An ordered list of the currently active
 *                          url patterns.
 */
fiveui.Settings.prototype.getUrls = function() {
  return (/** @type {Array.<number>} */ this.get('urls')) || [];
};

/**
 * Retrieve a specific url pattern.
 *
 * @param {!number} url_id The id of the url pattern to retrieve.
 * @return {?fiveui.UrlPat} The matching UrlPat or null,
 * if no pattern exists for url_id.
 */
fiveui.Settings.prototype.getUrlPat = function(url_id) {
  return /** @type {?fiveui.UrlPat} */ this.getById(url_id, 'urls', fiveui.UrlPat.fromJSON);
};

/**
 * Remove a UrlPat from the persistent storage.
 *
 * @param {!number} pat_id The id of the UrlPat to remove.
 * @return {void}
 */
fiveui.Settings.prototype.remUrlPat = function(pat_id) {
  this.remById(pat_id, 'urls');
};

/**
 * @param {!string} url A url to compare against the list of ordered
 *                     url patterns in local storage.
 * @return {?fiveui.UrlPat} The matching pattern, or null, if no
 *                          mapping was found.
 */
fiveui.Settings.prototype.checkUrl = function(url) {
  var pats = this.getUrls();

  // check for a possible match
  for (var i = 0; i < pats.length; ++i) {
    var pat = this.getUrlPat(pats[i]);
    if (pat.match(url)) {
      return pat;
    }
  }

  return null;
};

/**
 * Retrieve the list of rule sets.
 *
 * @return {!Array.<number>} An ordered list of the configured rule sets.
 */
fiveui.Settings.prototype.getRuleSets = function() {
  return (/** @type {!Array.<number>} */ this.get('ruleSet')) || [];
};


/**
 * @param {!Object} ruleSet The new rule set, as an anonymous JSON object.
 * @return {!fiveui.RuleSet} The new RuleSet object.
 */
fiveui.Settings.prototype.addRuleSet = function(ruleSet) {
  var ids = this.getRuleSets();
  var id = fiveui.utils.getNewId(ids);

  var newRS = this.updateRuleSet(id, ruleSet);
  ids.push(id);
  this.set('ruleSet', ids);

  return newRS;
};

/**
 * Change a rule set without generating a new id.
 *
 * @param {!number} ruleSetId The id of the ruleset that is being modified.
 * @param {!Object} ruleSet The rule set, as an anonymous JSON object.
 * @return {!fiveui.RuleSet} The new RuleSet object.
 */
fiveui.Settings.prototype.updateRuleSet = function(ruleSetId, ruleSet) {
  var newRS = fiveui.RuleSet.fromJSON(ruleSetId, ruleSet);
  this.set('ruleSet.'+ruleSetId, newRS);
  return newRS;
};

/**
 * @param {!number} id The id of the RuleSet to retrieve.
 * @return {?fiveui.RuleSet} The RuleSet, or null, if no RuleSet was found.
 */
fiveui.Settings.prototype.getRuleSet = function(id) {
  return /** @type {?fiveui.RuleSet} */ this.getById(id, 'ruleSet', fiveui.RuleSet.fromJSON);
};

/**
 * @param {!number} id The id of the rule set to remove.
 * @return {!Array.<fiveui.UrlPat>} null if the remove succeeded, otherwise,
 *                                  returns the list of UrlPats that use this
 *                                  rule set, if any.
 */
fiveui.Settings.prototype.remRuleSet = function(id) {
  var matches = goog.structs.map(this.getRuleSetUrlPats(id), function(id) {
    return this.getUrlPat(id);
  }, this);

  if (0 == matches.length) {
    this.remById(id, 'ruleSet');
  }

  return matches;
};

/**
 * @param {!number} ruleSetId The rule set to retrieve url patterns for.
 * @return {Array.<number>} Url pattern ids associated with this rule set.
 */
fiveui.Settings.prototype.getRuleSetUrlPats = function(ruleSetId) {
  var urls = this.getUrls();
  var patIds = [];

  goog.structs.forEach(urls, function(patId) {
    var pat = this.getUrlPat(patId);
    if(pat.rule_id == ruleSetId) {
      patIds.push(patId);
    }
  }, this);

  return patIds;
};

/**
 * @param {!number} id The nuber of the element to retrieve.
 * @param {!string} listName The name of the portion of the localstorage hierarchy to search for id.
 * @param {!function(number, !Object): *} fromJSON A deserialization function.
 *
 * @return {*} Either null, or the result of fromJSON.
 */
fiveui.Settings.prototype.getById = function(id, listName, fromJSON) {
  var obj = this.get(listName + '.' + id);
  if (!obj) {
    return null;
  }

  return fromJSON(id, obj);
};

/**
 * @param {!number} id The nuber of the element to retrieve.
 * @param {!string} listName The name of the portion of the
 * localstorage hierarchy to search for id.
 */
fiveui.Settings.prototype.remById = function(id, listName) {
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
};


/**
 * @param {!fiveui.Chan} chan
 * @param {!fiveui.Settings} settings
 * @return {void}
 */
fiveui.Settings.manager = function(chan, settings) {
  var msg = new fiveui.Messenger(chan);
  msg.register('addRuleSet', function(ruleSet){
            var newRS = settings.addRuleSet(ruleSet);
            msg.send('addRuleSet', newRS);
          });
  msg.register('updateRuleSet', function(updatedRS){
            var newRS = settings.updateRuleSet(updatedRS.id, updatedRS.obj);
            msg.send('updateRuleSet', newRS);
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

    goog.structs.forEach(pats, function(patId) {
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
            var ruleSets = goog.structs.map(settings.getRuleSets(),
                             goog.bind(settings.getRuleSet, settings));
            respond(ruleSets);
          });
  msg.register('getUrls', function(unused, respond){
            var urlPats = goog.structs.map(settings.getUrls(),
                             goog.bind(settings.getUrlPat, settings));
            respond(urlPats);
          });
  msg.register('addUrlPat', function(url){
            var urlId = settings.addUrl(url.pattern, url.ruleSetId);
            msg.send('addUrlPat', settings.getUrlPat(urlId));
          });
  msg.register('getUrlPat', function(urlPatId, respond){
            respond(settings.getUrlPat(urlPatId));
          });
  msg.register('remUrlPat', function(urlPatId){
            settings.remUrlPat(urlPatId);
            msg.send('remUrlPat', urlPatId);
          });
  msg.register('setDisplayDefault', function(def) {
                 settings.setDisplayDefault(def);
               });
  msg.register('getDisplayDefault', function(ignored, respond) {
                 respond(settings.getDisplayDefault());
               });

};
