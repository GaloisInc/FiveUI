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
         core.evaluate(core.rules.rules);
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

   // XXX this hash isn't very unique, and should really be replaced with
   // something a little bit more robust
   core.hash = function(rule, name, node) {
     var prob = {
       name: name,
       descr: rule.description,
       url: window.location.href,
       severity: 1
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

     prob.hash = 0;
     for(var i=0; i<str.length; ++i) {
       var x = str.charCodeAt(i);
       prob.hash = ((prob.hash << 5) - prob.hash) + x;
       prob.hash = prob.hash & prob.hash; // convert to 32-bit?
     }

     prob.hash = prob.hash.toString();

     return prob;
   };

   core.evaluate = function(rs) {
     var theRule = null;

     var report = function(name, node) {
       var prob = core.hash(theRule, name, node);
       var query = $(node);
       if(!query.hasClass(prob.hash)) {
         query.addClass(prob.hash);
         core.reportProblem(prob);
       }
     };

     for (var i=0 ; i < rs.length; ++i) {
       theRule = rs[i];
       try {
         var fn = eval('('+rs[i].ruleStr+')');
       } catch (x) {
         console.log('could not load ruleStr for rule: '+theRule.name);
         console.log(x);
       }

       var scope = {
         name : theRule.name,
         description : theRule.description,
         ruleSet : core.rules
       };

       if (fn) {
         try {
           fn.apply(scope);
         } catch (x) {
           console.log('exception running rule: '+theRule.name);
           console.log(x);
         }
       }
     }
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
             console.log('frame added');
             e.target.onload = function() {
               console.log('frame loaded');
               core.scheduleRules();
               registerDomListeners(e.target.contentDocument);
             };
           }
        });
   };

   var registerBackendListeners = function(port) {
     port.on('SetRules', function(payload){
       core.rules = payload;
       if (null == core.rules) {
         debugger;
       }

       core.scheduleRules();
       registerDomListeners(document);
     });
   };

   registerBackendListeners(core.port);
})();
