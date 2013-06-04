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

var editable = function(el, model, placeholder) {

  el.prop('contenteditable', true).addClass('editable');

  // prevent newlines
  el.on('keypress', function(e) {
    return e.which != 13;
  });

  var addPlaceholder = function() {
    el.addClass('placeholder')
      .text(placeholder)
      .one('click keypress paste', remPlaceholder);
  };

  var remPlaceholder = function() {
    el.removeClass('placeholder').text('');
  };

  // if the model is new, set the placeholder, and a listener to clear it
  if(model.isNew()) {
    addPlaceholder();
  }

  el.on('blur', function() {
    if(_.isEmpty(el.text())) {
      addPlaceholder();
    }
  });

  el.focus();

};


/** UrlPat Entry Elements ****************************************************/

fiveui.UrlPatEntry = Backbone.View.extend({

  tagName: 'li',

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
    , '  <span class="button remove">x</span>'
    , '  <span class="button edit">edit</span>'
    , '  <span><%= regex %></span>'
    , '  <span><%= rule_name %></span>'
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
    , '  <span class="button remove">x</span>'
    , '  <span class="button save">save</span>'
    , '  <span class="regex"></span>'
    , '  <span class="rules"></span>'
    , '</div>'
    ].join('')),

  edit:function() {
    var attrs = this.model.attributes;
    this.$el.html(this.editTemplate(attrs));

    this.$el.find('.rules').append(this.options.rules.render().$el);
    editable(this.$el.find('.regex'), this.model, 'url pattern');
    return this;
  },

  remove: function() {
    this.model.destroy();
  },

  save:function() {
    var regex   = this.$el.find('.regex').text();
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

  events: {
    'click span.save'   : 'save',
    'click span.remove' : 'remove',
    'click span.edit'   : 'edit',
  },

  viewTemplate: _.template(
    [ '<div class="content">'
    , '  <span class="button remove">x</span>'
    , '  <span class="button edit">edit</span>'
    , '  <span class="title"><%= name %></span>'
    , '</div>'
    ].join('')),

  render:function() {
    var attrs = this.model.attributes;
    this.$el.html(this.viewTemplate(attrs));
    return this;
  },

  editTemplate: _.template(
    [ '<div class="content">'
    , '  <span class="button remove">x</span>'
    , '  <span class="button save">save</span>'
    , '  <span class="source"><%= source %></span>'
    , '</div>'
    ].join('')),

  edit:function() {
    var attrs = this.model.attributes;
    this.$el.html(this.editTemplate(attrs));

    editable(this.$el.find('.source'), this.model,
        'http://example.com/manifest.json')

    return this;
  },

  save: function() {
    var source = this.$el.find('.source').text();
    this.model.set('source', source);
    this.model.save({}, {
      success: _.bind(this.render, this),
      error:   _.bind(this.edit,   this)
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
