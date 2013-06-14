exports.name = "colorBrightness";

exports.description = "Elements should provide sufficient color brightness " +
                      "difference";

exports.rule = function(report) {
  var fc = fiveui.color;
  var MIN_DIFF = 125; // http://www.w3.org/TR/2000/WD-AERT-20000426#color

  /**
   * Return a weighted average of RGB values. See
   * http://www.w3.org/TR/2000/WD-AERT-20000426#color
   * Input is an RGB color object: { r: <r>, g: <g>, b: <b> }.
   */
  var bright = function (c) {
    return (c.r*299 + c.g*587 + c.b*114) / 1000.0;
  };

  /**
   * Return the absolute difference between brightnesses of the
   * given RGB color objects.
   * Input is two RGB color objects (see `bright`).
   */
  var brightDiff = function (c1, c2) {
    return Math.abs(bright(c1) - bright(c2));
  };

  fiveui.query('*')
    .filter(function () {  // filter for lowest level elts having non-empty text
      var $this = $(this);
      return $this.children().length == 0 && $.trim($this.text()).length > 0;
    })
    .each(function (i) {
      // TODO take into account alpha values in the foreground
      var fg = fc.colorToRGB($(this).css('color'));
      var bg = fc.findBGColor($(this));
      if (fg && bg) {
        var diff = brightDiff(fg, bg);
        if (diff < MIN_DIFF) {
          report.error('Element has poor brightness difference: ' +
                       'fg = ' + JSON.stringify(fg) +
                       ', fgb = ' + bright(fg) +
                       ', bg = ' + JSON.stringify(bg) +
                       ', bgb = ' + bright(bg), this);
        }
      }
    });
};
