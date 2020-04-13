const Router = require('bono/router');
const Bundler = require('bono/bundler');

module.exports = class BonoCompiler {
  constructor ({ server }) {
    this.server = server;
  }

  getIgnores () {
    return [];
  }

  async compile (ctx, next) {
    const bonoCtx = ctx.bonoCtx = {
      bundler: new Bundler(),
      router: new Router(),
      middlewares: [
        require('bono/middlewares/json')({ debug: ctx.mode === 'development' }),
      ],
    };

    if (!this.server) {
      return next();
    }

    for (const id in require.cache) {
      if (id.startsWith(ctx.workDir)) {
        delete require.cache[id];
      }
    }

    (ctx.config.serverMiddlewares || []).forEach(mw => {
      bonoCtx.middlewares.push(mw);
    });

    await next();

    this.server.middleware.splice(0, this.server.middleware.length - 1);
    bonoCtx.middlewares.forEach(mw => this.server.use(mw));

    this.server.bundler = bonoCtx.bundler;
    this.server.router = bonoCtx.router;
  }
};
