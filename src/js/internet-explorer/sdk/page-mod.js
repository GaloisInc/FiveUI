/*globals _fiveui_top */

(function() {
  var tabs = require('sdk/tabs');

  exports.PageMod = PageMod;

  function PageMod(opts) {
    var include = opts.include;
    var i, worker;
    if (include && matches(include)) {
      for (i = 0; i < tabs.length; i += 1) {
        worker = tabs[i].attach(opts);
        if (opts.onAttach) {
          opts.onAttach(worker);
        }
      }
    }
  }

  function matches(url) {
    var loc = _fiveui_top.__intendedLocation;
    return loc && loc === url;
  }
}());
