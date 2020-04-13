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

    if (!this.packer.running) {
      await this.packer[ctx.mode === 'development' ? 'watch' : 'run'](webpackCtx);
    }

    ctx.bonoCtx.middlewares.push(require('koa-static')(webpackCtx.wwwDir, { defer: true }));
    ctx.bonoCtx.middlewares.push(require('./middlewares/push-state')(webpackCtx));
  }
};
