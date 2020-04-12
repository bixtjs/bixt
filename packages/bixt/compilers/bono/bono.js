const Router = require('bono/router');
const Bundler = require('bono/bundler');
const path = require('path');

module.exports = class BonoCompiler {
  constructor ({ server }) {
    this.server = server;
  }

  getIgnores () {
    return [];
  }

  async compile (ctx, next) {
    for (const id in require.cache) {
      if (id.startsWith(ctx.workDir)) {
        delete require.cache[id];
      }
    }

    this.server.middleware.splice(0, this.server.middleware.length - 1);
    this.server.use(require('bono/middlewares/json')({ debug: ctx.mode === 'development' }));

    (ctx.config.serverMiddlewares || []).forEach(mw => {
      this.server.use(mw);
    });

    const bundler = ctx.bundler = new Bundler();
    const router = ctx.router = new Router();

    await next();

    this.server.bundler = bundler;
    this.server.router = router;
  }
};
