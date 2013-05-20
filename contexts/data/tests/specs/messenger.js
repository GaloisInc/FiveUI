
describe('fiveui.Messenger', function() {

  var chan1 = null;
  var chan2 = null;

  var m1 = null;
  var m2 = null;


  beforeEach(function() {
    chan1 = new fiveui.Chan();
    chan2 = new fiveui.Chan();

    chan2.chan = chan1;
    chan1.chan = chan2

    m1 = new fiveui.Messenger(chan1);
    m2 = new fiveui.Messenger(chan2);
  });


  afterEach(function() {
    delete m1;
    delete chan1;

    delete m2;
    delete chan2;
  });


  it('registers a simple callback', function() {
    var got = [];

    m1.register('count', function(n) {
      got.push(n);
    });

    m2.send('count', 1);
    m2.send('count', 2);

    expect(got).toEqual([1,2]);
  });


  it('supports respond callbacks when sending', function() {
    var m1got = [];
    var m2got = [];

    m1.register('count', function(n, respond){
      m1got.push(n);
      respond(n);
    });

    m2.send('count', 1, function(n) {
      m2got.push(n);
    });

    expect(m1got.length).toBe(m2got.length);
  });


  it('doesn\'t invoke callbacks for null data', function() {
    var m1got = [];

    m1.register('count', function(n) {
      m1got.push(n);
    });

    m2.send('count', null);

    expect(m1got[0]).toBe(null);
  });


  it('is able to send rules', function() {
    var ruleIn = new fiveui.Rule(42, 'testRule',
        'see: http://test.description/',
        'function() { console.log("fail"); }');

    var got = [];
    m1.register('rule', function(r){
      got.push(r);
    });

    m2.send('rule', ruleIn);
    expect(got.length).toBe(1);

    var ruleOut = got[0];
    expect(ruleIn.id).toBe(ruleOut.id);
    expect(ruleIn.name).toBe(ruleOut.name);
    expect(ruleIn.description).toBe(ruleOut.description);
    expect(ruleIn.ruleStr).toBe(ruleOut.ruleStr);
  });

});
