/*
 * Module     : entry.js
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

/** Generic Entry Elements ***************************************************/

/**
 * Create an Entry element, which provides a content area, and remove button.
 *
 * @constructor
 */
fiveui.Entry = function() {

  // containing element
  this._e = jQuery('div');

  // content container
  this.content = jQuery('div');
  this._e.append(this.content);

  // title element
  this._title = jQuery('div');
  this.content.append(this._title);

  // description element
  this._description = jQuery('div');
  this.content.append(this._description);

  // control container
  this._controls = jQuery('div');
  this._e.append(this._controls);

  // the remove button
  this._remove = jQuery('button');
  this._remove.text('Remove');
  this._controls.append(this._remove);

  // connect the remove event to the remove button being clicked
  this._remove.on('click', _.bind(this.trigger, this, 'remove'));
};

_.extend(fiveui.Entry.prototype, Backbone.Events);

_.extend(fiveui.Entry.prototype, {

  /**
   * Append the entry to a containing element
   *
   * @param {!Element} e The element to append to.
   * @return {void}
   */
  append: function(e) {
    e.append(this._e);
  },

  /**
   * Remove the entry from its containing element.
   *
   * @return {void}
   */
  remove: function() {
    this._e.remove();
  },

  /**
   * Set the text of the title element.
   *
   * @param {!string} title The content of the title element.
   */
  setTitle: function(title) {
    this._title.text(title);
  },

  /**
   * Set the text of the description element.
   *
   * @param {!string} description The content of the description element.
   */
  setDescription: function(description) {
    this._description.text(description);
  },

});


/** UrlPat Entry Elements ****************************************************/

/**
 * Construct a list entry for a url pattern.
 *
 * @constructor
 *
 * @param {!fiveui.UrlPat} urlPat UrlPat instance to use.
 * @param {!fiveui.RuleSet} ruleSet RuleSet instance to associate with.
 */
fiveui.UrlPatEntry = function(urlPat, ruleSet) {
  // call the parent constructor
  fiveui.Entry.call(this);

  this.setUrlPat(urlPat);
  this.setRuleSet(ruleSet);
};
_.extend(fiveui.UrlPatEntry.prototype, fiveui.Entry.prototype);

_.extend(fiveui.UrlPatEntry.prototype, {

  /**
   * @param {!fiveui.UrlPat} urlPat UrlPat instance to use.
   * @return {void}
   */
  setUrlPat: function(urlPat) {
    this._urlPat = urlPat;
    this.setTitle(this._urlPat.regex);
  },

  /**
   * @param {!fiveui.RuleSet} ruleSet RuleSet instance to associate with.
   * @return {void}
   */
  setRuleSet: function(ruleSet) {
    this._ruleSet = ruleSet
    this.setDescription(this._ruleSet.name);
  },

});


/** Rule Entry Elements ******************************************************/

/**
 * Construct a list entry for a rule set.
 *
 * @constructor
 *
 * @param {!fiveui.RuleSet} rule The RuleSet instance to use.
 */
fiveui.RuleSetEntry = function(rule) {
  // call the parent constructor
  fiveui.Entry.call(this);

  // edit button
  this._edit = jQuery('button');
  this._edit.text('Edit');
  this._controls.append(this._edit);
  this._edit.on('click', _.bind(this.trigger, this, 'edit'));

  this.setRuleSet(rule);
};

_.extend(fiveui.RuleSetEntry.prototype, fiveui.Entry.prototype);

_.extend(fiveui.RuleSetEntry.prototype, {

  /**
   * Use the given rule set for the current display values for the entry.
   *
   * @param {!fiveui.RuleSet} ruleSet RuleSet to use for display.
   * @return {void}
   */
  setRuleSet: function(ruleSet) {
    this._rule = ruleSet;
    this.setTitle(this._rule.name);
    this.setDescription(this._rule.description);
  },

});

})();
