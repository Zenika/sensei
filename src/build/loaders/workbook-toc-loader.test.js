const assert = require("assert");
const workbookTocLoader = require("./workbook-toc-loader");

{
  const actual = workbookTocLoader("<!-- toc -->");
  const expected = /^<ul class="toc">/;
  assert.match(
    actual,
    expected,
    "workbook TOC loader does not include table of content at the marker"
  );
}

{
  const actual = workbookTocLoader("<!-- toc --> space <!-- toc -->");
  const expected = /^<ul class="toc">.* space <ul class="toc">/;
  assert.match(
    actual,
    expected,
    "workbook TOC loader does not include table of content at every marker"
  );
}

{
  const actual = workbookTocLoader(
    '<!-- toc --><h2 id="just-a-title">just a title</h2>'
  );
  const expected = /<li><a href="#just-a-title">just a title<\/a><\/li>/;
  assert.match(
    actual,
    expected,
    "workbook TOC loader does not include title in table of content"
  );
}
