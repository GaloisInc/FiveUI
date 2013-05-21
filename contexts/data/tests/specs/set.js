
describe('Set', function() {

  it('tests membership', function() {
    var set = new Set();
    set.add(1);
    expect(set.member(1)).toBe(true);
  });

  it('allows multiple inserts', function() {
    var set = new Set();

    set.add(1);
    set.add(1);

    expect(set.size()).toBe(1);
  });

  it('fails the membership test for things that aren\'t in the set', function() {
    var set = new Set();
    expect(set.member(1)).toBe(false);
  });

});
