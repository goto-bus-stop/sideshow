const imports = require('postcss-import')
const presetEnv = require('postcss-preset-env')

module.exports = {
  plugins: [
    imports(),
    presetEnv()
  ]
}
