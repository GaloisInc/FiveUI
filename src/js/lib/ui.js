
;(function() {

core = {};

/**
 * Template for the UI dialog
 */
var uiTemplate = _.template(
  [ '<div class="fiveui">'
  , '  <div class="fiveui-titlebar">'
  , '    FiveUI<div class="fiveui-close"><span class="icon-remove"></span></div>'
  , '  </div>'
  , '  <div class="fiveui-controls">'
  , '    <div class="fiveui-control fiveui-clear"><span class="icon-ok"></span></div>'
  , '    <div class="fiveui-control fiveui-break"><span class="icon-pause"></span></div>'
  , '  </div>'
  , '  <div class="fiveui-problems">'
  , '   problems!'
  , '  </div>'
  , '  <div class="fiveui-stats">stats</div>'
  , '</div>'
  ].join(''));

// setup the functionality of the close button on the ui
var setupClose = function(ui) {

  var close = ui.find('.fiveui-close');

  close.on('click.fiveui', function() {
    ui.hide();
  });

};

// set the titlebar object of the ui to be its drag handle
var setupDragDrop = function(ui) {

  var header = ui.find('.fiveui-titlebar');

  var offset = { x: 0, y: 0 };

  // update the location of the ui
  var mouseMove = function(e) {
    ui.css({
      left: e.originalEvent.clientX + offset.x,
      top:  e.originalEvent.clientY + offset.y,
    });
  };

  var cancel = function(e) {
    e.stopPropagation();
  };

  // both of these will cause funny things to happen with the text of the title
  // bar.
  header.on('dragstart',   cancel);
  header.on('selectstart', cancel);

  // figure out how far the cursor is from the top-left of the ui
  header.on('mousedown.fiveui', function(e) {

    // prevent the close button from being used as a drag handle
    if(e.target != header[0]) {
      return false;
    }

    var pos = ui.position();
    offset.x = pos.left - e.originalEvent.clientX;
    offset.y = pos.top  - e.originalEvent.clientY;

    $(window).on('mousemove.fiveui', mouseMove);
    header.one('mouseup.fiveui', function() {
      $(window).off('mousemove.fiveui', mouseMove);
    });
  });

};

// hook resize events in the UI to reposition the stats pane
var setupResize = function(ui) {

  ui.on('resize', function() {
    console.log('resize!');
  });

};

var problemTemplate = _.template(
  [ '<div class="fiveui-problem">'
  , '  <div class="fiveui-problem-header">'
  , '    <div class="fiveui-problem-toggle"></div>'
  , '  </div>'
  , '  <div class="fiveui-problem-body">'
  , '  </div>'
  , '</div>'
  ].join(''));

var addProblem = function(ui, problem) {

  var el = $(problemTemplate(problem));

  var problems = ui.find('.fiveui-problems');
  problems.append(el);

};

var createUI = function() {
  var ui = $(uiTemplate());

  setupClose(ui);
  setupDragDrop(ui);
  setupResize(ui);

  return ui;
};

$(function() {

  jQuery('body').append(createUI());

});

})();
