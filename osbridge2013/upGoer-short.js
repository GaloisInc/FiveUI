var natural = require('natural');
var words = require('1-100.js');

exports.name = "Common words";
exports.description =  ["Identifies rare word use",
                        "(words not in the 1000 most",
                        "common English word list)."].join(" ");

var markWords = function(obj, report) {
  var toks = tokenizer.tokenize($(obj).text());
  var rawObj = $('<p></p>', {id: 'text'});
  $(obj).replaceWith(rawObj);

  _.each(toks, function(tok) {
    if (isCommonWord(tok) || isPunctuation(tok) || _.isNumber(tok)) {
      rawObj.append(' ' + tok + ' ');
    } else {
      var newObj = $("<span>"+tok+"</span> ");
      rawObj.append(newObj);
      report.error("The word '"+tok+"' is uncommon", newObj.get(0));
    }
  });
};

exports.rule = function(report) {
  fiveui.query('body').each(
    function(i){
      var nodes = getTextNodesIn(this);
      _.map(nodes, function(n){
              markWords(n, report);
            });
    });
};
