% Wikipedia and FiveUI

# Checking Wikipedia style guidelines using FiveUI

Wikipedia maintains a [Manual of Style][] that contains prescribed
details for content and formatting in Wikipedia articles.  The manual
provides consistency, which makes articles accessible and easily
comprehensible.  The guidelines are extensive, providing a high degree
of consistency.  The downside is that it is difficult for casual
contributers read and internalize all of the rules.

[Manual of Style]: https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style

[FiveUI][] is an extensible tool for evaluating HTML user interfaces
against sets of codified UI Guidelines.  The Wikipedia style guidelines
can be codified and checked automatically.  Upon making edits to an
article, a contributer using FiveUI sees a list of any items that should
be changed before publishing.

[FiveUI]: http://galoisinc.github.io/FiveUI/

FiveUI also simplifies auditing articles in bulk.  It supports
a [headless mode][headless] that uses [Selenium][] to test large numbers
of pages and produces a report of issues with each page.

[headless]: http://galoisinc.github.io/FiveUI/manual/headlessFiveUI.html
[Selenium]: http://docs.seleniumhq.org/

We have codified a portion of the Manual of Style which can be used
right now.  This serves as a starting point to demonstrate the
usefulness of FiveUI.  The codified guidelines are included in
the FiveUI source distribution under
[guidelines/wikipedia/][guidelines].

[guidelines]: https://github.com/GaloisInc/FiveUI/blob/master/guidelines/wikipedia/

## Getting started

FiveUI is implemented as a browser extension for Firefox and Chrome and
as a headless script.  To install the browser extension see the [Install
Guide][installGuide].  To get to the options page for the extension see
[Getting Started][gettingStarted].  In the extension options page:

[installGuide]: install.html
[gettingStarted]: gettingStarted.html

1. Click 'add a rule set'.
2. In the first text box enter the URL to the Wikipedia guidelines
   manifest:  
   `https://raw2.github.com/GaloisInc/FiveUI/master/guidelines/wikipedia/package.json`
   And click on the little 'save' icon.
3. In the second text box enter a pattern for URLs that should be
   checked against the guidelines:  
   `http*://*.wikipedia.org/wiki/*`

Now navigate to some Wikipedia articles.  The FiveUI icon should change
from gray to red.  If any style issues are found then a problem count
will appear superimposed over the icon.

## The guidelines that are checked

The guidelines that we have codified so far focus mainly on
accessibility and formatting.

Guidelines that deal with prose (word choice, tone, voice, punctuation,
etc.) are more difficult to verify with an automated process.  In some
cases we can use heuristics to identify cases where there might be
a problem, and produce warnings to encourage the user to take a closer
look.

Wikimedia content exists in two forms: markup and rendered HTML.  FiveUI
checks HTML, not markup.  To be more precise, FiveUI checks fully
rendered web pages.  That provides certainty that details such as
colors, paragraph width, and image placement are checked in the context
of what readers will see.  But it does mean that some translation is
required in cases where the Manual of Style makes statements about
conventions that should be used in markup.

The rules that we have implemented so far are listed below.  Rules are
specified with Javascript; the headings indicate the source file that
defines each rule.

### headingOrder.js

Checks that, e.g., there is an h2 before each h3.[^headings]  Also reports an
error if any h1 tags are found in article content.[^heading-style]

[^headings]: <https://en.wikipedia.org/wiki/Wikipedia:ACCESSIBILITY#Headings>
[^heading-style]: <https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style#Section_headings>

### bullets.js

Produces warnings to remind users to minimize use of bullet
points.[^paragraphs]  The output from this rule is a bit
noisy at the moment.

[^paragraphs]: <https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Layout#Paragraphs>

### strikeout.js

Produces error reports if an article contains struck-out
text.[^strikeout]  That includes \<del\> and \<strike\> tags, and
\<span\> tags with a `text-decoration: line-through` style.

[^strikeout]: <https://en.wikipedia.org/wiki/Wikipedia:ACCESSIBILITY#Text>

### color.js

Produces an error if the contrast ratio between text and background
color falls below the WCAG 2.0 AA level:[^contrast]

- less than 4.5:1 for most text
- less than 3:1 for normal text with a point size of at least 18
- less than 3:1 for bold text with a point size of at least 14.

Produces a warning if contrast falls below the AAA level:

- less than 7:1 for most text
- less than 4.5:1 for normal text with a point size of at least 18
- less than 4.5:1 for bold text with a point size of at least 14.

In order to keep reports focused on article content rather than site
design, there are some exceptions built into this rule to skip over
styles that are produced by predefined Wikipedia templates.  At the
moment the rule ignores links with "new", "external", or "extiw" class
and ignores links in navbox group cells (\<th\> elements with the
"navbox-group" class).

[^contrast]: <https://en.wikipedia.org/wiki/Wikipedia:ACCESSIBILITY#Color>

### spaceBetweenParagraphs.js

Produces error reports when extra space is found between paragraphs.
This corresponds to markup with more than one blank line between
paragraphs.  In the rendered HTML the result is one or more paragraphs
that contain \<br\> tags but no text.[^paragraphs]

### paragraphLength.js

Produces a warning for any paragraphs that contain only a single
sentence.[^paragraphs]

### imageSize.js

Produces warnings for images that are wider than 400px and that are
left- or right-aligned.  Also produces warnings for any images that are
more than 500px tall.[^layout-images]

[^layout-images]: <https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Layout#Images>

### horizontalRule.js

Produces warnings indicating that horizontal rules are
deprecated.[^horizontal-rule]

[^horizontal-rule]: <https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Layout#Horizontal_rule>

### pseudoHeadings.js

Detects uses of bold text or of a description list with a single \<dt\>
and no \<dd\> to emulate a heading.  Produces error
reports.[^headings]

### pseudoIndent.js

Detects uses of a description list with a single \<dd\> and no \<dt\> to
indent content.[^pseudo-indent]

It seems that indenting content in this way may now be an accepted
practice.  So this rule may be a candidate for removal.

[^pseudo-indent]: <https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Accessibility#Indentation>

### floatSandwiches.js

Produces warnings in cases where two images occupy overlapping vertical
space, where one image is left-aligned and the other is
right-aligned.[^resolution]

[^resolution]: <https://en.wikipedia.org/wiki/Wikipedia:ACCESSIBILITY#Resolution>

### spaceBetweenListItems.js

Checks for list items that have been (probably mistakenly) separated by
blank lines in wiki markup.  This results in adjacent lists that each
contain only a single item.[^bulleted-vertical-lists]

[^bulleted-vertical-lists]: <https://en.wikipedia.org/wiki/Wikipedia:ACCESSIBILITY#Bulleted_vertical_lists>

### imageAlt.js

Reports warnings upon encountering images without an "alt"
attribute.[^accessibility-images]

[^accessibility-images]: <https://en.wikipedia.org/wiki/Wikipedia:ACCESSIBILITY#Images>

### imageCaption.js

Checks images wider or taller than 50px for a caption.  Reports
a warning if none is found.[^accessibility-images]

### inlineStyle.js

Reports errors when encountering inline styles.[^styles-and-markup]

A number of the standard templates that Wikipedia provides include
inline styles - so this rule produces some false positives.  One of our
work items is to expand and refine the list of exceptions included with
this rule.

[^styles-and-markup]: <https://en.wikipedia.org/wiki/Wikipedia:ACCESSIBILITY#Styles_and_markup_options>
