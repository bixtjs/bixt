const webpack = require('webpack');
const path = require('path');
const logInfo = require('../../logger')('bixt:compilers:webpack:packer');

module.exports = class Packer {
  async run (ctx) {
    logInfo('Webpack building ...');

    const config = await this.getConfig(ctx);
    const compiler = webpack(config);

    await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) return reject(err);

        stats.compilation.errors.forEach(err => {
          console.error('[WEBPACK COMPILATION]', err);
        });

        resolve();
      });
    });

    logInfo('Webpack build done');
  }

  async watch (ctx) {
    if (this.running) {
      return;
    }

    this.running = true;

    logInfo('Webpack watching ...');

    const config = await this.getConfig(ctx);
    const compiler = webpack(config);

    await new Promise((resolve, reject) => {
      compiler.watch({}, (err, stats) => {
        if (err) {
          console.error('[WEBPACK]', err);
          return resolve();
        }

        stats.compilation.errors.forEach(err => {
          console.error('[WEBPACK COMPILATION]', err);
        });

        logInfo('Webpack build done');
        resolve();
      });
    });
  }

  /**
   * Get config
   * @param {import('./context')} ctx
   */
  async getConfig (ctx) {
    const assetId = 'webpack.config.js';
    await ctx.writer.write(ctx, assetId);

    const configFile = path.join(ctx.srcDir, assetId);
    delete require.cache[configFile];
    const configFactory = require(configFile);
    return ctx.webpackConfig(configFactory({}, ctx), ctx);
  }
};
