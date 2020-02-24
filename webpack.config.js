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
      { test: /\.(js|ts)$/, use: "ts-loader", include: join(__dirname, "src") },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  mode: "none",
  target: "node",
}
