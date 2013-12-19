/*
 * Module     : injected/fiveui-injected-ui.js
 * Copyright  : (c) 2011-2012, Galois, Inc.
 *
 * Maintainer :
 * Stability  : Provisional
 * Portability: Portable
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(){

   /**
    * Storage namespace for in-browser logic
    */
   var core = {};
   core.port = obtainPort();

   core.getElementByXPath = function(path, context) {
     var nsResolver = document.createNSResolver(
         context.ownerDocument == null ? context.documentElement : context.ownerDocument.documentElement
     );
     var xpathResult = document.evaluate(path, document, nsResolver, XPathResult.ANY_TYPE, null);
     var $result = $(), nextElem;
     while (nextElem = xpathResult.iterateNext()) {
       $result = $result.add(nextElem);
     }
     return $result;
   };

   /* User Interface **********************************************************/

   core.UI = function() {
     this._initialize.apply(this, arguments);
   };


   _.extend(core.UI, {

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

     /**
      * Template for the stats panel of the UI dialog.
      */
     statsTemplate:_.template(
       [ '<table class="fiveui-table">'
       , '  <tr>'
       , '    <td class="fiveui-table-text">rules checked:</td>'
       , '    <td class="fiveui-table-number"><%= numRules %></td>'
       , '  </tr>'
       , '  <tr>'
       , '    <td class="fiveui-table-text">elements checked:</td>'
       , '    <td class="fiveui-table-number"><%= numElts %></td>'
       , '  </tr>'
       , '  <tr>'
       , '    <td class="fiveui-table-text">elapsed time (ms):</td>'
       , '    <td class="fiveui-table-number"><%= time %></td>'
       , '  </tr>'
       , '</table>'
       ].join('')),

   });

   _.extend(core.UI.prototype, {

     /**
      * Create the UI, and attach all event handlers.
      * @private
      */
     _initialize:function(opts) {

       // apply options
       var optNames = [ 'port' ];
       _.defaults(this, _.pick(opts, optNames));

       this.$el       = $(core.UI.uiTemplate());
       this.$problems = this.$el.find('.fiveui-problems');
       this.$stats    = this.$el.find('.fiveui-stats');

       this._setupButtons();
       this._setupDragDrop();

       this._pollResize();

       this._registerBackendListeners();

       // initially, keep the window hidden
       this.$el.hide();
     },

     /**
      * Setup the functionality of the close button on the ui
      * @private
      */
     _setupButtons:function() {

       var close = this.$el.find('.fiveui-close');
       close.on('click.fiveui', _.bind(this.hide, this));

       var clear = this.$el.find('.fiveui-clear');
       clear.on('click.fiveui', _.bind(this.clearProblems, this));

       // note, this only works in chrome
       var pause = this.$el.find('.fiveui-break');
       pause.on('click.fiveui', function() {
         debugger;
       });

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

           // deliver the new position to teh backend
           self.port.emit('Position', self.$el.position());
         });
       });

     },

     _pollResize:function() {

       var height = this.$el.height();

       if(height != this.height) {

         this.height = height;

         var ppos = this.$problems.position();
         var spos = this.$stats.position();

         this.$problems.height(spos.top - ppos.top);

         // notify the backend about the new height
         this.port.emit('Size', {
           width:  this.$el.width(),
           height: this.$el.height()
         });
       }

       setTimeout(_.bind(this._pollResize, this), 100);
     },

     /**
      * Setup listeners to the backend.
      */
     _registerBackendListeners:function() {

       var self = this;

       this.port.on('ShowUI', function(unused) {
         self.show();
       });

       this.port.on('ShowProblem', _.bind(this.addProblem, this));

       this.port.on('ShowStats', _.bind(this.renderStats, this));

       // initialize/create the ui, set its position and size
       this.port.on('RestoreUI', function(state) {

         // set the position and size
         self.$el.css({
           'top':    state.winState.y,
           'left':   state.winState.x,
           'width':  state.winState.width + 'px',
           'height': state.winState.height + 'px'
         });

         // optionally show the window
         if(!state.winState.closed) {
           self.show();
         }

         // add all problems
         _.each(state.problems, _.bind(self.addProblem, self));

         // render stats
         self.renderStats(state.stats);

       });
     },

     /**
      * Clear the problems list
      * @public
      */
     clearProblems:function() {
       this.$el.find('.fiveui-problems').children().remove();
       this.port.emit('ClearProblems');
     },

     /**
      * Add an entry in the problems list.
      * @public
      */
     addProblem:function(problem) {

       var p = new core.Problem(problem);
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
       this.port.emit('CloseUI');
     },

     /**
      * Show the UI
      * @public
      */
     show:function() {
       this.$el.show();
       this.height = 0;
     },

     /**
      * Render statistics
      */
     renderStats:function(stats) {

       stats = stats || {};
       _.defaults(stats, {
         numRules: 0,
         numElts: 0,
         start: 0,
         end: 0,
       });

       stats.time = stats.end - stats.start;

       this.$stats.html(core.UI.statsTemplate(stats));
     },

   });


   /**
    * Entries in the problem list.
    */
   core.Problem = function() {
     this._initialize.apply(this, arguments);
   };

   _.extend(core.Problem, {

     /**
      * Template for entries in the problems list
      */
     problemTemplate:_.template(
       [ '<div class="fiveui-problem fiveui-severity-<%= severity %>">'
       , '  <div class="fiveui-problem-header">'
       , '    <div class="fiveui-problem-toggle"><span></span></div>'
       , '    <%= name %>'
       , '    <a href="#" class="fiveui-problem-scrollTo">show</a>'
       , '  </div>'
       , '  <div class="fiveui-problem-body">'
       , '    <p><%= msg %></p>'
       , '    <p><span class="fiveui-xpath"><%= xpath %></span></p>'
       , '  </div>'
       , '</div>'
       ].join('')),

   });

   _.extend(core.Problem.prototype, {

     _initialize:function(problem) {

       this.problem = problem;

       this.$el     = $(core.Problem.problemTemplate(problem));
       this.$toggle = this.$el.find('.fiveui-problem-toggle');
       this.$body   = this.$el.find('.fiveui-problem-body');
       this.$header = this.$el.find('.fiveui-problem-header');
       this.isOpen  = false;

       var self = this;

       this.$el.on('click', function(event) {
         if (!$(event.target).is('a, a *')) {
           self.toggle();
         }
       });

       this.$el.on('click', '.fiveui-problem-scrollTo', function(event) {
         event.preventDefault();
         self.scrollTo();
       });

       this.$body.hide();

       this.close();
     },

     appendTo:function(el) {
       el.append(this.$el);
     },

     toggle:function() {
       this.isOpen = !this.isOpen;
       if (this.isOpen) {
         this.open();
       }
       else {
         this.close();
       }
     },

     /**
      * Close the context for a problem entry.
      * @public
      */
     close:function() {
       this.$toggle.find('span').removeClass('icon-caret-down')
                                .addClass('icon-caret-right');

       this.$body.slideUp(100);

       core.maskProblem(this.problem);
     },

     open:function() {
       this.$toggle.find('span').addClass('icon-caret-down')
                                .removeClass('icon-caret-right');

       this.$body.slideDown(100);

       core.highlightProblem(this.problem);
     },

     scrollTo:function() {
       var $elem  = core.getElementByXPath(this.problem.xpath, document);
       var top    = $elem.offset().top;
       var height = $elem.height();
       var viewHeight = $(window).height();
       var extra  = viewHeight - height;
       $(window).scrollTop(top - (extra * 0.33));
     }

   });


   core.lockDepth = 0;

   core.lockMask = function() {
     core.lockDepth = core.lockDepth + 1;
     if(core.lockDepth == 1) {
       core.port.emit('MaskRules', null);
     }
   };

   core.unlockMask = function() {
     core.lockDepth = core.lockDepth - 1;
     if(core.lockDepth == 0) {
       core.port.emit('UnmaskRules', null);
     }
   };

   /**
    * Due to the lack of a confirmation continuation with the port api, this
    * function runs a continuation after 10ms of delivering the MaskRules
    * message, then waits another 10ms before delivering the UnmaskRules
    * message.  The two delays seem to give a better chance that the
    * continuation runs within the masked context.
    */
   core.maskRules = function(body) {
     core.lockMask();

     setTimeout(function() {
       body();
       setTimeout(function() {
         core.unlockMask();
       }, 10);
     }, 10);
   };

   core.highlighted = {};

   core.highlightProblem = function(prob) {
     var obj = core.highlighted[prob.hash];
     if(obj) {
       // increment the number of times this has been highlighted
       obj.highlighted = obj.highlighted + 1;
     } else {
       // add the rule to the list of highlighted elements, and change its style
       // to look obvious.
       var elt      = fiveui.query('.' + prob.hash);
       var oldStyle = elt.attr('style');

       core.maskRules(function() {
         var newDiv = $('<div></div>');
         newDiv.attr('id', 'hlDiv-'+prob.hash);
         newDiv.offset(elt.offset());
         newDiv.height(elt.height());
         newDiv.width(elt.width());
         newDiv.css({ 'position': 'absolute'
                    , 'background-color': '#FF0000'
                    , 'opacity' : '0.3'
                    , 'zIndex'  : 10000
                    });
         $('body').append(newDiv);
       });

//       core.maskRules(function() {
//         elt.attr('style', 'background-color: rgba(255,0,0,0.3); background-image: none;');
//        elt.addClass('uic-problem');
//       });

       // record the element for the future
       core.highlighted[prob.hash] = {
         highlighted: 1,
         oldStyle:    oldStyle,
       };
     }
   };

   core.maskProblem = function(prob) {
     var obj = core.highlighted[prob.hash];

     if(obj) {
       obj.highlighted = obj.highlighted - 1;

       if(obj.highlighted == 0) {
         var elt = fiveui.query('.' + prob.hash);

         // remove the fiveui style
         core.maskRules(function() {
           if (_.isEmpty(obj.oldStyle)) {
             elt.removeAttr('style');
           } else {
             elt.attr('style', obj.oldStyle);
           }

           elt.removeClass('uic-problem');

           // remove overlay divs:
           $5('#hlDiv-'+prob.hash).remove();
         });

         delete core.highlighted[prob.hash];
       }
     }
   };

   core.renderStats = function (stats) {

     // give stats some sane defaults.

     core.maskRules(function () {

       var statsDiv, statsDetail;
       statsDiv = $('#fiveui-stats');
       statsDiv.children().remove();

       stats.time = stats.end - stats.start;
       statsDiv.html(core.renderStatsTemplate(stats));
     });
   };

   core.win = new core.UI({ port: core.port });

   core.win.appendTo($('body'));
})();
