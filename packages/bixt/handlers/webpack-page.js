const Route = require('bono/route');

module.exports = function () {
  return function webpackPage (ctx) {
    const { chunk } = ctx;

    if (chunk.ext !== '.js' && !chunk.jsExported) {
      return;
    }

    const { file, uri } = chunk;
    const name = 'bixt-' + chunk.shortFile.replace(/[./\\{}]/g, '-') + '-view';
    const route = new Route(uri);
    ctx.webpackPages.push({ file, name, uri, route });
    return true;
  };
};
