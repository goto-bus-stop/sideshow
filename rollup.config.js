const fs = require('fs')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')

module.exports = {
  input: './src/general/global_object.js',
  output: [
    {
      file: './distr/sideshow.js',
      format: 'umd',
      name: 'Sideshow',
      banner: fs.readFileSync('./src/copyright_info.js', 'utf8'),
      globals: {
        marked: 'marked'
      }
    },
    {
      file: './distr/sideshow.cjs.js',
      format: 'cjs'
    },
    {
      file: './distr/sideshow.es.js',
      format: 'es'
    }
  ],
  plugins: [
    babel({ include: '**/*.js' }),
    nodeResolve(),
    commonjs({ include: /node_modules/ }),
    json({ include: 'package.json' })
  ]
}
