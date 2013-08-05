
describe('fiveui.Rules', function() {

  it('round trips via JSON', function() {

    var ruleIn = new fiveui.RuleSet({
      id:          42,
      name:        'testRule',
      description: 'see: http://test.description/',
    });

    var jsonRule = JSON.stringify(ruleIn);

    var ruleOut = fiveui.RuleSet.fromJSON(42, JSON.parse(jsonRule));

    expect(ruleOut.id).toBe(ruleIn.id);
    expect(ruleOut.name).toBe(ruleIn.name);
    expect(ruleOut.description).toBe(ruleIn.description);
  });


});


describe('fiveui.RuleSet', function() {

  it('round trips via JSON, without deps', function() {

    var ruleSet = new fiveui.RuleSet({
      id: 42,
      name: 'rule set',
      description: 'desc'
    });

    var jsonSet     = JSON.stringify(ruleSet);
    var restoredSet = fiveui.RuleSet.fromJSON(42, JSON.parse(jsonSet));

    expect(restoredSet.id).toBe(ruleSet.id);
    expect(restoredSet.name).toBe(ruleSet.name);
    expect(restoredSet.description).toBe(ruleSet.description);
    expect(restoredSet.source).toEqual(ruleSet.source);
    expect(restoredSet.rules).toEqual(ruleSet.rules);
    expect(restoredSet.dependencies.length).toBe(0);


  });

  it('round trips via JSON, with deps', function() {

    var ruleSet = new fiveui.RuleSet({
      id:          42,
      name:        'rule set',
      description: 'desc',
      rules: ['rule1', 'rule2'],
      dependencies: ['dep1', 'dep2']
    });

    var jsonSet     = JSON.stringify(ruleSet);
    var restoredSet = fiveui.RuleSet.fromJSON(42, JSON.parse(jsonSet));

    expect(restoredSet.id).toBe(ruleSet.id);
    expect(restoredSet.name).toBe(ruleSet.name);
    expect(restoredSet.description).toBe(ruleSet.description);
    expect(restoredSet.rules.length).toBe(ruleSet.rules.length);
    expect(restoredSet.dependencies).toEqual(ruleSet.dependencies);
  });

});
