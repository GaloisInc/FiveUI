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

   core.ui = $('<div></div>')
     .attr('id', 'uic-dialog');

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

   core.highlightProblem = function(elt) {
     core.maskRules(function() {
       elt.css('background-color', 'rgba(255,0,0,0.3)')
          .addClass('uic-problem');
     });
   };

   core.maskProblem = function(elt) {
     core.maskRules(function() {
       elt.css('background-color', '')
          .removeClass('uic-problem');
     });
   };

   core.renderStats = function (stats) {
     core.maskRules(function () {
       var statsDiv, statsDetail;
       statsDiv = $('#fiveui-stats');
       statsDiv.children().remove();
       statsDetail = $('<table class="fiveui-table"><tr><td>rules checked:</td><td class="fiveui-table-number">' + stats.numRules + '</td></tr>' +
                           '<tr><td>elements checked:</td><td class="fiveui-table-number">' + stats.numElts + '</td></tr>' +
                           '<tr><td>elapsed time (ms):</td><td class="fiveui-table-number">' + (stats.end - stats.start) + '</td></tr></table>');
       statsDiv.append(statsDetail);
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
       prDetails.append(prDescr);
       prDetails.hide();

       $('#problemList').append(probDiv);

       prExpand.click(
         function() {
           var elt = $(this);
           if(elt.is('.prExpand-down')) {
             elt.removeClass('prExpand-down')
                .addClass('prExpand-right');
             prDetails.hide();
             core.maskProblem(fiveui.query('.' + prob.hash));
           } else {
             elt.addClass('prExpand-down')
                .removeClass('prExpand-right');
             prDetails.show();
             core.highlightProblem(fiveui.query('.' + prob.hash));
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
       newDialog.parent().attr('id', 'uic-top');

       $('#controls').append($('<div id="clearButton"></div>')
                             .button({ label: 'clear' }));

       $('#clearButton').click(function() {
             $('#problemList').children().remove();
             port.emit('ClearProblems');
             core.maskProblem(fiveui.query('.uic-problem'));
         });

       ///////////////////////////////////////////
       // Add a button that causes a debuger break.
       //
       // handy for playing with Jquery on the dom.
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
