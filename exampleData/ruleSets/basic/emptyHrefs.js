exports.name = "Don't use empty hrefs";
exports.description = "Links with no text can't generally be used";
exports.rule =
  function(report) {
    fiveui.query('a').each(
      function(i, elt) {
        if ($(elt).text() == '' && elt.title == '') {
          report.error('Link has no text', elt);
        }
      });
  };
