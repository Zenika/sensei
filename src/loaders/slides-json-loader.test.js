const assert = require("assert");
const slidesJsonLoader = require("./slides-json-loader");

assert.deepStrictEqual(
  slidesJsonLoader(JSON.stringify([])).trim(),
  [
    `export const chapters = [];`,
    `export const title = chapters[0]?.title || "";`,
    `export const content = "";`,
  ].join("\n")
);

assert.deepStrictEqual(
  slidesJsonLoader(JSON.stringify(["1.md"])),
  [
    `import content0 from "./1.md?chapterIndex=0";`,
    `import title0 from "./1.md?titleOnly";`,
    `export const chapters = [{ index: 0, title: title0, content: content0 }];`,
    `export const title = chapters[0]?.title || "";`,
    `export const content = content0;`,
  ].join("\n")
);

assert.deepStrictEqual(
  slidesJsonLoader(JSON.stringify(["1.md", "2.md"])),
  [
    `import content0 from "./1.md?chapterIndex=0";`,
    `import title0 from "./1.md?titleOnly";`,
    `import content1 from "./2.md?chapterIndex=1";`,
    `import title1 from "./2.md?titleOnly";`,
    `export const chapters = [{ index: 0, title: title0, content: content0 },{ index: 1, title: title1, content: content1 }];`,
    `export const title = chapters[0]?.title || "";`,
    `export const content = content0 + content1;`,
  ].join("\n")
);
