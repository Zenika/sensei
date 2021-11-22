const querystring = require("querystring");
const { marked } = require("marked");
const Prism = require("prismjs");
require("prismjs/components/")();

module.exports = function (content) {
  const loaderOptions = querystring.parse(this.resourceQuery.substring(1));
  return slidify(content, {
    verticalSeparator: "^\r?\n\r?\n\r?\n",
    notesSeparator: "^Notes :",
    chapterIndex: parseInt(loaderOptions.chapterIndex),
  });
};

/*
 * MUST CODE BELOW IS TAKEN FROM REVEAL.JS' MARKDOWN PLUGIN
 * See https://github.com/hakimel/reveal.js/blob/3.8.0/plugin/markdown/markdown.js
 *
 * --- LICENCE ---
 * Copyright (C) 2019 Hakim El Hattab, http://hakim.se, and reveal.js contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * --- END OF LICENCE ---
 *
 * It does contain some modification.
 */

var DEFAULT_SLIDE_SEPARATOR = "^\r?\n---\r?\n$",
  DEFAULT_NOTES_SEPARATOR = "notes?:",
  DEFAULT_ELEMENT_ATTRIBUTES_SEPARATOR = "\\.element\\s*?(.+?)$",
  DEFAULT_SLIDE_ATTRIBUTES_SEPARATOR = "\\.slide:\\s*?(\\S.+?)$";

var SCRIPT_END_PLACEHOLDER = "__SCRIPT_END__";

function slidify(markdown, options) {
  options = getSlidifyOptions(options);

  var separatorRegex = new RegExp(
      options.separator +
        (options.verticalSeparator ? "|" + options.verticalSeparator : ""),
      "mg"
    ),
    horizontalSeparatorRegex = new RegExp(options.separator);

  var matches,
    lastIndex = 0,
    isHorizontal,
    wasHorizontal = true,
    content,
    sectionStack = [];

  // iterate until all blocks between separators are stacked up
  while ((matches = separatorRegex.exec(markdown))) {
    notes = null;

    // determine direction (horizontal by default)
    isHorizontal = horizontalSeparatorRegex.test(matches[0]);

    if (!isHorizontal && wasHorizontal) {
      // create vertical stack
      sectionStack.push([]);
    }

    // pluck slide content from markdown input
    content = markdown.substring(lastIndex, matches.index);

    if (isHorizontal && wasHorizontal) {
      // add to horizontal stack
      sectionStack.push(content);
    } else {
      // add to vertical stack
      sectionStack[sectionStack.length - 1].push(content);
    }

    lastIndex = separatorRegex.lastIndex;
    wasHorizontal = isHorizontal;
  }

  // add the remaining slide
  (wasHorizontal ? sectionStack : sectionStack[sectionStack.length - 1]).push(
    markdown.substring(lastIndex)
  );

  var markdownSections = "";

  // flatten the hierarchical stack, and insert <section data-markdown> tags
  for (var i = 0, len = sectionStack.length; i < len; i++) {
    // vertical
    if (sectionStack[i] instanceof Array) {
      markdownSections += "<section " + options.attributes + ">";

      sectionStack[i].forEach(function (child, slideIndex) {
        const classes = getEmbeddedClasses(child);
        markdownSections += `
          <section ${classes}>
            ${createMarkdownSlide(child, options)}
            ${footer(options.chapterIndex, slideIndex)}
          </section>
        `;
      });

      markdownSections += "</section>";
    } else {
      const classes = getEmbeddedClasses(sectionStack[i]);
      markdownSections += `
        <section ${options.attributes} ${classes}>
          ${createMarkdownSlide(sectionStack[i], options)}
          ${footer(options.chapterIndex)}
        </section>
      `;
    }
  }

  // Support for the <!-- .element: --> syntax from Reveal (see https://revealjs.com/markdown/#element-attributes)
  markdownSections = markdownSections.replace(
    /(<!--\s*\.element:?(["\w \t=:;%-]+)-->\s*)<([^>]+)>/g,
    "$1<$3 $2>"
  );

  return markdownSections;
}

function footer(chapterIndex, slideIndex) {
  return `
    <footer class="copyright">&copy; Copyright ${new Date().getFullYear()} Zenika. All rights reserved</footer>
    <footer class="slide-number">${slideNumber(
      chapterIndex,
      slideIndex
    )}</footer>
    <footer class="version"/>
  `;
}

function slideNumber(chapterIndex, slideIndex) {
  if (chapterIndex === 0) return "";
  if (slideIndex === undefined) return "";
  if (slideIndex === 0) return chapterIndex;
  return `${chapterIndex} - ${slideIndex}`;
}

function getEmbeddedClasses(
  markdown,
  separator = DEFAULT_SLIDE_ATTRIBUTES_SEPARATOR
) {
  const result = {};
  var mardownClassesInElementsRegex = new RegExp(separator, "mg");
  var mardownClassRegex = new RegExp('([^"= ]+?)="([^"=]+?)"', "mg");
  var nodeValue = markdown;
  if ((matches = mardownClassesInElementsRegex.exec(nodeValue))) {
    var classes = matches[1];
    nodeValue =
      nodeValue.substring(0, matches.index) +
      nodeValue.substring(mardownClassesInElementsRegex.lastIndex);
    while ((matchesClass = mardownClassRegex.exec(classes))) {
      result[matchesClass[1]] = matchesClass[2];
    }
  }
  const resultStr = Object.entries(result)
    .map(([a, b]) => `${a}="${b}"`)
    .join(" ");
  return resultStr;
}

function createMarkdownSlide(content, options) {
  options = getSlidifyOptions(options);

  var notesMatch = content.split(new RegExp(options.notesSeparator, "mgi"));

  if (notesMatch.length === 2) {
    content =
      notesMatch[0] +
      '<aside class="notes">' +
      marked.parse(notesMatch[1].trim()) +
      "</aside>";
  }

  // prevent script end tags in the content from interfering
  // with parsing
  content = content.replace(/<\/script>/g, SCRIPT_END_PLACEHOLDER);

  marked.use({
    renderer: {
      html(_html) {
        return _html.replace(/^(\s*<[^>]+>)(.*)(<\/[^>]+>\s*)$/ims, function (
          match,
          opening,
          inner,
          closing
        ) {
          return opening + marked.parseInline(inner) + closing;
        });
      },
    },
    highlight(code, lang) {
      const prismLang = Prism.languages[lang] || Prism.languages.clike;
      return Prism.highlight(code, prismLang);
    },
  });
  return marked(content); //'<script type="text/template">' + marked(content) + "</script>";
}

function getSlidifyOptions(options) {
  options = options || {};
  options.separator = options.separator || DEFAULT_SLIDE_SEPARATOR;
  options.notesSeparator = options.notesSeparator || DEFAULT_NOTES_SEPARATOR;
  options.attributes = options.attributes || "";

  return options;
}
