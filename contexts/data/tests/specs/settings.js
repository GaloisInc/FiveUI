
describe('fiveui.Settings', function() {

  var settings;

  beforeEach(function() {

    var store   = {};
    var storage = {

      getItem: function(key) {
        return store[key];
      },

      setItem: function(key,value) {
        store[key] = value;
      },

      removeItem: function(key) {
        delete store[key];
      },
    };

    settings = new fiveui.Settings(storage);
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

  it('round trips rules through addUrl', function() {
    // somewhat random rule id
    var ruleId = Math.floor(Math.random() * 101);
    var urlPat = 'http://.*';
    var urlId  = settings.addUrl(urlPat, ruleId);
    var result = settings.getUrlPat(urlId);

    expect(result.regex).toBe(urlPat);
    expect(result.id).toBe(urlId);
  });

  it('matches urls when there\s a valid pattern registered', function() {
    var newId = 42;
    settings.addUrl('http://.*', newId);
    expect(settings.checkUrl('http://foo').rule_id).toBe(newId);
  });

  it('doesn\'t match urls when there are no patterns registered', function() {
    expect(settings.checkUrl('http://foo')).toBe(null);
  });

  it('removes rules successfully', function() {
    var obj = {
      id:          17,
      name:        'rs',
      description: '',
      rules:       []
    };

    var rs = settings.addRuleSet(obj);
    expect(rs).not.toBe(null);

    var rsCount1 = settings.getRuleSets().length;
    settings.remRuleSet(rs.id);
    var rsCount2 = settings.getRuleSets().length;
    expect(rsCount1).toEqual(rsCount2 + 1);

    rs = settings.getRuleSet(rs.id);
    expect(rs).toBe(null);
  });

  it('is unable to remove rules that are in use', function() {
    var obj = {
      id:          17,
      name:        'rs',
      description: '',
      rules:       []
    };

    var rs = settings.addRuleSet(obj);
    expect(rs).not.toBe(null);

    var urlPatId = settings.addUrl('*', rs.id);
    rs = settings.getRuleSet(rs.id);
    expect(rs).not.toBe(null);
  });

});
