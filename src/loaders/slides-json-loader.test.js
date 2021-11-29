const assert = require("assert");
const slidesJsonLoader = require("./slides-json-loader");

assert.deepStrictEqual(
  slidesJsonLoader(JSON.stringify([])).trim(),
  `
    export const chapters = [];
    export const title = chapters[0]?.title || "";
    export const content = "";
  `.trim()
);
