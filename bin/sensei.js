#! /usr/bin/env node

const spawn = require("child_process").spawn;
const fork = require("child_process").fork;
const fs = require("fs");
const path = require("path");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config");
const webpack = require("webpack");
const yargs = require("yargs/yargs");

async function cli(args, env) {
  const {
    _: [command],
    $0: _,
    ...options
  } = args;

  console.info(
    `Processing folder '${options.material}' as '${options.slug}' using slide size ${options.slideWidth}x${options.slideHeight}`
  );

  switch (command) {
    case "serve":
      serve(options, { host: env.host, port: env.port });
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

function serve(buildOptions, serveOptions) {
  const server = new WebpackDevServer(webpack(webpackConfig(buildOptions)));
  server.listen(serveOptions.port, serveOptions.host, (err) => {
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
    .option("config", {
      type: "string",
      describe:
        "Path to JSON config file. If not absolute path, then relative to 'material' directory",
      default: ".sensei.json",
    })
    .option("material", {
      type: "string",
      describe:
        "Path to the folder containing the training material. Defaults to the current working directory.",
      default: ".",
      coerce(arg) {
        return path.resolve(arg);
      },
    })
    .option("slug", {
      type: "string",
      describe:
        "Training name used in PDF files and HTML page titles. Defaults to the name of the 'material' directory.",
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
    .middleware([
      function handleConfig(argv, yargs) {
        let configFilePath = argv.config;
        if (!path.isAbsolute(configFilePath)) {
          configFilePath = path.join(argv.material, configFilePath);
        }
        let rawConfig = "{}";
        try {
          rawConfig = fs.readFileSync(configFilePath).toString();
          console.info(`Read config from file '${configFilePath}'`);
        } catch (err) {
          if (!yargs.parsed.defaulted?.config) {
            throw Object.assign(
              new Error(
                `Cannot read config file '${configFilePath}': ${err.message}`
              ),
              err
            );
          }
        }
        let config = {};
        try {
          config = JSON.parse(rawConfig);
        } catch (err) {
          throw new Error(
            `Cannot parse the content of config file '${configFilePath}' as JSON: ${err.message}`
          );
        }
        for (const [name, value] of Object.entries(argv)) {
          const isDefinedOnCli = !(name in yargs.parsed.defaulted);
          const isDefinedInConfig = name in config;
          if (isDefinedOnCli || !isDefinedInConfig) {
            config[name] = value;
          }
        }
        return config;
      },
      function defaultsSlug(argv) {
        argv.slug = argv.slug || path.basename(argv.material);
        return argv;
      },
    ])
    .parserConfiguration({
      "strip-dashed": true,
    })
    .help().argv,
  {
    host: process.env.SENSEI_HOST || "127.0.0.1",
    port: process.env.SENSEI_PORT || 8080,
  }
);
