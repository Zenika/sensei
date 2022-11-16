const assert = require("node:assert");
const test = require("node:test");
const { compileWorkbookJson } = require("./workbook-json-loader");

test("workbook.json loader can compile a workbook with one part", async () => {
  const actual = await compileWorkbookJson('["part1"]', {
    importWorkbookPart: () => "content",
  });
  const expected = "content";
  assert.equal(actual, expected);
});

test("workbook.json loader can compile a workbook with two parts", async () => {
  const actual = await compileWorkbookJson('["part1", "part2"]', {
    importWorkbookPart: (filename) => filename,
  });
  const expected = "part1\npart2";
  assert.equal(actual, expected);
});
