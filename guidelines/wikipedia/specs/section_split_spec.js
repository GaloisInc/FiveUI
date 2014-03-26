describe('Split Sections', function() {

  afterEach(teardownFixtures);

  it('Finds h2 sections', function(){
    fixture('<p><span>Prelude item</span></p>');
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

  it('Handles having no prelude', function(){
    fixture('<h2 id="top">Top</h2>');
    fixture('<p>This is a simple paragraph node.</p>');
    fixture('<h2 id="intro">Intro</h2>');
    var chunks = sections('#mw-content-text');
    expect(chunks.length).toEqual(2);
  });

  it('Handles empty sections', function(){
    fixture('<h2 id="top">Top</h2>');
    fixture('<h2 id="top2">Top2</h2>');
    fixture('<p>This is a simple paragraph node.</p>');
    var chunks = sections('#mw-content-text');
    expect(chunks.length).toEqual(2);
  });

  it('Finds leading text nodes', function(){
    fixture('This is a simple text node.');
    fixture('<h2 id="intro">Intro</h2>'
            + '<p>Some minimal text</p>'
            + '<ol><li>item</li><ol>'
            + '<p>More, minimal text</p>');

    var chunks = sections('#mw-content-text');
    expect(chunks.length).toEqual(2);
  });

  it('Ignores lower level sections; h2 first', function(){
    fixture('<ol><li>Prelude item</li><ol>');
    fixture('<h2 id="intro">Intro</h2>'
            + '<p>Some minimal text</p>'
            + '<ol><li>item</li><ol>'
            + '<p>More, minimal text</p>');
    fixture('<h3>Sub-intro</h3>'
            + '<p>Some minimal text</p>'
            + '<ol><li>item</li><ol>'
            + '<p>More, minimal text</p>');
    fixture('<h2 id="summary">Summary</h2>'
            + '<p>Some minimal text</p>'
            + '<ol><li>item</li><ol>'
            + '<p>More, minimal text</p>');

    var chunks = sections('#mw-content-text');
    expect(chunks.length).toEqual(3);
  });

  it('Ignores lower level sections; h1 first', function(){
    fixture('<ol><li>Prelude item</li><ol>');
    fixture('<h1 id="intro">Intro</h1>'
            + '<p>Some minimal text</p>'
            + '<ol><li>item</li><ol>'
            + '<p>More, minimal text</p>');
    fixture('<h2>Sub-intro</h2>'
            + '<p>Some minimal text</p>'
            + '<ol><li>item</li><ol>'
            + '<p>More, minimal text</p>');
    fixture('<h1 id="summary">Summary</h1>'
            + '<p>Some minimal text</p>'
            + '<ol><li>item</li><ol>'
            + '<p>More, minimal text</p>');

    var chunks = sections('#mw-content-text');
    expect(chunks.length).toEqual(3);
  });
});
