
describe('fiveui.Settings', function() {

  var settings;

  beforeEach(function() {
    settings = new fiveui.Settings(new MockStorage());
  });


  it('doesn\'t hold on to removed keys', function() {
    var key   = 'key';
    var value = 'value';
    var id    = settings.set(key, value);
    settings.remove(key);

    var result = settings.get(id);
    expect(result).toBe(null);
  });


  it('round trips values through set/get', function() {
    var key   = 'key';
    var value = 'value';

    settings.set(key, value);
    expect(settings.get(key)).toEqual(value);
  });

  it('matches urls when there\'s a valid pattern registered', function() {
    var rset = new fiveui.RuleSet({ patterns: ['http://.*'] });
    settings.addRuleSet(rset);
    expect(settings.checkUrl('http://foo').id).toBe(0);
  });

  it('doesn\'t match urls when there are no patterns registered', function() {
    expect(settings.checkUrl('http://foo')).toBe(undefined);
  });

  it('removes rules successfully', function() {
    var rsId = settings.addRuleSet(new fiveui.RuleSet({
      name:        'rs',
      description: '',
      rules:       []
    }));
    expect(rs).not.toBe(null);

    var rsCount1 = settings.getRuleSets().length;
    settings.remRuleSet(rsId);

    var rsCount2 = settings.getRuleSets().length;
    expect(rsCount1).toEqual(rsCount2 + 1);

    var rs = settings.getRuleSet(rsId);
    expect(rs).toBe(null);
  });

});
