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

goog.provide('fiveui.Rule');
goog.provide('fiveui.RuleSet');

goog.require('goog.structs');
goog.require('goog.json');

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
 * @param {!Array.<fiveui.Rule>} rules An Array of Rules.
 * @param {!string} original The original string representation.
 * @param {?Array.<string>} deps Dependencies that this RuleSet requires.
 */
fiveui.RuleSet = function(id, name, desc, rules, original, deps) {
  this.id = id;
  this.name = name;
  this.description = desc;
  this.rules = rules;
  this.original = original;
  this.dependencies = deps || [];
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
    goog.structs.map(obj.rules, fiveui.Rule.fromJSON));

  return new fiveui.RuleSet(id, obj.name, obj.description, rules,
                            obj.original, obj.dependencies);
};
