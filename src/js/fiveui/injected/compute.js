/*
 * Module     : injected/fiveui-injected-compute.js
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

   var guidGenerator = function () {
     var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
     };
     return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
   };

   /**
    * Storage namespace for in-browser logic
    */
   var core = {};
   core.port = obtainComputePort();

   /**
    * Whether or not rules are fired when a dom change is detected.
    */
   core.maskRules = false;

   /**
    * Timeout (in miliseconds) for the dom to settle, before running the rules
    * engine again.
    */
   core.timeout = 500;

   /**
    * Whether or not the rules thread should be started.
    */
   core.scheduled = false;

   /**
    * Start the process that checks for the need to run the rules, and
    * reschedules when necessary.
    */
   core.scheduleRules = function() {
     core.lastEvent = new Date();

     var check = function() {
       var delta = new Date() - core.lastEvent;
       if(delta > core.timeout && !core.maskRules) {
         core.scheduled = false;
         core.evaluate(core.rules);
       } else {
         setTimeout(check, core.timeout);
       }
     };

     if(!core.scheduled && !core.maskRules) {
       core.scheduled = true;
       check();
     }
   };

   core.port.on('MaskRules', function() {
     core.maskRules = true;
   });

   core.port.on('UnmaskRules', function() {
     core.maskRules = false;
   });

   core.reportProblem = function(prob) {
     core.port.emit('ReportProblem', prob);
   };

   core.resetStats = function() {
     core.reportStats(
       { start:    0
       , end:      0
       , numRules: 0
       , numElts:  0
       });
   };

   core.reportStats = function(stats) {
     core.port.emit('ReportStats', stats);
   };

   core.hash = function(rule, message, node) {
     var prob = {
       name: rule.name,
       msg: message,
       descr: rule.description,
       url: window.location.href,
       severity: 1,
       xpath: core.getElementXPath(node)
     };

     var nodeParents = function(node) {
       var parents = '';
       $(node).parents().each(
         function (idx, elt) {
           parents += elt.tagName;
           parents += ">";
         });
       return parents;
     };

     var nodeHash = function(node) {
       if (node == null) {
         return "";
       }

       return nodeParents(node) + node.id + node.tagName;
     };

     var str = prob.name + prob.descr + prob.url + prob.severity
             + name + nodeHash(node);

     prob.hash = hex_md5(str); // hex_md5() is from md5.js

     return prob;
   };

   /* The next two methods are provided under the following license: */
   /* Software License Agreement (BSD License)

      Copyright (c) 2007, Parakey Inc.
      All rights reserved.

      Redistribution and use of this software in source and binary forms, with or without modification,
      are permitted provided that the following conditions are met:

      * Redistributions of source code must retain the above
        copyright notice, this list of conditions and the
        following disclaimer.

      * Redistributions in binary form must reproduce the above
        copyright notice, this list of conditions and the
        following disclaimer in the documentation and/or other
        materials provided with the distribution.

      * Neither the name of Parakey Inc. nor the names of its
        contributors may be used to endorse or promote products
        derived from this software without specific prior
        written permission of Parakey Inc.

      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
      IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
      FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
      CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
      DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
      DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
      IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
      OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */

   /**
    * Gets an XPath for an element which describes its hierarchical location.
    */
   core.getElementXPath = function(element)
   {
       if (element && element.id)
           return '//*[@id="' + element.id + '"]';
       else
           return core.getElementTreeXPath(element);
   };

   core.getElementTreeXPath = function(element)
   {
       var paths = [];

       // Use nodeName (instead of localName) so namespace prefix is included (if any).
       for (; element && element.nodeType == 1; element = element.parentNode)
       {
           var index = 0;
           for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
           {
               // Ignore document type declaration.
               if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                   continue;

               if (sibling.nodeName == element.nodeName)
                   ++index;
           }

           var tagName = element.nodeName.toLowerCase();
           var pathIndex = (index ? "[" + (index+1) + "]" : "");
           paths.splice(0, 0, tagName + pathIndex);
       }

       return paths.length ? "/" + paths.join("/") : null;
   };

   /* END of BSD licensed code */

   /**
    * @param {!Array.<Rule>} rs A list of Rule objects.
    */
   core.evaluate = function(rs) {
     var theRule = null;
     var date    = new Date();
     var stats   =
       { start:    date.getTime()
       , end:      null
       , numRules: 0
       , numElts:  0
       };
     fiveui.stats.numElts = 0; // reset stats element counter

     var report = {
       error:function(message, node) {
         var prob = core.hash(theRule, message, node);
         var query = $(node);
         if(!query.hasClass(prob.hash)) {
           query.addClass(prob.hash);
           core.reportProblem(prob);
         }
       }
     };

     for(var i=0; i<rs.length; ++i) {
       theRule = rs[i];

       if (theRule.rule) {
         try {
           // note: fiveui.stats.numElts is updated as a side effect here
           theRule.rule.call(window, report);
         } catch (e) {
           console.log('exception running rule: ' + theRule.name);
           console.log(e.toString());
         }
         stats.numRules += 1;
       }
     }

     date          = new Date();
     stats.end     = date.getTime();
     stats.numElts = fiveui.stats.numElts;
     core.reportStats(stats);
   };

   /**
    * Set up handlers for DOM mutation events, and register
    * recursively on inserted frames.
    */
   var registerDomListeners = function(context) {
     /**
      * @param {DOMNode} elt
      */
     var underFiveUI = function(elt) {
       var ancestor = $(elt).parentsUntil('#uic-top', 'body');
       return ancestor.length == 0;
     };

     var uicAttrEvent = function(elt){
       return null != elt.className
           && elt.className.search(/\s?uic-[^\s]+/) >= 0;
     };

     var handleDOMEvent = function(e){
       if ( !uicAttrEvent(e.target) && !underFiveUI(e.target) ) {
         core.scheduleRules();
       }
     };

     context.addEventListener('DOMNodeInserted', handleDOMEvent);
     context.addEventListener('DOMNodeRemoved', handleDOMEvent);
     context.addEventListener('DOMSubtreeModified', handleDOMEvent);
     context.addEventListener('DOMAttrModified', handleDOMEvent);
     context.addEventListener('DOMNodeRemovedFromDocument', handleDOMEvent);
     context.addEventListener('DOMNodeInsertedIntoDocument', handleDOMEvent);
     context.addEventListener('DOMCharacterDataModified', handleDOMEvent);
     context.addEventListener('DOMNodeInsertedIntoDocument', handleDOMEvent);

     context.addEventListener('DOMNodeInserted',
        function(e)  {
           var eTagName = e.target.tagName;
           if (eTagName == 'IFRAME' || eTagName == 'FRAME') {
             e.target.onload = function() {
               core.scheduleRules();
               registerDomListeners(e.target.contentDocument);
             };
           }
        });
   };

   var registerBackendListeners = function(port) {
     var assembleRules = function(ruleStrList) {
       var ruleList = [];

       for(var i=0; i<ruleStrList.length; ++i) {
         var moduleStr =
           [ '(function(){'
           , 'var exports = {};'
           , ruleStrList[i]
           , 'return exports;'
           , '})()'
           ].join('\n');

         try {
           var evaled = eval(moduleStr);
           ruleList.push(evaled);
         } catch (x) {
           console.error('Could not evaluate rule module: ' + x);
           console.error(moduleStr);
         }
       }
       return ruleList;
     };

     port.on('SetRules', function(payload) {
       core.rules = assembleRules(payload);

       core.scheduleRules();
       registerDomListeners(document);
     });

     port.on('ForceEval', function(ruleStrList){
       var ruleList = assembleRules(ruleStrList);
       core.evaluate(ruleList);
     });
   };

   registerBackendListeners(core.port);
   core.resetStats();
})();

