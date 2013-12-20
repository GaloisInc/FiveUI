exports.name = "Do not use colon markup for indentation";
exports.description = "Preceding text with a colon (:) in wiki markup causes that text to appear to be indented; but the actual result is a definition list with one item without a title.";

exports.rule = function(report) {
  $5('#mw-content-text dl:not(:has(dt)) dd').each(function(i, dd) {
    var text = $.trim($(dd).text());
    report.error('Colon markup used to indent text: '+ text, dd);
  });
};

