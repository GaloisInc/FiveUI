exports.name = "Images should contain a caption";
exports.description = "Images should contain a caption, either using the built-in image syntax or a secondary line of text.";

exports.rule = function(report) {
  $5('#mw-content-text img')
  // Exclude small images, which are probably icons.
  .filter(function(i, img) {
    var $img = $(img);
    return $img.width() > 50 || $img.height() > 50;
  })
  .each(function(i, img) {
    var $parent = $(img).parents(':not(a, td, tr, .thumbimage):first');
    var text    = $.trim($parent.text());
    if (!text) {
      report.warning("Does this image have a caption?", img);
    }
  });
};
