const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs-extra');
const walk = require('./walk');
const logInfo = require('../logger')('bixt:builder:builder');
const colors = require('colors');
const webpack = require('webpack');

const BUILD_DELAY = 300;
const WATCHER_EVENTS = ['add', 'change', 'unlink'];

class Builder {
  constructor (config, {
    handlers = [
      require('../handlers/detect')(),
      require('../handlers/custom-index')(),
      require('../handlers/custom-app')(),
      require('../handlers/custom-notfound')(),
      require('../handlers/bono')(),
      require('../handlers/webpack-page')(),
      require('../handlers/webpack-html')(),
      require('../handlers/webpack-md')(),
    ],
  } = {}) {
    this.config = config;
    this.handlers = [...handlers];
    this.assets = {};
  }

  async watch (callback) {
    const workDir = this.config.workDir;

    logInfo('Watching', workDir, '...');

    this.watcher = chokidar.watch(workDir, {
      ignored: [
        path.join(workDir, '.bixt'),
        path.join(workDir, 'www'),
        /(^|[/\\])\../, // dotfiles
        /node_modules/,
      ],
    });

    await new Promise(resolve => {
      let waitTimeout;
      let invoked = false;
      const listener = _ => {
        clearTimeout(waitTimeout);
        waitTimeout = setTimeout(async () => {
          try {
            await this.build('development', callback);
          } catch (err) {
            console.error('[WATCHER]', err);
          } finally {
            if (!invoked) {
              invoked = true;
              resolve();
            }
          }
        }, BUILD_DELAY);
      };

      WATCHER_EVENTS.forEach(eventName => this.watcher.on(eventName, listener));
    });
  }

  async build (mode = 'production', callback) {
    await this.buildComplete;
    logInfo('Building ...');

    this.buildComplete = (async () => {
      const { workDir, pageDir, srcDir } = this.config;

      await fs.ensureDir(srcDir);

      const ctx = {
        mode,
        config: this.config,
        staticPages: [],
        pages: [],
        bonoAssets: [],
        webpackAssets: [],
      };

      for (const id in require.cache) {
        if (id.startsWith(workDir)) {
          delete require.cache[id];
        }
      }

      await walk(pageDir, async absFile => {
        const uri = this.pathToUri(absFile);
        const file = absFile.split(workDir).pop().slice(1);

        ctx.chunk = { absFile, uri, file };

        for (const handler of this.handlers) {
          try {
            if (await handler(ctx)) {
              logInfo('Handling [%s] %s -> %s [%s]', colors.green('done'), file, uri, handler.name);
              return;
            }
          } catch (err) {
            console.error('[HANDLE]', err);
          }
        }

        logInfo('Handling [%s] %s -> %s', colors.red('fail'), file, uri);
      });

      await this.writeFile('index.js', await this.renderTemplate('index.js', ctx));
      const content = ctx.customIndexFile
        ? await readFile(ctx.customIndexFile)
        : await this.renderTemplate('index.html', ctx);
      await this.writeFile('index.html', content);
      await this.writeFile('webpack.config.js', await this.renderTemplate('webpack.config.js', ctx));
      await this.buildWebpack(mode, ctx);

      await this.writeFile('bono.config.js', await this.renderTemplate('bono.config.js', ctx));

      if (callback) {
        await callback(ctx);
      }
    })();

    await this.buildComplete;
    logInfo('Build complete');
  }

  pathToUri (p) {
    let uri = p.split(this.config.pageDir).pop().split('.').slice(0, -1).join('.');
    if (uri.endsWith('/index')) {
      uri = uri.slice(0, -6);
    }
    return uri || '/';
  }

  renderTemplate (assetId, ctx) {
    const template = this.getTemplate(assetId);
    return template(ctx);
  }

  getTemplate (assetId) {
    return require(`./templates/${assetId}.tpl.js`);
  }

  async writeFile (assetId, content) {
    if (this.assets[assetId] && this.assets[assetId] === content) {
      return;
    }

    this.assets[assetId] = content;
    await fs.writeFile(path.join(this.config.srcDir, assetId), content);
    logInfo('Asset written', assetId);
  }

  readWebpackConfig (ctx) {
    const configFile = path.join(this.config.srcDir, 'webpack.config.js');
    delete require.cache[configFile];
    const configFactory = require(configFile);
    return this.config.webpackConfig(configFactory({}, ctx), ctx);
  }

  async buildWebpack (mode, ctx) {
    if (this.compiler) {
      ctx.hotMiddleware = this.hotMiddleware;
      return;
    }

    const config = this.readWebpackConfig(ctx);
    this.compiler = webpack(config);
    if (mode === 'development') {
      logInfo('Webpack watching ...');

      const action = require('webpack-hot-middleware')(this.compiler);
      ctx.hotMiddleware = this.hotMiddleware = (ctx, next) => {
        const result = action(ctx.req, ctx.res, () => true);
        if (result) {
          return next();
        }

        ctx.status = 200;
        ctx.respond = false;
      };

      await new Promise(resolve => {
        this.compiler.watch({}, (err, stats) => {
          if (err) {
            console.error('[WEBPACK]', err);
            return resolve();
          }
          logInfo(stats.toString());
          stats.compilation.errors.forEach(err => console.error('[WEBPACK COMPILATION]', err));
          logInfo('Webpack build done');
          resolve();
        });
      });
    } else {
      logInfo('Webpack building ...');
      await new Promise((resolve, reject) => {
        this.compiler.run((err, stats) => {
          if (err) return reject(err);
          logInfo(stats.toString());
          stats.compilation.errors.forEach(err => console.error('[WEBPACK COMPILATION]', err));
          resolve();
        });
      });
      logInfo('Webpack build done');
    }
  }
}

module.exports.Builder = Builder;

async function readFile (file) {
  if (await fs.exists(file)) {
    return fs.readFile(file, 'utf8');
  }
}
