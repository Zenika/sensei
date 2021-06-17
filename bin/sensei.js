#! /usr/bin/env node

const spawn = require("child_process").spawn;
const fork = require("child_process").fork;
const path = require("path");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("../webpack.config");
const webpack = require("webpack");
const yargs = require("yargs/yargs");

async function cli(args, env) {
  const {
    _: [command],
    slug = path.basename(path.resolve(material)),
    ...otherArgs
  } = args;
  const buildOptions = {
    slug,
    ...otherArgs,
  };

  switch (command) {
    case "serve":
      serve(buildOptions, { port: env.port });
      break;
    case "build":
      await build(buildOptions);
      break;
    case "pdf":
      await pdf(buildOptions);
      break;
    default:
      throw new Error(`unknown command: '${command}'`);
  }
}

function serve(buildOptions, serveOptions) {
  const server = new WebpackDevServer(webpack(webpackConfig(buildOptions)));
  server.listen(serveOptions.port, "0.0.0.0", (err) => {
    if (err) {
      console.log(err);
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

/**
 * DEPRECATED
 * DO NOT ADD POSITIONAL ARGUMENTS/
 * These are for backward compatibility only.
 * If adding new arguments, use named arguments (aka options) below.
 */
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
    .help().argv,
  {
    port: process.env.SENSEI_PORT || 8080,
  }
);
