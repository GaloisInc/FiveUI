exports.name = "Large image";
exports.description = "Images should be sized for comfortable display on the smallest displays in common use.";

exports.rule = function(report) {
  $5('#mw-content-text img').each(function() {
    var $img = $(this);
    if ($img.width() > 400 && !centered($img) && !locationNone($img)) {
      report.warning('Image is more than 400px wide.  Consider using the "center" or "none" location options for wide images', this);
    }
    if ($img.height() > 500) {
      report.warning('Image is more than 500px tall.', this);
    }
  });
};

function centered($img) {
  return $img.closest('.center').length > 0;
}

function locationNone($img) {
  return !centered($img) && $img.closest('.tnone').length > 0;
}
