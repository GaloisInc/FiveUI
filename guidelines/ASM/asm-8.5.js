/*
 * Abnormal Situation Management - Guidelines
 *
 * 8.5 - p2: Use consistent numeric formats to enable quick reading.
 * Notes: Don't use leading 0's for integer values, *do* provide leading 0 for
 * fractional values < 1, justify columns on decimal point, include units.
 * Some easy, some hard. (how do we map units to numbers? can we get the screen
 * coordinates for every '.' in the dom?)
 *
 */
exports.name='Inconsistent numerical formatting';
exports.description='Use consistent numeric formats to enable quick reading.';

exports.rule = function (report) {

  // Predicate used on DOM elements below.
  var hasText = function(i) { return ($5(this).text().trim().length); };

  // Rule specifications:
  // (we assume re's below run on strings which already match the general
  // number format given in getNums.)
  var bads = [ { re:  '[+-]?0\\d'   // e.g. 032
               , msg: 'numbers larger than 1 should not lead with a zero' }

               , { re:  '^[+-]?\\.\\d'  // e.g. -.145
                 , msg: 'fractional numbers less than 1 should have a leading zero' }

               , { re:  '\\.$'  // e.g. 32.
                 , msg: 'numbers should not end with a decimal' } ];

  /* Returns a function from a rule specification. */
  var checkBad = function(b) {
    var res = {};
    var f = function (n) {
      var r = new RegExp(b.re);
      if (r.exec(n)) { return true; }
      else { return false; }
    };
    res.fcn = f;
    res.rule = b;  // save the rule
    return res;
  };
  var fcns = _.map(bads, checkBad);

  // DOM element -> it's full text content including children separeted by
  // spaces. We do this instead of just calling text() or .textContent because
  // we want text of children separeted from each other with whitespace.
  var betterText= function (e) {
    if (!$5(e).children()) {
      return $5(e).text();
    }
    else {
      // extract text from the children recursively
      var ctxts = _.map($5(e).children(), betterText);
      // remove the children and extract text
      ctxts.push($(e).clone().children().remove().end().text());
      return ctxts.join(' ');
    }
  };

  /* Returns an array of the numbers found in the given DOM node's text. */
  var getNums = function (e) {
    //var txt = $5(e).text().trim();
    var txt = betterText(e);
    var re = new RegExp('(^|\\b)[+-]?(\\d+(\\.)?\\d*|\\.\\d+)(\\b|$)', 'g');
    var matches = [], found;
    while (found = re.exec(txt)) {
      matches.push(found[0]);
    }
    // FUUUCCCKKKK
    return matches;
  };

  // Main rule query
  $5("*").filter(hasText).each(function(i, elt) {
    var nums = getNums(elt);
    _.each(fcns, function (rul, ii, l) {
      var m = _.map(nums, rul.fcn);
      if (_.some(m)) { // some number in nums is bad for this rule
        // check if a child node has the same problem
        var childNums = _.flatten(_.map($5(elt).children(), getNums));
        if (_.some(_.map(childNums, rul.fcn))) {
          return;  // don't report it, break out of _.each iteration
        }
        else {  // no child has the same problem
          report.error(rul.msg, elt);
        }
      }
    });
  });

}

