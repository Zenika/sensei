//@ts-check

const childProcess = require("child_process");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const Prism = require("prismjs");
require("prismjs/components/")();

module.exports = (env = {}) => {
  assertRequiredOptionsArePresent(env);

  const date = new Date().toISOString().substring(0, 10);

  let commitHash = "";
  try {
    commitHash = childProcess
      .execSync("git rev-parse --short HEAD", { cwd: env.material })
      .toString();
  } catch (err) {
    if (err.message.match(/not a git repository/i)) {
      commitHash = "nogit";
    } else {
      throw err;
    }
  }

  const slidesEntry =
    env.pdf === true || env.pdf === "true" ? "slides-pdf" : "slides";

  const commonPluginOptions = {
    trainingSlug: env.slug,
    language: env.language,
  };

  return {
    mode: "development",
    entry: {
      index: path.resolve(__dirname, "../src/index.js"),
      slides: path.resolve(__dirname, `../src/slides/${slidesEntry}.js`),
      labs: path.resolve(__dirname, "../src/labs/labs.js"),
    },
    module: {
      rules: [
        {
          test: [/slides\.json$/, /parts\.json$/],
          type: "javascript/auto",
          use: path.resolve(__dirname, "../src/loaders/slides-json-loader"),
        },
        {
          test: /[\/\\]Slides[\/\\].+\.md$/,
          use: [
            require.resolve("html-loader"),
            path.resolve(
              path.join(__dirname, "../src/loaders/revealjs-loader")
            ),
          ],
        },
        {
          test: /[\/\\](Workbook|CahierExercices)[\/\\].+\.md$/,
          use: [
            require.resolve("html-loader"),
            {
              loader: require.resolve("markdown-loader"),
              options: {
                highlight(code, lang) {
                  const prismLang =
                    Prism.languages[lang] || Prism.languages.clike;
                  return Prism.highlight(code, prismLang, lang);
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            require.resolve("css-loader"),
          ],
        },
        {
          test: /reveal\.js[\/\\]dist[\/\\]reveal\.js$/,
          use: {
            loader: require.resolve("expose-loader"),
            options: { exposes: "Reveal" },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp|mp3|ttf)$/i,
          type: "asset/resource",
        },
      ],
    },
    resolve: {
      alias: {
        "training-material": env.material,
      },
      symlinks: false,
      modules: [
        // this is to support the "npm link" case where imports must be resolved
        // from the project folder
        path.resolve(__dirname, "../node_modules"),
        // this is the default and works for most cases
        "node_modules",
      ],
      fallback: {
        "training-material/Workbook/parts.json":
          "training-material/CahierExercices/parts.json",
        "training-material/Slides/resources/custom.css":
          "training-material/Slides/ressources/custom.css",
        "training-material/Slides/ressources/custom.css": false,
      },
    },
    output: {
      path: path.resolve("./dist"),
      assetModuleFilename: "static-assets/[name]-[contenthash].[ext]",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "../src/index.html"),
        chunks: ["index"],
        filename: "index.html",
        ...commonPluginOptions,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "../src/slides/slides.html"),
        chunks: ["slides"],
        filename: "slides.html",
        ...commonPluginOptions,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "../src/labs/labs.html"),
        chunks: ["labs"],
        filename: "labs.html",
        ...commonPluginOptions,
      }),
      new MiniCssExtractPlugin(),
      new webpack.DefinePlugin({
        SLIDE_WIDTH: String(env.slideWidth),
        SLIDE_HEIGHT: String(env.slideHeight),
        MATERIAL_VERSION: JSON.stringify(`${date}#${commitHash}`),
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: env.analyzeBundle ? "server" : "disabled",
        openAnalyzer: false,
      }),
    ],
    devServer: {
      contentBase: false,
    },
  };
};

function assertRequiredOptionsArePresent(env) {
  if (!env.material) {
    throw new Error("'material' option is required but was not found");
  }
  if (!env.slug) {
    throw new Error("'slug' option is required but was not found");
  }
  if (!env.slideWidth) {
    throw new Error("'slideWidth' option is required but was not found");
  }
  if (!env.slideHeight) {
    throw new Error("'slideHeight' option is required but was not found");
  }
}
