exports.name = "Disallow Empty Headers";

exports.description = "Heading elements should contain text.";

exports.rule = function() {
                 var r = this;
                 fiveui.query(':header').each(
                   function(ix, elt) {
                     if($(elt).text() == '') {
                       r.report('Heading does not contain text', elt);
                     }
                   });
               };
