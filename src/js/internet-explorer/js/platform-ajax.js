/*globals _fiveui_ajax */

var fiveui      = fiveui      || {};
fiveui.ajax     = fiveui.ajax || {};

fiveui.ajax.get = function (url) {
  var promise = new RSVP.Promise(function(resolve, reject) {
    _fiveui_ajax.get(url, resolve, reject);
  });
  return promise;
};

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = fiveui.ajax;
  }
  exports.ajax = fiveui.ajax;
}
