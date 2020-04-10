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

    const bundler = ctx.bundler = new Bundler();
    const router = ctx.router = new Router();

    await next();

    this.server.bundler = bundler;
    this.server.router = router;
  }

  handle ({ file, uri, bundler, router }) {
    if (path.extname(file) !== '.js') {
      return false;
    }

    let exported;
    try {
      exported = require(file);
    } catch (err) {
      return;
    }

    const exportedType = typeof exported;
    if (exportedType === 'object') {
      bundler.set(uri, exported);
      return true;
    }

    const firstLine = exported.toString().split('\n').shift();
    if (firstLine.match(/class/)) {
      const ExportedBundle = exported;
      bundler.set(uri, new ExportedBundle());
      return true;
    }

    if (firstLine.match(/=>|function/)) {
      router.route(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], uri, require(file));
      return true;
    }
  }
};
