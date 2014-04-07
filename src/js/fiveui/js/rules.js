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
 * @param {!number} config Initializers for the rule set structure.
 */
fiveui.RuleSet = function(config) {
  // fill in fields
  _.defaults(this, fiveui.RuleSet.sanitize(config));
};

fiveui.RuleSet.defaults = {
    id:           null,
    name:         '',
    description:  '',
    source:       '',
    rules:        [],
    patterns:     [],
    dependencies: [],
    license:      '',
    enabled:      true,
  };

fiveui.RuleSet.sanitize = function(obj) {
  var defs = fiveui.RuleSet.defaults;

  // scrub out any values that aren't in the defaults list, fill in any that are
  // missing.  pick will implicitly return a copy, so it's OK to not clone obj
  // here.
  return _.defaults(_.pick(obj, _.keys(defs)), defs);
};


/**
 * Create a Rule Setfrom a JSON object.
 *
 * @param {!number} id A unique id for the rehydrated Rule.
 * @param {!Object} obj The object to take settings from.
 * @return {!fiveui.RuleSet} A populated RuleSet object.
 */
fiveui.RuleSet.fromJSON = function(id, obj) {
  // make sure to override any id value passed in.
  obj.id = id;
  return new fiveui.RuleSet(obj);
};


/**
 * Returns a promise.
 */
fiveui.RuleSet.load = function(manifest_url, options) {

  var match = manifest_url.match(/\/[^\/]*$/);
  var ajax  = require('js/platform-ajax');
  var utils = require('js/utils');

  if(match) {
    var base_url = manifest_url.substring(0,match.index);

    // fetch the manifest, and load its rules
    return ajax.get(manifest_url).then(function success(text) {
      // cleanup the parsed JSON object
      var sanitized = fiveui.utils.filterJSON(text,'json');
      var obj       = null;

      try {
        obj = JSON.parse(sanitized);
      } catch(e) {
        return failure('failed to parse manifest');
      }

      // set defaults in the parsed manifest
      var manifest = fiveui.RuleSet.sanitize(obj);

      return all([
        loadDependencies(manifest.dependencies),
        loadRules(manifest.rules)
      ])
      .then(function(outcomes) {

        return _.extend(manifest, {
          // explicitly zero out the patterns, they shouldn't be part of the
          // manifest.
          patterns:     [],

          // overwrite any source present with the one given by the user.
          source:       manifest_url,

          dependencies: outcomes[0],
          rules:        outcomes[1]
        });

      });
    },

    function error() {
      return failure('failed to retrieve manifest');
    });


  } else {
    return failure("unable to parse manifest url");
  }

  function loadDependencies(dependencyFiles) {
    var deps = dependencyFiles.map(function(dep_file) {
      // XXX there's likely problems here, how should we make sure that the
      // url is what we expect?
      var dep_url = base_url + '/' + dep_file;

      return ajax.get(dep_url).then(function success(text) {
        return {'url': dep_url, 'content': text};
      });
    });

    return all(deps);
  }

  function loadRules(ruleFiles) {
    var rules = ruleFiles.map(function(rule_file) {
      // XXX there's likely problems here, how should we make sure that the
      // url is what we expect?
      var rule_url  = base_url + '/' + rule_file;

      return ajax.get(rule_url).then(function(text) {
        // Ensure that resulting promise holds only a single value.
        return text;
      });
    });

    return all(rules);
  }

};


/*******************************************************************************
 * Models for RuleSet
 ******************************************************************************/

/**
 * The model for an single set of rules.
 */
fiveui.RuleSetModel = Backbone.Model.extend({

  defaults: fiveui.RuleSet.defaults,

  sync: function(method, model, options) {

    _.defaults(options, {
      success:function() {},
      error:  function() {}
    });

    var attrs  = _.clone(model.attributes);
    var msg    = this.url;

    switch(method) {

      // the patched fields are in options.attrs
      case 'patch':

        var patch = options.attrs;

        // at the moment, we only support patching the patterns
        if(!_.isEmpty(_.difference(_.keys(patch),['patterns']))) {
          options.error('unable to patch more than the patterns field');
        } else {
          attrs.patterns = patch.patterns;
          msg.send('updateRuleSet', attrs, options.success);
        }

        break;

      case 'update':
      case 'create':
        var rsMethod = method == 'update' ? 'updateRuleSet' : 'addRuleSet';

        msg.send('loadRuleSet', attrs.source, function(obj) {
          if(!obj.error) {
            obj.id       = attrs.id;
            obj.patterns = attrs.patterns;

            msg.send(rsMethod, obj, options.success);
          } else {
            options.error(obj.error);
          }
        });
        break;

      case 'delete':
        msg.send('remRuleSet', attrs.id, options.success);
        break;

      case 'read':
        msg.send('getRuleSet', attrs.id, function(rs) {
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
    return new fiveui.RuleSetModel(fiveui.RuleSet.sanitize(ruleSet), {
      url: msg
    });
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

/**
 * Creates a resolved promise.
 */
function success(val) {
  return RSVP.resolve(val);
}

/**
 * Creates a rejected promise.
 */
function failure(reason) {
  return RSVP.reject(reason);
}

/**
 * Given an array of promises, returns a promise that will resolve to
 * the array of resolved values of the input promises.
 */
function all(promises) {
  return RSVP.all(promises);
}

if (typeof exports !== 'undefined') {
  for (var k in fiveui) {
    if (fiveui.hasOwnProperty(k)) {
      exports[k] = fiveui[k];
    }
  }
}

})();
