const path = require('path')
const alias = require('rollup-plugin-alias')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

module.exports = {
  input: path.join(__dirname, './scripts/example.js'),
  output: {
    file: path.join(__dirname, './bundle.js'),
    format: 'iife'
  },
  plugins: [
    alias({
      '@goto-bus-stop/sideshow': require.resolve('../distr/sideshow.es.js')
    }),
    babel({
      include: `${path.join(__dirname, './scripts')}/**/*.js`
    }),
    nodeResolve(),
    commonjs()
  ]
}
