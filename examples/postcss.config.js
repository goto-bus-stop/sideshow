const path = require("path");
const imports = require("postcss-import");
const defaultResolve = require("postcss-import/lib/resolve-id");
const cssnext = require("postcss-cssnext");
const cssnano = require("cssnano");

module.exports = {
  plugins: [
    cssnext(),
    imports({
      resolve(id, basedir, opts) {
        if (id === "@goto-bus-stop/sideshow") {
          id = path.relative(basedir, path.join(__dirname, "../"));
        }

        return defaultResolve(id, basedir, opts);
      }
    }),
    cssnano({
      safe: true,
      autoprefixer: false
    })
  ]
};
