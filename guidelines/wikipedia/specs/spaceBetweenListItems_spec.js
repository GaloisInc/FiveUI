describe('spaceBetweenListItems', function() {
  var space = rule('Do not separate list items with blank lines');

  afterEach(teardownFixtures);

  it('warns of adjacent bullet lists that each have a single item', function() {
    fixture('<ul><li>foo</li></ul> <ul><li>bar</li></ul>');
    fixture('<ol><li>foo</li></ol> <ol><li>bar</li></ol>');
    var results = run(space);
    expect(results.warnings.length).toEqual(2);
  });

  it('permits adjacent lists of different types with a single item each', function() {
    fixture('<ul><li>foo</li></ul> <ol><li>bar</li></ol>');
    expect(run(space).warnings.length).toEqual(0);
  });

  it('warns of adjacent description lists that each have a single dt/dd pair', function() {
    fixture('<dl><dt>foo</dt><dd>1</dd></dl> <dl><dt>bar</dt><dd>2</dd></dl>');
    expect(run(space).warnings.length).toEqual(1);
  });

  it('does not warn of adjacent description lists with a single dd or dt', function() {
    fixture('<dl><dt>baz</dt><dd>nao</dd></dl>');
    fixture('<dl><dd>Hi there!</dd></dl>');
    fixture('<dl><dt>title</dt></dl>');
    expect(run(space).warnings.length).toEqual(0);
  });
});
