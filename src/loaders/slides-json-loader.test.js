const assert = require("assert");
const slidesJsonLoader = require("./slides-json-loader");

assert.deepStrictEqual(
  slidesJsonLoader(JSON.stringify([])),
  "export default []"
);
