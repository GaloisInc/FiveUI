exports.name = "Do not make pseudo-headings";
exports.description = "Do not make pseudo-headings using bold or semicolon markup.";

exports.rule = function(report) {
  $5('#mw-content-text p > b:only-child').each(function(i, b) {
    var text = $.trim($(b).text());
    report.error('Bold text used as pseudo-heading: '+ text, b);
  });

  $5('#mw-content-text dl:not(:has(dd)) dt').each(function(i, dt) {
    var text = $.trim($(dt).text());
    report.error('Semicolon markup used to create pseudo-heading: '+ text, dt);
  });
};
