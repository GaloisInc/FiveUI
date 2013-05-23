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
 * @param {!number} id The unique Rule identifier.
 * @param {!string} name A human-readable name for this Rule.
 * @param {!string} desc A description of the Rule.
 * @param {!string} ruleStr A Javascript expression implementing the rule.
 */
fiveui.Rule = function(id, name, desc, ruleStr) {
  this.id = id;
  this.name = name;
  this.description = desc;
  this.ruleStr = ruleStr;
};

fiveui.Rule.defaults = function(obj) {
  return _.defaults(obj, {
    id:          null,
    name:        '',
    description: '',
    ruleStr:     ''
  });
};

/**
 * Create a Rule from a JSON object.
 *
 *  // param {!number} id A unique id for the rehydrated Rule.
 * @param {!Object} obj The object to take settings from.
 * @return {!fiveui.Rule} A populated Rule object.
 */
fiveui.Rule.fromJSON = function(obj) {
  return new fiveui.Rule(obj.id, obj.name, obj.description, obj.ruleStr);
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
    source:        '',
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
        var rule = fiveui.Rule.defaults(rules.pop());
        var rule_url = base_url + '/' + rule.file;
        jQuery.ajax(rule_url, {

          dataType: 'text',

          success: function(ruleStr) {
            rule.ruleStr = ruleStr;
            manifest.rules.push(rule);

            loadRules(manifest, rules);
          },

          error: options.error
        });

      }
    };

    // fetch the manifest, and load its rules
    jQuery.ajax(manifest_url, {

      dataType: 'json',

      dataFilter: fiveui.utils.filterJSON,

      success: function(manifest) {
        fiveui.RuleSet.defaults(manifest);

        var rules      = manifest.rules;
        manifest.rules = [];
        loadRules(manifest, rules);
      },

      error: options.error
    });


  } else {
    throw "unable to parse manifest url";
  }

};


})();
