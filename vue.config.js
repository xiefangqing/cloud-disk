const path = require('path')
// 生成绝对路径的方法
const resolve = dir => path.join(__dirname, dir)

module.exports = {
  lintOnSave: false,
  chainWebpack: config => {
    config.resolve.alias
      // 别名
      .set('@', resolve('src'))
  },
  // 在打包时不生成.map文件
  productionSourceMap: false,
  devServer: {
    // 跨域
    // proxy: ''
  }
}
