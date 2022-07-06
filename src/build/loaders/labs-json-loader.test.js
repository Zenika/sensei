const assert = require("assert");
const { compileLabsJson } = require("./labs-json-loader");

(async () => {
  const actual = await compileLabsJson('["part1"]', {
    importWorkbookPart: () => "content",
  });
  const expected = "export const content = `content`";
  assert.equal(
    actual,
    expected,
    "labs.json loader cannot compile a workbook with one part"
  );
})();

(async () => {
  const actual = await compileLabsJson('["part1", "part2"]', {
    importWorkbookPart: (filename) => filename,
  });
  const expected = "export const content = `part1\npart2`";
  assert.equal(
    actual,
    expected,
    "labs.json loader cannot compile a workbook with two parts"
  );
})();

(async () => {
  const actual = await compileLabsJson('["part1"]', {
    importWorkbookPart: () => "<!-- toc -->",
  });
  const expected = /^export const content = `<h2 class="toc">/;
  assert.match(
    actual,
    expected,
    "labs.json loader does not include table of content at the marker"
  );
})();

(async () => {
  const actual = await compileLabsJson('["part1"]', {
    importWorkbookPart: () => '<!-- toc --><h2 id="just-a-title">just a title</h2>',
  });
  const expected = /<li><a href="#just-a-title">just a title<\/a><\/li>/;
  assert.match(
    actual,
    expected,
    "labs.json loader does not include title in table of content"
  );
})();
