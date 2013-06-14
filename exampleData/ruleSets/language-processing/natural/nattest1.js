exports.name = "Common words";
exports.description = "Identifies rare word use (words not in the 1000 most common English word list).";

var natural = require('natural');

var stemmer = natural.PorterStemmer;
var tokenizer = new natural.TreebankWordTokenizer();

var getTextNodesIn = function (node, includeWhitespaceNodes) {
    var textNodes = [], whitespace = /^\s*$/;

    function getTextNodes(node) {
        if (node.nodeType == 3) {
            if (includeWhitespaceNodes || !whitespace.test(node.nodeValue)) {
                textNodes.push(node);
            }
        } else {
            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                getTextNodes(node.childNodes[i]);
            }
        }
    }

    getTextNodes(node);
    return textNodes;
};

var commonWord = function(word) {
  return _.contains(words, word);
};

var isPunctuation = function(str) {
  return _.contains(['&', '%', '(', ')', ';', ':', '.', ',', '"', "'", '`', '!', '?' ], str);
};


var markWords = function(obj, report) {

  var mergeFn = function(obj, tok) {
    if (commonWord(tok) || isPunctuation(tok) || _.isNumber(tok)) {
      obj.append(tok + ' ');
    } else {
      //    var newObj = "<span style='background-color: red'>"+tok+"</span> ");
      var newObj = $("<span>"+tok+"</span> ");
      obj.append(newObj);
      report.error("The word '"+tok+"' is uncommon", newObj);
    }
    return obj;
  };

  var toks = tokenizer.tokenize(obj.text());
  var rawObj = $('<p></p>', {id: 'text'});
  var newObj = _.reduce(toks, mergeFn , rawObj);

  obj.replaceWith(newObj);
};

exports.rule = function(report) {
  $5('body').each(
    function(i){
      var nodes = getTextNodesIn($(this));
      _.map(nodes, function(n){
              markWords(n, report);
            });
    });
};