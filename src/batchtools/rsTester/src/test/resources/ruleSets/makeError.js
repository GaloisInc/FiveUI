exports.name = "Generate Errors";
exports.description = "Always report an error";
exports.rule = function(report) {
  report.error("error", null);
};