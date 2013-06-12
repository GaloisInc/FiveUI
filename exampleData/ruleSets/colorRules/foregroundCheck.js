exports.name = 'Background Check';

exports.description =
  [ 'Backgrounds colors should be in the set:'
  , '#00 #FF #3D #F7 #C2 #B4 #4E'
  ].join('\n');

exports.rule = function() {
  var rule = this;
  var allow = '#00 #FF #3D #F7 #C2 #B4 #4E #FFCB05 #7B8738'.split(' ');
  $5(':visible')
    .cssIsNot('color', allow, fiveui.color.colorToHex)
    .each(function(i, elt) {
            var color = fiveui.color.colorToHex($(elt).css('color'));
            rule.report('foreground color: ' + color, elt);
          });
};
