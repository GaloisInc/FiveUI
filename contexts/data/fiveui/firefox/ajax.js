
var fiveui  = fiveui || {};
var Request = require('request').Request;

(function() {

fiveui.ajax = fiveui.ajax || {};

/**
 * Use the request api to make an XHR request from the extension context.
 * Behaves somewhat like the jQuery.ajax method, but only ever returns the text
 * content of the response.
 */
fiveui.ajax.get = function(url, opts) {

  _.defaults(opts, {
    success: function() {},
    error:   function() {},
  });

  Request({

    url: url,

    onComplete:function(resp) {
      if(resp.status == 200) {
        opts.success(resp.text);
      } else {
        opts.error();
      }
    },

  }).get();

};

})();
