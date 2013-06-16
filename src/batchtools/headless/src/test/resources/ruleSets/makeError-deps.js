exports.name = "Generate Errors - custom";
exports.description = "Always report an error";
exports.rule = function(report) {
  myReport(report, "error");
};