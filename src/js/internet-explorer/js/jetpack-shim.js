/*jshint evil:true, devel:true, browser:true */
/*globals _fiveui_port, _fiveui_store, _fiveui_ajax, _fiveui_top, jQuery */

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
  global.exports = {};

  var globalEval = $.globalEval;

  var data = {
    load: load,
    url:  id
  };

  var tabs = [mkTab()];
  tabs.on = id;  // Ignore tab collection events for now.

  var modules = {
    "sdk/self":        { data: data },
    "sdk/tabs":        tabs,
    "storage-wrapper": { StorageWrapper: StorageWrapper },
    "tabIds":          { TabIds: TabIds }
  };

  function require(path) {
    if (modules.hasOwnProperty(path)) {
      return modules[path];
    }
    var exports = {};
    var exports_ = substitute(global, {
      module: { exports: exports },
      exports: exports
    }, function() {
      globalEval(load(path + ".js"));
      return global.exports;
    });
    modules[path] = exports_;
    return exports_;
  }

  function load(path) {
    var ret;
    getResource(path, function(resource) {
      ret = resource;
    });
    return ret;
  }

  function getResources(resourcePaths, fn) {
    (function getResources_(paths, resources) {
      var head, tail;
      if (paths.length === 0) {
        fn(resources);
      }
      else {
        head = paths[0];
        tail = paths.slice(1);
        getResource(head, function(content) {
          getResources_(tail, resources.concat(content));
        });
      }
    }(resourcePaths.slice(), []));
  }

  function getResource(path, fn) {
    _fiveui_port.once('resource.'+path, fn);
    try {
      _fiveui_port.emit('require', path);
    } catch(_) {
      if (typeof console !== 'undefined' && console.error) {
        console.error('Missing resource: ', path);
      }
    }
  }

  function mkTab() {
    var tab = mkPort('memory');
    tab.attach = attach;
    // None of this code is injected until after the load event, so
    // don't bother waiting for 'ready'.
    setTimeout(function() {

      // TODO: Hack for debugging:
      var rules = require('js/rules');
      rules.RuleSet.load(
        "http://10.0.2.2:8000/guidelines/wikipedia/wikipedia.json"
      ).then(function success(obj) {
        console.log('got ruleset ', JSON.stringify(obj));
        obj.id = 1000;
        obj.patterns = ["http*://*.wikipedia.org/wiki/*"];
        window.fakeRuleSet = obj;

        console.log('emit activate & ready');
        tab.emit('activate');
        tab.emit('ready');

      }, function error(e) {
        console.log('error: ', e);
      });
    }, 0);
    return tab;
  }

  function attach(opts) {
    var port = mkPort();
    var contentScriptFile = toArray(opts.contentScriptFile);
    var contentScript     = toArray(opts.contentScript);

    _fiveui_top.obtainPort =
      _fiveui_top.obtainComputePort = function() { return port; };

    getResources(contentScriptFile, function(scripts) {
      var i;
      for (i = 0; i < scripts.length; i += 1) {
        _fiveui_top.eval(scripts[i]);
      }
      for (i = 0; i < contentScript.length; i += 1) {
        _fiveui_top.eval(contentScript[i]);
      }
    });

    return { port: port };
  }

  function mkPort(/* flags... */) {
    var flags = arguments;
    var listeners = {};
    return {
      on: function on(eventType, fn) {
        var callbacks = listeners[eventType] || $.Callbacks.apply($, flags);
        callbacks.add(fn);
        listeners[eventType] = callbacks;
      },
      emit: function emit(eventType, data) {
        var callbacks = listeners[eventType];
        if (callbacks) {
          callbacks.fire(data);
        }
      }
    };
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

  function id(x) {
    return x;
  }

  function toArray(obj) {
    if (!obj) {
      return [];
    }
    else if (!$.isArray(obj)) {
      return [obj];
    }
    else {
      return obj;
    }
  }


  /* TabIds */

  function TabIds() {
    this.next = 0;
  }
  TabIds.prototype.allocate = function() {
    var tabId = this.next;
    this.next = this.next + 1;
    return tabId;
  };
  TabIds.prototype.free = function(tabId) {};


  /* StorageWrapper */

  function StorageWrapper() {}
  $.extend(StorageWrapper.prototype, {
    key: function(idx) { return _fiveui_store.key(idx); },
    getItem: function(key) { return _fiveui_store.getItem(key); },
    setItem: function(key, val) { _fiveui_store.setItem(key, val); },
    removeItem: function(key) { _fiveui_store.removeItem(key); },
    clear: function() { _fiveui_store.clear(); },
  });
  Object.defineProperty(StorageWrapper.prototype, 'length', {
    get: function() {
      return _fiveui_store.size();
    },
    enumerable: false
  });

}(window, jQuery));
