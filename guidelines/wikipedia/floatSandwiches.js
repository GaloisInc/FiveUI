exports.name = "Floating content on both sides of screen";
exports.description = "Be careful not to add images or other floating content on both sides of the screen simultaneously.";

exports.rule = function(report) {
  var $topElems = $5('#mw-content-text > *');
  var left      = floating($topElems, 'left').toArray().map($);
  var right     = floating($topElems, 'right').toArray().map($);

  left.forEach(function($l) {
    var ltop    = $l.offset().top;
    var lbottom = ltop + $l.outerHeight();

    if (right.some(function($r) {
      var rtop    = $r.offset().top;
      var rbottom = rtop + $r.outerHeight();

      return (rtop > ltop && rtop < lbottom) ||
        (rbottom > ltop && rbottom < lbottom);
    })) {
      report.warning('Left and right floating elements overlap vertically.', $l.get(0));
    }
  });
};

function floating($elems, leftOrRight) {
  return $elems.filter(function() {
    return $(this).css('float') === leftOrRight;
  });
}
