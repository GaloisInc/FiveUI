

var fiveui = fiveui || {};

(function() {

fiveui.ajax = fiveui.ajax || {};

/**
 * Use jQuery to get the resource, calling the success or error continuations
 * when the result is returned.  This always retrieves as text, leaving any
 * further processing to the success continuation.
 */
fiveui.ajax.get = function(url, options) {
  return new RSVP.Promise(function(resolve, reject) {

    jQuery.ajax(url, {
      cache: false,
      dataType: 'text',
    })

    // Converts jQuery promise to RSVP so that chaining works correctly.
    .then(resolve, reject);

  });
};

})();
