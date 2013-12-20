exports.name = "Do not separate list items with blank lines";
exports.description = "Leaving blank lines between list items causes mediawiki to end one list and to start a new one.";

exports.rule = function(report) {
  $5('li:only-of-type').each(reportWarning);
  $5('dl:has(dt):has(dd)').each(function(i, dl) {
    var $dd = $(dl).find('dd');
    if ($dd.length === 1) {
      reportWarning(i, dl);
    }
  });

  function reportWarning(i, li) {
    var text = $.trim($(li).text());
    report.warning('List with a single item: '+ text, li);
  }
};
