const path = require("path");

const PART_SEPARATOR = "\n<!-- part separator -->\n";

/**
 * @param {string} jsonFileContent
 * @param {{ importPart: (filename: string) => string | Promise<string> }} options
 * @returns {Promise<string>} resulting js module
 */
async function compileJsonParts(jsonFileContent, { importPart }) {
  /** @type {string[]} */
  const partPaths = JSON.parse(jsonFileContent);
  const parts = await Promise.all(
    partPaths.map((filename) => importPart(filename))
  );
  const content = parts.join(`${PART_SEPARATOR}`);
  return content;
}

/** @type {import("webpack").LoaderDefinitionFunction<{ material: string }, {}>} */
function JsonPartsLoader(content) {
  const { material } = this.getOptions();
  const partsFolder = path.relative(material, this.context);
  const importPart = async (filename) => {
    const part = await this.importModule(
      `training-material/${partsFolder}/${filename}`
    );
    return part;
  };
  return compileJsonParts(content, { importPart });
}

module.exports = JsonPartsLoader;
module.exports.compileJsonParts = compileJsonParts;
module.exports.PART_SEPARATOR = PART_SEPARATOR;
