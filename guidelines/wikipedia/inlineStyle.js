exports.name = "Do not use in-line styles";
exports.description = "In-line styles make it much harder for people with specific needs to change the wikimedia styles and to retain consistency.";

exports.rule = function(report) {
  $5('#mw-content-text [style]').filter(excludes).each(function(i, elem) {
    report.error("Element contains in-line style rules.", elem);
  });
};

function excludes(i, elem) {
  var $elem = $(elem);

  // Ignore width rules.
  var widthRule = everyStyle($elem, function(s) {
    return s === 'width';
  });

  // It seems that Wikipedia's standard table templates include some
  // inline styles.  Ignore these.
  var table = $elem.is('table, th, td');

  // The standard reference list template also seems to include some
  // inline styles.
  var reference = $elem.hasClass('reflist references-column-width') ||
    $elem.hasClass('error') ||
    ($elem.is('.citation ~ * *') && !$.trim($elem.text())); // <span>&nbsp;</span>

  // The [citation needed] template includes a white-space:nowrap style.
  var citationNeeded = $elem.hasClass('Template-Fact') && everyStyle($elem, function(s) {
    return s === 'white-space';
  });

  var navboxPadding = $elem.closest('.navbox').length > 0 && everyStyle($elem, function(s) {
    return s.slice(0,7) === 'padding';
  });

  // Ignore hidden microformat fields.
  var microformat = $elem.css('display') === 'none' &&
    $elem.closest('.vcard, .vevent').length > 0;

  return !widthRule && !table && !reference && !citationNeeded &&
    !navboxPadding && !microformat;
}

function everyStyle($elem, fn) {
  return Array.prototype.every.call($elem.prop('style'), fn);
}
