// @ts-check
const { join } = require("path")

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: "./src/main",
  output: {
    path: join(__dirname, "dist"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        include: join(__dirname, "src"),
        use: { loader: "ts-loader", options: { transpileOnly: true } },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  mode: "production",
  target: "node",
}
