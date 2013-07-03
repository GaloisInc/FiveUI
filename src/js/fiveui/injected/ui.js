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

   core.ui = $('<div></div>');

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
         elt.attr('style', 'background-color: rgba(255,0,0,0.3); background-image: none;');
         elt.addClass('uic-problem');
       });

       // record the element for the future
       core.highlighted[prob.hash] = {
         highlighted: 1,
         oldStyle:    oldStyle,
       }
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
         });

         delete core.highlighted[prob.hash];
       }
     }
   };

   core.renderStatsTemplate = _.template(
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
     ].join(''));

   core.renderStats = function (stats) {

     // give stats some sane defaults.
     stats = stats || {};
     _.defaults(stats, {
       numRules: 0,
       numElts: 0,
       start: 0,
       end: 0,
     });

     core.maskRules(function () {

       var statsDiv, statsDetail;
       statsDiv = $('#fiveui-stats');
       statsDiv.children().remove();

       stats.time = stats.end - stats.start;
       statsDiv.html(core.renderStatsTemplate(stats));
     });
   };

   core.renderProblem = function(prob) {
     core.maskRules(function() {
       var probDiv = $('<div class="pr"></div>');


       /** Problem Controls **/
       var prControls = $('<div class="prControls"></div>');
       probDiv.append(prControls);

       var prSeverity = $('<div class="prSeverity"></div>');
       prControls.append(prSeverity);

       if (1 == prob.severity) {
         prSeverity.addClass('prSeverity-err');
       } else {
         prSeverity.addClass('prSeverity-warn');
       }

       var prExpand = $('<div class="prExpand prExpand-right"></div>');
       prControls.append(prExpand);

       /** Problem Content **/
       var prMessage = $('<div class="prMessage"></div>');
       probDiv.append(prMessage);       

       var prTitle = $('<div class="prTitle">'+prob.name+'</div>');
       prMessage.append(prTitle);

       var prDetails = $('<div class="prDetails"></div>');
       prMessage.append(prDetails);


       var prDescr  = $('<p>'+prob.descr+'</p>');
       var prPath   = $('<p>'+prob.xpath+'</p>');
       prDetails.append(prDescr);
       if (prob.msg) {
         var reportMsg = $('<div class="prReportMessage">'+prob.msg+'</div>');
         prDetails.append(reportMsg);
       }
       prDetails.append(prPath);
       prDetails.hide();

       $('#problemList').append(probDiv);

       prExpand.click(
         function() {
           var elt = $(this);
           if(elt.is('.prExpand-down')) {
             elt.removeClass('prExpand-down')
                .addClass('prExpand-right');
             prDetails.hide();
             core.maskProblem(prob);
           } else {
             elt.addClass('prExpand-down')
                .removeClass('prExpand-right');
             prDetails.show();
             core.highlightProblem(prob);
           }

           return false;
         });
     });
   };

   var dragStop = function(evt,e) {
     core.port.emit('Position', core.ui.parent().position());
   };

   var resizeStop = function(evt,e) {
     core.port.emit('Size', { width: core.ui.width(), height: core.ui.height() });
   };

   var beforeClose = function(evt,e) {
     core.port.emit('CloseUI');
   };

   var registerBackendListeners = function(port) {

     port.on('ShowUI', function(unused) {
       core.ui.dialog('open');
     });

     port.on('ShowProblem', function(problem) {
       core.renderProblem(problem);
     });

     port.on('ShowStats', function(stats) {
       core.renderStats(stats);
     });

     port.on('RestoreUI', function(state) {
       core.ui.append($('<div id="controls"></div>'));

       core.ui.append($('<div id="problemList"></div>'));

       var newDialog = core.ui.dialog({ title: 'FiveUI',
                        dragStop: dragStop,
                        resizeStop: resizeStop,
                        beforeClose: beforeClose,
                        position: [state.winState.x, state.winState.y],
                        width: state.winState.width,
                        height: state.winState.height,
                        autoOpen: false,
                        zIndex: 50000
                      });
       newDialog.parent().attr('id', 'fiveui-top');

       $('#controls').append($('<div id="clearButton"></div>')
                             .button({ label: 'clear' }));

       $('#clearButton').click(function() {
             $('#problemList').children().remove();
             port.emit('ClearProblems');

             core.renderStats();
             $('prExpand-down').click();

             // Just in case the click event on prExpand-down missde anything:
             core.maskProblem(fiveui.query('.uic-problem'), undefined);
             core.renderStats();
         });

       ///////////////////////////////////////////
       // Add a button that causes a debuger break.
       //
       // handy for playing with Jquery on the dom.
       // Note: This only works in Google Chrome.
       $('#controls').append($('<div id="breakButton"></div>')
                             .button({ label: 'break' }));
       $('#breakButton').click(function() {
                                 debugger;       //
                               });               //
       ////////////////////////////////////////////

       core.ui.append($('<div id="fiveui-stats"></div>'));

       if(!state.winState.closed) {
         core.ui.dialog('open');
       }

       $(state.problems).each(function(ix,prob) {
                                core.renderProblem(prob);
                              });

       core.renderStats(state.stats);
     });
   };

   registerBackendListeners(core.port);
})();
