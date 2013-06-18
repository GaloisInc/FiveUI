exports.name = "imagesAltText";

exports.description = "Each image should have an alternative text description";

exports.rule = function(report) {
  fiveui.query('img')
     .filter(function (i) {
               var altAttr = $(this).attr('alt');
               return altAttr == undefined || altAttr  == '';
             })
     .each(function (i, e) {
             report.error('Image has no alt text', e);
           });
};
