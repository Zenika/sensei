const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const DEFAULT_TRAINING_MATERIAL_FOLDER = "training-material";

module.exports = (env = {}) => {
  if (!env.material) {
    console.warn(
      `WARNING: '--env.material' option not set. Falling back on the default: '${DEFAULT_TRAINING_MATERIAL_FOLDER}'`
    );
  }
  const trainingMaterialFolder = path.resolve(
    env.material || DEFAULT_TRAINING_MATERIAL_FOLDER
  );
  console.log(
    `Training material folder: '${trainingMaterialFolder}'.`,
    `This can be changed using '--env.material=<relative path to training material folder>'.`
  );
  const date = new Date().toISOString().replace(/T.*$/, '');
  const commitHash = require('child_process')
    .execSync('git rev-parse --short HEAD', {cwd: trainingMaterialFolder})
    .toString();
  return {
    mode: "development",
    entry: {
      index: path.resolve(path.join(__dirname, "src/index.js")),
      slides: path.resolve(path.join(__dirname, "src/slides/slides.js")),
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
        {
          test: /\.html$/,
          use: [require.resolve("html-loader")],
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
            require.resolve("markdown-loader"),
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
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(path.join(__dirname, "src/slides/slides.html")),
        chunks: ["slides"],
        filename: "slides.html",
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(path.join(__dirname, "src/labs/labs.html")),
        chunks: ["labs"],
        filename: "labs.html",
      }),
      new MiniCssExtractPlugin(),
      new webpack.DefinePlugin({
        MATERIAL_VERSION : JSON.stringify(`${date}#${commitHash}`),
      }),
    ],
    devServer: {
      contentBase: false,
    },
  };
};
