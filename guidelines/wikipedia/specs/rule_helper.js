function run(rule) {
  var warnings = [];
  var errors   = [];
  rule({
    warning: function(msg, elem) {
      warnings.push({
        message: msg,
        element: elem
      });
    },
    error: function(msg, elem) {
      errors.push({
        message: msg,
        element: elem
      });
    }
  });
  return {
    warnings: warnings,
    errors:   errors
  };
}
