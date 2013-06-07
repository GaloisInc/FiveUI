exports.name = "Disallow Empty Headers";

exports.description = "Heading elements should contain text.";

exports.rule = function() {
                 fiveui.query(':header').each(
                   function(ix, elt) {
                     if($(elt).text() == '') {
                       report('Heading does not contain text', elt);
                     }
                   });
               };
