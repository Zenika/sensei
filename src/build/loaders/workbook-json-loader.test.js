const assert = require("assert");
const { compileWorkbookJson } = require("./workbook-json-loader");

(async () => {
  const actual = await compileWorkbookJson('["part1"]', {
    importWorkbookPart: () => "content",
  });
  const expected = "content";
  assert.equal(
    actual,
    expected,
    "workbook.json loader cannot compile a workbook with one part"
  );
})();

(async () => {
  const actual = await compileWorkbookJson('["part1", "part2"]', {
    importWorkbookPart: (filename) => filename,
  });
  const expected = "part1\npart2";
  assert.equal(
    actual,
    expected,
    "workbook.json loader cannot compile a workbook with two parts"
  );
})();
