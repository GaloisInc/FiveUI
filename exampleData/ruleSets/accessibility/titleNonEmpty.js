exports.name = "titleNonEmpty";

exports.description = "Title of page is non-empty";

exports.rule = function(report) {
  if (document.title == '') {
    report.error('Page title is empty');
  }
};
