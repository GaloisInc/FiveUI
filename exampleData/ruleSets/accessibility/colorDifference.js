exports.name = "colorDifference";

exports.description = "Elements should provide sufficient color difference";

exports.rule = function() {

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

  var that = this;
  fiveui.query('*')
    .filter(function () {  // filter for lowest level elts having non-empty text
      var $this = $(this);
      return $this.children().length == 0 && $.trim($this.text()).length > 0;
    })
    .each(function (i) {
      var fg = fiveui.color.colorToRGB($(this).css('color'));
      var bg = fiveui.color.colorToRGB($(this).css('background-color'));
      if (fg && bg) {
        var diff = colorDiff(fg, bg);
        if (diff < MIN_COLOR_DIFF) {
          that.report('Element has poor color difference: ' + diff, this);
        }
      }
  });
};
