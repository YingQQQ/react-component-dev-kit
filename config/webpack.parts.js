const CleanWebpackPlugin = require('clean-webpack-plugin');
const htmlTemplate = require('html-webpack-template');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');


const styleOptions = path => ([
  'style-loader',
  {
    loader: 'css-loader',
    options: {
      importLoaders: 1
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      config: {
        path
      }
    }
  },
  'sass-loader'
]);


/**
 * 页面配置，入口文件，chunks命名，favicon文件路径，生成index配置信息
 * @param {Object} param0
 * @param { String } entry
 * @param { String } title
 * @param { String } path
 * @param { String | Array String } chunks
 * @param { plugin | index.html } template
 * @param { String } favicon,
 * @param { others config } ...others E.g mata tags
 * @returns { Object } | webpack plugin and entry file
 */
exports.page = ({
  entry,
  title,
  path = '',
  template = htmlTemplate,
  favicon,
  ...others
} = {}) => ({
  entry,
  plugins: [
    new FaviconsWebpackPlugin({
      logo: favicon,
      title,
      icons: {
        appleIcon: true,
      }
    }),
    new HtmlWebpackPlugin({
      filename: `${path && `${path}/`}index.html`,
      template,
      title,
      inject: false,
      appMountId: 'app',
      ...others
    }),
  ]
});


/**
 * 用于PROD时删除之前的文件
 * @param {String} path
 * @returns { Array } webpack plugin
 */
exports.clean = path => ({
  plugins: [new CleanWebpackPlugin([path])]
});

/**
 * Environment Variables 环境变量设置
 * @param {String} key
 * @param {String} value
 */
exports.setFreeVariable = (key, value) => {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [new webpack.DefinePlugin(env)]
  };
};

/**
 * Loading JavaScript,Using Babel with Webpack Configuration/JS编译
 * @param {Object} babel-loader options
 */
exports.loadJavaScript = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include,
        exclude,
        loader: 'babel-loader',
        options
      }
    ]
  }
});

/**
 * 增强调试过程,在开发过程中使用eval-source-map加快构建速度同时提供正确的映射关系
 * 生产过程使用source-map,因为打包后的代码将所有生成的代码视为一大块代码。你看不到相互分离的模块只能使用source-map
 * 只在开发过程中加入devtool
 * @param {String} mode
 */
exports.generateSourceMaps = () => ({
  devtool: 'eval-source-map'
});
