
exports.name        = 'W3C Guideline 3';
exports.description = '';
exports.rule        = function(report) {

  /* Checkpoint 3.1 [Priority 2] **********************************************/

  // TODO: this seems pretty subjective, as you have to be able to understand
  // the intent of the content.  The math example is tough, as you'd have to be
  // able to pick out a situation where text wasn't marked up, but was also
  // mathematical notation.


  /* Checkpoint 3.2 [Priority 2] **********************************************/

  // require that the document contains a dtd.
  // TODO: how should we apply this check to iframes and such?
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

  // TODO: there are other cases to handle here, not sure about the best path
  // forward.


  /* Checkpoint 3.4 [Priority 2] **********************************************/

  // TODO: not sure what the best way to select everything that's not
  // automatically positioned.  Additionally, many fancy user interfaces will
  // use pixels when positioning content, which isn't necessarily wrong.


  /* Checkpoint 3.5 [Priority 2] **********************************************/

  // TODO: what's the best way to select siblings that match a given pattern in
  // jquery?  Essentially, we just want to match situations where h1 is followed
  // by something that's both a header, and not h2 (for example).


  /* Checkpoint 3.6 [Priority 2] **********************************************/


  /* Checkpoint 3.7 [Priority 2] **********************************************/

  // TODO: is there any way that we can detect quotations that aren't inside of
  // a blockquote region?


};
