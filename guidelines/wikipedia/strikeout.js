exports.name = "Don't use strikeout.";
exports.description = "By default, most screen readers do not indicate presentational text attributes (bold, italic, underline) or even semantic text attributes (emphasis, importance, text deletion), so struck-out text is read normally along with any other text.";

exports.rule = function (report) {
  var err = function(idx, elt) {
    report.error("Strikeout tags should not be used.", elt);
  };

  $5('#mw-content-text del').each(err);
  $5('#mw-content-text strike').each(err);
  $5('#mw-content-text span').filter(function(i, s) {
    return (/line-through/).test($(s).css('text-decoration'));
  }).each(err);
};
