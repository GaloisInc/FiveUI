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

/** UrlPat Entry Elements ****************************************************/

fiveui.UrlPatEntry = Backbone.View.extend({

  className: 'entry',

  events: {
    'click span.save'   : 'save',
    'click span.remove' : 'remove',
    'click span.edit'   : 'edit',
  },

  initialize:function() {
    this.listenTo(this.model, 'remove', function() {
      this.$el.remove();
      this.stopListening();
    });
  },

  viewTemplate: _.template(
    [ '<div>'
    , '  <div class="header">'
    , '    <span class="button remove">x</span>'
    , '    <span class="button edit">edit</span>'
    , '    <span><%= regex %></span>'
    , '    <span><%= rule_name %></span>'
    , '  </div>'
    , '</div>'
    ].join('')),

  render:function() {
    var attrs       = _.clone(this.model.attributes);
    var ruleSet     = this.options.rules.model.findWhere({ id: attrs.rule_id })
    attrs.rule_name = ruleSet.get('name');
    this.$el.html(this.viewTemplate(attrs));
    return this;
  },

  editTemplate: _.template(
    [ '<div>'
    , '  <div class="header">'
    , '    <span class="button remove">x</span>'
    , '    <span class="button save">save</span>'
    , '    <input class="regex" placeholder="url pattern" '
    , '       type="textbox" value="<%= regex %>" />'
    , '    <span class="rules"></span>'
    , '  </div>'
    , '</div>'
    ].join('')),

  edit:function() {
    var attrs = this.model.attributes;
    this.$el.html(this.editTemplate(attrs));
    this.$el.find('.rules').append(this.options.rules.render().$el);

    return this;
  },

  remove: function() {
    this.model.destroy();
  },

  save:function() {
    var regex   = this.$el.find('input.regex').val();
    var rule_id = parseInt(this.options.rules.$el.val());
    this.model.save({ regex : regex, rule_id : rule_id }, {
      success: _.bind(this.render, this),
      error:   _.bind(this.edit, this)
    });
  },

});


/** Rule Set View ************************************************************/

fiveui.RulesView = Backbone.View.extend({

  tagName: 'select',

  initialize:function() {
    this.listenTo(this.model, 'sync',   this.update);
    this.listenTo(this.model, 'remove', this.update);
  },

  optionTemplate:_.template(
    '<option label="<%= name %>" value="<%= id %>" />'
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

    var self = this;

    this.$el.children().remove();
    this.model.each(function(ruleSet) {
      self.$el.append(self.optionTemplate(ruleSet.attributes));
    });

    return this;
  },

});


/** Rule Entry Elements ******************************************************/

fiveui.RuleSetEntry = Backbone.View.extend({

  className: 'entry',

  events: {
    'click span.save'   : 'save',
    'click span.remove' : 'remove',
    'click span.edit'   : 'edit',
  },

  viewTemplate: _.template(
    [ '<div class="content">'
    , '  <div class="header">'
    , '    <span class="button remove">x</span>'
    , '    <span class="button edit">edit</span>'
    , '    <span class="title"><%= name %></span>'
    , '  </div>'
    , '</div>'
    ].join('')),

  render:function() {
    var attrs = this.model.attributes;
    this.$el.html(this.viewTemplate(attrs));
    return this;
  },

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

  edit:function() {
    var attrs = this.model.attributes;
    this.$el.html(this.editTemplate(attrs));
    return this;
  },

  save: function() {
    var source = this.$el.find('.source').val();
    this.model.save({ source: source }, {
      success: _.bind(this.render, this),
      error:   _.bind(this.edit, this)
    });
  },

  remove:function() {
    var self = this;

    this.model.destroy({
      wait:true,

      success:function() {
        self.$el.remove();
        self.stopListening();
      },

      error:function() {
        console.log('communicate failure somehow...');
      }
    });
  },

});

})();
