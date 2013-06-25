/**
 * Provide equivalent alternatives to auditory and visual content
 */

exports.name        = "Equivalent Alternatives";
exports.description = "";

exports.rule        = function(report) {


  /* Checkpoint 1.1 [Priority 1] **********************************************/

  var hasAlt = function(ix) {
    // TODO: strip space from the alt attribute to prevent ' ' from passing
    // the test
    if(_.isEmpty($(this).attr('alt')) && _.isEmpty($(this).attr('longdesc'))) {
      report.error('No alt/longdesc specified', this);
    }
  };

  var hasText = function(ix) {
    // TODO: strip space from the text to prevent ' ' from passing the test
    if(_.isEmpty($(this).text())) {
      report.error('No text node', this);
    }
  };

  // images with semantic meaning should have an alt attribute.
  $5('a').find('img')
    .add($5('dl').find('img'))
    .add($5('dd').find('img'))
      .each(hasAlt);

  // All `input` tags must have an alt attribute.
  $5('input').each(hasAlt);

  // All `applet` tags must have a text node
  $5('applet').each(hasText);

  // All `object` tags must have a text node
  $5('object').each(hasText).each(hasAlt);

  // TODO: what's the best way to classify content that's `complex`?

  // All `area` elements of an image map should have alt attributes.  This isn't
  // quite a faithful implementation, as it doesn't take into account the case
  // where an `a` tag is wrapped around the `area` tag.
  $5('map').find('area').each(hasAlt);

  // TODO: figure out a good way to handle frames.
  // TODO: figure out a good way to handle scripts.


  /* Checkpoint 1.2 [Priority 1] **********************************************/

  // TODO


  /* Checkpoint 1.3 [Priority 1] **********************************************/

  // TODO


  /* Checkpoint 1.4 [Priority 1] **********************************************/

  // TODO


  /* Checkpoint 1.5 [Priority 3] **********************************************/

};
