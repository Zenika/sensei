/** @type {import("webpack").LoaderDefinitionFunction<{}, {}>} */
module.exports = function (content) {
  // Input is code from 'html-loader' in the form 'var code = "..."; export default code;'
  const title = content.match(/<h1[^>]*>(.+?)<\/h1>/m)?.[1];
  if (!title) {
    this.emitWarning(
      new Error(
        `The title of the training was not found. Please ensure that the slides include a first level title (e.g. '# My title') in '${this.resourcePath}'`
      )
    );
  }
  const titleExport = `export const title = "${title || "⚠ TITLE NOT FOUND"}";`;
  result = content + "\n" + titleExport;
  return result;
};
