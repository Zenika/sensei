#! /usr/bin/env node

const spawn = require("child_process").spawn;
const fork = require("child_process").fork;
const path = require("path");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("../webpack.config");
const webpack = require("webpack");
const yargs = require("yargs/yargs");

async function cli(args) {
  const {
    _: [command],
    material = ".",
    slug = path.basename(path.resolve(material)),
    slideWidth = 1420,
    slideHeight = 800,
    ...otherArgs
  } = args;
  const options = {
    material,
    slug,
    slideWidth,
    slideHeight,
    ...otherArgs,
  };

  switch (command) {
    case "serve":
      serve(options);
      break;
    case "build":
      await build(options);
      break;
    case "pdf":
      await pdf(options);
      break;
    default:
      throw new Error(`unknown command: '${command}'`);
  }
}

function serve(options) {
  console.log("Start dev server");
  const server = new WebpackDevServer(webpack(webpackConfig(options)));
  server.listen(8080, "0.0.0.0", function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Navigate to http://localhost:8080/");
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

async function pdf(options) {
  console.log("Generate pdf slides & labs");
  await build({ ...options, pdf: true });
  pdfSlides(options);
  pdfLabs(options);
}

function pdfSlides({ slug, slideWidth, slideHeight }) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [
      path.resolve(
        path.join(__dirname, "../src/pdf/node_modules/decktape/decktape.js")
      ),
      "reveal",
      "-p",
      "0",
      "--size",
      `${slideWidth}x${slideHeight}`,
      `file:${path.resolve("./dist/slides.html")}`,
      `./pdf/Zenika-${slug}-Slides.pdf`,
    ]);

    child.stdout.on("data", function (data) {
      process.stdout.write(data);
    });

    child.stderr.on("data", function (data) {
      process.stderr.write(data);
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

function pdfLabs({ slug }) {
  return new Promise((resolve, reject) => {
    const child = fork(
      path.resolve(path.join(__dirname, "../src/pdf/pdf.js")),
      [
        `file:${path.resolve("./dist/labs.html")}`,
        `./pdf/Zenika-${slug}-Workbook.pdf`,
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

function describePositionalArguments(yargs) {
  yargs
    .positional("material", {
      type: "string",
      describe:
        "Path to the folder containing the training material. Defaults to the current working directory. Takes precedence over the option of the same name. DEPRECATED: will be removed in a future version, use the option of the same name instead.",
      default: ".",
    })
    .positional("slug", {
      type: "string",
      describe:
        "Training name used in PDF files and HTML page titles. Defaults to the name of the current working directory. Takes precedence over the option of the same name. DEPRECATED: will be removed in a future version, use the option of the same name instead.",
      default: path.basename(path.resolve(".")),
    });
}

cli(
  yargs(process.argv.slice(2))
    .command(
      "serve [material] [slug]",
      "serve locally, with live-reloading",
      describePositionalArguments
    )
    .command("pdf [material] [slug]", "build PDFs", describePositionalArguments)
    .command(
      "build [material] [slug]",
      "build the static web site",
      describePositionalArguments
    )
    .option("material", {
      type: "string",
      describe:
        "Path to the folder containing the training material. Defaults to the current working directory.",
      default: ".",
    })
    .option("slug", {
      type: "string",
      describe:
        "Training name used in PDF files and HTML page titles. Defaults to the name of the current working directory.",
      default: path.basename(path.resolve(".")),
    })
    .option("slideWidth", {
      type: "number",
      describe:
        "Forwarded to Reveal.js. See https://revealjs.com/presentation-size/.",
      default: 1420,
    })
    .option("slideHeight", {
      type: "number",
      describe:
        "Forwarded to Reveal.js. See https://revealjs.com/presentation-size/.",
      default: 800,
    })
    .demandCommand(1, 1, "One command must be specified")
    .strict()
    .help().argv
);
