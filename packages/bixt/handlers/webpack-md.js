const Route = require('bono/route');

module.exports = function () {
  return function webpackHtml ({ chunk, webpackCtx }) {
    if (chunk.ext !== '.md') {
      return;
    }

    const { file, uri } = chunk;
    const route = new Route(uri);

    webpackCtx.staticPages.push({ uri, file, route });

    return true;
  };
};
