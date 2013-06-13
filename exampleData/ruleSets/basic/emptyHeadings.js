exports.name = "Don't use empty headings";
exports.description = 'Empty headings confuse layout';
exports.rule =
  function() {
    var that = this;
    fiveui.query(':header').each(
      function(i, elt) {
        if ($(elt).text() == '') {
          that.report('Heading is empty', elt);
        }
      }
    );
  };
