const send = require('koa-send');

module.exports = function ({ pages, wwwDir }) {
  return async (ctx, next) => {
    await next();

    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
      return;
    }

    if (ctx.body != null || ctx.status !== 404) {
      return;
    }

    const sendOptions = { root: wwwDir };

    const found = pages.find(page => page.route.match(ctx));
    if (found) {
      ctx.path = '/';
    }

    try {
      await send(ctx, ctx.path, sendOptions);
    } catch (err) {
      if (err.status !== 404) {
        throw err;
      }

      ctx.path = '/';
      await send(ctx, ctx.path, sendOptions);
      ctx.status = 404;
    }
  };
};
