const chokidar = require('chokidar');
const debug = require('debug')('bixt:builder:builder');
const path = require('path');
const walk = require('./walk');
const compose = require('koa-compose');

class Builder {
  constructor ({ workDir = process.cwd(), compilers = [] }) {
    this.workDir = path.resolve(workDir);
    this.pageDir = path.join(this.workDir, 'pages');
    this.compilers = compilers;
  }

  async watch ({ mode } = {}) {
    debug('Watching', this.workDir, '...');

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

    await new Promise((resolve, reject) => {
      let waitTimeout;
      let invoked = false;
      const listener = (file) => {
        clearTimeout(waitTimeout);
        waitTimeout = setTimeout(async () => {
          try {
            await this.build({ mode });
            if (!invoked) {
              invoked = true;
              resolve();
            }
          } catch (err) {
            console.error('[WATCHER]', err);
            resolve();
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
    debug('Building ...');

    this.buildComplete = this.runBuild({ mode });
    await this.buildComplete;
    debug('Build complete');
  }

  async runBuild ({ mode }) {
    const run = compose(this.compilers.map(compiler => (ctx, next) => compiler.compile(ctx, next)));

    const ctx = {
      mode,
      workDir: this.workDir,
    };

    await run(ctx, async ctx => {
      await walk(this.pageDir, async file => {
        ctx.file = file;
        ctx.uri = this.pathToUri(file);

        let handled;
        for (const k in this.compilers) {
          try {
            handled = await this.compilers[k].handle(ctx);
            if (handled) {
              debug('Handle', ctx.uri, '->', file);
              return;
            }
          } catch (err) {
            console.error('[BUILD]', err);
          }
        }

        throw new Error(`Unhandled file ${file}`);
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
