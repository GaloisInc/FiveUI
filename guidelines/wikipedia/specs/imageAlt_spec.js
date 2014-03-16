describe('imageAlt', function() {
  var imageAlt = rule('Images should include an alt attribute');

  afterEach(teardownFixtures);

  it('Warns of img tags that lack an alt attribute', function(){
    fixture('<img src="noalt.jpg"/>');
    fixture('<img src="emptyalt.jpg" alt=""/>');
    fixture('<img src="somealt.jpg" alt="alt text"/>');

    var results = run(imageAlt);
    expect(results.warnings.length).toEqual(2);
  });
});
