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


  /** RuleSet list entries ***************************************************/

  var ruleSetEntries = jQuery('#ruleSetEntries');

  // handle clicks to the 'add' button on the rule sets page
  jQuery('#addRsButton')
    .button({
      icons: { primary: 'ui-icon-plus' },
    })
    .on('click', function() {
      ruleSets.add(new fiveui.RuleSetModel({}, { url : msg }));
    });

  // render a ruleset added to the collection
  ruleSets.on('add', function(model) {
    var entry = new fiveui.RuleSetEntry({ model: model })
    ruleSetEntries.append(entry.$el);

    if(model.isNew()) {
      entry.edit();
    } else {
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
  setClickHandler(jQuery('#rule-sets'),    select('#tab-rule-sets'));
  setClickHandler(jQuery('#basics'),       select('#tab-basics'));

  // select the rule sets tab
  selectNav(jQuery('#rule-sets'));
  selectSection(jQuery('#tab-rule-sets'));


  /** Pre-populate UI elements ***********************************************/

  msg.send('getDisplayDefault', null, function(def) {
    jQuery('#windowDisplayDefault').prop('checked', def);
  });

  // pre-populate the rule sets
  ruleSets.fetch();
};


  /** Rule-Set Views *********************************************************/

var editable = function(el, placeholder, onEnter) {

  el.prop('contenteditable', true).addClass('editable');

  // prevent newlines
  if(onEnter) {
    el.on('keypress', function(e) {
      if(e.which == 13) {
        onEnter();
        return false;
      } else {
        return true;
      }
    });
  } else {
    el.on('keypress', function(e) {
      return e.which != 13;
    });
  }

  var addPlaceholder = function() {
    el.addClass('placeholder')
      .text(placeholder)
      .one('click keypress paste', remPlaceholder);
  };

  var remPlaceholder = function() {
    el.removeClass('placeholder').text('');
  };

  // if the model is new, set the placeholder, and a listener to clear it
  if(el.text() == '') {
    addPlaceholder();
  }

  el.on('blur', function() {
    if(el.text() == '') {
      addPlaceholder();
    }
  });

  el.focus();

};

var button = function(el, icon) {
  el.button({ icons: icon, text: false });
};


/** Rule Set View ************************************************************/

fiveui.RulesView = Backbone.View.extend({

  tagName: 'select',

  initialize:function() {
    this.listenTo(this.model, 'sync',   this.update);
    this.listenTo(this.model, 'remove', this.update);
  },

  optionTemplate:_.template(
    '<option value="<%= id %>"><%= name %></option>'
  ),

  update:function() {
    if(this.model.length == 0) {
      return this.remove();
    } else {
      return this.render();
    }
  },

  remove:function() {
    this.stopListening();
    this.$el.remove();

    this.trigger('remove');

    return this;
  },

  render:function() {

    var scope = this;

    this.$el.children().remove();

    var text = this.model.foldl(function(body,ruleSet) {
      return body + scope.optionTemplate(ruleSet.attributes);
    }, '');

    this.$el.html(text);

    return this;
  },

});


/** Rule Entry Elements ******************************************************/

fiveui.RuleSetEntry = Backbone.View.extend({

  tagName: 'li',

  className: 'entry',

  // setup the skeleton for the rule set editor.
  initialize:function() {
    this.$el.html(
      [ '<div class="rule-set">'
      , '</div>'
      , '<ul class="patterns"></ul>'
      , '<div class="pattern-control">'
      , '  <div class="pattern-input"></div>'
      , '  <button class="add-pattern">add url pattern</button'
      , '</div>'
      ].join(''));

    this.$rs     = this.$el.find('.rule-set');
    this.$pat    = this.$el.find('.patterns');
    this.$urlpat = this.$el.find('.pattern-input');
    this.$addpat = this.$el.find('.add-pattern');

    // setup the url pattern editor
    this.$addpat.button({ icons: { primary: 'ui-icon-plus' } });
    editable(this.$urlpat, 'http://example.com/*', _.bind(function() {
      this.$addpat.click();
      this.$urlpat.focus();
    }, this));
  },

  events: {
    'click .save'        : 'save',
    'click .remove'      : 'remove',
    'click .edit'        : 'edit',
    'click .reload'      : 'reload',
    'click .add-pattern' : 'addPattern',
  },

  viewRsTemplate: _.template(
    [ '<div class="container">'
    , '  <button class="remove">remove</button>'
    , '  <button class="edit">edit</button>'
    , '  <button class="reload">reload</button>'
    , '</div>'
    , '<span class="title"><%= name %><%= license %></span>'
    ].join('')),

  // render the rule set as its title, with some buttons to edit/remove/reload
  // it.
  render:function() {

    // render the rule set
    var attrs = _.clone(this.model.attributes);

    // add a comma to the license field, if it's present.
    if(!_.isEmpty(attrs.license)) {
      attrs.license = ', ' + attrs.license;
    }

    this.$rs.html(this.viewRsTemplate(attrs));

    button(this.$rs.find('.edit'),   { primary: 'ui-icon-pencil'  });
    button(this.$rs.find('.reload'), { primary: 'ui-icon-refresh' });
    button(this.$rs.find('.remove'), { primary: 'ui-icon-close'   });

    this.renderPats(this.model.get('patterns'));

    this.$addpat.prop('disabled', false);

    return this;
  },

  editTemplate: _.template(
    [ '<div class="container">'
    , '  <button class="remove">x</button>'
    , '  <button class="save">save</button>'
    , '</div>'
    , '<span class="source"><%= source %></span>'
    ].join('')),

  // rework the rule set display area to a single input field for the url, and a
  // remove and save button.
  edit:function() {
    var attrs = this.model.attributes;
    this.$rs.html(this.editTemplate(attrs));

    button(this.$rs.find('.remove'), { primary: 'ui-icon-close' });

    var save = this.$rs.find('.save');
    button(save, { primary: 'ui-icon-disk' });

    this.$addpat.prop('disabled', true);

    editable(this.$rs.find('.source'), 'http://example.com/manifest.json',
      _.bind(save.click, save));

    return this;
  },

  errorTemplate: _.template('<div class="error"><%= message %></div>'),

  // render an error message below the edit ui for the result sets, but before
  // any url patterns.
  editError:function(target, message) {
    this.edit();
    this.$rs.append(this.errorTemplate({ message: message }));

    return this;
  },

  // save the current model, falling back on the editor dialog when errors show
  // up.  it's assumed that this is only called from the editor dialog.
  save: function() {
    var source = this.$el.find('.source').text();
    this.model.set('source', source);
    this.model.save({}, {
      success: _.bind(this.render,    this),
      error:   _.bind(this.editError, this)
    });
  },

  // reaload the model, and render.  on failure, display the edit dialog with a
  // message.
  reload:function() {
    this.model.save({}, {
      success: _.bind(this.render,    this),
      error:   _.bind(this.editError, this)
    });
  },

  // remove the model, and remove the element from the list.
  remove:function() {
    this.model.destroy();
    this.$el.remove();
    this.stopListening();
  },



  viewPatTemplate: _.template(
    [ '<li>'
    , '  <button class="remove-pat">remove</button>'
    , '  <span class="pattern"><%= pattern %></span>'
    , '</li>'
    ].join('')),

  addUrlPat:function(pat) {
    var el = jQuery(this.viewPatTemplate({ pattern: pat }));

    var remove = el.find('.remove-pat');

    button(remove, { primary: 'ui-icon-close' });
    remove.on('click', _.bind(this.removePattern, this, pat));

    this.$pat.append(el);
  },

  // render the url patterns of the rule set into this.$pat.
  renderPats:function(pats) {
    this.$pat.children().remove();

    _.each(pats, _.bind(this.addUrlPat, this))
    return this;
  },

  // add a pattern to the underlying collection of patterns
  addPattern:function() {
    var pat  = this.$urlpat.text();
    var pats = this.model.get('patterns');

    pats.push(pat);

    this.model.save({ patterns : pats }, {
      wait:    true,
      patch:   true,
      success: _.bind(function() {
        this.$urlpat.text('').blur();
        this.render();
      }, this),
      error: function(msg) {
        debugger;
      },
    });
  },

  removePattern:function(pat) {
    var pats = _.filter(this.model.get('patterns'), function(p) {
      return p != pat;
    });

    this.model.save({ patterns: pats }, {
      wait:   true,
      patch:  true,
      success:_.bind(this.render, this),
      // XXX make this report an actual error
      error:  _.bind(this.render, this)
    });
  },

});

})();
