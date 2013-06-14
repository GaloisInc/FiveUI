
describe('prelude', function() {

  var addTestSet = function(fn, tests) {
    _.each(tests, function(test) {
      it(test[0], function() {
        var args = test.slice(1, test.length - 1);
        expect(fn.apply(undefined, args)).toEqual(test[test.length - 1]);
      });
    });
  };

  addTestSet(fiveui.isString,[
    //   name             ,  input   , oracle
    ['isString: undefined', undefined, false],
    ['isString: null'     , null,      false],
    ['isString: a string' , 'str',     true]
  ]);

  addTestSet(fiveui.string.trim, [
    ['string.trim leading space'   , '  str', 'str'],
    ['string.trim on null'         , null, null],
    ['string.trim trailing space'  , 'str   ', 'str'],
    ['string.trim trailing tab'    , 'str \t  ', 'str'],
    ['string.trim mixed & interior', '  this is a str \t  ', 'this is a str']
  ]);

  addTestSet(fiveui.word.capitalized, [
    ['capitalize: empty string'               , '', false],
    ['capitalize: a space'                    , ' ', false],
    ['capitalize: whitespace'                 , '\t   ', false],
    ['capitalize: lowercase'                  , 'test', false],
    ['capitalize: N-token'                    , 'a test', false],
    ['capitalize: leading space'              , '  test', false],
    ['capitalize: 1-token - leading cap'      , 'Test', true],
    ['capitalize: N-token - leading cap'      , 'A test', true],
    ['capitalize: N-token - one cap'          , 'this is a Test', false],
    ['capitalize: N-token - one cap, punc'    , 'this, is a Test.', false],
    ['capitalize: N-token - all leading caps' , 'This Test', true],
    ['capitalize: all caps'                   , 'TEST', true],
    ['capitalize: N-token - all caps'         , 'A TEST', true]
  ]);

  addTestSet(fiveui.word.allCaps, [
    ['allCaps: empty string'          , '', false],
    ['allCaps: a space'               , ' ', false],
    ['allCaps: whitespace'            , '\t   ', false],
    ['allCaps: lowercase'             , 'test', false],
    ['allCaps: N-token'               , 'a test', false],
    ['allCaps: leading space'         , '  test', false],
    ['allCaps: all caps'              , 'TEST', true],
    ['allCaps: N-token - all caps'    , 'A TEST', true],
    ['allCaps: 1-token - leading cap' , 'Test', false],
    ['allCaps: N-token - leading cap' , 'A test', false],
    ['allCaps: N-token - one cap      , punc'    , 'this, is a Test.', false],
    ['allCaps: N-token - all caps     , punc' , 'THIS, IS A TEST.', true]
  ]);

  var testTokenize = function(spec) {
    it(spec[0], function() {
      var result = fiveui.string.tokens(spec[1]);
      var oracle = spec[2];

      expect(result.length).toBe(oracle.length);

      _.each(result, function(r, i) {
        expect(r).toEqual(oracle[i]);
      })
    });
  };

  _.each([
    ['tokenize: empty string'   , '', []],
    ['tokenize: a space'        , ' ', []],
    ['tokenize: whitespace'     , '\t   ', []],
    ['tokenize: lowercase'      , 'test', ['test']],
    ['tokenize: N-token'        , 'a test', ['a', 'test']],
    ['tokenize: N-token - more spaces', 'a   test', ['a', 'test']],
    ['tokenize: leading spaces' , '  test', ['test']],
    ['tokenize: trailing spaces', 'test  ', ['test']],
    ['tokenize: N-token'        , 'this is a test', ['this', 'is', 'a', 'test']],
    ['tokenize: N-token - punc' , 'this, is a test.', ['this,', 'is', 'a', 'test.']]
  ], testTokenize);

  it('colorCheck returns a function', function() {
    expect(typeof fiveui.color.colorCheck('', [])).toEqual('function');
  });

  addTestSet(fiveui.color.hexToRGB, [
    //   name                         ,  input   , oracle
    ['hexToRGB: full black'           , '#000000', { r: 0, g: 0, b: 0 }],
    ['hexToRGB: full white'           , '#FFFFFF', { r: 255, g: 255, b: 255 }],
    ['hexToRGB: C7 grey'              , '#C7C7C7', { r: 199, g: 199, b: 199 }],
    ['hexToRGB: full red'             , '#FF0000', { r: 255, g: 0, b: 0 }],
    ['hexToRGB: full blue'            , '#0000FF', { r: 0, g: 0, b: 255 }],
  ]);

  addTestSet(fiveui.color.rgbToHex, [
    //   name                         , 3 inputs,       oracle
    ['rgbToHex: full black'           , 0, 0, 0,       '#000000'],
    ['rgbToHex: full white'           , 255, 255, 255, '#FFFFFF'],
    ['rgbToHex: C7 grey'              , 199, 199, 199, '#C7C7C7'],
    ['rgbToHex: full red'             , 255, 0, 0,     '#FF0000'],
    ['rgbToHex: full blue'            , 0, 0, 255,     '#0000FF']
  ]);

  addTestSet(fiveui.color.colorToHex, [
    ['colorToHex: full black'         , '#000000', '#000000'],
    ['colorToHex: abreviated black 1' , '#0', '#000000'],
    ['colorToHex: abreviated black 2' , '#00', '#000000'],
    ['colorToHex: white'              , '#FFFFFF', '#FFFFFF'],
    ['colorToHex: abreviated white'   , '#FF', '#FFFFFF'],
    ['colorToHex: abreviated C7 grey' , '#C7', '#C7C7C7'],
    ['colorToHex: rgb(0, 0, 0)'       , 'rgb(0, 0, 0)', '#000000'],
    ['colorToHex: rgb(255, 255, 255)' , 'rgb(255, 255, 255)', '#FFFFFF'],
    ['colorToHex: rgb(222, 173, 190)' , 'rgb(222, 173, 190)', '#DEADBE'],
    ['colorToHex: rgba(255, 255, 255, 100)', 'rgba(255, 255, 255, 100)', '#FFFFFF'] // alpha is ignored
  ]);

  addTestSet(fiveui.color.colorToRGB, [
    ['colorToRGB: full black'         , '#000000', {r: 0, g: 0, b:0} ],
    ['colorToRGB: abreviated black 1' , '#0', {r: 0, g: 0, b:0} ],
    ['colorToRGB: white'              , '#FFFFFF', {r: 255, g: 255, b: 255} ],
    ['colorToRGB: rgb(222, 173, 190)' , 'rgb(222, 173, 190)', {r: 222, g: 173, b: 190, a: 1} ],
    ['colorToRGB: rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.7)', {r: 255, g: 255, b: 255, a: 0.7 } ]
  ]);

  addTestSet(fiveui.color.alphaCombine, [
    ['red and white make pinkish', {r: 255, g: 0, b: 0, a: 0.5}, {r: 255, g: 255, b: 255, a: 1}, 
                                  {r: 255, g: 127, b: 127, a: 1} ],
    ['red and yellow make orange', {r: 255, g: 0, b: 0, a: 0.5}, {r: 255, g: 255, b: 0, a: 1}, 
                                  {r: 255, g: 127, b: 0, a: 1} ]

  ]);

  // to test fiveui.color.findBGColor, we need a jQuery obj for input
  describe("fiveui.color.findBGColor", function () {

    beforeEach(function () {
      // insert new div id=test to add test html content to
      $("body").append($("<div id=test></div>"));
    });

    afterEach(function () {
      // remove the test div
      $("#test").remove();
    });

    it("should report a white background", function () {
      $("#test").append($('<div id=fbgc1 style="background-color: #FFFFFF">fbgc1</div>'));
      obj = $("#fbgc1");
      oracle = { r: 255, g: 255, b: 255, a: 1 };
      expect(fiveui.color.findBGColor(obj)).toEqual(oracle);
    });

    it("should report a red background", function () {
      $("#test").append($('<div id=fbgc2 style="background-color: #FF0000">fbgc2</div>'));
      obj = $("#fbgc2");
      oracle = { r: 255, g: 0, b: 0, a: 1 };
      expect(fiveui.color.findBGColor(obj)).toEqual(oracle);
    });

    it("should report a transparent red over white background", function () {
      $("#test").append($('<div id=fbgc3 style="background-color: #FFFFFF">' + 
                          'this bg is white ' +
                          '<span id=pinkspan ' +
                          'style="background-color: rgba(255, 0, 0, 0.5)">' +
                          'this bg is pink' +
                          '</span>' +
                          '</div>'));
      obj = $("#pinkspan");
      oracle = { r: 255, g: 128, b: 128, a: 1 };
      expect(fiveui.color.findBGColor(obj)).toEqual(oracle);
    });

  });


  var getFontTests = [
    // CSS ID,        Family,  Weight,   Size
    ['#getFontTest1', 'Arial', 'normal', '12'],
    ['#getFontTest2', 'Arial sans-serif', 'normal', '12'],
    ['#getFontTest3', 'Arial', 'bold', '12'],
    // this case deals with an unparsable font-size parameter, which yields an
    // empty size field on the result structure.
    ['#getFontTest4', 'Verdana', 'bold', '']
  ];


  var getFontTestsDom = jQuery(
    '<div><p id="getFontTest1" style="font-family: Arial; font-weight: normal; font-size: 12px">FontTest1</p>'
   +'<p id="getFontTest2" style="font-family: Arial sans-serif; font-weight: normal; font-size: 12px">FontTest2</p>'
   +'<p id="getFontTest3" style="font-family: Arial; font-weight: bold; font-size: 12px">FontTest3</p>'
   +'<p id="getFontTest4" style="font-family: Verdana; font-weight: bold; font-size: 12">FontTest4</p>'
   +'</div>'
  );

  _.each(getFontTests, function (spec) {
    it(spec[0], function() {
      var jElt = getFontTestsDom.find(spec[0]);
      var font = fiveui.font.getFont(jElt);
      expect(font.family.indexOf(spec[1])).not.toBe(-1);
      expect(font.weight.indexOf(spec[2])).not.toBe(-1);
      expect(font.size.indexOf(spec[3])).not.toBe(-1);
    });
  });

  var validateTests =
    // name, allow, font, oracle
    [ ['a:verdana-bold-10 f:verdana+sans-bold-10', {'Verdana':{'bold':[10]}},
        {'family':'Verdana sans-serif', 'weight':'bold', 'size':'10'},
        true ]
    , ['a:verdana-normal-12 f:verdana+sans-bold-10', {'Verdana':{'normal':[12]}},
        {'family':'Verdana sans-serif', 'weight':'bold', 'size':'10'},
        false ]
    , ['a:arial-normal-12 f:verdana+sans-bold-10', {'Arial':{'normal':[12]}},
        {'family':'Verdana sans-serif', 'weight':'bold', 'size':'10'},
        false ]
    , ['a:verdana-normal-10,12,14 f:verdana-normal-14', {'Verdana':{'normal':[10, 12, 14]}},
        {'family':'Verdana', 'weight':'normal', 'size':'14'},
        true ]
    , ['a:verdana-normal,bold-12 f:verdana-bold-12', {'Verdana':{'normal':[12], 'bold':[12]}},
        {'family':'Verdana', 'weight':'bold', 'size':'12'},
        true ]
    , ['a:verdana,arial-normal-12 f:arial-normal-12', {'Verdana':{'normal':[12]}, 'Arial':{'normal':[12]}},
        {'family':'Arial', 'weight':'normal', 'size':'12'},
        false ]
    ];
  _.each(validateTests, function (spec) {
    it(spec[0], function () {
      expect(fiveui.font.validate(spec[1], spec[2])).toEqual(spec[3]);
    });
  });

});
