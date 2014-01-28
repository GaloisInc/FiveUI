
var fiveui  = fiveui || {};
var Request = require('sdk/request').Request;
var RSVP    = require('rsvp');

(function() {

/**
 * Use the request api to make an XHR request from the extension context.
 * Behaves somewhat like the jQuery.ajax method, but only ever returns the text
 * content of the response.
 */
exports.get = function(url) {
  return new RSVP.Promise(function(resolve, reject) {
    Request({

      url: url,

      onComplete:function(resp) {
        if(resp.status == 200) {
          resolve(resp.text);
        } else {
          reject();
        }
      },

    }).get();
  });
};

})();
