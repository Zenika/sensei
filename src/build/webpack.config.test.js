const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");

const TITLE_NOT_FOUND_WARNING = /The title of the training was not found/;

testCompilation("empty", {}, { ignoreWarnings: [TITLE_NOT_FOUND_WARNING] });

testCompilation(
  "one slide file but no content",
  {
    slides: [{ file: "1.md" }],
  },
  { ignoreWarnings: [TITLE_NOT_FOUND_WARNING] }
);

testCompilation(
  "multiple slide files but no content",
  {
    slides: [{ file: "1.md" }, { file: "2.md" }],
  },
  { ignoreWarnings: [TITLE_NOT_FOUND_WARNING] }
);

testCompilation(
  "one slide file with markdown linking an image",
  {
    slides: [{ file: "img.md", content: '<img src="../assets/img.png">' }],
    assets: [{ file: "img.png" }],
  },
  { ignoreWarnings: [TITLE_NOT_FOUND_WARNING] }
);

testCompilation(
  "one slide including a self-closing img tag decorated with .element",
  {
    slides: [
      {
        file: "img.md",
        content: `<!-- .element: attr="value"--><img/>`,
      },
    ],
  },
  { ignoreWarnings: [TITLE_NOT_FOUND_WARNING] }
);

testCompilation("one slide with a title including HTML", {
  slides: [{ file: "img.md", content: '# <img src="../assets/img.png">' }],
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
      `
        // remove indentation because it is significant in markdown
        .replaceAll(/^        /gm, ""),
    },
  ],
});

testCompilation(
  "one workbook file but no content",
  {
    workbook: [{ file: "1.md" }],
  },
  { ignoreWarnings: [TITLE_NOT_FOUND_WARNING] }
);

testCompilation(
  "multiple workbook files but no content",
  {
    workbook: [{ file: "1.md" }, { file: "2.md" }],
  },
  { ignoreWarnings: [TITLE_NOT_FOUND_WARNING] }
);

function testCompilation(
  caseName,
  fakeMaterialConfig,
  { ignoreWarnings = [] } = {}
) {
  return test(caseName, (t, done) => {
    const { input, output, cleanUp } = setupFakeMaterial(
      caseName,
      fakeMaterialConfig
    );
    webpack(
      {
        ...webpackConfig({
          material: input,
          slug: "slug",
          repositoryUrl: "https://github.com/Zenika-Training/training-template",
          slideWidth: 1000,
          slideHeight: 1000,
        }),
        output: {
          path: output,
        },
        mode: "production",
        performance: {
          hints: false,
        },
        ignoreWarnings,
      },
      (err, stats) => {
        cleanUp();
        assert.ifError(err);
        assert(
          !stats.hasErrors(),
          `compilation of material '${caseName}' fails: ${stats.toString()}`
        );
        assert.strictEqual(
          // Can't use 'stats.hasWarnings' because it's 'true' even if said warnings are ignored by the config.
          stats.toJson().warningsCount,
          0,
          `compilation of material '${caseName}' emits warnings: ${stats.toString(
            { children: true, warnings: true, errorDetails: true }
          )}`
        );
        done();
      }
    );
  });
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
  const workbookFolder = path.join(input, "Workbook");
  fs.mkdirSync(workbookFolder, { recursive: true });
  fs.writeFileSync(
    path.join(workbookFolder, "workbook.json"),
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
