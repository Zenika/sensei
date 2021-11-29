module.exports = function (content) {
  const json = JSON.parse(content);
  const imports = json.flatMap((filename, index) => [
    `import content${index} from "./${filename}?chapterIndex=${index}";`,
    `import title${index} from "./${filename}?titleOnly";`,
  ]);
  const chapters = json
    .map(
      (filename, index) =>
        `{ index: ${index}, title: title${index}, content: content${index} }`
    )
    .join(",");
  const fullContent =
    json.map((filename, index) => `content${index}`).join(" + ") || '""';
  const lines = [
    ...imports,
    `export const chapters = [${chapters}];`,
    `export const title = chapters[0]?.title || "";`,
    `export const content = ${fullContent};`,
  ];
  return lines.join("\n");
};
