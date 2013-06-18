exports.name = "headingExists";

exports.description = "Page contains at least one heading";

exports.rule = function(report) {
  var headings = fiveui.query(':header');
  if (0 == headings.length) {
    report.error('No headings found on page');
  }
};
