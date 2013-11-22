exports.name = "Don't use strikeout.";
exports.description = "Strikout tags are poorly supported by screenreaders, which can cause confusion.";

exports.rule = function (report) {
  var err = function(idx, elt) {
    report.error("Strikeout tags should not be used.", elt);
  };

  $5('#mw-content-text del').each(err);
  $5('#mw-content-text strike').each(err);
};