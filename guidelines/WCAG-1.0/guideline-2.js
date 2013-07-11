exports.name        = "Color Difference";
exports.description = "Web Accessibility Guideline: Don't rely on color alone";
exports.rule        = function(report) {

  /* Checkpoint 2.2 ***********************************************************/

  var fc = fiveui.color;
  var MIN_COLOR_DIFF = 500; // http://www.w3.org/TR/2000/WD-AERT-20000426#color

  /**
   * Return the absolute "color difference" between two * given RGB color
   * objects.
   * Input is two RGB color objects.
   */
  var colorDiff = function (c1, c2) {
    return Math.abs(c1.r - c2.r) +
           Math.abs(c1.g - c2.g) +
           Math.abs(c1.b - c2.b);
  };

  fiveui.query('*')
    .filter(function () {  // filter for lowest level elts having non-empty text
      var $this = $(this);
      return $this.children().length == 0 && $.trim($this.text()).length > 0;
    })
    .each(function (i) {
      var fg = fc.colorToRGB($(this).css('color'));
      var bg = fc.findBGColor($(this));
      if (fg && bg) {
        var diff = colorDiff(fg, bg);
        if (diff < MIN_COLOR_DIFF) {
          report.error('Element has poor color difference: ' + diff, this);
        }
      }
  });
};
