describe('Split Sections', function() {

  afterEach(teardownFixtures);

  it('Fails', function(){
    fixture('<ol><li>item</li><ol>');
    fixture('<h2 id="intro"/>Intro</d2>'
            + '<p>Some minimal text</p>'
            + '<ol><li>item</li><ol>'
            + '<p>More, minimal text</p>');

//    var results = run(bullets);
    expect(true).toEqual(false);
  });
});
