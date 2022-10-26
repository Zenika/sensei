const path = require("path");

/**
 * @param {string} workbookJsonFileContent
 * @param {{ importWorkbookPart: (filename: string) => string | Promise<string> }} options
 * @returns {Promise<string>} resulting js module
 */
async function compileWorkbookJson(
  workbookJsonFileContent,
  { importWorkbookPart }
) {
  /** @type {string[]} */
  const partPaths = JSON.parse(workbookJsonFileContent);
  const parts = await Promise.all(
    partPaths.map((filename) => importWorkbookPart(filename))
  );
  const content = parts.join("\n");
  return content;
}

/** @type {import("webpack").LoaderDefinitionFunction<{ material: string }, {}>} */
function workbookJsonLoader(content) {
  const { material } = this.getOptions();
  const workbookFolder = path.relative(material, this.context);
  const importWorkbookPart = async (filename) => {
    const workbookPart = await this.importModule(
      `training-material/${workbookFolder}/${filename}`
    );
    return workbookPart;
  };
  return compileWorkbookJson(content, { importWorkbookPart });
}

module.exports = workbookJsonLoader;
module.exports.compileWorkbookJson = compileWorkbookJson;
