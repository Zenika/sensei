//@ts-check

const childProcess = require("child_process");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

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
        // rule for HtmlWebpackPlugin templates
        {
          test: /\.html$/,
          use: [
            // The default loader of HtmlWebpackPlugin won't run if there are
            // other loaders that apply to the template file (see
            // https://github.com/jantimon/html-webpack-plugin/blob/master/docs/template-option.md#3-setting-a-loader-using-the-modulerules-syntax),
            // but we want it to run to render variables (<%= %>) so we force it
            // to run.
            {
              loader: require.resolve("html-webpack-plugin/lib/loader.js"),
              options: { force: true },
            },
            // html-loader outputs a JavaScript module exporting the HTML as a
            // string while the HtmlWebpackPlugin loader expects HTML, so we use
            // the extract-loader to handle the conversion.
            require.resolve("extract-loader"),
            // We need this to resolve images found in the templates.
            {
              loader: require.resolve("html-loader"),
              options: {
                // extract-loader (which handles the output of this loader) does
                // not support ES modules
                esModule: false,
              },
            },
          ],
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
          test: /[\/\\]CahierExercices[\/\\].+\.md$/,
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
          use: {
            loader: require.resolve("file-loader"),
            options: {
              name: "[name]-[contenthash].[ext]",
              outputPath: "static-assets",
              esModule: false,
            },
          },
          // this prevents default asset processing
          // see https://webpack.js.org/guides/asset-modules/
          type: "javascript/auto",
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
    },
    output: {
      path: path.resolve("./dist"),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "../src/index.html"),
        chunks: ["index"],
        filename: "index.html",
        trainingSlug: env.slug,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "../src/slides/slides.html"),
        chunks: ["slides"],
        filename: "slides.html",
        trainingSlug: env.slug,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "../src/labs/labs.html"),
        chunks: ["labs"],
        filename: "labs.html",
        trainingSlug: env.slug,
      }),
      new MiniCssExtractPlugin(),
      new webpack.DefinePlugin({
        SLIDE_WIDTH: String(env.slideWidth),
        SLIDE_HEIGHT: String(env.slideHeight),
        MATERIAL_VERSION: JSON.stringify(`${date}#${commitHash}`),
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
