/*
 * Defines an `exports` object that can capture names and rules from
 * multiple files.  Requires a javascript runtime that supports
 * ECMAScript 5.
 */
(function (global) {
  'use strict';

  var exports = {};
  var rules = {};
  var unmatchedName, unmatchedDef;
  var lastName, lastDef;

  Object.defineProperty(exports, 'name', {
    set: function(name) {
      if (unmatchedDef) {
        rules[name] = unmatchedDef;
        unmatchedDef = null;
      }
      else {
        unmatchedName = name;
      }
      lastName = name;
    },

    get: function() {
      return lastName;
    }
  });

  Object.defineProperty(exports, 'rule', {
    set: function(def) {
      if (unmatchedName) {
        rules[unmatchedName] = def;
        unmatchedName = null;
      }
      else {
        unmatchedDef = def;
      }
      lastDef = def;
    },

    get: function() {
      return lastDef;
    }
  });

  Object.defineProperty(global, 'exports', {
    get: function() {
      return exports;
    },

    set: function(exp) {
      if (exp && typeof exp === 'object' && exp.name && exp.rule) {
        rules[exp.name] = exp.rule;
        lastName = exp.name;
        lastDef  = exp.rule;
      }
    }
  });

  function rule(name) {
    return rules[name];
  }

  global.rule = rule;

}(this));
