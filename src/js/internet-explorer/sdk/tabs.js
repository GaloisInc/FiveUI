/*jshint evil:true */
/*globals _fiveui_top */

(function($) {
  var data = require('sdk/self').data;

  var tabs  = [mkTab()];
  tabs.on   = id;  // Ignore tab collection events for now.
  tabs.open = openWindow;

  exports = tabs;

  function mkTab() {
    var tab = mkPort('memory');
    tab.attach = attach;
    tab.url    = _fiveui_top.location.href;
    // None of this code is injected until after the load event, so
    // don't bother waiting for 'ready'.
    setTimeout(function() {
      tab.emit('activate');
      tab.emit('ready');
    }, 0);
    return tab;
  }

  function attach(opts) {
    var port = _fiveui_top.obtainPort ? _fiveui_top.obtainPort() : mkPort();
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
        setTimeout(function() {
          var callbacks = listeners[eventType];
          if (callbacks) {
            callbacks.fire(data);
          }
        }, 0);
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

  function openWindow(url) {
    var html    = data.load(url);
    var scripts = yankScripts(html);
    var sheets  = yankStyleSheets(html);
    var title   = yankTitle(html);
    var body    = yankBody(html);
    var win = open();
    win.document.title = title;
    insertHtml(win.document, win.document.body, body);
    win.__intendedLocation = url;
    win.eval(data.load("jquery/jquery-1.8.3.js"));
    win.eval(data.load("sdk/jetpack-shim.js"));
    var i;
    for (i = 0; i < scripts.length; i += 1) {
      win.eval(data.load(scripts[i]));
    }
    for (i = 0; i < sheets.length; i += 1) {
      addGlobalStyle(win.document, data.load(sheets[i]));
    }
  }

  var scriptSrc = /<\s*script [^>]*src\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>[^<>]*<\s*\/\s*script\s*>/gi;
  var linkRel = /<\s*link [^>]*rel\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*\/\s*>/i;
  var linkHref = /<\s*link [^>]*href\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*\/\s*>/gi;
  var bodyExp = /<\s*body(?: [^>]*)?>([\s\S]*?)<\s*\/\s*body\s*>/i;
  var titleExp = /<\s*title(?: [^>]*)?>([\s\S]*?)<\s*\/\s*title\s*>/i;

  function yankScripts(html) {
    var scripts = [];
    html.replace(scriptSrc, function(_, src) {
      scripts.push(src);
      return '';
    });
    return scripts;
  }

  function yankStyleSheets(html) {
    var sheets = [];
    html.replace(linkHref, function(link, href) {
      var matches = link.match(linkRel);
      if (matches && matches[1].toLowerCase() === 'stylesheet') {
        sheets.push(href);
      }
      return '';
    });
    return sheets;
  }

  function yankBody(html) {
    var matches = html.match(bodyExp);
    if (matches) {
      return matches[1];
    }
  }

  function yankTitle(html) {
    var matches = html.match(titleExp);
    if (matches) {
      return matches[1];
    }
  }

  function injectCss(win, css) {
    setTimeout(function() {
      win.obtainPort().emit('injectCSS', css);
    }, 2000);
  }

  /**
   * @param {!document} doc HTML document to add style to
   * @param {!string} css The css to inject.
   */
  function addGlobalStyle(doc, css) {
    var head = doc.getElementsByTagName('head')[0]; // find head element, which should exist
    if (!head) {
      head = doc.createElement('head');

      // XXX this is perhaps not reliable?
      doc.body.appendChild(head);
    }

    var style = doc.createElement('style');         // create <style> element
    style.type = 'text/css';

    if (style.styleSheet) {                              // for some cross-browser problem
      style.styleSheet.cssText = css;                    // attach CSS text to style elt
    } else {
      style.appendChild(doc.createTextNode(css));   // attach CSS text to style elt
    }
    head.appendChild(style);                             // attach style element to head
  }

  function insertHtml(doc, parent, html) {
    var elem = doc.createElement('div');
    elem.innerHTML = html;
    for (var i = 0; i < elem.children.length; i += 1) {
      parent.appendChild(elem.children[i]);
    }
  }
}(jQuery));
