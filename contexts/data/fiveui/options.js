/*
 * Module     : options.js
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

/*****************************************************************
 *
 * Misc. utility functions
 *
 ****************************************************************/

var setClickHandler = function(sel, fn, scope) {
  var boundFn = fn;
  if (scope) {
    boundFn = _.bind(fn, scope);
  }

  sel.on('click', boundFn)
};

/**
 * @param {!string} selectEltId The id of the select element to
 * search for selected items.
 * @return {!Array.<!number>} An array of 'value' entries from the
 * selected elements.  This may be empty, but it will not be null.
 */
var findSelectedIds = function(elt) {
  var opts = elt.find('option:checked');
  return _.map(opts, function(o) { return o.value; });
};


fiveui.options = fiveui.options || {};

/**
 * @param {{on: function(!string, function(*)), emit: function(!string, *)}} port
 */
fiveui.options.init = function(port) {

  var msg    = new fiveui.Messenger(port);
  var update = new fiveui.UpdateManager(msg);

  /** Update/Delete Manager ***************************************************/

  /** Unprocessed Rule Manipulation *******************************************/

  /**
   * Given an object containing a rule function, serialize the function to a
   * string, and place it in the ruleStr field of that object.
   *
   * @param {!Object} obj The object to modify.
   * @return {void}
   */
  var serializeRule = function(obj) {
    obj.ruleStr = obj.rule.toString();
    delete obj.rule;
  };

  /**
   * Parse a ruleSet string into a json object.
   *
   * @param {!string} ruleSetText The text to parse.
   * @return {?Object}
   */
  var parseRuleSet = function(ruleSetText) {
    var obj = {};
    try {
      obj = jQuery.parseJSON(ruleSetText);
    } catch (x) {
      // TODO: this error message is not as helpful as it could be
      alert('Eval error: ' + x.toString());
    }
    _.each(obj.rules, serializeRule);
    obj.original = ruleSetText;
    return obj;
  };


  /** Backend RuleSet update functions ****************************************/

  /**
   * Add a rule set from a textual representation.
   *
   * @param {!string} ruleSetText
   * @return {void}
   */
  var addRuleSet = function(ruleSetText) {
    var obj = parseRuleSet(ruleSetText);
    if (obj) {
      msg.send('addRuleSet', obj);
    }
  };

  /**
   * Update an existing rule set, given an id and a new rule set object.
   *
   * @param {!number} ruleSetId The id of the rule set to modify.
   * @param {!string} ruleSetText The text of the rule set.
   * @return {void}
   */
  var updateRuleSet = function(ruleSetId, ruleSetText) {
    var obj = parseRuleSet(ruleSetText);
    if (obj) {
      msg.send('updateRuleSet', {'id': ruleSetId, 'obj': obj });
    }
  };

  /**
   * Remove a rule set.
   *
   * @param {!number} ruleSetId
   * @return {void}
   */
  var remRuleSet = function(ruleSetId) {
    msg.send('remRuleSet', ruleSetId,
      function(resp) {
        if (resp.removed) {
          update.trigger('remRuleSet.' + ruleSetId);
        } else {
          showRemRuleSetErr(ruleSetId, resp.pats);
        }
      });
  };

  /**
   * @param {!number} ruleSetId
   * @param {!function(?fiveui.RuleSet)} cb
   */
  var getRuleSet = function(ruleSetId, cb) {
    msg.send('getRuleSet', ruleSetId, cb);
  };

  /**
   * @param {!function(*)} cb Callback to process the ruleset array.
   */
  var getRuleSets = _.bind(msg.send, msg, 'getRuleSets', null);


  /** Backend UrlPat update functions ****************************************/

  /**
   * @param {!function(Array.<fiveui.UrlPat>)} cb
   */
  var getUrls = function(cb) {
  };

  /**
   * @param {!string} pattern
   * @param {!number} ruleSetId
   */
  var addUrlPat = function(pattern, ruleSetId) {
    msg.send('addUrlPat', {'pattern': pattern, 'ruleSetId': ruleSetId});
  };

  /**
   * @param {!number} urlPatId
   * @param {!function(?fiveui.UrlPat)} cb
   */
  var getUrlPat = function(urlPatId, cb) {
    msg.send('getUrlPat', urlPatId, cb);
  };

  /**
   * @param {!number} urlId
   */
  var remUrlPat = function(urlId) {
    msg.send('remUrlPat', urlId);
  };

  /**
   * Set the default display state for the FiveUI Window.
   *
   * @param {!boolean} def The default state for the FiveUI Window.
   */
  var setDisplayDefault = function(def) {
    msg.send('setDisplayDefault', def);
  };

  /** UrlPat list entries ****************************************************/

  /**
   * @param {!fiveui.UrlPat} pat The new url pattern.
   */
  var onAddUrlPat = function(pat) {
  };

  // register to handle new url patterns from the backend
  msg.register('addUrlPat', _.bind(console.error, console));

  // handle the `add` button being clicked
  jQuery('#addUrlPat').on('click', onAddUrlPat);


  /** RuleSet list entries ***************************************************/

  var ruleSetEntries = jQuery('#ruleSetEntries');

  // handle clicks to the 'add' button on the rule sets page
  jQuery('#addRsButton').on('click', function() {
    var entry = new fiveui.RuleSetEntry({
      model: new fiveui.RuleSetModel({ msg: msg })
    });
    ruleSetEntries.append(entry.$el);
    entry.edit();
  });


  /** Tab Management *********************************************************/

  /**
   * Select a tab header by Element reference.
   *
   * @param {!Element} clicked The navigation element to focus.
   * @return {void}
   */
  var selectNav = function(clicked) {
    var nav = clicked.parent();

    nav.find('div.selected', nav).removeClass('selected');

    jQuery('div.editorPane').hide();

    clicked.addClass('selected');
  };

  /**
   * Focus a tab, by Element reference.
   *
   * @param {!Element} el The tab element to focus.
   * @return {void}
   */
  var selectSection = function(el) {
    var cont = el.parent();

    // hide all sections
    cont.find('>section').removeClass('selected').hide();

    // display this section
    el.addClass('selected').show();
  };

  /**
   * A combination of selectNav and selectSection that will first lookup the
   * elements associated with a tab, then return a new function that when
   * called, will focus both the navigation element, and the tab it controls.
   *
   * @param {!string} id The id of the tab to focus.
   * @return {function()}
   */
  var select = function(id) {
    var sel = jQuery(id);
    return function() {
      selectNav(jQuery(this));
      selectSection(sel);
    };
  };

  // listen to click events on navigation elements
  setClickHandler(jQuery('#url-defaults'), select('#tab-url-defaults'));
  setClickHandler(jQuery('#rule-sets'),    select('#tab-rule-sets'));
  setClickHandler(jQuery('#basics'),       select('#tab-basics'));

  // select the url patterns tab by default
  selectNav(jQuery('#url-defaults'));
  selectSection(jQuery('#tab-url-defaults'));


  /** Pre-populate UI elements ***********************************************/

  // pre-populate the list of url patterns
  msg.send('getUrls', null, function(pats) {
    _.each(pats, onAddUrlPat);
  });

  msg.send('getDisplayDefault', null, function(def) {
    jQuery('#windowDisplayDefault').prop('checked', def);
  });

  // pre-populate the list of rule sets
  getRuleSets(function(ruleSets) {
    _.each(ruleSets, function(ruleSet) {

      var entry = new fiveui.RuleSetEntry({
        model: new fiveui.RuleSetModel({
          msg:         msg,
          id:          ruleSet.id,
          name:        ruleSet.name,
          description: ruleSet.description,
          source:      ruleSet.source,
        })
      });

      ruleSetEntries.append(entry.$el);
      entry.render();

    });
  });
};

})();
