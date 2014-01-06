function fixture(html) {
  var $article = $('#mw-content-text');
  if ($article.length === 0) {
    $article = $('<div id="mw-content-text"></div>');
    $article.appendTo('body');
  }
  var $fix = $(html);
  $article.append($fix);
  return $fix;
}

function teardownFixtures() {
  $('#mw-content-text').remove();
}
