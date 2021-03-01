# Mustache
*Introduced in 4.2.0*
> Stability: 2 - Stable
```js
const Mustache = require('kado/lib/Mustache')
```
Mustache provides a logic-less templating system for use in providing any kind
of text rendering.

This code is based largely on the work done at [mustache.js](https://github.com/janl/mustache.js)
and many thanks go to [janl](https://github.com/janl) for his hard work!

## Class: Mustache

This class works in two parts. First, by providing the traditional static
interface to `parse` and `render`. Second, by creating an instance with special
options such as custom tags and using the instance to `parse` and `render`
templates.

### static Mustache.parse(template, tags)
* `template` {string} the actual template to parse
* `tags` {array} optional set of tags eg `['{{', '}}']` which is the equivalent
of the default tags.
* Return {Array} of parsed tokens from the template.

Notes from the author
```
Parses and caches the given template in the default writer and returns the
array of tokens it contains. Doing this ahead of time avoids the need to
parse templates on the fly as they are rendered.
```

### static Mustache.render(template, view, partials, tags)
* `template` {string} the actual template to render
* `view` {object} parameters to replace tokens with in the template
* `partials` {object} with names of partials and values containing the template
for the partial.
* `tags` {array} optional set of tags eg `['{{', '}}']` which is the equivalent
of the default tags.
* Return {string} the rendered template ready to send to the destination.

Notes from the author
```
Renders the `template` with the given `view` and `partials` using the
default writer. If the optional `tags` argument is given here it must be an
array with two string values: the opening and closing tags used in the
template (e.g. [ "<%", "%>" ]). The default is to mustache.tags.
```

### static Mustache.getInstance(options)
* `options` {object} Options to pass to the mustache instance.
* Return {Mustache} new instance of the mustache object with applied options.

Available options:
* `tags` {Array} tags to use when parsing and rendering templates.

### Mustache.parse(template, tags)
* `template` {string} the actual template to parse
* `tags` {Array} optional one time tags to use on parse.
* Return {Array} of parsed tokens from the template.

See the notes from `static Mustache.parse()` above.

### Mustache.render(template, view, partials, tags)
* `template` {string} the actual template to parse
* `view` {object} parameters to replace tokens with in the template
* `partials` {object} with names of partials and values containing the template
for the partial.
* `tags` {Array} optional one time tags to use on parse.
* Return {string} the rendered template ready to send to the destination.

See the notes from `static Mustache.render()` above.

## Mustache Manual

This is a repeat of the known mustache manual for explanation purposes.

### Mustache(5)
<div class='mp' id='man'>
<ol class='man-decor man-head man head'>
<li class='tl'>mustache(5)</li>
<li class='tc'>Mustache Manual</li>
<li class='tr'>mustache(5)</li>
</ol>

<h2 id="NAME">NAME</h2>
<p class="man-name">
<code>mustache</code> - <span class="man-whatis">Logic-less templates.</span>
</p>

<h2 id="SYNOPSIS">SYNOPSIS</h2>
<p>A typical Mustache template:</p>
<pre><code>Hello {{name}}
You have just won {{value}} dollars!
{{#in_ca}}
Well, {{taxed_value}} dollars, after taxes.
{{/in_ca}}
</code></pre>
<p>Given the following hash:</p>
<pre><code>{
"name": "Bryan",
"value": 10000,
"taxed_value": 10000 - (10000 * 0.4),
"in_ca": true
}
</code></pre>
<p>Will produce the following:</p>
<pre><code>Hello Bryan
You have just won 10000 dollars!
Well, 6000.0 dollars, after taxes.
</code></pre>

<h2 id="DESCRIPTION">DESCRIPTION</h2>
<p>Mustache can be used for HTML, config files, source code -
anything. It works by expanding tags in a template using values
provided in a hash or object.</p>
<p>We call it "logic-less" because there are no if statements, else
clauses, or for loops. Instead there are only tags. Some tags are
replaced with a value, some nothing, and others a series of
values. This document explains the different types of Mustache tags.</p>

<h2 id="TAG-TYPES">TAG TYPES</h2>
<p>Tags are indicated by the double mustaches. <code>{{person}}</code> is a tag, as
is <code>{{#person}}</code>. In both examples, we'd refer to <code>person</code> as the key
or tag key. Let's talk about the different types of tags.</p>

<h3 id="Variables">Variables</h3>
<p>The most basic tag type is the variable. A <code>{{name}}</code> tag in a basic
template will try to find the <code>name</code> key in the current context. If
there is no <code>name</code> key, the parent contexts will be checked recursively.
If the top context is reached and the <code>name</code> key is still not found,
nothing will be rendered.</p>
<p>All variables are HTML escaped by default. If you want to return
unescaped HTML, use the triple mustache: <code>{{{name}}}</code>.</p>
<p>You can also use <code>&amp;</code> to unescape a variable: <code>{{&amp; name}}</code>. This may be
useful when changing delimiters (see "Set Delimiter" below).</p>
<p>By default a variable "miss" returns an empty string. This can usually
be configured in your Mustache library. The Ruby version of Mustache
supports raising an exception in this situation, for instance.</p>
<p>Template:</p>
<pre><code>* {{name}}
* {{age}}
* {{company}}
* {{{company}}}
</code></pre>
<p>Object:</p>
<pre><code>{
"name": "Bryan",
"company": "&lt;b&gt;Kado&lt;/b&gt;"
}
</code></pre>
<p>Output:</p>
<pre><code>* Bryan
*
* &amp;lt;b&amp;gt;Kado&amp;lt;/b&amp;gt;
* &lt;b&gt;Kado&lt;/b&gt;
</code></pre>
<h3 id="Sections">Sections</h3>
<p>Sections render blocks of text one or more times, depending on the
value of the key in the current context.</p>
<p>A section begins with a pound and ends with a slash. That is,
<code>{{#person}}</code> begins a "person" section while <code>{{/person}}</code> ends it.</p>
<p>The behavior of the section is determined by the value of the key.</p>
<p><strong>False Values or Empty Lists</strong></p>
<p>If the <code>person</code> key exists and has a value of false or an empty
list, the HTML between the pound and slash will not be displayed.</p>
<p>Template:</p>
<pre><code>Shown.
{{#person}}
Never shown!
{{/person}}
</code></pre>
<p>Object:</p>
<pre><code>{
"person": false
}
</code></pre>
<p>Output:</p>
<pre><code>Shown.
</code></pre>
<p><strong>Non-Empty Lists</strong></p>
<p>If the <code>person</code> key exists and has a non-false value, the HTML between
the pound and slash will be rendered and displayed one or more times.</p>
<p>When the value is a non-empty list, the text in the block will be
displayed once for each item in the list. The context of the block
will be set to the current item for each iteration. In this way we can
loop over collections.</p>
<p>Template:</p>
<pre><code>{{#repo}}
&lt;b&gt;{{name}}&lt;/b&gt;
{{/repo}}
</code></pre>
<p>Object:</p>
<pre><code>{
"repo": [
{ "name": "resque" },
{ "name": "hub" },
{ "name": "rip" }
]
}
</code></pre>
<p>Output:</p>
<pre><code>&lt;b&gt;resque&lt;/b&gt;
&lt;b&gt;hub&lt;/b&gt;
&lt;b&gt;rip&lt;/b&gt;
</code></pre>
<p><strong>Lambdas</strong></p>
<p>When the value is a callable object, such as a function or lambda, the
object will be invoked and passed the block of text. The text passed
is the literal block, unrendered. <code>{{tags}}</code> will not have been expanded
- the lambda should do that on its own. In this way you can implement
filters or caching.</p>
<p>Template:</p>
<pre><code>{{#wrapped}}
{{name}} is awesome.
{{/wrapped}}
</code></pre>
<p>Hash:</p>
<pre><code>{
"name": "Willy",
"wrapped": function() {
return function(text, render) {
  return "&lt;b&gt;" + render(text) + "&lt;/b&gt;"
}
}
}
</code></pre>
<p>Output:</p>
<pre><code>&lt;b&gt;Willy is awesome.&lt;/b&gt;
</code></pre>
<p><strong>Non-False Values</strong></p>
<p>When the value is non-false but not a list, it will be used as the
context for a single rendering of the block.</p>
<p>Template:</p>
<pre><code>{{#person?}}
Hi {{name}}!
{{/person?}}
</code></pre>
<p>Hash:</p>
<pre><code>{
"person?": { "name": "Jon" }
}
</code></pre>
<p>Output:</p>
<pre><code>Hi Jon!
</code></pre>

<h3 id="Inverted-Sections">Inverted Sections</h3>
<p>An inverted section begins with a caret (hat) and ends with a
slash. That is <code>{{^person}}</code> begins a "person" inverted section while
<code>{{/person}}</code> ends it.</p>
<p>While sections can be used to render text one or more times based on the
value of the key, inverted sections may render text once based
on the inverse value of the key. That is, they will be rendered
if the key doesn't exist, is false, or is an empty list.</p>
<p>Template:</p>
<pre><code>{{#repo}}
&lt;b&gt;{{name}}&lt;/b&gt;
{{/repo}}
{{^repo}}
No repos :(
{{/repo}}
</code></pre>
<p>Object:</p>
<pre><code>{
"repo": []
}
</code></pre>
<p>Output:</p>
<pre><code>No repos :(
</code></pre>

<h3 id="Comments">Comments</h3>
<p>Comments begin with a bang and are ignored. The following template:</p>
<pre><code>&lt;h1&gt;Today{{! ignore me }}.&lt;/h1&gt;
</code></pre>
<p>Will render as follows:</p>
<pre><code>&lt;h1&gt;Today.&lt;/h1&gt;
</code></pre>
<p>Comments may contain newlines.</p>

<h3 id="Partials">Partials</h3>
<p>Partials begin with a greater than sign, like <code>{{&gt; box}}</code>.</p>
<p>Partials are rendered at runtime (as opposed to compile time), so
recursive partials are possible. Just avoid infinite loops.</p>
<p>They also inherit the calling context. Whereas in an [ERB](http://en.wikipedia.org/wiki/ERuby) file you may have
this:</p>
<pre><code>&lt;%= partial :next_more, :start =&gt; start, :size =&gt; size %&gt;
</code></pre>
<p>Mustache requires only this:</p>
<pre><code>{{&gt; next_more}}
</code></pre>
<p>Why? Because the <code>next_more.mustache</code> file will inherit the <code>size</code> and
<code>start</code> methods from the calling context.</p>
<p>In this way you may want to think of partials as includes, imports, template
expansion, nested templates, or subtemplates, even though those aren't literally the case here.</p>
<p>For example, this template and partial:</p>
<pre><code>base.mustache:
&lt;h2&gt;Names&lt;/h2&gt;
{{#names}}
{{&gt; user}}
{{/names}}
user.mustache:
&lt;strong&gt;{{name}}&lt;/strong&gt;
</code></pre>
<p>Can be thought of as a single, expanded template:</p>
<pre><code>&lt;h2&gt;Names&lt;/h2&gt;
{{#names}}
&lt;strong&gt;{{name}}&lt;/strong&gt;
{{/names}}
</code></pre>

<h3 id="Set-Delimiter">Set Delimiter</h3>
<p>Set Delimiter tags start with an equal sign and change the tag
delimiters from <code>{{</code> and <code>}}</code> to custom strings.</p>
<p>Consider the following contrived example:</p>
<pre><code>* {{default_tags}}
{{=&lt;% %>=}}
* &lt;% erb_style_tags %>
&lt;%={{ }}=%>
* {{ default_tags_again }}
</code></pre>
<p>Here we have a list with three items. The first item uses the default
tag style, the second uses erb style as defined by the Set Delimiter
tag, and the third returns to the default style after yet another Set
Delimiter declaration.</p>
<p>According to
<a href="https://docs.huihoo.com/google-ctemplate/howto.html">ctemplates</a>,
this "is useful for languages like TeX, where double-braces may occur in the
text and are awkward to use for markup."</p>
<p>Custom delimiters may not contain whitespace or the equals sign.</p>
<h2 id="COPYRIGHT">COPYRIGHT</h2>
<p>Mustache is Copyright</p>
<p>(C) 2009 Chris Wanstrath</p>
<p>(C) 2010-2020 Jan Lehnardt (JavaScript)</p>
<p>(C) 2010-2020 The mustache.js community</p>
<p>(C) 2020-2021 Bryan Tong, Kado (JavaScript ES6 Upgrades)</p>
<p>Original CTemplate by Google</p>
</div>
