import * as fs from "fs";
import babel from "rollup-plugin-babel";
import inject from "rollup-plugin-inject";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
  entry: "./src/general/global_object.js",
  targets: [
    {
      dest: "./distr/sideshow.js",
      format: "umd",
      moduleName: "Sideshow"
    },
    {
      dest: "./distr/sideshow.es.js",
      format: "es"
    }
  ],
  banner: fs.readFileSync("./src/copyright_info.js"),
  external: Object.keys(require("./package.json").dependencies),
  globals: {
    marked: "marked"
  },
  plugins: [
    babel({
      babelrc: false,
      presets: [["env", { loose: true, modules: false }]],
      plugins: ["transform-class-properties", "external-helpers"]
    }),
    nodeResolve(),
    commonjs(),
    inject({
      global: require.resolve("./src/bridge/global"),
      $: require.resolve("./src/bridge/jquery"),
      $body: require.resolve("./src/bridge/body"),
      $document: require.resolve("./src/bridge/document"),
      $window: require.resolve("./src/bridge/window")
    })
  ]
};
