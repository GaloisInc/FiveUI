describe('jQuery plugins', function () {

  describe('fiveui.jquery.hasText', function () {
    it('finds an element containing "text foo bar"', function () {
      var $t = $('<div>text foo bar</div>');
      expect($t.hasText('text foo bar').length).toEqual(1);
    });

    it('finds no element containing "quux"', function () {
      var $t = $('<div>text foo bar</div>');
      expect($t.hasText('quux').length).toEqual(0);
    });

    it('finds a nested element containing "hobbit"', function () {
      $t = $('<div><h1>golum</h1><div>hobbit</div></div>');
      expect($t.hasText('hobbit').length).toEqual(1);
    });
  });

  describe('fiveui.jquery.noAttr', function () {
    it('returns elements having no summary attribute', function () {
      var $t = $('<table></table>').noAttr('summary');
      expect($t.length).toEqual(1);
    });

    it('returns no elements on empty input', function () {
      var $t = $('').noAttr('summary');
      expect($t.length).toEqual(0);
    });

    it('doesn\'t return elements with attributes other than the given', function () {
      var $t = $('<table foo="bar"></table>').noAttr('summary');
      expect($t.length).toEqual(1);
    });

    it('returns multiple elements having no summary attribute', function () {
      var htm = '<table></table>' +
                '<table summary="empty"></table>' +
                '<table></table>' +
                '<table></table>' +
                '<table summary="full"></table>';
      var $t = $(htm).noAttr('summary');
      expect($t.length).toEqual(3);
    });

  });

  describe('fiveui.jquery.noSubElt', function () {
    var $t = $('<div><p>red hering</p><h1>blue hering</h1></div>')

    it('filters out elements with a sub-heading', function () {
      expect($t.noSubElt('h1').length).toEqual(0);
      expect($t.noSubElt(':header').length).toEqual(0);
    });

    it('filters out elements with a <p>', function () {
      expect($t.noSubElt('p').length).toEqual(0);
    });

    it('retains elements without <li>', function () {
      expect($t.noSubElt('li').length).toEqual(1);
    });

    it('accepts arbitrary jQuery seclectors', function () {
      expect($t.noSubElt('p[name=bob]').length).toEqual(1);
    });
  });

  describe('fiveui.jquery.notColorSet', function () {
    var htm = '<p style="color: #000000">foo</p>' +
              '<p style="color: #ffffff">foo</p>' +
              '<p style="color: #e1e1e1">foo</p>' +
              '<p style="color: #ffffff">foo</p>';
    var $t = $(htm);

    it('filters out black', function () {
      expect($t.notColorSet(['#000000']).length).toEqual(3);
    });

    it('filters out white', function () {
      expect($t.notColorSet(['#ffffff']).length).toEqual(2);
    });

    it('filters out black and white', function () {
      expect($t.notColorSet(['#ffffff', '#000000']).length).toEqual(1);
    });

    it('filters out everything', function () {
      expect(
        $t.notColorSet(['#ffffff', '#000000', '#e1e1e1']).length).toEqual(0
      );
    });
  });

  describe('fiveui.jquery.cssIs', function () {
    var htm = '<p style="color: #000000; background-color: #232323">foo</p>' +
              '<p style="color: #ffffff; font-size: 5em">foo</p>' +
              '<p style="color: #e1e1e1; background-color: #141414">foo</p>' +
              '<p style="color: #ffffff">foo</p>' +
              '<h1 style="color: #ffffff; font-size: 5em">big</h1>';
    var $t = $(htm);

    it('filters out colors', function () {
      expect($t.cssIs('color',
                      ['#ffffff', '#000000'],
                      fiveui.color.colorToHexWithDefault).length).toEqual(4);
    });

    it('filters out background-colors', function () {
      expect($t.cssIs('background-color',
                      ['#141414', '#232323'],
                      fiveui.color.colorToHexWithDefault).length).toEqual(2);
    });

    it('filters out elements of different type', function () {
      expect($t.cssIs('font-size', ['5em']).length).toEqual(2);
    });
  });

  describe('fiveui.jquery.cssIsNot', function () {
    var htm = '<p style="color: #000000; background-color: #232323">foo</p>' +
              '<p style="color: #ffffff; font-size: 5em">foo</p>' +
              '<p style="color: #e1e1e1; background-color: #141414">foo</p>' +
              '<p style="color: #ffffff">foo</p>' +
              '<h1 style="color: #ffffff; font-size: 5em">big</h1>';
    var $t = $(htm);

    it('filters out colors', function () {
      expect($t.cssIsNot('color',
                         ['#ffffff', '#000000'],
                         fiveui.color.colorToHexWithDefault).length).toEqual(1);
    });

    it('filters out background-colors', function () {
      expect($t.cssIsNot('background-color',
                         ['#141414', '#232323'],
                         fiveui.color.colorToHexWithDefault).length).toEqual(3);
    });

    it('filters out elements of different type', function () {
      expect($t.cssIsNot('font-size', ['5em']).length).toEqual(3);
    });
  });

  describe('fiveui.jquery.attrFilter', function () {
    var isEmpty = function (s) { return $.trim(s) == ""; };

    it('filters for zero elements with empty alt', function () {
      var $elt = $('<a href="foo" alt="bar"><a href="beel" alt="bar">');
      expect($elt.attrFilter('alt', isEmpty).length).toEqual(0);
    });

    it('filters for one element with empty alt', function () {
      var $elt = $('<a href="foo" alt=""><a href="beel" alt="bar">');
      expect($elt.attrFilter('alt', isEmpty).length).toEqual(1);
    });

    it('filters out elements that don\'t have the attribute', function () {
      var $elt = $('<a href="foo"><a href="beel">');
      expect($elt.attrFilter('alt', isEmpty).length).toEqual(0);
    });

    it('filters for elements with alt containing foo', function () {
      var hasFoo = function (s) { return /foo/.test(s); };
      var $elt = $('<a href="foo" alt="barfoo"><a href="beel" alt="bar">');
      expect($elt.attrFilter('alt', hasFoo).length).toEqual(1);
    });
  });

  describe('fiveui.jquery.linksTo', function () {
    it('filters out elements with no href', function () {
      expect($('<p>foo</p>').linksTo('bar').length).toEqual(0);
    });

    it('filters out elements with wrong href', function () {
      expect($('<a href="quux">foo</a>').linksTo('bar').length).toEqual(0);
    });

    var htm = '<a href="quux">foo</a> <a href="bar">foo2</a> <a href="quux">foo3</a>';
    var $t = $(htm);

    it('filters in among various hrefs', function () {
      expect($t.linksTo('bar').length).toEqual(1);
    });

    it('filters out among various hrefs', function () {
      expect($t.linksTo('quux').length).toEqual(2);
    });
  });

});
