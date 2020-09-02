const nodeExternals = require("webpack-node-externals");

module.exports = [
  {
    // target: "web", // default
    entry: "./src/browser.js",
    output: {
      filename: "browser.js",
    },
    node: {
      fs: "empty",
    },
  },
  {
    target: "node",
    entry: "./src/node.js",
    output: {
      filename: "node.js",
    },
    externals: [nodeExternals()], // don't bundle NPM libraries
  },
];
