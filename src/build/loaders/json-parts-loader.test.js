const test = require("node:test");
const assert = require("node:assert");
const { compileJsonParts, PART_SEPARATOR } = require("./json-parts-loader");

test("Parts JSON loader can compile a JSON with one part", async () => {
  const actual = await compileJsonParts('["part1"]', {
    importPart: () => "content",
  });
  const expected = "content";
  assert.equal(actual, expected);
});

test("Parts JSON loader can compile a JSON with two parts", async () => {
  const actual = await compileJsonParts('["part1", "part2"]', {
    importPart: (filename) => filename,
  });
  const expected = `part1${PART_SEPARATOR}part2`;
  assert.equal(actual, expected);
});
