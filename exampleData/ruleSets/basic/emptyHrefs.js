exports.name = "Don't use empty hrefs";
exports.description = "Links with no text can't generally be used";
exports.rule =
  function() {
    var that = this;
    fiveui.query('a').each(
      function(i, elt) {
        if ($(elt).text() == '' && elt.title == '') {
          that.report('Link has no text', elt);
        }
      });
  };
