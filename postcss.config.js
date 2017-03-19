const imports = require('postcss-import')
const cssnext = require('postcss-cssnext')

module.exports = {
  plugins: [
    imports(),
    cssnext()
  ]
}
