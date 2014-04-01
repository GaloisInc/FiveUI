/*jshint browser:true, evil:true, devel:true */
/*globals addGlobalStyle */

(function() {
  var foregroundResources = [
    // compute scripts
    "injected/platform-compute.js",
    "underscore.js",
    "jquery/jquery-1.8.3.js",
    "md5.js",
    "injected/prelude.js",
    "injected/compute.js",

    // ui scripts
    "injected/platform-ui.js",
    "underscore.js",
    // "font-awesome/css/font-awesome.css",  // TODO: Why is this not loading?
    "css/ui.css",
    "jquery/bundled.css",
    "jquery/jquery-1.8.3.js",
    "jquery/jquery-ui-1.9.2.custom.js",
    "injected/injected.css",
    "injected/prelude.js",
    "injected/ui.js",
    "injected/jquery-plugins.js"
  ];
  var backgroundResources = [
    "underscore.js",
    "backbone.js",
    "js/set.js",
    "js/background.js",
    "js/utils.js",
    "js/settings.js",
    "js/messenger.js",
    "js/state.js",
    "js/rules.js"
  ];
  var port = window.port;
  var cssExp = /\.css$/i;

  getResources(backgroundResources, function(resources) {
    var bg = buildBackgroundContext();
    bg.port = port;
    for (var i = 0; i < resources.length; i += 1) {
      bg.eval(resources[i]);
    }
  });

  getResources(foregroundResources, function(resources) {
    var path, resource;
    for (var i = 0; i < resources.length; i += 1) {
      path = foregroundResources[i];
      resource = resources[i];
      if (isCss(path)) {
        addGlobalStyle(resource);
      }
      else {
        eval(resource);
      }
    }
  });

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
    port.once('resource.'+path, fn);
    try {
      port.emit('require', path);
    } catch(_) {
      if (typeof console !== 'undefined' && console.error) {
        console.error('Missing resource: ', path);
      }
    }
  }

  function buildBackgroundContext(html) {
    var frame = document.createElement('iframe');
    frame.style.display = "none";
    document.body.appendChild(frame);
    return frame.contentWindow;
  }

  function isCss(path) {
    return cssExp.test(path);
  }
}());
