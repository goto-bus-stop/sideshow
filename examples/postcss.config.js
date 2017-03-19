const resolve = require("resolve");
const imports = require("postcss-import");
const cssnext = require("postcss-cssnext");
const cssnano = require("cssnano");

module.exports = {
  plugins: [
    cssnext(),
    imports({
      resolve(id, basedir) {
        if (id === "@goto-bus-stop/sideshow") {
          function cssMain(pkg) {
            if (pkg.style) {
              pkg.main = pkg.style;
            }
            return pkg;
          }
          return resolve.sync("../", {
            basedir: __dirname,
            packageFilter: cssMain
          });
        }
        return resolve.sync(id, { basedir });
      }
    }),
    cssnano({
      safe: true,
      autoprefixer: false
    })
  ]
};
