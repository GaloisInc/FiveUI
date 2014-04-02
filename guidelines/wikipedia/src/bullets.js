exports.name = "Minimize use of bullet points";
exports.description = "Bullet points should be minimized in the body and lead of the article, if they are used at all.";

exports.ratio = 0.5;
exports.special_section_ids =  [ 'Notes',
                                 'Related_links',
                                 'External_links'];

exports.rule = function(report) {
  var ss = sections('#mw-content-text');

  var filtered = _.filter(ss, not_special_section);

  _.map(filtered, check_bullets);

  /**
   * Check a section to see if the ratio of bulleted content to narative
   * text is acceptible.
   */
  function check_bullets(section) {
    var bullet_txt = section.filter('ul, ol').text();


    var all_txt = section.text();
    var all_chars = all_txt.length;
    var bullet_chars = bullet_txt.length;

    if (0 !== all_chars) {
      if (bullet_chars / all_chars >= exports.ratio) {
        var msg = "The "+section_name(section)+" section uses too many bullet points.";
        report.warning(msg, section);
      }
    }
  }

  function not_special_section(section) {
    var id = section.attr('id');
    var isSpecial = _.contains(exports.special_section_ids, id);

    return ! isSpecial;
  }
};

