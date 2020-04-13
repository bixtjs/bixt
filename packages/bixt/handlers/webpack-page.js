const Route = require('bono/route');

module.exports = function () {
  return function webpackPage ({ chunk, webpackCtx }) {
    if (chunk.ext !== '.js' && !chunk.jsExported) {
      return;
    }

    const { file, uri } = chunk;
    const name = `bixt-${webpackCtx.pages.length}-view`;
    const route = new Route(uri);
    const loader = `
{
  test: view => view === '${name}',
  load: async view => customElements.define(view, (await import('${file}')).default),
}
    `.trim();
    webpackCtx.pages.push({ name, uri, loader, route });
    return true;
  };
};
