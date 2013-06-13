exports.name = 'All input fields have exactly one label.';
exports.description = '<p>Screen readers rely on HTML attributes to identify the purpose '
                     + "of form widgets on-screen.  These tools use label tags with 'for' "
                     + 'attributes that specify the id of the form element they pertain to. '
                     + 'Some of the components of this web page do not have those labels.</p>';

exports.rule = function() {
  var that = this;
  fiveui.query(':input').each(
    function(i, elt) {
      if (elt.id) {
        var $label = fiveui.query("label[for='" + elt.id + "']");

        if (1 < $label.size()) {
          that.report('Form element has too many labels', elt);
        }

        if (0 == $label.size()) {
          that.report('Form element has no label', elt);
        }
      }
  });
}
