exports.name = "There should only be one blank line between paragraphs";
exports.description = "Between sections - as between sections - there should be only a single blank line.";

exports.rule = function(report) {
  var problemPs = [];

  $5('p:has(> br)').each(function(i, p) {
    var $p = $(p), prevP;
    if ($.trim($p.text()).length === 0) {
      prevP = $p.prevUntil(':not(p)').filter(function(i, pp) {
        return $.trim($(pp).text()).length > 0;
      }).first();

      if (prevP.length) {
        problemPs.push(prevP.get(0));
      }
      else {
        report.error('Paragraph contains line breaks but does not contain text.', p);
      }
    }
  });

  _.uniq(problemPs, false).forEach(function(p) {
    var text = $.trim($(p).text());
    report.error('Paragraph is followed by more than one blank line: '+ text, p);
  });
};

