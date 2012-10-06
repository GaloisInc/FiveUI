/*
 * Module     : options.js
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

goog.provide('fiveui.options.init');

goog.require('fiveui.Entry');
goog.require('fiveui.Messenger');
goog.require('fiveui.RuleSet');
goog.require('fiveui.RuleSetEntry');
goog.require('fiveui.UpdateManager');
goog.require('fiveui.UrlPat');
goog.require('fiveui.UrlPatEntry');

goog.require('fiveui.prelude.color');

goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.dom.query');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.structs');
goog.require('goog.ui.Dialog');


var gdom = goog.dom;


/*****************************************************************
 *
 * Misc. utility functions
 *
 ****************************************************************/

var setClickHandler = function(id, fn, scope) {
  var boundFn = fn;
  if (scope) {
    boundFn = goog.bind(fn, scope);
  }
  goog.events.listen(gdom.getElement(id), 'click', boundFn);
};

/**
 * @param {!string} selectEltId The id of the select element to
 * search for selected items.
 * @return {!Array.<!number>} An array of 'value' entries from the
 * selected elements.  This may be empty, but it will not be null.
 */
var findSelectedIds = function(selectEltId) {
  var opts = query('option:checked',
                   gdom.getElement(selectEltId));
  return (/** @type {!Array.<!number>} */
    goog.structs.map(opts,
                     function(o) { return o.value; }));
};

var query = function(query, opt_scope) {
  return (/** @{Array.<!Node>} */ gdom.query(query, opt_scope));
};


/**
 * @param {{on: function(!string, function(*)), emit: function(!string, *)}} port
 */
fiveui.options.init = function(port) {

  var msg = new fiveui.Messenger(port);
  var update = new fiveui.UpdateManager(msg);

  /** Update/Delete Manager ***************************************************/

  /** Unprocessed Rule Manipulation *******************************************/

  /**
   * Given an object containing a rule function, serialize the function to a
   * string, and place it in the ruleStr field of that object.
   *
   * @param {!Object} obj The object to modify.
   * @return {void}
   */
  var serializeRule = function(obj) {
    obj.ruleStr = obj.rule.toString();
    delete obj.rule;
  };

  /**
   * Parse a ruleSet string into a json object.
   *
   * @param {!string} ruleSetText The text to parse.
   * @return {?Object}
   */
  var parseRuleSet = function(ruleSetText) {
    var obj = {};
    try {
      obj = goog.json.unsafeParse(ruleSetText);
    } catch (x) {
      alert('Eval error: ' + x.toString());
    }
    goog.structs.forEach(obj.rules, serializeRule);
    obj.original = ruleSetText;
    return obj;
  };


  /** Backend RuleSet update functions ****************************************/

  /**
   * Add a rule set from a textual representation.
   *
   * @param {!string} ruleSetText
   * @return {void}
   */
  var addRuleSet = function(ruleSetText) {
    var obj = parseRuleSet(ruleSetText);
    if (obj) {
      msg.send('addRuleSet', obj);
    }
  };

  /**
   * Update an existing rule set, given an id and a new rule set object.
   *
   * @param {!number} ruleSetId The id of the rule set to modify.
   * @param {!string} ruleSetText The text of the rule set.
   * @return {void}
   */
  var updateRuleSet = function(ruleSetId, ruleSetText) {
    var obj = parseRuleSet(ruleSetText);
    if (obj) {
      msg.send('updateRuleSet', {'id': ruleSetId, 'obj': obj });
    }
  };

  /**
   * Remove a rule set.
   *
   * @param {!number} ruleSetId
   * @return {void}
   */
  var remRuleSet = function(ruleSetId) {
    msg.send('remRuleSet', ruleSetId,
      function(resp) {
        if (resp.removed) {
          goog.events.dispatchEvent(update, 'remRuleSet.' + ruleSetId);
        } else {
          showRemRuleSetErr(ruleSetId, resp.pats);
        }
      });
  };

  /**
   * @param {!number} ruleSetId
   * @param {!function(?fiveui.RuleSet)} cb
   */
  var getRuleSet = function(ruleSetId, cb) {
    msg.send('getRuleSet', ruleSetId, cb);
  };

  /**
   * @param {!function(*)} cb Callback to process the ruleset array.
   */
  var getRuleSets = goog.bind(msg.send, msg, 'getRuleSets', null);


  /** Backend UrlPat update functions ****************************************/

  /**
   * @param {!function(Array.<fiveui.UrlPat>)} cb
   */
  var getUrls = function(cb) {
  };

  /**
   * @param {!string} pattern
   * @param {!number} ruleSetId
   */
  var addUrlPat = function(pattern, ruleSetId) {
    msg.send('addUrlPat', {'pattern': pattern, 'ruleSetId': ruleSetId});
  };

  /**
   * @param {!number} urlPatId
   * @param {!function(?fiveui.UrlPat)} cb
   */
  var getUrlPat = function(urlPatId, cb) {
    msg.send('getUrlPat', urlPatId, cb);
  };

  /**
   * @param {!number} urlId
   */
  var remUrlPat = function(urlId) {
    msg.send('remUrlPat', urlId);
  };

  /**
   * Set the default display state for the FiveUI Window.
   *
   * @param {!boolean} def The default state for the FiveUI Window.
   */
  var setDisplayDefault = function(def) {
    msg.send('setDisplayDefault', def);
  };

  /** UrlPat list entries ****************************************************/

  /**
   * @param {!fiveui.UrlPat} pat The new url pattern.
   */
  var onAddUrlPat = function(pat) {
    getRuleSet(pat.rule_id, function(rs) {
      if (null == rs) {
        console.error('could not find ruleset with id: ' + pat.rule_id);
        return;
      }

      var entry = new fiveui.UrlPatEntry(pat, rs);
      entry.append(gdom.getElement('urlPatEntries'));
      goog.events.listen(entry, 'remove', function() {
        remUrlPat(pat.id);
      });

      goog.events.listen(update, 'remUrlPat.' + pat.id,
          goog.bind(entry.remove, entry));

      goog.events.listen(update, 'updateRuleSet.' + pat.rule_id,
          goog.bind(entry.setRuleSet, entry));
    });
  };

  // register to handle new url patterns from the backend
  msg.register('addUrlPat', onAddUrlPat);


  /** UrlPat editor overlay **************************************************/

  var getUrlPatEditor = function() {
    return gdom.getElement('urlPatEditorPane');
  };

  var openUrlPatEditor = function() {
    getRuleSets(function(ruleSets) {
      if (ruleSets.length <= 0) {
        var errDialog = new goog.ui.Dialog();
        errDialog.setTitle('No Rule Sets Defined');
        errDialog.setContent('No rule sets are defined.  Please define some '
                           + 'before creating a URL Pattern.');

        errDialog.setButtonSet(goog.ui.Dialog.ButtonSet.createOk());
        errDialog.setVisible(true);

        goog.events.listen(errDialog, goog.ui.Dialog.EventType.SELECT,
            closeUrlPatEditor);
      } else {
        var pane = getUrlPatEditor();
        pane.style.display = 'block';
      }
    });
  };

  var closeUrlPatEditor = function() {
    var pane = getUrlPatEditor();
    pane.style.display = 'none';

    // clear out the text field
    gdom.forms.setValue(gdom.getElement('urlPatRegex'), '');
  };

  setClickHandler('addUrlPat', openUrlPatEditor);

  setClickHandler('cancelAddUrlPat', closeUrlPatEditor);

  setClickHandler('confirmAddUrlPat', function() {
    var pat = gdom.forms.getValue(gdom.getElement('urlPatRegex'));
    var rs = gdom.forms.getValue(gdom.getElement('urlPatRuleSetId'));

    if (pat && rs) {
      addUrlPat(pat, rs);
      closeUrlPatEditor();
    }

    // TODO we need to notify them that the creation failed
  });


  /** RuleSet list entries ***************************************************/

  /**
   * Respond to addRuleSet events from the backend.
   *
   * @param {!fiveui.RuleSet} ruleSet The RuleSet that was added.
   */
  var onAddRuleSet = function(ruleSet) {
    // register the rule set with the drop down
    var rsDropDown = gdom.createDom('option', { value: ruleSet.id },
        ruleSet.name);
    gdom.appendChild(gdom.getElement('urlPatRuleSetId'), rsDropDown);

    // create the rule set list entry
    var entry = new fiveui.RuleSetEntry(ruleSet);
    entry.append(gdom.getElement('ruleSetEntries'));

    goog.events.listen(entry, 'remove', function() {
      remRuleSet(ruleSet.id);
    });

    goog.events.listen(entry, 'edit', function() {
      editButtonHandler(ruleSet.id);
    });

    goog.events.listen(update, 'updateRuleSet.' + ruleSet.id,
      function(newRuleSet) {
        entry.setRuleSet(newRuleSet);
        gdom.setTextContent(rsDropDown, newRuleSet.name);
      });

    var cleanup = function() {
      entry.remove();
      gdom.removeNode(rsDropDown);
      goog.events.unlisten(update, 'remRuleSet.' + ruleSet.id, cleanup);
    };

    goog.events.listen(update, 'remRuleSet.' + ruleSet.id, cleanup);
  };

  /**
   * @param {?number} ruleSetId Optional: The id of the rule to open in the editor.
   */
  var editButtonHandler = function(ruleSetId) {
    var editPane = gdom.getElement('ruleSetEditorPane');
    editPane.curRuleSetId = ruleSetId;
    showEditorPane(true);

    if (ruleSetId != null) {
      getRuleSet(ruleSetId,
        function(ruleSet) {
          if (ruleSet) {
            setEditorText(ruleSet.original);
          }
        });
    } else {
      setEditorText('');
    }
  };

  // Register for events from the messenger:
  msg.register('addRuleSet', onAddRuleSet);

  // listen to clicks to the add rule set button
  setClickHandler('addRsButton', goog.bind(editButtonHandler, this, null));


  /** RuleSet Editor Overlay *************************************************/

  var editor = ace.edit('aceEditor');

  /**
   * Display an error dialog with a list of url pattern that rely on a
   * given rule id.
   */
  var showRemRuleSetErr = function(ruleSetId, urlPats) {
    var info = '';
    goog.structs.forEach(urlPats, function(m) {
      info += '<li>' + m.regex + '</li>';
    });

    var errDialog = new goog.ui.Dialog();
    errDialog.setTitle('Rule Set could not be removed.');
    errDialog.setContent('<p>The following Url Patterns use this rule set:</p>'
                         + '<ul>'
                         + info
                         + '</ul>'
                         + 'Remove these Url Patterns as well?');

    errDialog.setButtonSet(goog.ui.Dialog.ButtonSet.createOkCancel());
    errDialog.setVisible(true);

    goog.events.listen(errDialog, goog.ui.Dialog.EventType.SELECT, function(e) {
      if (e.key == 'ok') {
        // Remove the url patterns:
        goog.structs.forEach(urlPats, function(urlPat) {
          remUrlPat(urlPat.id);
        });
        // re-issue the RuleSet remove:
        remRuleSet(ruleSetId);
      }
    });
  };

  /**
   * Show or hide the editor pane that contains the Ace text editor.
   *
   * @param {!boolean} showP True to show the edit pane, false to hide
   * it.
   */
  var showEditorPane = function(showP) {
    var editPane = gdom.getElement('ruleSetEditorPane');
    if (! showP) {
      editPane.style.display = 'none';
      return;
    }

    editPane.style.display = 'block';


    var buttonPane = gdom.getElement('editorButtons');
    var newWidth = editPane.clientWidth - 10;
    var newHeight = editPane.clientHeight - 10;
    for (var i = 0; i < editPane.children.length; ++i) {
      var child = editPane.children[i];
      if (child.id == 'aceEditor') {
        break;
      } else {
        newHeight = newHeight - child.clientHeight;
      }
    }

    var editorDiv = gdom.getElement('aceEditor');
    editorDiv.style.width = newWidth + 'px';
    editorDiv.style.height = newHeight + 'px';
    editor = ace.edit('aceEditor');

    var JavaScriptMode = require('ace/mode/javascript').Mode;
    editor.getSession().setMode(new JavaScriptMode());

    // disable javascript validation
    editor.getSession().setUseWorker(false);
  };

  // set the content of the editor widget
  var setEditorText = function(string) {
    editor.getSession().setValue(string);
  };

  // listen to click events from the cancel button in the rule set editor
  setClickHandler('cancelEditButton',
    function() {
      showEditorPane(false);
  });

  // listen to click events from the save button in the rule set editor
  setClickHandler('saveEditButton',
    function() {
      var editPane = gdom.getElement('ruleSetEditorPane');
      var rsText = editor.getSession().getValue();
      if (null != editPane.curRuleSetId) {
        updateRuleSet(editPane.curRuleSetId, rsText);
      } else {
        addRuleSet(rsText);
      }
      showEditorPane(false);
    });

  // change default display state
  setClickHandler('windowDisplayDefault',
    function(event) {
      var displayDef = event.currentTarget.checked;
      setDisplayDefault(displayDef);
    });

  /** Tab Management *********************************************************/

  /**
   * Select a tab header by Element reference.
   *
   * @param {!Element} clicked The navigation element to focus.
   * @return {void}
   */
  var selectNav = function(clicked) {
    var nav = gdom.getParentElement(clicked);
    goog.structs.forEach(query('div.selected', nav), function(sel) {
      gdom.classes.remove(sel, 'selected');
    });
    goog.structs.forEach(query('div.editorPane'), function(pane) {
      pane.style.display = 'none';
    });
    gdom.classes.add(clicked, 'selected');
  };

  /**
   * Focus a tab, by Element reference.
   *
   * @param {!Element} el The tab element to focus.
   * @return {void}
   */
  var selectSection = function(el) {
    var cont = gdom.getParentElement(el);
    var sel = gdom.query('section', cont);
    for (var i = 0; i < sel.length; ++i) {
      gdom.classes.remove(sel[i], 'selected');
      sel[i].style.display = 'none';
    }
    sel = gdom.query('section', el);
    for (i = 0; i < sel.length; ++i) {
      sel[i].style.display = 'block';
    }
    gdom.classes.add(el, 'selected');
    el.style.display = 'block';
  };

  /**
   * A combination of selectNav and selectSection that will first lookup the
   * elements associated with a tab, then return a new function that when
   * called, will focus both the navigation element, and the tab it controls.
   *
   * @param {!string} id The id of the tab to focus.
   * @return {function()}
   */
  var select = function(id) {
    var sel = gdom.getElement(id);
    return function() {
      selectNav(this);
      selectSection(sel);
    };
  };

  // listen to click events on navigation elements
  setClickHandler('url-defaults', select('tab-url-defaults'));
  setClickHandler('rule-sets', select('tab-rule-sets'));
  setClickHandler('basics', select('tab-basics'));

  // select the url patterns tab by default
  selectNav(gdom.getElement('url-defaults'));
  selectSection(gdom.getElement('tab-url-defaults'));


  /** Pre-populate UI elements ***********************************************/

  // pre-populate the list of url patterns
  msg.send('getUrls', null, function(pats) {
    goog.structs.forEach(pats, onAddUrlPat);
  });

  msg.send('getDisplayDefault', null, function(def) {
             var boxes = gdom.query('#windowDisplayDefault');
             if (boxes[0]) {
               boxes[0].checked = def;
             }
           });

  // pre-populate the list of rule sets
  getRuleSets(function(ruleSets) {
    goog.structs.forEach(ruleSets, onAddRuleSet);
  });
};
