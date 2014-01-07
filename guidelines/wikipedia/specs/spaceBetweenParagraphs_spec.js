describe('spaceBetweenParagraphs', function() {
  var space = rule('There should only be one blank line between paragraphs');

  afterEach(teardownFixtures);

  it('warns of a blank line after a paragraph with text content', function() {
    var $p = fixture('<p>Galois lived during a time of political turmoil.</p>');
    var $empty = fixture('<p><br></p>');
    var results = run(space);
    expect(results.errors.length).toBe(1);
    expect(results.errors[0].element).toEqual($p.get(0));
  });

  it('points to paragraph preceding a blank line; but not to other element types', function() {
    var $div = fixture('<div>Galois lived during a time of political turmoil.</div>');
    var $empty = fixture('<p><br></p>');
    var results = run(space);
    expect(results.errors.length).toBe(1);
    expect(results.errors[0].element).not.toEqual($div.get(0));
    expect(results.errors[0].element).toEqual($empty.get(0));
  });

  it('points to the closest paragraph with text preceding the blank line', function() {
    var $p1 = fixture('<p>Galois lived during a time of political turmoil.</p>');
    var $p2 = fixture('<p>Galois was incensed and wrote a blistering letter.</p>');
    var $empty = fixture('<p><br></p>');
    var results = run(space);
    expect(results.errors[0].element).toEqual($p2.get(0));
  });

  it('emits at most one error per paragraph with text', function() {
    var $p = fixture('<p>He passed, receiving his degree.</p>');
    var $empty1 = fixture('<p><br></p>');
    var $empty2= fixture('<p><br></p>');
    var $empty3= fixture('<p><br></p>');
    var results = run(space);
    expect(results.errors.length).toEqual(1);
    expect(results.errors[0].element).toEqual($p.get(0));
  });

  it('does not point to a paragraph separated by non-paragraph tags', function() {
    var $p  = fixture('<p>Charles X had succeeded Louis XVIII.</p>');
    var $e1 = fixture('<div></div>');
    var $empty = fixture('<p><br></p>');
    var results = run(space);
    expect(results.errors.length).toEqual(1);
    expect(results.errors[0].element).toEqual($empty.get(0));
  });
});
