# The FiveUI Prelude

The FiveUI Prelude provides a basic set of utilities to assist with
writing rules and rule sets for the FiveUI browser extension.

The following format is used to describe Rules and RuleSets for the
FiveUI tool.

FiveUI uses a JSON-like representation for RuleSets and Rules, as follows:


## Rule Set Syntax

Rule Sets take the form of:

```javascript
{
  /**
   * A short descriptive name for the Rule Set.
   *
   * @type {!string}
   */
  'name': 'Short Rule Set Name',

  /**
   * A detailed description of the Rule Set, potentially
   * including links back to the original source.
   *
   * @type {!string}
   */
  'description': 'Rule Set description '
               + 'Multiple lines can be used to describe the Rule Set',

  /**
   * A free-form string field for licensing information.
   */
  'license': 'Apache 2.0',

  /**
   * A list of dependencies, resolved relative to the rule set json file.
   */
  'dependencies': []'

  /**
   * A list of rules to load and evaluate on pages
   * that are matched to this RuleSet.
   *
   * @type Array.<Rule>
   */
  'rules': []
};
```

## Rule Manifest Syntax

Individual Rules are specified with the following manifest:

```javascript
{
  /**
   * A short descriptive name for the Rule.
   *
   * @type {!string}
   */
  'name': 'Short Rule name',

  /**
   * A detailed description of the RuleSet, potentially
   * including links back to the original source.
   *
   * @type {!string}
   */
  'description': 'Description of the underlying guideline that '
               + 'this rule enforces.',

  /**
   * A Javascript function that represents a guideline.
   *
   * The rule function should invoke `report(descr, node)` when the
   * guideline is violated.
   *
   * The rule function has access to the FiveUI prelude and jQuery.
   */
  'rule': []
};
```

## Rule Syntax

Rules are encoded as javascript files that specify an unbound exports
object.  This object is expected to have three fields:

name: A short, unique, but readable name for the rule.

description: A textual description.

rule: a function that takes one object as a parameter.

In the context of the function provided as the **rule** field, the
**this** object will point to an anonymous object that contains the
other fields of the rule, **name** and **description**.  In addition
to the fields of the rule, there is a field named **ruleSet**, which
is a reference to the enclosing `Rule Set`.

The function parameter is an object with one method: 'error' which
takes an error message and a DOM element as its two parameters.  The
DOM element is used by FiveUI to describe the location of the error,
so it should be chosen to best represent the location on the page
where the error occurred.  If the DOM element is unspecified, the rule
will run, but less debugging information will be provided to the user.

```javascript
exports.name = "imagesAltText";

exports.description = "Each image should have alt text.";

exports.rule = function(report) {
  fiveui.query('img')
     .filter(function (i) {
               var altAttr = $(this).attr('alt');
               return altAttr == undefined || altAttr  == '';
             })
     .each(function (i, e) {
             report.error('Image has no alt text', e);
           });
};
```

Find more examples in the [GitHub repository](https://github.com/GaloisInc/FiveUI/tree/master/exampleData).