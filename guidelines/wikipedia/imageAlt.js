exports.name = "Images should include an alt attribute";
exports.description = "Images should include an alt attribute, even an empty one, that acts as a substitute for the image (for non-visual users).";

exports.rule = function(report) {
  $5('#mw-content-text img:not([alt])').each(function(i, img) {
    report.warning("Image has no alt attribute.", img);
  });
};
