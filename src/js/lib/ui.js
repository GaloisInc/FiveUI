
var fiveui = fiveui || {};

;(function() {

/* Templates ******************************************************************/

fiveui.UI = function() {
  this._initialize.apply(this, arguments);
};


_.extend(fiveui.UI, {

  /**
   * Template for the UI dialog
   */
  uiTemplate:_.template(
    [ '<div class="fiveui">'
    , '  <div class="fiveui-titlebar">'
    , '    FiveUI<div class="fiveui-close"><span class="icon-remove"></span></div>'
    , '  </div>'
    , '  <div class="fiveui-controls">'
    , '    <div class="fiveui-control fiveui-clear" title="clear"><span class="icon-ok"></span></div>'
    , '    <div class="fiveui-control fiveui-break" title="break"><span class="icon-pause"></span></div>'
    , '  </div>'
    , '  <div class="fiveui-problems"></div>'
    , '  <div class="fiveui-stats"></div>'
    , '</div>'
    ].join('')),

});



_.extend(fiveui.UI.prototype, {

  /**
   * Create the UI, and attach all event handlers.
   * @private
   */
  _initialize:function() {

    this.$el       = $(fiveui.UI.uiTemplate());
    this.$problems = this.$el.find('.fiveui-problems');
    this.$stats    = this.$el.find('.fiveui-stats');

    this._setupClose();
    this._setupControls();
    this._setupDragDrop();
    this._pollResize();

  },

  /**
   * Setup the functionality of the close button on the ui
   * @private
   */
  _setupClose:function() {

    var close = this.$el.find('.fiveui-close');
    close.on('click.fiveui', _.bind(this.hide, this));

  },

  /**
   * Setup the functionality for the controls part of the UI.
   * @private
   */
  _setupControls:function() {


  },

  /**
   * Setup the drag and drop functionality for the problems window.
   * @private
   */
  _setupDragDrop:function() {

    var self   = this;
    var header = this.$el.find('.fiveui-titlebar');
    var offset = { x: 0, y: 0 };


    // update the location of the ui
    var mouseMove = function(e) {
      self.$el.css({
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

      var pos  = self.$el.position();
      offset.x = pos.left - e.originalEvent.clientX;
      offset.y = pos.top  - e.originalEvent.clientY;

      $(window).on('mousemove.fiveui', mouseMove);
      header.one('mouseup.fiveui', function() {
        $(window).off('mousemove.fiveui', mouseMove);
      });
    });

  },

  _pollResize:function() {

    var height = this.$el.height();

    if(height != this.height) {
      this.height = height;

      var ppos = this.$problems.position();
      var spos = this.$stats.position();

      this.$problems.height(spos.top - ppos.top)
    }

    setTimeout(_.bind(this._pollResize, this), 100);
  },

  /**
   * Clear the problems list
   * @public
   */
  clearProblems:function() {
    this.$el.find('.fiveui-problems').children().remove();
  },

  /**
   * Add an entry in the problems list.
   * @public
   */
  addProblem:function(problem) {

    var p = new fiveui.Problem(problem);
    p.appendTo(this.$el.find('.fiveui-problems'));

  },

  /**
   * Attach the UI to a jquery selector.
   * @public
   */
  appendTo:function(el) {
    el.append(this.$el);
  },

  /**
   * Hide the UI
   * @public
   */
  hide:function() {
    this.$el.hide();
  },

  /**
   * Show the UI
   * @public
   */
  show:function() {
    this.$el.show();
  },

});


/**
 * Entries in the problem list.
 */
fiveui.Problem = function() {
  this._initialize.apply(this, arguments);
};

_.extend(fiveui.Problem, {

  /**
   * Template for entries in the problems list
   */
  problemTemplate:_.template(
    [ '<div class="fiveui-problem fiveui-severity-<%= severity %>">'
    , '  <div class="fiveui-problem-header">'
    , '    <div class="fiveui-problem-toggle"><span></span></div>'
    , '    <%= name %>'
    , '  </div>'
    , '  <div class="fiveui-problem-body">'
    , '    <%= descr %><br />'
    , '    <span class="fiveui-xpath"><%= xpath %></span>'
    , '  </div>'
    , '</div>'
    ].join('')),

});

_.extend(fiveui.Problem.prototype, {

  _initialize:function(problem) {
    this.$el     = $(fiveui.Problem.problemTemplate(problem));
    this.$toggle = this.$el.find('.fiveui-problem-toggle');
    this.$body   = this.$el.find('.fiveui-problem-body');
    this.$header = this.$el.find('.fiveui-problem-header');

    this.$body.hide();

    this.close();
  },

  appendTo:function(el) {
    el.append(this.$el);
  },

  /**
   * Close the context for a problem entry.
   * @public
   */
  close:function() {
    this.$toggle.find('span').removeClass('icon-caret-down')
                             .addClass('icon-caret-right');

    this.$el.one('click', _.bind(this.open, this));
    this.$body.slideUp(100);
  },

  open:function() {
    console.log('open');

    this.$toggle.find('span').addClass('icon-caret-down')
                             .removeClass('icon-caret-right');

    this.$el.one('click', _.bind(this.close, this));
    this.$body.slideDown(100);
  },

});


$(function() {

  var ui = new fiveui.UI();
  ui.appendTo(jQuery('body'));

});

})();
