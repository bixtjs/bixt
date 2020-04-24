const send = require('koa-send');
const Route = require('bono/route');

module.exports = function ({ webpackAssets, wwwDir }) {
  const sendOptions = { root: wwwDir, index: 'index.html' };

  return async (ctx, next) => {
    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
      return next();
    }

    let done;
    try {
      done = await send(ctx, ctx.path, sendOptions);
    } catch (err) {
      if (err.status !== 404) {
        throw err;
      }
    }

    if (done) {
      return;
    }

    await next();

    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
      return;
    }

    if (ctx.body != null || ctx.status !== 404) {
      return;
    }

    const found = webpackAssets.find(asset => {
      if (!asset.route) {
        asset.route = new Route(asset.uri);
      }
      return asset.route.match(ctx);
    });

    ctx.path = '/';

    if (!found) {
      ctx.status = 404;
    }

    await send(ctx, '/', sendOptions);
  };
};
