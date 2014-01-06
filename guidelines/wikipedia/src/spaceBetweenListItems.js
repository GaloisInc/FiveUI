exports.name = "Do not separate list items with blank lines";
exports.description = "Leaving blank lines between list items causes mediawiki to end one list and to start a new one.";

exports.rule = function(report) {
  $5('ol:has(> li:only-of-type) + ol:has(> li:only-of-type)').each(reportWarning);
  $5('ul:has(> li:only-of-type) + ul:has(> li:only-of-type)').each(reportWarning);

  $5('dl:has(> dt:only-of-type):has(> dd:only-of-type) + '+
     'dl:has(> dt:only-of-type):has(> dd:only-of-type)').each(reportWarning);

  function reportWarning(i, list) {
    var text = $.trim($(list).text());
    report.warning('List with a single item: '+ text, list);
  }
};
