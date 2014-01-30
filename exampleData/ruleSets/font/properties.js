exports.name = 'Font properties check';
exports.description = 'Verify that fonts (family, size, weight) are \"standard\"';

exports.rule = function(report) {
  var allow = {
      'Verdana': { 'bold': [25, 22, 12, 10]
                 , 'normal': [12, 11, 10] }};
  fiveui.query('body p,:header').each(function(i, elt) {
    var font = fiveui.font.getFont($(elt));
    if (!fiveui.font.validate(allow, font)) {
      report.error('non-standard font: ' +
                   font.family + ', ' +
                   font.size + ', ' +
                   font.weight, elt);
    }
  });
};
