function insertToc(content) {
  let toc = '<h2 class="toc">&nbsp;</h2><ul class="toc">';
  const regexp = /<h2 id="(?<id>[^"]*)"[^>]*>(?<title>.+?)<\/h2>/g;
  const matches = content.matchAll(regexp);
  for (const match of matches) {
    const { id, title } = match.groups;
    toc += `<li><a href="#${id}">${title}</a></li>`;
  }
  toc += '</ul><div class="pb"></div>';

  return content.replace("<!-- toc -->", toc);
}

module.exports = function (content, map, meta) {
  const callback = this.async();
  const json = JSON.parse(content);
  Promise.all(
    json.map((filename) =>
      this.importModule(`training-material/Workbook/${filename}`)
    )
  )
    .then(
      (labModules) =>
        labModules
          .map(
            (labModule, index) =>
              labModule.default + (index === 0 ? "<!-- toc -->" : "")
          )
          .join("\n") || ""
    )
    .then(insertToc)
    .then((labsContent) => {
      callback(
        null,
        `export const content = \`${labsContent
          .replaceAll("`", "\\`")
          .replaceAll("${", "\\${")}\`;`,
        map,
        meta
      );
    })
    .catch((e) => callback(e));
};
