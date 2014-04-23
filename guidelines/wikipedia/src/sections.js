/**
 * Utilities to assist with splitting a Wikipage into sections.
 */
function printJQ(name, $starts) {
  for (var i=0; i < $starts.length; i++) {
    console.error(name + '['+i+']: '+ $starts[i].nodeName);
  }
}

/**
 * Return the name of the section, if it starts with a heading element.
 */
function section_name(section) {
  var $first = section.first();

  var headers = $first.filter(':header');

  if (0 === headers.length) {
    return "first";
  } else {
    return headers.first().text();
  }
}

/**
 * Takes a jquery selector, and returns a list of jQuery objects that
 * represent all the nodes in that "section", where a section is the
 * content between a top-level header element and the start/end of the
 * document, in the results of the selector.  Headers are included as
 * the first element in each jQuery object, except for the case of
 * prelude content.
 *
 * If the selector specifies a singular node, then this function is
 * recursively invoked with a new selector that selects all of that
 * node's children.  For example, `sections("body")` is the same as
 * `sections("body *")`
 */
function sections(sel) {
  var $sel = {};

  // this accepts either jquery objects or string selectors:
  if (sel instanceof jQuery) {
    $sel = sel;
  } else {
    $sel = $(sel);
  }

  if ($sel.length == 1) {
    return sections($sel.contents());
  }

  // find the "biggest" heading element:
  var hNode = null;
  _.map(['h4', 'h3', 'h2', 'h1'], function (hStr) {
          if ($sel.filter(hStr).length !== 0) {
            hNode = hStr;
          }
        });

  if (!hNode) {
    return [$sel];
  }
  var results = [];
  var res = [];

  // find the starting points for 'nextUntil(hNode)'
  var $heads = $sel.filter(hNode);
  var $starts = $sel.first().add($heads);

  $starts.each(function(idx, elt) {
    var $elt = $(elt);
    var $tail = $elt.nextUntil(hNode);
    var $full = $elt.add($tail);

    results.push($full);
  });

  return results;
}