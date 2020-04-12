const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
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

    await this.generateTemplate(ctx, `${srcDir}/index.js`);
    await this.generateTemplate(ctx, `${srcDir}/index.html`, ctx.webpackCustomIndex);

    const config = await this.getConfig(ctx);

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
    const fileExt = path.extname(ctx.file);
    if (ctx.uri === '/_index' && fileExt === '.html') {
      ctx.webpackCustomIndex = ctx.file;
      return true;
    }

    if (fileExt !== '.js' || !ctx.esnext) {
      return false;
    }

    if (ctx.uri === '/_app') {
      ctx.webpackCustomApp = ctx.file;
      return true;
    }

    if (ctx.uri === '/_notfound') {
      ctx.webpackCustomNotFound = ctx.file;
      return true;
    }

    const { file, uri } = ctx;
    const name = 'x' + file.split(ctx.workDir).pop().replace(/[./\\{}]/g, '-');
    const route = new Route(uri);
    ctx.webpackPages.push({ file, name, uri, route });
    return true;
  }

  async generateTemplate (ctx, assetId, override) {
    let assetContent;
    let isOverriden = false;
    if (await fs.exists(override)) {
      assetContent = await fs.readFile(override, 'utf8');
      isOverriden = true;
    } else {
      const tplId = path.basename(assetId);
      const tpl = require(`./templates/${tplId}.tpl.js`);
      assetContent = await tpl(ctx);
    }

    if (!this.assets[assetId] || this.assets[assetId] !== assetContent) {
      debug(`Asset ${isOverriden ? 'overriden' : 'generated'}:`, assetId);
      this.assets[assetId] = assetContent;
      await fs.writeFile(assetId, assetContent);
    }
  }

  getConfig (ctx) {
    const srcDir = path.join(ctx.workDir, '.bixt');
    const wwwDir = path.join(ctx.workDir, 'www');

    const baseConfig = {
      mode: ctx.mode,
      entry: {
        index: `${srcDir}/index.js`,
      },
      output: {
        path: `${wwwDir}`,
        publicPath: '/',
      },
      devtool: 'sourcemap',
      module: {
        rules: [
          {
            test: /\.p?css$/,
            use: [
              // {
              //   loader: require.resolve('file-loader'),
              //   options: {
              //     name: '[hash].css',
              //   },
              // },
              // require.resolve('extract-loader'),
              // MiniCssExtractPlugin.loader,
              require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: { importLoaders: 1 },
              },
              {
                loader: require.resolve('postcss-loader'),
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
            test: /\.(svg|png|ico|jpe?g|gif)(\?.*)?$/i,
            use: {
              loader: require.resolve('url-loader'),
              options: {
                limit: 48,
              },
            },
          },
          {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
            use: {
              loader: require.resolve('url-loader'),
              options: {
                limit: 48,
              },
            },
          },
        ],
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: `${srcDir}/index.html`,
        }),
        // new FaviconsWebpackPlugin({
        //   logo: './src/assets/logo.png',
        // }),
        // new MiniCssExtractPlugin(),
      ],
      optimization: {
        minimize: ctx.mode === 'production',
        minimizer: [
          new TerserPlugin({}),
          new OptimizeCSSAssetsPlugin({}),
        ],
      },
    };

    try {
      return require(path.join(ctx.workDir, 'webpack.config.js'))(baseConfig, ctx);
    } catch (err) {
      return baseConfig;
    }
  }
};
