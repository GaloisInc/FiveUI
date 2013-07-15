
exports.name        = 'Proper Markup and Stylesheets';
exports.description = 'Web Accessibility Guideline: Use markup and style sheets and do so properly';
exports.rule        = function(report) {

  /* Checkpoint 3.2 [Priority 2] **********************************************/

  // require that the document contains a dtd.
  if(!document.doctype) {
    report.error('No doctype given for the document', null);
  }


  /* Checkpoint 3.3 [Priority 2] **********************************************/

  // use style sheets instead of HTML attributes to specify formatting
  // information.
  $5('b').each(function() {
    report.error('The b tag shouldn\'t be used, use strong instead', this);
  });

  $5('i').each(function() {
    report.error('The i tag shouldn\'t be used, use em', this);
  });

  $5('[font]').each(function() {
    report.error('Use css instead of the font attribute for formatting', this);
  });


  /* Checkpoint 3.5 [Priority 2] **********************************************/

  // header transitions which are not allowed
  var avoids = [ ["H1", "H3"]
               , ["H1", "H4"]
               , ["H1", "H5"]
               , ["H2", "H4"]
               , ["H2", "H5"]
               , ["H3", "H5"] ];

  // return true if the value `p` is in `avoids`. underscore's
  // _.contains doesn't work here because it compares array references
  var badPair = function (p) {
    return _.find(avoids, function (s) {
      return s[0] == p[0] && s[1] == p[1];
    });
  };

  // examine the sequence of headings in each <div> for
  // proper order
  $('div').each(function (i, elt) {
    var hs = $(elt).find(':header');
    var ts = $(hs).map(function () { return this.tagName; });
    for (var j=0; j < hs.length-1; j++) {
      if (badPair([ts[j], ts[j+1]])) {
        report.error('Invalid use of headers ' + ts[j] + ' -> ' + ts[j+1], hs[j+1]);
      }
    }
  });


  /* Checkpoint 3.6 [Priority 2] **********************************************/


  /* Checkpoint 3.7 [Priority 2] **********************************************/

};
