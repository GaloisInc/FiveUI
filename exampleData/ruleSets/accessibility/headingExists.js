exports.name = "headingExists";

exports.description = "Page contains at least one heading";

exports.rule = function() {
  var headings = fiveui.query(':header');
  if (0 == headings.length) {
    this.report('No headings found on page');
  }
};
