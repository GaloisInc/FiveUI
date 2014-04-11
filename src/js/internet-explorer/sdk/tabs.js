/*jshint evil:true */
/*globals _fiveui_top */

(function() {
  var data = require('sdk/self').data;

  exports = [mkTab()];
  exports.on = id;  // Ignore tab collection events for now.

  function mkTab() {
    var tab = mkPort('memory');
    tab.attach = attach;
    // None of this code is injected until after the load event, so
    // don't bother waiting for 'ready'.
    setTimeout(function() {
      tab.emit('activate');
      tab.emit('ready');
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

  function getResources(resourcePaths, fn) {
    var resources = jQuery.map(resourcePaths, function(path) {
      return data.load(path);
    });
    fn(resources);
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

  function id(x) {
    return x;
  }
}());
