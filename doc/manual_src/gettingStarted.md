% Getting Started with FiveUI

# Configuring FiveUI

Once FiveUI has been installed, some initial configuration will need to be done
to make the extension useful.

The options page allows the user to configure `URL Patterns` that will apply
when the browser is navigating to new URLs, and `Rule Sets` which categorize
user interface guidelines into named groups.

## Options in Chrome

The options page in `Chrome` can be accessed either through the
options link on the extensions page, or through the options item on
the context menu off of the FiveUI button (accessed by right-clicking
on the FiveUI button).

## Options in FireFox

The options page in `FireFox` can be accessed via the FiveUI gear widget, which
should be added in addition to the FiveUI widget when the addon is installed.
Once clicked, a new tab should appear which serves as the options interface for
the addon.

The FiveUI Widgets are initially placed on the Firefox `Add-on bar`,
as shown in the figure.

![FiveUI Widgets in the Firefox Add-on Bar.](figures/ff-addon-bar.png)

# The Options Page

The options page allows the user to configure `URL Patterns` that will apply
when the browser is navigating to new URLs, and `Rule Sets` which categorize
user interface guidelines into named groups.  As it's required that one or more
`Rule Sets` already exist to create a `URL Pattern`, let's start with the `Rule
Sets` tab.

## Rule Sets

`Rule Sets` can be managed by clicking on the `Rule Sets` tab on the left-hand
side of the options page.

`Rule Sets` in FiveUi are specified as a JSON-like object that
contains javascript functions for the rule implementations.  Each
`Rule Set` contains a **name**, **description** and list of zero or
more **rules**.  The following snippet exhibits the minimal definition
for a `Rule Set`, providing only the **name** and **description**
fields, along with an empty set of **rules**.

```javascript
{ "name": "Empty Rules"
, "description": "An example of an empty rule set"
, "rules": []
}
```

### Rules

The elements of the **rules** array in the `Rule Set` are just file paths,
relative to the path of the manifest file.  The contents of the file referenced
are javascript, using an exports object to expose the public parts of the rule
API.

The required exports of a **rule** file are:

 1. A rule name, called `name`
 2. A description, called 'description`
 3. A function that will be called as the body of the rule, named `rule`

As a simple example, the following rule will log an error for each header tag
that contains no text:

```javascript
exports.name        = 'Disallow Empty Headers';
exports.description = 'Heading elements should contain text';
exports.rule        = function(report) {
  fiveui.query(':header').each(function(ix, elt) {
    if($(elt).text() == '') {
      report.error('Heading does not contain text', elt);
    }
  });
};
```

Notice that the `rule` function is given a report argument that has an error
method exposed, this is how errors are reported back to the extension from the
context of a rule.

### Creating a `Rule Set`

Reusing the previous example and the skeleton of the first, we can create a
simple manifest that applies the empty header rule.  Enter the following json
structure into a file called manifest.json:

```javascript
{ "name"        : "Header Rule Set"
, "description" : "Simple rules about HTML headers."
, "rules"       : [ "emptyHeaders.js" ]
}
```

As the above manifest references the emptyHeader.js file, we now need to
implement that rule.  We'll go ahead and use the same example rule that's
defined above, placing it in the emptyHeader.js file in the same directory as
the manifest that references it.

 * Run `python -m SimpleHTTPServer` in the directory that contains manifest.json
   and exampleHeader.js
 * Next, open the options page for the FiveUI extension.
 * Make sure that the `Rule Sets` tab is selected
 * Click the `Add` button.
 * Paste http://localhost:8000/manifest.json into the address field
 * Click the save icon (a disk)

You should now see an entry in the `Rule Sets` list that includes a `add url
pattern` button.

## URL Patterns

`URL Patterns` can be added by the use of the `add url patterns` button on a
rule set, and removed by clicking their `x` icon.

`URL Patterns` represent the conditions in which a `Rule Set` will be applied to
a page.  To create a `URL Pattern` first make sure that you have created a `Rule
Set` with the instructions above.  Now you can enter a pattern in the text field
above the `add url pattern` button, using the pattern language defined below.

### Pattern Language

The **pattern** text in a `URL Pattern` uses the glob character
*, to allow for a `URL Pattern` to apply to many URLs.  For example, if you
would like to design a pattern that applies to all of the `http` pages under the
www.example.com domain, then you could use a pattern such as:

```
http://www.example.com*
```

Note that `URL Patterns` match the protocol, domain, port and path
portions of the url, so the pattern above will not apply to `https`
urls.  The following pattern will apply to *any* site hosted at example.com:

```
*example.com*
```

# Using FiveUI

Once some `Rule Sets` and `URL Patterns` exist in the FiveUI configuration, the
rules can be applied to a web page.  Start off by navigating to a page that
satisfies one of the `URL Patterns` defined in the FiveUI options page.  If that
URL is matched by one of the patterns, the FiveUI icon will change from gray to
red, and an overlay will display the number of rule violations present on the
page.

The primary user interface is hidden by default, to avoid obscuring
the web page inadvertently.  To show the list of problems, simply
click on the FiveUI icon to make the window visible.  The user
interface is injected into the running page, and it should display on
top of any other user interface elements present.

As the user navigates around sites that are matched by `URL Patterns`,
the problem list will have newly occurring problems appended to it.
All state in the dialog is maintained by the extension on a per-tab
basis, so different browser tabs can have distinct lists of problems.

## Problems

Problem entries will be added to the FiveUI dialog as rules report
problems on the page.  Once a problem is reported, the user can click
on the arrow to the left of the message to both expand the description
of the problem, and to highlight the node of the DOM that is causing
the problem.  One caveat to this is that if the node that generated
the problem exists on a page that has since been navigated away from,
the node will obviously not be highlighted.

We illustrate this by first adding a new rule to our example Rule Set.
This rule identifies headers that start with a lower-case letter.

```javascript
{ "name": "Header Rule Set"
, "description": "Simple rules about HTML headers."
, "rules":
  [ { "name": "Disallow Empty Headers"
    , "description": "Heading elements should contain text."
    , "rule": function() {
        fiveui.query(':header').each(function(ix, elt) {
          if($(elt).text() == '') {
            report('Heading does not contain text', elt);
          }
        });
      }
    },
    { "name": "Headers should be capitalized"
    , "description": "Heading elements should not start "
                   + "with lowercase letters."
    , "rule": function() {
        fiveui.query(':header').each(function(ix, elt) {
          if( !fiveui.word.capitalized($(elt).text()) ) {
            report('Heading is not capitalized', elt);
          }
        });
      }
    },
  ]
}
```

This sample `Rule Set` demonstrates some new capabilities:
 * Multiple rules in one Rule Set.
 * Multi-line descriptions.
 * The `fiveui.word.capitalized(...)` predicate, from the `FiveUI prelude`.
The `FiveUI Prelude` is a small collection of utilities for creating rules.

Once adding this `Rule Set` specifying a `URL Pattern`, we can view
violations in the FiveUI Problem List.  Clicking on the `expand arrow`
for a specific problem will highlight the element of the DOM that
caused the violation.

![Expanding a Problem entry in the FiveUI Problem List highlights the element of the DOM that caused the violation.](figures/ff-heading-highlight.png)

## Where to go from here

For more detail on the API available when writing new rules, see the
[Javascript documentation](../jsdoc/index.html).

`Headless` is a tool for automated rule set checking using FiveUI.
To get started with Headless, see [Headless
documentation](headlessFiveUI.html).
