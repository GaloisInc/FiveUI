describe('bullets', function() {
  var bullets = rule('Minimize use of bullet points');

  afterEach(teardownFixtures);

  it('Warns on bullets when little other text exists', function(){
    fixture('<ol><li>item</li><ol>');
    fixture('<h2 id="intro"/>Intro</d2>'
            + '<p>Some minimal text</p>'
            + '<ol><li>item</li><ol>'
            + '<p>More, minimal text</p>');

    var results = run(bullets);
    expect(results.warnings.length).toEqual(2);
  });

  it('Does not warn if there is substantial text', function() {
    fixture('<h2 id="intro"/>Intro</d2>'
            + '<p>'+introText+'</p>'
            + '<ol>'
              + '<li>item 1</li>'
              + '<li>item 2</li>'
            + '<ol>'
            + '<p>'+introText+'</p>');

    var results = run(bullets);
    expect(results.warnings.length).toEqual(0);
  });

  it('Does not warn on certain sections', function(){
    var safeSections = [ 'Notes'
                       , 'Related_links'
                       , 'External_links'];

    _.each(safeSections, function(section) {
      fixture('<h2 id="'+section+'"/>'+section+"</h2>"
               + '<ul><li>item</li></ul>'
               + '<ol><li>item</li></ol>');
    });
    var results = run(bullets);
    expect(results.warnings.length).toEqual(0);
  });
});

introText=['Évariste Galois (25 October 1811 – 31 May 1832) was a French '
           + 'mathematician born in Bourg-la-Reine. While still in his teens, '
           + 'he was able to determine a necessary and sufficient condition '
           + 'for a polynomial to be solvable by radicals, thereby solving a '
           + 'long-standing problem. His work laid the foundations for Galois '
           + 'theory and group theory, two major branches of abstract algebra, '
           + 'and the subfield of Galois connections. He was the first to use '
           + 'the word "group" (French: groupe) as a technical term in '
           + 'mathematics to represent a group of permutations. A radical '
           + 'Republican during the monarchy of Louis Philippe in France, '
           + 'he died from wounds suffered in a duel under questionable '
           + 'circumstances[1] at the age of twenty.'].join(' ');