const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('fs-extra');
const path = require('path');

const debug = require('debug')('bixt:builder:compilers:webpack');

module.exports = class WebpackCompiler {
  constructor ({ server }) {
    this.server = server;
  }

  getIgnores ({ workDir }) {
    return [
      path.join(workDir, '.bixt'),
      path.join(workDir, 'www'),
    ];
  }

  async compile (ctx, next) {
    const srcDir = path.join(ctx.workDir, '.bixt');
    const wwwDir = path.join(ctx.workDir, 'www');

    await fs.ensureDir(srcDir);
    await fs.writeFile(`${srcDir}/index.js`, 'console.log(\'Hello world\')');

    this.server.use(require('koa-static')(wwwDir, { defer: true }));

    await next();

    const config = {
      mode: ctx.mode,
      entry: {
        index: `${srcDir}/index.js`,
      },
      output: {
        path: `${wwwDir}`,
      },
      devtool: 'sourcemap',
      module: {
        rules: [
          {
            test: /\.p?css$/,
            use: [
              MiniCssExtractPlugin.loader,
              { loader: 'css-loader', options: { importLoaders: 1 } },
              'postcss-loader',
            ],
          },
          {
            test: /\.(svg|png|ico|jpe?g|gif)(\?.*)?$/i,
            use: {
              loader: 'url-loader',
              options: {
                limit: 1,
              },
            },
          },
          {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
            use: {
              loader: 'url-loader',
              options: {
                limit: 1,
              },
            },
          },
        ],
      },
      plugins: [
        new HtmlWebpackPlugin({
          // template: './src/index.html',
        }),
        // new FaviconsWebpackPlugin({
        //   logo: './src/assets/logo.png',
        // }),
        new MiniCssExtractPlugin(),
      ],
    };
    const compiler = webpack(config);

    await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) return reject(err);
        resolve();
      });
    });

    debug('Webpack build');
  }
};
