
describe('fiveui.state', function() {

  var storage, state;

  beforeEach(function() {
    storage = new MockStorage();
    state   = new fiveui.State(storage);
  });

  it('cannot retrieve a tab that doesn\'t exist', function() {
    expect(storage.getItem(42)).toBe(undefined);
    expect(state.getTabState(42)).toBe(null);
  });

  it('manages the window location', function() {
    var testId   = 42;
    var winState = new fiveui.WinState(0,1,10,15);
    var tabState = new fiveui.TabState(testId,winState);
    var oracle   = new fiveui.TabState(testId,new fiveui.WinState(0,1,10,15));

    state.setTabState(tabState);
    var result = state.getTabState(testId);
    _.each(result,function(val,key) {
      expect(val).toEqual(oracle[key]);
    });
  });

});
