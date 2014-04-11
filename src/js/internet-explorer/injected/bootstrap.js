/*jshint browser:true, evil:true, devel:true */
/*globals _fiveui_port, _fiveui_store, _fiveui_ajax */

(function() {
  var scripts = [
    "jquery/jquery-1.8.3.js",
    "sdk/jetpack-shim.js"
  ];

  getResources(scripts, function(resources) {
    buildBackgroundContext(function(bg) {
      bg._fiveui_ajax  = _fiveui_ajax;
      bg._fiveui_port  = _fiveui_port;
      bg._fiveui_store = _fiveui_store;
      bg._fiveui_top   = window;
      for (var i = 0; i < resources.length; i += 1) {
        bg.eval(resources[i]);
      }
    });
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
    _fiveui_port.once('resource.'+path, fn);
    try {
      _fiveui_port.emit('require', path);
    } catch(_) {
      if (typeof console !== 'undefined' && console.error) {
        console.error('Missing resource: ', path);
      }
    }
  }

  function buildBackgroundContext(fn) {
    var frame = document.createElement('iframe');
    frame.style.display = "none";
    document.body.appendChild(frame);
    frame.contentWindow.addEventListener('load', function() {
      fn(frame.contentWindow);
    });
  }
}());
