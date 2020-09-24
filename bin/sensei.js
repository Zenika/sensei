#! /usr/bin/env node
const spawn = require("child_process").spawn;
const fork = require("child_process").fork;
const path = require("path");
const WebpackDevServer = require("webpack-dev-server");
const config = require("../webpack.config");
const webpack = require("webpack");

function cli(args) {
  let trainingMaterialFolder = args[3];
  switch (args[2]) {
    case "serve":
    case null:
    case undefined:
      serve(trainingMaterialFolder);
      break;
    case "build":
      build(trainingMaterialFolder);
      break;
    case "pdf":
      pdf(trainingMaterialFolder);
      break;
    case "help":
    case "-h":
    default:
      help();
      break;
  }
}

function serve(trainingMaterialFolder = ".") {
  console.log("Start dev server");
  const server = new WebpackDevServer(
    webpack(config({ material: trainingMaterialFolder }))
  );
  server.listen(8080, "localhost", function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log(
        "Navigate to http://localhost:8080/slides.html or http://localhost:8080/labs.html"
      );
    }
  });
}

function build(trainingMaterialFolder = ".") {
  console.log("Build slides & labs");
  return new Promise((resolve, reject) => {
    webpack(config({ material: trainingMaterialFolder }), (err, stats) => {
      if (err || stats.hasErrors()) {
        console.error("HTML files generation failed!", err);
        reject();
      } else {
        console.log("Files generated to dist folder");
        resolve();
      }
    });
  });
}

function pdf(trainingMaterialFolder = ".") {
  console.log("Generate pdf slides & labs");
  build(trainingMaterialFolder).then(() => {
    pdfSlides(path.basename(trainingMaterialFolder));
    pdfLabs(path.basename(trainingMaterialFolder));
  });
}

function help() {
  console.log("Sensei training material build tool");
  console.log("");
  console.log("Commands :");
  console.log("  help| -h         display help");
  console.log(
    "  serve <path>     serve slides & labs for path [default: current directory]"
  );
  console.log(
    "  build <path>     build slides & labs for path [default: current directory]"
  );
  console.log(
    "  pdf <path>       generate pdf slides & labs for path [default: current directory]"
  );
}

function pdfSlides(trainingName) {
  const child = spawn(
    path.resolve(path.join(__dirname, "../src/pdf/node_modules/.bin/decktape")),
    [
      "reveal",
      "-p",
      "0",
      "--size",
      "1420x800",
      "./dist/slides.html",
      `./pdf/Zenika-Formation-${trainingName}-Slides.pdf`,
    ]
  );

  child.stdout.on("data", function (data) {
    process.stdout.write(data);
  });

  child.on("error", function (data) {
    console.error("PDF slides generation failed !", data);
  });
}

function pdfLabs(trainingName) {
  const child = fork(path.resolve(path.join(__dirname, "../src/pdf/pdf.js")), [
    `file:${path.resolve("./dist/labs.html")}`,
    `./pdf/Zenika-Formation-${trainingName}-CahierExercices.pdf`,
  ]);

  child.on("exit", function () {
    console.log("PDF labs generated");
  });

  child.on("error", function (data) {
    console.error("PDF Labs generation failed !", data);
  });
}

cli(process.argv);
