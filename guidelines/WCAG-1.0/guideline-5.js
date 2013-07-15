exports.name        = "WCAG 1.0 Guideline 5: Tables";
exports.description = "Web Accessibility Guideline: Create tables that transform gracefully";
exports.rule        = function(report) {

  /* Checkpoint 5.1 ***********************************************************
   *
   * For data tables, identify row and column headers.
   */

  $('table').each(function () {
    if ($(this).find('th').length == 0) {
      report.error('Table does not have column headers <TH>', this);
    }
  });


  /* Checkpoint 5.5 ***********************************************************
   *
   * Provide summaries for tables.
   */

  $('table').each(function () {
    var $cap  = $(this).find('caption');
    var title = $.trim($(this).attr('title'));
    var sum   = $.trim($(this).attr('summary'));
    if ($cap.length == 0 && (title === undefined || title == '')) {
      report.error('Table has no caption or title attribute', this);
    }
    if (sum === undefined || sum == '') {
      report.error('Table has no summary attribute', this);
    }
  });

};
