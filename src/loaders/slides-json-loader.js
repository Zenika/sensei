module.exports = function(content) {
  const json = JSON.parse(content);
  const imports = json.map((f, i) => `import f${i} from "./${f}";`).join("\n");
  return `${imports}\nexport default [${json.map((f, i) => `f${i}`).join(", ")}]`;
};
