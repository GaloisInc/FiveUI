
exports.name = "trello save rule";
exports.description = "";

exports.rule = function(report) {
  var bad = $5('.confirm').filter(
    function(i){
      var subOffset = $(this).offset();
      
      return ! ($5('.cancel').toArray().some(
                  function(elt) {
                    var cOffset = $(elt).offset();
                    
                    return subOffset.top == cOffset.top
                      && subOffset.left < cOffset.left;
                  }));
    });

  for (var i=0; i < bad.length; i++) {
    report.error("missing cancel button", bad[i]);
  }
};