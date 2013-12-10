exports.name = "Color use";
exports.description = "Use colors that have sufficient contrast and avoid issues with common forms of color blindness.";

var fc = fiveui.color;
var AA_RATIO = 4.5;
var AAA_RATIO = 7;

exports.rule = function (report) {
  $5('#mw-content-text *')
    // filter for lowest level elts having non-empty text
    .filter(function () {
      var $this = $(this);
      return $this.children().length == 0 && $.trim($this.text()).length > 0;
    })
    .filter(exceptions)
    .each(function (i) {
      var fg = fc.colorToRGB($(this).css('color'));
      var bg = fc.findBGColor($(this));
      if (fg && bg) {
        var ratio = fc.contrast(fc.luminance(fg), fc.luminance(bg));

        if (ratio < AA_RATIO) {
          report.error('Element has poor contrast: ' + ratio +
                       " ratio should be greater than " + AA_RATIO, this);
        } else if (ratio < AAA_RATIO){
          report.warning('Element has poor contrast: ' + ratio +
                      " ratio should be greater than " + AAA_RATIO, this);
        }
      }
  });
};

function exceptions() {
  var $elem = $(this);
  return !isStandardLink($elem) &&
    !isNavboxLink($elem);
}

function isStandardLink($elem) {
  var standard = ['new', 'external', 'extiw'];
  var $a = $elem.closest('a');
  return $a.is('a') && standard.some(function(klass) {
    return $a.hasClass(klass);
  });
}

function isNavboxLink($elem) {
  var $a = $elem.closest('a');
  var $nav = $a.closest('th.navbox-group');
  return $a.length > 0 && $nav.length > 0;
}
