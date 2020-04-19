const path = require('path');
const Context = require('./context');
const Writer = require('./writer');
const Packer = require('./packer');

module.exports = class WebpackCompiler {
  constructor () {
    this.writer = new Writer();
    this.packer = new Packer();
  }

  getIgnores ({ workDir }) {
    return [
      path.join(workDir, '.bixt'),
      path.join(workDir, 'www'),
    ];
  }

  async compile (ctx, next) {
    const webpackCtx = ctx.webpackCtx = new Context(ctx, this);

    await next();

    this.writer.write(webpackCtx, 'index.js');
    this.writer.write(webpackCtx, 'index.html', webpackCtx.customIndexFile);

    if (ctx.mode === 'development') {
      if (!this.packer.running) {
        await this.packer.watch(webpackCtx);
      }
    } else {
      await this.packer.run(webpackCtx);
    }

    if (this.packer.hotMiddleware) {
      ctx.bonoCtx.middlewares.push(this.packer.hotMiddleware);
    }
    ctx.bonoCtx.middlewares.push(require('./middlewares/push-state')(webpackCtx));
  }
};
