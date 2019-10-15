const tap = require("tap");
const slidesJsonLoader = require("./slides-json-loader");

tap.equal(slidesJsonLoader(JSON.stringify([])), "export default []");
