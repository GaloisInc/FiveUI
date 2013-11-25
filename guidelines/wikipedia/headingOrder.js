/**
 * Layout rules for Wikipedia article content
 */
exports.name        = "Headings should be in order.";
exports.description = "Headers should increase sequentially, or reset to a higher section level.";

exports.rule = function(report) {
  findH1s(report);

  checkHeadingOrder(report);
};

/**
 * No H1 headings should be used in the article content.
 */
var findH1s = function(report) {
  $5('#mw-content-text h1').each(
    function(idx, elt){
      report.error("Top-level headings should not be used in article content.");
    });
};


/**
 * Check that headers increase one step at a time, or go back to the
 * beginning (in this case, heading 2).
 *
 * Headers using the &lt;header&gt; tag are except from this check.
 */
var checkHeadingOrder = function(report) {
  var last=1;

  $5('#mw-content-text :header').each(
    function(idx, elt){
      // parse the level out of 'h1', 'h2', 'h3', etc.
      var level = parseInt(elt.tagName.substring(1,2));

      if (level > (last + 1)) {
        report.error("Heading is out of order; heading level was: "+level+
                     " but last level was: "+last, elt);
      }
      // set the level regardless, since the error *could* be with the
      // prior level heading, so we don't want to cause more errors
      // erroniously:
      last = level;
    });
};
