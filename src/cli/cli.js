#! /usr/bin/env node

const spawn = require("child_process").spawn;
const fork = require("child_process").fork;
const fs = require("fs");
const path = require("path");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("../build/webpack.config");
const webpack = require("webpack");
const yargs = require("yargs/yargs");
const pdf = require("../pdf/pdf");

async function cli(args, env) {
  const {
    _: [command],
    $0: _,
    ...options
  } = args;

  console.info(
    `Processing folder '${options.material}' as '${options.slug}' using slide size ${options.slideWidth}x${options.slideHeight} and language '${options.language}'`
  );

  const { host, port, bundleAnalyzer } = env;
  switch (command) {
    case "serve":
      await serve({ ...options, bundleAnalyzer }, { host, port });
      break;
    case "build":
      await build({ ...options, bundleAnalyzer });
      break;
    case "pdf":
      await generatePdf(options);
      break;
    default:
      throw new Error(`unknown command: '${command}'`);
  }
}

async function serve(buildOptions, serveOptions) {
  const server = new WebpackDevServer(
    {
      devMiddleware: {
        stats: { children: true, warnings: true, errors: true },
      },
      // Disables HMR, enables live reload, see https://webpack.js.org/configuration/dev-server/#devserverhot
      hot: false,
      port: serveOptions.port,
      host: serveOptions.host,
    },
    webpack(webpackConfig(buildOptions))
  );
  try {
    await server.start();
  } catch (err) {
    console.log(err);
  }
}

function build(options) {
  console.log("Build slides & labs");
  return new Promise((resolve, reject) => {
    webpack(webpackConfig(options, { mode: "production" }), (err, stats) => {
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

async function generatePdf(options) {
  console.log("Generate pdf slides & labs");
  await build({ ...options, pdf: true });
  const serveHandler = require("serve-handler");
  const http = require("http");
  const server = http.createServer((request, response) => {
    return serveHandler(request, response, {
      public: path.resolve("./dist"),
    });
  });
  const result = new Promise((resolve, reject) => {
    server.on("close", resolve);
    server.on("error", reject);
  });
  // get-port is an ESM so need to load it using import
  const { default: getPort } = await import("get-port");
  const port = await getPort();
  server.listen(port, async () => {
    try {
      await Promise.all([
        pdfSlides({ ...options, port }),
        pdfLabs({ ...options, port }),
      ]);
    } finally {
      server.close();
    }
  });
  return result;
}

async function pdfSlides({ slug, slideWidth, slideHeight, port }) {
  await pdf
    .generatePdf(
      `./pdf/Zenika-${slug}-Slides.pdf`,
      `http://localhost:${port}/slides.html?print-pdf`,
      {
        width: slideWidth,
        height: slideHeight,
        timeout: 300000,
      }
    )
    .then(() => console.log("PDF slides generated"))
    .catch((err) => console.error("PDF slides generation failed!", err));
}

async function pdfLabs({ slug, port }) {
  await pdf
    .generatePdf(
      `./pdf/Zenika-${slug}-Workbook.pdf`,
      `http://localhost:${port}/labs.html`,
      {
        format: "A4",
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
      }
    )
    .then(() => console.log("PDF labs generated"))
    .catch((err) => console.error("PDF Labs generation failed!", err));
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

function composeEnv() {
  const {
    SENSEI_HOST,
    SENSEI_PORT,
    SENSEI_BUNDLE_ANALYZER_ENABLED,
    SENSEI_BUNDLE_ANALYZER_MODE,
    SENSEI_BUNDLE_ANALYZER_HOST,
    SENSEI_BUNDLE_ANALYZER_PORT,
  } = process.env;
  const bundleAnalyzerExplicitlyEnabled =
    SENSEI_BUNDLE_ANALYZER_ENABLED === "true";
  const bundleAnalyzerExplicitlyDisabled =
    SENSEI_BUNDLE_ANALYZER_ENABLED === "false";
  const bundleAnalyzerImplicitlyEnabled =
    SENSEI_BUNDLE_ANALYZER_MODE ||
    SENSEI_BUNDLE_ANALYZER_HOST ||
    SENSEI_BUNDLE_ANALYZER_PORT;
  return {
    host: SENSEI_HOST || "127.0.0.1",
    port: SENSEI_PORT || 8080,
    bundleAnalyzer: {
      enabled:
        bundleAnalyzerExplicitlyEnabled ||
        (!bundleAnalyzerExplicitlyDisabled && bundleAnalyzerImplicitlyEnabled),
      mode: SENSEI_BUNDLE_ANALYZER_MODE,
      host: SENSEI_BUNDLE_ANALYZER_HOST,
      port: SENSEI_BUNDLE_ANALYZER_PORT,
    },
  };
}

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
        "Path to JSON config file. If not absolute path, then relative to 'material' directory.\n\
        Config file is a simple JSON to define CLI options, e.g '{\"slideWidth\": 1024, \"slideHeight\": 768}'",
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
    .option("repositoryUrl", {
      type: "string",
      describe: "URL to training git repository",
      default: "",
    })
    .option("language", {
      type: "string",
      describe: "Language used for typographic rules. Defaults to 'en'.",
      default: "en",
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
  composeEnv()
);
