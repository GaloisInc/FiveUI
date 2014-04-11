/*jshint evil:true, devel:true, browser:true */
/*globals _fiveui_port, _fiveui_ajax, jQuery */

/*
 * Provides shims to allow our Jetpack-based code run in Internet
 * Explorer.
 *
 * A big difference between Firefox and IE is that a Firefox extension
 * runs in the background, lives beyound the lifecycle of individual
 * tabs, and has access to multiple tabs.  On the other hand, our IE
 * extension runs in the context of a single page, and code is only
 * injected after the browser 'load' event.
 */

(function(global, $) {

  global.require = require;
  global._fiveui_load = load;

  var modules = {
    // "sdk/pageMod":     { PageMod: PageMod },
  };

  /** Execute main module **/
  var main = require('js/main');
  main.main();

  function require(path) {
    if (modules.hasOwnProperty(path)) {
      return modules[path];
    }
    var exports = {};
    var exports_ = substitute(global, {
      module: { exports: exports },
      exports: exports
    }, function() {
      $.globalEval(load(path + ".js"));
      return global.exports;
    });
    modules[path] = exports_;
    return exports_;
  }

  function load(path) {
    var ret;
    _fiveui_port.once('resource.'+path, function(resource) {
      ret = resource;
    });
    try {
      _fiveui_port.emit('require', path);
      return ret;
    } catch(_) {
      if (typeof console !== 'undefined' && console.error) {
        console.error('Missing resource: ', path);
      }
    }
  }

  function substitute(namespace, subs, fn) {
    for (var prop in subs) {
      if (subs.hasOwnProperty(prop)) {
        fn = $.proxy(substitute_, null, namespace, prop, subs[prop], fn);
      }
    }
    return fn();
  }

  function substitute_(namespace, prop, val, fn) {
    var hasOld = namespace.hasOwnProperty(prop);
    var oldVal = hasOld && namespace[prop];
    namespace[prop] = val;
    var ret = fn();
    if (hasOld) {
      namespace[prop] = oldVal;
    }
    else {
      delete namespace[prop];
    }
    return ret;
  }
}(window, jQuery));
