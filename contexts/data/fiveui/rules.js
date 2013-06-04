/*
 * Module     : rules.js
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
 * @constructor
 * @param {!string} module A Javascript module that defines the rule.
 */
fiveui.Rule = function(module) {
  this.module = module;
};

fiveui.Rule.defaults = function(obj) {
  return _.defaults(obj, {
    module: '',
  });
};

/**
 * Create a Rule from a JSON object.
 *
 * @param {!Object} obj The object to take settings from.
 * @return {!fiveui.Rule} A populated Rule object.
 */
fiveui.Rule.fromJSON = function(obj) {
  return new fiveui.Rule(obj.module);
};

/**
 * @constructor
 * @param {!number} id The unique RuleSet identifier.
 * @param {!string} name A human-readable name for this RuleSet.
 * @param {!string} desc A human-readable description of the Rule Set.
 * @param {!string} source The url where the manifest can be retrieved
 * @param {!Array.<fiveui.Rule>} rules An Array of Rules.
 * @param {?Array.<string>} deps Dependencies that this RuleSet requires.
 */
fiveui.RuleSet = function(id, name, desc, source, rules, deps) {
  this.id           = id;
  this.name         = name;
  this.description  = desc;
  this.source       = source;
  this.rules        = rules || [];
  this.dependencies = deps  || [];
};

/**
 * Create a Rule Setfrom a JSON object.
 *
 * @param {!number} id A unique id for the rehydrated Rule.
 * @param {!Object} obj The object to take settings from.
 * @return {!fiveui.RuleSet} A populated RuleSet object.
 */
fiveui.RuleSet.fromJSON = function(id, obj) {
  var rules = (/** @type {!Array.<!fiveui.Rule>} */
    _.map(obj.rules, fiveui.Rule.fromJSON));

  return new fiveui.RuleSet(id, obj.name, obj.description, obj.source,
                            rules, obj.dependencies);
};


fiveui.RuleSet.defaults = function(obj) {
  return _.defaults(obj, {
    name:          '',
    description:   '',
    rules:         [],
    dependencies:  []
  });
};


/**
 * Options is an object that can contain a success and error continuation.
 */
fiveui.RuleSet.load = function(manifest_url, options) {

  _.defaults(options, {
    success: function() {},
    error:   function() { throw "failed when loading url"; }
  });

  var match = manifest_url.match(/\/[^\/]*$/);

  if(match) {
    var base_url = manifest_url.substring(0,match.index);

    // iterate over rules, retrieving the 
    var loadRules = function(manifest, rules) {

      if(rules.length == 0) {
        options.success(manifest);
      } else {

        // XXX there's likely problems here, how should we make sure that the
        // url is what we expect?
        var rule_file = fiveui.Rule.defaults(rules.pop());
        var rule_url  = base_url + '/' + rule_file;

        fiveui.ajax.get(rule_url, {

          success: function(text) {
            manifest.rules.push(new fiveui.Rule(text));
            loadRules(manifest, rules);
          },

          error: options.error
        });

      }
    };

    // fetch the manifest, and load its rules
    fiveui.ajax.get(manifest_url, {

      success: function(text) {
        try {
          var manifest = JSON.parse(fiveui.utils.filterJSON(text,'json'));

        } catch(e) {
          // XXX incoming error continuation is empty 
          // (and we may have syntax error details in e)
          options.error();
          return;
        }

        fiveui.RuleSet.defaults(manifest);

        var rules      = manifest.rules;
        manifest.rules = [];
        loadRules(manifest, rules);
      },

      error: options.error,
    });


  } else {
    throw "unable to parse manifest url";
  }

};


/*******************************************************************************
 * Models for RuleSet
 ******************************************************************************/

/**
 * The model for an single set of rules.
 */
fiveui.RuleSetModel = Backbone.Model.extend({

  defaults: {
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

    var msg    = this.url;
    var id     = model.get('id');
    var source = model.get('source');

    switch(method) {

      case 'update':
      case 'create':
        var rsMethod = method == 'update' ? 'updateRuleSet' : 'addRuleSet';

        msg.send('loadRuleSet', source, function(obj) {

          if(obj) {
            obj.id     = id;
            obj.source = source;

            msg.send(rsMethod, obj, options.success);
          } else {
            options.error();
          }

        });
        break;

      case 'delete':
        msg.send('remRuleSet', id, function(obj) {
          if(obj.removed) {
            options.success();
          } else {
            options.error();
          }
        });
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

}, {

  /**
   * Generate a RuleSetModel from a RuleSet
   */
  fromRuleSet: function(ruleSet,msg) {
    return new fiveui.RuleSetModel({
      id:          ruleSet.id,
      name:        ruleSet.name,
      description: ruleSet.description,
      rules:       ruleSet.rules,
      dependencies:ruleSet.dependencies,
      source:      ruleSet.source,
    }, { url : msg });
  },

});


/**
 * The model for a collection of rule sets
 */
fiveui.RuleSets = Backbone.Collection.extend({

  model: fiveui.RuleSetModel,

  sync: function(method, collection, options) {
    _.defaults(options, {
      success:function() {},
      error:function() {}
    });

    var self = this;
    var msg  = this.url;

    switch(method) {

      case 'read':
        msg.send('getRuleSets', null, function(ruleSets) {
          options.success(_.map(ruleSets, function(rs) {
            return fiveui.RuleSetModel.fromRuleSet(rs, msg);
          }));
        });
        break;

    }
  }

});


})();
