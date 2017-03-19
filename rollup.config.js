const fs = require("fs");
const babel = require("rollup-plugin-babel");
const nodeResolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

module.exports = {
  entry: "./src/general/global_object.js",
  targets: [
    {
      dest: "./distr/sideshow.js",
      format: "umd",
      moduleName: "Sideshow",
      globals: {
        marked: "marked"
      }
    },
    {
      dest: "./distr/sideshow.cjs.js",
      format: "cjs"
    },
    {
      dest: "./distr/sideshow.es.js",
      format: "es"
    }
  ],
  banner: fs.readFileSync("./src/copyright_info.js"),
  external: Object.keys(require("./package.json").dependencies),
  plugins: [
    babel(),
    nodeResolve(),
    commonjs()
  ]
};