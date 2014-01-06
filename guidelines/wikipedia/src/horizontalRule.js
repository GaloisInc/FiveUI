exports.name = "Horizontal rules are deprecated";
exports.description = "Horizontal rules (----) are deprecated.";

exports.rule = function(report) {
  $5('#mw-content-text hr').each(function(i, hr) {
    report.warning('Remove horizontal rule.', hr);
  });
};
