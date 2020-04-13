const chokidar = require('chokidar');
const path = require('path');
const walk = require('./walk');
const compose = require('koa-compose');
const WebpackCompiler = require('../compilers/webpack');
const BonoCompiler = require('../compilers/bono');
const logInfo = require('../logger')('bixt:builder:builder');
const colors = require('colors');

class Builder {
  constructor ({
    workDir = process.cwd(),
    server,
    compilers = [
      new BonoCompiler({ server }),
      new WebpackCompiler({ server }),
    ],
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
  }) {
    this.workDir = path.resolve(workDir);
    this.pageDir = path.join(this.workDir, 'pages');
    this.compilers = compilers;
    this.handlers = handlers;
  }

  async watch ({ mode } = {}) {
    logInfo('Watching', this.workDir, '...');

    const compilerIgnores = [];
    for (const k in this.compilers) {
      const ignores = this.compilers[k].getIgnores(this);
      compilerIgnores.push(...ignores);
    }

    this.watcher = chokidar.watch(this.workDir, {
      ignored: [
        /(^|[/\\])\../, // dotfiles
        /node_modules/,
        ...compilerIgnores,
      ],
    });

    await new Promise(resolve => {
      let waitTimeout;
      let invoked = false;
      const listener = (file) => {
        clearTimeout(waitTimeout);
        waitTimeout = setTimeout(async () => {
          try {
            await this.build({ mode });
          } catch (err) {
            console.error('[WATCHER]', err);
          } finally {
            if (!invoked) {
              invoked = true;
              resolve();
            }
          }
        }, 300);
      };

      ['add', 'change', 'unlink'].forEach(eventName => {
        this.watcher.on(eventName, listener);
      });
    });
  }

  async build ({ mode = 'production' } = {}) {
    await this.buildComplete;
    logInfo('Building ...');

    this.buildComplete = this.runBuild({ mode });
    await this.buildComplete;
    logInfo('Build complete');
  }

  getConfig () {
    try {
      return require(path.join(this.workDir, 'bixt.config.js'));
    } catch (err) {
      return {};
    }
  }

  async runBuild ({ mode }) {
    const run = compose(this.compilers.map(compiler => (ctx, next) => compiler.compile(ctx, next)));

    const ctx = {
      mode,
      workDir: this.workDir,
      config: this.getConfig(),
    };

    await run(ctx, async ctx => {
      await walk(this.pageDir, async file => {
        const uri = this.pathToUri(file);
        const shortFile = file.split(ctx.workDir).pop().slice(1);

        ctx.chunk = { file, uri, shortFile };

        for (const handler of this.handlers) {
          try {
            if (await handler(ctx)) {
              logInfo('Handling [%s] %s -> %s [%s]', colors.green('done'), shortFile, uri, handler.name);
              return;
            }
          } catch (err) {
            console.error('[HANDLE]', err);
          }
        }

        logInfo('Handling [%s] %s -> %s', colors.red('fail'), shortFile, uri);
      });
    });
  }

  pathToUri (p) {
    let uri = p.split(this.pageDir).pop().split('.').slice(0, -1).join('.');
    if (uri.endsWith('/index')) {
      uri = uri.slice(0, -6);
    }
    return uri || '/';
  }
}

module.exports.Builder = Builder;
