/*jshint evil:true */

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
  var port = window.port;

  var data = {
    load: load,
    url:  id
  };

  var tabs = [mkTab()];
  tabs.on = id;  // Ignore tab collection events for now.

  var special = {
    "sdk/self":        { data: data },
    "sdk/tabs":        tabs,
    "storage-wrapper": { StorageWrapper: StorageWrapper },
    "tabIds":          { TabIds: TabIds }
  };

  function require(path) {
    console.log('require ', path);
    if (special.hasOwnProperty(path)) {
      return special[path];
    }
    var exports = {};
    return substitute(global, {
      module: { exports: exports },
      exports: exports
    }, function() {
      globalEval(load(path + ".js"));
      return global.exports;
    });
  }

  function load(path) {
    var ret;
    getResource(path, function(resource) {
      ret = resource;
    });
    return ret;
  }

  function getResource(path, fn) {
    port.once('resource.'+path, fn);
    try {
      port.emit('require', path);
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
    tab.emit('ready');
    return tab;
  }

  function attach(opts) {
    var bg = buildBackgroundContext();
    var i;
    if (opts.contentScriptFile) {
      for (i = 0; i < opts.contentScriptFile.length; i += 1) {
        bg.eval(opts.contentScriptFile[i]);
      }
    }
    if (opts.contentScript) {
      setTimeout(function() {
        globalEval(opts.contentScript);
      }, 0);
    }
    return { port: mkPort() };
  }

  function buildBackgroundContext(html) {
    var frame = document.createElement('iframe');
    frame.style.display = "none";
    document.body.appendChild(frame);
    return frame.contentWindow;
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

  function StorageWrapper() {
    this.store = {};  // TODO: persistence
  }
  StorageWrapper.prototype.key = function(idx) {
    return Object.keys(this.store)[idx];
  };
  StorageWrapper.prototype.getItem = function(key) {
    return this.store[key];
  };
  StorageWrapper.prototype.setItem = function(key, value) {
    this.store[key] = value;
  };
  StorageWrapper.prototype.removeItem = function(key) {
    delete this.store[key];
  };
  StorageWrapper.prototype.clear = function() {
    this.store = {};
  };

}(window, jQuery));