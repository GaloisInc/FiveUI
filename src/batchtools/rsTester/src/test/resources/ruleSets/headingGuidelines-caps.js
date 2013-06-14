exports.name = "Headings are capitalized";

exports.description = "Check to see if all headings use leading capital letters.";

exports.rule = function(r) {
  var badHeadings =
    fiveui.query(':header').filter(
      function(idx) {
        var ch = $(this).text()[0];
        if (ch) {
          return (ch == ch.toLowerCase());
        } else {
          return false;
        }
      });
  $(badHeadings).map(function(idx, elt) {
                       r.error('Heading does not start with a capital letter.', elt);
                     });
};
