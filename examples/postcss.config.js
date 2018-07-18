const path = require('path')
const imports = require('postcss-import')
const defaultResolve = require('postcss-import/lib/resolve-id')
const presetEnv = require('postcss-preset-env')

module.exports = {
  plugins: [
    presetEnv(),
    imports({
      resolve (id, basedir, opts) {
        if (id === '@goto-bus-stop/sideshow') {
          id = path.relative(basedir, path.join(__dirname, '../'))
        }

        return defaultResolve(id, basedir, opts)
      }
    })
  ]
}
