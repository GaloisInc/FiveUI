exports.name = "Avoid single-sentence paragraphs";
exports.description = "The number of single-sentence paragraphs should be minimized.";

exports.rule = function(report) {
  var sentenceBoundary = /[.?!](?:(?:\[\d+\])|['"])*(?:\s|$)/gm;

  $5('#mw-content-text p').each(function(i, p) {
    var $p         = $(p);
    var text       = $.trim($p.text());
    var boundaries = text && text.match(sentenceBoundary);
    if (boundaries && boundaries.length === 1) {
      report.warning('Paragraph with only one sentence: "' + text +'"', p);
    }
  });
};
