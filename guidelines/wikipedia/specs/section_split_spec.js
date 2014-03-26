describe('Split Sections', function() {

  afterEach(teardownFixtures);

  it('Finds h2 sections', function(){
    fixture('<p><ol><li>Prelude item</li><ol></p>');
    fixture('<h2 id="intro">Intro</h2>'
            + '<p>Some minimal text</p>'
            + '<ol><li>item</li></ol>'
            + '<p>More, minimal text</p>');
    fixture('<h2 id="summary">Summary</h2>'
            + '<p>Some minimal text</p>'
            + '<ol><li>item</li><ol>'
            + '<p>More, minimal text</p>');

    var chunks = sections('#mw-content-text');
    expect(chunks.length).toEqual(3);
  });

  // it('Finds leading text nodes', function(){
  //   fixture('This is a simple text node.');
  //   fixture('<p>This is a simple paragraph node.</p>');
  //   fixture('<h2 id="intro">Intro</h2>'
  //           + '<p>Some minimal text</p>'
  //           + '<ol><li>item</li><ol>'
  //           + '<p>More, minimal text</p>');

  //   var chunks = sections('#mw-content-text');
  //   expect(chunks.length).toEqual(2);
  // });

  // it('Ignores lower level sections', function(){
  //   fixture('<ol><li>Prelude item</li><ol>');
  //   fixture('<h2 id="intro">Intro</h2>'
  //           + '<p>Some minimal text</p>'
  //           + '<ol><li>item</li><ol>'
  //           + '<p>More, minimal text</p>');
  //   fixture('<h3>Sub-intro</h3>'
  //           + '<p>Some minimal text</p>'
  //           + '<ol><li>item</li><ol>'
  //           + '<p>More, minimal text</p>');
  //   fixture('<h2 id="summary">Summary</h2>'
  //           + '<p>Some minimal text</p>'
  //           + '<ol><li>item</li><ol>'
  //           + '<p>More, minimal text</p>');
  //
  //   var chunks = sections('#mw-content-text');
  //   expect(chunks.length).toEqual(3);
  // });

});
