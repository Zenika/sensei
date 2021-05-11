const childProcess = require("child_process");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

const Prism = require("prismjs");
require("prismjs/components/")();

const DEFAULT_TRAINING_MATERIAL_FOLDER = "training-material";
const DEFAULT_SLIDE_WIDTH = 1420;
const DEFAULT_SLIDE_HEIGHT = 800;

module.exports = (env = {}) => {
  const trainingMaterialFolder = path.resolve(
    env.material || DEFAULT_TRAINING_MATERIAL_FOLDER
  );
  console.log(
    `Training material folder: '${trainingMaterialFolder}'.`,
    `This can be changed using '--env.material=<relative path to training material folder>'.`
  );

  const trainingSlug = env.slug || path.basename(trainingMaterialFolder);
  console.log(
    `Training slug: '${trainingSlug}'.`,
    `This can be changed using '--env.trainingSlug=<training slug>'.`
  );

  const slideWitdh = env.slideWidth || DEFAULT_SLIDE_WIDTH;
  const slideHeight = env.slideHeight || DEFAULT_SLIDE_HEIGHT;

  const date = new Date().toISOString().substring(0, 10);

  let commitHash = "";
  try {
    commitHash = childProcess
      .execSync("git rev-parse --short HEAD", { cwd: trainingMaterialFolder })
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
      index: path.resolve(path.join(__dirname, "src/index.js")),
      slides: path.resolve(
        path.join(__dirname, `src/slides/${slidesEntry}.js`)
      ),
      labs: path.resolve(path.join(__dirname, "src/labs/labs.js")),
    },
    module: {
      rules: [
        {
          test: [/slides\.json$/, /parts\.json$/],
          type: "javascript/auto",
          use: path.resolve(
            path.join(__dirname, "src/loaders/slides-json-loader")
          ),
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
            // The loader of HtmlWebpackPlugin outputs a JavaScript module
            // exporting the HTML as a string while the html-loader expects
            // HTML, so we use the extract-loader to do the conversion.
            require.resolve("extract-loader"),
            // We need this to resolve images found in the templates.
            require.resolve("html-loader"),
          ],
        },
        {
          test: /[\/\\]Slides[\/\\].+\.md$/,
          use: [
            require.resolve("html-loader"),
            path.resolve(path.join(__dirname, "src/loaders/revealjs-loader")),
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
                  return Prism.highlight(code, prismLang);
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
            },
          },
        },
      ],
    },
    resolve: {
      alias: {
        "training-material": trainingMaterialFolder,
      },
      symlinks: false,
      modules: [
        // this is to support the "npm link" case where imports must be resolved
        // from the project folder
        path.resolve(__dirname, "node_modules"),
        // this is the default and works for most cases
        "node_modules",
      ],
    },
    output: {
      path: path.resolve("./dist"),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(path.join(__dirname, "src/index.html")),
        chunks: ["index"],
        filename: "index.html",
        trainingSlug,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(path.join(__dirname, "src/slides/slides.html")),
        chunks: ["slides"],
        filename: "slides.html",
        trainingSlug,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(path.join(__dirname, "src/labs/labs.html")),
        chunks: ["labs"],
        filename: "labs.html",
        trainingSlug,
      }),
      new MiniCssExtractPlugin(),
      new webpack.DefinePlugin({
        SLIDE_WIDTH: String(slideWitdh),
        SLIDE_HEIGHT: String(slideHeight),
        MATERIAL_VERSION: JSON.stringify(`${date}#${commitHash}`),
      }),
    ],
    devServer: {
      contentBase: false,
    },
  };
};
