exports.name = "Images should include an alt attribute";
exports.description = "Images should include an alt attribute that acts as a substitute for the image (for non-visual users).";

exports.rule = function(report) {
  var hasAlt = function(ix) {
    var alt = $.trim($(this).attr('alt'));
    var longdesc = $.trim($(this).attr('longdesc'));
    if(_.isEmpty(alt) && _.isEmpty(longdesc)) {
      report.warning('No alt/longdesc specified', this);
    }
  };

  $5('#mw-content-text').find('img').each(hasAlt);
};
