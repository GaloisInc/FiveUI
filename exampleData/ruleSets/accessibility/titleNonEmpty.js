exports.name = "titleNonEmpty";

exports.description = "Title of page is non-empty";

exports.rule = function() {
  if (document.title == '') {
    this.report('Page title is empty');
  }
};
