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
 * Generic mixin for adding entry-list functionality to a View.
 */
fiveui.Entry = {

  tagName: 'div',

  className: 'entry',

  remove: function(evt) {
    this.$el.remove();
    this.model.destroy();
  },

  edit: function() {
    var attrs = this.model.attributes;
    this.$el.html(this.editTemplate(attrs));
    return this;
  },

  /**
   * Render the item according to its template
   */
  render: function() {
    var attrs = this.model.attributes;
    this.$el.html(this.viewTemplate(attrs));
    return this;
  }

};


/** UrlPat Entry Elements ****************************************************/

fiveui.UrlPatEntryModel = Backbone.Model.extend({

  defaults: {
    title: '',
    descr: '',
    ruleSet: ''
  }

});

fiveui.UrlPatEntry = Backbone.View.extend(_.extend({

  events: function() {
    return _.extend(this.entryEvents, {});
  },

}, fiveui.Entry));


/** Rule Entry Elements ******************************************************/

fiveui.RuleSetModel = Backbone.Model.extend({

  defaults: {
    msg:          null,
    id:           null,
    name:         '',
    description:  '',
    source:       '',
    rules:        [],
    dependencies: [],
  },

  sync: function(method, model, options) {

    _.defaults(options, {
      success:function() {},
      error:  function() {}
    });

    var msg = model.get('msg');
    var id  = model.get('id');

    switch(method) {

      case 'update':
      case 'create':
        var rsMethod = method == 'update' ? 'updateRuleSet' : 'addRuleSet';

        fiveui.RuleSet.load(model.get('source'), {
          success: function(obj) {
            // null when a new rule set
            obj.id = id;

            msg.send(rsMethod, obj, function(ruleSet) {
              // XXX this should probably be just the relevant fields, rules is
              // probably unnecessarily big to duplicate
              model.set(ruleSet);
              options.success();
            });
          },

          error: options.error
        });
        break;

      case 'delete':
        msg.send('remRuleSet', id);
        break;

      case 'read':
        msg.send('getRuleSet', id, function(rs) {
          model.set({
            title:  rs.name,
            descr:  rs.description,
            source: rs.source,
          });
        });
        break;

      default:
        break;
    }
  }


});

fiveui.RuleSetEntry = Backbone.View.extend(_.extend({

  viewTemplate: _.template(
    [ '<div class="content">'
    , '  <div class="header">'
    , '    <span class="button remove">x</span>'
    , '    <span class="button edit">edit</span>'
    , '    <span class="title"><%= name %></span>'
    , '  </div>'
    , '</div>'
    ].join('')),

  editTemplate: _.template(
    [ '<div class="content">'
    , '  <div class="header">'
    , '    <span class="button remove">x</span>'
    , '    <span class="button save">save</span>'
    , '    <input class="source" placeholder="rule set url" '
    , '       type="textbox" value="<%= source %>" />'
    , '  </div>'
    , '</div>'
    ].join('')),

  events: {
    'click span.save' : function(evt) {
      evt.stopPropagation();
      this.save();
    },

    'click span.remove' : function(evt) {
      evt.stopPropagation();
      this.remove();
    },

    'click span.edit' : function(evt) {
      evt.stopPropagation();
      this.edit();
    },
  },

  save: function() {
    var source = this.$el.find('.source').val();
    this.model.save({ source: source }, {
      success: _.bind(this.render, this),
      error:   _.bind(this.edit, this)
    });
  },

}, fiveui.Entry));

})();
