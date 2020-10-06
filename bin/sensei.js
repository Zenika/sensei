#! /usr/bin/env node

const spawn = require("child_process").spawn;
const fork = require("child_process").fork;
const path = require("path");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("../webpack.config");
const webpack = require("webpack");

async function cli(args) {
  const trainingMaterialFolder = args[3] || ".";
  const trainingSlug =
    args[4] || path.basename(path.resolve(trainingMaterialFolder));
  switch (args[2]) {
    case "serve":
      serve(trainingMaterialFolder, trainingSlug);
      break;
    case "build":
      await build({ material: trainingMaterialFolder, trainingSlug });
      break;
    case "pdf":
      await pdf(trainingMaterialFolder, trainingSlug);
      break;
    case "help":
    case "-h":
    default:
      help();
      break;
  }
}

function serve(trainingMaterialFolder, trainingSlug) {
  console.log("Start dev server");
  const server = new WebpackDevServer(
    webpack(webpackConfig({ material: trainingMaterialFolder, trainingSlug }))
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

function build(options) {
  console.log("Build slides & labs");
  return new Promise((resolve, reject) => {
    webpack(webpackConfig(options), (err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats.hasErrors()) {
        return reject(new Error(stats.toString()));
      }
      console.log("Files generated to dist folder");
      resolve();
    });
  });
}

async function pdf(trainingMaterialFolder, trainingSlug) {
  console.log("Generate pdf slides & labs");
  await build({ material: trainingMaterialFolder, trainingSlug, pdf: true });
  pdfSlides(trainingSlug);
  pdfLabs(trainingSlug);
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
        `./pdf/Zenika-${trainingName}-Slides.pdf`,
      ]
    );

    child.stdout.on("data", function (data) {
      process.stdout.write(data);
    });

    child.on("exit", function (code) {
      if (code !== 0) {
        return reject(
          new Error(`spawned process exited with non-zero code '${code}'`)
        );
      }
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
        `./pdf/Zenika-${trainingName}-Workbook.pdf`,
      ]
    );

    child.on("exit", function (code) {
      if (code !== 0) {
        return reject(
          new Error(`forked process exited with non-zero code '${code}'`)
        );
      }
      console.log("PDF labs generated");
      resolve();
    });

    child.on("error", function (err) {
      console.error("PDF Labs generation failed!", err);
      reject(err);
    });
  });
}

// quit on ctrl-c when running docker in terminal
process.on("SIGINT", function onSigint() {
  console.info(
    "Got SIGINT (aka ctrl-c in docker). Graceful shutdown",
    new Date().toISOString()
  );
  process.exit();
});

// quit properly on docker stop
process.on("SIGTERM", function onSigterm() {
  console.info(
    "Got SIGTERM (docker container stop). Graceful shutdown",
    new Date().toISOString()
  );
  process.exit();
});

process.on("unhandledRejection", (err) => {
  process.exitCode = 1;
  throw err;
});

cli(process.argv);
