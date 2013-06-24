/**
 * Provide equivalent alternatives to auditory and visual content
 */

exports.name        = "Equivalent Alternatives";
exports.description = "";

exports.rule        = function(report) {

  var hasAlt = function(type) {
    return function(ix) {
      if(_.isEmpty($(this).attr('alt'))) {
        report.error('No alt text specified for ' + type + ' element', this);
      }
    };
  };

  // We treat anchors with images as a child as things that should contain
  // alternatives.
  $5('a').find('img').each(hasAlt('img'));

  // All input tags must have an alt attribute.
  $5('input').each(hasAlt('input'));

  // All applet tags must have an alt attribute.
  $5('applet').each(hasAlt('applet'));

  // All object tags must have an alt attribute.
  $5('object').each(hasAlt('applet'));
};
