// spack.config.js
// 2022/03/23 已弃用，使用 webpack
const { config } = require('@swc/core/spack')
const path = require('path')

module.exports = config({
  entry: {
    web: path.join(__dirname, '/src/index.ts')
  },
  output: {
    path: path.join(__dirname, '/dist'),
    name: 'index.js'
  },
  target: 'node'
})
