
var fiveui  = fiveui || {};
var Request = require('sdk/request').Request;
var _       = require('underscore');

(function() {

/**
 * Use the request api to make an XHR request from the extension context.
 * Behaves somewhat like the jQuery.ajax method, but only ever returns the text
 * content of the response.
 */
exports.get = function(url, opts) {

  _.defaults(opts, {
    success: function() {},
    error:   function() {}
  });

  Request({

    url: url,

    onComplete:function(resp) {
      if(resp.status == 200) {
        opts.success(resp.text);
      } else {
        opts.error();
      }
    }

  }).get();

};

})();
