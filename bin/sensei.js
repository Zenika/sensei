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
  server.listen(8080, "0.0.0.0", function (err) {
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

async function pdf(trainingMaterialFolder) {
  console.log("Generate pdf slides & labs");
  await build(trainingMaterialFolder);
  let trainingName = trainingMaterialFolder
    ? path.basename(trainingMaterialFolder)
    : "";
  pdfSlides(trainingName);
  pdfLabs(trainingName);
}

function help() {
  console.log(
    `Sensei training material build tool

    Commands:
      help | -h        display help
      serve <path>     serve slides & labs for path [default: current directory]
      build <path>     build slides & labs for path [default: current directory]
      pdf <path>       generate pdf slides & labs for path [default: current directory]
  `
  );
}

function pdfSlides(trainingName) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      path.resolve(
        path.join(__dirname, "../src/pdf/node_modules/.bin/decktape")
      ),
      [
        "reveal",
        "-p",
        "0",
        "--size",
        "1420x800",
        `file:${path.resolve("./dist/slides.html")}`,
        `./pdf/Zenika-Formation-${trainingName}-Slides.pdf`,
      ]
    );

    child.stdout.on("data", function (data) {
      process.stdout.write(data);
    });

    child.on("exit", function () {
      console.log("PDF slides generated");
      resolve();
    });

    child.on("error", function (err) {
      console.error("PDF slides generation failed!", err);
      reject(err);
    });
  });
}

function pdfLabs(trainingName) {
  return new Promise((resolve, reject) => {
    const child = fork(
      path.resolve(path.join(__dirname, "../src/pdf/pdf.js")),
      [
        `file:${path.resolve("./dist/labs.html")}`,
        `./pdf/Zenika-Formation-${trainingName}-CahierExercices.pdf`,
      ]
    );

    child.on("exit", function () {
      console.log("PDF labs generated");
      resolve();
    });

    child.on("error", function (err) {
      console.error("PDF Labs generation failed!", err);
      reject(err);
    });
  });
}

cli(process.argv);
