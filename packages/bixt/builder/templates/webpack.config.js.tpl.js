const path = require('path');
const FILE_LIMIT = 48;

module.exports = ({ config: { srcDir, wwwDir } }) => {
  const content = `
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = (_, { mode = 'development' }) => {
  return {
    mode,
    entry: {
      index: [
        '${path.join(srcDir, 'index.js')}',
        ...(
          mode === 'development'
            ? ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true']
            : []
        ),
      ],
    },
    output: {
      path: '${wwwDir}',
      publicPath: '/',
    },
    devtool: 'sourcemap',
    module: {
      rules: [
        {
          test: /\\.p?css$/i,
          use: [
            // 'style-loader',
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { importLoaders: 1 } },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  require('postcss-import')({}),
                  require('postcss-url')({}),
                  require('postcss-preset-env')({
                    features: {
                      'nesting-rules': true,
                    },
                  }),
                  // '@fullhuman/postcss-purgecss': {
                  //   content: ['./src/**/*.js'],
                  // },
                  // cssnano: {},
                ],
              },

            },
          ],
        },
        {
          test: /\\.(svg|png|ico|jpe?g|gif)(\\?.*)?$/i,
          use: {
            loader: 'url-loader',
            options: {
              limit: ${FILE_LIMIT},
            },
          },
        },
        {
          test: /\\.(woff2?|eot|ttf|otf)(\\?.*)?$/i,
          use: {
            loader: 'url-loader',
            options: {
              limit: ${FILE_LIMIT},
            },
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: '!!html-loader!${path.join(srcDir, 'index.html')}',
      }),
      // new FaviconsWebpackPlugin({
      //   logo: './src/assets/logo.png',
      // }),
      new MiniCssExtractPlugin(),
      ...(mode === 'development' ? [new webpack.HotModuleReplacementPlugin()] : []),
    ],
    optimization: {
      minimize: mode === 'production',
      minimizer: [
        new TerserPlugin(),
        new OptimizeCSSAssetsPlugin(),
      ],
    },
  };
};
  `.trim();

  return content;
};
