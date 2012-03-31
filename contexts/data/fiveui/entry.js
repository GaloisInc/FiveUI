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

goog.provide('fiveui.Entry');
goog.provide('fiveui.UrlPatEntry');
goog.provide('fiveui.RuleSetEntry');

goog.require('fiveui.UrlPat');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventTarget');


/** Generic Entry Elements ***************************************************/

/**
 * Create an Entry element, which provides a content area, and remove button.
 *
 * @constructor
 */
fiveui.Entry = function() {
  // call the parent constructor
  goog.events.EventTarget.call(this);

  // containing element
  this._e = goog.dom.createElement('div');
  goog.dom.classes.add(this._e, 'entry');

  // content container
  this.content = goog.dom.createElement('div');
  goog.dom.classes.add(this.content, 'content');
  goog.dom.appendChild(this._e, this.content);

  // title element
  this._title = goog.dom.createElement('div');
  goog.dom.classes.add(this._title, 'title');
  goog.dom.appendChild(this.content, this._title);

  // description element
  this._description = goog.dom.createElement('div');
  goog.dom.classes.add(this._description, 'description');
  goog.dom.appendChild(this.content, this._description);

  // control container
  this._controls = goog.dom.createElement('div');
  goog.dom.classes.add(this._controls, 'controls');
  goog.dom.appendChild(this._e, this._controls);

  // the remove button
  this._remove = goog.dom.createElement('button');
  goog.dom.setTextContent(this._remove, 'Remove');
  goog.dom.appendChild(this._controls, this._remove);
  goog.events.listen(this._remove, 'click',
      goog.bind(this.dispatchEvent, this, 'remove'));
};
goog.inherits(fiveui.Entry, goog.events.EventTarget);

/**
 * Append the entry to a containing element
 *
 * @param {!Element} e The element to append to.
 * @return {void}
 */
fiveui.Entry.prototype.append = function(e) {
  goog.dom.appendChild(e, this._e);
};

/**
 * Remove the entry from its containing element.
 *
 * @return {void}
 */
fiveui.Entry.prototype.remove = function() {
  goog.dom.removeNode(this._e);
};

/**
 * Set the text of the title element.
 *
 * @param {!string} title The content of the title element.
 */
fiveui.Entry.prototype.setTitle = function(title) {
  goog.dom.setTextContent(this._title, title);
};

/**
 * Set the text of the description element.
 *
 * @param {!string} description The content of the description element.
 */
fiveui.Entry.prototype.setDescription = function(description) {
//  goog.dom.setTextContent(this._description, description);
  this._description.innerHTML = description;
};


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
goog.inherits(fiveui.UrlPatEntry, fiveui.Entry);

/**
 * @param {!fiveui.UrlPat} urlPat UrlPat instance to use.
 * @return {void}
 */
fiveui.UrlPatEntry.prototype.setUrlPat = function(urlPat) {
  this._urlPat = urlPat;
  this.setTitle(this._urlPat.regex);
};

/**
 * @param {!fiveui.RuleSet} ruleSet RuleSet instance to associate with.
 * @return {void}
 */
fiveui.UrlPatEntry.prototype.setRuleSet = function(ruleSet) {
  this._ruleSet = ruleSet
  this.setDescription(this._ruleSet.name);
};


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
  this._edit = goog.dom.createElement('button');
  goog.dom.setTextContent(this._edit, 'Edit');
  goog.dom.appendChild(this._controls, this._edit);
  goog.events.listen(this._edit, 'click',
      goog.bind(this.dispatchEvent, this, 'edit'));

  this.setRuleSet(rule);
};
goog.inherits(fiveui.RuleSetEntry, fiveui.Entry);

/**
 * Use the given rule set for the current display values for the entry.
 *
 * @param {!fiveui.RuleSet} ruleSet RuleSet to use for display.
 * @return {void}
 */
fiveui.RuleSetEntry.prototype.setRuleSet = function(ruleSet) {
  this._rule = ruleSet;
  this.setTitle(this._rule.name);
  this.setDescription(this._rule.description);
};
