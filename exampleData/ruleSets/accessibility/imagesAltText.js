exports.name = "imagesAltText";

exports.description = "Each image should have an alternative text description";

exports.rule = function(report) {
  fiveui.query('img')
     .filter(function (i) {
               return $(this).attr('alt') == '';
             })
     .each(function (i, e) {
             report.error('Image has no alt text', e);
           });
};
