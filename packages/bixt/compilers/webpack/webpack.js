const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('fs-extra');
const path = require('path');
const Route = require('bono/route');
const debug = require('debug')('bixt:builder:compilers:webpack');

module.exports = class WebpackCompiler {
  constructor ({ server }) {
    this.server = server;
    this.assets = {};
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

    const webpackPages = ctx.webpackPages = [];

    await next();

    const assetId = `${srcDir}/index.js`;
    const indexTpl = require('./templates/index-js');
    const assetContent = await indexTpl(ctx);
    if (!this.assets[assetId] || this.assets[assetId] !== assetContent) {
      debug('Asset changed:', assetId);
      this.assets[assetId] = assetContent;
      await fs.writeFile(assetId, assetContent);
    }

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

    await new Promise((resolve, reject) => {
      if (ctx.mode === 'development') {
        if (this.webpackCompiler) {
          resolve();
        } else {
          debug('Webpack watching (%o) ...', ctx.mode);
          const compiler = this.webpackCompiler = webpack(config);
          const watchOptions = {};
          compiler.watch(watchOptions, (err, stats) => {
            if (err) {
              console.error('[WEBPACK]', err);
              return resolve();
            }

            stats.compilation.errors.forEach(err => {
              console.error('[WEBPACK COMPILATION]', err);
            });

            debug('Webpack build done ...');

            resolve();
          });
        }
      } else {
        debug('Webpack building (%o) ...', ctx.mode);
        const compiler = webpack(config);
        compiler.run((err, stats) => {
          if (err) return reject(err);

          stats.compilation.errors.forEach(err => {
            console.error('[WEBPACK COMPILATION]', err);
          });

          resolve();
        });
        debug('Webpack build done');
      }
    });

    this.server.use(require('koa-static')(wwwDir, { defer: true }));
    this.server.use(async (ctx, next) => {
      await next();

      if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
        return;
      }

      if (ctx.body != null || ctx.status !== 404) return;

      // console.log(ctx.method, ctx.path, webpackPages);
      const found = webpackPages.find(page => page.route.match(ctx));
      if (found) {
        ctx.originalPath = ctx.path;
        ctx.path = '/';
      }
    });
  }

  handle (ctx) {
    if (path.extname(ctx.file) !== '.js' || !ctx.esnext) {
      return false;
    }

    const { file, uri } = ctx;
    const name = 'x' + file.split(ctx.workDir).pop().replace(/[./\\{}]/g, '-');
    const route = new Route(uri);
    ctx.webpackPages.push({ file, name, uri, route });
    return true;
  }
};
