
describe('fiveui.Rules', function() {

  it('round trips via JSON', function() {

    var ruleIn = new fiveui.Rule(42, 'testRule',
        'see: http://test.description/',
        'function() { console.log("fail"); }');

    var jsonRule = jQuery.toJSON(ruleIn);

    var ruleOut = fiveui.Rule.fromJSON(JSON.parse(jsonRule));

    expect(ruleOut.id).toBe(ruleIn.id);
    expect(ruleOut.name).toBe(ruleIn.name);
    expect(ruleOut.description).toBe(ruleIn.description);
    expect(ruleOut.ruleStr).toBe(ruleIn.ruleStr);
  });


});


describe('fiveui.RuleSet', function() {

  it('round trips via JSON, without deps', function() {

    var rule1 = new fiveui.Rule(42, 'r1', 'desc1', 'rule txt1');
    var rule2 = new fiveui.Rule(43, 'r2', 'desc2', 'rule txt2');

    var ruleSet = new fiveui.RuleSet(42, 'rule set', 'desc', '', [rule1, rule2]);

    var jsonSet     = jQuery.toJSON(ruleSet);
    var restoredSet = fiveui.RuleSet.fromJSON(42, JSON.parse(jsonSet));

    expect(restoredSet.id).toBe(ruleSet.id);
    expect(restoredSet.name).toBe(ruleSet.name);
    expect(restoredSet.description).toBe(ruleSet.description);
    expect(restoredSet.source).toEqual(ruleSet.source);
    expect(restoredSet.rules).toEqual(ruleSet.rules);
    expect(restoredSet.dependencies.length).toBe(0);


  });

  it('round trips via JSON, with deps', function() {

    var rule1 = new fiveui.Rule(42, 'r1', 'desc1', 'rule txt1');
    var rule2 = new fiveui.Rule(43, 'r2', 'desc2', 'rule txt2');

    var ruleSet = new fiveui.RuleSet(42, 'rule set', 'desc', [rule1, rule2],
        '', ['dep1.js', 'dep2.js']);

    var jsonSet     = jQuery.toJSON(ruleSet);
    var restoredSet = fiveui.RuleSet.fromJSON(42, JSON.parse(jsonSet));

    expect(restoredSet.id).toBe(ruleSet.id);
    expect(restoredSet.name).toBe(ruleSet.name);
    expect(restoredSet.description).toBe(ruleSet.description);
    expect(restoredSet.rules.length).toBe(ruleSet.rules.length);
    expect(restoredSet.dependencies).toEqual(ruleSet.dependencies);
  });

});
