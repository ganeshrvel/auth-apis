const merge = require('webpack-merge');
const devConfig = require('./webpack.config.dev');
const prodConfig = require('./webpack.config.prod');

const IS_PROD = process.env.NODE_ENV === 'production';

const baseConfig = {
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  node: 8
                }
              }
            ]
          ],
          cacheDirectory: true
        }
      }
    ]
  }
};

module.exports = merge.smart(baseConfig, IS_PROD ? prodConfig : devConfig);
