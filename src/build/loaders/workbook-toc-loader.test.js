const assert = require("node:assert");
const test = require("node:test");
const workbookTocLoader = require("./workbook-toc-loader");

test("workbook TOC loader includes table of content at the marker", () => {
  const actual = workbookTocLoader("<!-- toc -->");
  const expected = /^<ul class="toc">/;
  assert.match(actual, expected);
});

test("workbook TOC loader includes table of content at every marker", () => {
  const actual = workbookTocLoader("<!-- toc --> space <!-- toc -->");
  const expected = /^<ul class="toc">.* space <ul class="toc">/;
  assert.match(actual, expected);
});

test("workbook TOC loader includes title in table of content", () => {
  const actual = workbookTocLoader(
    '<!-- toc --><h2 id="just-a-title">just a title</h2>'
  );
  const expected = /<li><a href="#just-a-title">just a title<\/a><\/li>/;
  assert.match(actual, expected);
});
