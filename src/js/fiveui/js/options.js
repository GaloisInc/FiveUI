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

  ruleSets = new fiveui.RuleSets([], { url: msg });
  urlPats  = new fiveui.UrlPats([], { url: msg });


  /** UrlPat list entries ****************************************************/

  var urlPatEntries = jQuery('#urlPatEntries');
  var addUrlPat     = jQuery('#addUrlPat');

  addUrlPat.prop('disabled', true);

  addUrlPat.on('click', function() {
    urlPats.add(new fiveui.UrlPatModel({}, { url : msg }));
  });

  // when a new rule set is sync'd, make sure that the add url pattern button is
  // enabled.
  ruleSets.on('sync', function() {
    if(ruleSets.length > 0) {
      addUrlPat.prop('disabled', false);
    }
  });

  // when a rule set is destroyed, and the collection is now empty, disable the
  // add url pattern button.
  ruleSets.on('destroy', function(model,col) {
    if(col.length <= 0) {
      addUrlPat.prop('disabled', true);
    }
  });

  // handle new url patterns being added to the collection.
  urlPats.on('add', function(model) {
    var view = new fiveui.UrlPatEntry({
      model: model,
      rules: new fiveui.RulesView({ model: ruleSets })
    });
    urlPatEntries.append(view.$el);

    if(model.isNew()) {
      view.edit();
    } else {
      view.render();
    }
  });


  /** RuleSet list entries ***************************************************/

  var ruleSetEntries = jQuery('#ruleSetEntries');

  // handle clicks to the 'add' button on the rule sets page
  jQuery('#addRsButton').on('click', function() {
    ruleSets.add(new fiveui.RuleSetModel({}, { url : msg }));
  });

  // render a ruleset added to the collection
  ruleSets.on('add', function(model) {
    var entry = new fiveui.RuleSetEntry({ model: model })
    ruleSetEntries.append(entry.$el);

    if(model.isNew()) {
      entry.edit();
    } else {
      addUrlPat.prop('disabled', false);
      entry.render();
    }
  });


  /** Basics *****************************************************************/

  var windowDisplayDefault = jQuery('#windowDisplayDefault');

  windowDisplayDefault.on('change', function() {
    msg.send('setDisplayDefault', windowDisplayDefault.prop('checked'))
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

  msg.send('getDisplayDefault', null, function(def) {
    jQuery('#windowDisplayDefault').prop('checked', def);
  });

  // pre-populate the rule set and url pattern lists
  ruleSets.fetch({
    success:function() {
      urlPats.fetch();
    }
  });
};

})();
