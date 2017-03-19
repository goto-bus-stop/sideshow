const alias = require("rollup-plugin-alias");
const babel = require("rollup-plugin-babel");
const nodeResolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const uglify = require("rollup-plugin-uglify");

module.exports = {
  entry: "./scripts/example.js",
  dest: "./scripts/bundle.js",
  format: "iife",
  plugins: [
    alias({
      "@goto-bus-stop/sideshow": require.resolve("../distr/sideshow.es.js")
    }),
    babel({ include: "./scripts/**/*.js" }),
    nodeResolve(),
    commonjs(),
    uglify()
  ]
};
