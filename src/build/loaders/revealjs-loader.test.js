const assert = require("node:assert");
const test = require("node:test");
const { handleDotElementRevealSyntax } = require("./revealjs-loader");

test("dot element reveal syntax handler supports original tag without attributes", () => {
  const actual = handleDotElementRevealSyntax(`
    <!-- .element: attr="value" -->
    <tag>
  `);
  const expected = /<tag\s+attr="value"\s*>/;
  assert.match(actual, expected);
});

test("dot element reveal syntax handler supports original tag with attributes", () => {
  const actual = handleDotElementRevealSyntax(`
    <!-- .element: attr1="value" -->
    <tag attr2="value" attr3="value">
  `);
  const expected = /<tag\s+attr1="value"\s+attr2="value"\s+attr3="value"\s*>/;
  assert.match(actual, expected);
});

test("dot element reveal syntax handler supports original self-closing tag without attributes", () => {
  const actual = handleDotElementRevealSyntax(`
    <!-- .element: attr="value" -->
    <tag/>
  `);
  const expected = /<tag\s+attr="value"\s*\/>/;
  assert.match(actual, expected);
});

test("dot element reveal syntax handler supports original self-closing tag with attributes", () => {
  const actual = handleDotElementRevealSyntax(`
    <!-- .element: attr1="value" -->
    <tag attr2="value"/>
  `);
  const expected = /<tag\s+attr1="value"\s+attr2="value"\s*\/>/;
  assert.match(actual, expected);
});

test("dot element reveal syntax handler supports original tag with an attribute value containing '/'", () => {
  const actual = handleDotElementRevealSyntax(`
    <!-- .element: attr1="value" -->
    <tag attr2="/">
  `);
  const expected = /<tag\s+attr1="value"\s+attr2="\/"\s*>/;
  assert.match(actual, expected);
});

test("dot element reveal syntax handler supports original tag with an attribute value containing '>'", () => {
  const actual = handleDotElementRevealSyntax(`
    <!-- .element: attr1="value" -->
    <tag attr2=">">
  `);
  const expected = /<tag\s+attr1="value"\s+attr2=">"\s*>/;
  assert.match(actual, expected);
});
