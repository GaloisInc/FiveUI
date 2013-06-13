exports.name = "Generate Errors";
exports.description = "Always report an error";
exports.rule = function() {
  var r = this;
  r.report("error", null);
};