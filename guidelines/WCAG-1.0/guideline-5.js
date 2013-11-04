exports.name        = "WCAG 1.0 Guideline 5: Tables";
exports.description = "Web Accessibility Guideline: Create tables that transform gracefully";
exports.rule        = function(report) {

  /* Checkpoint 5.1 ***********************************************************
   *
   * For data tables, identify row and column headers.
   */

  $5('table').noSubElt('th').each(function () {
    report.error('Table does not have column headers <TH>', this);
  });

  /* Checkpoint 5.5 ***********************************************************
   *
   * Provide summaries for tables.
   */

  $5('table').noSubElt('caption')
             .noAttr('title')
             .each(function () {
    report.warning('Table has no caption or title attribute', this);
  });

  $5('table').noAttr('summary').each(function () {
    report.warning('Table has no summary attribute', this);
  });

  /* Checkpoint 5.6 ***********************************************************
   *
   * Provide `abbr` attributes to table headers <TH>
   */

  $5('th').noAttr('abbr').each(function () {
    report.advisory('<TH> has no abbrevation attribute', this);
  });

};
