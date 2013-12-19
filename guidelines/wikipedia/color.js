exports.name = "Color use";
exports.description = "Use colors that have sufficient contrast and avoid issues with common forms of color blindness.";

var fc = fiveui.color;
var AA_NORMAL = 4.5;
var AA_BIG = 3;
var AAA_NORMAL = 7;
var AAA_BIG = 4.5;


/**
 * Compute the font size in points, assuming 96dpi.
 */
var fontSizePt = function(elt) {
  var px = $(elt).css('font-size');
  return parseInt(px) * 72 / 96;
};

var isBold = function(elt) {
  return $(elt).css('font-weight') == 'bold';
};

/**
 * See if the text counts as "large scale" according to the W3C:
 * (http://www.w3.org/TR/2008/REC-WCAG20-20081211/#larger-scaledef)
 */
var isLargeScale = function(elt) {
  var size = fontSizePt(elt);
  var bld = isBold(elt);
  return (18 <= size || (14 <= size && bld));
};

var getAARatio = function(elt) {
  if (isLargeScale(elt)) {
    return AA_BIG;
  }
  return AA_NORMAL;
};

var getAAARatio = function(elt) {
  if (isLargeScale(elt)) {
    return AAA_BIG;
  }
  return AAA_NORMAL;
};

exports.rule = function (report) {

  $5('#mw-content-text *')
    // filter for lowest level elts having non-empty text
    .filter(function () {
      var $this = $(this);
      return $this.children().length === 0 && $.trim($this.text()).length > 0;
    })
    .filter(exceptions)
    .each(function (i, elt) {
      var fg = fc.colorToRGB($(this).css('color'));
      var bg = fc.findBGColor($(this));
      if (fg && bg) {
        var ratio = fc.contrast(fc.luminance(fg), fc.luminance(bg));
        if (ratio < getAARatio(elt)) {
          report.error('Element has poor contrast: ' + ratio +
                       " ratio should be greater than " + getAARatio(elt), elt);
        } else if (ratio < getAAARatio(elt)){
          report.warning('Element has poor contrast: ' + ratio +
                      " ratio should be greater than " + getAAARatio(elt), elt);
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
