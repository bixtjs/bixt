const send = require('koa-send');

module.exports = function ({ pages, staticPages, wwwDir }) {
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

    let found = pages.find(page => page.route.match(ctx));
    if (!found) {
      found = staticPages.find(page => page.route.match(ctx));
    }

    ctx.path = '/';

    if (!found) {
      ctx.status = 404;
    }

    await send(ctx, '/', sendOptions);
  };
};
