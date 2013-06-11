exports.name = "imagesAltText";

exports.description = "Each image should have an alternative text description";

exports.rule = function() {
  var that = this;
  fiveui.query('img')
     .filter(function (i) {
               return $(this).attr('alt') == '';
             })
     .each(function (i, e) {
             that.report('Image has no alt text', e);
           });
};
