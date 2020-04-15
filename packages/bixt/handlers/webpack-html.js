const Route = require('bono/route');

module.exports = function () {
  return function webpackHtml ({ chunk, webpackCtx }) {
    if (chunk.ext !== '.html') {
      return;
    }

    const { file, uri } = chunk;
    const route = new Route(uri);

    webpackCtx.staticPages.push({ uri, file, route });

    return true;
  };
};
