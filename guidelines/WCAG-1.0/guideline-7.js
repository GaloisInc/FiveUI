exports.name        = "WCAG 1.0 Guideline 6: Time Sensitive Content Changes";
exports.description = "Web Accessibility Guideline: Ensure user control of" +
                      "time-sensitive content changes.";
exports.rule        = function(report) {

  /*
   * Note: the rules contained in this file check properties of elements that
   * are not supported under HTML5
   */

  /* Checkpoint 7.2 ***********************************************************
   *
   * Avoid causing content to blink.
   *
   * Note: the BLINK and MARQUEE tags are not standard HTML, but were somewhat
   * common once upon a time.
   */

  $5('blink,marquee').each(function () {
    report.warning('BLINK and MARQUEE are non-standard HTML elements', this);
  });

  $5('*').cssIs('text-decoration', 'blink').each(function () {
    report.warning('Avoid causing content to blink', this);
  });

};

