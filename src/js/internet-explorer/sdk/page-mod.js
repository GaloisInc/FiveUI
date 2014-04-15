/*globals _fiveui_top */

(function() {
  var tabs = require('sdk/tabs');

  exports.PageMod = PageMod;

  function PageMod(opts) {
    var include = opts.include;
    setTimeout(function() {
      if (include && matches(include)) {
        attach(opts);
      }
    }, 2000);
  }

  function attach(opts) {
    var i, worker;
    for (i = 0; i < tabs.length; i += 1) {
      worker = tabs[i].attach(opts);
      if (opts.onAttach) {
        opts.onAttach(worker);
      }
    }
  }

  function matches(url) {
    var loc = typeof _fiveui_top !== 'undefined' && _fiveui_top.__intendedLocation;
    return loc && loc === url;
  }
}());
