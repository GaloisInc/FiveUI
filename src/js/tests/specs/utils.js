
describe('fiveui.utils', function() {

  describe('fiveui.utils.getNewId', function() {

    it('returns 0 when no elements are given', function() {
      expect(fiveui.utils.getNewId([])).toBe(0);
    });

    it('returns 1, when 0 is given', function() {
      expect(fiveui.utils.getNewId([0])).toBe(1);
    });

    it('ignores order when finding the maximum element', function() {
      expect(fiveui.utils.getNewId([2,1])).toBe(3);
    });

  });

});
