describe('inlineStyle', function() {
  var inline = rule('Do not use in-line styles');

  afterEach(teardownFixtures);

  it('reports error for elements with style attribute', function() {
    var $p = fixture('<p style="color:darkgoldenrod">fancy text</p>');
    var results = run(inline);
    expect(results.errors.length).toEqual(1);
    expect(results.errors[0].element).toEqual($p.get(0));
  });

  it('excludes reflist list-style-type from report', function() {
    var $l = fixture(
      '<div class="reflist" style="list-style-type: decimal;">references</div>'
    );
    var results = run(inline);
    expect(results.errors.length).toEqual(0);
    expect(results.warnings.length).toEqual(0);
  });
});
