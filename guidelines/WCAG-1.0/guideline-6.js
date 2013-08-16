exports.name        = "WCAG 1.0 Guideline 6: New Technologies";
exports.description = "Web Accessibility Guideline: Ensure that pages featuring new technologies" +
                      "transform gracefully";
exports.rule        = function(report) {

  /*
   * Note: the rules contained in this file check properties of elements that
   * are not supported under HTML5
   */

  /* Checkpoint 6.2 ***********************************************************
   *
   * Ensure that equivalents for dynamic content are updated when the dynamic
   * content changes.
   *
   * In particular, http://www.w3.org/TR/WCAG10-HTML-TECHS/#frame-has-html-src
   * requires that FRAME elements have only HTML documents as their src.
   */

  var isNotHtml = function (s) { return !(/html$/.test(s)); };
  $5('frame,iframe').attrFilter('src', isNotHtml).each(function () {
    report.error('Frame src is not an HTML doc', this);
  });

  /* Note: we can make the same selection as above using only jQuery:
     $('frame,iframe').not('[src$="html"]')  */

  /* Checkpoint 6.3 ***********************************************************
   *
   * Links should not use the `javascript:` target.
   */

  var startsWithJava = function (s) { return /^javascript/.test(s); };
  $5('a').attrFilter('href', startsWithJava).each(function () {
    report.error('link uses `javascript:` target', this);
  });

  /* Note: we can make the same selection as above using only jQuery:
     $('a').filter('[href^="javascript"]')  */

};

