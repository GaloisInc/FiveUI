exports.name = "Minimize use of bullet points";
exports.description = "Bullet points should be minimized in the body and lead of the article, if they are used at all.";

exports.rule = function(report) {
  $5('#mw-content-text > ul, #mw-content-text > ol').each(function() {
    report.warning('Minimize use of bullet points.', this);
  });
};
