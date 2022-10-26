function escapeForStringExport(string) {
  return string.replace(/["]/g, "\\$&").replace(/\n/g, "\\n\\$&");
}

/** @type {import("webpack").LoaderDefinitionFunction<{}, {}>} */
module.exports = function (content) {
  const title = content.match(/<h1[^>]*>(.+?)<\/h1>/m)?.[1];
  if (!title) {
    this.emitWarning(
      new Error(
        `The title of the training was not found. Please ensure that the slides include a first level title (e.g. '# My title') in '${this.resourcePath}'`
      )
    );
  }
  const titleExport = `export const title = "${escapeForStringExport(
    title || "⚠ TITLE NOT FOUND"
  )}";`;
  const contentExport = `export const content = "${escapeForStringExport(
    content
  )}";`;
  return titleExport + contentExport;
};
