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
   * A list of rules to load and evaluate on pages
   * that are matched to this RuleSet.
   *
   * @type Array.<Rule>
   */
  'rules': []
};
```

## Rule Syntax

Individual Rules are created with the following format:</p>

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
  'rule': function() {
      fiveui.query('selector').each(function(idx, elt) {
         if(condition(elt)) {
            report('Guideline was violated', elt);
         }
      });
   }
};
```

In the context of the function passed as the **rule** field, the **this** object
will point to an anonymous object that contains the other fields of the rule
,**name** and **description**.  In addition to the fields of the rule, there is
a field named **ruleSet**, which is a reference to the enclosing `Rule Set`.
