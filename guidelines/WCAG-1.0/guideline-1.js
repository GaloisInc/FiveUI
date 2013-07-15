/**
 * Provide equivalent alternatives to auditory and visual content
 */

exports.name        = "Equivalent Alternatives";
exports.description = "Web Accessibility Guideline: Provide equivalent alternatives to auditory and visual content";

exports.rule        = function(report) {


  /* Checkpoint 1.1 [Priority 1] **********************************************/

  var hasAlt = function(ix) {
    var alt = $.trim($(this).attr('alt'));
    var longdesc = $.trim($(this).attr('longdesc'));
    if(_.isEmpty(alt) && _.isEmpty(longdesc)) {
      report.error('No alt/longdesc specified', this);
    }
  };

  var hasText = function(ix) {
    if(_.isEmpty($.trim($(this).text()))) {
      report.error('No text node', this);
    }
  };

  // images with semantic meaning should have an alt attribute.
  // TODO add a heuristic for detecting large images
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

  // All `area` elements of an image map should have alt attributes. It's also a
  // bit overzealous, as it looks at all maps, not just maps that are referenced
  // from images.
  $5('map').find('area')
    .add($5('map').find('a'))
      .each(hasAlt);

  // TODO: figure out a good way to handle frames.
  // TODO: figure out a good way to handle scripts.


  /* Checkpoint 1.2 [Priority 1] **********************************************/

  // `ismap` is a boolean attribute.  If it's present on an image, require that
  // there's also a corresponding `usemap` attribute that can be used in lieu of
  // having the server information present.  This is a bit of an under
  // approximation, as if you can provide a client-side map that doesn't cover
  // everything that the server does.  It's more of a sanity check, that this
  // has been thought of.
  $5('img').filter('[ismap]').each(function(ix) {
    if(_.isEmpty($.trim($(this).attr('usemap')))) {
      report.error('No usemap attribute to supplement a use of ismap', this);
    }
  });


  /* Checkpoint 1.5 [Priority 3] **********************************************/

  // Make sure that every link in an image map has a corresponding text link
  // somewhere else in the document.
  var hrefs = $5('a').map(function() { return $(this).attr('href'); });
  $5('map').find('area').each(function() {
    var href = $(this).attr('href');
    if(!_.contains(href, hrefs)) {
      report.error('Image map contains a link not present in a text link',
          this);
    }
  });

};
