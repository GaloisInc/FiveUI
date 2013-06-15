exports.name = "Don't use empty headings";

exports.description = "Empty headings confuse layout";

exports.rule =
  function(report) {
    $5(':header').each(
      function(i, elt) {
        if ($(elt).text() == '') {
          report.error('Heading is empty', elt);
        }
      }
    );
  };
