exports.name = "titleExists";

exports.description = "Title of page should not be empty";

exports.rule = function(report) {
  if (document.title == '') {
    report.error('Page title is empty');
  }
};
