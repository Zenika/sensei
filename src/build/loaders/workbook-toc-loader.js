/** @type {import("webpack").LoaderDefinitionFunction<{ material: string }, {}>} */
module.exports = function (content) {
  let toc = '<ul class="toc">';
  const regexp = /<h2 id="(?<id>[^"]*)"[^>]*>(?<title>.+?)<\/h2>/g;
  const matches = content.matchAll(regexp);
  for (const match of matches) {
    const { id, title } = match.groups || {};
    toc += `<li><a href="#${id}">${title}</a></li>`;
  }
  toc += "</ul>";

  return content.replaceAll("<!-- toc -->", toc);
};
