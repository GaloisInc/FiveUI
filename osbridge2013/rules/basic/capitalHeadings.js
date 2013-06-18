exports.name = 'Capitalized headings';
exports.description = 'All headings should lead with a capital letter';

exports.rule = function(report) {
  var badHeadings = $5(':header').filter(
    function(idx) {
      var txt = $(this).text();
      var ch = $.trim(txt)[0];
      if (ch) {
        return (ch == ch.toLowerCase());
      }
      else {
        return false;
      }
    });
  $(badHeadings).each(function(i, elt) {
    report.error('Heading does not start with a capital letter', elt);
  });
};
