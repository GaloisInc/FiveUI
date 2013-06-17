
exports.name = 'Foreground Check';

exports.description =
  [ 'Foreground colors should be in the set:'
  , '#00 #FF #3D #F7 #C2 #B4 #4E #FFCB05 #7B8738'
  ].join('\n');

exports.rule = function(report) {
  var allow = '#00 #FF #3D #F7 #C2 #B4 #4E'.split(' ');
  $5(':visible')
    .cssIsNot('background-color', allow, fiveui.color.colorToHex)
    .each(function(i, elt) {
       var color = fiveui.color.colorToHex($(elt).css('background-color'));
       report.error('non-standard background color: ' + color, $(elt));
    });
};
