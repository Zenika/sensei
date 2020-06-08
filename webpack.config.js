const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "development",
  entry: "./src/slides.js",
  module: {
    rules: [
      {
        test: /slides\.json$/,
        type: "javascript/auto",
        use: "./src/loaders/slides-json-loader"
      },
      {
        test: /\.md$/,
        use: ["html-loader", "./src/loaders/revealjs-loader"]
      },
      {
        test: /\.css$/,
        use: [{ loader: MiniCssExtractPlugin.loader }, "css-loader"]
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|ttf)$/i,
        use: {
          loader: "file-loader",
          options: {
            name: "[name]-[contenthash].[ext]",
            outputPath: "static-assets"
          }
        }
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
                outputPath: "reveal-plugins"
              }
            }
          },
          {
            use: {
              loader: "file-loader",
              options: {
                name: "[name]-[contenthash].[ext]",
                outputPath: "reveal-plugins"
              }
            }
          }
        ]
      },
      {
        test: /reveal\.js[\/\\]js[\/\\]reveal\.js$/,
        use: { loader: "expose-loader", options: "Reveal" }
      }
    ]
  },
  output: {
    path: path.resolve("./dist")
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "src/index.html" }),
    new MiniCssExtractPlugin()
  ],
  devServer: {
    contentBase: false
  }
};
