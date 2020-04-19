const Route = require('bono/route');

module.exports = function () {
  return function webpackHtml ({ chunk, webpackCtx }) {
    if (chunk.ext !== '.md') {
      return;
    }

    const { file, uri } = chunk;
    const route = new Route(uri);
    const loader = '!!url-loader!markdown-loader';
    webpackCtx.staticPages.push({ uri, file, loader, route });

    return true;
  };
};
