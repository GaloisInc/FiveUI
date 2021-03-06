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

/*jshint evil:true */
/*global fiveui, hex_md5 */

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
    * Whether rules are being currently executed.
    */
   core.rulesRunning = false;

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
   core.scheduleRules = _.debounce(function() {
     if (!core.maskeRules) {
       core.evaluate(core.rules);
     }
   }, core.timeout);

   core.port.on('MaskRules', function() {
     core.maskRules = true;
   });

   core.port.on('UnmaskRules', function() {
     core.maskRules = false;
   });

   core.reportProblem = function(prob) {
     core.port.emit('ReportProblem', prob);
   };

   core.reportStats = function(stats) {
     core.port.emit('ReportStats', stats);
   };

   core.hash = function(rule, message, node) {

     var prob = {
       name:     rule.name,
       msg:      message,
       descr:    rule.description,
       url:      window.location.href,
       severity: 0,  // default is error
       xpath:    core.getElementXPath(node),
       phash:    null,
       hash:     null,
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
       if (!node) {
         return "";
       }

       return nodeParents(node) + node.id + node.tagName + core.getElementXPath(node);
     };

     var str = prob.name + prob.descr + prob.url + prob.severity
             + name + nodeHash(node);

     // hex_md5() is from md5.js
     prob.hash  = hex_md5(str);
     prob.phash = hex_md5(str + message);

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

   core.beforeRules = function() {

     if(core.dialog) {
       core.dialog.remove();
     }

     core.rulesRunning = true;
   };

   core.afterRules = function() {
     // Delay resetting the rulesRunning flag until after scheduled
     // MutationObserver callbacks run.
     setTimeout(function() {
       core.rulesRunning = false;
     }, 0);

     if(core.dialog) {
       $('body').append(core.dialog);
     }
   };

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

     var genericReporter = function (severity) {
       return function (message, node) {
         var prob = core.hash(theRule, message, node);
         var query = $(node);

         // let the backend sort out if this problem has been reported already
         query.addClass(prob.hash);
         prob.severity = severity;
         core.reportProblem(prob);
       };
     };

     var report = {
       error: genericReporter(0),
       warning: genericReporter(1),
       advisory: genericReporter(2),
       info: genericReporter(3)
     };

     core.beforeRules();

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

     core.afterRules();

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
     // MutationObserver is not supported in IE prior to version 11.
     if (typeof MutationObserver === 'undefined') {
       return;
     }

     var observer = new MutationObserver(handleMutations);

     observer.observe(context, {
       attributes:        true,
       attributeOldValue: true,
       childList:         true,
       characterData:     true,
       subtree:           true
     });

     function handleMutations(records) {
       records.forEach(handleMutation);
     }

     function handleMutation(record) {
       if (record.addedNodes) {
         _.each(_.toArray(record.addedNodes), instrumentFrame);
       }
       if (
         !core.rulesRunning
           && !uicAttrEvent(record)
           && !underFiveUI(record.target)
       ) {
         core.scheduleRules();
       }
     }

     /**
      * @param {DOMNode} elt
      */
     function underFiveUI(elt) {
       return $(elt).closest('.fiveui').length > 0;
     }

     function uicAttrEvent(record) {
       return record.attributeName && isUicClass(record.target.className);
     }

     var uicExp = /(?:^|\s)uic-[^\s]+/;

     function isUicClass(className) {
       return className && uicExp.exec(className);
     }

     function instrumentFrame(element) {
       var eTagName = element.tagName;
       var $elem = $(element);
       if ($elem.is('iframe,frame')) {
         $elem.load(function() {
           core.scheduleRules();
           registerDomListeners(this.contentDocument);
         });
       }
     }
   };

   var registerBackendListeners = function(port) {
     /**
      * @param {{rules: [string], dependencies: [{ content: string, url: string }]}} ruleDescr
      */
     var assembleRules = function(__assembleRules_ruleDescr) {
       // Use long variable names: top-level variables in eval'ed
       // dependencies will be created in the scope of this function and
       // we want to avoid collisions.
       var __assembleRules_ruleList = []
         , __assembleRules_deps = __assembleRules_ruleDescr.dependencies || []
         , __assembleRules_i;

       // Use for loop instead of _.each so that top-level variables in
       // eval'ed dependencies will be created in the scope of the
       // `assembleRules` function.  The goal is to run rules in the
       // same scope so that rules have access to top-level variables
       // from defined in dependency scripts.
       for (__assembleRules_i = 0; __assembleRules_i < __assembleRules_deps.length; __assembleRules_i += 1) {
         try {
           eval(__assembleRules_deps[__assembleRules_i].content);
         } catch (x) {
           console.error('Could not evaluate rule dependency: ' +
                         __assembleRules_deps[__assembleRules_i].url);
           console.error(x);
         }
       }

       var __assembleRules_ruleStrList = __assembleRules_ruleDescr.rules;
       for(__assembleRules_i=0; __assembleRules_i<__assembleRules_ruleStrList.length; ++__assembleRules_i) {
         var __assembleRules_moduleStr =
           [ '(function(){'
           , __assembleRules_ruleStrList[__assembleRules_i]
           , '})()'
           ].join('\n');

         try {
           var exports = {};
           eval(__assembleRules_moduleStr);
           __assembleRules_ruleList.push(exports);
         } catch (x) {
           console.error('Could not evaluate rule module: ' + x);
           console.error(__assembleRules_moduleStr);
         }
       }
       return __assembleRules_ruleList;
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
})();

