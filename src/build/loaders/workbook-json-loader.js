const path = require("path");

/**
 *
 * @param {string} content
 * @returns {string}
 */
function insertToc(content) {
  let toc = '<ul class="toc">';
  const regexp = /<h2 id="(?<id>[^"]*)"[^>]*>(?<title>.+?)<\/h2>/g;
  const matches = content.matchAll(regexp);
  for (const match of matches) {
    const { id, title } = match.groups || {};
    toc += `<li><a href="#${id}">${title}</a></li>`;
  }
  toc += '</ul>';

  return content.replaceAll("<!-- toc -->", toc);
}

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
  const contentWithToc = insertToc(content);
  // see https://stackoverflow.com/a/58800331/1067260
  const contentEscapedForTemplateLiterals = contentWithToc.replace(
    /\\|`|\$/g,
    "\\$&"
  );
  return `export const content = \`${contentEscapedForTemplateLiterals}\``;
}

/** @type {import("webpack").PitchLoaderDefinitionFunction<{ material: string }, {}>} */
function workbookJsonLoader(content) {
  const { material } = this.getOptions();
  const workbookFolder = path.relative(material, this.context);
  const importWorkbookPart = async (filename) => {
    const partModule = await this.importModule(
      `training-material/${workbookFolder}/${filename}`
    );
    return partModule.default;
  };
  return compileWorkbookJson(content, { importWorkbookPart });
}

module.exports = workbookJsonLoader;
module.exports.compileWorkbookJson = compileWorkbookJson;
