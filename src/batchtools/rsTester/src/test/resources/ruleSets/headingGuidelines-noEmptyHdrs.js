exports.name = "Disallow Empty Headers";

exports.description = "Heading elements should contain text.";

exports.rule = function(r) {
                 $5(':header').each(
                   function(ix, elt) {
                     if($(elt).text() == '') {
                       r.error('Heading does not contain text', elt);
                     }
                   });
               };
