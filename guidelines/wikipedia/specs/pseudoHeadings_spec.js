describe('pseudoHeadings', function() {
  var pseudo = rule('Do not make pseudo-headings');

  afterEach(teardownFixtures);

  it('does not allow paragraphs with all bold text', function() {
    var $p = fixture('<p><b>pseudo heading</b></p>');
    var results = run(pseudo);
    expect(results.errors.length).toEqual(1);
    expect(results.errors[0].element).toEqual($p.find('b').get(0));
  });

  it('permits paragraphs that include bold and non-bold text', function() {
    fixture('<p><b>this paragraph</b> contains non-bold text</p>');
    expect(run(pseudo).errors.length).toEqual(0);
  });
});
