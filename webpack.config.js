const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const DEFAULT_TRAINING_MATERIAL_FOLDER = "training-material";

module.exports = (env = {}, argv) => {
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
  return {
    mode: "development",
    entry: { slides: "./src/slides/slides.js", labs: "./src/labs/labs.js" },
    module: {
      rules: [
        {
          test: [/slides\.json$/, /parts\.json$/],
          type: "javascript/auto",
          use: "./src/loaders/slides-json-loader",
        },
        {
          test: /\.md$/,
          use: ["html-loader", "./src/loaders/revealjs-loader"],
        },
        {
          test: /\.css$/,
          use: [{ loader: MiniCssExtractPlugin.loader }, "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp|ttf)$/i,
          use: {
            loader: "file-loader",
            options: {
              name: "[name]-[contenthash].[ext]",
              outputPath: "static-assets",
            },
          },
        },
        {
          test: /reveal\.js[\/\\]plugin[\/\\]/,
          oneOf: [
            {
              /*
               * The files of the notes plugin must be treated specially
               * as the file names need to stay the exact same for it to work.
               * See https://github.com/hakimel/reveal.js/blob/3.8.0/plugin/notes/notes.js#L24-L26
               * for details on the why.
               */
              test: /notes\.(html|js)$/,
              use: {
                loader: "file-loader",
                options: {
                  name: "[name].[ext]",
                  outputPath: "reveal-plugins",
                },
              },
            },
            {
              use: {
                loader: "file-loader",
                options: {
                  name: "[name]-[contenthash].[ext]",
                  outputPath: "reveal-plugins",
                },
              },
            },
          ],
        },
        {
          test: /reveal\.js[\/\\]js[\/\\]reveal\.js$/,
          use: { loader: "expose-loader", options: "Reveal" },
        },
      ],
    },
    resolve: {
      alias: {
        "training-material": trainingMaterialFolder,
      },
    },
    output: {
      path: path.resolve("./dist"),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "src/slides/slides.html",
        chunks: ["slides"],
        filename: "slides.html",
      }),
      new HtmlWebpackPlugin({
        template: "src/labs/labs.html",
        chunks: ["labs"],
        filename: "labs.html",
      }),
      new MiniCssExtractPlugin(),
    ],
    devServer: {
      contentBase: false,
    },
  };
};
