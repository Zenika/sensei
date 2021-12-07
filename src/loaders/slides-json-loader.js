module.exports = function (content) {
  const json = JSON.parse(content);
  const imports = json.flatMap((filename, index) => {
    const chapterImports = [
      `import content${index} from "./${filename}?chapterIndex=${index}";`,
    ];
    if (index === 0) {
      chapterImports.push(
        `import title${index} from "./${filename}?titleOnly";`
      );
    }
    return chapterImports;
  });
  const chapters = json
    .map((filename, index) =>
      index === 0
        ? `{ index: ${index}, title: title${index}, content: content${index} }`
        : `{ index: ${index}, content: content${index} }`
    )
    .join(", ");
  const fullContent =
    json.map((filename, index) => `content${index}`).join(" + ") || '""';
  const exports = [
    `export const chapters = [${chapters}];`,
    `export const title = chapters[0]?.title || "";`,
    `export const content = ${fullContent};`,
  ];
  return imports.concat(exports).join("\n");
};
