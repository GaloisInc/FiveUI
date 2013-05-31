

var fiveui = fiveui || {};

(function() {

fiveui.ajax = fiveui.ajax || {};

/**
 * Use jQuery to get the resource, calling the success or error continuations
 * when the result is returned.  This always retrieves as text, leaving any
 * further processing to the success continuation.
 */
fiveui.ajax.get = function(url, options) {

  _.defaults(options, {
    success:function() {},
    error:  function() {}
  });

  jQuery.ajax(url, {

    dataType: 'text',

    success:function(text) {
      // strip out everything else from the args
      options.success(text);
    },

    error:function() {
      // call with no context
      options.error();
    },

  });

};

})();
