const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");

testCompilation("empty", {});

testCompilation("one slide file but no content", {
  slides: [{ file: "1.md" }],
});

testCompilation("multiple slide files but no content", {
  slides: [{ file: "1.md" }, { file: "2.md" }],
});

testCompilation("one slide file with markdown linking an image", {
  slides: [{ file: "img.md", content: '<img src="../assets/img.png">' }],
  assets: [{ file: "img.png" }],
});

testCompilation("first chapter of training material template", {
  slides: [
    {
      file: "00_agenda.md",
      content: `
        # Titre de la formation

        <!-- .slide: class="page-title" -->



        ## Sommaire

        <!-- .slide: id="master-toc" class="toc" -->

        - [Syntaxe de base](#/1)
        - [Code et tableaux](#/2)
        - [Positionnement des images](#/3)
        - [Animations](#/4)
        - [Syntaxe avancée](#/5)



        ## Logistique

        - Horaires
        - Déjeuner & pauses
        - Autres questions ?



        <!-- .slide: class="page-questions" -->
      `,
    },
  ],
});

testCompilation("one workbook file but no content", {
  workbook: [{ file: "1.md" }],
});

testCompilation("multiple workbook files but no content", {
  workbook: [{ file: "1.md" }, { file: "2.md" }],
});

function testCompilation(caseName, fakeMaterialConfig) {
  const { input, output, cleanUp } = setupFakeMaterial(
    caseName,
    fakeMaterialConfig
  );
  webpack(
    {
      ...webpackConfig({ material: input }),
      output: {
        path: output,
      },
      stats: {
        errorDetails: true,
      },
    },
    (err, stats) => {
      cleanUp();
      assert.ifError(err);
      assert(
        !stats.hasErrors(),
        `compilation of material '${caseName}' fails: ${stats.toString()}`
      );
      assert(
        !stats.hasWarnings(),
        `compilation of material '${caseName}' emits warnings: ${stats.toString()}`
      );
    }
  );
}

function setupFakeMaterial(
  folderLabel,
  { slides = [], workbook = [], assets = [] } = {}
) {
  const sandbox = fs.mkdtempSync(
    path.join(os.tmpdir(), `sensei_webpack.config.test.js_${folderLabel}_`)
  );
  const input = path.join(sandbox, "input");
  const slidesFolder = path.join(input, "Slides");
  fs.mkdirSync(slidesFolder, { recursive: true });
  fs.writeFileSync(
    path.join(slidesFolder, "slides.json"),
    JSON.stringify(slides.map(({ file }) => file))
  );
  slides.forEach(({ file, content = "" }) =>
    fs.writeFileSync(path.join(slidesFolder, file), content)
  );
  const workbookFolder = path.join(input, "CahierExercices");
  fs.mkdirSync(workbookFolder, { recursive: true });
  fs.writeFileSync(
    path.join(workbookFolder, "parts.json"),
    JSON.stringify(workbook.map(({ file }) => file))
  );
  workbook.forEach(({ file, content = "" }) =>
    fs.writeFileSync(path.join(workbookFolder, file), content)
  );
  const assetsFolder = path.join(input, "assets");
  fs.mkdirSync(assetsFolder, { recursive: true });
  assets.forEach(({ file, content = "" }) =>
    fs.writeFileSync(path.join(assetsFolder, file), content)
  );
  const output = path.join(sandbox, "output");
  return {
    input,
    output,
    cleanUp() {
      fs.rmSync(sandbox, { force: true, recursive: true });
    },
  };
}
