/*jshint browser:true, evil:true, devel:true */

(function() {
  var backgroundScripts = [
    "underscore.js",
    "backbone.js",
    "js/set.js",
    "js/background.js",
    "js/utils.js",
    "js/settings.js",
    "js/messenger.js",
    "js/state.js",
    "js/rules.js",
    "js/platform-port.js",
    "js/platform-background.js"
  ];
  var port = window.port;

  getScripts(backgroundScripts, function(scripts) {
    var bg = buildBackgroundContext();
    bg.port = port;
    for (var i = 0; i < scripts.length; i += 1) {
      bg.eval(scripts[i]);
    }
  });

  function getScripts(scriptPaths, fn) {
    (function getScripts_(paths, scripts) {
      var head, tail;
      if (paths.length === 0) {
        fn(scripts);
      }
      else {
        head = paths[0];
        tail = paths.slice(1);
        getScript(head, function(content) {
          getScripts_(tail, scripts.concat(content));
        });
      }
    }(scriptPaths.slice(), []));
  }

  function getScript(path, fn) {
    port.once('script.'+path, fn);
    try {
      port.emit('require', path);
    } catch(_) {
      if (typeof console !== 'undefined' && console.error) {
        console.error('Missing script: ', path);
      }
    }
  }

  function buildBackgroundContext(html) {
    var frame = document.createElement('iframe');
    frame.style.display = "none";
    document.body.appendChild(frame);
    return frame.contentWindow;
  }
}());
